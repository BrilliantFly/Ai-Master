import type { Directive, DirectiveBinding } from 'vue'

/**
 * 权限指令 v-permission
 * 用法: v-permission="'system:user:add'" 或 v-permission="['system:user:add', 'system:user:edit']"
 */

interface PermissionElement extends HTMLElement {
  _permission_instance?: DirectiveBinding
}

export const permission = {
  mounted(el: PermissionElement, binding: DirectiveBinding) {
    // 存储绑定实例引用以便后续清理
    el._permission_instance = binding

    // 获取权限列表（从localStorage或Vuex）
    const permissions = getPermissions()

    // 支持单个权限或权限数组
    const requiredPermissions = Array.isArray(binding.value)
      ? binding.value
      : [binding.value]

    // 检查是否有权限
    const hasPermission = requiredPermissions.some((perm: string) => {
      if (!perm) return true // 空权限直接放行
      return permissions.includes(perm)
    })

    // 没有权限则隐藏元素
    if (!hasPermission) {
      el.style.display = 'none'
    }
  },
  updated(el: PermissionElement, binding: DirectiveBinding) {
    // 元素更新时重新检查
    el._permission_instance = binding

    const permissions = getPermissions()

    const requiredPermissions = Array.isArray(binding.value)
      ? binding.value
      : [binding.value]

    const hasPermission = requiredPermissions.some((perm: string) => {
      if (!perm) return true
      return permissions.includes(perm)
    })

    el.style.display = hasPermission ? '' : 'none'
  }
}

/**
 * 从存储获取权限列表
 */
function getPermissions(): string[] {
  try {
    // 优先从Vuex获取，其次从localStorage
    const stored = localStorage.getItem('permissions')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('获取权限列表失败:', e)
  }
  return []
}

/**
 * 权限检查函数 - 可在代码中调用
 */
export function hasPermission(permission: string | string[]): boolean {
  const permissions = getPermissions()

  if (Array.isArray(permission)) {
    return permission.some((p: string) => permissions.includes(p))
  }

  return permissions.includes(permission)
}

/**
 * 设置权限列表 - 登录后调用
 */
export function setPermissions(permissions: string[]) {
  localStorage.setItem('permissions', JSON.stringify(permissions))
}

/**
 * 清除权限列表 - 登出时调用
 */
export function clearPermissions() {
  localStorage.removeItem('permissions')
}

export default permission