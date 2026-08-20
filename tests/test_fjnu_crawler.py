# -*- coding: utf-8 -*-
"""fjnu_crawler 公开抓取测试（公告列表 / 校历图片，mock 抓取函数）"""
import sys
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from crawler.fjnu_crawler import PublicCrawler

JWC_HTML = '''
<html><body>
<a href="/tzgg_9107/list.htm">教务通知</a>
<a href="http://news.fjnu.edu.cn/n2026.html">学校要闻</a>
<a href="/info/1005/6500.htm" title="详细">教学动态链接</a>
<p>无关段落</p>
</body></html>
'''

CAL_HTML = '''
<html><body>
<img src="/images/calendar/2026-1.jpg"><img src="/images/calendar/logo.png">
<img src="http://example.com/banner.webp"><a href="/jxrl/list.htm">link</a>
</body></html>
'''


class TestPublicCrawler(unittest.TestCase):
    @mock.patch('crawler.fjnu_crawler.fetch_text', return_value=JWC_HTML)
    def test_announcements(self, fetch):
        c = PublicCrawler()
        items = c.fetch_announcements('jwc', limit=5)
        self.assertGreaterEqual(len(items), 3)
        self.assertTrue(items[0]['url'].startswith('https://jwc.fjnu.edu.cn'))
        self.assertTrue(items[1]['url'].startswith('http://news.fjnu.edu.cn'))

    @mock.patch('crawler.fjnu_crawler.fetch_text', return_value=CAL_HTML)
    def test_calendar_images(self, fetch):
        c = PublicCrawler()
        imgs = c.fetch_calendar_images('calendar')
        self.assertGreaterEqual(len(imgs), 1)


if __name__ == '__main__':
    unittest.main()