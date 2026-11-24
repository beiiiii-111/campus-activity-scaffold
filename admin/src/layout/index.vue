<template>
  <div class="layout">
    <aside class="aside">
      <div class="logo">
        <div class="mark">校</div>
        <div class="text">
          <strong>校园活动</strong>
          <span>管理后台</span>
        </div>
      </div>

      <el-menu :default-active="route.path" router class="menu" background-color="transparent" text-color="#cfe6d8"
        active-text-color="#ffffff">
        <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>

      <div class="foot">2026 校园活动平台</div>
    </aside>

    <section class="main">
      <header class="topbar">
        <div class="crumb">
          <span class="dot" />
          <span>{{ currentTitle }}</span>
        </div>
        <el-dropdown trigger="click" @command="onCommand">
          <div class="user">
            <el-avatar :size="28" class="avatar">{{ avatarText }}</el-avatar>
            <span>{{ userStore.nickname }}</span>
            <el-tag size="small" effect="plain" type="success">{{ roleLabel(userStore.role) }}</el-tag>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </header>

      <main class="content">
        <!-- 业务页面通过布局路由的 children 渲染到这里 -->
        <router-view />
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown, CircleCheck, Document, Files, Odometer, UserFilled } from '@element-plus/icons-vue'
import api from '@/api'
import { useUserStore } from '@/stores/user'
import { roleLabel } from '@/utils/dict'
import type { UserRole } from '@/types/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

/**
 * 菜单与路由表同源：path 必须和 router/index.ts 里 children 的 path 一致。
 * roles 与路由 meta.roles 保持一样，页面上「看不到入口」和「手输 URL 被拦」两件事才对得上。
 */
const allMenus = [
  { path: '/dashboard', title: '工作台', icon: Odometer, roles: ['ADMIN', 'REVIEWER'] },
  { path: '/audit', title: '活动审核', icon: CircleCheck, roles: ['ADMIN', 'REVIEWER'] },
  { path: '/activity', title: '活动管理', icon: Files, roles: ['ADMIN', 'REVIEWER'] },
  { path: '/user', title: '用户管理', icon: UserFilled, roles: ['ADMIN'] },
  { path: '/log', title: '操作日志', icon: Document, roles: ['ADMIN'] }
]

/** 菜单级权限：按当前角色过滤，审核员看不到「用户管理 / 操作日志」 */
const menus = computed(() => {
  const role = userStore.role as UserRole | undefined
  return allMenus.filter((item) => !role || item.roles.includes(role))
})

const currentTitle = computed(() => (route.meta.title as string | undefined) || '工作台')
const avatarText = computed(() => userStore.nickname.slice(0, 1))

async function onCommand(command: string): Promise<void> {
  if (command !== 'logout') return
  // 先尽力通知后端把 token 拉黑，失败也不阻塞本地登出
  await api.logout().catch(() => undefined)
  userStore.logout()
  ElMessage.success('已退出登录')
  await router.replace('/login')
}
</script>

<style scoped>
.layout {
  display: flex;
  height: 100%;
  background: #f4f7f5;
}

.aside {
  width: 220px;
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #14301f 0%, #0d2216 100%);
  color: #fff;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 18px;
}

.mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #22c55e, #86efac);
  color: #0d2216;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text strong {
  display: block;
  font-size: 15px;
}

.text span {
  font-size: 11px;
  color: #8fbfa2;
}

.menu {
  flex: 1;
  border-right: none;
  padding: 6px 10px;
}

.menu :deep(.el-menu-item) {
  height: 44px;
  border-radius: 10px;
  margin-bottom: 4px;
}

.menu :deep(.el-menu-item.is-active) {
  background: rgba(34, 197, 94, 0.28);
  font-weight: 600;
}

.foot {
  padding: 14px 18px;
  font-size: 11px;
  color: #6f9c83;
}

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 60px;
  flex: 0 0 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e8efeb;
}

.crumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #34473d;
  font-weight: 600;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #16a34a;
}

.user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #34473d;
}

.avatar {
  background: linear-gradient(135deg, #16a34a, #4ade80);
  font-size: 12px;
}

.content {
  flex: 1;
  overflow: auto;
  padding: 20px 24px 28px;
}
</style>
