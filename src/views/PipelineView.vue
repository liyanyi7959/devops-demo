<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Icon from '../components/Icon.vue'
import Modal from '../components/Modal.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { artifact } from '../domain.ts'
import { blockedReason, copyText, notify, scenario } from '../store.ts'

const selectedLog = ref<number | null>(null)
const stages = computed(() => [
  { name: '代码检查', description: 'ESLint · 类型检查', duration: '18 秒', status: 'passed', icon: 'code' },
  { name: '单元测试', description: 'Vitest · 128 个用例', duration: scenario.pipeline === 'running' ? '运行中' : '42 秒', status: scenario.pipeline, icon: 'shield' },
  { name: '镜像构建', description: 'Docker · 推送制品仓库', duration: scenario.pipeline === 'passed' ? '56 秒' : '—', status: scenario.pipeline === 'passed' ? 'passed' : 'pending', icon: 'package' },
])
const summary = computed(() => {
  if (scenario.pipeline === 'failed') return { title: '单元测试未通过', description: '请先查看失败用例。镜像构建尚未执行，当前不能部署。', icon: 'failed', tone: 'red' }
  if (scenario.pipeline === 'running') return { title: '正在执行单元测试', description: '代码检查已通过，等待全部阶段完成后再继续部署。', icon: 'loading', tone: 'blue' }
  if (!scenario.canDeploy) return { title: '全部检查已通过', description: '构建产物已就绪，当前账号没有部署权限。', icon: 'success', tone: 'green' }
  return { title: '检查通过，可以部署预发', description: '三个阶段均已完成，构建产物 v1.8.0 已就绪。', icon: 'success', tone: 'green' }
})
const logText = computed(() => {
  const index = selectedLog.value ?? 0
  const name = stages.value[index]?.name ?? '阶段'
  if (selectedLog.value === 1 && scenario.pipeline === 'failed') return `[10:42:18] 开始执行 ${name}\n[10:42:19] RUN  src/order-query.spec.ts\n[10:43:00] FAIL  返回分页总数应与筛选条件一致\n[10:43:00] Expected: 12  ·  Received: 0\n[10:43:00] Tests: 127 passed, 1 failed\n[10:43:00] 阶段退出，镜像构建未执行。`
  if (stages.value[selectedLog.value ?? 0]?.status === 'pending') return '该阶段尚未执行，暂时没有日志。'
  if (stages.value[selectedLog.value ?? 0]?.status === 'running') return `[10:42:18] 开始执行 ${name}\n[10:42:19] 正在处理任务，请稍候…`
  const times = [
    ['10:42:00', '10:42:01', '10:42:03', '10:42:18'],
    ['10:42:18', '10:42:19', '10:42:21', '10:43:00'],
    ['10:43:00', '10:43:01', '10:43:03', '10:43:56'],
  ][index]!
  return `[${times[0]}] 开始执行 ${name}\n[${times[1]}] 加载任务配置与依赖…\n[${times[2]}] 校验提交 a13f9c2\n[${times[3]}] ${name}完成，退出码 0\n[${times[3]}] 已保存本阶段结果。`
})
function rerun() {
  if (scenario.pipeline === 'running') return
  scenario.pipeline = 'running'
  notify('已重新运行流水线')
  setTimeout(() => {
    if (scenario.pipeline === 'running') {
      scenario.pipeline = 'passed'
      notify('流水线检查通过，构建产物已就绪')
    }
  }, 4000)
}
</script>

<template>
  <div class="page-heading">
    <div><p class="eyebrow">持续集成 / PIPELINE</p><h1 tabindex="-1">流水线详情 <span class="heading-id">#2841</span></h1><p class="page-description">{{ scenario.longContent ? '订单服务 · 跨区域订单查询响应优化与分页一致性回归验证' : '订单服务 · 订单查询响应优化' }}</p></div>
    <button class="button" type="button" :disabled="scenario.pipeline === 'running'" @click="rerun"><Icon name="refresh" :size="16" :class="{ spin: scenario.pipeline === 'running' }" />重新运行</button>
  </div>

  <section class="run-summary" :class="`summary-${summary.tone}`" aria-labelledby="run-summary-title">
    <div class="summary-status-icon" :class="`tone-${summary.tone}`"><Icon :name="summary.icon" :size="28" :class="{ spin: scenario.pipeline === 'running' }" /></div>
    <div class="summary-copy" aria-live="polite"><div class="summary-eyebrow">本次运行结果</div><h2 id="run-summary-title">{{ summary.title }}</h2><p>{{ summary.description }}</p></div>
    <RouterLink v-if="!blockedReason" to="/deploy/new" class="button button-primary"><Icon name="rocket" :size="17" />部署到预发<Icon name="right" :size="16" /></RouterLink>
    <button v-else class="button button-primary" disabled type="button">部署到预发</button>
  </section>
  <p v-if="blockedReason" class="inline-block-reason"><Icon name="alert" :size="15" />{{ blockedReason }}</p>

  <div class="run-facts">
    <div><span class="fact-icon"><Icon name="clock" /></span><div><span>执行耗时</span><strong>{{ scenario.pipeline === 'running' ? '执行中' : scenario.pipeline === 'failed' ? '1 分钟' : '1 分 56 秒' }}</strong></div></div>
    <div><span class="fact-icon"><Icon name="branch" /></span><div><span>运行分支</span><strong class="mono">feature/REQ-1284</strong></div></div>
    <div><span class="fact-icon"><Icon name="commit" /></span><div><span>触发方式</span><strong>代码推送 <small class="muted">· a13f9c2</small></strong></div></div>
    <div><span class="mini-avatar">林</span><div><span>执行人</span><strong>林青 <small class="muted">· 刚刚更新</small></strong></div></div>
  </div>

  <section class="panel stages-panel" aria-labelledby="stages-title">
    <div class="section-heading"><div><h2 id="stages-title">执行阶段 <span class="count-label">3 个阶段</span></h2><p>按执行顺序查看每个阶段的状态与结果</p></div><span class="subtle-chip"><Icon name="layers" :size="14" />顺序执行</span></div>
    <div class="stage-grid">
      <article v-for="(stage, index) in stages" :key="stage.name" class="stage-card" :class="[`stage-${stage.status}`]">
        <div class="stage-top"><span class="stage-number">0{{ index + 1 }}</span><StatusBadge :status="stage.status" :label="stage.status === 'passed' ? '已通过' : undefined" /></div>
        <div class="stage-name"><span class="stage-symbol"><Icon :name="stage.icon" :size="22" /></span><div><h3>{{ stage.name }}</h3><p>{{ stage.description }}</p></div></div>
        <div class="stage-footer"><span><Icon name="clock" :size="14" />{{ stage.duration }}</span><button type="button" class="text-button" @click="selectedLog = index">查看日志<Icon name="upRight" :size="14" /></button></div>
        <span v-if="index < 2" class="stage-connector" aria-hidden="true"><Icon name="chevronRight" :size="16" /></span>
      </article>
    </div>
  </section>

  <div class="content-columns">
    <div class="content-stack">
      <section class="panel artifact-panel" aria-labelledby="artifact-title">
        <div class="section-heading"><h2 id="artifact-title">构建产物</h2><span v-if="scenario.pipeline === 'passed'" class="subtle-chip"><span class="live-dot"></span>镜像已推送</span></div>
        <template v-if="scenario.pipeline === 'passed'">
          <div class="artifact-identity"><span class="package-symbol"><Icon name="package" :size="28" /></span><div><h3>{{ scenario.longContent ? '订单查询与交易履约聚合服务' : '订单服务' }}<span class="version-tag">v1.8.0</span></h3><p class="mono">order-api <span class="muted">/ Docker Image</span></p></div></div>
          <div class="code-copy"><code>{{ artifact.image }}</code><button class="icon-button" type="button" aria-label="复制完整镜像地址" @click="copyText(artifact.image)"><Icon name="copy" :size="16" /></button></div>
          <div class="artifact-meta"><span><Icon name="shield" :size="14" />来自本次构建</span><span>Linux / amd64</span><span>128.4 MB</span></div>
          <div class="artifact-bottom"><span class="muted small-text">制品标识 <code>{{ artifact.id }}</code></span><RouterLink to="/deployments" class="text-link">查看部署记录<Icon name="right" :size="15" /></RouterLink></div>
        </template>
        <div v-else class="compact-empty"><Icon name="package" :size="30" /><h3>构建产物尚未生成</h3><p>全部检查通过并完成镜像构建后，产物会显示在这里。</p></div>
      </section>
      <section class="panel change-panel" aria-labelledby="change-title">
        <div class="section-heading"><h2 id="change-title">最近变更</h2><span class="count-label">1 次提交</span></div>
        <div class="change-item"><span class="commit-symbol"><Icon name="commit" :size="21" /></span><div><h3>{{ scenario.longContent ? '优化跨区域订单聚合查询响应，补充分页、空结果与异常参数回归测试' : '优化订单查询响应，补充分页回归测试' }}</h3><p>林青 <span class="muted">提交于 10:42 · 关联需求</span> <span class="inline-id">REQ-1284</span></p></div><button class="commit-copy" type="button" aria-label="复制提交标识 a13f9c2" @click="copyText(artifact.commit)"><code>a13f9c2</code><Icon name="copy" :size="13" /></button></div>
      </section>
    </div>
    <aside class="panel run-info" aria-labelledby="run-info-title">
      <div class="section-heading"><h2 id="run-info-title">运行信息</h2></div>
      <dl class="detail-list"><div><dt>代码仓库</dt><dd><Icon name="code" :size="15" />team / order-api</dd></div><div><dt>关联需求</dt><dd><span class="inline-id">REQ-1284</span><small>订单查询响应优化</small></dd></div><div><dt>合并请求</dt><dd><Icon name="merge" :size="15" /><span>!86</span><small>feature → main</small></dd></div><div><dt>执行资源</dt><dd>runner-linux-02<small>Ubuntu · 4 vCPU / 8 GB</small></dd></div></dl>
      <div class="info-footnote"><Icon name="shield" :size="16" /><span>同一制品贯穿部署流程<br /><small>来源可核对，结果可追溯</small></span></div>
    </aside>
  </div>

  <Modal v-if="selectedLog !== null" :title="`${stages[selectedLog]?.name} · 执行日志`" wide @close="selectedLog = null"><div class="log-meta"><span class="mono">流水线 #2841</span><span>模拟执行日志</span></div><pre class="terminal-output">{{ logText }}</pre><template #footer><button class="button" type="button" @click="copyText(logText)"><Icon name="copy" :size="16" />复制日志</button><button class="button button-primary" type="button" @click="selectedLog = null">完成</button></template></Modal>
</template>
