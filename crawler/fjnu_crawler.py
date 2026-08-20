"""FJNU 公开数据抓取工具（优先 requests / 标准库回退）

抓取福建师范大学**公开页面**的公告与校历图片，供学习与研究参考。

用法：
    python fjnu_crawler.py --source jwc --out output/announcements.json   # 教务处首页公告
    python fjnu_crawler.py --source zs  --out output/zs_announcements.json # 招生网公告
    python fjnu_crawler.py --calendar                                     # 抓取校历大图并打印
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urljoin

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from crawler import config  # noqa: E402
from crawler.fetcher import fetch_text  # noqa: E402

OUT_DIR = Path(__file__).resolve().parent / 'output'

OFFICIAL = {
    'jwc': 'https://jwc.fjnu.edu.cn/',
    'zs': 'https://zsb.fjnu.edu.cn/',
    'calendar': 'https://jwc.fjnu.edu.cn/jxrl/list.htm',
}

_ANCHOR = re.compile(r'<a[^>]+href="([^"]+)"[^>]*>([^<]{4,60})</a>')
_IMG = re.compile(r'<img[^>]+src="([^"]+)"')


class PublicCrawler:
    """公开页面抓取：首页公告列表、校历大图。"""

    @staticmethod
    def _absolute(base: str, path: str) -> str:
        if path.startswith('http'):
            return path
        return urljoin(base, path)

    def fetch_announcements(self, source: str = 'jwc', limit: int = 20):
        """抓取指定站点首页公告标题与原文链接。"""
        base = OFFICIAL[source]
        html = fetch_text(base)
        items = []
        for href, title in _ANCHOR.findall(html):
            title = title.strip()
            if not title:
                continue
            items.append({'title': title, 'url': self._absolute(base, href)})
            if len(items) >= limit:
                break
        return items

    def fetch_calendar_images(self, page: str = 'calendar'):
        """从教学日历列表页提取正文区大图 URL。"""
        url = OFFICIAL[page]
        html = fetch_text(url)
        imgs = []
        for src in _IMG.findall(html):
            if any(x in src.lower() for x in ('.jpg', '.jpeg', '.png', '.gif')):
                imgs.append(self._absolute(url, src))
        return imgs


def main() -> None:
    parser = argparse.ArgumentParser(description='FJNU 公开数据抓取工具')
    parser.add_argument('--source', choices=('jwc', 'zs'), default='jwc', help='公告来源站点')
    parser.add_argument('--out', default=str(OUT_DIR / 'announcements.json'), help='输出 JSON 路径')
    parser.add_argument('--calendar', action='store_true', help='只抓取校历大图并打印')
    args = parser.parse_args()

    crawler = PublicCrawler()

    if args.calendar:
        print('[calendar] 校历页面：%s' % crawler.fetch_calendar_images('calendar'))
        return

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    items = crawler.fetch_announcements(args.source)
    out = Path(args.out)
    out.write_text(json.dumps({'source': OFFICIAL[args.source],
                               'count': len(items), 'items': items},
                              ensure_ascii=False, indent=2), encoding='utf-8')
    print('已抓取 %d 条公告 -> %s' % (len(items), out))


if __name__ == '__main__':
    main()