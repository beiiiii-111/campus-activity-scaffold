import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

/** hash 模式：部署到静态服务器无需额外配置 rewrite；request.ts 里 401 也是改 hash 跳登录 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'scaffold',
    component: () => import('@/views/ScaffoldHome.vue'),
    meta: { title: '脚手架自检' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.afterEach((to) => {
  const title = (to.meta.title as string | undefined) || '管理后台'
  document.title = `${title} · 校园活动`
})

export default router
