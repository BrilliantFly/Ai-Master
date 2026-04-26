import { service } from '@/utils/axios'

export interface TenantParams {
  pageNum?: number
  pageSize?: number
  name?: string
  code?: string
  status?: number
}

export interface Tenant {
  id?: number
  name: string
  code: string
  logo?: string
  status?: number
  expireTime?: string
}

export function getTenantList(params?: TenantParams) {
  return service({
    url: '/tenant/list',
    method: 'get',
    params
  })
}

export function getTenantDetail(id: number) {
  return service({
    url: '/tenant/detail',
    method: 'get',
    params: { id }
  })
}

export function addTenant(data: Tenant) {
  return service({
    url: '/tenant/add',
    method: 'post',
    data
  })
}

export function updateTenant(data: Tenant) {
  return service({
    url: '/tenant/edit',
    method: 'post',
    data
  })
}

export function deleteTenant(id: number) {
  return service({
    url: '/tenant/delete',
    method: 'post',
    params: { id }
  })
}

// 获取租户关联的角色
export function getTenantRoles(tenantId: number) {
  return service({
    url: `/tenant/${tenantId}/roles`,
    method: 'get'
  })
}

// 分配角色给租户
export function assignTenantRoles(tenantId: number, roleIds: number[]) {
  return service({
    url: '/tenant/assignRoles',
    method: 'post',
    data: { tenantId, roleIds }
  })
}

// 获取租户关联的用户ID列表
export function getTenantUsers(tenantId: number) {
  return service({
    url: `/tenant/${tenantId}/users`,
    method: 'get'
  })
}

// 分配用户到租户
export function assignUsersToTenant(tenantId: number, userIds: number[], isAdmin?: boolean) {
  return service({
    url: '/tenant/assignUsers',
    method: 'post',
    data: { tenantId, userIds, isAdmin: isAdmin || false }
  })
}

// 获取所有用户（用于分配）
export function getAllUsers() {
  return service({
    url: '/system/user/list',
    method: 'get',
    params: { pageNum: 1, pageSize: 1000 }
  })
}
