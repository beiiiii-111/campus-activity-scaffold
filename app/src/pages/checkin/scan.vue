<template>
  <view class="page">
    <view class="hero">
      <text class="hero-title">扫码签到</text>
      <text class="hero-sub">把组织者核销台上的动态码填进来，或在现场直接扫二维码</text>
    </view>

    <view class="card">
      <text class="label">签到码</text>
      <textarea v-model="token" class="input" auto-height maxlength="-1"
        placeholder="粘贴或输入签到码，形如 3010.5876531.9f2c…" placeholder-class="ph" />
      <view class="row">
        <view class="chip" @click="pasteCode">粘贴</view>
        <view class="chip" @click="scanCode">扫一扫</view>
        <view class="chip" :class="{ on: located }" @click="locate">{{ located ? '已获取定位' : '获取定位' }}</view>
      </view>
      <view class="btn primary" :class="{ disabled: !canSubmit }" @click="submit">
        {{ loading ? '签到中…' : '确认签到' }}
      </view>
      <text class="hint">签到码由组织者在「组织者工作台 - 签到码」页面展示，每 30 秒轮换一次</text>
    </view>

    <!-- 成功：只展示后端回传的关键信息，不再自己拼文案 -->
    <view v-if="result" class="card ok">
      <view class="ok-head">
        <view class="ok-icon">✓</view>
        <view class="ok-text">
          <text class="ok-title">{{ result.message }}</text>
          <text class="ok-sub">{{ result.activityTitle }}</text>
        </view>
      </view>
      <view class="ok-line">
        <text class="ok-label">签到人</text>
        <text class="ok-value">{{ result.studentName || '本人' }}</text>
      </view>
      <view class="ok-line">
        <text class="ok-label">签到时间</text>
        <text class="ok-value">{{ result.checkinTime }}</text>
      </view>
      <view class="btn ghost" @click="go('/pages/mine/signups')">查看我的报名</view>
    </view>

    <!-- 失败：按错误码走不同文案与下一步动作 -->
    <view v-if="failure" class="card fail">
      <view class="fail-head">
        <text class="fail-code">{{ failure.code }}</text>
        <text class="fail-title">{{ failure.title }}</text>
      </view>
      <text class="fail-advice">{{ failure.advice }}</text>
      <view v-if="failure.action" class="btn ghost" @click="go(failure?.action?.url || '')">
        {{ failure?.action?.text }}
      </view>
    </view>

    <view class="tips">
      <text class="tips-title">签到前请确认</text>
      <text class="tips-item">· 已报名且报名状态为「报名成功」，候补和待审核不能签到</text>
      <text class="tips-item">· 签到时间：活动开始前 30 分钟 ~ 活动结束后 30 分钟</text>
      <text class="tips-item">· 定位签到的活动要在活动地点 200 米内，并允许小程序获取位置</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from '../../utils/api'
import type { CheckinResult } from '../../types'
import type { ApiError } from '../../utils/request'

interface Failure {
  code: number | string
  title: string
  advice: string
  action?: { text: string; url: string }
}

const token = ref('')
const loading = ref(false)
const result = ref<CheckinResult | null>(null)
const failure = ref<Failure | null>(null)
const located = ref(false)
const position = ref<{ latitude?: number; longitude?: number }>({})

const canSubmit = computed(() => token.value.trim().length > 8 && !loading.value)

/**
 * 错误码 → 用户能看懂的下一步。
 * 后端 ResultCode 里签到相关是 40001~40005，认证相关是 10001/10003。
 */
const ERROR_MAP: Record<number, Omit<Failure, 'code'>> = {
  40001: {
    title: '签到码无效或已过期',
    advice: '签到码每 30 秒轮换一次，请让组织者刷新核销台后重新获取',
    action: { text: '刷新后重试', url: '' }
  },
  40002: {
    title: '你还没有报名这场活动',
    advice: '先报名并通过审核，报名状态是「报名成功」才能签到',
    action: { text: '去我的报名看看', url: '/pages/mine/signups' }
  },
  40003: {
    title: '这场活动你已经签过到了',
    advice: '不用重复签到，签到时间可以在「我的报名」里查看',
    action: { text: '查看我的报名', url: '/pages/mine/signups' }
  },
  40004: {
    title: '现在不在签到时间内',
    advice: '签到在活动开始前 30 分钟开放，活动结束后 30 分钟关闭'
  },
  40005: {
    title: '不在签到范围内',
    advice: '这场活动要求定位签到，请到活动现场 200 米内再试，并允许小程序获取位置'
  },
  10003: {
    title: '请先绑定学号',
    advice: '绑定学号和姓名之后才能签到，否则无法记第二课堂学分',
    action: { text: '去绑定学号', url: '/pages/auth/bind' }
  },
  10001: {
    title: '登录已过期',
    advice: '重新登录一下再签到',
    action: { text: '去登录', url: '/pages/auth/login' }
  }
}

function resetState(): void {
  result.value = null
  failure.value = null
}

function pasteCode(): void {
  uni.getClipboardData({
    success: (res) => {
      const text = String(res.data || '').trim()
      if (!text) {
        uni.showToast({ title: '剪贴板是空的', icon: 'none' })
        return
      }
      token.value = text
      resetState()
    },
    fail: () => uni.showToast({ title: '读取剪贴板失败', icon: 'none' })
  })
}

function scanCode(): void {
  // #ifdef MP-WEIXIN
  uni.scanCode({
    success: (res) => {
      token.value = String(res.result || '').trim()
      resetState()
    },
    fail: () => uni.showToast({ title: '没有扫到码，可手动粘贴', icon: 'none' })
  })
  // #endif
  // #ifndef MP-WEIXIN
  uni.showToast({ title: 'H5 调试版不支持扫码，请用「粘贴」', icon: 'none' })
  // #endif
}

function locate(): void {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      position.value = { latitude: res.latitude, longitude: res.longitude }
      located.value = true
      uni.showToast({ title: '定位成功', icon: 'none' })
    },
    fail: () => {
      located.value = false
      uni.showToast({ title: '定位失败，请检查定位权限', icon: 'none' })
    }
  })
}

async function submit(): Promise<void> {
  if (!canSubmit.value) {
    uni.showToast({ title: '请先填写签到码', icon: 'none' })
    return
  }
  resetState()
  loading.value = true
  try {
    result.value = await api.checkin(token.value.trim(), position.value.latitude, position.value.longitude)
  } catch (err) {
    const error = err as ApiError
    const mapped = error.code ? ERROR_MAP[error.code] : undefined
    failure.value = mapped
      ? { code: error.code as number, ...mapped }
      : { code: error.code ?? 'ERR', title: error.message, advice: '可稍后重试，或联系活动组织者确认签到通道是否开启' }
  } finally {
    loading.value = false
  }
}

function go(url: string): void {
  if (!url) {
    // 「刷新后重试」就地把结果清掉，让人重新粘贴
    resetState()
    return
  }
  uni.navigateTo({ url })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 0 24rpx 60rpx;
  background: #f5f7f8;
}

.hero {
  margin: 0 -24rpx 24rpx;
  padding: 44rpx 32rpx 40rpx;
  background: linear-gradient(150deg, #12813f 0%, #22c55e 65%, #86efac 100%);
  border-radius: 0 0 32rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.hero-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #fff;
}

.hero-sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

.card {
  padding: 28rpx 24rpx;
  margin-bottom: 22rpx;
  border-radius: 20rpx;
  background: #fff;
}

.label {
  font-size: 26rpx;
  font-weight: 600;
  color: #1f2430;
}

.input {
  width: 100%;
  box-sizing: border-box;
  min-height: 140rpx;
  margin-top: 16rpx;
  padding: 20rpx;
  border-radius: 14rpx;
  background: #f4f7f5;
  font-size: 26rpx;
  color: #1f2430;
  line-height: 1.5;
}

.ph {
  color: #9aa3ad;
}

.row {
  display: flex;
  gap: 14rpx;
  margin: 20rpx 0 24rpx;
}

.chip {
  padding: 12rpx 26rpx;
  border-radius: 28rpx;
  background: #e7f6ec;
  color: #12813f;
  font-size: 24rpx;
}

.chip.on {
  background: #12813f;
  color: #fff;
}

.btn {
  height: 84rpx;
  line-height: 84rpx;
  text-align: center;
  border-radius: 42rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.btn.primary {
  background: linear-gradient(120deg, #12813f, #22c55e);
  color: #fff;
}

.btn.ghost {
  margin-top: 20rpx;
  background: #e7f6ec;
  color: #12813f;
}

.btn.disabled {
  opacity: 0.5;
}

.hint {
  display: block;
  margin-top: 18rpx;
  font-size: 22rpx;
  color: #8a9099;
  line-height: 1.5;
}

.ok-head {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f3f1;
}

.ok-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #e7f6ec;
  color: #12813f;
  font-size: 38rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ok-text {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.ok-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #12813f;
}

.ok-sub {
  font-size: 24rpx;
  color: #4a5560;
}

.ok-line {
  display: flex;
  justify-content: space-between;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #f5f7f6;
}

.ok-label {
  font-size: 25rpx;
  color: #8a9099;
}

.ok-value {
  font-size: 25rpx;
  color: #1f2430;
  font-weight: 600;
}

.fail-head {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.fail-code {
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  background: #fdecec;
  color: #dc2626;
  font-size: 22rpx;
  font-weight: 700;
}

.fail-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #dc2626;
}

.fail-advice {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  color: #4a5560;
  line-height: 1.6;
}

.tips {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #eef4f0;
}

.tips-title {
  font-size: 25rpx;
  font-weight: 600;
  color: #12813f;
}

.tips-item {
  font-size: 23rpx;
  color: #5b666f;
  line-height: 1.6;
}
</style>
