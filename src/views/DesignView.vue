<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Icon from '../components/Icon.vue'

const methods = [
  { id: '01 / 06', title: '先明确任务，再安排层级', detail: '流水线首先回答检查结论和当前动作，再展示阶段、产物与追溯信息。', icon: 'workflow' },
  { id: '07 / 20 / 24', title: '有限文字角色', detail: '标题、主体、辅助说明各有稳定字号与行高，用字重和颜色共同表达主次。', icon: 'file' },
  { id: '13 / 19', title: '操作有主次，字段有归属', detail: '部署是当前主操作。确认页将产物、环境、说明和提交分别组织，标签靠近控件。', icon: 'layers' },
  { id: '16 / 17 / 18', title: '按内容分配空间', detail: '侧栏使用稳定宽度，主区弹性伸缩；表单限制宽度，窄屏改为单列。', icon: 'boxes' },
  { id: '29 / 33 / 34', title: '颜色辅助，文字说明', detail: '状态同时使用名称与图形，普通文字检查前景背景对比，失败不会只表现为红色。', icon: 'shield' },
  { id: '36 / 47 / 49', title: '保留真实交互', detail: '对话框可用 Esc 关闭，环境使用原生单选，空记录与筛选无结果提供不同下一步。', icon: 'code' },
]
</script>

<template>
  <div class="page-heading"><div><p class="eyebrow">DESIGN NOTES</p><h1 tabindex="-1">设计有依据，改动可检查</h1><p class="page-description">这份 Vue 3 演示如何应用配套 UI Skill。</p></div><span class="version-tag">UI DESIGN REFINEMENT</span></div>
  <section class="design-intro"><span class="design-intro-mark"><Icon name="workflow" :size="34" /></span><div><h2>从一条完整路径开始</h2><p>流水线详情 → 部署确认 → 执行记录。每个页面围绕一个当前任务组织，模拟状态变化贯穿同一制品。</p></div></section>
  <div class="methods-grid"><article v-for="method in methods" :key="method.id" class="panel method-card"><div><span class="method-symbol"><Icon :name="method.icon" :size="22" /></span><span class="method-number">合集 {{ method.id }}</span></div><h2>{{ method.title }}</h2><p>{{ method.detail }}</p></article></div>
  <section class="panel design-try"><div><h2>亲手检查这些变化</h2><p>点击右上角“演示场景”，切换检查失败、部署权限、长内容或失败结果。也可以清空记录，观察首次部署与筛选无结果的区别。</p></div><RouterLink to="/pipelines/2841" class="button button-primary">开始体验<Icon name="right" :size="16" /></RouterLink></section>
  <p class="design-scope">界面采用本合集的 ui-design-refinement 作为设计指引，工程实现使用 Vue 3、TypeScript、Vue Router 与 Vite。所有仓库、运行日志、权限和部署结果均为模拟，不连接真实 CI 或集群。</p>
</template>
