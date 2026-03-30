import { service } from '@/utils/axios'

export interface MenuQuery extends Pagination {
  title?: string
  name?: string
  type?: number
  status?: number
}

export interface Menu {
  id?: number
  parentId: number
  title: string
  name: string
  icon: string
  type: number
  menuSort: number
  path: string
  component: string
  permission: string
  iframe: boolean
  cache: boolean
  hidden: boolean
  enabled: boolean
  createTime?: string
  children?: Menu[]
}

export function getMenuList(params: MenuQuery): Promise<any> {
  return service({
    url: '/system/menu/list',
    method: 'get',
    params
  })
}

export function getMenuTree(): Promise<any> {
  return service({
    url: '/system/menu/tree',
    method: 'get'
  })
}

export function getMenu(id: number): Promise<any> {
  return service({
    url: `/system/menu/${id}`,
    method: 'get'
  })
}

export function addMenu(data: Menu): Promise<any> {
  return service({
    url: '/system/menu',
    method: 'post',
    data
  })
}

export function updateMenu(data: Menu): Promise<any> {
  return service({
    url: '/system/menu',
    method: 'put',
    data
  })
}

export function deleteMenu(id: number): Promise<any> {
  return service({
    url: `/system/menu/${id}`,
    method: 'delete'
  })
}
