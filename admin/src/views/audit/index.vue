<template>
  <div>
    <PageHeader title="活动审核" description="组织者提交的活动需要在这里审核通过后才会对学生可见">
      <template #extra>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <div class="panel">
      <el-alert v-if="total > 0" type="warning" :closable="false" show-icon class="alert">
        当前有 <strong>{{ total }}</strong> 个活动等待审核
      </el-alert>

      <el-table v-loading="loading" :data="records" row-key="id" class="table" @row-click="openDetail">
        <el-table-column prop="title" label="活动名称" min-width="220">
          <template #default="{ row }">
            <div class="title-cell">
              <span class="title">{{ row.title }}</span>
              <span class="sub">{{ row.summary || '暂无摘要' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="orgName" label="主办方" width="150" />
        <el-table-column label="活动时间" width="230">
          <template #default="{ row }">
            <span class="time">{{ row.startTime }}</span>
            <span class="time sub-time">至 {{ row.endTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="报名" width="90">
          <template #default="{ row }">{{ row.signedCount || 0 }} / {{ row.capacity || '不限' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.status" :label="row.statusLabel" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="openDetail(row)">详情</el-button>
            <el-button link type="success" @click.stop="approve(row)">通过</el-button>
            <el-button link type="danger" @click.stop="openReject(row)">驳回</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <EmptyState title="没有待审核的活动" description="组织者提交后会自动出现在这里" />
        </template>
      </el-table>

      <div class="pager">
        <el-pagination v-model:current-page="page" :page-size="size" :total="total" layout="total, prev, pager, next"
          background @current-change="load" />
      </div>
    </div>

    <ActivityDetailDrawer v-model="drawerVisible" :activity-id="currentId">
      <template #footer>
        <el-button @click="drawerVisible = false">关闭</el-button>
        <el-button type="danger" plain @click="rejectCurrent">驳回</el-button>
        <el-button type="success" @click="approveCurrent">审核通过</el-button>
      </template>
    </ActivityDetailDrawer>

    <el-dialog v-model="rejectVisible" title="驳回活动" width="460">
      <p class="dialog-tip">驳回后组织者会看到理由，需要修改后重新提交。</p>
      <el-input v-model="rejectReason" type="textarea" :rows="3" maxlength="120" show-word-limit
        placeholder="例如：活动地点未填写完整，请补充具体教室" />
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" :loading="submitting" @click="submitReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import StatusTag from '@/components/StatusTag.vue'
import EmptyState from '@/components/EmptyState.vue'
import ActivityDetailDrawer from '@/components/ActivityDetailDrawer.vue'
import api from '@/api'
import type { ActivityItem } from '@/types/api'

const loading = ref(false)
const submitting = ref(false)
const records = ref<ActivityItem[]>([])
const total = ref(0)
const page = ref(1)
const size = 10

const drawerVisible = ref(false)
const currentId = ref<number | string | null>(null)
const current = ref<ActivityItem | null>(null)

const rejectVisible = ref(false)
const rejectReason = ref('')

async function load(): Promise<void> {
  loading.value = true
  try {
    const data = await api.auditPage({ page: page.value, size })
    records.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function openDetail(row: ActivityItem): void {
  current.value = row
  currentId.value = row.id
  drawerVisible.value = true
}

async function approve(row: ActivityItem): Promise<void> {
  await ElMessageBox.confirm(`确定通过《${row.title}》的审核？通过后学生即可报名。`, '审核通过', {
    type: 'success',
    confirmButtonText: '通过',
    cancelButtonText: '再看看'
  })
  submitting.value = true
  try {
    await api.auditActivity(row.id, { pass: true })
    ElMessage.success('已通过')
    drawerVisible.value = false
    await load()
  } finally {
    submitting.value = false
  }
}

function openReject(row: ActivityItem): void {
  current.value = row
  rejectReason.value = ''
  rejectVisible.value = true
}

function approveCurrent(): void {
  if (current.value) approve(current.value)
}

function rejectCurrent(): void {
  if (current.value) openReject(current.value)
}

async function submitReject(): Promise<void> {
  if (!current.value) return
  if (rejectReason.value.trim().length < 4) {
    ElMessage.warning('请填写至少 4 个字的驳回理由')
    return
  }
  submitting.value = true
  try {
    await api.auditActivity(current.value.id, { pass: false, reason: rejectReason.value.trim() })
    ElMessage.success('已驳回')
    rejectVisible.value = false
    drawerVisible.value = false
    await load()
  } finally {
    submitting.value = false
  }
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

.alert {
  margin-bottom: 12px;
}

.table {
  width: 100%;
}

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
}

.title {
  font-size: 13px;
  color: #1f2f26;
  font-weight: 600;
}

.sub {
  font-size: 12px;
  color: #9aa5a0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 320px;
}

.time {
  display: block;
  font-size: 12px;
  color: #46564e;
}

.sub-time {
  color: #9aa5a0;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.dialog-tip {
  margin: 0 0 10px;
  font-size: 12px;
  color: #8a9691;
}
</style>
