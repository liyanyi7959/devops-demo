<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'

const props = defineProps<{ status: string; label?: string }>()
const statuses: Record<string, { label: string; icon: string; tone: string }> = {
  passed: { label: '检查通过', icon: 'success', tone: 'green' },
  succeeded: { label: '部署完成', icon: 'success', tone: 'green' },
  failed: { label: '执行失败', icon: 'failed', tone: 'red' },
  running: { label: '执行中', icon: 'loading', tone: 'blue' },
  queued: { label: '等待执行', icon: 'clock', tone: 'amber' },
  ready: { label: '运行正常', icon: 'success', tone: 'green' },
  pending: { label: '尚未执行', icon: 'pending', tone: 'muted' },
}
const meta = computed(() => statuses[props.status] ?? statuses.pending!)
</script>

<template>
  <span class="status-badge" :class="`tone-${meta.tone}`">
    <Icon :name="meta.icon" :size="14" :class="{ spin: status === 'running' }" />
    {{ label ?? meta.label }}
  </span>
</template>
