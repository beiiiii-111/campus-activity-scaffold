<template>
  <view class="page">
    <!-- 无权限：学生账户直接输 URL 进来会看到这屏，后端返回 403/10002 -->
    <view v-if="forbidden" class="deny">
      <view class="deny-code">403</view>
      <text class="deny-title">没有组织者权限</text>
      <text class="deny-sub">这个页面只对活动组织者开放，当前账号是学生身份。如需发布活动，请联系管理员分配组织者角色。</text>
      <view class="btn ghost" @click="back">返回上一页</view>
    </view>

    <template v-else>
      <view class="hero">
        <view class="hero-top">
          <view class="hero-text">
            <text class="hero-title">组织者工作台</text>
            <text class="hero-sub">{{ orgName }}</text>
          </view>
          <view class="hero-btn" @click="go('/pages/org/publish')">发布活动</view>
        </view>
        <view class="stats">
          <view class="stat">
            <text class="stat-num">{{ num(dashboard?.activityTotal) }}</text>
            <text class="stat-label">活动总数</text>
          </view>
          <view class="stat">
            <text class="stat-num">{{ num(dashboard?.publishedCount) }}</text>
            <text class="stat-label">已发布</text>
          </view>
          <view class="stat">
            <text class="stat-num">{{ num(dashboard?.pendingAuditCount) }}</text>
            <text class="stat-label">待审核</text>
          </view>
          <view class="stat">
            <text class="stat-num">{{ num(dashboard?.totalSignup) }}</text>
            <text class="stat-label">累计报名</text>
          </view>
        </view>
      </view>

      <SectionTitle title="我的活动" subtitle="点「签到码」出示给同学扫，点「报名」看名单" />

      <view v-if="loading" class="empty">加载中…</view>
      <view v-else-if="activities.length === 0" class="empty">还没有活动，先发布一场试试</view>

      <view v-for="item in activities" :key="item.id" class="row">
        <view class="row-main">
          <view class="row-head">
            <text class="row-title">{{ item.title }}</text>
            <text class="tag" :class="'s' + item.status">{{ item.statusLabel }}</text>
          </view>
          <text class="row-meta">{{ item.startTime }} · {{ item.locationName }}</text>
          <text class="row-meta">已报名 {{ item.signedCount }} / {{ item.capacity || '不限' }} 人</text>
        </view>
        <view class="row-actions">
          <view class="mini" @click="openQr(item)">签到码</view>
          <view class="mini ghost" @click="openSignups(item)">报名</view>
        </view>
      </view>
    </template>

    <!-- 签到码弹层：动态码 + 倒计时 + 到场概览 -->
    <view v-if="qrVisible" class="mask" @click="closeQr">
      <view class="sheet" @click.stop>
        <view class="sheet-head">
          <text class="sheet-title">现场核销码</text>
          <text class="sheet-close" @click="closeQr">✕</text>
        </view>
        <text class="sheet-sub">{{ qr?.activityTitle }}</text>
        <view class="code-box">
          <text class="code">{{ qr?.token || '获取中…' }}</text>
        </view>
        <view class="code-foot">
          <text class="code-tip">{{ countdown }} 秒后自动刷新</text>
          <text class="code-copy" @click="copyCode">复制 code</text>
        </view>
        <view class="sheet-stats">
          <view class="sheet-stat">
            <text class="sheet-num">{{ qr?.signedCount ?? 0 }}</text>
            <text class="sheet-label">报名成功</text>
          </view>
          <view class="sheet-stat">
            <text class="sheet-num">{{ qr?.checkedInCount ?? 0 }}</text>
            <text class="sheet-label">已签到</text>
          </view>
        </view>
        <view class="recent">
          <text class="recent-title">最近签到</text>
          <text class="recent-item">{{ recentText }}</text>
        </view>
      </view>
    </view>

    <!-- 报名名单弹层 -->
    <view v-if="signupVisible" class="mask" @click="signupVisible = false">
      <view class="sheet tall" @click.stop>
        <view class="sheet-head">
          <text class="sheet-title">报名名单</text>
          <text class="sheet-close" @click="signupVisible = false">✕</text>
        </view>
        <text class="sheet-sub">{{ current?.title }} · 共 {{ signups.length }} 人</text>
        <scroll-view scroll-y class="list">
          <view v-for="s in signups" :key="s.id" class="signup">
            <view class="signup-main">
              <text class="signup-name">{{ s.realName || '同学' }}</text>
              <text class="signup-no">{{ s.studentNo || '未绑定学号' }}</text>
            </view>
            <view class="signup-right">
              <text class="signup-status">{{ s.statusLabel }}</text>
              <text v-if="s.checkinTime" class="signup-time">{{ s.checkinTime }}</text>
            </view>
          </view>
          <view v-if="signups.length === 0" class="empty">还没有人报名</view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import SectionTitle from '../../components/SectionTitle.vue'
import { api } from '../../utils/api'
import { useUserStore } from '../../stores/user'
import type { ActivityItem, CheckinQr, OrgDashboard, SignupDetail } from '../../types'
import type { ApiError } from '../../utils/request'

const store = useUserStore()

const dashboard = ref<OrgDashboard | null>(null)
const activities = ref<ActivityItem[]>([])
const loading = ref(false)
const forbidden = ref(false)

const qr = ref<CheckinQr | null>(null)
const qrVisible = ref(false)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const signups = ref<SignupDetail[]>([])
const signupVisible = ref(false)
const current = ref<ActivityItem | null>(null)

const orgName = computed(() => store.user?.orgName || store.user?.nickname || '当前组织')
const recentText = computed(() => {
  const list = qr.value?.recentCheckins || []
  return list.length ? list.join('、') : '还没有人签到'
})

/** 后端 Long 序列化成字符串，展示前统一转数字 */
function num(value: number | string | undefined): number {
  return Number(value || 0)
}

async function load(): Promise<void> {
  loading.value = true
  forbidden.value = false
  try {
    const [data, page] = await Promise.all([api.orgDashboard(), api.orgActivities({ page: 1, size: 50 })])
    dashboard.value = data
    activities.value = page.records || []
  } catch (err) {
    // 越权：后端 403 会带 code 10002，这里单独给一屏说明，而不是弹个 toast 就算
    const error = err as ApiError
    if (error.code === 10002 || error.status === 403) {
      forbidden.value = true
    }
  } finally {
    loading.value = false
  }
}

async function openQr(item: ActivityItem): Promise<void> {
  current.value = item
  qrVisible.value = true
  await refreshQr(item.id)
}

async function refreshQr(activityId?: number | string): Promise<void> {
  const id = activityId ?? current.value?.id
  if (!id) return
  try {
    const data = await api.checkinQr(id)
    qr.value = data
    countdown.value = Number(data.refreshSeconds || 30)
  } catch {
    qr.value = null
    countdown.value = 0
  }
}

/** 倒计时归零就重拉一次，和演示屏上的动态码保持同步 */
function startTimer(): void {
  stopTimer()
  timer = setInterval(() => {
    if (!qrVisible.value) return
    countdown.value -= 1
    if (countdown.value <= 0) {
      refreshQr()
    }
  }, 1000)
}

function stopTimer(): void {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}

function closeQr(): void {
  qrVisible.value = false
  qr.value = null
  stopTimer()
}

function copyCode(): void {
  if (!qr.value?.token) return
  uni.setClipboardData({
    data: qr.value.token,
    success: () => uni.showToast({ title: '签到码已复制', icon: 'none' })
  })
}

async function openSignups(item: ActivityItem): Promise<void> {
  current.value = item
  signupVisible.value = true
  signups.value = []
  try {
    const page = await api.orgSignups(item.id, { page: 1, size: 100 })
    signups.value = page.records || []
  } catch {
    signups.value = []
  }
}

function go(url: string): void {
  uni.navigateTo({ url })
}

function back(): void {
  uni.navigateBack({ delta: 1 })
}

onShow(() => {
  if (forbidden.value) return
  load()
  startTimer()
})

onUnmounted(stopTimer)
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 0 24rpx 60rpx;
  background: #f5f7f8;
}

.hero {
  margin: 0 -24rpx 24rpx;
  padding: 40rpx 28rpx 28rpx;
  background: linear-gradient(150deg, #12813f 0%, #22c55e 62%, #86efac 100%);
  border-radius: 0 0 32rpx 32rpx;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.hero-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
}

.hero-sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.86);
}

.hero-btn {
  padding: 12rpx 28rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.92);
  color: #12813f;
  font-size: 24rpx;
  font-weight: 600;
}

.stats {
  display: flex;
  margin-top: 28rpx;
  padding: 22rpx 0;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.18);
}

.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.stat-num {
  font-size: 34rpx;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 21rpx;
  color: rgba(255, 255, 255, 0.85);
}

.row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  margin-bottom: 18rpx;
  border-radius: 20rpx;
  background: #fff;
}

.row-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.row-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.row-title {
  flex: 1;
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2430;
}

.tag {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  background: #eef1f3;
  color: #5b666f;
}

.tag.s1 {
  background: #fff5e6;
  color: #b45309;
}

.tag.s2 {
  background: #fdecec;
  color: #dc2626;
}

.tag.s3,
.tag.s4 {
  background: #e7f6ec;
  color: #12813f;
}

.row-meta {
  font-size: 23rpx;
  color: #8a9099;
}

.row-actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.mini {
  padding: 10rpx 20rpx;
  border-radius: 24rpx;
  background: #12813f;
  color: #fff;
  font-size: 22rpx;
  text-align: center;
}

.mini.ghost {
  background: #e7f6ec;
  color: #12813f;
}

.empty {
  padding: 60rpx 0;
  text-align: center;
  font-size: 25rpx;
  color: #9aa3ad;
}

.mask {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(15, 23, 20, 0.45);
  display: flex;
  align-items: flex-end;
}

.sheet {
  width: 100%;
  box-sizing: border-box;
  padding: 28rpx 28rpx 40rpx;
  border-radius: 28rpx 28rpx 0 0;
  background: #fff;
}

.sheet.tall {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sheet-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1f2430;
}

.sheet-close {
  font-size: 30rpx;
  color: #9aa3ad;
}

.sheet-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #8a9099;
}

.code-box {
  margin-top: 24rpx;
  padding: 26rpx 20rpx;
  border-radius: 16rpx;
  background: #0f2c1c;
}

.code {
  font-size: 26rpx;
  color: #86efac;
  word-break: break-all;
  font-family: monospace;
}

.code-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14rpx;
}

.code-tip {
  font-size: 22rpx;
  color: #8a9099;
}

.code-copy {
  font-size: 22rpx;
  color: #12813f;
  font-weight: 600;
}

.sheet-stats {
  display: flex;
  margin-top: 22rpx;
  padding: 20rpx 0;
  border-radius: 16rpx;
  background: #f4f7f5;
}

.sheet-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.sheet-num {
  font-size: 34rpx;
  font-weight: 700;
  color: #12813f;
}

.sheet-label {
  font-size: 21rpx;
  color: #8a9099;
}

.recent {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.recent-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #1f2430;
}

.recent-item {
  font-size: 23rpx;
  color: #5b666f;
}

.list {
  flex: 1;
  margin-top: 18rpx;
}

.signup {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f3f5f4;
}

.signup-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.signup-name {
  font-size: 27rpx;
  color: #1f2430;
  font-weight: 600;
}

.signup-no {
  font-size: 22rpx;
  color: #9aa3ad;
}

.signup-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6rpx;
}

.signup-status {
  font-size: 23rpx;
  color: #12813f;
}

.signup-time {
  font-size: 21rpx;
  color: #9aa3ad;
}

.deny {
  margin-top: 120rpx;
  padding: 0 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.deny-code {
  font-size: 96rpx;
  font-weight: 800;
  color: #d5e4db;
}

.deny-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1f2430;
}

.deny-sub {
  font-size: 24rpx;
  color: #8a9099;
  line-height: 1.6;
  text-align: center;
}

.btn {
  margin-top: 20rpx;
  height: 84rpx;
  line-height: 84rpx;
  padding: 0 60rpx;
  text-align: center;
  border-radius: 42rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.btn.ghost {
  background: #e7f6ec;
  color: #12813f;
}
</style>
