<script setup>
const emit = defineEmits(['back'])
</script>

<template>
  <div class="view-top">
    <button class="back-btn" @click="emit('back')">← 返回首页</button>
    <div class="view-title">研究生服务</div>
    <div class="view-sub">研究生信息管理系统 / 招生 / 学位论文等快捷入口</div>
  </div>

  <div class="panel" style="margin-bottom:16px;">
    <div style="font-weight:700;margin-bottom:10px;">🎓 研究生信息管理系统</div>
    <div class="muted" style="font-size:12px;margin-bottom:10px;line-height:1.7;">
      研究生培养全流程管理：选课 / 成绩查询 / 开题报告 / 中期考核 / 论文提交 / 学位申请。
    </div>
    <div class="cal-list">
      <a class="cal-item" href="https://gedu.fjnu.edu.cn/cas/login?service=https://gedu.fjnu.edu.cn" target="_blank" rel="noopener" style="background:var(--primary-soft);border-color:var(--primary);">
        <span class="cal-title">🔑 研究生信息管理系统（登录）</span>
        <span class="cal-go">前往登录 ↗</span>
      </a>
    </div>
  </div>

  <div class="panel" style="margin-bottom:16px;">
    <div style="font-weight:700;margin-bottom:10px;">📋 招生与录取</div>
    <div class="cal-list">
      <a class="cal-item" href="https://yjsy.fjnu.edu.cn/zs/list.htm" target="_blank" rel="noopener">
        <span class="cal-title">研究生招生信息</span>
        <span class="cal-go">研究生院 ↗</span>
      </a>
      <a class="cal-item" href="https://zsb.fjnu.edu.cn/lqcx/list.htm" target="_blank" rel="noopener">
        <span class="cal-title">录取查询（本科）</span>
        <span class="cal-go">招生官网 ↗</span>
      </a>
    </div>
  </div>

  <div class="panel" style="margin-bottom:16px;">
    <div style="font-weight:700;margin-bottom:10px;">📝 学位论文</div>
    <div class="cal-list">
      <a class="cal-item" href="https://yjsy.fjnu.edu.cn/xwgl/list.htm" target="_blank" rel="noopener">
        <span class="cal-title">论文开题 / 答辩 / 查重</span>
        <span class="cal-go">研究生院 ↗</span>
      </a>
      <a class="cal-item" href="https://yjsy.fjnu.edu.cn/pygl/list.htm" target="_blank" rel="noopener">
        <span class="cal-title">培养管理 / 课程管理</span>
        <span class="cal-go">研究生院 ↗</span>
      </a>
    </div>
  </div>

  <div class="panel" style="margin-bottom:16px;">
    <div style="font-weight:700;margin-bottom:10px;">🔗 常用平台</div>
    <div class="cal-list">
      <a class="cal-item" href="https://vpn3.fjnu.edu.cn/auth/login?returnUrl=https://zhifu-cnki-net-s.vpn3.fjnu.edu.cn/" target="_blank" rel="noopener">
        <span class="cal-title">福Star VPN（访问知网）</span>
        <span class="cal-go">VPN ↗</span>
      </a>
      <a class="cal-item" href="https://fjnu.zlgc2.chaoxing.com" target="_blank" rel="noopener">
        <span class="cal-title">教学云平台（超星）</span>
        <span class="cal-go">学习平台 ↗</span>
      </a>
      <a class="cal-item" href="https://library.fjnu.edu.cn/main.htm" target="_blank" rel="noopener">
        <span class="cal-title">图书馆（数据库检索）</span>
        <span class="cal-go">图书馆 ↗</span>
      </a>
    </div>
  </div>

  <div class="panel" style="background:var(--notice-bg);border-color:var(--notice-border);">
    <div style="font-weight:700;color:var(--notice-text);">💡 提示</div>
    <div class="muted" style="font-size:13px;margin-top:6px;line-height:1.8;">
      研究生信息管理系统需使用统一身份认证登录（学号 + 密码）。如有账号问题，请联系研究生院或信息化办公室。
    </div>
  </div>
</template>
