#!/usr/bin/env python3
"""下载校领导照片到 public/leader/ 目录"""
import os
import urllib.request
import ssl

LEADER_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'leader')
os.makedirs(LEADER_DIR, exist_ok=True)

# 忽略SSL证书验证
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

PHOTOS = {
    '凌启淡': 'https://so1.360tres.com/dr/270_500_/t11938a0349e97498034e3b115c.png?size=800x533',
    '潘玉腾': 'https://img1.baidu.com/it/u=14ce36d3d539b600845daf60e150352ac75cb752,285759770&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667',
    '郑家建': 'https://img0.baidu.com/it/u=3577986498,1576957714&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667',
    '王长平': 'https://so1.360tres.com/dr/270_500_/t11938a0349e97498034e3b115c.png?size=400x267',
    '李建平': 'https://so1.360tres.com/dr/270_500_/t11938a0349e97498034e3b115c.png?size=400x267',
    '黄汉升': 'https://so1.360tres.com/dr/270_500_/t11938a0349e97498034e3b115c.png?size=400x267',
    '曾民勇': 'https://so1.360tres.com/dr/270_500_/t11938a0349e97498034e3b115c.png?size=400x267',
    '朱鹤健': 'https://so1.360tres.com/dr/270_500_/t11938a0349e97498034e3b115c.png?size=400x267',
    '陈征': 'https://so1.360tres.com/dr/270_500_/t11938a0349e97498034e3b115c.png?size=400x267',
    '苏玉泰': 'https://so1.360tres.com/dr/270_500_/t11938a0349e97498034e3b115c.png?size=400x267',
}

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

for name, url in PHOTOS.items():
    path = os.path.join(LEADER_DIR, f'{name}.png')
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        print(f'[skip] {name} already exists')
        continue
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': UA,
            'Referer': 'https://www.so.com/',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
        })
        data = urllib.request.urlopen(req, timeout=15, context=ctx).read()
        if len(data) < 1000:
            print(f'[fail] {name}: too small ({len(data)} bytes)')
            continue
        with open(path, 'wb') as f:
            f.write(data)
        print(f'[ok] {name}: {len(data)} bytes')
    except Exception as e:
        print(f'[fail] {name}: {e}')

print(f'\nTotal photos: {len([f for f in os.listdir(LEADER_DIR) if os.path.getsize(os.path.join(LEADER_DIR, f)) > 1000])}')
