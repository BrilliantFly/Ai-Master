import { service } from '@/utils/axios'

export interface CompanyItem {
  id: number
  name: string
  industry: string
  scale: string
  business: string
  establishedDate: string
  capital: string
  address: string
  contactName: string
  contactPhone: string
  contactPosition: string
  createTime: string
}

export interface CompanyForm {
  name: string
  industry: string
  scale: string
  business: string
  establishedDate: string
  capital: string
  address: string
  contactName: string
  contactPhone: string
  contactPosition: string
}

export function getCompanyList() {
  return service({
    url: '/customer/company/list',
    method: 'get'
  })
}

export function getCompanyDetail(id: number) {
  return service({
    url: '/customer/company/detail',
    method: 'get',
    params: { id }
  })
}

export function addCompany(data: CompanyForm) {
  return service({
    url: '/customer/company/add',
    method: 'post',
    data
  })
}

export function editCompany(id: number, data: CompanyForm) {
  return service({
    url: '/customer/company/edit',
    method: 'post',
    params: { id },
    data
  })
}

export function deleteCompany(id: number) {
  return service({
    url: '/customer/company/delete',
    method: 'post',
    params: { id }
  })
}
