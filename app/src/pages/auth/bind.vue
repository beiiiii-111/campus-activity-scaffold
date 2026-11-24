<template>
  <view class="page">
    <view class="head">
      <text class="title">绑定学号</text>
      <text class="sub">学号用于签到核对与第二课堂积分，请填写真实信息</text>
    </view>

    <view class="card">
      <view class="field">
        <text class="label">学号 <text class="req">*</text></text>
        <input v-model="form.studentNo" class="input" placeholder="例如 2023001" />
      </view>
      <view class="field">
        <text class="label">姓名 <text class="req">*</text></text>
        <input v-model="form.realName" class="input" placeholder="与学籍一致的真实姓名" />
      </view>
      <view class="field">
        <text class="label">学院</text>
        <input v-model="form.college" class="input" placeholder="例如 计算机学院" />
      </view>
      <view class="field">
        <text class="label">年级</text>
        <input v-model="form.grade" class="input" type="number" placeholder="例如 2023" />
      </view>
      <view class="field">
        <text class="label">专业</text>
        <input v-model="form.major" class="input" placeholder="例如 软件工程" />
      </view>
    </view>

    <button class="submit" :class="{ disabled: !canSubmit || submitting }" @click="submit">
      {{ submitting ? '提交中…' : '保存并继续' }}
    </button>

    <text class="skip" @click="skip">先不绑定，去逛逛</text>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '../../utils/api'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const submitting = ref(false)

const form = reactive({
  studentNo: '',
  realName: '',
  college: '',
  grade: '',
  major: ''
})

const canSubmit = computed(() => form.studentNo.trim().length >= 4 && form.realName.trim().length >= 2)

async function submit(): Promise<void> {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  try {
    const user = await api.bind({
      studentNo: form.studentNo.trim(),
      realName: form.realName.trim(),
      college: form.college.trim() || undefined,
      grade: form.grade.trim() || undefined,
      major: form.major.trim() || undefined
    })
    userStore.updateUser(user)
    uni.showToast({ title: '绑定成功', icon: 'success' })
    setTimeout(() => {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 })
      } else {
        uni.switchTab({ url: '/pages/index/index' })
      }
    }, 600)
  } finally {
    submitting.value = false
  }
}

function skip(): void {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 })
  } else {
    uni.switchTab({ url: '/pages/index/index' })
  }
}

onLoad(() => {
  // 已经绑定过的用户进来时先带出旧信息，方便修改
  const user = userStore.user
  if (user) {
    form.studentNo = user.studentNo || ''
    form.realName = user.realName || ''
    form.college = user.college || ''
    form.grade = user.grade || ''
    form.major = user.major || ''
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx 24rpx 60rpx;
  background: #f5f7f8;
}

.head {
  padding: 10rpx 6rpx 24rpx;
}

.title {
  display: block;
  font-size: 38rpx;
  font-weight: 700;
  color: #14301f;
}

.sub {
  display: block;
  margin-top: 10rpx;
  font-size: 23rpx;
  color: #8a9099;
}

.card {
  padding: 10rpx 24rpx;
  border-radius: 20rpx;
  background: #fff;
}

.field {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f1f4f2;
}

.field:last-child {
  border-bottom: none;
}

.label {
  display: block;
  font-size: 23rpx;
  color: #9aa0aa;
  margin-bottom: 8rpx;
}

.req {
  color: #dc2626;
}

.input {
  height: 58rpx;
  font-size: 29rpx;
  color: #1f2430;
}

.submit {
  margin-top: 36rpx;
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

.skip {
  display: block;
  margin-top: 26rpx;
  text-align: center;
  font-size: 24rpx;
  color: #9aa0aa;
}
</style>
