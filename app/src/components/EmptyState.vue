<template>
  <view class="empty">
    <view class="circle">空</view>
    <text class="title">{{ title }}</text>
    <text v-if="description" class="desc">{{ description }}</text>
  </view>
</template>

<script setup lang="ts">
/**
 * 空状态占位。
 * 复用点：首页、活动列表、我的报名、消息四个页面，文案由各页传入。
 */
withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  { title: '暂时没有内容', description: '' }
)
</script>

<style scoped>
.empty {
  padding: 80rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
}

.circle {
  width: 108rpx;
  height: 108rpx;
  border-radius: 50%;
  background: #edf9f1;
  color: #4cbf74;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 27rpx;
  color: #6b7280;
}

.desc {
  font-size: 23rpx;
  color: #9aa0aa;
}
</style>
