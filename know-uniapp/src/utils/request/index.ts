import HttpRequest from './http'
import { merge } from 'lodash-es'
import { HttpRequestOptions, RequestHooks } from './type'
import { getToken } from '../auth'
import { removeToken } from '@/api/auth'
import { RequestCodeEnum, RequestMethodsEnum } from '@/enums/requestEnums'
import { useUserStore } from '@/stores/user'
import appConfig from '@/config'
import { getClient } from '../client'

const requestHooks: RequestHooks = {
    requestInterceptorsHook(options, config) {
        const { urlPrefix, baseUrl, withToken, isAuth } = config
        options.header = options.header ?? {}

        // Check if URL starts with Python service prefix
        const isPythonService = options.url && options.url.startsWith('/python/')

        // Check if URL starts with Customer service prefix
        const isCustomerService = options.url && options.url.startsWith('/customer/')

        // Add URL prefix only for Java services
        // Python and Customer services already have full path configured
        if (!isPythonService && !isCustomerService && urlPrefix) {
            options.url = `${urlPrefix}${options.url}`
        }
        if (baseUrl) {
            options.url = `${baseUrl}${options.url}`
        }
        const token = getToken()
        // 添加token (Sa-Token请求头)
        console.log('[SisDebug] request interceptor', {
            url: options.url,
            withToken,
            hasToken: !!token,
            tokenPrefix: token ? token.substring(0, 10) + '...' : null
        })
        if (withToken && token) {
            options.header['token'] = token
        }
        options.header.version = appConfig.version
        return options
    },
    async responseInterceptorsHook(response, config) {
        const { isTransformResponse, isReturnDefaultResponse, isAuth } = config

        //返回默认响应，当需要获取响应头及其他数据时可使用
        if (isReturnDefaultResponse) {
            return response
        }
        // 是否需要对数据进行处理
        if (!isTransformResponse) {
            return response.data
        }
        const { code, data, msg, show } = response.data as any

        // 登录超时处理：清除 token 并重定向到登录页
        const handleTokenTimeout = () => {
            removeToken()
            const store = useUserStore()
            store.token = null
            store.tokenName = null
            store.userInfo = {}
            uni.reLaunch({ url: '/pages/login/login' })
        }

        console.log('[SisDebug] response interceptor', {
            url: response.config?.url,
            code,
            msg,
            data
        })
        switch (code) {
            case RequestCodeEnum.SUCCESS:
                msg && show && uni.$u.toast(msg)
                return data
            case RequestCodeEnum.FAILED:
                // 后端 TOKEN_EMPTY 返回 code=0, msg="登录超时，请重新登录"
                // 落在此分支时也要跳转登录页，否则只弹 toast 无跳转
                if (msg && msg.indexOf('登录超时') !== -1) {
                    handleTokenTimeout()
                    return Promise.reject(msg)
                }
                uni.$u.toast(msg)
                return Promise.reject(msg)

            case RequestCodeEnum.TOKEN_INVALID:
                handleTokenTimeout()
                return Promise.reject(msg)

            default:
                return data
        }
    },
    async responseInterceptorsCatchHook(options, error) {
        if (options.method?.toUpperCase() == RequestMethodsEnum.POST) {
            uni.$u.toast('请求失败，请重试')
        }
        return Promise.reject(error)
    }
}

const defaultOptions: HttpRequestOptions = {
    requestOptions: {
        timeout: appConfig.timeout
    },
    baseUrl: appConfig.baseUrl,
    //是否返回默认的响应
    isReturnDefaultResponse: false,
    // 需要对返回数据进行处理
    isTransformResponse: true,
    // 接口拼接地址
    urlPrefix: 'api',
    // 忽略重复请求
    ignoreCancel: false,
    // 是否携带token
    withToken: true,
    isAuth: false,
    retryCount: 2,
    retryTimeout: 1000,
    requestHooks: requestHooks
}

export function createRequest(opt?: HttpRequestOptions) {
    return new HttpRequest(
        // 深度合并（使用 {} 防止 lodash.merge 修改 defaultOptions）
        merge({}, defaultOptions, opt || {})
    )
}
const request = createRequest()
export default request
