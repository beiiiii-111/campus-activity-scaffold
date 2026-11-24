<template>
  <view class="card" @click="emit('click', activity)">
    <view class="cover" :style="coverStyle">
      <image v-if="activity.coverUrl" :src="activity.coverUrl" mode="aspectFill" class="cover-img" />
      <text v-else class="cover-text">{{ (activity.categoryName || '活动').slice(0, 2) }}</text>
      <view v-if="activity.score" class="score">+{{ activity.score }}分</view>
    </view>

    <view class="body">
      <text class="title">{{ activity.title }}</text>
      <view class="line">
        <text class="time">{{ shortTime(activity.startTime) }}</text>
        <text class="dot">·</text>
        <text class="place">{{ activity.locationName || '地点待定' }}</text>
      </view>
      <view class="line">
        <text class="cat">{{ activity.categoryName || '未分类' }}</text>
        <text class="count">{{ activity.signedCount || 0 }}/{{ activity.capacity || '不限' }} 人</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ActivityItem } from '../types'

/**
 * 活动卡片。
 * 复用点：首页「即将开始」列表、活动列表页各用一次；列表页多传 showStatus 用来显示状态。
 */
const props = withDefaults(
  defineProps<{
    activity: ActivityItem
    showStatus?: boolean
  }>(),
  { showStatus: false }
)

const emit = defineEmits<{ click: [activity: ActivityItem] }>()

const coverStyle = computed(() => {
  if (props.activity.coverUrl) return {}
  return { background: 'linear-gradient(135deg, #d1f0dc, #86efac)' }
})

/** 2026-11-27 19:00:00 → 11-27 19:00 */
function shortTime(value?: string | null): string {
  if (!value) return '时间待定'
  const text = value.replace('T', ' ')
  return text.slice(5, 16)
}
</script>

<style scoped>
.card {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
}

.cover {
  position: relative;
  width: 168rpx;
  height: 168rpx;
  flex: 0 0 168rpx;
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.cover-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #12813f;
}

.score {
  position: absolute;
  right: 8rpx;
  bottom: 8rpx;
  padding: 2rpx 10rpx;
  border-radius: 20rpx;
  background: rgba(180, 83, 9, 0.9);
  color: #fff;
  font-size: 20rpx;
}

.body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8rpx;
}

.title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2430;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.line {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 23rpx;
  color: #6b7280;
}

.time {
  color: #12813f;
  font-weight: 500;
}

.dot {
  color: #c7cdd4;
}

.place {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cat {
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  background: #edf9f1;
  color: #12813f;
  font-size: 20rpx;
}

.count {
  margin-left: auto;
  color: #9aa0aa;
  font-size: 22rpx;
}
</style>
