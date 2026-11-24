import type { ApiResult, UserInfo } from '../types'

/**
 * 请求根地址：H5 走 vite 代理，只写相对路径；小程序没有代理，需要完整地址。
 * 后端地址只在这一处出现，页面与 api.ts 里不写域名。
 */
let BASE_URL = '/api'
// #ifndef H5
BASE_URL = 'http://127.0.0.1:8016/api'
// #endif

const TOKEN_KEY = 'campus_token'
const USER_KEY = 'campus_user'

export function getToken(): string {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

export function setToken(token: string): void {
  uni.setStorageSync(TOKEN_KEY, token)
}

/** 用户信息一并落盘：刷新后 store 初始化直接读，不用先请求 profile */
export function getStorageUser(): UserInfo | null {
  const raw = uni.getStorageSync(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw as string) as UserInfo
  } catch {
    return null
  }
}

export function setStorageUser(user: UserInfo): void {
  uni.setStorageSync(USER_KEY, JSON.stringify(user))
}

export function clearToken(): void {
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(USER_KEY)
}

export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: unknown
  /** 是否带登录态，默认带；登录、活动列表等公开接口传 false */
  auth?: boolean
  /** 是否显示全屏 loading */
  loading?: boolean
}

/**
 * 业务错误：把后端的 code 带出来，页面才能按错误码分支处理。
 * 只抛 Error 的话调用方只能读 message，做不了「名额已满」和「签到码过期」的差异化引导。
 */
export interface ApiError extends Error {
  code?: number
  status?: number
}

function bizError(message: string, code?: number, status?: number): ApiError {
  const error = new Error(message) as ApiError
  error.code = code
  error.status = status
  return error
}

type QueryParams = Record<string, string | number | boolean | undefined | null>

/** 拆包 + 分支处理：调用方拿到的是 data，不是 { code, message, data } */
export function request<T>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, auth = true, loading = false } = options

  if (loading) {
    uni.showLoading({ title: '加载中', mask: true })
  }

  return new Promise<T>((resolve, reject) => {
    const header: Record<string, string> = { 'Content-Type': 'application/json' }
    const token = getToken()
    if (auth && token) {
      header.Authorization = `Bearer ${token}`
    }

    uni.request({
      url: BASE_URL + url,
      method,
      data: data as string | Record<string, unknown> | ArrayBuffer | undefined,
      header,
      success: (res) => {
        const body = res.data as ApiResult<T> | undefined
        if (res.statusCode === 401) {
          clearToken()
          uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
          reject(bizError('登录已过期，请重新登录', body?.code ?? 10001, 401))
          return
        }
        if (res.statusCode === 403) {
          // 越权：后端 Security 直接回 403，body 里仍是统一结构（code 10002）
          uni.showToast({ title: body?.message || '没有操作权限', icon: 'none' })
          reject(bizError(body?.message || '没有操作权限', body?.code ?? 10002, 403))
          return
        }
        if (body && body.code === 0) {
          resolve(body.data)
          return
        }
        const message = body?.message || '请求失败'
        uni.showToast({ title: message, icon: 'none' })
        reject(bizError(message, body?.code, res.statusCode))
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，请检查后端是否启动', icon: 'none' })
        reject(err instanceof Error ? err : new Error('network error'))
      },
      complete: () => {
        if (loading) {
          uni.hideLoading()
        }
      }
    })
  })
}

function buildQuery(params?: QueryParams): string {
  if (!params) {
    return ''
  }
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
  return query ? `?${query}` : ''
}

export const http = {
  get<T>(url: string, params?: QueryParams, options: Partial<RequestOptions> = {}): Promise<T> {
    return request<T>({ url: url + buildQuery(params), method: 'GET', ...options })
  },
  post<T>(url: string, data?: unknown, options: Partial<RequestOptions> = {}): Promise<T> {
    return request<T>({ url, method: 'POST', data, ...options })
  },
  put<T>(url: string, data?: unknown, options: Partial<RequestOptions> = {}): Promise<T> {
    return request<T>({ url, method: 'PUT', data, ...options })
  },
  del<T>(url: string, options: Partial<RequestOptions> = {}): Promise<T> {
    return request<T>({ url, method: 'DELETE', ...options })
  }
}

/**
 * 文件上传：uni.request 发不了 multipart，单独走 uni.uploadFile。
 * 字段名固定 file、bizType 走 query 之外的 formData，与后端 FileController 一致。
 */
export function uploadFile(filePath: string, bizType = 'activity-cover'): Promise<string> {
  const token = getToken()
  return new Promise<string>((resolve, reject) => {
    uni.uploadFile({
      url: `${BASE_URL}/files/upload`,
      filePath,
      name: 'file',
      formData: { bizType },
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        let body: ApiResult<{ url: string }> | undefined
        try {
          body = JSON.parse(res.data) as ApiResult<{ url: string }>
        } catch {
          body = undefined
        }
        if (body && body.code === 0 && body.data?.url) {
          resolve(body.data.url)
          return
        }
        const message = body?.message || '上传失败'
        uni.showToast({ title: message, icon: 'none' })
        reject(bizError(message, body?.code, res.statusCode))
      },
      fail: () => {
        uni.showToast({ title: '上传失败，请检查网络', icon: 'none' })
        reject(bizError('上传失败，请检查网络'))
      }
    })
  })
}
