# -*- coding: utf-8 -*-
"""公共配置：站点地址、请求头、输出路径。"""
from pathlib import Path

# 项目根目录（crawler/ 的上一级）
ROOT = Path(__file__).resolve().parent.parent

# 数据源（福建师范大学教务处，正方 Sudy 系统）
JWC = 'https://jwc.fjnu.edu.cn'
NOTICE_LIST = '/tzgg_9107/list.htm'      # 教务处通知公告列表
NEWS_LIST = '/430/list.htm'              # 教务处工作动态列表
CALENDAR_LIST = '/jxrl/list.htm'         # 教学日历列表
COURSE_LIST = '/xzzx/list.htm'           # 下载中心（课程总表尝试）

# 抓取参数
NOTICE_PAGES = 4                   # 通知列表抓取前 N 页，约 56 条
TIMEOUT = 15                       # 单次请求超时（秒）
MAX_RETRY = 2                      # 失败重试次数
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36')

# 课程总表 xlsx 解析器（Python 版，仅标准库）
PARSE_PY = ROOT / 'server' / 'parse_kcb.py'

# 快照输出
OUT_FILE = ROOT / 'public' / 'data' / 'snapshot.json'