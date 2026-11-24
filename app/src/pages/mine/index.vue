<template>
  <view class="page">
    <!-- 头部：登录后显示昵称与学籍，未登录引导去登录 -->
    <view class="header">
      <view class="bubble" />
      <view class="profile">
        <view class="avatar">{{ (user.realName || user.nickname || '游').slice(0, 1) }}</view>
        <view class="info">
          <text class="name">{{ store.isLogin ? (user.realName || user.nickname) : '未登录' }}</text>
          <text class="desc" v-if="store.isLogin">
            {{ user.bound ? `${user.studentNo} · ${user.college || '未填学院'}` : '还没绑定学号，无法报名活动' }}
          </text>
          <text class="desc" v-else>登录后可以报名活动、看报名记录</text>
        </view>
        <view v-if="!store.isLogin" class="login-btn" @click="goLogin">去登录</view>
      </view>

      <view class="stats" v-if="store.isLogin">
        <view class="stat">
          <text class="stat-num">{{ signupTotal }}</text>
          <text class="stat-label">我的报名</text>
        </view>
        <view class="stat">
          <text class="stat-num">{{ unread }}</text>
          <text class="stat-label">未读消息</text>
        </view>
        <view class="stat">
          <text class="stat-num">{{ user.bound ? '已绑定' : '未绑定' }}</text>
          <text class="stat-label">学号状态</text>
        </view>
      </view>
    </view>

    <SectionTitle title="我的服务" />
    <view class="menu">
      <view class="menu-item" @click="go('/pages/mine/signups')">
        <view class="icon green">报</view>
        <text class="menu-text">我的报名</text>
        <text class="arrow">›</text>
      </view>
      <!-- 现场签到入口：签到码由组织者核销台出示，学生粘贴或扫码 -->
      <view class="menu-item" @click="go('/pages/checkin/scan')">
        <view class="icon teal">签</view>
        <text class="menu-text">扫码签到</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="go('/pages/mine/messages')">
        <view class="icon orange">消</view>
        <text class="menu-text">消息中心</text>
        <view v-if="unread > 0" class="badge">{{ unread > 99 ? '99+' : unread }}</view>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="go('/pages/auth/bind')">
        <view class="icon blue">学</view>
        <text class="menu-text">{{ user.bound ? '修改学籍信息' : '绑定学号' }}</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <view v-if="store.isLogin" class="logout" @click="logout">退出登录</view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import SectionTitle from '../../components/SectionTitle.vue'
import { api } from '../../utils/api'
import { useUserStore } from '../../stores/user'
import type { UserInfo } from '../../types'

const store = useUserStore()
const signupTotal = ref(0)
const unread = ref(0)

const user = computed<UserInfo>(() => store.user || ({} as UserInfo))

async function load(): Promise<void> {
  if (!store.isLogin) {
    signupTotal.value = 0
    unread.value = 0
    return
  }
  const [signups, unreadData, profile] = await Promise.all([
    api.mySignups({ page: 1, size: 1 }).catch(() => ({ total: 0 })),
    api.unreadCount().catch(() => ({ count: 0 })),
    api.profile().catch(() => null)
  ])
  signupTotal.value = Number((signups as { total: number | string }).total || 0)
  unread.value = Number(unreadData.count || 0)
  // 顺带刷新一次资料，学号绑定后在别的页面改了这里也能同步
  if (profile) store.updateUser(profile)
}

function go(url: string): void {
  if (!store.isLogin) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  uni.navigateTo({ url })
}

function goLogin(): void {
  uni.navigateTo({ url: '/pages/auth/login' })
}

function logout(): void {
  uni.showModal({
    title: '退出登录',
    content: '退出后需要重新登录才能报名活动',
    success: async (res) => {
      if (!res.confirm) return
      await api.logout().catch(() => undefined)
      store.logout()
      uni.showToast({ title: '已退出', icon: 'none' })
      load()
    }
  })
}

onShow(load)
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 0 24rpx 60rpx;
  background: #f5f7f8;
}

.header {
  position: relative;
  margin: 0 -24rpx;
  padding: 40rpx 24rpx 28rpx;
  background: linear-gradient(150deg, #12813f 0%, #22c55e 60%, #86efac 100%);
  border-radius: 0 0 32rpx 32rpx;
  overflow: hidden;
}

.bubble {
  position: absolute;
  width: 260rpx;
  height: 260rpx;
  right: -70rpx;
  top: -100rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
}

.profile {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar {
  width: 108rpx;
  height: 108rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #12813f;
  font-size: 42rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.name {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
}

.desc {
  font-size: 23rpx;
  color: rgba(255, 255, 255, 0.88);
}

.login-btn {
  padding: 12rpx 30rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.92);
  color: #12813f;
  font-size: 24rpx;
  font-weight: 600;
}

.stats {
  display: flex;
  margin-top: 28rpx;
  padding: 20rpx 0;
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
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 21rpx;
  color: rgba(255, 255, 255, 0.85);
}

.menu {
  border-radius: 20rpx;
  background: #fff;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 26rpx 24rpx;
  border-bottom: 1rpx solid #f3f5f4;
}

.menu-item:last-child {
  border-bottom: none;
}

.icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 16rpx;
  font-size: 26rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon.green {
  background: #e7f6ec;
  color: #12813f;
}

.icon.orange {
  background: #fff5e6;
  color: #b45309;
}

.icon.blue {
  background: #e8f1fd;
  color: #1d4ed8;
}

.icon.teal {
  background: #e6f7f4;
  color: #0f766e;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #1f2430;
}

.badge {
  min-width: 36rpx;
  height: 36rpx;
  padding: 0 10rpx;
  border-radius: 18rpx;
  background: #ef4444;
  color: #fff;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow {
  font-size: 32rpx;
  color: #c7cdd4;
}

.logout {
  margin-top: 40rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 44rpx;
  background: #fff;
  color: #dc2626;
  font-size: 28rpx;
}
</style>
