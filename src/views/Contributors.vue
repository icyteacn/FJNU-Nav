<script setup>
/** 贡献者墙：词云式展示项目贡献者，点击跳转 GitHub 主页
 *  社区代码贡献（含已合入的 Pull Request）都会在此致谢。 */
import { reactive } from 'vue'
import { contributors } from '../data/contributors'

const emit = defineEmits(['back'])

/** GitHub 头像直链（公开头像无需 API key），避免 github.com 302 链路波动 */
function avatarOf(c) {
  return `https://avatars.githubusercontent.com/${c.login}?size=96`
}

const broken = reactive(new Set())
function markBroken(c) {
  broken.add(c.login)
}

function fontOf(w) {
  return 18 + Math.round(w * 14)
}

function hueOf(i) {
  return 200 + i * 60
}
</script>

<template>
  <div class="view-top">
    <button class="back-btn" @click="emit('back')">← 返回首页</button>
    <div class="view-title">贡献者墙</div>
    <div class="view-sub">感谢每一位让 FJNU 校园导航变得更好的人</div>
  </div>

  <div class="panel" style="margin-bottom:16px;">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <span style="font-size:30px;">🏆</span>
      <div style="flex:1;min-width:200px;">
        <div style="font-weight:700;font-size:14px;">本项目由开源社区共同维护</div>
        <div class="muted" style="font-size:12px;margin-top:2px;">
          除了数据抓取机器人，站点代码的每一次改进都来自真实的人类贡献者 —— 点击名字可跳转 GitHub 主页。
        </div>
      </div>
    </div>
  </div>

  <div class="cloud panel">
    <a
      v-for="(c, i) in contributors"
      :key="c.name"
      class="cloud-item"
      :href="c.url"
      target="_blank"
      rel="noopener"
      :style="{ fontSize: fontOf(c.weight) + 'px', '--hue': hueOf(i) }"
    >
      <img
        v-if="c.login && !broken.has(c.login)"
        class="cloud-avatar"
        :src="avatarOf(c)"
        alt=""
        referrerpolicy="no-referrer"
        @error="markBroken(c)"
      />
      <span v-else class="cloud-emoji">{{ c.emoji }}</span>
      <span class="cloud-name">{{ c.name }}</span>
      <span class="cloud-role">{{ c.role }}</span>
    </a>
  </div>

  <div class="panel" style="margin-top:16px;">
    <div class="section-title" style="margin:0 0 10px;"><span class="bar"></span>社区贡献记录</div>
    <ul class="changelog">
      <li><b>v1.0.0</b> — 首版发布：以福师大公开数据打造校园服务聚合入口，17 个应用全面移植（官网 / 动态 / 课程表 / 教室导航 / 校历 / 食堂空座率 / 新生学号 / 数据洞察 / 体测 / 吃什么 / 生活费 / 知多少 / 轮盘 / 速配 / 校领导测试 / 贴吧舆情 / 贡献者墙）。</li>
      <li><b>v1.0.0</b> — 食堂空座率接入福Star「食堂人流量分析」实时数据（校园网环境）与静态快照双模式，附档口菜价一览。</li>
      <li><b>v1.0.0</b> — 福师大知多少题库重置（约 100 题校史 / 校园知识）· 校领导测试 10 位原型（历任校长 / 书记）。</li>
      <li><b>v1.0.0</b> — 数据链路：爬虫改造为福建师范大学教务处 / 贴吧 / 食堂数据源，Python 与 Node 双实现。</li>
    </ul>
    <p class="muted" style="font-size:12px;margin-top:10px;">
      每个版本的完整改动清单见 <a href="https://github.com/Xuuyuan/FJNU-Wiki" target="_blank" rel="noopener">FJNU 社区文档</a> 与仓库 README 版本历史。
    </p>
    <p class="muted" style="font-size:12px;margin-top:6px;">
      想加入贡献者墙？给
      <a href="https://github.com/Xuuyuan/FJNU-Wiki" target="_blank" rel="noopener">FJNU 社区</a>
      提 Pull Request，被合入后你的名字就会出现在这里。
    </p>
  </div>
</template>

<style scoped>
.cloud {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 14px;
  padding: 28px 16px;
  min-height: 220px;
}
.cloud-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  max-width: 250px;
  padding: 14px 16px 12px;
  border-radius: 16px;
  color: #fff;
  text-decoration: none;
  background: linear-gradient(135deg, hsl(var(--hue) 65% 45%), hsl(calc(var(--hue) + 30) 65% 60%));
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.14);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  text-align: center;
}
.cloud-item:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.2);
}
.cloud-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.75);
  object-fit: cover;
  flex: none;
}
.cloud-emoji { font-size: 26px; }
.cloud-name {
  font-weight: 800;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
.cloud-role {
  font-size: 11px;
  opacity: 0.95;
  line-height: 1.5;
  white-space: normal;
  max-width: 220px;
  word-break: break-word;
}
.changelog {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text);
}
.changelog a {
  color: var(--primary, #c62828);
}
</style>