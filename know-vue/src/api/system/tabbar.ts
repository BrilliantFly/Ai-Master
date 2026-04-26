import { service } from '@/utils/axios'

export interface TabbarQuery {
  name?: string
  status?: number
}

export interface Tabbar {
  id?: number
  name: string
  icon?: string
  url?: string
  sort?: number
  status?: number
}

export function getTabbarList(params: TabbarQuery): Promise<any> {
  return service({
    url: '/system/tabbar/list',
    method: 'get',
    params
  })
}

export function getTabbar(id: number): Promise<any> {
  return service({
    url: `/system/tabbar/${id}`,
    method: 'get'
  })
}

export function addTabbar(data: Tabbar): Promise<any> {
  return service({
    url: '/system/tabbar',
    method: 'post',
    data
  })
}

export function updateTabbar(data: Tabbar): Promise<any> {
  return service({
    url: '/system/tabbar',
    method: 'put',
    data
  })
}

export function deleteTabbar(id: number): Promise<any> {
  return service({
    url: `/system/tabbar/${id}`,
    method: 'delete'
  })
}
