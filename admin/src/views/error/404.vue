<template>
  <div class="error-page">
    <div class="code">404</div>
    <h2>页面不存在</h2>
    <p>地址敲错了，或者这个页面已经被删掉。</p>
    <el-button type="primary" @click="router.replace('/')">回到首页</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.error-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f4f7f5;
}

.code {
  font-size: 86px;
  font-weight: 800;
  color: #bfe8cd;
  line-height: 1;
}

h2 {
  margin: 12px 0 0;
  color: #14301f;
}

p {
  margin: 0 0 18px;
  color: #7d8a84;
  font-size: 13px;
}
</style>
