import http from './request'
import type { ActivityDetail, ActivityItem, ActivityQuery, LoginResult, PageResult, PingResult, SignupItem } from '@/types/api'

/**
 * 后台接口集合。域名不出现在这里：request.ts 已把 baseURL 固定为 /api。
 */
export const api = {
    /** 探活：联调第一步，确认代理与统一响应体都通 */
    ping: () => http.get<PingResult>('/ping'),

    login: (data: { username: string; password: string }) => http.post<LoginResult>('/admin/auth/login', data),

    // 以下接口由 B 轨后续步骤提供，这里先固定路径与类型，页面后续直接调用
    activityPage: (params: ActivityQuery) =>
        http.get<PageResult<ActivityItem>>('/admin/activities', { params }),
    activityDetail: (id: number | string) => http.get<ActivityDetail>(`/app/activities/${id}`),
    signupPage: (params: { page: number; size: number; activityId?: number }) =>
        http.get<PageResult<SignupItem>>('/admin/signups', { params })
}

export default api
