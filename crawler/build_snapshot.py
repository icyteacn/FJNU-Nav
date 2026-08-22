# -*- coding: utf-8 -*-
"""FJNU 校园导航 · 快照构建器（Python 版）

从福建师范大学教务处公开网站抓取教务通知、工作动态、教学日历，
尝试在下载中心抓取课程总表（xlsx 解析）；福star教务系统（正方 jwglxt）需登录，
若无可公开课程总表附件则课程数据降级为空结构（前端如实空态），不阻塞整体。

用法：
    python crawler/build_snapshot.py            # 生成快照到 public/data/
    python crawler/build_snapshot.py --verbose  # 打印每个学期课程条数
"""
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import urljoin

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from crawler import config, parsers  # noqa: E402
from crawler.fetcher import fetch_bytes, fetch_text  # noqa: E402
from crawler.util import utcnow  # noqa: E402

VERBOSE = '--verbose' in sys.argv

_DL = re.compile(r'href="([^"]*(?:\.(?:xlsx|xls)|download)[^"]*)"', re.I)
_DL2 = re.compile(r'href="([^"]+\.(?:xlsx|xls))"', re.I)


def norm_room(room):
    """统一教室名：去掉「智慧」标识。"""
    if not room:
        return ''
    return room.replace('（智慧）', '').replace('(智慧)', '').strip()


def parse_kcb_xlsx(data: bytes):
    """调用 server/parse_kcb.py 解析课程总表 xlsx（仅标准库）。"""
    with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as tmp:
        tmp.write(data)
        tmp_path = tmp.name
    try:
        proc = subprocess.run(
            [sys.executable, str(config.PARSE_PY), tmp_path],
            capture_output=True, text=True, encoding='utf-8', timeout=120,
        )
        if proc.returncode != 0:
            raise RuntimeError('parse_kcb.py 解析失败: ' + (proc.stderr or '')[:200])
        return json.loads(proc.stdout)
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass


def fetch_course_tables():
    """尽力在教务处下载中心抓取课程总表（福star教务系统需登录，可能没有公开附件）。"""
    results = []
    for list_url in ['/xzzx/list.htm', '/xzzx/jxglk/list.htm', '/xzzx/jwglk/list.htm', '/xzzx/jczx/list.htm']:
        try:
            list_html = fetch_text(config.JWC + list_url)
        except Exception:  # noqa: BLE001
            continue
        m = re.search(r'课程总表|教学任务|排课表', list_html)
        if not m:
            continue
        dl = _DL2.search(list_html) or _DL.search(list_html)
        if not dl:
            continue
        dl_url = urljoin(config.JWC + list_url, dl.group(1))
        try:
            data = fetch_bytes(dl_url, referer=config.JWC + list_url)
            parsed = parse_kcb_xlsx(data)
            results.append({
                'semester': '当前学期', 'title': '福建师范大学课程总表',
                'count': parsed['count'], 'url': dl_url, 'rows': parsed['rows'],
            })
            if VERBOSE:
                print('  %s: %d 条' % (results[-1]['title'], parsed['count']))
        except Exception as exc:  # noqa: BLE001
            print('skip 课程总表: %s' % exc)
    return results


def load_previous_courses():
    """读取上一份快照中的课程数据（NextFStar 等来源），避免本次抓取失败时被清空。

    同时做 schema 归一：rows 缺 term 时以当前学期补齐；courseTables 缺 title 时补默认值，
    保证继承后的数据与教务处总表链路产出同构（validate / split_snapshot 可直接消费）。
    """
    try:
        if config.OUT_FILE.exists():
            prev = json.loads(config.OUT_FILE.read_text(encoding='utf-8'))
            rows = prev.get('rows') or []
            tables = prev.get('courseTables') or []
            ct = prev.get('courseTable') or {}
            if rows and tables and ct:
                semester = ct.get('semester', '') or tables[0].get('semester', '')
                for r in rows:
                    if not r.get('term'):
                        r['term'] = semester
                for t in tables:
                    if not t.get('title'):
                        t['title'] = '福建师范大学课程总表'
                    if not t.get('semester'):
                        t['semester'] = semester
                return rows, tables, ct
    except Exception as exc:  # noqa: BLE001
        print('skip 上一份快照课程数据: %s' % exc)
    return [], [], {}


def build():
    notices = parsers.fetch_notice_pages()
    news = parsers.parse_list(fetch_text(config.JWC + config.NEWS_LIST), config.JWC + config.NEWS_LIST)
    calendar = parsers.parse_list(fetch_text(config.JWC + config.CALENDAR_LIST), config.JWC + config.CALENDAR_LIST)
    course_tables = fetch_course_tables()

    merged_rows = []
    all_rooms = 0
    latest = None
    inherited = False
    if course_tables:
        latest = course_tables[0]
        for t in course_tables:
            for row in t['rows']:
                merged_rows.append({
                    'c': row.get('c', ''), 't': row.get('t', ''), 'cls': row.get('cls', ''),
                    'd': row.get('d'), 's': row.get('s'), 'e': row.get('e'),
                    'w': row.get('w', ''), 'r': row.get('r', ''), 'term': t['semester'],
                    'col': row.get('col', ''), 'campus': row.get('campus', ''),
                    'kind': row.get('kind', ''), 'cat': row.get('cat', ''),
                    'credit': row.get('credit', ''), 'weeks': row.get('weeks', ''),
                })
        all_rooms = len({norm_room(r['r']) for r in merged_rows if r['r']})
    else:
        # 教务处公开课程总表缺失：继承上一份快照的课程数据（如 NextFStar 抓取结果），
        # 保证静态回退与课程表页面不因本次抓取失败而丢数据。
        prev_rows, prev_tables, prev_ct = load_previous_courses()
        if prev_rows:
            merged_rows = prev_rows
            course_tables = prev_tables
            latest = prev_ct
            inherited = True
            all_rooms = len({norm_room(r['r']) for r in merged_rows if r['r']})
            print('course data inherited from previous snapshot: %d rows' % len(merged_rows))

    snap = {
        'updatedAt': utcnow(),
        'source': config.JWC,
        'courses': {'items': notices},
        'notices': {'items': notices},
        'news': {'items': news},
        'calendar': {'items': calendar},
        'courseTables': [{'semester': t['semester'], 'title': t['title'],
                          'count': t['count'], 'url': t['url']} for t in course_tables],
        'courseTable': {
            'semester': latest['semester'] if latest else '',
            'count': latest['count'] if latest else 0,
            'rooms': all_rooms,
            'updatedAt': utcnow(),
            'cached': True,
            'inherited': inherited,
            'latestUrl': latest.get('url', '') if latest else '',
        },
        'rows': merged_rows,
    }

    config.OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    config.OUT_FILE.write_text(
        json.dumps(snap, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    size_kb = config.OUT_FILE.stat().st_size / 1024
    print('snapshot written: %s' % config.OUT_FILE)
    print('courseTable: %s / %d 条 / %d 教室（%d 个学期并集）'
          % (snap['courseTable']['semester'], snap['courseTable']['count'],
             snap['courseTable']['rooms'], len(snap['courseTables'])))
    print('courses %d / notices %d / news %d / calendar %d'
          % (len(notices), len(notices), len(news), len(calendar)))
    print('size: %.1f KB' % size_kb)


if __name__ == '__main__':
    build()