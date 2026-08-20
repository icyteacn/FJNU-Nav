# -*- coding: utf-8 -*-
"""通用抓取：文本/二进制，带超时与重试。

福师大服务器对部分 TLS 握手较敏感（Python 标准库 urllib 偶发 SSL EOF），
优先使用 requests 库（若环境已安装），否则回退 urllib.request。
"""
import time
import urllib.error
import urllib.request

from . import config

try:
    import requests  # type: ignore
    _HAS_REQUESTS = True
except Exception:  # noqa: BLE001 无 requests 环境回退标准库
    _HAS_REQUESTS = False


def _get(url, timeout):
    if _HAS_REQUESTS:
        r = requests.get(
            url, headers={'User-Agent': config.UA}, timeout=timeout,
            verify=True)
        r.raise_for_status()
        return r.status_code, r.content
    req = urllib.request.Request(url, headers={'User-Agent': config.UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.status, resp.read()


def fetch_text(url):
    """抓取网页文本，失败自动重试。"""
    last = None
    for attempt in range(config.MAX_RETRY + 1):
        try:
            _code, data = _get(url, config.TIMEOUT)
            return data.decode('utf-8', errors='replace')
        except Exception as exc:  # noqa: BLE001 网络层异常统一重试
            last = exc
            if attempt < config.MAX_RETRY:
                time.sleep(0.8 * (attempt + 1))
    raise last


def fetch_bytes(url, referer=None):
    """抓取二进制（如课程总表 xlsx 附件）。"""
    last = None
    for attempt in range(config.MAX_RETRY + 1):
        try:
            if _HAS_REQUESTS:
                headers = {'User-Agent': config.UA}
                if referer:
                    headers['Referer'] = referer
                r = requests.get(url, headers=headers, timeout=30, verify=True)
                r.raise_for_status()
                return r.content
            headers = {'User-Agent': config.UA}
            if referer:
                headers['Referer'] = referer
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp:
                return resp.read()
        except Exception as exc:  # noqa: BLE001
            last = exc
            if attempt < config.MAX_RETRY:
                time.sleep(0.8 * (attempt + 1))
    raise last