<template>
  <view class="page">
    <scroll-view class="tabs" scroll-x :show-scrollbar="false">
      <view v-for="item in tabs" :key="item.label" class="tab" :class="{ active: status === item.value }"
        @click="switchTab(item.value)">
        {{ item.label }}
      </view>
    </scroll-view>

    <view v-if="records.length" class="list">
      <view v-for="item in records" :key="item.id" class="card">
        <view class="card-head" @click="goDetail(item.activityId)">
          <text class="title">{{ item.activityTitle }}</text>
          <text class="status" :class="statusClass(item.status)">{{ item.statusLabel }}</text>
        </view>

        <view class="line" @click="goDetail(item.activityId)">
          <text class="label">时间</text>
          <text class="value">{{ item.startTime }} ~ {{ item.endTime }}</text>
        </view>
        <view class="line">
          <text class="label">地点</text>
          <text class="value">{{ item.locationName || '待定' }}</text>
        </view>
        <view class="line">
          <text class="label">报名号</text>
          <text class="value mono">{{ item.signupNo }}</text>
        </view>
        <view class="line" v-if="item.waitlistSeq > 0">
          <text class="label">候补序号</text>
          <text class="value">第 {{ item.waitlistSeq }} 位</text>
        </view>
        <view class="line" v-if="item.checkinTime">
          <text class="label">签到时间</text>
          <text class="value">{{ item.checkinTime }}</text>
        </view>

        <view class="actions">
          <button class="ghost" @click="goDetail(item.activityId)">活动详情</button>
          <button v-if="item.canCancel" class="danger" @click="cancel(item)">取消报名</button>
        </view>
      </view>

      <view v-if="loading" class="tip">加载中…</view>
      <view v-else-if="finished" class="tip">没有更多了</view>
    </view>

    <EmptyState v-else-if="!loading" title="还没有报名记录" description="去首页看看有什么活动" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import EmptyState from '../../components/EmptyState.vue'
import { api } from '../../utils/api'
import type { SignupItem } from '../../types'

const tabs = [
  { label: '全部', value: undefined },
  { label: '报名成功', value: 1 },
  { label: '已签到', value: 3 },
  { label: '候补中', value: 5 },
  { label: '已取消', value: 4 }
] as Array<{ label: string; value: number | undefined }>

const records = ref<SignupItem[]>([])
const status = ref<number | undefined>(undefined)
const page = ref(1)
const size = 10
const loading = ref(false)
const finished = ref(false)

async function load(reset = false): Promise<void> {
  if (loading.value) return
  loading.value = true
  try {
    const data = await api.mySignups({ page: page.value, size, status: status.value })
    records.value = reset ? data.records : records.value.concat(data.records)
    finished.value = records.value.length >= Number(data.total)
  } finally {
    loading.value = false
  }
}

function reload(): void {
  page.value = 1
  finished.value = false
  load(true)
}

function switchTab(value: number | undefined): void {
  status.value = value
  reload()
}

function statusClass(value: number): string {
  if (value === 1 || value === 6) return 'ok'
  if (value === 3) return 'done'
  if (value === 0 || value === 5) return 'wait'
  return 'off'
}

function goDetail(activityId: number): void {
  uni.navigateTo({ url: `/pages/activity/detail?id=${activityId}` })
}

function cancel(item: SignupItem): void {
  uni.showModal({
    title: '取消报名',
    content: `确定取消《${item.activityTitle}》的报名吗？`,
    success: async (res) => {
      if (!res.confirm) return
      await api.cancelSignup(item.id)
      uni.showToast({ title: '已取消', icon: 'success' })
      reload()
    }
  })
}

onLoad(() => load(true))

onReachBottom(() => {
  if (finished.value || loading.value) return
  page.value += 1
  load()
})

onPullDownRefresh(async () => {
  await load(true)
  uni.stopPullDownRefresh()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 20rpx 24rpx 40rpx;
  background: #f5f7f8;
}

.tabs {
  white-space: nowrap;
  margin-bottom: 16rpx;
}

.tab {
  display: inline-block;
  padding: 12rpx 26rpx;
  margin-right: 14rpx;
  border-radius: 30rpx;
  background: #fff;
  color: #46564e;
  font-size: 25rpx;
}

.tab.active {
  background: #16a34a;
  color: #fff;
  font-weight: 600;
}

.card {
  padding: 22rpx 24rpx;
  margin-bottom: 18rpx;
  border-radius: 20rpx;
  background: #fff;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 10rpx;
}

.title {
  flex: 1;
  font-size: 29rpx;
  font-weight: 600;
  color: #1f2430;
}

.status {
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
  font-size: 21rpx;
}

.status.ok {
  background: #e7f6ec;
  color: #12813f;
}

.status.done {
  background: #e8f1fd;
  color: #1d4ed8;
}

.status.wait {
  background: #fff5e6;
  color: #b45309;
}

.status.off {
  background: #f2f4f6;
  color: #8a9099;
}

.line {
  display: flex;
  gap: 16rpx;
  padding: 8rpx 0;
}

.label {
  width: 130rpx;
  flex: 0 0 130rpx;
  font-size: 23rpx;
  color: #9aa0aa;
}

.value {
  flex: 1;
  font-size: 24rpx;
  color: #46564e;
}

.mono {
  font-family: 'SF Mono', Consolas, monospace;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 14rpx;
}

.ghost,
.danger {
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 28rpx;
  margin: 0;
  border-radius: 32rpx;
  font-size: 24rpx;
}

.ghost {
  background: #f5f8f6;
  color: #12813f;
}

.danger {
  background: #fef2f2;
  color: #dc2626;
}

.tip {
  padding: 24rpx 0;
  text-align: center;
  font-size: 23rpx;
  color: #9aa0aa;
}
</style>
