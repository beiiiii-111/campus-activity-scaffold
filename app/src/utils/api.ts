import { http } from './request'
import type { ActivityDetail, ActivityItem, PingResult, SignupItem, UserInfo, PageResult } from '../types'

/**
 * 业务接口集合。写法约定：
 * - 只写相对路径（/app/...），域名交给 request.ts 与 vite 代理；
 * - 返回值直接声明成业务类型，拆包由 http 完成；
 * - 公开接口显式传 { auth: false }，避免未登录时发无效 token。
 */
export const api = {
  /** 探活：三端联调时第一步先打它 */
  ping: () => http.get<PingResult>('/ping', undefined, { auth: false }),

  // 以下为 B 轨后续步骤会提供的接口，本阶段先固定类型与路径，避免前端后面改结构
  activityList: (params?: { page?: number; size?: number; keyword?: string; categoryId?: number }) =>
    http.get<PageResult<ActivityItem>>('/app/activities', params, { auth: false }),
  activityDetail: (id: number | string) => http.get<ActivityDetail>(`/app/activities/${id}`, undefined, { auth: false }),
  mySignups: (params?: { page?: number; size?: number }) => http.get<PageResult<SignupItem>>('/app/user/signups', params),
  profile: () => http.get<UserInfo>('/app/user/profile')
}
