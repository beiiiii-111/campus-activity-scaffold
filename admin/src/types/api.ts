/**
 * 后端接口数据结构。与 app/src/types.ts 保持同名同义，改一处必须改三处（后端 VO / 小程序 / 后台）。
 * 约定：时间为 string（yyyy-MM-dd HH:mm:ss），ID 为 number（后端把 Long 序列化成字符串，避免 JS 精度丢失）。
 */

/** 统一响应体 */
export interface ApiResult<T> {
    code: number
    message: string
    data: T
}

/** 分页响应体 */
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

/** 用户角色 */
export type UserRole = 'STUDENT' | 'ORGANIZER' | 'REVIEWER' | 'ADMIN'

/** 审计动作 */
export type AuditAction = 'APPROVE' | 'REJECT' | 'CANCEL' | 'DELETE' | 'MANUAL_CHECKIN' | 'ROLE_CHANGE'

/** Element Plus 标签类型 */
export type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'

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
    signupOpen: boolean
    mySignupStatus?: SignupStatus | null
}

/** 活动详情 */
export interface ActivityDetail extends ActivityItem {
    content?: string | null
    address?: string | null
    latitude?: number | null
    longitude?: number | null
    cancelDeadline?: string | null
    /** 1 开启候补 0 关闭 */
    waitlistEnabled?: number
    /** 1 需要审核 0 直接通过 */
    auditRequired?: number
    /** 1 扫码 2 扫码+定位 3 仅手动 */
    checkinType?: number
    formFields?: string | null
    viewCount?: number
    favoriteCount?: number
}

/** 报名记录 */
export interface SignupItem {
    id: number
    activityId: number
    activityTitle: string
    userId: number
    studentNo?: string | null
    realName?: string | null
    status: SignupStatus
    statusLabel: string
    signupNo: string
    waitlistSeq: number
    createTime: string
    checkinTime?: string | null
}

/** 用户信息 */
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
    bound: boolean
}

/** 登录结果 */
export interface LoginResult {
    token: string
    needBind: boolean
    user: UserInfo
}

/** 通用分页入参 */
export interface PageQuery {
    page: number
    size: number
}

/** 活动列表入参 */
export interface ActivityQuery extends PageQuery {
    keyword?: string
    /** 空字符串表示不限状态 */
    status?: ActivityStatus | ''
}

/** 探活接口返回 */
export interface PingResult {
    app: string
    serverTime: string
    apiPrefix: string
}

/** 工作台统计（不含热门活动） */
export interface DashboardSummary {
    userTotal: number
    studentTotal: number
    activityTotal: number
    publishedCount: number
    pendingAuditCount: number
    signupTotal: number
    checkinTotal: number
}

/** 工作台热门活动 */
export interface DashboardTopActivity {
    id: number
    title: string
    signupCount?: number | null
    capacity?: number | null
}

/** 工作台数据：统计 + 热门榜 */
export interface DashboardData extends DashboardSummary {
    topActivities: DashboardTopActivity[]
}

/** 活动审核入参：pass=true 通过，false 驳回（驳回必须给理由，后端会写进审计日志） */
export interface AuditParams {
    pass: boolean
    reason?: string
}
