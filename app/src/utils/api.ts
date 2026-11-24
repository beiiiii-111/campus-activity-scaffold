import { http } from './request'
import type {
  ActivityDetail,
  ActivityItem,
  Category,
  LoginResult,
  PageResult,
  PingResult,
  SignupItem,
  SmsSendResult,
  SysNotice,
  UserInfo
} from '../types'

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
    http.get<ActivityDetail>(`/app/activities/${id}`, undefined, { auth: false }),

  /** 提交报名：formData 是自定义字段答案的 JSON 字符串，没有自定义表单可不传 */
  signup: (id: number | string, formData?: string) =>
    http.post<SignupItem>(`/app/activities/${id}/signup`, formData ? { formData } : {}),

  /** 当前登录用户资料：报名页用来预填姓名、学号，并判断是否已绑定学号 */
  profile: () => http.get<UserInfo>('/app/user/profile'),

  /** 发送短信验证码：mock 通道会把验证码回传到 mockCode，方便课堂演示 */
  sendSmsCode: (phone: string) =>
    http.post<SmsSendResult>('/app/auth/sms/send-code', { phone }, { auth: false }),

  /** 手机号 + 验证码登录，needBind=true 表示还没绑定学号 */
  smsLogin: (phone: string, code: string) =>
    http.post<LoginResult>('/app/auth/sms/login', { phone, code }, { auth: false }),

  /** 绑定学号：姓名、学号必填，学院/年级/专业选填 */
  bind: (data: { studentNo: string; realName: string; college?: string; grade?: string; major?: string }) =>
    http.post<UserInfo>('/app/auth/bind', data),

  /** 退出登录：后端拉黑 token，本地清 storage */
  logout: () => http.post<void>('/app/auth/logout', {}),

  /** 我的报名分页，status 不传表示全部 */
  mySignups: (params?: { page?: number; size?: number; status?: number }) =>
    http.get<PageResult<SignupItem>>('/app/signups', params),

  /** 取消报名：只有 canCancel=true 的报名才允许 */
  cancelSignup: (id: number | string) => http.post<void>(`/app/signups/${id}/cancel`, {}),

  /** 消息中心分页 */
  messages: (params?: { page?: number; size?: number }) =>
    http.get<PageResult<SysNotice>>('/app/messages', params),

  /** 未读消息数：我的页小红点用 */
  unreadCount: () => http.get<{ count: number }>('/app/messages/unread-count'),

  /** 标记已读：ids 为 null 表示全部已读 */
  markRead: (ids: number[] | null) => http.post<void>('/app/messages/read', { ids })
}
