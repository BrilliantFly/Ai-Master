import { service } from '@/utils/axios'

export interface CameraItem {
  id: string
  name: string
  ip: string
  port: number
  httpPort: number
  channel: number
  streamType: string
  rtspUrl: string
  username: string
  password: string
  manufacturer: string
  model: string
  status: number
  wifiSsid: string
  wifiBssid: string
  thumbnail: string
  streamUrl: string
  lastOnlineTime: string
  lastStreamTime: string
  playCount: number
  sort: number
  remark: string
  createTime: string
  updateTime: string
}

export interface CameraForm {
  name: string
  ip: string
  port: number
  httpPort: number
  username: string
  password: string
  channel: number
  streamType: string
  manufacturer: string
  model: string
  remark: string
  sort: number
}

export function getCameraList() {
  return service({
    url: '/adminapi/camera/list',
    method: 'get'
  })
}

export function getCameraDetail(id: number) {
  return service({
    url: '/adminapi/camera/detail',
    method: 'get',
    params: { id }
  })
}

export function addCamera(data: CameraForm) {
  return service({
    url: '/adminapi/camera/add',
    method: 'post',
    data
  })
}

export function editCamera(id: number, data: CameraForm) {
  return service({
    url: '/adminapi/camera/edit',
    method: 'post',
    params: { id },
    data
  })
}

export function deleteCamera(id: number) {
  return service({
    url: '/adminapi/camera/delete',
    method: 'post',
    params: { id }
  })
}

export function scanLanDevices() {
  return service({
    url: '/adminapi/camera/scan',
    method: 'get'
  })
}

export function checkCameraOnline(id: number) {
  return service({
    url: `/adminapi/camera/check/${id}`,
    method: 'post'
  })
}

export function getStreamUrl(id: number) {
  return service({
    url: `/adminapi/camera/stream/${id}`,
    method: 'get'
  })
}
