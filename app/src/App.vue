<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('campus-activity app launched')
})
</script>

<style>
/* 全局色板：绿色主色，后续页面只引变量，不再各写十六进制 */
page {
  --brand: #16a34a;
  --brand-light: #22c55e;
  --brand-bg: #edf9f1;
  --text-main: #1f2430;
  --text-sub: #6b7280;
  --line: #eef0f3;
  background: #f5f7f8;
  color: var(--text-main);
  font-size: 28rpx;
  font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

view,
text {
  box-sizing: border-box;
}
</style>
