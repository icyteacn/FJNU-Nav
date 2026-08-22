# -*- coding: utf-8 -*-
"""计算机与网络空间安全学院官网动态抓取（ccs.fjnu.edu.cn，Sudy 系统）"""
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
ROOT = __file__.rsplit('crawler', 1)[0]
sys.path.insert(0, ROOT)

from crawler.fetcher import fetch_text
from crawler.util import utcnow

CSE = 'https://ccs.fjnu.edu.cn'
LIST_URL = '/tzgg/list.htm'
PAGES = 2  # 列表前 N 页


def parse_list(html):
    """解析 news-slick 结构：<a href=..page.htm class="clearfix"> <span>日</span><br>yyyy-mm .. list-right-tt 标题"""
    out = []
    seen = set()
    re_item = re.compile(
        r'<a\s+href="([^"]+)"[^>]*class="clearfix">[\s\S]{0,400}?'
        r'news-slick-date[^>]*>\s*<span>\s*(\d{1,2})\s*</span>\s*<br>\s*(\d{4}-\d{2})'
        r'[\s\S]{0,600}?list-right-tt[^>]*>([\s\S]*?)</div>',
        re.S)
    for m in re_item.finditer(html):
        path, day, ym, title = m.group(1), m.group(2), m.group(3), m.group(4)
        title = re.sub(r'<[^>]+>', '', title).strip()
        if not title:
            continue
        date = '%s-%02d' % (ym, int(day))
        url = CSE + path if path.startswith('/') else path
        if url in seen:
            continue
        seen.add(url)
        out.append({'title': title, 'url': url, 'date': date})
    return out


def fetch_cse_news():
    """返回学院通知列表（尽力而为，失败返回空列表）"""
    items = []
    seen = set()
    for page in range(1, PAGES + 1):
        list_url = LIST_URL if page == 1 else LIST_URL.replace('list.htm', 'list%d.htm' % page)
        try:
            html = fetch_text(CSE + list_url)
            for it in parse_list(html):
                if it['url'] not in seen:
                    seen.add(it['url'])
                    items.append(it)
        except Exception as exc:  # noqa: BLE001
            print('skip cse page %d: %s' % (page, exc))
    return items


def merge_into_snapshot(snapshot_path=None):
    """把学院动态合并进快照（保留其他字段）"""
    path = snapshot_path or (ROOT + 'public/data/snapshot.json')
    try:
        with open(path, 'r', encoding='utf-8') as f:
            snap = json.load(f)
    except Exception:
        print('[cse] snapshot missing, skip merge')
        return False
    items = fetch_cse_news()
    snap['cseNews'] = {'items': items}
    snap['updatedAt'] = utcnow()
    try:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(snap, f, ensure_ascii=False, separators=(',', ':'))
        print('[cse] merged %d items' % len(items))
        return True
    except Exception as exc:  # noqa: BLE001
        print('[cse] write failed:', exc)
        return False


if __name__ == '__main__':
    items = fetch_cse_news()
    print('cse news: %d items' % len(items))
    for it in items[:5]:
        print('-', it['date'], it['title'][:40])
    merge_into_snapshot()
