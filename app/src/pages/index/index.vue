<template>
  <view class="page">
    <view class="hero">
      <text class="hero-title">校园活动</text>
      <text class="hero-sub">学生端脚手架 · A01</text>
    </view>

    <view class="card">
      <text class="card-title">三端约定</text>
      <view v-for="item in ends" :key="item.port" class="row">
        <text class="row-name">{{ item.name }}</text>
        <text class="row-port">{{ item.port }}</text>
      </view>
    </view>

    <view class="card">
      <text class="card-title">本步骤完成的内容</text>
      <text class="line">· uni-app + Vue3 + TypeScript 工程可编译</text>
      <text class="line">· 页面路由与全局色板（绿色主色）就位</text>
      <text class="line">· /api 代理指向后端 8016，业务代码只写相对路径</text>
    </view>

    <text class="tip">下一步 A02：补齐类型定义与请求层，并联调 /api/ping</text>
  </view>
</template>

<script setup lang="ts">
interface EndItem {
  name: string
  port: string
}

const ends: EndItem[] = [
  { name: '后端接口', port: '8016' },
  { name: '管理后台', port: '5173' },
  { name: '学生端 H5', port: '5174' }
]
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 60rpx;
}

.hero {
  padding: 40rpx 32rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #12813f 0%, #22c55e 100%);
  display: flex;
  flex-direction: column;
}

.hero-title {
  color: #fff;
  font-size: 44rpx;
  font-weight: 600;
}

.hero-sub {
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.85);
  font-size: 24rpx;
}

.card {
  margin-top: 24rpx;
  padding: 28rpx 32rpx;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 6rpx 20rpx rgba(17, 24, 39, 0.05);
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
  border-bottom: 1rpx solid var(--line);
}

.row:last-child {
  border-bottom: none;
}

.row-name {
  color: var(--text-sub);
  font-size: 26rpx;
}

.row-port {
  color: var(--brand);
  font-size: 26rpx;
  font-weight: 600;
}

.line {
  margin-top: 12rpx;
  color: var(--text-sub);
  font-size: 26rpx;
  line-height: 1.6;
}

.tip {
  display: block;
  margin-top: 30rpx;
  text-align: center;
  color: #9aa0aa;
  font-size: 22rpx;
}
</style>
