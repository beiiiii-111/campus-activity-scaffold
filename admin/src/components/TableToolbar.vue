<template>
  <div class="toolbar">
    <div class="left">
      <el-input :model-value="keyword" :placeholder="placeholder" clearable class="search"
        @update:model-value="(v: string) => emit('update:keyword', v)" @keyup.enter="emit('search')"
        @clear="emit('search')">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <!-- 各页自己的筛选项（状态下拉、角色下拉）插到这里 -->
      <slot name="filters" />

      <el-button type="primary" @click="emit('search')">查询</el-button>
      <el-button @click="emit('reset')">重置</el-button>
    </div>
    <div class="right">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'

/**
 * 列表页通用工具条。
 * 复用点：活动管理（关键词 + 状态筛选）、用户管理（关键词 + 角色筛选）各用一次，
 * 差异只体现在 filters 插槽里。
 */
withDefaults(
  defineProps<{
    keyword: string
    placeholder?: string
  }>(),
  { placeholder: '输入关键词搜索' }
)

const emit = defineEmits<{
  'update:keyword': [value: string]
  search: []
  reset: []
}>()
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search {
  width: 240px;
}

.right {
  display: flex;
  gap: 10px;
}
</style>
