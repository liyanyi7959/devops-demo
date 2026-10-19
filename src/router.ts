import { createRouter, createWebHashHistory } from 'vue-router'
import PipelineView from './views/PipelineView.vue'
import DeployView from './views/DeployView.vue'
import DeploymentsView from './views/DeploymentsView.vue'
import DeploymentView from './views/DeploymentView.vue'
import EnvironmentsView from './views/EnvironmentsView.vue'
import DesignView from './views/DesignView.vue'
import NotFoundView from './views/NotFoundView.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/pipelines/2841' },
    { path: '/pipelines/2841', component: PipelineView, meta: { title: '流水线详情', area: '流水线' } },
    { path: '/deploy/new', component: DeployView, meta: { title: '部署确认', area: '流水线' } },
    { path: '/deployments', component: DeploymentsView, meta: { title: '部署记录', area: '部署记录' } },
    { path: '/deployments/:id', component: DeploymentView, meta: { title: '部署详情', area: '部署记录' } },
    { path: '/environments', component: EnvironmentsView, meta: { title: '环境总览', area: '环境' } },
    { path: '/design', component: DesignView, meta: { title: '设计说明', area: '设计说明' } },
    { path: '/:pathMatch(.*)*', component: NotFoundView, meta: { title: '页面不存在', area: '工作空间' } },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = `${to.meta.title} · DevOps`
})
