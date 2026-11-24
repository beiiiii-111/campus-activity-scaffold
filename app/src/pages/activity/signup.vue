<template>
  <view class="page">
    <!-- 报名成功：整页切换成结果卡 -->
    <view v-if="result" class="success">
      <view class="success-icon">√</view>
      <text class="success-title">报名提交成功</text>
      <text class="success-sub">{{ result.statusLabel || '已报名' }}，请按时参加</text>

      <view class="success-card">
        <view class="kv">
          <text class="k">活动</text>
          <text class="v">{{ result.activityTitle }}</text>
        </view>
        <view class="kv">
          <text class="k">报名号</text>
          <text class="v mono">{{ result.signupNo }}</text>
        </view>
        <view class="kv" v-if="result.waitlistSeq > 0">
          <text class="k">候补序号</text>
          <text class="v">第 {{ result.waitlistSeq }} 位</text>
        </view>
        <view class="kv">
          <text class="k">报名时间</text>
          <text class="v">{{ result.createTime }}</text>
        </view>
      </view>

      <view class="success-actions">
        <button class="ghost" @click="backDetail">返回活动</button>
        <button class="primary" @click="goMySignups">查看我的报名</button>
      </view>
    </view>

    <template v-else>
      <view class="card" v-if="activity.id">
        <text class="title">{{ activity.title }}</text>
        <view class="meta">
          <text class="meta-item">{{ activity.startTime }}</text>
          <text class="meta-item">{{ activity.locationName || '地点待定' }}</text>
        </view>
      </view>

      <!-- 身份信息：直接取自学号绑定结果，不允许在报名页临时编造 -->
      <view class="card">
        <text class="section">报名人信息</text>
        <view class="kv">
          <text class="k">姓名</text>
          <text class="v">{{ profile.realName || '未绑定' }}</text>
        </view>
        <view class="kv">
          <text class="k">学号</text>
          <text class="v">{{ profile.studentNo || '未绑定' }}</text>
        </view>
        <view class="kv">
          <text class="k">学院</text>
          <text class="v">{{ profile.college || '-' }}</text>
        </view>
        <view v-if="!profile.bound" class="bind-tip" @click="goBind">
          <text class="bind-text">还没有绑定学号，去绑定 ›</text>
        </view>
      </view>

      <!-- 组织者自定义字段：key / label / required / options 全部由后端下发 -->
      <view class="card" v-if="fields.length">
        <text class="section">补充信息</text>
        <view v-for="field in fields" :key="field.key" class="field">
          <text class="field-label">
            {{ field.label }}
            <text v-if="field.required" class="required">*</text>
          </text>

          <input v-if="field.type !== 'SINGLE'" v-model="answers[field.key]" class="input"
            :placeholder="`请填写${field.label}`" />

          <view v-else class="options">
            <view v-for="option in field.options || []" :key="option" class="option"
              :class="{ active: answers[field.key] === option }" @click="answers[field.key] = option">
              {{ option }}
            </view>
          </view>
        </view>
      </view>

      <view class="agree" @click="agreed = !agreed">
        <view class="checkbox" :class="{ checked: agreed }">{{ agreed ? '✓' : '' }}</view>
        <text class="agree-text">我已阅读并同意《活动报名须知》，承诺按时参加</text>
      </view>

      <button class="submit" :class="{ disabled: !agreed || submitting }" @click="submit">
        {{ submitting ? '提交中…' : '确认报名' }}
      </button>
    </template>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '../../utils/api'
import type { ActivityDetail, SignupItem, UserInfo } from '../../types'

interface FormFieldItem {
  key: string
  label: string
  type?: string
  required?: boolean
  options?: string[]
}

const activityId = ref<number | null>(null)
const activity = ref<ActivityDetail>({} as ActivityDetail)
const profile = ref<UserInfo>({} as UserInfo)
const fields = ref<FormFieldItem[]>([])
const answers = reactive<Record<string, string>>({})
const agreed = ref(false)
const submitting = ref(false)
const result = ref<SignupItem | null>(null)

function parseFields(raw?: string | null): FormFieldItem[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as FormFieldItem[]
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.key) : []
  } catch {
    // 后端存的是 JSON 字符串，脏数据不应该让报名页白屏
    return []
  }
}

async function load(): Promise<void> {
  if (!activityId.value) return
  const [detail, user] = await Promise.all([api.activityDetail(activityId.value), api.profile()])
  activity.value = detail
  profile.value = user
  fields.value = parseFields(detail.formFields)
}

async function submit(): Promise<void> {
  if (!agreed.value || submitting.value || !activityId.value) return

  for (const field of fields.value) {
    if (field.required && !answers[field.key]) {
      uni.showToast({ title: `请填写${field.label}`, icon: 'none' })
      return
    }
  }

  if (!profile.value.bound) {
    uni.showToast({ title: '请先绑定学号', icon: 'none' })
    goBind()
    return
  }

  submitting.value = true
  try {
    const formData = fields.value.length ? JSON.stringify(answers) : undefined
    result.value = await api.signup(activityId.value, formData)
    uni.showToast({ title: '报名成功', icon: 'success' })
  } finally {
    submitting.value = false
  }
}

function goBind(): void {
  uni.navigateTo({ url: '/pages/auth/bind' })
}

function goMySignups(): void {
  uni.navigateTo({ url: '/pages/mine/signups' })
}

function backDetail(): void {
  uni.navigateBack({ delta: 1 })
}

onLoad((options) => {
  activityId.value = options?.id ? Number(options.id) : null
  load()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 60rpx;
  background: #f5f7f8;
}

.card {
  padding: 24rpx;
  border-radius: 20rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2430;
}

.meta {
  display: flex;
  gap: 20rpx;
  margin-top: 12rpx;
}

.meta-item {
  font-size: 23rpx;
  color: #6b7280;
}

.section {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2430;
  margin-bottom: 10rpx;
}

.kv {
  display: flex;
  justify-content: space-between;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f3f5f4;
}

.kv:last-child {
  border-bottom: none;
}

.k {
  font-size: 25rpx;
  color: #9aa0aa;
}

.v {
  font-size: 26rpx;
  color: #1f2430;
}

.mono {
  font-family: 'SF Mono', Consolas, monospace;
  letter-spacing: 1rpx;
}

.bind-tip {
  margin-top: 10rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  background: #fff7ed;
}

.bind-text {
  font-size: 24rpx;
  color: #b45309;
}

.field {
  padding: 16rpx 0;
}

.field-label {
  display: block;
  font-size: 25rpx;
  color: #46564e;
  margin-bottom: 12rpx;
}

.required {
  color: #dc2626;
  margin-left: 4rpx;
}

.input {
  height: 76rpx;
  padding: 0 20rpx;
  border-radius: 12rpx;
  background: #f7f9f8;
  font-size: 26rpx;
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.option {
  padding: 12rpx 30rpx;
  border-radius: 28rpx;
  background: #f7f9f8;
  color: #46564e;
  font-size: 25rpx;
}

.option.active {
  background: #16a34a;
  color: #fff;
  font-weight: 600;
}

.agree {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
  padding: 10rpx 6rpx 24rpx;
}

.checkbox {
  width: 34rpx;
  height: 34rpx;
  flex: 0 0 34rpx;
  margin-top: 2rpx;
  border-radius: 8rpx;
  border: 2rpx solid #c7cdd4;
  color: #fff;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background: #16a34a;
  border-color: #16a34a;
}

.agree-text {
  font-size: 23rpx;
  color: #6b7280;
  line-height: 1.6;
}

.submit {
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
}

.submit.disabled {
  background: #d8dee2;
}

/* 成功态 */
.success {
  padding: 80rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.success-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #e7f6ec;
  color: #16a34a;
  font-size: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-title {
  margin-top: 24rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #14301f;
}

.success-sub {
  margin-top: 10rpx;
  font-size: 25rpx;
  color: #6b7280;
}

.success-card {
  width: 100%;
  margin-top: 36rpx;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  background: #fff;
}

.success-actions {
  display: flex;
  gap: 20rpx;
  width: 100%;
  margin-top: 40rpx;
}

.ghost,
.primary {
  flex: 1;
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 42rpx;
  font-size: 27rpx;
}

.ghost {
  background: #fff;
  color: #16a34a;
  border: 2rpx solid #bfe8cd;
}

.primary {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  border: none;
}
</style>
