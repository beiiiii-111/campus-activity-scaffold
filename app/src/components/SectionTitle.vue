<template>
  <view class="section">
    <view class="left">
      <view class="bar" />
      <text class="title">{{ title }}</text>
      <text v-if="subtitle" class="subtitle">{{ subtitle }}</text>
    </view>
    <view class="right" @click="emit('more')">
      <slot name="extra">
        <text v-if="more" class="more">全部 ›</text>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 分区标题。
 * 复用点：首页（热门活动 / 即将开始）、我的页（我的服务）共三处，标题样式不再重复写。
 */
const emit = defineEmits<{ more: [] }>()

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    more?: boolean
  }>(),
  { subtitle: '', more: false }
)
</script>

<style scoped>
.section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 28rpx 0 16rpx;
}

.left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.bar {
  width: 8rpx;
  height: 30rpx;
  border-radius: 4rpx;
  background: linear-gradient(180deg, #22c55e, #16a34a);
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2430;
}

.subtitle {
  font-size: 22rpx;
  color: #9aa0aa;
}

.more {
  font-size: 24rpx;
  color: #16a34a;
}
</style>
