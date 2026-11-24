import http from './request'
import type { ActivityDetail, ActivityItem, AuditParams, DashboardData, LoginResult, PageQuery, PageResult, PingResult } from '@/types/api'

/**
 * 后台接口集合。域名不出现在这里：request.ts 已把 baseURL 固定为 /api。
 */
export const api = {
    /** 探活：联调第一步，确认代理与统一响应体都通 */
    ping: () => http.get<PingResult>('/ping'),

    /** 管理员登录：返回 token 与用户信息，token 由 store 落到 localStorage */
    login: (data: { username: string; password: string }) => http.post<LoginResult>('/admin/auth/login', data),

    /** 登出：后端把 token 的 jti 拉黑，本地由 store 清 localStorage */
    logout: () => http.post<void>('/admin/auth/logout'),

    /** 工作台：统计数字 + 热门活动 TOP5 */
    dashboard: () => http.get<DashboardData>('/admin/dashboard'),

    /** 待审核活动列表 */
    auditPage: (params: PageQuery) => http.get<PageResult<ActivityItem>>('/admin/activities/audit-list', { params }),

    /** 审核：pass=true 通过；false 驳回（必须带 reason） */
    auditActivity: (id: number | string, data: AuditParams) =>
        http.post<void>(`/admin/activities/${id}/audit`, data),

    /** 活动详情：后台与小程序共用 app 端接口，保证字段口径一致 */
    activityDetail: (id: number | string) => http.get<ActivityDetail>(`/app/activities/${id}`)
}

export default api
