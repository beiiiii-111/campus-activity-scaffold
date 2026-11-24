<template>
  <view class="page">
    <!-- 头部：渐变背景 + 搜索入口 -->
    <view class="hero">
      <view class="bubble bubble-1" />
      <view class="bubble bubble-2" />
      <view class="hero-top">
        <text class="hello">校园活动</text>
        <text class="date">{{ today }}</text>
      </view>
      <text class="slogan">发现今天值得去的一场</text>
      <view class="search" @click="goList()">
        <text class="search-icon">搜</text>
        <text class="search-text">搜索活动 / 主办方</text>
      </view>
    </view>

    <!-- 分类条 -->
    <scroll-view class="cats" scroll-x :show-scrollbar="false">
      <view class="cat-chip" :class="{ active: activeCategory === 0 }" @click="goList(0)">全部</view>
      <view v-for="item in categories" :key="item.id" class="cat-chip"
        :class="{ active: activeCategory === item.id }" @click="goList(item.id)">
        {{ item.name }}
      </view>
    </scroll-view>

    <!-- 热门横滑 -->
    <SectionTitle title="热门活动" subtitle="按报名人数" />
    <scroll-view v-if="hot.length" class="hot" scroll-x :show-scrollbar="false">
      <view v-for="(item, index) in hot" :key="item.id" class="hot-card" @click="goDetail(item.id)">
        <view class="hot-cover" :style="coverStyle(item)">
          <image v-if="item.coverUrl" :src="item.coverUrl" mode="aspectFill" class="hot-img" />
          <text v-else class="hot-text">{{ (item.categoryName || '活动').slice(0, 2) }}</text>
          <view class="rank" :class="{ top: index < 3 }">TOP{{ index + 1 }}</view>
        </view>
        <text class="hot-title">{{ item.title }}</text>
        <view class="hot-meta">
          <text class="hot-time">{{ shortTime(item.startTime) }}</text>
          <text class="hot-count">{{ item.signedCount || 0 }} 人已报名</text>
        </view>
      </view>
    </scroll-view>

    <!-- 即将开始 -->
    <SectionTitle title="即将开始" subtitle="按活动时间" :more="true" @more="goList()" />
    <view class="list" v-if="upcoming.length">
      <ActivityCard v-for="item in upcoming" :key="item.id" :activity="item" @click="goDetail(item.id)" />
    </view>
    <EmptyState v-else-if="!loading" title="暂时没有即将开始的活动" description="过两天再来看看" />

    <view v-if="loading" class="loading">加载中…</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import SectionTitle from '../../components/SectionTitle.vue'
import ActivityCard from '../../components/ActivityCard.vue'
import EmptyState from '../../components/EmptyState.vue'
import { api } from '../../utils/api'
import type { ActivityItem, Category } from '../../types'

const categories = ref<Category[]>([])
const hot = ref<ActivityItem[]>([])
const upcoming = ref<ActivityItem[]>([])
const loading = ref(false)
const activeCategory = 0

const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })

function coverStyle(item: ActivityItem): Record<string, string> {
  if (item.coverUrl) return {}
  return { background: 'linear-gradient(135deg, #12813f, #4ade80)' }
}

/** 2026-11-27 19:00:00 → 11-27 19:00 */
function shortTime(value?: string | null): string {
  if (!value) return ''
  return value.replace('T', ' ').slice(5, 16)
}

async function load(): Promise<void> {
  loading.value = true
  try {
    const [catList, hotList, page] = await Promise.all([
      api.categories().catch(() => []),
      api.hotActivities(5).catch(() => []),
      api.activities({ page: 1, size: 5 }).catch(() => ({ records: [], total: 0, page: 1, size: 5 }))
    ])
    categories.value = catList
    hot.value = hotList
    upcoming.value = page.records
  } finally {
    loading.value = false
  }
}

function goDetail(id: number): void {
  uni.navigateTo({ url: `/pages/activity/detail?id=${id}` })
}

function goList(categoryId?: number): void {
  const query = categoryId ? `?categoryId=${categoryId}` : ''
  uni.navigateTo({ url: `/pages/activity/list${query}` })
}

onLoad(load)
onPullDownRefresh(async () => {
  await load()
  uni.stopPullDownRefresh()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 0 24rpx 40rpx;
  background: #f5f7f8;
}

.hero {
  position: relative;
  margin: 0 -24rpx;
  padding: 32rpx 24rpx 28rpx;
  background: linear-gradient(140deg, #12813f 0%, #22c55e 60%, #86efac 100%);
  border-radius: 0 0 32rpx 32rpx;
  overflow: hidden;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
}

.bubble-1 {
  width: 220rpx;
  height: 220rpx;
  right: -60rpx;
  top: -80rpx;
}

.bubble-2 {
  width: 120rpx;
  height: 120rpx;
  right: 90rpx;
  bottom: -50rpx;
}

.hero-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.hello {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
}

.date {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.85);
}

.slogan {
  display: block;
  margin-top: 10rpx;
  font-size: 25rpx;
  color: rgba(255, 255, 255, 0.88);
}

.search {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 26rpx;
  padding: 0 24rpx;
  height: 76rpx;
  border-radius: 38rpx;
  background: rgba(255, 255, 255, 0.92);
}

.search-icon {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #edf9f1;
  color: #16a34a;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-text {
  font-size: 26rpx;
  color: #9aa0aa;
}

.cats {
  white-space: nowrap;
  margin-top: 20rpx;
}

.cat-chip {
  display: inline-block;
  padding: 12rpx 28rpx;
  margin-right: 14rpx;
  border-radius: 30rpx;
  background: #fff;
  color: #46564e;
  font-size: 25rpx;
}

.cat-chip.active {
  background: #16a34a;
  color: #fff;
  font-weight: 600;
}

.hot {
  white-space: nowrap;
}

.hot-card {
  display: inline-block;
  width: 320rpx;
  margin-right: 20rpx;
  padding: 16rpx;
  border-radius: 20rpx;
  background: #fff;
  vertical-align: top;
}

.hot-cover {
  position: relative;
  height: 180rpx;
  border-radius: 14rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hot-img {
  width: 100%;
  height: 100%;
}

.hot-text {
  color: #fff;
  font-size: 34rpx;
  font-weight: 600;
}

.rank {
  position: absolute;
  left: 10rpx;
  top: 10rpx;
  padding: 2rpx 12rpx;
  border-radius: 20rpx;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 20rpx;
}

.rank.top {
  background: rgba(180, 83, 9, 0.88);
}

.hot-title {
  display: block;
  margin-top: 12rpx;
  font-size: 27rpx;
  font-weight: 600;
  color: #1f2430;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8rpx;
}

.hot-time {
  font-size: 22rpx;
  color: #12813f;
}

.hot-count {
  font-size: 22rpx;
  color: #9aa0aa;
}

.list {
  margin-top: 4rpx;
}

.loading {
  padding: 30rpx 0;
  text-align: center;
  font-size: 24rpx;
  color: #9aa0aa;
}
</style>
