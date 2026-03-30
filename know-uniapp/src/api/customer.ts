import request from '@/utils/request'
import { merge } from 'lodash-es'
import HttpRequest from '@/utils/request/http'
import appConfig from '@/config'
import { getToken } from '@/utils/auth'

// Customer service request instance
const customerRequestOptions = {
    requestOptions: {
        timeout: appConfig.timeout,
    },
    baseUrl: appConfig.customerBaseUrl,
    isReturnDefaultResponse: false,
    isTransformResponse: true,
    urlPrefix: '',
    ignoreCancel: false,
    withToken: true,
    isAuth: false,
    retryCount: 2,
    retryTimeout: 1000,
}

const customerRequestHooks = {
    requestInterceptorsHook(options: any, config: any) {
        options.header = options.header ?? {}
        const token = getToken()
        if (!options.header.token && token) {
            options.header.token = token
        }
        options.header.version = appConfig.version
        return options
    },
}

const customerRequest = new HttpRequest(merge(customerRequestOptions, { requestHooks: customerRequestHooks }))

export { customerRequest }

export interface CustomerInfo {
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

export function getCustomerDetail(id: number) {
    return customerRequest.get<CustomerInfo>({ url: `/customer/detail?id=${id}` })
}

export function getMyCustomer() {
    return customerRequest.get<CustomerInfo>({ url: '/customer/my' })
}

export function editCustomer(id: number, data: CustomerForm) {
    return customerRequest.post({ url: `/customer/edit?id=${id}`, data })
}

export function getFollowupList(customerId: number) {
    return customerRequest.get({ url: `/customer/followup/list?customerId=${customerId}` })
}

export function addFollowup(data: any) {
    return customerRequest.post({ url: '/customer/followup/add', data })
}

export function getCompanyList() {
    return customerRequest.get({ url: '/customer/company/list' })
}
