<script setup lang="ts">
import type { Component } from 'vue'
import {
  Activity, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Boxes,
  Check, ChevronDown, ChevronRight, CircleAlert, CircleCheck, CircleDashed,
  CircleX, Clock3, Code2, Copy, FileText, GitBranch, GitCommitHorizontal,
  GitPullRequest, Layers3, LoaderCircle, Package, Play, RefreshCw, Rocket,
  Search, Server, Settings2, ShieldCheck, Terminal, Workflow, X,
} from '@lucide/vue'

defineProps<{ name: string; size?: number }>()
const icons: Record<string, Component> = {
  activity: Activity, down: ArrowDown, left: ArrowLeft, right: ArrowRight, upRight: ArrowUpRight,
  book: BookOpen, boxes: Boxes, check: Check, chevronDown: ChevronDown, chevronRight: ChevronRight,
  alert: CircleAlert, success: CircleCheck, pending: CircleDashed, failed: CircleX,
  clock: Clock3, code: Code2, file: FileText, copy: Copy, branch: GitBranch, commit: GitCommitHorizontal,
  merge: GitPullRequest, layers: Layers3, loading: LoaderCircle, package: Package,
  play: Play, refresh: RefreshCw, rocket: Rocket, search: Search, server: Server,
  settings: Settings2, shield: ShieldCheck, terminal: Terminal, workflow: Workflow, x: X,
}
</script>

<template>
  <component :is="icons[name] ?? icons.pending" :size="size ?? 18" :stroke-width="1.7" aria-hidden="true" class="icon" />
</template>
