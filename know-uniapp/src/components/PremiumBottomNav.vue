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
import { useRouter } from 'uniapp-router-next'
import { getTabbarMenu } from '@/api/system/menu'
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
const router = useRouter()
const remoteTabbar = ref<any[]>([])

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

const normalizedItems = computed((): NavItem[] => {
    const dynamicMenus = remoteTabbar.value
        .filter(
            (item: any) => (item.isShow ?? item.is_show) == 1 && (item.isBig ?? item.is_big) != 1
        )
        .sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0))

    if (!dynamicMenus.length) return fallbackItems

    return dynamicMenus.map((menu: any, index: number) => {
        const path = menu.path || menu.link?.path || ''
        const menuName = menu.menuName || menu.menu_name || menu.text || `菜单${index + 1}`
        const menuCode = menu.menuCode || menu.menu_code || `menu-${index}`
        const icon = menu.icon ? normalizeIcon(menu.icon) : ''
        const selectedIcon =
            menu.selectedIcon || menu.selected_icon
                ? normalizeIcon(menu.selectedIcon || menu.selected_icon)
                : icon
        const fallbackKey = inferFallbackKey(String(menuCode), String(menuName), path)

        return {
            key: String(menuCode),
            label: String(menuName),
            icon,
            selectedIcon,
            path,
            navType: ['/pages/index/index', '/pages/news/news', '/pages/user/user'].includes(path)
                ? 'switchTab'
                : 'navigateTo',
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
    const currentRoute = currentPage ? `/${currentPage.route}` : ''
    const matched = normalizedItems.value.find((item) => item.path === currentRoute)
    return matched?.key || ''
})

const fetchTabbar = async () => {
    try {
        const menus = await getTabbarMenu()
        remoteTabbar.value = Array.isArray(menus) ? menus : []
    } catch (error) {
        console.error('加载底部菜单失败', error)
        remoteTabbar.value = appStore.getTabbarConfig || []
    }
}

const navigate = (item: NavItem) => {
    if (!item.path || currentKey.value === item.key) return
    if (item.navType === 'switchTab') {
        router.switchTab(item.path)
        return
    }
    router.navigateTo(item.path)
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
    bottom: 0;
    z-index: 80;
    pointer-events: none;
}

.nav-shell {
    pointer-events: auto;
    display: flex;
    background: var(--color-bg-app);
    border-top: 2rpx solid var(--color-border-light);
    max-width: 420px;
    margin: 0 auto;
    padding: 12rpx 0 calc(12rpx + env(safe-area-inset-bottom));
    box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.04);
}

.nav-item {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
    padding: 8rpx 0 10rpx;
    color: var(--color-text-tertiary);
    transition: color var(--duration) var(--ease);
}
.nav-item.hover-active { color: var(--color-primary); }
.nav-item.active {
    color: var(--color-primary);
}

.nav-item.active::after {
    content: '';
    position: absolute;
    left: 34%;
    right: 34%;
    top: -2rpx;
    height: 6rpx;
    border-radius: 999rpx;
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
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
    font-size: 20rpx;
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
