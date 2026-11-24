import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: {
    host: '127.0.0.1',
    // H5 仅用于调试：后台已占 5173，这里让一位，避免两个前端抢同一个端口
    port: 5174,
    // /api 与 /uploads 都转发到后端，H5 调试时不会跨域；小程序端由 request.ts 拼完整地址
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8016',
        changeOrigin: true
      }
    }
  }
})
