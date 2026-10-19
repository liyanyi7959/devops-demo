<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import Icon from './components/Icon.vue'
import Modal from './components/Modal.vue'
import ScenarioDialog from './components/ScenarioDialog.vue'
import { activeCount, notice, now, records, storageNotice } from './store.ts'

const route = useRoute()
const scenarioOpen = ref(false)
const searchOpen = ref(false)
const search = ref('')
const shortcutLabel = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K'
function focusMain() {
  document.getElementById('main-content')?.focus()
}
const nav = [
  { to: '/pipelines/2841', title: '流水线', icon: 'workflow', area: '流水线' },
  { to: '/deployments', title: '部署记录', icon: 'rocket', area: '部署记录' },
  { to: '/environments', title: '环境', icon: 'server', area: '环境' },
]
const searchResults = computed(() => {
  const items = [
    { title: '流水线 #2841', subtitle: '订单服务 · v1.8.0', to: '/pipelines/2841', icon: 'workflow' },
    { title: '部署记录', subtitle: '查看执行进度与结果', to: '/deployments', icon: 'rocket' },
    { title: '环境总览', subtitle: '测试、预发与生产', to: '/environments', icon: 'server' },
    { title: '设计说明', subtitle: '本项目采用的 UI 方法', to: '/design', icon: 'book' },
    ...records.value.map(record => ({ title: record.id, subtitle: `${record.version} · ${record.note}`, to: `/deployments/${record.id}`, icon: 'package' })),
  ]
  const query = search.value.trim().toLowerCase()
  return items.filter(item => `${item.title} ${item.subtitle}`.toLowerCase().includes(query)).slice(0, 8)
})
function shortcut(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchOpen.value = !searchOpen.value
  }
}
let ticker: ReturnType<typeof setInterval>
onMounted(() => {
  ticker = setInterval(() => { now.value = Date.now() }, 300)
  window.addEventListener('keydown', shortcut)
})
onUnmounted(() => {
  clearInterval(ticker)
  window.removeEventListener('keydown', shortcut)
})
watch(() => route.fullPath, async () => {
  searchOpen.value = false
  await nextTick()
  document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true })
})
</script>

<template>
  <a class="skip-link" href="#main-content" @click.prevent="focusMain">跳到主要内容</a>
  <aside class="sidebar" aria-label="项目导航">
    <RouterLink class="brand" to="/pipelines/2841"><span class="brand-mark"><Icon name="workflow" :size="24" /></span><span>DevOps<span class="brand-edition">WORKSPACE</span></span></RouterLink>
    <div class="workspace-card"><span class="workspace-avatar">研</span><div><strong>研发工作空间</strong><small>Engineering Team</small></div></div>
    <p class="nav-label">项目</p>
    <div class="project-name"><span class="project-dot"></span>订单服务<span class="tiny-tag">PRO</span></div>
    <nav class="main-nav">
      <RouterLink v-for="item in nav" :key="item.to" :to="item.to" :class="{ selected: route.meta.area === item.area }" :aria-current="route.meta.area === item.area ? 'page' : undefined">
        <Icon :name="item.icon" :size="19" /><span>{{ item.title }}</span><span v-if="item.area === '部署记录' && activeCount" class="nav-count">{{ activeCount }}</span>
      </RouterLink>
    </nav>
    <div class="sidebar-bottom">
      <RouterLink class="design-link" to="/design" :class="{ selected: route.meta.area === '设计说明' }"><Icon name="book" />设计说明<Icon name="upRight" :size="15" /></RouterLink>
      <div class="demo-note"><span class="live-dot"></span>交互演示<span>本地模拟数据</span></div>
      <div class="profile"><span class="avatar">林</span><div><strong>林青</strong><small>项目开发者</small></div><span class="profile-mark">LQ</span></div>
    </div>
  </aside>

  <div class="app-body">
    <header class="topbar">
      <nav class="breadcrumbs" aria-label="面包屑"><span class="breadcrumb-home"><Icon name="boxes" :size="17" />工作空间</span><Icon name="chevronRight" :size="14" /><span>订单服务</span><Icon name="chevronRight" :size="14" /><span class="breadcrumb-current">{{ route.meta.area }}</span></nav>
      <div class="topbar-actions">
        <button class="search-trigger" type="button" aria-label="搜索项目内容" @click="searchOpen = true"><Icon name="search" :size="16" /><span>搜索项目内容</span><kbd>{{ shortcutLabel }}</kbd></button>
        <button class="button button-small scenario-trigger" type="button" @click="scenarioOpen = true"><Icon name="settings" :size="16" /><span>演示场景</span></button>
        <span class="top-avatar" aria-label="当前用户：林青">林</span>
      </div>
    </header>
    <nav class="mobile-nav" aria-label="移动端项目导航"><RouterLink v-for="item in nav" :key="item.to" :to="item.to" :class="{ selected: route.meta.area === item.area }"><Icon :name="item.icon" :size="16" />{{ item.title }}</RouterLink><RouterLink to="/design" :class="{ selected: route.meta.area === '设计说明' }"><Icon name="book" :size="16" />设计</RouterLink></nav>
    <div v-if="storageNotice" class="storage-notice" role="status">{{ storageNotice }}</div>
    <main id="main-content" class="main-content" tabindex="-1"><RouterView /></main>
    <footer class="app-footer"><span>DevOps · 研发交付平台</span><span>演示模式，操作不会影响真实环境</span></footer>
  </div>

  <Transition name="toast"><div v-if="notice" class="toast-message" role="status"><Icon name="success" :size="18" />{{ notice }}</div></Transition>
  <ScenarioDialog v-if="scenarioOpen" @close="scenarioOpen = false" />
  <Modal v-if="searchOpen" title="搜索项目内容" @close="searchOpen = false">
    <div class="search-field"><Icon name="search" /><input v-model="search" autofocus type="search" aria-label="搜索页面、部署编号或版本" placeholder="搜索页面、部署编号或版本…" /></div>
    <div class="search-results"><RouterLink v-for="item in searchResults" :key="item.to" :to="item.to"><Icon :name="item.icon" /><span><strong>{{ item.title }}</strong><small>{{ item.subtitle }}</small></span><Icon name="right" :size="16" /></RouterLink><p v-if="!searchResults.length" class="empty-search">没有找到匹配内容，试试版本号或部署编号。</p></div>
  </Modal>
</template>
