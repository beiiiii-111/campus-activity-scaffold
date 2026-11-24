<template>
  <div class="scaffold">
    <header class="scaffold-header">
      <h1>校园活动管理后台</h1>
      <p>D02 · 类型定义、请求层与字典</p>
    </header>

    <el-card shadow="never" class="scaffold-card">
      <template #header>
        <div class="card-head">
          <span>请求层自检</span>
          <el-button size="small" :loading="loading" @click="check">重新检测</el-button>
        </div>
      </template>
      <div class="status-line">
        <span class="dot" :class="state"></span>
        <span class="status-text">{{ statusText }}</span>
        <span v-if="detail" class="status-detail">{{ detail }}</span>
      </div>
      <p class="hint">
        axios 实例 baseURL 固定 <code>/api</code> → 代理到 8016；<code>code === 0</code> 直接返回 data，
        非 0 弹提示并 reject，401 清 token 跳登录。
      </p>
    </el-card>

    <el-card shadow="never" class="scaffold-card">
      <template #header>字典：活动状态 / 报名状态</template>
      <div class="dict-block">
        <div class="dict-row">
          <span class="dict-title">活动状态</span>
          <div class="dict-tags">
            <el-tag v-for="item in activityOptions" :key="item.value" :type="item.type" size="small">
              {{ item.value }} · {{ item.label }}
            </el-tag>
          </div>
        </div>
        <div class="dict-row">
          <span class="dict-title">报名状态</span>
          <div class="dict-tags">
            <el-tag v-for="item in signupOptions" :key="item.value" :type="item.type" size="small">
              {{ item.value }} · {{ item.label }}
            </el-tag>
          </div>
        </div>
        <div class="dict-row">
          <span class="dict-title">角色 / 动作</span>
          <div class="dict-tags">
            <el-tag v-for="item in roleOptions" :key="item.value" type="info" size="small"> {{ item.label }} </el-tag>
            <el-tag v-for="(label, key) in auditActions" :key="key" type="warning" size="small">
              {{ key }} · {{ label }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="scaffold-card">
      <template #header>核心类型契约（与小程序、后端同名同义）</template>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ActivityItem">活动列表：时间、名额、状态、报名是否开放</el-descriptions-item>
        <el-descriptions-item label="SignupItem">报名记录：报名号、候补序号、签到时间</el-descriptions-item>
        <el-descriptions-item label="UserInfo">用户：角色、所属组织、学号绑定标记</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api } from '@/api'
import {
  ACTIVITY_STATUS_OPTIONS,
  AUDIT_ACTION_LABELS,
  ROLE_OPTIONS,
  SIGNUP_STATUS_OPTIONS
} from '@/utils/dict'

const activityOptions = ACTIVITY_STATUS_OPTIONS
const signupOptions = SIGNUP_STATUS_OPTIONS
const roleOptions = ROLE_OPTIONS
const auditActions = AUDIT_ACTION_LABELS

const state = ref<'idle' | 'ok' | 'error'>('idle')
const detail = ref('')
const loading = ref(false)

const statusText = computed(() => {
  if (state.value === 'ok') return '后端已连通'
  if (state.value === 'error') return '后端未连通'
  return '检测中…'
})

async function check(): Promise<void> {
  loading.value = true
  state.value = 'idle'
  detail.value = ''
  try {
    const res = await api.ping()
    state.value = 'ok'
    detail.value = `${res.app} ｜ 服务器时间 ${res.serverTime}`
  } catch (e) {
    state.value = 'error'
    detail.value = e instanceof Error ? e.message : '请求失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  check()
})
</script>

<style scoped>
.scaffold {
    max-width: 920px;
    margin: 0 auto;
    padding: 48px 24px 64px;
}

.scaffold-header h1 {
    margin: 0;
    font-size: 26px;
}

.scaffold-header p {
    margin: 8px 0 24px;
    color: #6b7280;
    font-size: 14px;
}

.scaffold-card {
    margin-bottom: 20px;
    border-radius: 12px;
}

.card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.status-line {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
}

.dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #c9ced6;
}

.dot.ok {
    background: #16a34a;
}

.dot.error {
    background: #e5484d;
}

.status-text {
    font-weight: 600;
}

.status-detail {
    color: #6b7280;
    font-size: 13px;
}

.hint {
    margin: 14px 0 0;
    color: #8a8f99;
    font-size: 12px;
    line-height: 1.7;
}

.hint code {
    padding: 1px 4px;
    border-radius: 4px;
    background: #f2f4f3;
    color: #12813f;
}

.dict-block {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.dict-row {
    display: flex;
    align-items: flex-start;
    gap: 16px;
}

.dict-title {
    flex: 0 0 76px;
    color: #6b7280;
    font-size: 13px;
    line-height: 24px;
}

.dict-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
</style>
