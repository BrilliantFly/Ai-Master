import { service } from '@/utils/axios'

export interface UserQuery extends Pagination {
  username?: string
  nickName?: string
  status?: number
  deptId?: number
}

export interface User {
  id?: number
  username: string
  nickName: string
  gender: number
  phone: string
  email: string
  deptId: number
  dept?: string
  enabled: boolean
  createTime?: string
}

export function getUserList(params: UserQuery): Promise<any> {
  return service({
    url: '/system/user/list',
    method: 'get',
    params
  })
}

export function getUser(id: number): Promise<any> {
  return service({
    url: `/system/user/${id}`,
    method: 'get'
  })
}

export function addUser(data: User): Promise<any> {
  return service({
    url: '/system/user',
    method: 'post',
    data
  })
}

export function updateUser(data: User): Promise<any> {
  return service({
    url: '/system/user',
    method: 'put',
    data
  })
}

export function deleteUser(id: number): Promise<any> {
  return service({
    url: `/system/user/${id}`,
    method: 'delete'
  })
}

export function resetPassword(id: number): Promise<any> {
  return service({
    url: `/system/user/${id}/resetPassword`,
    method: 'put'
  })
}
