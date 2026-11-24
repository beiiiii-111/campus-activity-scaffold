import type { ActivityStatus, AuditAction, SignupStatus, TagType, UserRole } from '@/types/api'

/**
 * 字典唯一来源：状态码 → 文案 / 颜色，只在后端枚举改动时同步这里。
 * 页面里禁止再写 status === 3 ? '已发布' 这类硬编码。
 */

export interface DictOption<T> {
    value: T
    label: string
}

/** 活动状态 */
export const ACTIVITY_STATUS_OPTIONS: Array<DictOption<ActivityStatus> & { type: TagType }> = [
    { value: 0, label: '草稿', type: 'info' },
    { value: 1, label: '待审核', type: 'warning' },
    { value: 2, label: '已驳回', type: 'danger' },
    { value: 3, label: '已发布', type: 'success' },
    { value: 4, label: '进行中', type: 'primary' },
    { value: 5, label: '已结束', type: 'info' },
    { value: 6, label: '已取消', type: 'danger' }
]

/** 报名（结算）状态 */
export const SIGNUP_STATUS_OPTIONS: Array<DictOption<SignupStatus> & { type: TagType }> = [
    { value: 0, label: '待审核', type: 'warning' },
    { value: 1, label: '报名成功', type: 'success' },
    { value: 2, label: '已驳回', type: 'danger' },
    { value: 3, label: '已签到', type: 'primary' },
    { value: 4, label: '已取消', type: 'info' },
    { value: 5, label: '候补中', type: 'warning' },
    { value: 6, label: '候补转正', type: 'success' }
]

/** 签到方式 */
export const CHECKIN_TYPE_OPTIONS: DictOption<number>[] = [
    { value: 1, label: '扫码签到' },
    { value: 2, label: '扫码 + 定位' },
    { value: 3, label: '仅手动补签' }
]

/** 用户角色 */
export const ROLE_OPTIONS: DictOption<UserRole>[] = [
    { value: 'STUDENT', label: '学生' },
    { value: 'ORGANIZER', label: '活动组织者' },
    { value: 'REVIEWER', label: '审核员' },
    { value: 'ADMIN', label: '管理员' }
]

/** 审核 / 审计动作 */
export const AUDIT_ACTION_LABELS: Record<AuditAction | string, string> = {
    APPROVE: '通过',
    REJECT: '驳回',
    CANCEL: '取消',
    DELETE: '删除',
    MANUAL_CHECKIN: '手动补签',
    REVOKE_CHECKIN: '撤销签到',
    ROLE_CHANGE: '角色变更'
}

/** 操作日志的业务类型 */
export const BIZ_TYPE_LABELS: Record<string, string> = {
    ACTIVITY: '活动',
    SIGNUP: '报名',
    CHECKIN: '签到',
    USER: '用户'
}

export const BIZ_TYPE_OPTIONS: DictOption<string>[] = [
    { value: 'ACTIVITY', label: '活动' },
    { value: 'SIGNUP', label: '报名' },
    { value: 'CHECKIN', label: '签到' },
    { value: 'USER', label: '用户' }
]

export const AUDIT_ACTION_OPTIONS: DictOption<string>[] = [
    { value: 'APPROVE', label: '通过' },
    { value: 'REJECT', label: '驳回' },
    { value: 'CANCEL', label: '取消' },
    { value: 'DELETE', label: '删除' },
    { value: 'MANUAL_CHECKIN', label: '手动补签' },
    { value: 'REVOKE_CHECKIN', label: '撤销签到' },
    { value: 'ROLE_CHANGE', label: '角色变更' }
]

export function bizTypeLabel(type?: string | null): string {
    if (!type) return '-'
    return BIZ_TYPE_LABELS[type] || type
}

function toMap<T extends DictOption<number>>(options: T[]): Record<number, T> {
    return options.reduce<Record<number, T>>((acc, item) => {
        acc[item.value] = item
        return acc
    }, {})
}

const ACTIVITY_STATUS_MAP = toMap(ACTIVITY_STATUS_OPTIONS)
const SIGNUP_STATUS_MAP = toMap(SIGNUP_STATUS_OPTIONS)

export function activityStatusLabel(status?: number | null, fallback?: string | null): string {
    if (fallback) return fallback
    if (status == null) return '未知'
    return ACTIVITY_STATUS_MAP[status]?.label || '未知'
}

export function activityStatusType(status?: number | null): TagType {
    if (status == null) return 'info'
    return ACTIVITY_STATUS_MAP[status]?.type || 'info'
}

export function signupStatusLabel(status?: number | null, fallback?: string | null): string {
    if (fallback) return fallback
    if (status == null) return '未知'
    return SIGNUP_STATUS_MAP[status]?.label || '未知'
}

export function signupStatusType(status?: number | null): TagType {
    if (status == null) return 'info'
    return SIGNUP_STATUS_MAP[status]?.type || 'info'
}

export function roleLabel(role?: string | null): string {
    if (!role) return '-'
    return ROLE_OPTIONS.find((item) => item.value === role)?.label || role
}

export function auditActionLabel(action?: string | null): string {
    if (!action) return '-'
    return AUDIT_ACTION_LABELS[action] || action
}

export function checkinTypeLabel(type?: number | null): string {
    if (type == null) return '-'
    return CHECKIN_TYPE_OPTIONS.find((item) => item.value === type)?.label || String(type)
}
