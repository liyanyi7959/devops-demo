<script setup lang="ts">
import Modal from './Modal.vue'
import Icon from './Icon.vue'
import { notify, records, restoreDemo, scenario } from '../store.ts'

const emit = defineEmits<{ close: [] }>()
function clearRecords() {
  records.value = []
  notify('演示记录已清空，可体验首次部署')
}
</script>

<template>
  <Modal title="切换演示场景" @close="emit('close')">
    <p class="muted modal-intro">观察同一界面如何处理不同结果。所有操作均为本地模拟。</p>
    <fieldset class="field-set">
      <legend class="field-label">流水线状态</legend>
      <div class="segmented segmented-three">
        <label><input v-model="scenario.pipeline" type="radio" value="passed" name="pipeline-state" /><span>检查通过</span></label>
        <label><input v-model="scenario.pipeline" type="radio" value="failed" name="pipeline-state" /><span>检查失败</span></label>
        <label><input v-model="scenario.pipeline" type="radio" value="running" name="pipeline-state" /><span>运行中</span></label>
      </div>
    </fieldset>
    <div class="scenario-row">
      <label for="deploy-permission"><strong>允许当前用户部署</strong><span>关闭后保留检查结果，并说明操作限制。</span></label>
      <input id="deploy-permission" v-model="scenario.canDeploy" class="switch" type="checkbox" role="switch" />
    </div>
    <div class="field-group">
      <label class="field-label" for="outcome">下一次部署结果</label>
      <select id="outcome" v-model="scenario.outcome"><option value="success">部署完成</option><option value="failure">健康检查失败</option></select>
      <p class="field-help">只影响新提交的部署，已有记录保留原结果。</p>
    </div>
    <div class="scenario-row">
      <label for="request-failure"><strong>模拟提交请求失败</strong><span>检查错误反馈与输入保留，关闭后可重试。</span></label>
      <input id="request-failure" v-model="scenario.requestFailure" class="switch" type="checkbox" role="switch" />
    </div>
    <div class="scenario-row">
      <label for="long-content"><strong>使用较长内容</strong><span>检查服务名称、摘要与窄屏换行。</span></label>
      <input id="long-content" v-model="scenario.longContent" class="switch" type="checkbox" role="switch" />
    </div>
    <div class="scenario-reset">
      <button class="button button-quiet" type="button" @click="clearRecords"><Icon name="layers" :size="16" />清空部署记录</button>
      <button class="button button-quiet" type="button" @click="restoreDemo"><Icon name="refresh" :size="16" />恢复默认数据</button>
    </div>
    <template #footer><button class="button button-primary" type="button" @click="emit('close')">应用并查看</button></template>
  </Modal>
</template>
