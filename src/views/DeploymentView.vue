<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import Icon from '../components/Icon.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { environmentNames, getDeploymentStatus, getDeploymentStep } from '../domain.ts'
import { copyText, formatTime, now, records } from '../store.ts'

const route = useRoute()
const record = computed(() => records.value.find(item => item.id === route.params.id))
const status = computed(() => record.value ? getDeploymentStatus(record.value, now.value) : 'queued')
const step = computed(() => record.value ? getDeploymentStep(record.value, now.value) : 0)
const settled = computed(() => ['succeeded', 'failed'].includes(status.value))
const steps = [
  { title: '请求已受理', description: '核对制品与目标环境，创建部署任务' },
  { title: '拉取构建产物', description: '读取本次部署对应的镜像与摘要' },
  { title: '更新服务实例', description: '等待新版本就绪，检查健康状态' },
  { title: '验证部署结果', description: '确认服务可用并记录当前版本' },
]
function stepState(index: number) {
  if (status.value === 'succeeded') return 'complete'
  if (status.value === 'failed') return index < 2 ? 'complete' : index === 2 ? 'failed' : 'pending'
  return index < step.value ? 'complete' : index === step.value ? 'active' : 'pending'
}
const logs = computed(() => {
  if (!record.value) return ''
  const lines = [`[INFO] 已受理 ${record.value.id}`, `[INFO] 目标环境：${environmentNames[record.value.environment]}`]
  if (step.value >= 1) lines.push(`[INFO] 拉取镜像 ${record.value.version}`, `[INFO] 制品标识：${record.value.artifactId}`)
  if (step.value >= 2) lines.push('[INFO] 更新服务实例，等待健康检查…')
  if (status.value === 'failed') lines.push('[ERROR] 新实例健康检查未通过', '[INFO] 本次部署失败，目标环境保留上次可用版本。')
  else if (step.value >= 3) lines.push('[INFO] 健康检查通过，验证服务响应…')
  if (status.value === 'succeeded') lines.push(`[SUCCESS] 部署完成，当前版本 ${record.value.version}`)
  return lines.join('\n')
})
</script>

<template>
  <template v-if="record">
    <RouterLink to="/deployments" class="back-link"><Icon name="left" :size="16" />返回部署记录</RouterLink>
    <div class="page-heading"><div><p class="eyebrow">DEPLOYMENT</p><h1 tabindex="-1">部署详情 <span class="heading-id deployment-heading-id">{{ record.id }}</span></h1><p class="page-description">订单服务 · {{ record.version }} → {{ environmentNames[record.environment] }}</p></div><StatusBadge :status="status" /></div>
    <section class="deployment-result" :class="{ 'result-failed': status === 'failed', 'result-success': status === 'succeeded' }" aria-live="polite"><span class="result-symbol"><Icon :name="status === 'succeeded' ? 'success' : status === 'failed' ? 'failed' : 'loading'" :size="29" :class="{ spin: !settled }" /></span><div><h2>{{ status === 'succeeded' ? '部署完成，服务已更新' : status === 'failed' ? '健康检查未通过，部署失败' : status === 'queued' ? '部署请求已提交，等待执行' : '正在部署，请稍候' }}</h2><p>{{ status === 'succeeded' ? `${environmentNames[record.environment]}已更新到 ${record.version}，本次部署记录已保存。` : status === 'failed' ? '目标环境保留上次可用版本。请查看日志，修复后再重试。' : '请求受理不代表部署完成，页面会持续更新执行进度。' }}</p></div><RouterLink v-if="status === 'failed'" class="button" :to="{ path: '/deploy/new', query: { environment: record.environment, note: record.note } }"><Icon name="refresh" :size="16" />重新部署</RouterLink><RouterLink v-else-if="status === 'succeeded'" class="button" to="/environments">查看环境<Icon name="right" :size="16" /></RouterLink></section>
    <div class="content-columns deployment-columns"><div class="content-stack"><section class="panel progress-panel"><div class="section-heading"><h2>执行进度</h2><span class="muted small-text">{{ settled ? '执行已结束' : '自动更新中' }}</span></div><ol class="deployment-timeline"><li v-for="(item, index) in steps" :key="item.title" :class="`timeline-${stepState(index)}`"><span class="timeline-node"><Icon :name="stepState(index) === 'complete' ? 'check' : stepState(index) === 'failed' ? 'x' : stepState(index) === 'active' ? 'loading' : 'pending'" :size="17" :class="{ spin: stepState(index) === 'active' }" /></span><div><h3>{{ item.title }}</h3><p>{{ status === 'failed' && index === 2 ? '新实例健康检查失败，未替换上次可用版本' : item.description }}</p></div><span class="timeline-state">{{ stepState(index) === 'complete' ? '已完成' : stepState(index) === 'active' ? '进行中' : stepState(index) === 'failed' ? '失败' : '等待' }}</span></li></ol></section><section class="panel log-panel"><div class="section-heading"><h2><Icon name="terminal" :size="17" />执行日志</h2><button class="text-button" type="button" @click="copyText(logs)"><Icon name="copy" :size="14" />复制日志</button></div><pre class="terminal-output" :class="{ 'terminal-error': status === 'failed' }">{{ logs }}</pre></section></div><aside class="panel run-info"><div class="section-heading"><h2>部署信息</h2></div><dl class="detail-list"><div><dt>目标服务</dt><dd>订单服务<small class="mono">order-api</small></dd></div><div><dt>镜像版本</dt><dd><code>{{ record.version }}</code></dd></div><div><dt>制品标识</dt><dd class="mono">{{ record.artifactId }}</dd></div><div><dt>目标环境</dt><dd>{{ environmentNames[record.environment] }}</dd></div><div><dt>操作人</dt><dd>{{ record.actor }}<small>{{ formatTime(record.startedAt) }}</small></dd></div><div><dt>部署说明</dt><dd class="note-value">{{ record.note || '未填写部署说明' }}</dd></div></dl></aside></div>
  </template>
  <div v-else class="empty-state panel not-found"><span class="empty-icon"><Icon name="search" :size="30" /></span><h1 tabindex="-1">没有找到这条部署记录</h1><p>记录可能已被清空，或不属于当前浏览器中的演示数据。</p><RouterLink class="button button-primary" to="/deployments">返回部署记录</RouterLink></div>
</template>
