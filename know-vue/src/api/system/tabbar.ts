import { service } from '@/utils/axios'

export function getTabbarDetail() {
  return service({
    url: '/adminapi/sys.tabbar/detail',
    method: 'get'
  })
}

export function saveTabbar(data: any) {
  return service({
    url: '/adminapi/sys.tabbar/save',
    method: 'post',
    data
  })
}

export function sortTabbar(ids: number[]) {
  return service({
    url: '/adminapi/sys.tabbar/sort',
    method: 'post',
    data: ids
  })
}
