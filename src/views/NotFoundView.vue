<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Icon from '../components/Icon.vue'
</script>

<template><div class="empty-state panel not-found"><span class="empty-icon"><Icon name="search" :size="32" /></span><span class="eyebrow">404</span><h1 tabindex="-1">这个页面不存在</h1><p>检查地址，或返回流水线继续体验部署流程。</p><RouterLink class="button button-primary" to="/pipelines/2841">返回流水线<Icon name="right" :size="16" /></RouterLink></div></template>
