<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Icon from '../components/Icon.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { getDeploymentStatus } from '../domain.ts'
import { formatTime, now, records } from '../store.ts'

const environments = computed(() => [
  { id: 'test', name: '测试环境', code: 'test', tone: 'teal', description: '功能测试与回归验证', fallback: 'v1.7.8', replicas: '2 / 2' },
  { id: 'staging', name: '预发环境', code: 'staging', tone: 'violet', description: '联调、验收与上线前验证', fallback: 'v1.7.9', replicas: '3 / 3' },
  { id: 'production', name: '生产环境', code: 'production', tone: 'amber', description: '对外提供正式服务', fallback: 'v1.7.8', replicas: '6 / 6' },
].map(env => {
  const latest = [...records.value].filter(record => record.environment === env.id && getDeploymentStatus(record, now.value) === 'succeeded').sort((a, b) => b.startedAt - a.startedAt)[0]
  return { ...env, version: latest?.version ?? env.fallback, lastUpdate: latest ? formatTime(latest.startedAt) : '初始版本', pending: records.value.some(record => record.environment === env.id && ['queued', 'running'].includes(getDeploymentStatus(record, now.value))) }
}))
</script>

<template>
  <div class="page-heading"><div><p class="eyebrow">ENVIRONMENTS</p><h1 tabindex="-1">环境总览</h1><p class="page-description">查看订单服务在不同环境中的当前版本与运行情况。</p></div><RouterLink to="/deployments" class="button"><Icon name="clock" :size="16" />部署历史</RouterLink></div>
  <div class="environment-grid"><section v-for="env in environments" :key="env.id" class="panel environment-card"><div class="environment-card-top"><span class="environment-symbol" :class="env.tone"><Icon :name="env.id === 'production' ? 'shield' : 'server'" :size="24" /></span><StatusBadge :status="env.pending ? 'running' : 'ready'" :label="env.pending ? '部署中' : '运行正常'" /></div><h2>{{ env.name }}<small>{{ env.code }}</small></h2><p class="muted">{{ env.description }}</p><div class="environment-version"><span>当前版本</span><strong class="mono">{{ env.version }}</strong></div><dl class="environment-facts"><div><dt>健康实例</dt><dd><span class="live-dot"></span>{{ env.replicas }}</dd></div><div><dt>最近更新</dt><dd>{{ env.lastUpdate }}</dd></div></dl><RouterLink v-if="env.id !== 'production'" class="button environment-action" :to="{ path: '/deploy/new', query: { environment: env.id } }"><Icon name="rocket" :size="16" />部署新版本<Icon name="right" :size="16" /></RouterLink><p v-else class="production-note"><Icon name="shield" :size="15" />本演示未开放生产发布</p></section></div>
  <section class="environment-help"><span class="help-symbol"><Icon name="layers" :size="24" /></span><div><h2>同一制品，不同环境</h2><p>部署时核对版本与来源，成功后才更新环境版本。执行失败时，环境保留上次可用版本。</p></div><RouterLink to="/pipelines/2841" class="text-link">查看当前构建<Icon name="right" :size="16" /></RouterLink></section>
</template>
