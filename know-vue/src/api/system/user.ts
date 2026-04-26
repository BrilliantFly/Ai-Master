import { service } from '@/utils/axios'

export interface UserQuery extends Pagination {
  username?: string
  realname?: string
  status?: number
}

export interface User {
  id?: number
  username: string
  realname: string
  password?: string
  phone?: string
  email?: string
  sex?: number
  status?: number
  createTime?: string
}

export function getUserList(params: UserQuery): Promise<any> {
  return service({
    url: '/system/user/page',
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

// 获取用户关联的租户ID列表
export function getUserTenants(userId: number): Promise<any> {
  return service({
    url: `/system/user/${userId}/tenants`,
    method: 'get'
  })
}

// 分配租户给用户
export function assignTenantsToUser(userId: number, tenantIds: number[]): Promise<any> {
  return service({
    url: '/system/user/assignTenants',
    method: 'post',
    data: { userId, tenantIds }
  })
}

// 获取用户关联的角色ID列表
export function getUserRoles(userId: number): Promise<any> {
  return service({
    url: `/system/user/${userId}/roles`,
    method: 'get'
  })
}

// 分配角色给用户
export function assignRolesToUser(userId: number, roleIds: number[]): Promise<any> {
  return service({
    url: '/system/user/assignRoles',
    method: 'post',
    data: { userId, roleIds }
  })
}

// 获取用户关联的部门ID列表
export function getUserDepts(userId: number): Promise<any> {
  return service({
    url: `/system/user/${userId}/depts`,
    method: 'get'
  })
}

// 分配部门给用户
export function assignDeptsToUser(userId: number, deptIds: number[]): Promise<any> {
  return service({
    url: '/system/user/assignDepts',
    method: 'post',
    data: { userId, deptIds }
  })
}

// 获取用户关联的岗位ID列表
export function getUserJobs(userId: number): Promise<any> {
  return service({
    url: `/system/user/${userId}/jobs`,
    method: 'get'
  })
}

// 分配岗位给用户
export function assignJobsToUser(userId: number, jobIds: number[]): Promise<any> {
  return service({
    url: '/system/user/assignJobs',
    method: 'post',
    data: { userId, jobIds }
  })
}
