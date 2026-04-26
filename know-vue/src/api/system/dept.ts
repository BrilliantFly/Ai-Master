import { service } from '@/utils/axios'

export interface DeptQuery extends Pagination {
  name?: string
  status?: number
  parentId?: number
}

export interface Dept {
  id?: number
  parentId?: number
  deptName: string
  deptCode?: string
  sort?: number
  leader?: string
  phone?: string
  email?: string
  status?: number
  createTime?: string
  children?: Dept[]
}

export function getDeptList(params: DeptQuery): Promise<any> {
  return service({
    url: '/system/dept/list',
    method: 'get',
    params
  })
}

export function getDeptTree(): Promise<any> {
  return service({
    url: '/system/dept/tree',
    method: 'get'
  })
}

export function getDept(id: number): Promise<any> {
  return service({
    url: `/system/dept/${id}`,
    method: 'get'
  })
}

export function addDept(data: Dept): Promise<any> {
  return service({
    url: '/system/dept',
    method: 'post',
    data
  })
}

export function updateDept(data: Dept): Promise<any> {
  return service({
    url: '/system/dept',
    method: 'put',
    data
  })
}

export function deleteDept(id: number): Promise<any> {
  return service({
    url: `/system/dept/${id}`,
    method: 'delete'
  })
}

// 获取部门下的用户列表
export function getDeptUsers(deptId: number): Promise<any> {
  return service({
    url: `/system/dept/${deptId}/users`,
    method: 'get'
  })
}

// 获取部门关联的岗位ID列表
export function getDeptJobs(deptId: number): Promise<any> {
  return service({
    url: `/system/dept/${deptId}/jobs`,
    method: 'get'
  })
}

// 分配岗位给部门
export function assignJobsToDept(deptId: number, jobIds: number[]): Promise<any> {
  return service({
    url: '/system/dept/assignJobs',
    method: 'post',
    data: { deptId, jobIds }
  })
}
