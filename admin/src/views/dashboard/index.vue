<template>
  <div>
    <PageHeader title="工作台" description="平台整体数据概览，数据来自 GET /api/admin/dashboard">
      <template #extra>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <div class="stats" v-loading="loading">
      <div v-for="card in cards" :key="card.label" class="stat-card">
        <p class="label">{{ card.label }}</p>
        <p class="value">{{ card.value }}</p>
        <p class="hint">{{ card.hint }}</p>
      </div>
    </div>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h3>热门活动 TOP5</h3>
          <p>按报名人数排序</p>
        </div>
        <el-tag v-if="summary.pendingAuditCount > 0" type="warning" effect="light" class="alert"
          @click="router.push('/audit')">
          {{ summary.pendingAuditCount }} 个活动待审核 →
        </el-tag>
      </div>

      <div v-if="topActivities.length === 0" class="empty">
        <EmptyState title="还没有报名数据" description="等学生报名后这里会出现排行" />
      </div>
      <ul v-else class="rank">
        <li v-for="(item, index) in topActivities" :key="item.id">
          <span class="no" :class="{ hot: index < 3 }">{{ index + 1 }}</span>
          <div class="info">
            <p class="name">{{ item.title }}</p>
            <el-progress :percentage="percent(item)" :stroke-width="6" :show-text="false" color="#16a34a" />
          </div>
          <span class="count">{{ item.signupCount ?? 0 }} / {{ item.capacity || '不限' }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import api from '@/api'
import type { DashboardData, DashboardTopActivity } from '@/types/api'

const router = useRouter()
const loading = ref(false)
const data = ref<DashboardData | null>(null)

const summary = computed<DashboardData>(() => ({
  userTotal: 0,
  studentTotal: 0,
  activityTotal: 0,
  publishedCount: 0,
  pendingAuditCount: 0,
  signupTotal: 0,
  checkinTotal: 0,
  topActivities: [],
  ...(data.value || {})
}))

const topActivities = computed<DashboardTopActivity[]>(() => summary.value.topActivities || [])

const cards = computed(() => [
  { label: '用户总数', value: summary.value.userTotal, hint: `其中学生 ${summary.value.studentTotal}` },
  { label: '活动总数', value: summary.value.activityTotal, hint: `已发布 ${summary.value.publishedCount}` },
  { label: '报名总数', value: summary.value.signupTotal, hint: `待审核活动 ${summary.value.pendingAuditCount}` },
  { label: '已签到人次', value: summary.value.checkinTotal, hint: '含扫码与手动补签' }
])

function percent(item: DashboardTopActivity): number {
  if (!item.capacity) return 0
  return Math.min(100, Math.round(((item.signupCount ?? 0) / item.capacity) * 100))
}

async function load(): Promise<void> {
  loading.value = true
  try {
    data.value = await api.dashboard()
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  border: 1px solid #e8efeb;
}

.label {
  margin: 0;
  font-size: 13px;
  color: #7d8a84;
}

.value {
  margin: 10px 0 4px;
  font-size: 28px;
  font-weight: 700;
  color: #14301f;
}

.hint {
  margin: 0;
  font-size: 12px;
  color: #9aa5a0;
}

.panel {
  margin-top: 16px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e8efeb;
  padding: 18px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.panel-head h3 {
  margin: 0;
  font-size: 15px;
  color: #14301f;
}

.panel-head p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #9aa5a0;
}

.alert {
  cursor: pointer;
}

.rank {
  list-style: none;
  margin: 0;
  padding: 0;
}

.rank li {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px dashed #eef3f0;
}

.rank li:last-child {
  border-bottom: none;
}

.no {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: #f0f4f2;
  color: #7d8a84;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no.hot {
  background: #e7f6ec;
  color: #12813f;
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  margin: 0 0 6px;
  font-size: 13px;
  color: #2c3b33;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.count {
  font-size: 12px;
  color: #7d8a84;
  white-space: nowrap;
}
</style>
