import { service } from '@/utils/axios'

export interface RoleQuery extends Pagination {
  roleName?: string
  roleCode?: string
  status?: number
}

export interface Role {
  id?: number
  roleName: string
  roleCode: string
  sort?: number
  status?: number
  createTime?: string
}

export function getRoleList(params: RoleQuery): Promise<any> {
  return service({
    url: '/system/role/page',
    method: 'get',
    params
  })
}

// 获取所有正常角色（用于下拉选择）
export function getAllRoles(): Promise<any> {
  return service({
    url: '/system/role/list',
    method: 'get'
  })
}

export function getRole(id: number): Promise<any> {
  return service({
    url: `/system/role/${id}`,
    method: 'get'
  })
}

export function addRole(data: Role): Promise<any> {
  return service({
    url: '/system/role',
    method: 'post',
    data
  })
}

export function updateRole(data: Role): Promise<any> {
  return service({
    url: '/system/role',
    method: 'put',
    data
  })
}

export function deleteRole(id: number): Promise<any> {
  return service({
    url: `/system/role/${id}`,
    method: 'delete'
  })
}

// 获取角色关联的菜单ID
export function getRoleMenus(roleId: number): Promise<any> {
  return service({
    url: `/system/role/${roleId}/menus`,
    method: 'get'
  })
}

// 分配菜单权限
export function assignRoleMenus(roleId: number, menuIds: number[]): Promise<any> {
  return service({
    url: `/system/role/${roleId}/menus`,
    method: 'put',
    data: menuIds
  })
}

// ==================== 角色数据权限 API ====================
export interface RoleDataScope {
  roleId: number
  dataScopeType: number
  customDeptIds?: number[]
}

export function getRoleDataScope(roleId: number): Promise<any> {
  return service({
    url: `/system/role/data-scope/${roleId}`,
    method: 'get'
  })
}

export function getRoleDataScopeType(roleId: number): Promise<any> {
  return service({
    url: `/system/role/data-scope/type/${roleId}`,
    method: 'get'
  })
}

export function saveRoleDataScope(roleId: number, dataScopeType: number, customDeptIds?: number[]): Promise<any> {
  return service({
    url: '/system/role/data-scope',
    method: 'post',
    data: { roleId, dataScopeType, customDeptIds }
  })
}
