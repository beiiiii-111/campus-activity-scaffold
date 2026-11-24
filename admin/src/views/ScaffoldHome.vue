<template>
  <div class="scaffold">
    <header class="scaffold-header">
      <h1>校园活动管理后台</h1>
      <p>D01 · Vite + Vue3 + TypeScript 工程已就绪</p>
    </header>

    <el-card shadow="never" class="scaffold-card">
      <template #header>技术栈</template>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="构建工具">Vite 5</el-descriptions-item>
        <el-descriptions-item label="框架">Vue 3.5 + TypeScript（strict）</el-descriptions-item>
        <el-descriptions-item label="组件库">Element Plus 2.8</el-descriptions-item>
        <el-descriptions-item label="路由">vue-router 4（hash 模式）</el-descriptions-item>
        <el-descriptions-item label="开发端口">5173（strictPort）</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never" class="scaffold-card">
      <template #header>下一步</template>
      <p class="scaffold-text">D02：补类型定义、axios 请求层与字典，页面将变成可自检的联调面板。</p>
    </el-card>
  </div>
</template>

<style scoped>
.scaffold {
    max-width: 880px;
    margin: 0 auto;
    padding: 48px 24px;
}

.scaffold-header h1 {
    margin: 0;
    font-size: 26px;
}

.scaffold-header p {
    margin: 8px 0 24px;
    color: #6b7280;
    font-size: 14px;
}

.scaffold-card {
    margin-bottom: 20px;
    border-radius: 12px;
}

.scaffold-text {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
}
</style>
