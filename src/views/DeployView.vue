<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import Icon from '../components/Icon.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { artifact, environmentNames } from '../domain.ts'
import type { EnvironmentId } from '../domain.ts'
import { blockedReason, scenario, submitDeployment } from '../store.ts'

const route = useRoute()
const router = useRouter()
const environment = ref<EnvironmentId>(route.query.environment === 'test' ? 'test' : 'staging')
const note = ref(typeof route.query.note === 'string' ? route.query.note.slice(0, 300) : '')
const submitting = ref(false)
const error = ref('')
const envName = computed(() => environmentNames[environment.value])
async function submit() {
  if (submitting.value) return
  error.value = ''
  submitting.value = true
  try {
    const record = await submitDeployment(environment.value, note.value)
    await router.push(`/deployments/${record.id}`)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '提交失败，请重试。'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <RouterLink to="/pipelines/2841" class="back-link"><Icon name="left" :size="16" />返回流水线 #2841</RouterLink>
  <div class="page-heading"><div><p class="eyebrow">CONTINUOUS DELIVERY</p><h1 tabindex="-1">部署确认</h1><p class="page-description">核对构建产物与目标环境，准备发起一次部署。</p></div><span class="subtle-chip"><Icon name="shield" :size="15" />使用已构建的同一制品</span></div>
  <div class="deploy-layout">
    <form class="panel deploy-form" @submit.prevent="submit">
      <div class="form-section-title"><span class="step-index">1</span><h2>确认构建产物</h2></div>
      <div class="deploy-artifact"><span class="package-symbol"><Icon name="package" :size="25" /></span><div><h3>{{ scenario.longContent ? '订单查询与交易履约聚合服务' : '订单服务' }}</h3><p class="mono">order-api</p></div><span class="version-tag">v1.8.0</span></div>
      <dl class="confirm-details"><div><dt>镜像版本</dt><dd><code>v1.8.0</code></dd></div><div><dt>来源流水线</dt><dd><RouterLink to="/pipelines/2841">#2841</RouterLink><StatusBadge :status="scenario.pipeline" :label="scenario.pipeline === 'failed' ? '检查失败' : undefined" /></dd></div><div><dt>制品标识</dt><dd><code>{{ artifact.id }}</code></dd></div></dl>
      <div class="form-divider"></div>
      <div class="form-section-title"><span class="step-index">2</span><h2>选择目标环境</h2></div>
      <fieldset class="environment-fieldset" :disabled="submitting"><legend class="sr-only">目标环境</legend><label class="environment-choice" :class="{ chosen: environment === 'staging' }"><input v-model="environment" type="radio" name="environment" value="staging" /><span class="environment-symbol violet"><Icon name="layers" :size="20" /></span><span><strong>预发环境 <small>staging</small></strong><span>用于上线前的联调与验收</span></span></label><label class="environment-choice" :class="{ chosen: environment === 'test' }"><input v-model="environment" type="radio" name="environment" value="test" /><span class="environment-symbol teal"><Icon name="code" :size="20" /></span><span><strong>测试环境 <small>test</small></strong><span>用于功能测试与回归验证</span></span></label></fieldset>
      <div class="field-group deploy-note-field"><label class="field-label" for="deploy-note">部署说明 <span class="optional">选填</span></label><textarea id="deploy-note" v-model="note" rows="3" maxlength="300" :disabled="submitting" placeholder="例如：订单查询响应优化，准备预发验收"></textarea><div class="field-help field-help-row"><span>记录本次部署的目的，便于后续追溯。</span><span>{{ note.length }}/300</span></div></div>
      <div class="form-info"><Icon name="alert" :size="18" /><p>本次会将 <strong>v1.8.0</strong> 部署到<strong>{{ envName }}</strong>。提交后可在部署记录中查看执行进度与最终结果。</p></div>
      <p v-if="blockedReason" class="form-error" role="alert"><Icon name="alert" :size="17" />{{ blockedReason }}</p>
      <p v-if="error" class="form-error" role="alert"><Icon name="failed" :size="17" />{{ error }}</p>
      <div class="form-actions"><RouterLink to="/pipelines/2841" class="button">返回详情</RouterLink><button class="button button-primary" type="submit" :disabled="Boolean(blockedReason) || submitting"><Icon :name="submitting ? 'loading' : 'rocket'" :size="17" :class="{ spin: submitting }" />{{ submitting ? '正在提交…' : '确认并发起部署' }}</button></div>
    </form>
    <aside class="deploy-aside"><section class="panel"><div class="section-heading"><h2>本次部署</h2></div><dl class="detail-list"><div><dt>服务</dt><dd>订单服务<small class="mono">order-api</small></dd></div><div><dt>目标环境</dt><dd>{{ envName }}<small>{{ environment }}</small></dd></div><div><dt>变更来源</dt><dd>REQ-1284<small>订单查询响应优化</small></dd></div><div><dt>操作人</dt><dd><span class="mini-avatar">林</span>林青</dd></div></dl></section><div class="deployment-guide"><Icon name="shield" :size="22" /><h3>提交前，再核对一次</h3><p>服务、版本与环境共同决定操作对象。请求已提交后，仍需等待实际执行结果。</p><p class="small-text">此项目使用模拟数据，不会操作真实集群。</p></div></aside>
  </div>
</template>
