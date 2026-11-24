import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { clearAuth, getCurrentUser, getToken, setAuth } from '@/api/request'
import type { UserInfo } from '@/types/api'

/**
 * 登录态 store（Pinia setup 写法）。
 *
 * 状态分两层：
 *   1. 内存层：token / user 两个 ref，页面直接用；
 *   2. 持久层：localStorage（由 request.ts 的 setAuth / clearAuth 维护），
 *      store 初始化时反读，所以刷新页面不会掉登录态。
 *
 * 登出必须同时清两层，否则刷新后又"复活"了。
 */
export const useUserStore = defineStore('user', () => {
    const token = ref<string>(getToken())
    const user = ref<UserInfo | null>(getCurrentUser())

    const role = computed(() => user.value?.role || '')
    const nickname = computed(() => user.value?.nickname || user.value?.realName || '未登录')
    const isLogin = computed(() => Boolean(token.value))

    /** 登录成功后写两层 */
    function saveLogin(nextToken: string, nextUser: UserInfo): void {
        token.value = nextToken
        user.value = nextUser
        setAuth(nextToken, nextUser)
    }

    /** 登出：内存 + 本地存储一起清 */
    function logout(): void {
        token.value = ''
        user.value = null
        clearAuth()
    }

    return { token, user, role, nickname, isLogin, saveLogin, logout }
})
