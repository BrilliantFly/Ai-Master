import request from '@/utils/request'
import { TOKEN_KEY, TOKEN_NAME } from '@/enums/constantEnums'
import cache from '@/utils/cache'
import { client } from '@/utils/client'

/**
 * 登录
 */
export function login(username: string, password: string) {
    return request.post(
        {
            url: '/login/account',
            data: {
                username,
                password
            }
        },
        { isAuth: false }
    )
}

/**
 * 刷新Token
 */
export function refreshToken() {
    return request.post(
        {
            url: '/login/refreshToken',
            data: {}
        },
        { isAuth: true }
    )
}

/**
 * 登出
 */
export function logout() {
    return request.get({ url: '/login/logout' }, { isAuth: true })
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
    return request.get({ url: '/login/getUserInfo' }, { isAuth: true })
}

/**
 * 获取Token
 */
export function getToken(): string {
    return cache.get(TOKEN_KEY) || ''
}

/**
 * 获取Token名称
 */
export function getTokenName(): string {
    return cache.get(TOKEN_NAME) || 'satoken'
}

/**
 * 设置Token
 */
export function setToken(token: string, tokenName = 'satoken') {
    cache.set(TOKEN_KEY, token)
    cache.set(TOKEN_NAME, tokenName)
}

/**
 * 移除Token
 */
export function removeToken() {
    cache.remove(TOKEN_KEY)
    cache.remove(TOKEN_NAME)
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
    return !!getToken()
}
