# -*- coding: utf-8 -*-
"""生成 FJNU 基线快照（基于已确认的福建师范大学教务处真实公开数据）。

福star教务系统（正方 jwglxt）需统一身份登录，暂无公开课程总表 xlsx 附件，
故课程数据降级为空（前端如实空态，不捏造）。通知 / 动态 / 校历为真实抓取。
"""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(__file__).resolve().parent.parent

JWC = 'https://jwc.fjnu.edu.cn'

notices = [
    {'date': '2026-07-28', 'title': '关于做好2027年拟新增本科专业申报工作的通知', 'url': 'https://jwc.fjnu.edu.cn/da/cb/c9107a449227/page.htm'},
    {'date': '2026-07-23', 'title': '关于做好2026年暑期实习实训安全工作的通知', 'url': 'https://jwc.fjnu.edu.cn/da/44/c9107a449092/page.htm'},
    {'date': '2026-07-19', 'title': '关于2026年本科教育教学研究项目结题验收工作的通知', 'url': 'https://jwc.fjnu.edu.cn/d9/ce/c9107a448974/page.htm'},
    {'date': '2026-07-19', 'title': '关于开展2026年校级本科教育教学研究项目申报工作的通知', 'url': 'https://jwc.fjnu.edu.cn/d9/cf/c9107a448975/page.htm'},
    {'date': '2026-07-16', 'title': '关于进一步加强和规范非学历教育培训管理工作的通知', 'url': 'https://jwc.fjnu.edu.cn/d9/5b/c9107a448859/page.htm'},
    {'date': '2026-07-14', 'title': '关于公布2026年校级教学成果奖获奖项目的通知', 'url': 'https://jwc.fjnu.edu.cn/d9/0f/c9107a448783/page.htm'},
    {'date': '2026-07-14', 'title': '关于公布 2025 年大学生创新创业训练计划（创新训练类）项目及 2024 年延期项目结题验收结果及经费下拨的通知', 'url': 'https://jwc.fjnu.edu.cn/d9/06/c9107a448774/page.htm'},
    {'date': '2026-07-14', 'title': '教务处2026年暑假值班安排表', 'url': 'https://jwc.fjnu.edu.cn/d9/05/c9107a448773/page.htm'},
    {'date': '2026-07-13', 'title': '关于公布2026年“AI+师范”教学创新设计与应用案例评选获奖名单的通知', 'url': 'https://jwc.fjnu.edu.cn/d8/fd/c9107a448765/page.htm'},
    {'date': '2026-07-09', 'title': '学校2026年暑期公共教室开放指南', 'url': 'https://jwc.fjnu.edu.cn/d7/a7/c9107a448423/page.htm'},
    {'date': '2026-07-02', 'title': '关于做好2026年秋季本科教材选用和征订工作的通知', 'url': 'https://jwc.fjnu.edu.cn/d5/71/c9107a447857/page.htm'},
    {'date': '2026-07-01', 'title': '福建师范大学2026年国省级大学生创新创业训练计划（创新训练类）项目立项公示', 'url': 'https://jwc.fjnu.edu.cn/d5/3c/c9107a447804/page.htm'},
    {'date': '2026-06-25', 'title': '关于公布2026年人工智能赋能教育教学改革项目立项名单的通知', 'url': 'https://jwc.fjnu.edu.cn/d3/2f/c9107a447279/page.htm'},
    {'date': '2026-06-24', 'title': '关于2025-2026学年第二学期《国家安全教育》课程再次开放学习及考试的通知', 'url': 'https://jwc.fjnu.edu.cn/d2/dc/c9107a447196/page.htm'},
]

news = [
    {'date': '2026-07-30', 'title': '全省唯一——我校获2026年度教育部大中小学课程教材研究项目立项', 'url': 'https://jwc.fjnu.edu.cn/da/e7/c430a449255/page.htm'},
    {'date': '2026-07-27', 'title': '体育科学学院发布AI赋能体育教学设计共创产品', 'url': 'https://jwc.fjnu.edu.cn/da/90/c430a449168/page.htm'},
    {'date': '2026-06-25', 'title': '外国语学院召开2026年人才培养方案修订暨双学位项目建设推进会', 'url': 'https://jwc.fjnu.edu.cn/d3/2a/c430a447274/page.htm'},
    {'date': '2026-06-18', 'title': '教务处举办人工智能赋能教学课程建设培训会暨“教学智变”AI融创教学工作坊', 'url': 'https://jwc.fjnu.edu.cn/d0/cc/c430a446668/page.htm'},
    {'date': '2026-06-11', 'title': '光电与信息工程学院开展专业教学研讨活动', 'url': 'https://jwc.fjnu.edu.cn/c9/73/c430a444787/page.htm'},
    {'date': '2026-06-08', 'title': '光电与信息工程学院开展本科教学“解剖一堂课” 暨课程思政观摩课活动', 'url': 'https://jwc.fjnu.edu.cn/c8/50/c430a444496/page.htm'},
    {'date': '2026-06-08', 'title': '教师教育学院小学教育系开展“解剖一堂课”教学观摩活动', 'url': 'https://jwc.fjnu.edu.cn/c8/41/c430a444481/page.htm'},
    {'date': '2026-05-28', 'title': '党建引领办实事，师生同心促发展——教务处与教师教育学院联合开展树立和践行正确政绩观学习教育主题党日活动暨师生座谈会', 'url': 'https://jwc.fjnu.edu.cn/c5/59/c430a443737/page.htm'},
]

calendar = [
    {'date': '2026-06-25', 'title': '2026～2027学年第一学期校历', 'url': 'https://jwc.fjnu.edu.cn/d3/25/c9109a447269/page.htm'},
    {'date': '2026-01-07', 'title': '2025～2026学年第二学期校历', 'url': 'https://jwc.fjnu.edu.cn/9f/55/c9109a434005/page.htm'},
    {'date': '2025-06-16', 'title': '2025～2026学年第一学期校历', 'url': 'https://jwc.fjnu.edu.cn/66/f9/c9109a419577/page.htm'},
    {'date': '2024-10-21', 'title': '2024～2025学年第二学期校历', 'url': 'https://jwc.fjnu.edu.cn/1b/3a/c9109a400186/page.htm'},
    {'date': '2024-07-09', 'title': '2024～2025学年第一学期校历', 'url': 'https://jwc.fjnu.edu.cn/07/d5/c9109a395221/page.htm'},
    {'date': '2023-12-08', 'title': '2023～2024学年第二学期校历', 'url': 'https://jwc.fjnu.edu.cn/c1/50/c9109a377168/page.htm'},
    {'date': '2023-06-05', 'title': '2023～2024学年第一学期校历', 'url': 'https://jwc.fjnu.edu.cn/80/06/c9109a360454/page.htm'},
    {'date': '2022-05-17', 'title': '2022～2023学年第一学期校历', 'url': 'https://jwc.fjnu.edu.cn/ef/80/c9109a323456/page.htm'},
    {'date': '2022-05-17', 'title': '2022～2023学年第二学期校历', 'url': 'https://jwc.fjnu.edu.cn/ef/7f/c9109a323455/page.htm'},
    {'date': '2021-06-16', 'title': '2021～2022学年第一学期校历', 'url': 'https://jwc.fjnu.edu.cn/70/e3/c9109a291043/page.htm'},
    {'date': '2021-06-16', 'title': '2021～2022学年第二学期校历', 'url': 'https://jwc.fjnu.edu.cn/70/e2/c9109a291042/page.htm'},
    {'date': '2020-10-17', 'title': '2020-2021学年第一学期校历', 'url': 'https://jwc.fjnu.edu.cn/d7/43/c9109a251715/page.htm'},
    {'date': '2020-10-17', 'title': '2020-2021学年第二学期校历', 'url': 'https://jwc.fjnu.edu.cn/d7/42/c9109a251714/page.htm'},
    {'date': '2019-07-05', 'title': '2019-2020学年第二学期校历', 'url': 'https://jwc.fjnu.edu.cn/30/57/c9109a208983/page.htm'},
]

snap = {
    'updatedAt': '2026-08-20T00:00:00Z',
    'source': JWC,
    'courses': {'items': notices},
    'notices': {'items': notices},
    'news': {'items': news},
    'calendar': {'items': calendar},
    'courseTables': [],
    'courseTable': {
        'semester': '', 'count': 0, 'rooms': 0,
        'updatedAt': '2026-08-20T00:00:00Z', 'cached': True, 'latestUrl': '',
    },
    'rows': [],
}

out = ROOT / 'public' / 'data' / 'snapshot.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(snap, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print('snapshot written: %s' % out)
print('notices %d / news %d / calendar %d / rows %d' % (len(notices), len(news), len(calendar), 0))
print('size: %.1f KB' % (out.stat().st_size / 1024))