import { service } from '@/utils/axios'

export interface FollowupItem {
  id: number
  customerId: number
  customerName: string
  type: string
  content: string
  result: string
  nextTime: string
  createUser: number
  createUserName: string
  createTime: string
}

export interface FollowupForm {
  customerId: number
  type: string
  content: string
  result: string
  nextTime: string
}

export function getFollowupList(customerId?: number) {
  return service({
    url: '/customer/followup/list',
    method: 'get',
    params: { customerId }
  })
}

export function getFollowupDetail(id: number) {
  return service({
    url: '/customer/followup/detail',
    method: 'get',
    params: { id }
  })
}

export function addFollowup(data: FollowupForm) {
  return service({
    url: '/customer/followup/add',
    method: 'post',
    data
  })
}

export function deleteFollowup(id: number) {
  return service({
    url: '/customer/followup/delete',
    method: 'post',
    params: { id }
  })
}
