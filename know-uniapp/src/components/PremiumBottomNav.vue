<template>
    <view class="premium-bottom-nav">
        <view class="nav-shell">
            <view
                v-for="item in normalizedItems"
                :key="item.key"
                class="nav-item"
                :class="{ active: currentKey === item.key }"
                @tap="navigate(item)"
            >
                <view class="tab-icon-wrap">
                    <image
                        v-if="item.iconIsImage"
                        class="tab-icon-image"
                        :src="
                            currentKey === item.key && item.selectedIcon
                                ? item.selectedIcon
                                : item.icon
                        "
                        mode="aspectFit"
                    />
                    <view v-else-if="getSvgIcon(item.fallbackKey)" class="tab-icon-svg">
                        <text class="svg-icon-text">{{
                            currentKey === item.key && item.selectedIcon
                                ? item.selectedIcon
                                : item.icon || getFallbackEmoji(item.fallbackKey)
                        }}</text>
                    </view>
                    <text v-else class="tab-icon-text">{{
                        currentKey === item.key && item.selectedIcon ? item.selectedIcon : item.icon
                    }}</text>
                </view>
                <text class="nav-label">{{ item.label }}</text>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'uniapp-router-next'
import { getTabbarMenu, getTabbarMenuByUser } from '@/api/system/menu'
import { useHoverEffect } from '@/hooks/useHoverEffect'

type NavItem = {
    key: string
    label: string
    icon: string
    selectedIcon: string
    path: string
    navType: 'switchTab' | 'navigateTo'
    iconIsImage: boolean
    sort: number
    fallbackKey: string
}

const props = defineProps({
    active: {
        type: String,
        default: ''
    }
})

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()
const remoteTabbar = ref<any[]>(appStore.getTabbarConfig || [])

const fallbackItems: NavItem[] = [
    {
        key: 'home',
        label: '首页',
        icon: '🏠',
        selectedIcon: '🏠',
        path: '/pages/index/index',
        navType: 'switchTab',
        iconIsImage: false,
        sort: 1,
        fallbackKey: 'home'
    },
    {
        key: 'article',
        label: '文章',
        icon: '📰',
        selectedIcon: '📰',
        path: '/pages/news/news',
        navType: 'switchTab',
        iconIsImage: false,
        sort: 2,
        fallbackKey: 'article'
    },
    {
        key: 'profile',
        label: '我的',
        icon: '👤',
        selectedIcon: '👤',
        path: '/pages/user/user',
        navType: 'switchTab',
        iconIsImage: false,
        sort: 3,
        fallbackKey: 'profile'
    }
]

const svgIconMap: Record<string, string> = {
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
    article: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    plan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    schedule: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11"/><path d="M9 12h11"/><path d="M9 18h11"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>`,
    customer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
}

const getSvgIcon = (key: string) => svgIconMap[key] || ''

const emojiFallbackMap: Record<string, string> = {
    home: '🏠',
    article: '📰',
    plan: '📅',
    schedule: '🗂️',
    customer: '👥',
    profile: '👤'
}

const getFallbackEmoji = (key: string) => emojiFallbackMap[key] || '•'

const isImageLike = (value?: string) => {
    if (!value) return false
    return (
        value.startsWith('/') ||
        value.startsWith('http') ||
        /\.(png|jpg|jpeg|svg|webp)$/i.test(value)
    )
}

const normalizeIcon = (value?: string) => {
    if (!value) return ''
    return value.startsWith('http') ? value : appStore.getImageUrl(value)
}

const inferFallbackKey = (menuCode: string, menuName: string, path: string) => {
    const code = menuCode.toLowerCase()
    const name = menuName.toLowerCase()
    if (code.includes('home') || name.includes('首页') || path.includes('/pages/index/index'))
        return 'home'
    if (code.includes('article') || name.includes('文章') || path.includes('/pages/news/news'))
        return 'article'
    if (code.includes('schedule') || name.includes('日程')) return 'schedule'
    if (code.includes('plan') || name.includes('计划')) return 'plan'
    if (code.includes('customer') || name.includes('客户') || path.includes('/pages/customer/'))
        return 'customer'
    if (
        code.includes('profile') ||
        code.includes('user') ||
        name.includes('我的') ||
        path.includes('/pages/user/user')
    )
        return 'profile'
    return 'article'
}

const TAB_PAGE_PATHS = ['/pages/index/index', '/pages/news/news', '/pages/user/user'] as const

/** fallbackKey → 默认路径映射 */
const FALLBACK_PATH_MAP: Record<string, string> = {
    home: '/pages/index/index',
    article: '/pages/news/news',
    profile: '/pages/user/user'
}

/** 规范化路径：确保有前导 /，去除多余斜杠，转小写 */
const normalizePath = (raw: string): string => {
    let p = String(raw || '').trim()
    if (!p) return ''
    if (/^https?:\/\//i.test(p)) return p
    p = p.split(/[?#]/)[0]
    // 确保以 / 开头
    if (!p.startsWith('/')) p = `/${p}`
    // 替换连续斜杠为单斜杠
    p = p.replace(/\/+/g, '/')
    p = p.replace(/\/+$/, '')
    // 小写化（在非大小写敏感环境下）
    p = p.toLowerCase()
    return p
}

/** 判断路径是否为已知的 tab 页面 */
const isTabPath = (path: string): boolean => {
    const n = normalizePath(path)
    return TAB_PAGE_PATHS.includes(n as any)
}

const normalizedItems = computed((): NavItem[] => {
    const dynamicMenus = remoteTabbar.value
        .filter(
            (item: any) => (item.isShow ?? item.is_show) == 1 && (item.isBig ?? item.is_big) != 1
        )
        .sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0))

    if (!dynamicMenus.length) return fallbackItems

    return dynamicMenus.map((menu: any, index: number) => {
        const rawPath = menu.path || menu.link?.path || ''
        const path = normalizePath(rawPath)
        const menuName = menu.menuName || menu.menu_name || menu.text || `菜单${index + 1}`
        const menuCode = menu.menuCode || menu.menu_code || `menu-${index}`
        const icon = menu.icon ? normalizeIcon(menu.icon) : ''
        const selectedIcon =
            menu.selectedIcon || menu.selected_icon
                ? normalizeIcon(menu.selectedIcon || menu.selected_icon)
                : icon
        const fallbackKey = inferFallbackKey(String(menuCode), String(menuName), path)

        // 如果路径为空或非 tab 页面，用 fallbackKey 的默认路径兜底
        const effectivePath = path || FALLBACK_PATH_MAP[fallbackKey] || ''
        const isTab = effectivePath ? isTabPath(effectivePath) : false

        return {
            key: String(menuCode),
            label: String(menuName),
            icon,
            selectedIcon,
            path: effectivePath,
            navType: isTab ? 'switchTab' : 'navigateTo',
            iconIsImage: isImageLike(menu.icon || ''),
            sort: Number(menu.sort || index + 1),
            fallbackKey
        }
    })
})

const currentKey = computed(() => {
    if (props.active) {
        const matchedByActive = normalizedItems.value.find(
            (item) => item.key === props.active || item.fallbackKey === props.active
        )
        if (matchedByActive) return matchedByActive.key
    }
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentRoute = normalizePath(currentPage ? `/${currentPage.route}` : '')
    let matched = normalizedItems.value.find((item) => item.path === currentRoute)
    // 如果精确匹配失败，尝试前缀匹配（兼容 API 返回的路径带额外参数或子路径）
    if (!matched) {
        matched = normalizedItems.value.find((item) => {
            const trimmed = item.path.replace(/\/+$/, '')
            return currentRoute.startsWith(trimmed) || trimmed.startsWith(currentRoute)
        })
    }
    return matched?.key || ''
})

const fetchTabbar = async () => {
    try {
        const menus = await (userStore.isLogin ? getTabbarMenuByUser() : getTabbarMenu())
        if (Array.isArray(menus) && menus.length) {
            remoteTabbar.value = menus
            // 同步缓存到 store
            appStore.menuConfig.tabbar = menus
        }
    } catch (error) {
        console.error('加载底部菜单失败', error)
        if (!remoteTabbar.value.length) {
            remoteTabbar.value = appStore.getTabbarConfig || []
        }
    }
}

/** 取有效导航路径：优先 item.path，兜底 fallbackKey 的默认路径 */
const resolveNavPath = (item: NavItem): string => {
    if (item.path) return item.path
    return FALLBACK_PATH_MAP[item.fallbackKey] || ''
}

const navigate = (item: NavItem) => {
    const path = resolveNavPath(item)
    if (!path || currentKey.value === item.key) return
    if (item.navType === 'switchTab') {
        uni.switchTab({ url: path })
        return
    }
    router.navigateTo(path)
}

onShow(() => {
    fetchTabbar()
})

// Hover 系统 — 通过 useHoverEffect composable 管理
useHoverEffect('.nav-item', '.premium-bottom-nav')
</script>

<style scoped lang="scss">
.premium-bottom-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 18rpx;
    z-index: 80;
    pointer-events: none;
}

.nav-shell {
    pointer-events: auto;
    display: flex;
    width: calc(100% - 48rpx);
    max-width: 420px;
    margin: 0 auto;
    border-radius: 28rpx;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 2rpx solid rgba(255, 255, 255, 0.78);
    box-shadow: 0 14rpx 28rpx rgba(15, 23, 42, 0.06);
    padding: 4rpx 0 calc(12rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
}

.nav-item {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rpx;
    padding: 6rpx 0 10rpx;
    color: var(--color-text-tertiary);
    font-size: 18rpx;
    transition: color var(--duration) var(--ease);
}
.nav-item.hover-active {
    color: var(--color-primary);
}
.nav-item.active {
    color: var(--color-primary);
}

.nav-item.active::after {
    content: '';
    position: absolute;
    left: 38%;
    right: 38%;
    top: 0;
    height: 4rpx;
    border-radius: 999rpx;
    background: linear-gradient(135deg, var(--color-primary), var(--color-minor));
}

.tab-icon-wrap {
    min-height: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tab-icon-svg {
    width: 42rpx;
    height: 42rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

:deep(.tab-icon-svg svg) {
    width: 42rpx;
    height: 42rpx;
    display: block;
}

.svg-icon-text {
    font-size: 40rpx;
    line-height: 1.1;
    transition: transform var(--duration) var(--ease);
}

.tab-icon-text {
    font-size: 40rpx;
    line-height: 1.1;
    transition: transform var(--duration) var(--ease);
}

.tab-icon-image {
    width: 42rpx;
    height: 42rpx;
    transition: transform var(--duration) var(--ease);
}

.nav-label {
    font-size: 17rpx;
    line-height: 1.2;
    transition: color var(--duration) var(--ease), font-weight var(--duration) var(--ease);
}

.nav-item.active .tab-icon-text,
.nav-item.active .svg-icon-text,
.nav-item.active .tab-icon-image,
.nav-item.active :deep(.tab-icon-svg svg) {
    transform: scale(1.08);
}

.nav-item.active .nav-label {
    color: var(--color-primary);
    font-weight: 600;
}
</style>
