# -*- coding: utf-8 -*-
"""FJNU 校园导航 · 食堂空座率抓取（Python 版）

尽力抓取福建师范大学「食堂人流量分析」接口（福Star APP 公共服务，需校园网环境），
生成 `public/data/canteen_live.json`（与前端 canteens.js 的 name 匹配）。

校外/无校园网环境抓取失败时**不覆盖**上一次成功数据，并输出非零退出码供 CI 判断
（该步骤在 snapshot.yml 中 continue-on-error，不阻塞整体）。

用法：
    python crawler/canteen.py
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

OUT_FILE = ROOT / 'public' / 'data' / 'canteen_live.json'

# 福师大食堂人流量分析接口（校园网环境）。形如福Star 服务域名，字段按
# { name, people, seats, daily } 输出，与前端匹配。
CANDIDATE_URLS = [
    'https://canteen.fjnu.edu.cn/api/live',
    'https://fstar.fjnu.edu.cn/api/canteen/live',
]

try:
    import requests
except Exception:  # noqa: BLE001
    requests = None

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36')


def _get(url, timeout=10):
    if requests is not None:
        r = requests.get(url, headers={'User-Agent': UA}, timeout=timeout, verify=True)
        r.raise_for_status()
        return r.json()
    import urllib.request
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode('utf-8'))


def normalize(raw_items):
    """归一化接口返回 → [{name, people, seats, daily}]（容忍字段名差异）。"""
    out = []
    for it in raw_items or []:
        if not isinstance(it, dict):
            continue
        name = it.get('name') or it.get('canteen') or it.get('title') or ''
        people = it.get('people') or it.get('count') or it.get('current') or 0
        seats = it.get('seats') or it.get('capacity') or 0
        daily = it.get('daily') or it.get('consumes') or it.get('consumption') or 0
        if not name:
            continue
        out.append({'name': name, 'people': int(people or 0),
                    'seats': int(seats or 0), 'daily': int(daily or 0)})
    return out


def main():
    last_err = None
    for url in CANDIDATE_URLS:
        try:
            d = _get(url)
            items = normalize(d.get('items') if isinstance(d, dict) else d)
            if not items:
                raise ValueError('empty items')
            snap = {
                'status': 'live',
                'updatedAt': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
                'items': items,
            }
            OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
            OUT_FILE.write_text(json.dumps(snap, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
            print('canteen live written: %s (%d 家)' % (OUT_FILE, len(items)))
            return
        except Exception as exc:  # noqa: BLE001 单个候选失败继续
            last_err = exc
            continue
    # 全部失败：保留旧文件（若有），非零退出
    if OUT_FILE.exists():
        print('canteen live unavailable（校园网环境），保留上一次快照')
    else:
        print('canteen live unavailable（校园网环境），无旧快照')
    print('last error: %s' % (last_err or 'n/a'))
    sys.exit(1)


if __name__ == '__main__':
    main()