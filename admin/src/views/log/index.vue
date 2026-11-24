<template>
  <div>
    <PageHeader title="操作日志" description="审核、下架、补签、撤销签到、改角色都会在这里留痕，用于事后追溯">
      <template #extra>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <div class="panel">
      <TableToolbar v-model:keyword="keyword" placeholder="搜操作人 / 备注 / 业务 ID" @search="onSearch" @reset="onReset">
        <template #filters>
          <el-select v-model="bizType" placeholder="业务类型" clearable class="select">
            <el-option v-for="item in BIZ_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="action" placeholder="动作" clearable class="select">
            <el-option v-for="item in AUDIT_ACTION_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </template>
        <template #actions>
          <span class="hint">共 {{ filtered.length }} 条（后端只给分页，筛选在当前页内生效）</span>
        </template>
      </TableToolbar>

      <el-table v-loading="loading" :data="filtered" row-key="id" class="table">
        <el-table-column label="时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="业务" width="170">
          <template #default="{ row }">
            <span class="biz">{{ bizTypeLabel(row.bizType) }}</span>
            <span class="biz-id">#{{ row.bizId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="动作" width="130">
          <template #default="{ row }">
            <el-tag :type="actionType(row.action)" effect="light" size="small">{{ auditActionLabel(row.action) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作人" width="140">
          <template #default="{ row }">{{ row.operatorName || `用户 ${row.operatorId}` }}</template>
        </el-table-column>
        <el-table-column label="状态变化" width="150">
          <template #default="{ row }">
            <span v-if="row.beforeStatus || row.afterStatus" class="flow">
              {{ activityStatusLabel(toNumber(row.beforeStatus)) }}
              <span class="arrow">→</span>
              {{ activityStatusLabel(toNumber(row.afterStatus)) }}
            </span>
            <span v-else class="dash">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">{{ row.remark || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <EmptyState title="暂无操作记录" description="审核或补签之后这里会出现记录" />
        </template>
      </el-table>

      <div class="pager">
        <el-pagination v-model:current-page="page" :page-size="size" :total="total" layout="total, prev, pager, next"
          background @current-change="load" />
      </div>
    </div>

    <el-drawer v-model="detailVisible" title="日志详情" size="420px">
      <div v-if="current" class="detail">
        <div class="detail-row"><span>记录 ID</span><strong>{{ current.id }}</strong></div>
        <div class="detail-row"><span>时间</span><strong>{{ formatTime(current.createTime) }}</strong></div>
        <div class="detail-row"><span>业务类型</span><strong>{{ bizTypeLabel(current.bizType) }}</strong></div>
        <div class="detail-row"><span>业务 ID</span><strong>{{ current.bizId }}</strong></div>
        <div class="detail-row"><span>动作</span><strong>{{ auditActionLabel(current.action) }}</strong></div>
        <div class="detail-row"><span>操作人</span><strong>{{ current.operatorName || `用户 ${current.operatorId}` }}（ID {{ current.operatorId }}）</strong></div>
        <div class="detail-row"><span>变更前状态</span><strong>{{ current.beforeStatus ?? '-' }}</strong></div>
        <div class="detail-row"><span>变更后状态</span><strong>{{ current.afterStatus ?? '-' }}</strong></div>
        <div class="detail-row"><span>备注</span><strong>{{ current.remark || '-' }}</strong></div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import TableToolbar from '@/components/TableToolbar.vue'
import EmptyState from '@/components/EmptyState.vue'
import api from '@/api'
import {
  AUDIT_ACTION_OPTIONS,
  BIZ_TYPE_OPTIONS,
  activityStatusLabel,
  auditActionLabel,
  bizTypeLabel
} from '@/utils/dict'
import type { AuditLogItem, TagType } from '@/types/api'

const loading = ref(false)
const records = ref<AuditLogItem[]>([])
const total = ref(0)
const page = ref(1)
const size = 20

const keyword = ref('')
const bizType = ref('')
const action = ref('')

const detailVisible = ref(false)
const current = ref<AuditLogItem | null>(null)

/** 后端 /admin/logs 只接受 page/size，业务类型、动作、关键词都在当前页里筛 */
const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return records.value.filter((item) => {
    if (bizType.value && item.bizType !== bizType.value) return false
    if (action.value && item.action !== action.value) return false
    if (!kw) return true
    const text = `${item.operatorName || ''}${item.remark || ''}${item.bizId}`.toLowerCase()
    return text.includes(kw)
  })
})

function toNumber(value?: string | null): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

/** 后端返回的是 LocalDateTime 的 ISO 串（2026-11-24T12:55:48），表格里换成空格更好读 */
function formatTime(value?: string | null): string {
  if (!value) return '-'
  return value.replace('T', ' ')
}

function actionType(value: string): TagType {
  if (value === 'APPROVE') return 'success'
  if (value === 'REJECT' || value === 'CANCEL' || value === 'DELETE' || value === 'REVOKE_CHECKIN') return 'danger'
  if (value === 'ROLE_CHANGE') return 'warning'
  return 'primary'
}

async function load(): Promise<void> {
  loading.value = true
  try {
    const data = await api.logs({ page: page.value, size })
    records.value = data.records
    total.value = Number(data.total)
  } finally {
    loading.value = false
  }
}

function onSearch(): void {
  // 筛选是前端算的，这里只把页码拉回第一页，避免错觉「搜到 0 条」
  page.value = 1
  load()
}

function onReset(): void {
  keyword.value = ''
  bizType.value = ''
  action.value = ''
  page.value = 1
  load()
}

function openDetail(row: AuditLogItem): void {
  current.value = row
  detailVisible.value = true
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

.table {
  width: 100%;
}

.select {
  width: 140px;
}

.hint {
  font-size: 12px;
  color: #8a9691;
}

.biz {
  font-size: 13px;
  color: #1f2f26;
  font-weight: 600;
}

.biz-id {
  margin-left: 6px;
  font-size: 12px;
  color: #9aa5a0;
}

.flow {
  font-size: 12px;
  color: #46564e;
}

.arrow {
  margin: 0 4px;
  color: #9aa5a0;
}

.dash {
  color: #c4ccc8;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.detail-row span {
  color: #8a9691;
  font-size: 12px;
}

.detail-row strong {
  color: #1f2f26;
  font-weight: 600;
  word-break: break-all;
}
</style>
