<template>
  <el-tag :type="resolvedType" :effect="effect" size="small" round>{{ resolvedLabel }}</el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { activityStatusLabel, activityStatusType, roleLabel, signupStatusLabel, signupStatusType } from '@/utils/dict'

/**
 * 统一的状态标签。
 * 复用点：
 *   1. 活动审核页 —— kind="activity"（待审核 / 已发布…）
 *   2. 活动管理页 —— kind="activity" + 报名数
 *   3. 用户管理页 —— kind="role"（学生 / 组织者 / 管理员）
 * 颜色与文案全部来自 dict.ts，页面不再各写一套映射。
 */
const props = withDefaults(
  defineProps<{
    kind?: 'activity' | 'signup' | 'role'
    status: number | string
    /** 后端已给的文案优先（比如 statusLabel），没有再查字典 */
    label?: string | null
    effect?: 'light' | 'plain' | 'dark'
  }>(),
  { kind: 'activity', label: null, effect: 'light' }
)

const resolvedLabel = computed(() => {
  if (props.kind === 'role') return roleLabel(String(props.status))
  if (props.kind === 'signup') return signupStatusLabel(Number(props.status), props.label)
  return activityStatusLabel(Number(props.status), props.label)
})

const resolvedType = computed(() => {
  if (props.kind === 'role') return props.status === 'ADMIN' ? 'danger' : props.status === 'ORGANIZER' ? 'warning' : 'info'
  if (props.kind === 'signup') return signupStatusType(Number(props.status))
  return activityStatusType(Number(props.status))
})
</script>
