import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import '@/styles/index.css'
import App from './App.vue'
import router from './router'
import permission from './directives/permission'

// pinia 必须先于 router 安装：路由守卫里会读 user store，首次导航就要能取到
const app = createApp(App)
app.use(createPinia()).use(ElementPlus, { locale: zhCn }).use(router)
// 按钮级权限指令：v-perm="['ADMIN']"，见 directives/permission.ts
app.directive('perm', permission)
app.mount('#app')
