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
    <div class="section-title" style="margin:0 0 10px;"><span class="bar"></span>版本历史</div>
    <ul class="changelog">
      <li><b>v1.2.7</b> 教室大全楼栋指引卡 · 分步导航与地图定位</li>
      <li><b>v1.2.6</b> 校历图片预览 · 搜索功能索引 · 教室大全</li>
      <li><b>v1.2.5</b> 综测积累模块 · 课程加权测算 · 科研/综测快速选档联动</li>
      <li><b>v1.2.4</b> 奖学金页按最新评审细则重写 · 新增科研分测算器</li>
      <li><b>v1.2.3</b> 修正奖学金金额 · 更新官网链接 · 研究生指南完善</li>
      <li><b>v1.2.2</b> 研究生服务 · 学术日历</li>
      <li><b>v1.2.1</b> 文字头像美化 · 加载动画 · 预加载</li>
      <li><b>v1.2.0</b> 课程表接入 NextFStar · 食堂重设计</li>
      <li><b>v1.1.0</b> 公告系统 · 路由懒加载</li>
      <li><b>v1.0.0</b> 首版发布</li>
    </ul>
    <p class="muted" style="font-size:12px;margin-top:10px;">
      每个版本的完整改动清单见 <a href="https://github.com/Xuuyuan/FJNU-Wiki" target="_blank" rel="noopener">FJNU 社区文档</a> 与仓库 README 版本历史。
    </p>
    <p class="muted" style="font-size:12px;margin-top:6px;">
      想加入贡献者墙？给
      <a href="https://github.com/Xuuyuan/FJNU-Wiki" target="_blank" rel="noopener">FJNU 社区</a>
      提 Pull Request，被合入后你的名字就会出现在这里。
    </p>
    <div style="margin-top:16px;padding:12px;background:var(--soft-fg);border-radius:var(--radius);border:1px solid var(--border);">
      <div style="font-weight:700;font-size:13px;margin-bottom:6px;">💡 灵感参考与致谢</div>
      <div class="muted" style="font-size:12px;line-height:1.8;">
        本项目的课程表、教室导航、今天吃什么等功能设计参考了
        <a href="https://nfs.pcdawn.cn/" target="_blank" rel="noopener">NextFStar（nfs.pcdawn.cn）</a>
        的交互设计，在此致谢。原项目采用 Vue 3 + Element Plus 实现，功能完整且体验优秀，
        本项目在此基础上适配了福建师范大学的数据源。
      </div>
    </div>
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