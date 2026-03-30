import { service } from '@/utils/axios'

export interface RoleQuery extends Pagination {
  name?: string
  code?: string
  status?: number
}

export interface Role {
  id?: number
  name: string
  code: string
  level: number
  description: string
  dataScope: number
  enabled: boolean
  createTime?: string
}

export function getRoleList(params: RoleQuery): Promise<any> {
  return service({
    url: '/system/role/list',
    method: 'get',
    params
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
