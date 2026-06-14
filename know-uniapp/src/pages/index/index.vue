<template>
    <view class="home-page">
        <view class="top-bar">
            <view class="greeting">
                <text class="hello">你好</text>
                <text class="subline">今天有什么可以帮你的？</text>
            </view>
            <view class="top-actions">
                <view class="premium-nav-icon">
                    <text>🔔</text>
                    <text v-if="noticeCount > 0" class="badge-dot">{{ noticeCount }}</text>
                </view>
                <view class="premium-nav-icon">
                    <text>⚙️</text>
                </view>
            </view>
        </view>

        <view class="search-section">
            <view class="premium-search" @tap="goSearch">
                <text class="search-icon">🔍</text>
                <text class="search-placeholder">搜索设备、文章、客户...</text>
                <text class="shortcut-badge">⌘K</text>
            </view>
        </view>

        <view class="carousel-section">
            <swiper
                class="hero-swiper"
                :indicator-dots="heroSlides.length > 1"
                indicator-color="rgba(255,255,255,0.35)"
                indicator-active-color="#ffffff"
                autoplay
                circular
                interval="3500"
            >
                <swiper-item v-for="(item, index) in heroSlides" :key="index" @tap="goLink(item.link)">
                    <view class="hero-card" :style="{ background: item.background }">
                        <view class="hero-copy">
                            <text class="hero-title">{{ item.title }}</text>
                            <text class="hero-desc">{{ item.desc }}</text>
                        </view>
                        <text class="hero-art">{{ item.art }}</text>
                        <view class="hero-dots">
                            <text v-for="dot in 6" :key="dot"></text>
                        </view>
                    </view>
                </swiper-item>
            </swiper>
        </view>

        <view class="quick-section premium-anim-fade-up premium-anim-delay-1">
            <view class="premium-segment-header quick-header">
                <text class="segment-title">首页菜单</text>
            </view>
            <view class="quick-grid">
                <view
                    v-for="item in quickEntries"
                    :key="item.id"
                    class="quick-item"
                    @tap="goLink(item.path)"
                >
                    <view class="quick-icon" :class="[item.iconClass, item.iconIsImage ? 'quick-icon-has-image' : 'premium-icon-gw']">
                        <image
                            v-if="item.iconIsImage"
                            class="quick-image"
                            :src="resolveMenuIcon(item.icon)"
                            mode="aspectFit"
                        />
                        <text v-else>{{ item.icon }}</text>
                    </view>
                    <text class="quick-label">{{ item.name }}</text>
                </view>
                <view class="quick-item" @tap="goMore('quick')">
                    <view class="quick-icon premium-icon-g8 premium-icon-gw">
                        <text>📌</text>
                    </view>
                    <text class="quick-label">更多</text>
                </view>
            </view>
        </view>

        <view class="notice-banner" @tap="goNotice">
            <text class="notice-symbol">📰</text>
            <swiper
                v-if="noticeList.length"
                class="notice-swiper"
                vertical
                autoplay
                circular
                interval="3000"
            >
                <swiper-item v-for="(item, index) in noticeList" :key="index">
                    <text class="notice-text">{{ item.title }}</text>
                </swiper-item>
            </swiper>
            <text v-else class="notice-text">系统更新 v2.4 已发布，新增甘特图与批量操作功能</text>
            <text class="notice-arrow">→</text>
        </view>

        <view class="premium-segment-alt premium-anim-fade-up premium-anim-delay-2">
            <view class="premium-segment-header">
                <text class="segment-title">热门推荐</text>
                <text class="more" @tap="goMore('recommend')">查看全部</text>
            </view>
            <scroll-view class="recommend-scroll" scroll-x>
                <view
                    v-for="item in recommendCards"
                    :key="item.id"
                    class="recommend-card premium-card"
                    @tap="goLink(item.path)"
                >
                    <view class="recommend-thumb" :style="{ background: item.thumbBg }">
                        <image
                            v-if="item.iconIsImage"
                            class="thumb-image"
                            :src="resolveMenuIcon(item.icon)"
                            mode="aspectFit"
                        />
                        <text v-else class="thumb-icon">{{ item.icon }}</text>
                        <text class="thumb-tag">{{ item.tag }}</text>
                    </view>
                    <view class="recommend-body">
                        <text class="recommend-title">{{ item.title }}</text>
                        <text class="recommend-desc">{{ item.desc }}</text>
                    </view>
                </view>
            </scroll-view>
        </view>

        <view class="premium-segment-alt tools-section premium-anim-fade-up premium-anim-delay-3">
            <view class="premium-segment-header">
                <text class="segment-title">常用工具</text>
                <text class="more" @tap="goMore('tools')">更多</text>
            </view>
            <view class="tools-grid">
                <view
                    v-for="item in tools"
                    :key="item.id"
                    class="tool-card premium-card"
                    @tap="goLink(item.path)"
                >
                    <image
                        v-if="item.iconIsImage"
                        class="tool-image"
                        :src="resolveMenuIcon(item.icon)"
                        mode="aspectFit"
                    />
                    <text v-else class="tool-icon">{{ item.icon }}</text>
                    <text class="tool-title">{{ item.title }}</text>
                    <text class="tool-desc">{{ item.desc }}</text>
                </view>
            </view>
        </view>

        <PremiumBottomNav active="home" />
    </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useRouter } from 'uniapp-router-next'
import PremiumBottomNav from '@/components/PremiumBottomNav.vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { getHomeConfig } from '@/api/plan/home'
import { getHomeMenu } from '@/api/system/menu'
import { buildHomeSections, normalizeHomeMenuItems } from './home-sections'

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()

const noticeList = ref<any[]>([])
const menuList = ref<any[]>([])

const heroSlides = computed(() => [
    {
        title: 'AI 智能监控',
        desc: '实时分析，异常告警，7x24h 守护',
        art: '📹',
        background: 'linear-gradient(135deg,#5b5bd6,#8980f0)',
        link: '/pages/camera/index'
    },
    {
        title: '计划管理升级',
        desc: '甘特图、日程、习惯打卡全新体验',
        art: '📋',
        background: 'linear-gradient(135deg,#22b573,#34d399)',
        link: '/pages/plan/schedule/index'
    },
    {
        title: '客户管理',
        desc: '智能跟进提醒，高效维护客户关系',
        art: '👥',
        background: 'linear-gradient(135deg,#f0a020,#fbbf24)',
        link: '/pages/customer/info'
    }
])

const normalizedItems = computed(() => normalizeHomeMenuItems(menuList.value))
const homeSections = computed(() => buildHomeSections(normalizedItems.value))
const quickEntries = computed(() => homeSections.value.quick)
const recommendCards = computed(() => homeSections.value.recommend)
const tools = computed(() => homeSections.value.tools)
const noticeCount = computed(() => Math.min(noticeList.value.length || 3, 9))

const resolveMenuIcon = (icon?: string) => {
    if (!icon) return ''
    return icon.startsWith('http') ? icon : appStore.getImageUrl(icon)
}

const loadConfig = async () => {
    let homeMenu = appStore.getHomeMenu
    if (!homeMenu?.length) {
        try {
            const menus = await getHomeMenu()
            if (Array.isArray(menus)) {
                homeMenu = menus
            }
        } catch (error) {
            console.error('加载首页菜单失败', error)
        }
    }

    menuList.value = Array.isArray(homeMenu) ? homeMenu : []

    try {
        const userId = userStore.userInfo?.id || 1
        const roleId = userStore.userInfo?.roleId || '1'
        const data = await getHomeConfig({ userId, roleId })
        const config = data || {}
        if (config.notice?.content) {
            try {
                const content = JSON.parse(config.notice.content)
                noticeList.value = content.notices || []
            } catch {
                noticeList.value = []
            }
        }
    } catch (error) {
        console.error('加载首页配置失败', error)
        noticeList.value = []
    }
}

const goSearch = () => {
    router.navigateTo('/pages/search/search')
}

const goNotice = () => {
    if (noticeList.value.length) {
        router.switchTab('/pages/news/news')
        return
    }
    uni.showToast({ title: '暂无更多公告', icon: 'none' })
}

const goLink = (path?: string) => {
    if (!path) return
    if (['/pages/index/index', '/pages/user/user', '/pages/news/news'].includes(path)) {
        router.switchTab(path)
        return
    }
    router.navigateTo(path)
}

const goMore = (section: 'quick' | 'recommend' | 'tools') => {
    router.navigateTo(`/pages/index/more?section=${section}`)
}

onShow(() => {
    loadConfig()
})
</script>

<style scoped lang="scss">
.home-page {
    min-height: 100vh;
    background: var(--color-bg-app);
    padding-bottom: 140rpx;
}

.top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 40rpx 12rpx;
}

.greeting {
    display: flex;
    flex-direction: column;
}

.hello {
    font-size: 48rpx;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.2;
}

.subline {
    margin-top: 8rpx;
    font-size: 26rpx;
    color: var(--color-text-secondary);
}

.top-actions {
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.search-section {
    padding: 20rpx 40rpx 16rpx;
}

.carousel-section {
    padding: 16rpx 40rpx 20rpx;
}

.hero-swiper {
    height: 320rpx;
}

.hero-card {
    position: relative;
    height: 320rpx;
    overflow: hidden;
    border-radius: var(--radius-lg);
    padding: 48rpx 40rpx;
    color: #fff;
}

.hero-card::before {
    content: '';
    position: absolute;
    top: -120rpx;
    right: -80rpx;
    width: 260rpx;
    height: 260rpx;
    border-radius: 50%;
    border: 2rpx solid rgba(255, 255, 255, 0.1);
}

.hero-card::after {
    content: '';
    position: absolute;
    left: -20rpx;
    bottom: -40rpx;
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    border: 2rpx solid rgba(255, 255, 255, 0.08);
}

.hero-copy {
    position: relative;
    z-index: 2;
    width: 65%;
}

.hero-title {
    display: block;
    font-size: 42rpx;
    font-weight: 700;
    line-height: 1.3;
}

.hero-desc {
    display: block;
    margin-top: 12rpx;
    font-size: 26rpx;
    line-height: 1.6;
    opacity: 0.88;
}

.hero-art {
    position: absolute;
    right: 36rpx;
    top: 24rpx;
    font-size: 140rpx;
    opacity: 0.14;
}

.hero-dots {
    position: absolute;
    right: 36rpx;
    bottom: 30rpx;
    display: grid;
    grid-template-columns: repeat(3, 8rpx);
    gap: 10rpx;
}

.hero-dots text {
    width: 8rpx;
    height: 8rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
}

.quick-section {
    padding: 8rpx 32rpx 36rpx;
}

.quick-header {
    margin: 0 8rpx 16rpx;
}

.quick-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 22rpx 12rpx;
}

.quick-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
}

.quick-icon {
    width: 92rpx;
    height: 92rpx;
    border-radius: 26rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 38rpx;
}

.quick-icon-has-image {
    box-shadow: var(--shadow-sm);
}

.quick-image {
    width: 52rpx;
    height: 52rpx;
}

.quick-label {
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.notice-banner {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin: 0 40rpx 24rpx;
    padding: 18rpx 22rpx;
    border-radius: var(--radius-md);
    background: var(--warning-soft);
    border: 1rpx solid var(--warning);
}

.notice-symbol {
    font-size: 30rpx;
}

.notice-swiper {
    flex: 1;
    height: 36rpx;
}

.notice-text {
    display: block;
    flex: 1;
    font-size: 24rpx;
    color: var(--color-text);
    line-height: 36rpx;
}

.notice-arrow {
    font-size: 24rpx;
    color: var(--color-warning);
}

.premium-segment-alt {
    margin: 0 40rpx 24rpx;
}

.premium-segment-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
}

.segment-title {
    font-size: 30rpx;
    font-weight: 700;
    color: var(--color-text);
}

.more {
    font-size: 22rpx;
    color: var(--color-text-tertiary);
}

.recommend-scroll {
    white-space: nowrap;
}

.recommend-card {
    display: inline-flex;
    flex-direction: column;
    width: 240rpx;
    margin-right: 16rpx;
    padding: 0;
    overflow: hidden;
}

.recommend-thumb {
    height: 150rpx;
    padding: 18rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
}

.thumb-icon {
    font-size: 40rpx;
}

.thumb-image {
    width: 68rpx;
    height: 68rpx;
}

.thumb-tag {
    position: absolute;
    top: 12rpx;
    left: 12rpx;
    font-size: 18rpx;
    padding: 4rpx 12rpx;
    border-radius: 999rpx;
    background: rgba(255,255,255,0.24);
    color: #fff;
}

.recommend-body {
    padding: 18rpx;
}

.recommend-title {
    display: block;
    font-size: 26rpx;
    font-weight: 600;
    color: var(--color-text);
}

.recommend-desc {
    display: block;
    margin-top: 8rpx;
    font-size: 22rpx;
    line-height: 1.6;
    color: var(--color-text-secondary);
}

.tools-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14rpx;
}

.tool-card {
    padding: 20rpx 18rpx;
}

.tool-icon {
    font-size: 42rpx;
    line-height: 1;
    margin-bottom: 14rpx;
    display: block;
}

.tool-image {
    width: 46rpx;
    height: 46rpx;
    margin-bottom: 14rpx;
    display: block;
}

.tool-title {
    display: block;
    font-size: 24rpx;
    font-weight: 600;
    color: var(--color-text);
}

.tool-desc {
    display: block;
    margin-top: 6rpx;
    font-size: 18rpx;
    line-height: 1.5;
    color: var(--color-text-secondary);
}
</style>
