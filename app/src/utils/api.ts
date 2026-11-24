import { http } from './request'
import type { ActivityDetail, ActivityItem, Category, PageResult, PingResult } from '../types'

/**
 * 业务接口集合。写法约定：
 * - 只写相对路径（/app/...），域名交给 request.ts 与 vite 代理；
 * - 返回值直接声明成业务类型，拆包由 http 完成；
 * - 公开接口显式传 { auth: false }，避免未登录时发无效 token。
 */
export const api = {
  /** 探活：三端联调时第一步先打它 */
  ping: () => http.get<PingResult>('/ping', undefined, { auth: false }),

  /** 活动分类（首页分类条、列表页筛选） */
  categories: () => http.get<Category[]>('/app/categories', undefined, { auth: false }),

  /** 活动分页：timeScope 可选 TODAY / WEEK / MONTH / ENDED，sort 可选 HOT / LATEST */
  activities: (params?: {
    page?: number
    size?: number
    keyword?: string
    categoryId?: number
    timeScope?: string
    sort?: string
  }) => http.get<PageResult<ActivityItem>>('/app/activities', params, { auth: false }),

  /** 热门活动：首页横滑榜 */
  hotActivities: (limit = 5) =>
    http.get<ActivityItem[]>('/app/activities/hot', { limit }, { auth: false }),

  /** 活动详情 */
  activityDetail: (id: number | string) =>
    http.get<ActivityDetail>(`/app/activities/${id}`, undefined, { auth: false })
}
