import { defineStore } from 'pinia'
import { getTabbarMenu, getHomeMenu, getTabbarMenuByUser, getHomeMenuByUser } from '@/api/system/menu'

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
        // 获取首页菜单兼容旧版
        getHomeMenu: (state) => {
            // 优先使用新API数据，如果为空则尝试从旧配置获取
            if (state.menuConfig.home?.length) {
                return state.menuConfig.home.map((item: any) => ({
                    name: item.menuName,
                    path: item.path,
                    icon: item.icon,
                    color: item.bigIcon,
                    renderType: item.renderType
                }))
            }
            return []
        }
    },
    actions: {
        getImageUrl(url: string) {
            return url.indexOf('http') ? `${this.config.domain}${url}` : url
        },
        async getConfig() {
            // 保留原有逻辑
            const { getConfig } = await import('@/api/app')
            const data = await getConfig()
            this.config = data
        },
        /**
         * 加载用户菜单配置（带权限）
         */
        async loadUserMenuConfig() {
            try {
                // 并行请求 tabBar 和首页菜单
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
            } catch (e) {
                console.error('加载用户菜单配置失败，使用公共配置', e)
                // 失败时不覆盖已有数据，保留公共菜单配置
            }
        },
        /**
         * 加载公共菜单配置（免登录，用于未登录状态下的 TabBar 和首页）
         */
        async loadPublicMenuConfig() {
            try {
                const [tabbarRes, homeRes] = await Promise.all([
                    getTabbarMenu(),
                    getHomeMenu()
                ])
                this.menuConfig.tabbar = Array.isArray(tabbarRes) ? tabbarRes : []
                this.menuConfig.home = Array.isArray(homeRes) ? homeRes : []
            } catch (e) {
                console.error('加载公共菜单配置失败', e)
                this.menuConfig.tabbar = []
                this.menuConfig.home = []
            }
        },

        /**
         * 刷新菜单配置
         */
        async refreshMenuConfig() {
            await this.loadUserMenuConfig()
        }
    }
})