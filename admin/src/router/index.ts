import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

/**
 * 路由分三层（作业要求 3）：
 *   1. 公共路由：登录、403、404 —— meta.public = true，不拦；
 *   2. 布局路由：path '/' 指向 Layout，业务页面全部挂在 children 上（D04 加入）；
 *   3. 兜底路由：/ 以外的未知路径统一送 404。
 *
 * meta 约定：
 *   title        浏览器标题，afterEach 里统一写
 *   public       不需要登录
 *   roles        允许访问的角色数组，空表示登录即可
 *   守卫位置：文件末尾 router.beforeEach（登录校验 + 角色校验）
 */
const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: { title: '登录', public: true }
    },
    {
        path: '/403',
        name: 'Forbidden',
        component: () => import('@/views/error/403.vue'),
        meta: { title: '无访问权限', public: true }
    },
    {
        path: '/404',
        name: 'NotFound',
        component: () => import('@/views/error/404.vue'),
        meta: { title: '页面不存在', public: true }
    },
    // 布局路由：所有业务页面挂在 children 上，Layout 只负责外壳（侧边栏 + 顶栏）
    {
        path: '/',
        component: () => import('@/layout/index.vue'),
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/dashboard/index.vue'),
                meta: { title: '工作台', roles: ['ADMIN'] }
            }
        ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/404' }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

/** 守卫一：登录校验。未登录访问受保护路由 → 带上原地址跳登录，登录后原路返回 */
router.beforeEach((to) => {
    const userStore = useUserStore()

    if (to.meta.public) {
        // 已登录还去登录页，直接送回首页，避免重复登录
        if (to.path === '/login' && userStore.isLogin) {
            return { path: '/' }
        }
        return true
    }

    if (!userStore.isLogin) {
        return { path: '/login', query: { redirect: to.fullPath } }
    }

    // 守卫二：角色校验。路由上声明了 roles 就必须命中，否则 403
    const roles = to.meta.roles as string[] | undefined
    if (roles && roles.length > 0 && !roles.includes(userStore.role)) {
        return { path: '/403' }
    }

    return true
})

router.afterEach((to) => {
    const title = (to.meta.title as string | undefined) || '管理后台'
    document.title = `${title} · 校园活动`
})

export default router
