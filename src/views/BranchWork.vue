<script setup>
/** 团支部工作台：独立单文件应用（public/standalone-branch.html），此处仅做跳转跳板 */
import { onMounted } from 'vue'

const emit = defineEmits(['back'])
const url = import.meta.env.BASE_URL + 'standalone-branch.html'

onMounted(() => {
  window.location.replace(url)
})
</script>

<template>
  <div class="branch-jump">
    <div class="jump-card">
      <div class="jump-ico">🚩</div>
      <div class="jump-title">正在打开团支部工作台…</div>
      <p class="jump-desc">三会两制一课留痕 · 志愿时长榜 · 立项证据链</p>
      <a class="jump-link" :href="url">没有自动跳转？点这里进入</a>
      <button class="jump-back" @click="emit('back')">← 返回首页</button>
    </div>
  </div>
</template>

<style scoped>
.branch-jump{min-height:70vh;display:flex;align-items:center;justify-content:center;padding:20px}
.jump-card{text-align:center;background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:16px;padding:34px 30px;max-width:340px;box-shadow:0 4px 18px rgba(0,0,0,.08)}
.jump-ico{font-size:44px}
.jump-title{font-size:16px;font-weight:800;margin-top:10px}
.jump-desc{font-size:12.5px;color:var(--text-sub,#6b7280);margin:8px 0 16px;line-height:1.6}
.jump-link{display:inline-block;font-size:13px;color:#c62828;font-weight:700;margin-bottom:14px}
.jump-back{display:block;width:100%;padding:10px;border:1px solid var(--border,#e5e7eb);border-radius:10px;background:transparent;color:var(--text,#333);font-size:13px;cursor:pointer}
</style>
