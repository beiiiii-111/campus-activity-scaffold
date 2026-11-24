import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * 按钮级权限：v-perm="['ADMIN']"。
 *
 * 为什么不用 v-if="store.role === 'ADMIN'"：
 *   1. 角色判断散落在每个页面里，改角色口径要全仓搜；
 *   2. 指令能统一成「不在允许列表里就把节点摘掉」，还顺手禁用点击，防止被模板里漏写。
 *
 * 注意：前端隐藏只是体验，真正拦住越权的是后端 @PreAuthorize（10002）与路由守卫。
 */
function canAccess(binding: DirectiveBinding<string[] | string | undefined>, role: string): boolean {
  const required = binding.value
  if (!required) return true
  const list = Array.isArray(required) ? required : [required]
  if (list.length === 0) return true
  return list.includes(role)
}

const permission: Directive<HTMLElement, string[] | string> = {
  mounted(el, binding) {
    const store = useUserStore()
    if (!canAccess(binding, store.role)) {
      el.parentNode?.removeChild(el)
    }
  }
}

export default permission
