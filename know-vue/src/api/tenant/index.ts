import { service } from '@/utils/axios'

export interface TenantParams {
  pageNum?: number
  pageSize?: number
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

export function editTenant(data: Tenant) {
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
