#!/usr/bin/env python3
"""
从 NextFStar 公开API获取福建师范大学课程表数据
API端点：https://nfs.pcdawn.cn/api/app/timetable/public/*
无需登录，公开可访问
"""
import json
import os
import sys
import time
import urllib.request

BASE_URL = 'https://nfs.pcdawn.cn/api'
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'data')
os.makedirs(DATA_DIR, exist_ok=True)

HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def post(path, data=None, timeout=30):
    url = BASE_URL + path
    body = json.dumps(data or {}).encode()
    req = urllib.request.Request(url, data=body, headers=HEADERS, method='POST')
    try:
        resp = urllib.request.urlopen(req, timeout=timeout)
        return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f'  [error] {path}: {e}')
        return None

def fetch_semesters():
    """获取学期列表"""
    r = post('/app/timetable/public/semester/list')
    if r and r.get('code') == 200:
        return r['data']
    return None

def fetch_classes(term_id):
    """获取班级列表"""
    r = post('/app/timetable/public/class/index', {'termId': term_id})
    if r and r.get('code') == 200:
        return r['data'].get('classes', [])
    return []

def fetch_class_detail(class_id, term_id):
    """获取班级课程详情"""
    r = post('/app/timetable/public/class/detail', {'classId': class_id, 'termId': term_id})
    if r and r.get('code') == 200:
        return r['data']
    return None

def normalize_course(course, class_name):
    """将NextFStar格式转换为我们需要的格式"""
    rows = []
    for meeting in course.get('meetings', []):
        weekday = meeting.get('weekday', 0)
        periods = meeting.get('periods', [])
        teachers = meeting.get('teachers', [])
        location = meeting.get('location', '')
        week_rules = meeting.get('weekRules', [])

        # 展开周次
        weeks = []
        for rule in week_rules:
            start = rule.get('start', 1)
            end = rule.get('end', 20)
            parity = rule.get('parity', 'all')
            for w in range(start, end + 1):
                if parity == 'all':
                    weeks.append(w)
                elif parity == 'odd' and w % 2 == 1:
                    weeks.append(w)
                elif parity == 'even' and w % 2 == 0:
                    weeks.append(w)

        if periods:
            rows.append({
                'c': course.get('title', ''),
                'cls': class_name,
                't': ', '.join(teachers),
                'r': location,
                'd': weekday,
                's': min(periods),
                'e': max(periods),
                'w': ','.join(map(str, sorted(weeks))) if weeks else '1-20',
                'credit': course.get('credit', 0),
                'cat': '',
                'campus': '旗山校区' if '旗山' in location or '长安' in location else ('仓山校区' if '仓山' in location else '')
            })
    return rows

def main():
    print('=== NextFStar 课程数据抓取 ===\n')

    # 1. 获取学期列表
    print('[1/4] 获取学期列表...')
    semester_data = fetch_semesters()
    if not semester_data:
        print('  获取学期列表失败')
        return False

    terms = semester_data.get('terms', [])
    print(f'  找到 {len(terms)} 个学期')

    # 找到当前学期
    current_term = None
    for t in terms:
        if t.get('role') == 'current':
            current_term = t
            break
    if not current_term and terms:
        current_term = terms[0]

    if not current_term:
        print('  未找到当前学期')
        return False

    term_id = current_term['id']
    print(f'  当前学期: {current_term.get("label", term_id)}')

    # 2. 获取班级列表
    print(f'\n[2/4] 获取班级列表 (学期: {term_id})...')
    classes = fetch_classes(term_id)
    print(f'  找到 {len(classes)} 个班级')

    if not classes:
        print('  班级列表为空')
        return False

    # 3. 抓取课程数据（抓取全部班级）
    print(f'\n[3/4] 抓取课程数据（全部 {len(classes)} 个班级）...')
    all_rows = []
    success = 0
    fail = 0

    for i, cls in enumerate(classes):
        class_id = cls.get('id')
        class_name = cls.get('name', f'班级{i+1}')

        detail = fetch_class_detail(class_id, term_id)
        if detail and detail.get('courses'):
            for course in detail['courses']:
                rows = normalize_course(course, class_name)
                all_rows.extend(rows)
            success += 1
        else:
            fail += 1

        # 进度显示
        if (i + 1) % 50 == 0:
            print(f'  进度: {i+1}/{len(classes)} (成功: {success}, 失败: {fail}, 课程数: {len(all_rows)})')
            time.sleep(0.3)

    print(f'\n  完成: 成功 {success} 个班级, 失败 {fail} 个, 共 {len(all_rows)} 条课程')

    # 4. 保存数据
    print(f'\n[4/4] 保存数据...')
    snapshot = {
        'courseTable': {
            'semester': current_term.get('label', term_id),
            'count': len(all_rows),
            'rooms': len(set(r.get('r', '') for r in all_rows if r.get('r'))),
            'teachers': len(set(r.get('t', '') for r in all_rows if r.get('t')))
        },
        'rows': all_rows,
        'courseTables': [{
            'semester': current_term.get('label', term_id),
            'count': len(all_rows),
            'url': f'https://nfs.pcdawn.cn/app/timetable'
        }],
        'updatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'source': 'NextFStar API (nfs.pcdawn.cn)'
    }

    out_path = os.path.join(DATA_DIR, 'snapshot.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(snapshot, f, ensure_ascii=False, separators=(',', ':'))
    print(f'  已保存到 {out_path}')
    print(f'  文件大小: {os.path.getsize(out_path) / 1024:.1f} KB')

    return True

if __name__ == '__main__':
    ok = main()
    sys.exit(0 if ok else 1)
