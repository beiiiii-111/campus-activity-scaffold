<template>
  <div class="page-header">
    <div class="left">
      <h2>{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
    </div>
    <div class="right">
      <!-- 右侧操作区（新建、刷新等）由使用方插入，组件本身不关心业务 -->
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 页面标题条。
 * 复用点：工作台、活动审核、活动管理、用户管理四页统一用它，标题层级和间距不再各写一套。
 */
defineProps<{
  title: string
  description?: string
}>()
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

h2 {
  margin: 0;
  font-size: 20px;
  color: #14301f;
}

p {
  margin: 6px 0 0;
  font-size: 13px;
  color: #8a9691;
}

.right {
  display: flex;
  gap: 10px;
}
</style>
