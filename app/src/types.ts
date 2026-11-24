/**
 * 与后端接口一一对应的类型定义。改字段前先改后端 VO，两侧同名同义。
 * 约定：时间一律 string（yyyy-MM-dd HH:mm:ss），ID 一律 number（后端已把 Long 序列化为字符串，避免精度丢失）。
 */

/** 统一响应体：code === 0 为成功 */
export interface ApiResult<T> {
  code: number
  message: string
  data: T
}

/** 分页响应体：字段名固定，不做兼容映射 */
export interface PageResult<T> {
  records: T[]
  total: number
  page: number
  size: number
}

/** 活动状态：0 草稿 1 待审核 2 已驳回 3 已发布 4 进行中 5 已结束 6 已取消 */
export type ActivityStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** 报名状态：0 待审核 1 报名成功 2 已驳回 3 已签到 4 已取消 5 候补 6 候补转正 */
export type SignupStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** 用户角色，与后端 UserRole 枚举字符串一致 */
export type UserRole = 'STUDENT' | 'ORGANIZER' | 'REVIEWER' | 'ADMIN'

/** 活动分类 */
export interface Category {
  id: number
  name: string
  code: string
  icon?: string | null
  sort: number
  status: number
}

/** 活动列表项 */
export interface ActivityItem {
  id: number
  title: string
  coverUrl?: string | null
  summary?: string | null
  categoryId: number
  categoryName?: string | null
  orgId: number
  orgName?: string | null
  startTime: string
  endTime: string
  signupStartTime: string
  signupEndTime: string
  locationName: string
  /** 0 表示不限人数 */
  capacity: number
  signedCount: number
  /** 第二课堂分值类别 1思想成长 2社会实践及志愿服务 3创新创业 4文体活动 */
  scoreType?: number | null
  scoreTypeLabel?: string | null
  /** 签到后可得分值 */
  score?: number | null
  status: ActivityStatus
  statusLabel: string
  /** 当前是否处于报名窗口内 */
  signupOpen: boolean
  /** 当前用户在该活动下的报名状态，未登录或未报名为 null */
  mySignupStatus?: SignupStatus | null
}

/** 活动详情：列表项 + 详情页专有字段 */
export interface ActivityDetail extends ActivityItem {
  content?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  /** 取消报名截止时间 */
  cancelDeadline?: string | null
  /** 1 开启候补 0 关闭 */
  waitlistEnabled?: number
  /** 1 需要审核 0 直接通过 */
  auditRequired?: number
  /** 1 扫码 2 扫码+定位 3 仅手动 */
  checkinType?: number
  /** 自定义报名字段定义，JSON 字符串 */
  formFields?: string | null
  viewCount?: number
  favoriteCount?: number
  favorited?: boolean
  actionText?: string
  mySignupId?: number | null
}

/** 报名记录（我的报名列表用） */
export interface SignupItem {
  id: number
  activityId: number
  activityTitle: string
  coverUrl?: string | null
  startTime?: string | null
  endTime?: string | null
  locationName?: string | null
  status: SignupStatus
  statusLabel: string
  /** 报名号，签到现场核对用 */
  signupNo: string
  /** 候补序号，非候补为 0 */
  waitlistSeq: number
  createTime: string
  checkinTime?: string | null
  cancelDeadline?: string | null
  canCancel: boolean
  canCheckin: boolean
}

/** 用户信息（登录返回 / 我的页展示） */
export interface UserInfo {
  id: number
  nickname?: string | null
  avatarUrl?: string | null
  role: UserRole
  orgId?: number | null
  orgName?: string | null
  phone?: string | null
  studentNo?: string | null
  realName?: string | null
  college?: string | null
  grade?: string | null
  major?: string | null
  /** 是否已完成学号绑定 */
  bound: boolean
}

/** 登录结果 */
export interface LoginResult {
  token: string
  /** 首次登录需要补绑学号 */
  needBind: boolean
  user: UserInfo
}

/** 发送验证码结果：mock 通道且后端 expose-code 打开时 mockCode 有值 */
export interface SmsSendResult {
  phone: string
  expireSeconds: number
  intervalSeconds: number
  mockCode?: string | null
}

/** 站内消息（消息中心列表项） */
export interface SysNotice {
  id: number
  /** 消息类型：SIGNUP / AUDIT / CHECKIN … */
  type: string
  title: string
  content?: string | null
  /** 关联业务 ID，点进去可以跳对应页面 */
  bizId?: number | null
  /** 0 未读 1 已读 */
  readFlag: number
  createTime: string
}

/** 探活接口返回，用于联调自检 */
export interface PingResult {
  app: string
  serverTime: string
  apiPrefix: string
}

/** 扫码签到结果（POST /app/checkin） */
export interface CheckinResult {
  success: boolean
  message: string
  activityId: number | string
  activityTitle: string
  checkinTime: string
  studentName?: string | null
}

/** 组织者核销台：动态签到码 + 到场概览（GET /org/activities/{id}/checkin-qr） */
export interface CheckinQr {
  activityId: number | string
  activityTitle: string
  /** 形如 3010.5876531.9f2c…，每个时间片轮换一次 */
  token: string
  /** 轮换周期（秒），前端按它倒计时刷新 */
  refreshSeconds: number
  signedCount: number
  checkedInCount: number
  recentCheckins: string[]
}

/** 组织者工作台概览（GET /org/dashboard） */
export interface OrgDashboard {
  activityTotal: number | string
  publishedCount: number | string
  pendingAuditCount: number | string
  totalSignup: number | string
}

/** 组织者看到的报名明细（GET /org/activities/{id}/signups） */
export interface SignupDetail {
  id: number | string
  userId: number | string
  studentNo?: string | null
  realName?: string | null
  college?: string | null
  grade?: string | null
  status: SignupStatus
  statusLabel: string
  signupNo: string
  waitlistSeq: number
  createTime?: string | null
  checkinTime?: string | null
}

/** 文件上传结果（POST /files/upload） */
export interface UploadResult {
  objectKey: string
  originalName: string
  /** 可直接放进 image 的地址 */
  url: string
  size: number
  contentType: string
  storage: string
}
