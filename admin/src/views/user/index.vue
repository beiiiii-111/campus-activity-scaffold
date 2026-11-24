<template>
  <div>
    <PageHeader title="用户管理" description="查看平台注册用户，可调整学生 / 组织者 / 审核员 / 管理员角色">
      <template #extra>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <div class="panel">
      <TableToolbar v-model:keyword="query.keyword" placeholder="搜索昵称 / 学号 / 手机号" @search="search"
        @reset="reset">
        <template #filters>
          <el-select v-model="query.role" placeholder="全部角色" clearable class="role-select" @change="search">
            <el-option v-for="item in ROLE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </template>
      </TableToolbar>

      <el-table v-loading="loading" :data="records" row-key="id">
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="34" class="avatar">{{ (row.realName || row.nickname || '?').slice(0, 1) }}</el-avatar>
              <div class="meta">
                <span class="name">{{ row.nickname || '未设置昵称' }}</span>
                <span class="sub">ID {{ row.id }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="130">
          <template #default="{ row }">
            <StatusTag kind="role" :status="row.role" />
          </template>
        </el-table-column>
        <el-table-column label="学号 / 姓名" width="170">
          <template #default="{ row }">
            <template v-if="row.bound">
              <span class="cell-main">{{ row.studentNo }}</span>
              <span class="sub">{{ row.realName }}</span>
            </template>
            <span v-else class="sub">未绑定学号</span>
          </template>
        </el-table-column>
        <el-table-column label="学院 / 年级" width="200">
          <template #default="{ row }">
            <span v-if="row.college" class="cell-main">{{ row.college }}</span>
            <span v-else class="sub">-</span>
            <span v-if="row.grade" class="sub">{{ row.grade }} 级</span>
          </template>
        </el-table-column>
        <el-table-column label="手机号" width="140">
          <template #default="{ row }">
            <span :class="row.phone ? 'cell-main' : 'sub'">{{ row.phone || '未绑定' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="所属组织" width="160">
          <template #default="{ row }">
            <span :class="row.orgName ? 'cell-main' : 'sub'">{{ row.orgName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openRole(row)">设置角色</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <EmptyState title="没有符合条件的用户" description="换个关键词或角色再试试" />
        </template>
      </el-table>

      <div class="pager">
        <el-pagination v-model:current-page="query.page" :page-size="query.size" :total="total"
          layout="total, prev, pager, next" background @current-change="load" />
      </div>
    </div>

    <el-dialog v-model="roleVisible" title="设置用户角色" width="460">
      <p class="dialog-tip">正在修改「{{ current?.nickname || current?.realName }}」的角色</p>
      <el-form label-width="76px">
        <el-form-item label="角色">
          <el-select v-model="form.role" class="full">
            <el-option v-for="item in ROLE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.role === 'ORGANIZER'" label="所属组织">
          <el-select v-model="form.orgId" placeholder="请选择组织" class="full">
            <el-option v-for="org in organizations" :key="org.id" :label="org.name" :value="org.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitRole">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import TableToolbar from '@/components/TableToolbar.vue'
import StatusTag from '@/components/StatusTag.vue'
import EmptyState from '@/components/EmptyState.vue'
import api from '@/api'
import { ROLE_OPTIONS } from '@/utils/dict'
import type { Organization, UserInfo, UserRole } from '@/types/api'

const loading = ref(false)
const submitting = ref(false)
const records = ref<UserInfo[]>([])
const total = ref(0)
const organizations = ref<Organization[]>([])

const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
  role: '' as UserRole | ''
})

const roleVisible = ref(false)
const current = ref<UserInfo | null>(null)
const form = reactive<{ role: UserRole; orgId: number | null }>({ role: 'STUDENT', orgId: null })

async function load(): Promise<void> {
  loading.value = true
  try {
    const data = await api.userPage({
      page: query.page,
      size: query.size,
      keyword: query.keyword || undefined,
      role: query.role === '' ? undefined : query.role
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
  query.role = ''
  query.page = 1
  load()
}

function openRole(row: UserInfo): void {
  current.value = row
  form.role = (row.role as UserRole) || 'STUDENT'
  form.orgId = row.orgId ?? null
  roleVisible.value = true
}

async function submitRole(): Promise<void> {
  if (!current.value) return
  if (form.role === 'ORGANIZER' && !form.orgId) {
    ElMessage.warning('组织者必须选择所属组织')
    return
  }
  submitting.value = true
  try {
    await api.setUserRole(current.value.id, {
      role: form.role,
      orgId: form.role === 'ORGANIZER' ? form.orgId : null
    })
    ElMessage.success('角色已更新')
    roleVisible.value = false
    await load()
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await load()
  // 组织下拉只在改角色时用，等页面数据先出来再拉，不拖慢首屏
  organizations.value = await api.organizations().catch(() => [])
})
</script>

<style scoped>
.panel {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e8efeb;
  padding: 16px;
}

.role-select {
  width: 140px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  background: linear-gradient(135deg, #16a34a, #4ade80);
  font-size: 13px;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.name {
  font-size: 13px;
  font-weight: 600;
  color: #1f2f26;
}

.cell-main {
  display: block;
  font-size: 13px;
  color: #34473d;
}

.sub {
  font-size: 12px;
  color: #9aa5a0;
  /* 19 位雪花 ID 在窄列里会折成两行，截断成省略号更整齐 */
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.dialog-tip {
  margin: 0 0 12px;
  font-size: 12px;
  color: #8a9691;
}

.full {
  width: 100%;
}
</style>
