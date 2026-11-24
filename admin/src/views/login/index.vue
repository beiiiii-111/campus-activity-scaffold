<template>
  <div class="login-page">
    <div class="login-card">
      <div class="brand">
        <div class="brand-mark">校</div>
        <div>
          <h1>校园活动管理后台</h1>
          <p>活动审核 · 活动管理 · 用户管理</p>
        </div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" size="large" @keyup.enter="submit">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入管理员账号" clearable>
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password>
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit" :loading="loading" @click="submit">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <p class="tip">演示账号：admin / Admin@123</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import api from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: 'admin', password: 'Admin@123' })

const rules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function submit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const data = await api.login({ username: form.username, password: form.password })
    userStore.saveLogin(data.token, data.user)
    ElMessage.success(`欢迎回来，${data.user.nickname || data.user.role}`)
    // 登录前被拦下的地址优先，否则进首页
    const redirect = (route.query.redirect as string) || '/'
    await router.replace(redirect)
  } catch {
    // 错误提示已在 request.ts 的统一拦截里弹过，这里只负责收尾
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 20% 20%, #e6f7ec 0%, #f4f7f5 45%, #eaf3ee 100%);
}

.login-card {
  width: 420px;
  padding: 40px 40px 24px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 18px 48px rgba(22, 163, 74, 0.12);
}

.brand {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 28px;
}

.brand-mark {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: linear-gradient(135deg, #16a34a, #4ade80);
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand h1 {
  margin: 0;
  font-size: 20px;
  color: #14301f;
}

.brand p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #8a9691;
}

.submit {
  width: 100%;
  letter-spacing: 4px;
}

.tip {
  margin: 0;
  text-align: center;
  font-size: 12px;
  color: #9aa5a0;
}
</style>
