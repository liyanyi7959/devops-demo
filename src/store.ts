import { computed, reactive, ref, watch } from 'vue'
import { artifact, deploymentBlockReason, getDeploymentStatus, initialDeployments, readDeployments } from './domain.ts'
import type { Deployment, EnvironmentId, PipelineStatus } from './domain.ts'

const STORAGE_KEY = 'devops-demo-v1'
export const storageNotice = ref('')
let saved: Deployment[] | null = null
try {
  const raw = localStorage.getItem(STORAGE_KEY)
  saved = readDeployments(raw)
  if (raw && !saved) storageNotice.value = '本地演示记录无法读取，已恢复示例数据。'
} catch {
  storageNotice.value = '浏览器不允许本地存储，本次记录将在关闭页面后清除。'
}

export const now = ref(Date.now())
export const records = ref<Deployment[]>(saved ?? initialDeployments())
export const scenario = reactive({
  pipeline: 'passed' as PipelineStatus,
  canDeploy: true,
  outcome: 'success' as 'success' | 'failure',
  requestFailure: false,
  longContent: false,
})
export const blockedReason = computed(() => deploymentBlockReason(scenario.pipeline, scenario.canDeploy))
export const activeCount = computed(() => records.value.filter(record => ['queued', 'running'].includes(getDeploymentStatus(record, now.value))).length)
export const notice = ref('')
let noticeTimer: ReturnType<typeof setTimeout> | undefined

watch(records, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, records: value }))
  } catch {
    storageNotice.value = '本地存储不可用，本次操作仍可继续，刷新后记录可能丢失。'
  }
}, { deep: true, immediate: true })

export function notify(message: string) {
  notice.value = message
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => { notice.value = '' }, 3500)
}

export async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    notify('已复制完整内容')
  } catch {
    notify('无法访问剪贴板，请选中文字后手动复制')
  }
}

let submission: Promise<Deployment> | null = null
export function submitDeployment(environment: EnvironmentId, note: string): Promise<Deployment> {
  if (submission) return submission
  if (blockedReason.value) return Promise.reject(new Error(blockedReason.value))
  if (!['staging', 'test'].includes(environment)) return Promise.reject(new Error('请选择有效的目标环境。'))
  const requestFails = scenario.requestFailure
  const outcome = scenario.outcome
  submission = new Promise<Deployment>((resolve, reject) => {
    setTimeout(() => {
      if (requestFails) return reject(new Error('部署请求未能提交，输入内容已保留，请重试。'))
      // 模拟接口在受理时再次校验；接入真实接口后由服务端执行这些检查。
      if (blockedReason.value) return reject(new Error(blockedReason.value))
      const record: Deployment = {
        id: `DEP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        artifactId: artifact.id,
        version: artifact.version,
        environment,
        note: note.trim().slice(0, 300),
        startedAt: Date.now(),
        outcome,
        actor: '林青',
      }
      now.value = Date.now()
      records.value.unshift(record)
      resolve(record)
    }, 700)
  }).finally(() => { submission = null })
  return submission
}

export function restoreDemo() {
  scenario.pipeline = 'passed'
  scenario.canDeploy = true
  scenario.outcome = 'success'
  scenario.requestFailure = false
  scenario.longContent = false
  records.value = initialDeployments()
  notify('已恢复默认演示场景')
}

export function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(timestamp)
}
