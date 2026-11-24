import http from './request'
import type { LoginResult, PingResult } from '@/types/api'

/**
 * 后台接口集合。域名不出现在这里：request.ts 已把 baseURL 固定为 /api。
 */
export const api = {
    /** 探活：联调第一步，确认代理与统一响应体都通 */
    ping: () => http.get<PingResult>('/ping'),

    /** 管理员登录：返回 token 与用户信息，token 由 store 落到 localStorage */
    login: (data: { username: string; password: string }) => http.post<LoginResult>('/admin/auth/login', data),

    /** 登出：后端把 token 的 jti 拉黑，本地由 store 清 localStorage */
    logout: () => http.post<void>('/admin/auth/logout')
}

export default api
