<script setup>
/** 欢迎初始页：品牌展示 + 进入入口（文案走 i18n，品牌 chip 保留 SITE.brand） */
import { SITE } from '../config/site.js'
import { campusStats } from '../data/apps.js'
import { useI18n } from '../i18n/index.js'

const { t } = useI18n()
const emit = defineEmits(['enter'])
</script>

<template>
  <div class="welcome">
    <div class="welcome-bg"></div>
    <div class="welcome-inner">
      <div class="welcome-logo"><span>{{ SITE.brand }}</span></div>
      <h1 class="welcome-title">{{ t('site.name') }}</h1>
      <p class="welcome-sub">{{ t('site.tagline') }}</p>
      <div class="welcome-motto">{{ t('site.motto') }}</div>

      <div class="welcome-badges">
        <span class="welcome-badge">{{ campusStats.campuses }} {{ t('site.heroBadges.campuses') }}</span>
        <span class="welcome-badge">{{ campusStats.colleges }} {{ t('site.heroBadges.colleges') }}</span>
        <span class="welcome-badge">{{ campusStats.majors }} {{ t('site.heroBadges.majors') }}</span>
      </div>

      <button class="welcome-btn" @click="emit('enter')">{{ t('welcome.enter') }} →</button>

      <p class="welcome-tip">{{ t('site.welcomeTip') }}</p>
    </div>
  </div>
</template>