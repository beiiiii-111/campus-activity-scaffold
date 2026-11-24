<template>
  <view class="page">
    <view class="hero">
      <text class="hero-title">校园活动</text>
      <text class="hero-sub">学生端脚手架 · A02 类型定义与请求层</text>
    </view>

    <!-- 请求层自检：真正打一次 /api/ping，证明代理、统一响应体、错误分支都通 -->
    <view class="card">
      <view class="card-head">
        <text class="card-title">请求层自检</text>
        <text class="retry" @click="check">重新检测</text>
      </view>
      <view class="status">
        <view class="dot" :class="state"></view>
        <text class="status-text">{{ statusText }}</text>
      </view>
      <text v-if="detail" class="detail">{{ detail }}</text>
      <text class="hint">GET /api/ping → code=0 时直接拿到 data，非 0 由拦截器统一提示</text>
    </view>

    <view class="card">
      <text class="card-title">核心类型契约</text>
      <view v-for="item in contracts" :key="item.name" class="row">
        <text class="row-name">{{ item.name }}</text>
        <text class="row-desc">{{ item.desc }}</text>
      </view>
    </view>

    <view class="card">
      <text class="card-title">三端端口</text>
      <view v-for="item in ends" :key="item.name" class="row">
        <text class="row-name">{{ item.name }}</text>
        <text class="row-port">{{ item.port }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { api } from '../../utils/api'

interface ContractRow {
  name: string
  desc: string
}

const contracts: ContractRow[] = [
  { name: 'ActivityItem', desc: '活动列表：时间、名额、状态、我的报名状态' },
  { name: 'SignupItem', desc: '报名记录：报名号、候补序号、可取消/可签到' },
  { name: 'UserInfo', desc: '用户：角色、组织、学号绑定标记' }
]

const ends = [
  { name: '后端接口', port: '8016' },
  { name: '管理后台', port: '5173' },
  { name: '学生端 H5', port: '5174' }
]

const state = ref<'idle' | 'ok' | 'error'>('idle')
const detail = ref('')

const statusText = computed(() => {
  if (state.value === 'ok') return '后端已连通'
  if (state.value === 'error') return '后端未连通'
  return '检测中…'
})

async function check(): Promise<void> {
  state.value = 'idle'
  detail.value = ''
  try {
    const res = await api.ping()
    state.value = 'ok'
    detail.value = `${res.app} ｜ 服务器时间 ${res.serverTime}`
  } catch (e) {
    state.value = 'error'
    detail.value = e instanceof Error ? e.message : '请求失败'
  }
}

onShow(() => {
  check()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 60rpx;
}

.hero {
  padding: 40rpx 32rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #12813f 0%, #22c55e 100%);
  display: flex;
  flex-direction: column;
}

.hero-title {
  color: #fff;
  font-size: 44rpx;
  font-weight: 600;
}

.hero-sub {
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.85);
  font-size: 24rpx;
}

.card {
  margin-top: 24rpx;
  padding: 28rpx 32rpx;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 6rpx 20rpx rgba(17, 24, 39, 0.05);
  display: flex;
  flex-direction: column;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.retry {
  color: var(--brand);
  font-size: 24rpx;
}

.status {
  display: flex;
  align-items: center;
  padding: 8rpx 0;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 14rpx;
  background: #c9ced6;
}

.dot.ok {
  background: #16a34a;
}

.dot.error {
  background: #e5484d;
}

.status-text {
  font-size: 30rpx;
  font-weight: 600;
}

.detail {
  margin-top: 8rpx;
  color: var(--text-sub);
  font-size: 24rpx;
}

.hint {
  margin-top: 14rpx;
  color: #9aa0aa;
  font-size: 22rpx;
  line-height: 1.6;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 1rpx solid var(--line);
}

.row:last-child {
  border-bottom: none;
}

.row-name {
  color: var(--text-main);
  font-size: 26rpx;
}

.row-desc {
  flex: 1;
  margin-left: 20rpx;
  text-align: right;
  color: var(--text-sub);
  font-size: 22rpx;
}

.row-port {
  color: var(--brand);
  font-size: 26rpx;
  font-weight: 600;
}
</style>
