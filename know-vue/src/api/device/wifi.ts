import { service } from '@/utils/axios'

export interface WifiItem {
  id: number
  name: string
  ssid: string
  password: string
  encryption: string
  hidden: boolean
  sort: number
  remark: string
  createTime: string
  updateTime: string
}

export interface WifiForm {
  name: string
  ssid: string
  password: string
  encryption: string
  hidden: boolean
  sort: number
  remark: string
}

export function getWifiList() {
  return service({
    url: '/adminapi/wifi/list',
    method: 'get'
  })
}

export function getWifiDetail(id: number) {
  return service({
    url: '/adminapi/wifi/detail',
    method: 'get',
    params: { id }
  })
}

export function addWifi(data: WifiForm) {
  return service({
    url: '/adminapi/wifi/add',
    method: 'post',
    data
  })
}

export function editWifi(id: number, data: WifiForm) {
  return service({
    url: '/adminapi/wifi/edit',
    method: 'post',
    params: { id },
    data
  })
}

export function deleteWifi(id: number) {
  return service({
    url: '/adminapi/wifi/delete',
    method: 'post',
    params: { id }
  })
}

export function scanWifi() {
  return service({
    url: '/adminapi/wifi/scan',
    method: 'get'
  })
}
