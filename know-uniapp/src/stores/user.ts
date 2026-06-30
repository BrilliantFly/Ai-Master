import {
    login as loginApi,
    logout as logoutApi,
    getUserInfo as getUserInfoApi,
    refreshToken as refreshTokenApi,
    setToken,
    removeToken,
    getToken
} from '@/api/auth'
import { useDictStore } from './dict'
import cache from '@/utils/cache'
import { defineStore } from 'pinia'
import { TOKEN_KEY } from '@/enums/constantEnums'

interface UserState {
    userInfo: Record<string, any>
    token: string | null
    tokenName: string | null
}

export const useUserStore = defineStore({
    id: 'userStore',
    state: (): UserState => ({
        userInfo: {},
        token: cache.get(TOKEN_KEY) || null,
        tokenName: null
    }),
    getters: {
        isLogin: (state) => !!state.token
    },
    actions: {
        /**
         * 登录
         */
        async login(username: string, password: string) {
            const data = await loginApi(username, password)
            if (data.token) {
                this.token = data.token
                this.tokenName = data.tokenName || 'satoken'
                setToken(data.token, this.tokenName)
            }
            return data
        },

        /**
         * 获取用户信息
         */
        async getUser() {
            if (!this.token) return
            const data = await getUserInfoApi()
            this.userInfo = data
            return data
        },

        /**
         * 刷新Token
         */
        async refreshToken() {
            try {
                const data = await refreshTokenApi()
                if (data.token) {
                    this.token = data.token
                    setToken(data.token, this.tokenName || 'satoken')
                }
                return data
            } catch (e) {
                // 刷新失败，清除Token
                this.logout()
                throw e
            }
        },

        /**
         * 登出
         */
        async logout() {
            try {
                await logoutApi()
            } catch (e) {
                // 忽略登出错误
            } finally {
                this.token = null
                this.tokenName = null
                this.userInfo = {}
                removeToken()
                // 清空字典缓存
                const dictStore = useDictStore()
                dictStore.$reset()
            }
        },

        /**
         * 检查登录状态
         */
        checkLogin() {
            if (!this.token) {
                this.token = getToken()
            }
            return this.isLogin
        }
    }
})
