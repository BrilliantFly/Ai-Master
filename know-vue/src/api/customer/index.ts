import { service } from '@/utils/axios'

export interface CustomerItem {
  id: number
  name: string
  gender: number
  genderText: string
  age: number
  phone: string
  email: string
  address: string
  education: string
  occupation: string
  position: string
  avatar: string
  customerType: number
  customerTypeText: string
  companyId: number
  companyName: string
  status: number
  statusText: string
  source: string
  demandLevel: number
  demandLevelText: string
  valueScore: number
  valueScoreText: string
  demandWillingness: number
  demandBudget: number
  demandDecision: number
  demandPriority: string
  demandPriorityText: string
  demandTags: string
  demandDesc: string
  createTime: string
}

export interface CustomerForm {
  name: string
  gender: number
  age: number
  phone: string
  email: string
  address: string
  education: string
  occupation: string
  position: string
  personality: string
  hobby: string
  avatar: string
  customerType: number
  companyId: number
  status: number
  source: string
  demandLevel: number
  valueScore: number
  demandWillingness: number
  demandBudget: number
  demandDecision: number
  demandPriority: string
  demandTags: string
  demandDesc: string
}

export function getCustomerList(params: {
  keyword?: string
  status?: number
  customerType?: number
  page?: number
  pageSize?: number
}) {
  return service({
    url: '/customer/list',
    method: 'get',
    params
  })
}

export function getCustomerDetail(id: number) {
  return service({
    url: '/customer/detail',
    method: 'get',
    params: { id }
  })
}

export function addCustomer(data: CustomerForm) {
  return service({
    url: '/customer/add',
    method: 'post',
    data
  })
}

export function editCustomer(id: number, data: CustomerForm) {
  return service({
    url: '/customer/edit',
    method: 'post',
    params: { id },
    data
  })
}

export function deleteCustomer(id: number) {
  return service({
    url: '/customer/delete',
    method: 'post',
    params: { id }
  })
}

export function getCustomerStats() {
  return service({
    url: '/customer/stats',
    method: 'get'
  })
}
