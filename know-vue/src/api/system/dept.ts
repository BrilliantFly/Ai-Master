import { service } from '@/utils/axios'

export interface DeptQuery extends Pagination {
  name?: string
  status?: number
  parentId?: number
}

export interface Dept {
  id?: number
  parentId: number
  title: string
  deptSort: number
  leader: string
  phone: string
  email: string
  enabled: boolean
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
