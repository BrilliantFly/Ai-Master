import request from '@/utils/request'
import { client } from '@/utils/client'

/**
 * Login with username and password
 */
export function login(username: string, password: string) {
    return request.post({
        url: '/login/account',
        data: {
            username,
            password,
            terminal: client
        }
    })
}

/**
 * Logout
 */
export function logout() {
    return request.post({ url: '/login/logout' }, { isAuth: true })
}

/**
 * Get current user info with roles and permissions
 */
export function getUserInfo() {
    return request.get({ url: '/user/info' }, { isAuth: true })
}
