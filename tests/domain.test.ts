import assert from 'node:assert/strict'
import test from 'node:test'
import { deploymentBlockReason, getDeploymentStatus, getDeploymentStep, readDeployments } from '../src/domain.ts'
import type { Deployment } from '../src/domain.ts'

const record: Deployment = {
  id: 'DEP-TEST', artifactId: 'artifact-180', version: 'v1.8.0', environment: 'staging',
  note: '预发验收', startedAt: 1_000_000, outcome: 'success', actor: '林青',
}

test('请求受理、执行与成功分别表达，刷新后可从时间恢复状态', () => {
  assert.equal(getDeploymentStatus(record, record.startedAt), 'queued')
  assert.equal(getDeploymentStatus(record, record.startedAt + 1000), 'running')
  assert.equal(getDeploymentStatus(record, record.startedAt + 6499), 'running')
  assert.equal(getDeploymentStatus(record, record.startedAt + 6500), 'succeeded')
  assert.equal(getDeploymentStep(record, record.startedAt + 6500), 4)
  assert.equal(getDeploymentStatus(record, record.startedAt - 500), 'queued')
})

test('失败部署不会在经过更多时间后变成成功', () => {
  const failed = { ...record, outcome: 'failure' as const }
  assert.equal(getDeploymentStatus(failed, failed.startedAt + 4199), 'running')
  assert.equal(getDeploymentStatus(failed, failed.startedAt + 4200), 'failed')
  assert.equal(getDeploymentStatus(failed, failed.startedAt + 1_000_000), 'failed')
  assert.equal(getDeploymentStep(failed, failed.startedAt + 1_000_000), 2)
})

test('检查通过不自动拥有部署资格，运行中和失败均禁止部署', () => {
  assert.equal(deploymentBlockReason('passed', true), '')
  assert.ok(deploymentBlockReason('passed', false).includes('权限'))
  assert.ok(deploymentBlockReason('passed', true, false).includes('产物'))
  assert.ok(deploymentBlockReason('running', true))
  assert.ok(deploymentBlockReason('failed', true))
})

test('存储恢复接受空记录，拒绝损坏数据与重复标识', () => {
  const saved = JSON.stringify({ version: 1, records: [record] })
  assert.deepEqual(readDeployments(saved), [record])
  assert.deepEqual(readDeployments('{"version":1,"records":[]}'), [])
  assert.equal(readDeployments('{broken'), null)
  assert.equal(readDeployments(JSON.stringify({ version: 2, records: [record] })), null)
  assert.equal(readDeployments(JSON.stringify({ version: 1, records: [record, record] })), null)
  assert.equal(readDeployments(JSON.stringify({ version: 1, records: [{ ...record, environment: 'production' }] })), null)
  assert.equal(readDeployments(JSON.stringify({ version: 1, records: [{ ...record, startedAt: 'yesterday' }] })), null)
})
