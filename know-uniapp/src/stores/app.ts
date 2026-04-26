import { defineStore } from 'pinia'
import { getTabbarMenuByUser, getHomeMenuByUser } from '@/api/system/menu'

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
                    color: item.bigIcon
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
                
                this.menuConfig.tabbar = tabbarRes?.result || []
                this.menuConfig.home = homeRes?.result || []
            } catch (e) {
                console.error('加载菜单配置失败', e)
                // 降级处理：使用空数组
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