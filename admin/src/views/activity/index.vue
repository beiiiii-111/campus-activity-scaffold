<template>
  <div>
    <PageHeader title="活动管理" description="查看平台全部活动，对已发布活动可执行下架">
      <template #extra>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <div class="panel">
      <TableToolbar v-model:keyword="query.keyword" placeholder="搜索活动名称 / 主办方" @search="search"
        @reset="reset">
        <template #filters>
          <el-select v-model="query.status" placeholder="全部状态" clearable class="status-select" @change="search">
            <el-option v-for="item in ACTIVITY_STATUS_OPTIONS" :key="item.value" :label="item.label"
              :value="item.value" />
          </el-select>
        </template>
      </TableToolbar>

      <el-table v-loading="loading" :data="records" row-key="id" @row-click="openDetail">
        <el-table-column label="活动" min-width="260">
          <template #default="{ row }">
            <div class="activity-cell">
              <div class="cover" :style="coverStyle(row)">
                <img v-if="row.coverUrl" :src="row.coverUrl" alt="" />
              </div>
              <div class="meta">
                <span class="title">{{ row.title }}</span>
                <span class="sub">{{ row.orgName || '未知主办方' }} · {{ row.categoryName || '未分类' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="活动时间" width="200">
          <template #default="{ row }">
            <span class="time">{{ row.startTime }}</span>
            <span class="time sub-time">至 {{ row.endTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="报名" width="100">
          <template #default="{ row }">{{ row.signedCount || 0 }} / {{ row.capacity || '不限' }}</template>
        </el-table-column>
        <el-table-column label="第二课堂" width="130">
          <template #default="{ row }">
            <span v-if="row.score" class="score">{{ row.scoreTypeLabel || '未分类' }} {{ row.score }} 分</span>
            <span v-else class="sub">未设置</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.status" :label="row.statusLabel" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="openDetail(row)">详情</el-button>
            <el-button v-if="canOffline(row)" link type="danger" @click.stop="offline(row)">下架</el-button>
            <span v-else class="sub">—</span>
          </template>
        </el-table-column>
        <template #empty>
          <EmptyState title="没有符合条件的活动" description="换个关键词或状态再试试" />
        </template>
      </el-table>

      <div class="pager">
        <el-pagination v-model:current-page="query.page" :page-size="query.size" :total="total"
          layout="total, prev, pager, next" background @current-change="load" />
      </div>
    </div>

    <ActivityDetailDrawer v-model="drawerVisible" :activity-id="currentId">
      <template #footer="{ activity }">
        <el-button @click="drawerVisible = false">关闭</el-button>
        <el-button v-if="activity && canOffline(activity)" type="danger" @click="offline(activity)">下架该活动</el-button>
      </template>
    </ActivityDetailDrawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import TableToolbar from '@/components/TableToolbar.vue'
import StatusTag from '@/components/StatusTag.vue'
import EmptyState from '@/components/EmptyState.vue'
import ActivityDetailDrawer from '@/components/ActivityDetailDrawer.vue'
import api from '@/api'
import { ACTIVITY_STATUS_OPTIONS } from '@/utils/dict'
import type { ActivityItem, ActivityStatus } from '@/types/api'

const loading = ref(false)
const records = ref<ActivityItem[]>([])
const total = ref(0)

const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
  status: '' as ActivityStatus | ''
})

const drawerVisible = ref(false)
const currentId = ref<number | string | null>(null)

async function load(): Promise<void> {
  loading.value = true
  try {
    const data = await api.activityPage({
      page: query.page,
      size: query.size,
      keyword: query.keyword || undefined,
      status: query.status === '' ? undefined : (query.status as ActivityStatus)
    })
    records.value = data.records
    total.value = Number(data.total)
  } finally {
    loading.value = false
  }
}

function search(): void {
  query.page = 1
  load()
}

function reset(): void {
  query.keyword = ''
  query.status = ''
  query.page = 1
  load()
}

function openDetail(row: ActivityItem): void {
  currentId.value = row.id
  drawerVisible.value = true
}

/** 只有已发布 / 进行中的活动才允许下架，草稿、已结束、已取消都没必要 */
function canOffline(row: ActivityItem): boolean {
  return row.status === 3 || row.status === 4
}

async function offline(row: ActivityItem): Promise<void> {
  const { value } = await ElMessageBox.prompt(
    `下架《${row.title}》后学生将无法再报名，已报名记录保留。请填写下架原因：`,
    '下架活动',
    {
      confirmButtonText: '确认下架',
      cancelButtonText: '取消',
      inputPlaceholder: '例如：活动场地临时调整',
      inputValidator: (val: string) => (val && val.trim().length >= 2 ? true : '请填写至少 2 个字的原因')
    }
  )
  await api.offlineActivity(row.id, value.trim())
  ElMessage.success('已下架')
  drawerVisible.value = false
  await load()
}

function coverStyle(row: ActivityItem): Record<string, string> {
  if (row.coverUrl) return {}
  return { background: 'linear-gradient(135deg, #d9f2e2, #bfe8cd)' }
}

onMounted(load)
</script>

<style scoped>
.panel {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e8efeb;
  padding: 16px;
}

.status-select {
  width: 140px;
}

.activity-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cover {
  width: 52px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  flex: 0 0 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2f26;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 260px;
}

.sub {
  font-size: 12px;
  color: #9aa5a0;
}

.time {
  display: block;
  font-size: 12px;
  color: #46564e;
}

.sub-time {
  color: #9aa5a0;
}

.score {
  font-size: 12px;
  color: #b26a00;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
