<template>
  <div class="error-page">
    <div class="code">403</div>
    <h2>没有访问权限</h2>
    <p>当前账号的角色是「{{ roleText }}」，这个页面只对管理员开放。</p>
    <div class="actions">
      <el-button type="primary" @click="router.replace('/')">回到首页</el-button>
      <el-button @click="logout">换个账号登录</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { roleLabel } from '@/utils/dict'

const router = useRouter()
const userStore = useUserStore()
const roleText = computed(() => roleLabel(userStore.role) || '未登录')

function logout(): void {
  userStore.logout()
  router.replace('/login')
}
</script>

<style scoped>
.error-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f4f7f5;
}

.code {
  font-size: 86px;
  font-weight: 800;
  color: #bfe8cd;
  line-height: 1;
}

h2 {
  margin: 12px 0 0;
  color: #14301f;
}

p {
  margin: 0 0 18px;
  color: #7d8a84;
  font-size: 13px;
}
</style>
