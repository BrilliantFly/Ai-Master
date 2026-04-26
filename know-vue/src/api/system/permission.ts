import { service } from '@/utils/axios'

export interface PermissionQuery extends Pagination {
  name?: string
  code?: string
  permissionType?: string
  status?: number
}

export interface Permission {
  id?: number
  parentId: number
  name: string
  code: string
  permissionType: string
  resourceType?: string
  path?: string
  component?: string
  icon?: string
  sort: number
  status: number
  createTime?: number
  children?: Permission[]
}

/**
 * 分页查询权限
 */
export function getPermissionList(params: PermissionQuery): Promise<any> {
  return service({
    url: '/system/permission/page',
    method: 'get',
    params
  })
}

/**
 * 获取所有权限列表
 */
export function getPermissionAll(params?: any): Promise<any> {
  return service({
    url: '/system/permission/list',
    method: 'get',
    params
  })
}

/**
 * 获取权限树
 */
export function getPermissionTree(): Promise<any> {
  return service({
    url: '/system/permission/tree',
    method: 'get'
  })
}

/**
 * 获取权限详情
 */
export function getPermission(id: number): Promise<any> {
  return service({
    url: `/system/permission/${id}`,
    method: 'get'
  })
}

/**
 * 新增权限
 */
export function addPermission(data: Permission): Promise<any> {
  return service({
    url: '/system/permission',
    method: 'post',
    data
  })
}

/**
 * 修改权限
 */
export function updatePermission(data: Permission): Promise<any> {
  return service({
    url: '/system/permission',
    method: 'put',
    data
  })
}

/**
 * 删除权限
 */
export function deletePermission(id: number): Promise<any> {
  return service({
    url: `/system/permission/${id}`,
    method: 'delete'
  })
}

/**
 * 根据角色获取权限
 */
export function getPermissionByRole(roleId: number): Promise<any> {
  return service({
    url: `/system/permission/role/${roleId}`,
    method: 'get'
  })
}

/**
 * 根据用户获取权限编码
 */
export function getPermissionCodesByUser(userId: number): Promise<any> {
  return service({
    url: `/system/permission/user/${userId}`,
    method: 'get'
  })
}

// ========== 角色权限关联 ==========

/**
 * 获取角色权限关联列表
 */
export function getRolePermissionList(params?: any): Promise<any> {
  return service({
    url: '/system/rolePermission/list',
    method: 'get',
    params
  })
}

/**
 * 根据角色获取权限ID列表
 */
export function getPermissionIdsByRole(roleId: number): Promise<any> {
  return service({
    url: `/system/rolePermission/role/${roleId}`,
    method: 'get'
  })
}

/**
 * 分配权限给角色
 */
export function assignPermissions(roleId: number, permissionIds: number[]): Promise<any> {
  return service({
    url: '/system/rolePermission/assign',
    method: 'post',
    params: { roleId },
    data: permissionIds
  })
}