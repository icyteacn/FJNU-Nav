# -*- coding: utf-8 -*-
"""解析器单元测试：通知列表 / 首页动态 / 多页合并去重 / 教室与学期提取。

福star教务处为正方 Sudy 系统，列表结构为 column-news-item / notice-tit 样式。
"""
import sys
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from crawler import parsers
from crawler.build_snapshot import norm_room

HOME = '''
<ul class="notice-post-news">
  <li class="clearfix"> <span class="notice-time">2026-08-17</span> <span class="notice-tit"><a href='/da/cb/c9107a449227/page.htm' target='_blank' title='甲'>甲</a></span> </li>
  <li class="clearfix"> <span class="notice-time">2026-08-16</span> <span class="notice-tit"><a href='/d9/ce/c9107a448974/page.htm' target='_blank' title='乙'>乙</a></span> </li>
</ul>
<a href="/tzgg_9107/list66.htm" target="_self">尾页</a>
<a href="/tzgg_9107/list2.htm" target="_self">下一页</a>
'''
PAGE_2 = '''
<div id="wp_news_w9">
  <div class="column-news-item item-1 clearfix"><span class="column-news-title"><a href='/da/44/c9107a449092/page.htm' target='_blank' title='丙'>丙</a></span><span class="column-news-date news-date-hide">2026-07-23</span></div>
  <div class="column-news-item item-2 clearfix"><span class="column-news-title"><a href='/d9/06/c9107a448774/page.htm' target='_blank' title='丁'>丁</a></span><span class="column-news-date news-date-hide">2026-07-14</span></div>
</div>
'''


class TestParseList(unittest.TestCase):
    def test_home_list(self):
        items = parsers.parse_list(HOME, 'https://jwc.fjnu.edu.cn/tzgg_9107/list.htm')
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0]['date'], '2026-08-17')
        self.assertEqual(items[0]['title'], '甲')
        self.assertEqual(items[0]['url'], 'https://jwc.fjnu.edu.cn/da/cb/c9107a449227/page.htm')

    def test_column_list(self):
        items = parsers.parse_list(PAGE_2, 'https://jwc.fjnu.edu.cn/tzgg_9107/list2.htm')
        self.assertEqual(len(items), 2)
        self.assertEqual(items[1]['title'], '丁')
        self.assertEqual(items[1]['url'], 'https://jwc.fjnu.edu.cn/d9/06/c9107a448774/page.htm')


class TestParseNews(unittest.TestCase):
    def test_extract(self):
        items = parsers.parse_news(HOME, 'https://jwc.fjnu.edu.cn/tzgg_9107/list.htm')
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0]['title'], '甲')
        self.assertEqual(items[1]['title'], '乙')


class TestFetchNoticePages(unittest.TestCase):
    @mock.patch('crawler.parsers.fetch_text')
    def test_merge_dedup(self, fetch):
        def fake(url):
            return HOME if 'list.htm' in url and 'list2' not in url else PAGE_2
        fetch.side_effect = fake
        items = parsers.fetch_notice_pages(page_count=2)
        self.assertEqual(len(items), 4)  # 首页2 + 分页2
        urls = [it['url'] for it in items]
        self.assertEqual(len(set(urls)), len(urls), '结果应无重复 URL')

    @mock.patch('crawler.parsers.fetch_text')
    def test_respects_page_count(self, fetch):
        fetch.side_effect = lambda url: HOME if 'list.htm' in url and 'list2' not in url else PAGE_2
        items = parsers.fetch_notice_pages(page_count=1)
        self.assertEqual(len(items), 2, 'page_count=1 时应只抓首页')


class TestExtractors(unittest.TestCase):
    def test_norm_room(self):
        self.assertEqual(norm_room('知明楼101（智慧）'), '知明楼101')
        self.assertEqual(norm_room('(智慧)旗山校区教学楼'), '旗山校区教学楼')
        self.assertEqual(norm_room(''), '')


if __name__ == '__main__':
    unittest.main()