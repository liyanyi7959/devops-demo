export type PipelineStatus = 'passed' | 'failed' | 'running'
export type DeploymentStatus = 'queued' | 'running' | 'succeeded' | 'failed'
export type EnvironmentId = 'staging' | 'test'

export interface Deployment {
  id: string
  artifactId: string
  version: string
  environment: EnvironmentId
  note: string
  startedAt: number
  outcome: 'success' | 'failure'
  actor: string
}

export const artifact = {
  id: 'artifact-180',
  service: '订单服务',
  serviceId: 'order-api',
  version: 'v1.8.0',
  pipeline: '#2841',
  commit: 'a13f9c2',
  branch: 'feature/REQ-1284',
  image: 'registry.devops.local/team/order-api:v1.8.0',
  digest: 'sha256:3d957cd23eb4b4910fc66c15561d9f264a8b52c622dbe24e8cd9f63b3a6d1c80',
}

export const environmentNames: Record<EnvironmentId, string> = { staging: '预发环境', test: '测试环境' }

export function deploymentBlockReason(status: PipelineStatus, canDeploy: boolean, artifactReady = true): string {
  if (status === 'running') return '流水线正在运行，完成全部检查后可继续部署。'
  if (status === 'failed') return '单元测试未通过，请先查看失败日志并修复问题。'
  if (!artifactReady) return '本次构建产物尚不可用，请检查镜像构建结果。'
  if (!canDeploy) return '当前账号没有部署权限，可继续查看构建产物与执行记录。'
  return ''
}

export function getDeploymentStatus(record: Deployment, now = Date.now()): DeploymentStatus {
  const elapsed = Math.max(0, now - record.startedAt)
  if (elapsed < 1000) return 'queued'
  if (record.outcome === 'failure' && elapsed >= 4200) return 'failed'
  if (elapsed >= 6500) return 'succeeded'
  return 'running'
}

export function getDeploymentStep(record: Deployment, now = Date.now()): number {
  const elapsed = Math.max(0, now - record.startedAt)
  if (elapsed < 1000) return 0
  if (elapsed < 2600) return 1
  if (elapsed < 4400 || record.outcome === 'failure') return 2
  if (elapsed < 6500) return 3
  return 4
}

export function readDeployments(raw: string | null): Deployment[] | null {
  if (!raw) return null
  try {
    const payload: unknown = JSON.parse(raw)
    if (!payload || typeof payload !== 'object' || !('version' in payload) || payload.version !== 1 || !('records' in payload) || !Array.isArray(payload.records)) return null
    const valid = payload.records.every((entry: unknown) => {
      if (!entry || typeof entry !== 'object') return false
      const item = entry as Record<string, unknown>
      return typeof item.id === 'string' && /^DEP-[A-Z0-9-]{1,40}$/.test(item.id)
        && typeof item.artifactId === 'string' && typeof item.version === 'string'
        && ['staging', 'test'].includes(String(item.environment))
        && typeof item.note === 'string' && item.note.length <= 300
        && typeof item.actor === 'string'
        && typeof item.startedAt === 'number' && Number.isFinite(item.startedAt) && item.startedAt > 0
        && ['success', 'failure'].includes(String(item.outcome))
    })
    if (!valid || new Set(payload.records.map((item: Deployment) => item.id)).size !== payload.records.length) return null
    return payload.records as Deployment[]
  } catch {
    return null
  }
}

export function initialDeployments(now = Date.now()): Deployment[] {
  return [
    { id: 'DEP-0311', artifactId: 'artifact-179', version: 'v1.7.9', environment: 'staging', note: '订单服务预发例行更新', startedAt: now - 4_560_000, outcome: 'success', actor: '林青' },
    { id: 'DEP-0308', artifactId: 'artifact-178', version: 'v1.7.8', environment: 'test', note: '测试环境健康检查未通过，保留原版本', startedAt: now - 86_400_000, outcome: 'failure', actor: '陈默' },
    { id: 'DEP-0306', artifactId: 'artifact-178', version: 'v1.7.8', environment: 'test', note: '订单查询基线验证', startedAt: now - 172_800_000, outcome: 'success', actor: '林青' },
  ]
}
