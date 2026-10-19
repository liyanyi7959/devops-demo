<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Icon from '../components/Icon.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { environmentNames, getDeploymentStatus } from '../domain.ts'
import { activeCount, formatTime, now, records } from '../store.ts'

const search = ref('')
const filter = ref('all')
const filtered = computed(() => records.value.filter(record => {
  const status = getDeploymentStatus(record, now.value)
  const matchedStatus = filter.value === 'all' || (filter.value === 'active' ? ['queued', 'running'].includes(status) : status === filter.value)
  const text = `${record.id} ${record.version} ${record.note} ${environmentNames[record.environment]}`.toLowerCase()
  return matchedStatus && text.includes(search.value.trim().toLowerCase())
}))
const succeeded = computed(() => records.value.filter(record => getDeploymentStatus(record, now.value) === 'succeeded').length)
const failed = computed(() => records.value.filter(record => getDeploymentStatus(record, now.value) === 'failed').length)
function clearFilters() { search.value = ''; filter.value = 'all' }
</script>

<template>
  <div class="page-heading"><div><p class="eyebrow">DELIVERY HISTORY</p><h1 tabindex="-1">部署记录</h1><p class="page-description">每一次版本变更，都有清楚的来源与结果。</p></div><RouterLink to="/deploy/new" class="button button-primary"><Icon name="rocket" :size="17" />发起部署</RouterLink></div>
  <div class="history-metrics"><div><span>全部部署</span><strong>{{ records.length }}<small>次</small></strong></div><div><span><i class="metric-dot blue"></i>执行中</span><strong>{{ activeCount }}<small>次</small></strong></div><div><span><i class="metric-dot green"></i>已完成</span><strong>{{ succeeded }}<small>次</small></strong></div><div><span><i class="metric-dot red"></i>失败</span><strong>{{ failed }}<small>次</small></strong></div></div>
  <section class="panel history-panel" aria-labelledby="records-title">
    <div class="records-toolbar"><h2 id="records-title">部署历史<span class="count-label">{{ filtered.length }} 条记录</span></h2><div class="record-filters"><div class="input-with-icon"><Icon name="search" :size="17" /><input v-model="search" type="search" aria-label="搜索部署编号、版本或说明" placeholder="搜索编号、版本或说明" /></div><select v-model="filter" aria-label="按部署状态筛选"><option value="all">全部状态</option><option value="active">执行中</option><option value="succeeded">部署完成</option><option value="failed">执行失败</option></select></div></div>
    <div v-if="filtered.length" class="table-scroll"><table class="records-table"><thead><tr><th scope="col">部署 / 版本</th><th scope="col">目标环境</th><th scope="col">状态</th><th scope="col">操作人</th><th scope="col">开始时间</th><th scope="col"><span class="sr-only">详情</span></th></tr></thead><tbody><tr v-for="record in filtered" :key="record.id"><td><RouterLink class="record-name" :to="`/deployments/${record.id}`">{{ record.id }}</RouterLink><span class="record-subtitle">订单服务<span class="mono">{{ record.version }}</span></span></td><td><span class="environment-label" :class="record.environment"><Icon name="layers" :size="14" />{{ environmentNames[record.environment] }}</span></td><td><StatusBadge :status="getDeploymentStatus(record, now)" /></td><td><span class="table-actor"><span class="tiny-avatar">{{ record.actor.slice(0, 1) }}</span>{{ record.actor }}</span></td><td class="muted mono small-text">{{ formatTime(record.startedAt) }}</td><td><RouterLink class="record-open" :to="`/deployments/${record.id}`" :aria-label="`查看部署 ${record.id}`"><Icon name="chevronRight" :size="18" /></RouterLink></td></tr></tbody></table></div>
    <div v-else class="empty-state"><span class="empty-icon"><Icon :name="records.length ? 'search' : 'rocket'" :size="30" /></span><h3>{{ records.length ? '没有符合条件的部署' : '准备好你的第一次部署' }}</h3><p>{{ records.length ? '试试其他关键词，或清除筛选查看全部记录。' : '从一次通过检查的流水线开始，核对版本后部署到目标环境。' }}</p><button v-if="records.length" class="button" type="button" @click="clearFilters">清除筛选</button><RouterLink v-else class="button button-primary" to="/pipelines/2841">查看流水线<Icon name="right" :size="16" /></RouterLink></div>
    <div v-if="filtered.length" class="table-footer"><span>共 {{ filtered.length }} 条记录</span><span><Icon name="shield" :size="14" />记录保存在当前浏览器</span></div>
  </section>
</template>
