# -*- coding: utf-8 -*-
"""解析福建师范大学教务处（正方 Sudy 系统）公开页面结构。

- 列表项：`<div class="column-news-item ..."><span class="column-news-title"><a href='...'>标题</a></span><span class="column-news-date ...">日期</span></div>`
- 首页样式：`<li class="clearfix"> <span class="notice-time">日期</span> <span class="notice-tit"><a ...>标题</a></span> </li>`
- 分页链接：`/tzgg_9107/list2.htm … listN.htm`
"""
import re
from urllib.parse import urljoin

from . import config
from .fetcher import fetch_text

# 列表页条目
_NOTICE_ITEM = re.compile(
    r'<span class="column-news-title"><a[^>]+href=\'([^\']+)\'[^>]*>(.*?)</a></span>'
    r'<span class="column-news-date[^"]*">([^<]*)</span>'
)
# 首页条目
_HOME_ITEM = re.compile(
    r'<li class="clearfix">\s*<span class="notice-time">([^<]*)</span>\s*'
    r'<span class="notice-tit"><a[^>]+href=\'([^\']+)\'[^>]*>(.*?)</a></span>\s*</li>'
)
# 列表页分页链接
_PAGER = re.compile(r'href="([^"]*list(\d+)\.htm)"')


def _clean(text):
    return re.sub(r'<[^>]+>', '', text or '').strip()


def parse_list(html, base_url):
    """解析正方列表页 → [{date, title, url}]。"""
    out = []
    for href, title, date in _NOTICE_ITEM.findall(html):
        out.append({'date': date.strip(), 'title': _clean(title), 'url': urljoin(base_url, href)})
    if not out:
        for date, href, title in _HOME_ITEM.findall(html):
            out.append({'date': date.strip(), 'title': _clean(title), 'url': urljoin(base_url, href)})
    return out


def parse_news(html, base_url):
    """解析首页工作动态 → [{title, url}]（复用首页列表结构）。"""
    return parse_list(html, base_url)


def _pager_urls(html, base_list_url):
    """收集列表页分页 URL（如 /tzgg_9107/list2.htm）。"""
    urls = []
    seen = set()
    for href, num in _PAGER.findall(html):
        n = int(num)
        if n > 1 and 'javascript' not in href and n not in seen:
            seen.add(n)
            urls.append(urljoin(base_list_url, href))
    return sorted(urls, key=lambda u: int(re.search(r'list(\d+)\.htm', u).group(1)), reverse=True)


def fetch_notice_pages(page_count=None):
    """抓取通知列表前 N 页（默认 config.NOTICE_PAGES），按 url 去重合并。
    分页失败不阻塞：返回已抓到的首页数据（尽力而为）。"""
    page_count = page_count or config.NOTICE_PAGES
    first_url = config.JWC + config.NOTICE_LIST
    first = fetch_text(first_url)
    items = parse_list(first, first_url)
    seen = {it['url'] for it in items}
    for u in _pager_urls(first, first_url)[: page_count - 1]:
        try:
            html = fetch_text(u)
        except Exception:  # noqa: BLE001 分页失败不影响首页数据
            continue
        for it in parse_list(html, u):
            if it['url'] not in seen:
                seen.add(it['url'])
                items.append(it)
    return items