<template>
  <view class="page">
    <view class="card">
      <text class="label">活动封面</text>
      <view class="cover" @click="chooseCover">
        <image v-if="coverUrl" :src="coverUrl" class="cover-img" mode="aspectFill" />
        <view v-else class="cover-empty">
          <text class="cover-plus">+</text>
          <text class="cover-tip">上传封面（jpg/png/webp，≤ 2MB）</text>
        </view>
        <view v-if="uploading" class="cover-mask">上传中…</view>
      </view>
      <text class="hint">选图后先在前端校验格式和大小，不合格直接拦下，不浪费一次上传请求</text>
    </view>

    <view class="card">
      <view class="field">
        <text class="label">活动标题<text class="req">*</text></text>
        <input v-model="form.title" class="input" placeholder="例如：AI 工具效率工作坊" placeholder-class="ph" />
      </view>
      <view class="field">
        <text class="label">活动分类</text>
        <picker :range="categoryNames" @change="onCategory">
          <view class="input picker">{{ categoryNames[categoryIndex] || '请选择分类' }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="label">活动地点<text class="req">*</text></text>
        <input v-model="form.locationName" class="input" placeholder="例如：图书馆报告厅" placeholder-class="ph" />
      </view>
      <view class="field">
        <text class="label">人数上限（0 表示不限）</text>
        <input v-model="form.capacity" class="input" type="number" placeholder="50" placeholder-class="ph" />
      </view>
    </view>

    <view class="card">
      <text class="label">活动时间</text>
      <view class="time-row">
        <picker mode="date" :value="form.startDate" @change="onStartDate">
          <view class="input picker">{{ form.startDate }}</view>
        </picker>
        <picker mode="time" :value="form.startTime" @change="onStartTime">
          <view class="input picker">{{ form.startTime }}</view>
        </picker>
      </view>
      <view class="time-row">
        <picker mode="date" :value="form.endDate" @change="onEndDate">
          <view class="input picker">{{ form.endDate }}</view>
        </picker>
        <picker mode="time" :value="form.endTime" @change="onEndTime">
          <view class="input picker">{{ form.endTime }}</view>
        </picker>
      </view>
      <text class="hint">报名窗口自动生成：现在 ~ 活动开始前 30 分钟；签到码在活动开始前 30 分钟生效</text>
    </view>

    <view class="card">
      <view class="field">
        <text class="label">第二课堂分值</text>
        <input v-model="form.score" class="input" type="digit" placeholder="0.5" placeholder-class="ph" />
      </view>
      <view class="field">
        <text class="label">分值类别</text>
        <picker :range="scoreTypeNames" @change="onScoreType">
          <view class="input picker">{{ scoreTypeNames[form.scoreType - 1] }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="label">活动简介</text>
        <textarea v-model="form.summary" class="textarea" auto-height placeholder="一两句话说明活动内容" placeholder-class="ph" />
      </view>
    </view>

    <view class="btn primary" :class="{ disabled: submitting }" @click="submit">
      {{ submitting ? '提交中…' : '提交发布' }}
    </view>
    <text class="foot-tip">提交后进入待审核状态，管理员审核通过才会在学生端展示</text>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '../../utils/api'
import { uploadFile } from '../../utils/request'
import type { Category } from '../../types'

const MAX_SIZE = 2 * 1024 * 1024
const ALLOWED = ['jpg', 'jpeg', 'png', 'webp']

const coverUrl = ref('')
const uploading = ref(false)
const submitting = ref(false)
const categories = ref<Category[]>([])
const categoryIndex = ref(-1)

const scoreTypeNames = ['思想成长', '社会实践及志愿服务', '创新创业', '文体活动']

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function dateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function timeStr(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const tomorrow = new Date(Date.now() + 24 * 3600 * 1000)

const form = reactive({
  title: '',
  locationName: '',
  capacity: '50',
  score: '0.5',
  scoreType: 1,
  summary: '',
  startDate: dateStr(tomorrow),
  startTime: '14:00',
  endDate: dateStr(tomorrow),
  endTime: '16:00'
})

const categoryNames = computed(() => categories.value.map((c) => c.name))

function onCategory(e: { detail: { value: number | string } }): void {
  categoryIndex.value = Number(e.detail.value)
}

function onScoreType(e: { detail: { value: number | string } }): void {
  form.scoreType = Number(e.detail.value) + 1
}

function onStartDate(e: { detail: { value: string } }): void {
  form.startDate = String(e.detail.value)
}

function onStartTime(e: { detail: { value: string } }): void {
  form.startTime = String(e.detail.value)
}

function onEndDate(e: { detail: { value: string } }): void {
  form.endDate = String(e.detail.value)
}

function onEndTime(e: { detail: { value: string } }): void {
  form.endTime = String(e.detail.value)
}

/** 取扩展名做格式校验：小程序返回真实路径，H5 返回 blob: 地址，只能看文件名 */
function extOf(name: string): string {
  const clean = name.split('?')[0]
  const idx = clean.lastIndexOf('.')
  return idx >= 0 ? clean.slice(idx + 1).toLowerCase() : ''
}

/** H5 的临时文件带 type，没有后缀时用它兜底 */
function extOfMime(type?: string): string {
  if (!type) return ''
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  }
  return map[type] || ''
}

function chooseCover(): void {
  if (uploading.value) return
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const path = res.tempFilePaths[0]
      // tempFiles 的联合类型在 H5 / 小程序两端不一致，统一按「带 size/name/type 的文件对象」读
      const files = res.tempFiles as unknown as Array<{ size?: number; name?: string; type?: string }> | undefined
      const file = files?.[0]
      if (!path) return
      const ext = extOf(file?.name || path) || extOfMime(file?.type)
      if (!ALLOWED.includes(ext)) {
        uni.showToast({ title: `只支持 ${ALLOWED.join('/')} 格式`, icon: 'none' })
        return
      }
      const size = Number(file?.size || 0)
      if (size > MAX_SIZE) {
        uni.showToast({ title: `图片 ${(size / 1024 / 1024).toFixed(1)}MB，超过 2MB`, icon: 'none' })
        return
      }
      uploading.value = true
      try {
        coverUrl.value = await uploadFile(path, 'activity-cover')
        uni.showToast({ title: '封面上传成功', icon: 'none' })
      } catch {
        coverUrl.value = ''
      } finally {
        uploading.value = false
      }
    }
  })
}

function combine(date: string, time: string): string {
  return `${date} ${time}:00`
}

async function submit(): Promise<void> {
  if (submitting.value) return
  if (!form.title.trim()) {
    uni.showToast({ title: '请填写活动标题', icon: 'none' })
    return
  }
  if (!form.locationName.trim()) {
    uni.showToast({ title: '请填写活动地点', icon: 'none' })
    return
  }
  const start = combine(form.startDate, form.startTime)
  const end = combine(form.endDate, form.endTime)
  if (new Date(end.replace(/-/g, '/')).getTime() <= new Date(start.replace(/-/g, '/')).getTime()) {
    uni.showToast({ title: '结束时间要晚于开始时间', icon: 'none' })
    return
  }

  const startMs = new Date(start.replace(/-/g, '/')).getTime()
  const signupEnd = new Date(startMs - 30 * 60 * 1000)
  const cancelDeadline = new Date(startMs - 2 * 3600 * 1000)
  const now = new Date()

  submitting.value = true
  try {
    await api.createActivity({
      title: form.title.trim(),
      coverUrl: coverUrl.value,
      categoryId: categories.value[categoryIndex.value]?.id,
      summary: form.summary.trim(),
      content: form.summary.trim(),
      startTime: start,
      endTime: end,
      signupStartTime: `${dateStr(now)} ${timeStr(now)}:00`,
      signupEndTime: `${dateStr(signupEnd)} ${timeStr(signupEnd)}:00`,
      cancelDeadline: `${dateStr(cancelDeadline)} ${timeStr(cancelDeadline)}:00`,
      locationName: form.locationName.trim(),
      capacity: Number(form.capacity || 0),
      // 1 扫码签到；0 不需要审核，报名即成功，方便现场演示完整主链路
      checkinType: 1,
      auditRequired: 0,
      scoreType: form.scoreType,
      score: Number(form.score || 0)
    })
    uni.showToast({ title: '已提交，等待审核', icon: 'none' })
    setTimeout(() => uni.navigateBack({ delta: 1 }), 800)
  } finally {
    submitting.value = false
  }
}

onLoad(async () => {
  try {
    categories.value = await api.categories()
    categoryIndex.value = 0
  } catch {
    categories.value = []
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 60rpx;
  background: #f5f7f8;
}

.card {
  padding: 26rpx 24rpx;
  margin-bottom: 22rpx;
  border-radius: 20rpx;
  background: #fff;
}

.label {
  font-size: 26rpx;
  font-weight: 600;
  color: #1f2430;
}

.req {
  color: #dc2626;
  margin-left: 4rpx;
}

.field {
  margin-bottom: 22rpx;
}

.field:last-child {
  margin-bottom: 0;
}

.input {
  margin-top: 14rpx;
  height: 80rpx;
  padding: 0 20rpx;
  border-radius: 14rpx;
  background: #f4f7f5;
  font-size: 26rpx;
  color: #1f2430;
  line-height: 80rpx;
}

.picker {
  line-height: 80rpx;
}

.textarea {
  margin-top: 14rpx;
  width: 100%;
  box-sizing: border-box;
  min-height: 120rpx;
  padding: 18rpx 20rpx;
  border-radius: 14rpx;
  background: #f4f7f5;
  font-size: 26rpx;
  color: #1f2430;
}

.ph {
  color: #9aa3ad;
}

.cover {
  position: relative;
  margin-top: 16rpx;
  height: 260rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #f4f7f5;
  border: 1rpx dashed #cfe0d5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.cover-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.cover-plus {
  font-size: 56rpx;
  color: #9dc4ac;
}

.cover-tip {
  font-size: 22rpx;
  color: #9aa3ad;
}

.cover-mask {
  position: absolute;
  inset: 0;
  background: rgba(15, 44, 28, 0.55);
  color: #fff;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-row {
  display: flex;
  gap: 16rpx;
  margin-top: 14rpx;
}

.time-row > picker {
  flex: 1;
}

.hint {
  display: block;
  margin-top: 14rpx;
  font-size: 22rpx;
  color: #9aa3ad;
  line-height: 1.5;
}

.btn {
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 44rpx;
  font-size: 29rpx;
  font-weight: 600;
}

.btn.primary {
  background: linear-gradient(120deg, #12813f, #22c55e);
  color: #fff;
}

.btn.disabled {
  opacity: 0.6;
}

.foot-tip {
  display: block;
  margin-top: 16rpx;
  text-align: center;
  font-size: 22rpx;
  color: #9aa3ad;
}
</style>
