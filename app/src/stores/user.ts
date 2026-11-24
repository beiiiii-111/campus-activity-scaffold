import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { clearToken, getStorageUser, getToken, setStorageUser, setToken } from '../utils/request'
import type { UserInfo } from '../types'

/**
 * 登录态 store（pinia setup 写法）。
 *
 * 小程序没有 localStorage，持久层换成 uni.setStorageSync（key 与 request.ts 里保持一致），
 * 所以刷新/重启小程序后 token 还在，不用重新登录。
 */
export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken())
  const user = ref<UserInfo | null>(getStorageUser())

  const isLogin = computed(() => Boolean(token.value))
  const nickname = computed(() => user.value?.nickname || user.value?.realName || '未登录')
  const bound = computed(() => Boolean(user.value?.bound))

  function saveLogin(nextToken: string, nextUser: UserInfo): void {
    token.value = nextToken
    user.value = nextUser
    setToken(nextToken)
    setStorageUser(nextUser)
  }

  function updateUser(nextUser: UserInfo): void {
    user.value = nextUser
    setStorageUser(nextUser)
  }

  function logout(): void {
    token.value = ''
    user.value = null
    clearToken()
  }

  return { token, user, isLogin, nickname, bound, saveLogin, updateUser, logout }
})
