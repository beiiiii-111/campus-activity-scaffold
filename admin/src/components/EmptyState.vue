<template>
  <div class="empty-state">
    <div class="circle">
      <el-icon :size="26"><DocumentRemove /></el-icon>
    </div>
    <p class="title">{{ title }}</p>
    <p v-if="description" class="desc">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { DocumentRemove } from '@element-plus/icons-vue'

/**
 * 空状态占位。
 * 复用点：工作台热门榜、活动审核、活动管理、用户管理四处的空列表都走这里，
 * 避免每页写一遍"暂无数据"。
 */
withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  { title: '暂无数据', description: '' }
)
</script>

<style scoped>
.empty-state {
  padding: 32px 16px;
  text-align: center;
  color: #8a9691;
}

.circle {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #eef9f2;
  color: #4cbf74;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  margin: 0;
  font-size: 14px;
  color: #6b7873;
}

.desc {
  margin: 6px 0 0;
  font-size: 12px;
  color: #9aa5a0;
}
</style>
