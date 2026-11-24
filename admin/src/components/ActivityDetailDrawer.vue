<template>
  <el-drawer v-model="visible" :size="520" :title="activity?.title || '活动详情'" @open="load">
    <div v-loading="loading" class="drawer-body">
      <template v-if="activity">
        <div class="cover" v-if="activity.coverUrl">
          <img :src="resolveUrl(activity.coverUrl)" alt="活动封面" />
        </div>

        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="活动状态">
            <StatusTag :status="activity.status" :label="activity.statusLabel" />
          </el-descriptions-item>
          <el-descriptions-item label="分类">{{ activity.categoryName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="主办方">{{ activity.orgName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="活动时间">
            {{ activity.startTime }} ~ {{ activity.endTime }}
          </el-descriptions-item>
          <el-descriptions-item label="报名时间">
            {{ activity.signupStartTime }} ~ {{ activity.signupEndTime }}
          </el-descriptions-item>
          <el-descriptions-item label="地点">{{ activity.locationName }}{{ activity.address ? ` · ${activity.address}` : '' }}</el-descriptions-item>
          <el-descriptions-item label="人数">
            {{ activity.signedCount || 0 }} / {{ activity.capacity || '不限' }}
          </el-descriptions-item>
          <el-descriptions-item label="第二课堂">
            {{ activity.scoreTypeLabel || '未设置' }}{{ activity.score ? ` · ${activity.score} 分` : '' }}
          </el-descriptions-item>
          <el-descriptions-item label="报名审核">
            {{ activity.auditRequired === 1 ? '需要组织者审核' : '报名即通过' }}
          </el-descriptions-item>
          <el-descriptions-item label="候补">{{ activity.waitlistEnabled === 1 ? '已开启' : '未开启' }}</el-descriptions-item>
          <el-descriptions-item label="签到方式">{{ checkinTypeLabel(activity.checkinType) }}</el-descriptions-item>
          <el-descriptions-item label="浏览量 / 收藏">
            {{ activity.viewCount || 0 }} / {{ activity.favoriteCount || 0 }}
          </el-descriptions-item>
        </el-descriptions>

        <section class="block">
          <h4>活动简介</h4>
          <p class="summary">{{ activity.summary || '组织者未填写摘要' }}</p>
        </section>

        <section class="block">
          <h4>活动介绍</h4>
          <p class="content">{{ activity.content || '组织者未填写详细介绍' }}</p>
        </section>
      </template>
      <EmptyState v-else-if="!loading" title="没有取到活动详情" description="可能是活动已被删除" />
    </div>

    <template #footer>
      <!-- 抽屉的业务动作由使用方决定：审核页放通过/驳回，管理页放下架 -->
      <slot name="footer" :activity="activity" />
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { checkinTypeLabel } from '@/utils/dict'
import api from '@/api'
import type { ActivityDetail } from '@/types/api'
import StatusTag from '@/components/StatusTag.vue'
import EmptyState from '@/components/EmptyState.vue'

/**
 * 活动详情抽屉。
 * 复用点：活动审核页（审核前先看内容）、活动管理页（下架前先看内容）各用一次，
 * 两处只是 footer 插槽里的按钮不同。
 */
const props = defineProps<{
  modelValue: boolean
  activityId?: number | string | null
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const visible = ref(props.modelValue)
const loading = ref(false)
const activity = ref<ActivityDetail | null>(null)

watch(
  () => props.modelValue,
  (value) => {
    visible.value = value
  }
)

watch(visible, (value) => emit('update:modelValue', value))
watch(
  () => props.activityId,
  () => {
    if (visible.value) load()
  }
)

/** 上传返回的是 /uploads/xxx 相对地址，H5 与后台同源，直接拼即可 */
function resolveUrl(url: string): string {
  return url.startsWith('http') ? url : url
}

async function load(): Promise<void> {
  if (!props.activityId) return
  loading.value = true
  try {
    activity.value = await api.activityDetail(props.activityId)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.drawer-body {
  min-height: 240px;
}

.cover {
  margin-bottom: 14px;
  border-radius: 10px;
  overflow: hidden;
  background: #f0f4f2;
}

.cover img {
  width: 100%;
  display: block;
}

.block {
  margin-top: 18px;
}

.block h4 {
  margin: 0 0 8px;
  font-size: 13px;
  color: #34473d;
}

.summary {
  margin: 0;
  font-size: 13px;
  color: #6b7873;
  line-height: 1.7;
}

.content {
  margin: 0;
  padding: 12px;
  border-radius: 10px;
  background: #f7faf8;
  font-size: 13px;
  color: #46564e;
  line-height: 1.8;
  white-space: pre-wrap;
}
</style>
