<template>
  <view class="page">
    <view class="search-bar">
      <input v-model="keyword" class="search-input" placeholder="搜索活动名称 / 主办方" confirm-type="search"
        @confirm="search" />
      <text class="search-btn" @click="search">搜索</text>
    </view>

    <scroll-view class="scopes" scroll-x :show-scrollbar="false">
      <view v-for="item in scopes" :key="item.value" class="chip" :class="{ active: scope === item.value }"
        @click="switchScope(item.value)">
        {{ item.label }}
      </view>
    </scroll-view>

    <view class="sort-row">
      <text class="total">共 {{ total }} 个活动</text>
      <view class="sort">
        <text :class="{ on: sort === 'LATEST' }" @click="switchSort('LATEST')">最新</text>
        <text class="gap">|</text>
        <text :class="{ on: sort === 'HOT' }" @click="switchSort('HOT')">最热</text>
      </view>
    </view>

    <view class="list" v-if="records.length">
      <ActivityCard v-for="item in records" :key="item.id" :activity="item" @click="goDetail(item.id)" />
    </view>
    <EmptyState v-else-if="!loading" title="没有找到活动" description="换个关键词或时间范围试试" />

    <view v-if="loading" class="tip">加载中…</view>
    <view v-else-if="finished && records.length" class="tip">没有更多了</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import ActivityCard from '../../components/ActivityCard.vue'
import EmptyState from '../../components/EmptyState.vue'
import { api } from '../../utils/api'
import type { ActivityItem } from '../../types'

/** 时间范围：与后端 timeScope 参数一一对应 */
const scopes = [
  { label: '全部', value: '' },
  { label: '今天', value: 'TODAY' },
  { label: '本周', value: 'WEEK' },
  { label: '本月', value: 'MONTH' },
  { label: '已结束', value: 'ENDED' }
]

const records = ref<ActivityItem[]>([])
const total = ref(0)
const page = ref(1)
const size = 10
const loading = ref(false)
const finished = ref(false)

const keyword = ref('')
const scope = ref('')
const sort = ref<'LATEST' | 'HOT'>('LATEST')
const categoryId = ref<number | undefined>(undefined)

async function load(reset = false): Promise<void> {
  if (loading.value) return
  loading.value = true
  try {
    const data = await api.activities({
      page: page.value,
      size,
      keyword: keyword.value || undefined,
      categoryId: categoryId.value,
      timeScope: scope.value || undefined,
      sort: sort.value
    })
    total.value = Number(data.total)
    records.value = reset ? data.records : records.value.concat(data.records)
    finished.value = records.value.length >= total.value
  } finally {
    loading.value = false
  }
}

function reload(): void {
  page.value = 1
  finished.value = false
  load(true)
}

function search(): void {
  reload()
}

function switchScope(value: string): void {
  scope.value = value
  reload()
}

function switchSort(value: 'LATEST' | 'HOT'): void {
  sort.value = value
  reload()
}

function goDetail(id: number): void {
  uni.navigateTo({ url: `/pages/activity/detail?id=${id}` })
}

onLoad((options) => {
  if (options?.categoryId) categoryId.value = Number(options.categoryId)
  load(true)
})

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
  padding: 24rpx 24rpx 40rpx;
  background: #f5f7f8;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 0 24rpx;
  height: 76rpx;
  border-radius: 38rpx;
  background: #fff;
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: #1f2430;
}

.search-btn {
  font-size: 26rpx;
  color: #16a34a;
  font-weight: 600;
}

.scopes {
  white-space: nowrap;
  margin-top: 20rpx;
}

.chip {
  display: inline-block;
  padding: 12rpx 26rpx;
  margin-right: 14rpx;
  border-radius: 30rpx;
  background: #fff;
  color: #46564e;
  font-size: 25rpx;
}

.chip.active {
  background: #16a34a;
  color: #fff;
  font-weight: 600;
}

.sort-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 22rpx 0 14rpx;
}

.total {
  font-size: 23rpx;
  color: #9aa0aa;
}

.sort {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 24rpx;
  color: #8a9099;
}

.sort .on {
  color: #16a34a;
  font-weight: 600;
}

.gap {
  color: #d8dde2;
}

.list {
  margin-top: 4rpx;
}

.tip {
  padding: 26rpx 0;
  text-align: center;
  font-size: 23rpx;
  color: #9aa0aa;
}
</style>
