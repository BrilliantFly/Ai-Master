import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { message } from 'ant-design-vue'

import { router } from '@/router'
import { getToken, clearAuthCache, getAuthCache } from '@/utils/auth'
import { TENANT_KEY } from '@/enums/cacheEnum'

// Determine if running in production mode
const isProduction = import.meta.env.PROD

// Service configuration
const serviceConfig = {
  // Gateway base URL - production uses env var, dev uses proxy
  // 后端不需要 /api 前缀，所以这里留空
  baseURL: isProduction ? (import.meta.env.VITE_API_BASE_URL || '') : '',

  // Service path mapping
  serviceMap: {
    java: '', // 直接代理到后端
    python: '/python' // Python AI services
  },
  timeout: 10 * 1000
}

// Create axios instance
const service = axios.create({
  baseURL: serviceConfig.baseURL,
  timeout: serviceConfig.timeout
})

// Handle Error
const handleError = (error: AxiosError): Promise<AxiosError> => {
  if (error.response?.status === 401 || error.response?.status === 504) {
    clearAuthCache()
    router.push({ path: '/login' })
  }
  message.error(error.message || 'error')
  return Promise.reject(error)
}

// Request interceptors configuration
service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // 优先从 localStorage 读取 token
  let token = localStorage.getItem('token')
  if (!token) {
    token = getToken() as string
  }
  if (token) {
    ;(config as Recordable).headers['Authorization'] = `${token}`
  }

  // 添加租户ID
  const tenant = getAuthCache(TENANT_KEY)
  if (tenant?.id) {
    ;(config as Recordable).headers['X-Tenant-Id'] = tenant.id
  }

  ;(config as Recordable).headers['Content-Type'] = 'application/json'
  return config
}, handleError)

// Respose interceptors configuration
service.interceptors.response.use((response: AxiosResponse) => {
  const data = response.data
  console.log('Axios 响应原始数据:', data)

  // 后端成功 code=0 或 code=1 或 code=2
  if (data.code === 0 || data.code === 1 || data.code === 2 || data.code === 200) {
    console.log('Axios 判定为成功')
    // 统一返回 data
    return data
  } else {
    console.log('Axios 判定为失败，code:', data.code, 'msg:', data.msg)
    message.error(data.msg || data.message || '操作失败')
    return Promise.reject('error')
  }
}, handleError)

// Export service and config
export { service, serviceConfig }
export default service
