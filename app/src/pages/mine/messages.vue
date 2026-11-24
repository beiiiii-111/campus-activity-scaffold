<template>
  <view class="page">
    <view class="head">
      <text class="head-text">共 {{ records.length }} 条消息，{{ unread }} 条未读</text>
      <text class="read-all" @click="readAll">全部标为已读</text>
    </view>

    <view v-if="records.length" class="list">
      <view v-for="item in records" :key="item.id" class="msg" :class="{ unread: item.readFlag === 0 }" @click="onTap(item)">
        <view class="dot" v-if="item.readFlag === 0" />
        <view class="body">
          <view class="row">
            <text class="title">{{ item.title }}</text>
            <text class="time">{{ shortTime(item.createTime) }}</text>
          </view>
          <text class="content">{{ item.content }}</text>
        </view>
      </view>

      <view v-if="loading" class="tip">加载中…</view>
      <view v-else-if="finished" class="tip">没有更多了</view>
    </view>

    <EmptyState v-else-if="!loading" title="暂时没有消息" description="报名审核、签到结果会在这里通知" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import EmptyState from '../../components/EmptyState.vue'
import { api } from '../../utils/api'
import type { SysNotice } from '../../types'

const records = ref<SysNotice[]>([])
const page = ref(1)
const size = 10
const loading = ref(false)
const finished = ref(false)

const unread = ref(0)

async function load(reset = false): Promise<void> {
  if (loading.value) return
  loading.value = true
  try {
    const data = await api.messages({ page: page.value, size })
    records.value = reset ? data.records : records.value.concat(data.records)
    finished.value = records.value.length >= Number(data.total)
    unread.value = records.value.filter((item) => item.readFlag === 0).length
  } finally {
    loading.value = false
  }
}

function shortTime(value?: string): string {
  if (!value) return ''
  return value.replace('T', ' ').slice(5, 16)
}

async function onTap(item: SysNotice): Promise<void> {
  if (item.readFlag === 0) {
    await api.markRead([item.id])
    item.readFlag = 1
    unread.value = records.value.filter((row) => row.readFlag === 0).length
  }
  // 消息带 bizId 时跳到对应活动，没带就只展示内容
  if (item.bizId) {
    uni.navigateTo({ url: `/pages/activity/detail?id=${item.bizId}` })
  }
}

async function readAll(): Promise<void> {
  if (unread.value === 0) return
  await api.markRead(null)
  records.value.forEach((item) => {
    item.readFlag = 1
  })
  unread.value = 0
  uni.showToast({ title: '已全部标为已读', icon: 'none' })
}

onLoad(() => load(true))

onReachBottom(() => {
  if (finished.value || loading.value) return
  page.value += 1
  load()
})

onPullDownRefresh(async () => {
  page.value = 1
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

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rpx 6rpx 18rpx;
}

.head-text {
  font-size: 23rpx;
  color: #9aa0aa;
}

.read-all {
  font-size: 23rpx;
  color: #16a34a;
}

.msg {
  position: relative;
  display: flex;
  gap: 16rpx;
  padding: 22rpx 24rpx;
  margin-bottom: 16rpx;
  border-radius: 20rpx;
  background: #fff;
}

.msg.unread {
  background: #fbfefc;
  box-shadow: inset 4rpx 0 0 #22c55e;
}

.dot {
  width: 14rpx;
  height: 14rpx;
  margin-top: 10rpx;
  border-radius: 50%;
  background: #ef4444;
  flex: 0 0 14rpx;
}

.body {
  flex: 1;
  min-width: 0;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2430;
}

.time {
  font-size: 21rpx;
  color: #a6adb5;
}

.content {
  display: block;
  margin-top: 10rpx;
  font-size: 25rpx;
  color: #6b7280;
  line-height: 1.6;
}

.tip {
  padding: 24rpx 0;
  text-align: center;
  font-size: 23rpx;
  color: #9aa0aa;
}
</style>
