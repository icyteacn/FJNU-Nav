# -*- coding: utf-8 -*-
"""从 NextFStar 公开 API 抓取全校教室名单，生成 src/data/nfsClassrooms.js"""
import json
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

req = urllib.request.Request(
    'https://nfs.pcdawn.cn/api/app/classroomNavigation/public/bootstrap',
    data=b'{}', headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}, method='POST')
r = json.loads(urllib.request.urlopen(req, timeout=20).read().decode())
rooms = r['data']['classrooms']
print('total rooms:', len(rooms))

# 按前缀粗分类型
def kind_of(name):
    for kw, k in [('实验', '实验室'), ('馆', '体育场馆'), ('场', '体育场馆'),
                  ('楼', '教学楼'), ('演播', '演播厅')]:
        if kw in name:
            return k
    if name[:1].isdigit():
        return '实验室'
    return '普通教室'

groups = {}
for n in rooms:
    groups.setdefault(kind_of(n), []).append(n)

js = ['/** 全校教室名单（含实验室 / 体育场馆），来源 NextFStar 公开接口 app/classroomNavigation/public/bootstrap */',
      'export const nfsRooms = ' + json.dumps(rooms, ensure_ascii=False, indent=1),
      '', '/** 按类型分组 */',
      'export const nfsRoomGroups = ' + json.dumps(groups, ensure_ascii=False, indent=1), '']
out = 'src/data/nfsClassrooms.js'
open(out, 'w', encoding='utf-8', newline='\n').write('\n'.join(js))
print('written', out)
for k, v in groups.items():
    print(k, len(v))
