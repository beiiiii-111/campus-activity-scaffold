<template>
  <view class="page" v-if="activity.id">
    <view class="cover" :style="coverStyle">
      <image v-if="activity.coverUrl" :src="activity.coverUrl" mode="aspectFill" class="cover-img" />
      <view class="cover-mask" />
      <view class="cover-text">
        <view class="badges">
          <text class="badge">{{ activity.categoryName || '未分类' }}</text>
          <text v-if="activity.score" class="badge score">{{ activity.scoreTypeLabel || '第二课堂' }} +{{ activity.score }} 分</text>
        </view>
        <text class="title">{{ activity.title }}</text>
      </view>
    </view>

    <view class="card">
      <view class="row">
        <text class="label">活动时间</text>
        <view class="value">
          <text class="strong">{{ activity.startTime }}</text>
          <text class="sub">至 {{ activity.endTime }}</text>
        </view>
      </view>
      <view class="row">
        <text class="label">活动地点</text>
        <view class="value">
          <text class="strong">{{ activity.locationName || '待定' }}</text>
          <text v-if="activity.address" class="sub">{{ activity.address }}</text>
        </view>
      </view>
      <view class="row">
        <text class="label">主办方</text>
        <view class="value">
          <text class="strong">{{ activity.orgName || '未知' }}</text>
        </view>
      </view>
      <view class="row">
        <text class="label">报名时间</text>
        <view class="value">
          <text class="strong">{{ activity.signupStartTime }} 起</text>
          <text class="sub">截止 {{ activity.signupEndTime }}</text>
        </view>
      </view>
      <view class="row">
        <text class="label">报名名额</text>
        <view class="value">
          <view class="progress-row">
            <view class="progress">
              <view class="progress-inner" :style="{ width: percent + '%' }" />
            </view>
            <text class="progress-text">{{ activity.signedCount || 0 }}/{{ activity.capacity || '不限' }}</text>
          </view>
          <text class="sub">{{ activity.auditRequired === 1 ? '报名后需组织者审核' : '报名即通过' }}{{ activity.waitlistEnabled === 1 ? ' · 已开启候补' : '' }}</text>
        </view>
      </view>
    </view>

    <view class="card">
      <text class="section-title">活动介绍</text>
      <text class="content">{{ activity.content || '组织者暂未填写详细介绍' }}</text>
    </view>

    <view class="bottom-space" />

    <view class="bottom-bar">
      <view class="bottom-info">
        <text class="price">{{ activity.score ? `+${activity.score} 分` : '无分值' }}</text>
        <text class="hint">{{ statusText }}</text>
      </view>
      <button class="action" :class="{ disabled: !canSignup }" @click="onAction">{{ actionText }}</button>
    </view>
  </view>

  <view v-else class="loading-page">
    <text class="tip">{{ loading ? '加载中…' : '活动不存在或已下架' }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { api } from '../../utils/api'
import { getToken } from '../../utils/request'
import type { ActivityDetail } from '../../types'

const activityId = ref<number | null>(null)
const activity = ref<ActivityDetail>({} as ActivityDetail)
const loading = ref(true)

const percent = computed(() => {
  if (!activity.value.capacity) return 0
  return Math.min(100, Math.round(((activity.value.signedCount || 0) / activity.value.capacity) * 100))
})

/** 已报名 / 已签到等状态优先级高于可报名窗口 */
const signupState = computed(() => activity.value.mySignupStatus)

const canSignup = computed(() => {
  const item = activity.value
  if (!item.id) return false
  if (signupState.value === 1 || signupState.value === 3) return false
  if (item.status !== 3 && item.status !== 4) return false
  return Boolean(item.signupOpen)
})

const actionText = computed(() => {
  const item = activity.value
  if (signupState.value === 3) return '已签到'
  if (signupState.value === 1) return '已报名'
  if (signupState.value === 0) return '待审核'
  if (signupState.value === 5) return '候补中'
  if (item.status === 4) return '活动进行中'
  if (item.status === 5) return '活动已结束'
  if (!item.signupOpen) return '报名已截止'
  return '立即报名'
})

const statusText = computed(() => {
  if (signupState.value === 1) return '可在报名截止前取消'
  if (signupState.value === 3) return '签到成功，记得评价活动'
  if (activity.value.signupOpen) return `报名截止 ${activity.value.signupEndTime || ''}`
  return '当前不在报名时间内'
})

const coverStyle = computed(() => {
  if (activity.value.coverUrl) return {}
  return { background: 'linear-gradient(140deg, #12813f 0%, #22c55e 60%, #86efac 100%)' }
})

async function load(): Promise<void> {
  if (!activityId.value) return
  loading.value = true
  try {
    activity.value = await api.activityDetail(activityId.value)
  } finally {
    loading.value = false
  }
}

function onAction(): void {
  if (!canSignup.value) return
  if (!getToken()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  uni.navigateTo({ url: `/pages/activity/signup?id=${activityId.value}` })
}

onLoad((options) => {
  const id = options?.id ? Number(options.id) : null
  activityId.value = id
  load()
})

onShow(() => {
  // 从报名页返回时刷新，让「已报名」状态立刻生效
  if (activity.value.id) load()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f7f8;
  padding-bottom: 20rpx;
}

.cover {
  position: relative;
  height: 380rpx;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.cover-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.55) 100%);
}

.cover-text {
  position: absolute;
  left: 28rpx;
  right: 28rpx;
  bottom: 34rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.badges {
  display: flex;
  gap: 12rpx;
}

.badge {
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  color: #12813f;
  font-size: 21rpx;
}

.badge.score {
  background: rgba(180, 83, 9, 0.9);
  color: #fff;
}

.title {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1.35;
}

.card {
  margin: 20rpx 24rpx 0;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #fff;
}

.row {
  display: flex;
  gap: 20rpx;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f1f4f2;
}

.row:last-child {
  border-bottom: none;
}

.label {
  width: 130rpx;
  flex: 0 0 130rpx;
  font-size: 24rpx;
  color: #9aa0aa;
}

.value {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.strong {
  font-size: 26rpx;
  color: #1f2430;
  font-weight: 500;
}

.sub {
  font-size: 22rpx;
  color: #9aa0aa;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.progress {
  flex: 1;
  height: 12rpx;
  border-radius: 6rpx;
  background: #eef4f0;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  border-radius: 6rpx;
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.progress-text {
  font-size: 22rpx;
  color: #46564e;
}

.section-title {
  font-size: 29rpx;
  font-weight: 600;
  color: #1f2430;
}

.content {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  color: #46564e;
  line-height: 1.8;
  white-space: pre-wrap;
}

.bottom-space {
  height: 140rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 28rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -6rpx 24rpx rgba(20, 48, 31, 0.06);
}

.bottom-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.price {
  font-size: 30rpx;
  font-weight: 700;
  color: #b45309;
}

.hint {
  font-size: 21rpx;
  color: #9aa0aa;
}

.action {
  width: 260rpx;
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 42rpx;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  font-size: 29rpx;
  font-weight: 600;
  border: none;
}

.action.disabled {
  background: #d8dee2;
  color: #fff;
}

.loading-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tip {
  font-size: 26rpx;
  color: #9aa0aa;
}
</style>
