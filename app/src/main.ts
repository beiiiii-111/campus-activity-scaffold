import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  // 登录态放在 pinia 里，页面通过 useUserStore 读写，避免各页各存一份 token
  app.use(createPinia())
  return {
    app
  }
}
