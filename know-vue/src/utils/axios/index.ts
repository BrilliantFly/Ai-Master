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
  baseURL: isProduction ? (import.meta.env.VITE_API_BASE_URL || '/api') : '/api',

  // Service path mapping
  serviceMap: {
    java: '/plan', // Java services (plan, system, etc.)
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
  const token = getToken()
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

  if (data.code === 0) {
    return data.data
  } else {
    message.error(data.message)

    return Promise.reject('error')
  }
}, handleError)

// Export service and config
export { service, serviceConfig }
export default service
