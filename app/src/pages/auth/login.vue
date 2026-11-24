<template>
  <view class="page">
    <view class="hero">
      <view class="bubble" />
      <text class="title">手机号登录</text>
      <text class="sub">首次登录会自动创建账号，之后绑定学号即可报名活动</text>
    </view>

    <view class="card">
      <view class="field">
        <text class="label">手机号</text>
        <input v-model="phone" class="input" type="number" maxlength="11" placeholder="请输入 11 位手机号" />
      </view>

      <view class="field code-field">
        <text class="label">验证码</text>
        <input v-model="code" class="input" type="number" maxlength="6" placeholder="6 位数字验证码" />
        <text class="code-btn" :class="{ disabled: counting }" @click="sendCode">
          {{ counting ? `${countdown}s 后重发` : '获取验证码' }}
        </text>
      </view>

      <button class="submit" :class="{ disabled: !canSubmit || loading }" @click="submit">
        {{ loading ? '登录中…' : '登录' }}
      </button>

      <text class="tip">课堂演示环境使用 mock 短信通道，验证码会直接提示出来</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from '../../utils/api'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()

const phone = ref('')
const code = ref('')
const loading = ref(false)
const countdown = ref(0)

let timer: ReturnType<typeof setInterval> | null = null

const counting = computed(() => countdown.value > 0)
const canSubmit = computed(() => /^1\d{10}$/.test(phone.value) && code.value.length === 6)

function startCountdown(seconds: number): void {
  countdown.value = seconds
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

async function sendCode(): Promise<void> {
  if (counting.value) return
  if (!/^1\d{10}$/.test(phone.value)) {
    uni.showToast({ title: '手机号格式不对', icon: 'none' })
    return
  }
  const result = await api.sendSmsCode(phone.value)
  startCountdown(result.intervalSeconds || 60)
  if (result.mockCode) {
    // mock 通道把验证码带回来，直接填好并提示，省去课堂上看日志
    code.value = result.mockCode
    uni.showToast({ title: `验证码 ${result.mockCode}`, icon: 'none' })
  } else {
    uni.showToast({ title: '验证码已发送', icon: 'none' })
  }
}

async function submit(): Promise<void> {
  if (!canSubmit.value || loading.value) return
  loading.value = true
  try {
    const data = await api.smsLogin(phone.value, code.value)
    userStore.saveLogin(data.token, data.user)
    uni.showToast({ title: '登录成功', icon: 'success' })

    if (data.needBind) {
      uni.redirectTo({ url: '/pages/auth/bind' })
      return
    }
    // 有上一页就返回，没有就回首页
    const pages = getCurrentPages()
    if (pages.length > 1) {
      uni.navigateBack({ delta: 1 })
    } else {
      uni.switchTab({ url: '/pages/index/index' })
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f7f8;
}

.hero {
  position: relative;
  padding: 60rpx 40rpx 70rpx;
  background: linear-gradient(150deg, #12813f 0%, #22c55e 65%, #86efac 100%);
  overflow: hidden;
}

.bubble {
  position: absolute;
  width: 260rpx;
  height: 260rpx;
  border-radius: 50%;
  right: -80rpx;
  top: -90rpx;
  background: rgba(255, 255, 255, 0.16);
}

.title {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #fff;
}

.sub {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.6;
}

.card {
  margin: -40rpx 24rpx 0;
  padding: 30rpx 26rpx 26rpx;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 12rpx 40rpx rgba(20, 48, 31, 0.08);
}

.field {
  padding: 18rpx 0;
  border-bottom: 1rpx solid #f1f4f2;
}

.label {
  display: block;
  font-size: 23rpx;
  color: #9aa0aa;
  margin-bottom: 10rpx;
}

.input {
  height: 60rpx;
  font-size: 30rpx;
  color: #1f2430;
}

.code-field {
  position: relative;
}

.code-btn {
  position: absolute;
  right: 0;
  bottom: 26rpx;
  font-size: 24rpx;
  color: #16a34a;
  font-weight: 600;
}

.code-btn.disabled {
  color: #b6bcc3;
}

.submit {
  margin-top: 40rpx;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
}

.submit.disabled {
  background: #d8dee2;
}

.tip {
  display: block;
  margin-top: 22rpx;
  font-size: 21rpx;
  color: #a6adb5;
  text-align: center;
  line-height: 1.6;
}
</style>
