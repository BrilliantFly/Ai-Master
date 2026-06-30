import { defineStore } from 'pinia'
import {
    getTabbarMenu,
    getHomeMenu,
    getTabbarMenuByUser,
    getHomeMenuByUser
} from '@/api/system/menu'

interface AppState {
    config: Record<string, any>
    menuConfig: {
        tabbar: any[]
        home: any[]
    }
}

export const useAppStore = defineStore({
    id: 'appStore',
    state: (): AppState => ({
        config: {},
        menuConfig: {
            tabbar: [],
            home: []
        }
    }),
    getters: {
        getWebsiteConfig: (state) => state.config.website || {},
        getLoginConfig: (state) => state.config.login || {},
        getTabbarConfig: (state) => state.menuConfig.tabbar || [],
        getStyleConfig: (state) => state.config.style || {},
        getH5Config: (state) => state.config.webPage || {},
        getCopyrightConfig: (state) => state.config.copyright || [],
        getHomeMenuRaw: (state) => state.menuConfig.home || [],
        getHomeMenu: (state) => state.menuConfig.home || []
    },
    actions: {
        getImageUrl(url: string) {
            if (!url) return ''
            if (/^https?:\/\//i.test(url)) return url
            if (url.startsWith('/')) {
                return `${this.config.domain || ''}${url}`
            }
            const clean = url.replace(/^\.?\//, '')
            // #ifdef H5
            const base = (((import.meta as any).env?.BASE_URL as string) || '/mobile/').replace(
                /\/?$/,
                '/'
            )
            return `${base}${clean}`
            // #endif
            return `/${clean}`
        },
        async getConfig() {
            const { getConfig } = await import('@/api/app')
            const data = await getConfig()
            this.config = data
        },
        async loadUserMenuConfig() {
            try {
                const [tabbarRes, homeRes] = await Promise.all([
                    getTabbarMenuByUser(),
                    getHomeMenuByUser()
                ])

                if (Array.isArray(tabbarRes)) {
                    this.menuConfig.tabbar = tabbarRes
                }
                if (Array.isArray(homeRes)) {
                    this.menuConfig.home = homeRes
                }
            } catch (error) {
                console.error('加载用户菜单配置失败，使用公共配置', error)
            }
        },
        async loadPublicMenuConfig() {
            try {
                const [tabbarRes, homeRes] = await Promise.all([getTabbarMenu(), getHomeMenu()])
                this.menuConfig.tabbar = Array.isArray(tabbarRes) ? tabbarRes : []
                this.menuConfig.home = Array.isArray(homeRes) ? homeRes : []
            } catch (error) {
                console.error('加载公共菜单配置失败', error)
                this.menuConfig.tabbar = []
                this.menuConfig.home = []
            }
        },
        async refreshMenuConfig() {
            await this.loadUserMenuConfig()
        }
    }
})
