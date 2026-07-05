<template>
    <view class="home-page">
        <view class="phone-frame">
            <view class="status-bar">
                <text class="status-time">9:41</text>
                <view class="status-right">
                    <text class="status-icons">📶 🔋</text>
                </view>
            </view>

            <view class="hero-shell">
                <view class="hero-bar">
                    <view class="deco-ring"></view>
                    <view class="deco-dot"></view>
                    <view class="hero-top">
                        <view class="hero-welcome">
                            <view class="hero-avatar">{{ userInitial }}</view>
                            <view class="hero-greeting">
                                <text class="hero-name">{{ greetingText }}</text>
                                <text class="hero-sub">{{ heroSubline }}</text>
                            </view>
                        </view>
                        <view class="hero-icon" @tap="goNotice">
                            <text class="hero-icon-text">🔔</text>
                            <text v-if="noticeCount > 0" class="hero-badge">{{ noticeCount }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <view class="home-content">
                <view class="asset-card premium-fade-in">
                    <view
                        class="asset-left asset-left-inline"
                        @tap="goLink('/pages/plan/schedule/index')"
                    >
                        <text class="asset-label">今日概要</text>
                        <view class="asset-amount">
                            <view class="metric-icon metric-icon-blue metric-icon-md">📋</view>
                            <text class="asset-count">{{ todayStats.todoCount }}</text>
                            <text class="asset-unit">今日待办</text>
                        </view>
                    </view>
                    <view class="asset-right asset-right-inline">
                        <view class="asset-item asset-item-inline">
                            <view class="asset-num asset-num-danger">
                                <view class="metric-icon metric-icon-red metric-icon-sm">🔔</view>
                                <text>{{ pendingAlertCount }}</text>
                            </view>
                            <text class="asset-item-label">待处理告警</text>
                        </view>
                        <view class="asset-item asset-item-inline">
                            <view class="asset-num asset-num-success">
                                <view class="metric-icon metric-icon-green metric-icon-sm">🛡️</view>
                                <text>{{ deviceOverview.online }}</text>
                            </view>
                            <text class="asset-item-label">在线设备</text>
                        </view>
                    </view>
                </view>

                <view class="search-row premium-fade-in premium-d1">
                    <view class="search-input" @tap="goSearch">
                        <text class="search-input-icon">🔍</text>
                        <text class="search-input-text">搜索功能、设备、文档...</text>
                    </view>
                    <view class="search-qr" @tap="handleScan">📷</view>
                </view>

                <view class="content-shell">
                    <view class="carousel-wrap premium-fade-in premium-d1">
                        <swiper
                            class="carousel-swiper"
                            :indicator-dots="false"
                            autoplay
                            circular
                            interval="3500"
                            @change="onHeroChange"
                        >
                            <swiper-item
                                v-for="(item, index) in heroSlides"
                                :key="index"
                                @tap="goLink(item.link)"
                            >
                                <view
                                    class="carousel-slide"
                                    :style="{ background: item.background }"
                                >
                                    <text class="carousel-icon">{{ item.art }}</text>
                                    <text class="carousel-title">{{ item.title }}</text>
                                    <text class="carousel-desc">{{ item.desc }}</text>
                                </view>
                            </swiper-item>
                        </swiper>
                        <view class="carousel-dots">
                            <view
                                v-for="(_, index) in heroSlides"
                                :key="`dot-${index}`"
                                class="carousel-dot"
                                :class="{ active: currentHero === index }"
                            ></view>
                        </view>
                    </view>

                    <view class="notice-strip premium-fade-in premium-d2" @tap="goNotice">
                        <text class="notice-icon">📢</text>
                        <view class="notice-wrap">
                            <swiper
                                v-if="noticeItems.length"
                                class="notice-swiper"
                                vertical
                                autoplay
                                circular
                                interval="3200"
                            >
                                <swiper-item
                                    v-for="(item, index) in noticeItems"
                                    :key="`notice-${index}`"
                                >
                                    <text class="notice-line">{{ item.title }}</text>
                                </swiper-item>
                            </swiper>
                            <text v-else class="notice-line"
                                >系统 v2.4 已发布，新增甘特图与批量操作</text
                            >
                        </view>
                        <text class="notice-arrow">›</text>
                    </view>

                    <view class="section-hdr premium-fade-in premium-d3">
                        <text class="section-title">快捷功能</text>
                        <text class="section-more" @tap="goMore('quick')">全部 →</text>
                    </view>
                    <view class="quick-grid premium-fade-in premium-d3">
                        <view
                            v-for="item in quickTiles"
                            :key="item.id"
                            class="quick-item"
                            @tap="handleQuickTap(item)"
                        >
                            <view
                                class="quick-icon"
                                :class="[
                                    item.iconClass,
                                    item.iconIsImage ? 'quick-icon-has-image' : 'premium-icon-gw'
                                ]"
                            >
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
                    </view>

                    <view class="section-hdr premium-fade-in premium-d3">
                        <text class="section-title">热门推荐</text>
                        <text class="section-more" @tap="goMore('recommend')">查看全部</text>
                    </view>
                    <scroll-view class="recommend-scroll premium-fade-in premium-d3" scroll-x>
                        <view class="recommend-track">
                            <view
                                v-for="item in recommendTiles"
                                :key="item.id"
                                class="recommend-card"
                                @tap="handleRecommendTap(item)"
                            >
                                <view class="recommend-thumb" :style="{ background: item.thumbBg }">
                                    <image
                                        v-if="item.thumbImageIsImage"
                                        class="thumb-image"
                                        :src="resolveMenuIcon(item.thumbImage)"
                                        mode="aspectFit"
                                    />
                                    <image
                                        v-else-if="item.iconIsImage"
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
                        </view>
                    </scroll-view>

                    <view class="section-hdr premium-fade-in premium-d3">
                        <text class="section-title">常用工具</text>
                        <text class="section-more" @tap="goMore('tools')">更多 →</text>
                    </view>
                    <view class="tools-grid premium-fade-in premium-d3">
                        <view
                            v-for="item in dashboardTools"
                            :key="item.id"
                            class="tool-card"
                            @tap="goLink(item.path)"
                        >
                            <view class="tool-top">
                                <view
                                    class="tool-icon tool-icon-image-wrap"
                                    :class="[
                                        item.iconClass,
                                        item.thumbImageIsImage ? '' : 'premium-icon-gw'
                                    ]"
                                >
                                    <image
                                        v-if="item.thumbImageIsImage"
                                        class="tool-icon-image"
                                        :src="resolveMenuIcon(item.thumbImage)"
                                        mode="aspectFit"
                                    />
                                    <text v-else>{{ item.icon }}</text>
                                </view>
                                <text class="tool-title">{{ item.title }}</text>
                                <text v-if="item.tag" class="tool-tag">{{ item.tag }}</text>
                            </view>
                            <text class="tool-desc">{{ item.desc }}</text>
                            <view class="tool-bar">
                                <view
                                    class="tool-bar-in"
                                    :style="{ width: `${item.progress}%` }"
                                ></view>
                            </view>
                            <view class="tool-bar-label">
                                <text>{{ item.metricLabel }}</text>
                                <text>{{ item.metricValue }}</text>
                            </view>
                        </view>
                    </view>

                    <view class="section-hdr premium-fade-in premium-d3 section-hdr-tight">
                        <text class="section-title">便捷工具</text>
                        <text class="section-more" @tap="goMore('tools')">更多 →</text>
                    </view>
                    <scroll-view class="tool-strip premium-fade-in premium-d3" scroll-x>
                        <view class="tool-strip-track">
                            <view
                                v-for="item in utilityChips"
                                :key="item.id"
                                class="tool-chip"
                                @tap="handleChipTap(item)"
                            >
                                <view
                                    class="tool-chip-dot"
                                    :style="{ background: item.dotColor }"
                                ></view>
                                <text class="tool-chip-text">{{ item.label }}</text>
                            </view>
                        </view>
                    </scroll-view>
                </view>
            </view>

            <PremiumBottomNav active="home" />
        </view>
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
import { getTodayStats } from '@/api/plan/schedule'
import { getCustomerStats } from '@/api/customer'
import { getCameraList, type CameraDevice } from '@/api/camera'
import { buildHomeSections, normalizeHomeMenuItems, type HomeDisplayItem } from './home-sections'

type QuickTile = HomeDisplayItem & {
    action?: 'more'
}

type RecommendTile = HomeDisplayItem & {
    action?: 'more'
}

type DashboardTool = {
    id: string
    title: string
    desc: string
    tag: string
    progress: number
    metricLabel: string
    metricValue: string
    icon: string
    iconClass: string
    path: string
}

type UtilityChip = {
    id: string
    label: string
    dotColor: string
    path?: string
}

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()

const noticeList = ref<any[]>([])
const menuList = ref<any[]>([])
const currentHero = ref(0)
const todayStats = ref({
    totalCount: 0,
    todoCount: 0,
    completedCount: 0
})
const customerStats = ref({
    total: 0,
    monthly: 0,
    following: 0
})
const deviceOverview = ref({
    total: 0,
    online: 0,
    offline: 0
})

const heroSlides = computed(() => [
    {
        title: 'AI 智能监控升级',
        desc: '实时分析 · 异常告警 · 7x24h 守护',
        art: '🏆',
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        link: '/pages/camera/index'
    },
    {
        title: '计划管理 3.0 上线',
        desc: '甘特图 · 日程 · 打卡 · 目标追踪',
        art: '📋',
        background: 'linear-gradient(135deg,#d4956b,#e8b88a)',
        link: '/pages/plan/schedule/index'
    },
    {
        title: '数据分析工具上新',
        desc: '经营看板 · 报表导出 · 智能分析',
        art: '📊',
        background: 'linear-gradient(135deg,#22b573,#4dd499)',
        link: '/pages/news/news'
    }
])

const quickFallbacks: HomeDisplayItem[] = [
    {
        id: 'quick-camera',
        name: '智能监控',
        code: 'camera',
        path: '/pages/camera/index',
        icon: '📹',
        iconClass: 'premium-icon-g8',
        iconIsImage: false,
        sort: 1,
        title: '智能监控',
        desc: '实时掌握设备状态与画面',
        tag: '设备',
        thumbBg: 'linear-gradient(135deg,#1a1a2e,#6366f1)',
        sections: ['quick', 'recommend']
    },
    {
        id: 'quick-schedule',
        name: '日程计划',
        code: 'schedule',
        path: '/pages/plan/schedule/index',
        icon: '📅',
        iconClass: 'premium-icon-g2',
        iconIsImage: false,
        sort: 2,
        title: '计划管理升级',
        desc: '高效安排每日任务节奏',
        tag: '计划',
        thumbBg: 'linear-gradient(135deg,#0f3443,#22b573)',
        sections: ['quick', 'recommend']
    },
    {
        id: 'quick-habit',
        name: '习惯打卡',
        code: 'habit',
        path: '/pages/plan/habit/index',
        icon: '🎯',
        iconClass: 'premium-icon-g3',
        iconIsImage: false,
        sort: 3,
        title: '习惯打卡挑战',
        desc: '持续记录并点亮里程碑',
        tag: '习惯',
        thumbBg: 'linear-gradient(135deg,#2d1b69,#a855f7)',
        sections: ['quick', 'recommend']
    },
    {
        id: 'quick-customer',
        name: '客户管理',
        code: 'customer',
        path: '/pages/customer/info',
        icon: '👥',
        iconClass: 'premium-icon-g5',
        iconIsImage: false,
        sort: 4,
        title: '客户管理实践',
        desc: '智能跟进提醒与客户维护',
        tag: '推荐',
        thumbBg: 'linear-gradient(135deg,#78350f,#f0a020)',
        sections: ['quick', 'recommend']
    },
    {
        id: 'quick-data',
        name: '数据分析',
        code: 'data',
        path: '/pages/news/news',
        icon: '📊',
        iconClass: 'premium-icon-g6',
        iconIsImage: false,
        sort: 5,
        title: '数据分析方法',
        desc: '从数据到决策的完整路径',
        tag: '干货',
        thumbBg: 'linear-gradient(135deg,#2d1b69,#a855f7)',
        sections: ['quick', 'recommend']
    },
    {
        id: 'quick-alert',
        name: '告警中心',
        code: 'alert',
        path: '/pages/camera/index',
        icon: '🔔',
        iconClass: 'premium-icon-g4',
        iconIsImage: false,
        sort: 6,
        title: '告警中心',
        desc: '异常事件统一追踪与处理',
        tag: '工具',
        thumbBg: 'linear-gradient(135deg,#fee2e2,#fecaca)',
        sections: ['quick']
    },
    {
        id: 'quick-finance',
        name: '财务管理',
        code: 'finance',
        path: '/packages/pages/recharge/recharge',
        icon: '💳',
        iconClass: 'premium-icon-g10',
        iconIsImage: false,
        sort: 7,
        title: '财务管理',
        desc: '查看财务信息与收支概况',
        tag: '财务',
        thumbBg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)',
        sections: ['quick']
    },
    {
        id: 'quick-gantt',
        name: '项目管理',
        code: 'gantt',
        path: '/pages/plan/stats/index',
        icon: '📋',
        iconClass: 'premium-icon-g6',
        iconIsImage: false,
        sort: 8,
        title: '甘特图',
        desc: '项目计划与进度追踪',
        tag: '工具',
        thumbBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
        sections: ['quick']
    },
    {
        id: 'quick-service',
        name: '文档管理',
        code: 'service',
        path: '/pages/customer_service/customer_service',
        icon: '📄',
        iconClass: 'premium-icon-g10',
        iconIsImage: false,
        sort: 9,
        title: '在线客服支持',
        desc: '快速联系平台客服获取帮助',
        tag: '服务',
        thumbBg: 'linear-gradient(135deg,#d1fae5,#99f6e4)',
        sections: ['quick']
    }
]

const normalizedItems = computed(() => normalizeHomeMenuItems(menuList.value))
const homeSections = computed(() => buildHomeSections(normalizedItems.value))
const quickEntries = computed(() => homeSections.value.quick)
const recommendCards = computed(() => homeSections.value.recommend)
const noticeCount = computed(() => Math.min(noticeList.value.length || 0, 9))
const pendingAlertCount = computed(
    () => deviceOverview.value.offline || customerStats.value.following || 0
)
const taskCompletionRate = computed(() => {
    if (!todayStats.value.totalCount) return 0
    return Math.round((todayStats.value.completedCount / todayStats.value.totalCount) * 100)
})
const customerMonthlyRate = computed(() => {
    if (!customerStats.value.total) return Math.min(customerStats.value.monthly * 10, 100)
    return Math.round((customerStats.value.monthly / customerStats.value.total) * 100)
})

const displayName = computed(() => {
    return (
        userStore.userInfo?.nickname ||
        userStore.userInfo?.realName ||
        userStore.userInfo?.realname ||
        userStore.userInfo?.name ||
        userStore.userInfo?.username ||
        '知行用户'
    )
})

const userInitial = computed(() => {
    const base = displayName.value.trim()
    return base ? base.slice(0, 1) : '知'
})

const greetingText = computed(() => `${displayName.value}，${getTimeGreeting()} ☀️`)
const heroSubline = computed(() => {
    if (todayStats.value.todoCount > 0) {
        return `✨ 今日还有 ${todayStats.value.todoCount} 项待办，保持节奏继续推进`
    }
    return '✨ 努力是光，坚持是路'
})

const noticeItems = computed(() => {
    return noticeList.value.length
        ? noticeList.value
        : [
              { title: '系统 v2.4 已发布，新增甘特图与批量操作' },
              { title: '7 月份设备巡检计划已生成，请及时查看' },
              { title: '客户模块新增批量导入功能' }
          ]
})

const quickTiles = computed<QuickTile[]>(() => {
    const merged: QuickTile[] = []
    const source = quickEntries.value.length ? quickEntries.value : quickFallbacks
    const candidates = [...source]

    candidates.forEach((item) => {
        const exists = merged.some(
            (row) =>
                row.code === item.code ||
                row.path === item.path ||
                row.name === item.name ||
                row.title === item.title
        )
        if (!exists && merged.length < 9) {
            merged.push(item)
        }
    })

    quickFallbacks.forEach((item) => {
        const exists = merged.some(
            (row) =>
                row.code === item.code ||
                row.path === item.path ||
                row.name === item.name ||
                row.title === item.title
        )
        if (!exists && merged.length < 9) {
            merged.push(item)
        }
    })

    merged.push({
        id: 'quick-more',
        name: '更多',
        code: 'more',
        path: '',
        icon: '•••',
        iconClass: 'premium-icon-g8',
        iconIsImage: false,
        sort: 999,
        title: '查看更多',
        desc: '发现更多精彩能力',
        tag: '更多',
        thumbBg: 'linear-gradient(135deg,#9ca3af,#d1d5db)',
        sections: ['quick'],
        action: 'more'
    })

    return merged
})

const recommendTiles = computed<RecommendTile[]>(() => {
    const merged: RecommendTile[] = []
    const candidates = [
        ...recommendCards.value,
        ...quickFallbacks.filter((item) => item.sections.includes('recommend'))
    ]

    candidates.forEach((item) => {
        const exists = merged.some(
            (row) => row.code === item.code || row.path === item.path || row.title === item.title
        )
        if (!exists && merged.length < 4) {
            merged.push(item)
        }
    })

    merged.push({
        id: 'recommend-more',
        name: '查看更多',
        code: 'recommend-more',
        path: '',
        icon: '🧭',
        iconClass: 'premium-icon-g8',
        iconIsImage: false,
        sort: 999,
        title: '查看更多',
        desc: '发现更多精彩专题',
        tag: '更多',
        thumbBg: 'linear-gradient(135deg,#9ca3af,#d1d5db)',
        sections: ['recommend'],
        action: 'more'
    })

    return merged
})

const dashboardTools = computed<DashboardTool[]>(() => [
    {
        id: 'tool-gantt',
        title: '甘特图',
        desc: '项目计划与进度追踪',
        tag: '进度',
        progress: taskCompletionRate.value,
        metricLabel: '完成度',
        metricValue: `${taskCompletionRate.value}%`,
        icon: '📋',
        iconClass: 'premium-icon-g6',
        path: '/pages/plan/schedule/index'
    },
    {
        id: 'tool-alert',
        title: '告警分析',
        desc: '异常事件与趋势分析',
        tag: `${pendingAlertCount.value}条`,
        progress: deviceOverview.value.total
            ? Math.round((deviceOverview.value.online / deviceOverview.value.total) * 100)
            : 0,
        metricLabel: '在线率',
        metricValue: deviceOverview.value.total
            ? `${Math.round((deviceOverview.value.online / deviceOverview.value.total) * 100)}%`
            : '0%',
        icon: '🔔',
        iconClass: 'premium-icon-g4',
        path: '/pages/camera/index'
    },
    {
        id: 'tool-export',
        title: '报表导出',
        desc: '一键生成运营报表',
        tag: '本月',
        progress: customerMonthlyRate.value,
        metricLabel: '新增客户',
        metricValue: `${customerStats.value.monthly}`,
        icon: '📤',
        iconClass: 'premium-icon-g5',
        path: '/pages/news/news'
    },
    {
        id: 'tool-todo',
        title: '待办事项',
        desc: '今日待办 · 优先处理',
        tag: `${todayStats.value.todoCount}项`,
        progress: taskCompletionRate.value,
        metricLabel: '完成',
        metricValue: `${taskCompletionRate.value}%`,
        icon: '✅',
        iconClass: 'premium-icon-g3',
        path: '/pages/plan/schedule/index'
    }
])

const utilityChips = computed<UtilityChip[]>(() => [
    {
        id: 'chip-date',
        label: `📅 ${formatChipDate()}`,
        dotColor: 'var(--color-primary)',
        path: '/pages/plan/schedule/index'
    },
    {
        id: 'chip-todo',
        label: `📋 今日待办 ${todayStats.value.todoCount}`,
        dotColor: 'var(--color-warning)',
        path: '/pages/plan/schedule/index'
    },
    {
        id: 'chip-device',
        label: `🛡️ 在线设备 ${deviceOverview.value.online}`,
        dotColor: 'var(--color-success)',
        path: '/pages/camera/index'
    },
    {
        id: 'chip-customer',
        label: `👥 待跟进 ${customerStats.value.following}`,
        dotColor: '#8b5cf6',
        path: '/pages/customer/info'
    },
    {
        id: 'chip-notice',
        label: `📢 系统公告 ${noticeCount.value || noticeItems.value.length}`,
        dotColor: '#a855f7',
        path: '/pages/news/news'
    }
])

const resolveMenuIcon = (icon?: string) => {
    if (!icon) return ''
    return icon.startsWith('http') ? icon : appStore.getImageUrl(icon)
}

async function withTimeout<T>(promise: Promise<T>, fallback: T, ms = 1800): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
        return await Promise.race([
            promise,
            new Promise<T>((resolve) => {
                timer = setTimeout(() => resolve(fallback), ms)
            })
        ])
    } finally {
        if (timer) clearTimeout(timer)
    }
}

const isHtmlResponse = (value: unknown) => {
    return typeof value === 'string' && /<(?:!DOCTYPE|html|body|head)\b/i.test(value)
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
        } else {
            noticeList.value = []
        }
    } catch (error) {
        console.error('加载首页配置失败', error)
        noticeList.value = []
    }
}

const loadTodayScheduleStats = async () => {
    try {
        const stats = await withTimeout(getTodayStats({}) as Promise<any>, null)
        if (isHtmlResponse(stats)) {
            throw new Error('today stats api returned html')
        }
        todayStats.value = {
            totalCount: Number(stats?.totalCount || 0),
            todoCount: Number(stats?.todoCount || 0),
            completedCount: Number(stats?.completedCount || 0)
        }
    } catch (error) {
        console.error('加载今日日程统计失败', error)
        todayStats.value = {
            totalCount: 0,
            todoCount: 0,
            completedCount: 0
        }
    }
}

const loadCustomerOverview = async () => {
    try {
        const res: any = await withTimeout(getCustomerStats() as Promise<any>, null)
        if (isHtmlResponse(res)) {
            throw new Error('customer stats api returned html')
        }
        const total = typeof res === 'number' ? res : res?.total || res?.count || res?.data || 0
        customerStats.value = {
            total: Number(total || 0),
            monthly: Number(res?.monthly || res?.monthCount || 0),
            following: Number(res?.following || res?.todo || 0)
        }
    } catch (error) {
        console.error('加载客户概览失败', error)
        customerStats.value = {
            total: 0,
            monthly: 0,
            following: 0
        }
    }
}

const loadDeviceOverview = async () => {
    try {
        const devices = await withTimeout(getCameraList() as Promise<any>, [])
        if (isHtmlResponse(devices)) {
            throw new Error('camera list api returned html')
        }
        const list = Array.isArray(devices) ? (devices as CameraDevice[]) : []
        const total = list.length
        const online = list.filter((item) => item.status === 1).length
        deviceOverview.value = {
            total,
            online,
            offline: total - online
        }
    } catch (error) {
        console.error('加载设备概览失败', error)
        deviceOverview.value = {
            total: 0,
            online: 0,
            offline: 0
        }
    }
}

const loadDashboardData = async () => {
    await Promise.all([loadTodayScheduleStats(), loadCustomerOverview(), loadDeviceOverview()])
}

const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) return '凌晨好'
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
}

const formatChipDate = () => {
    const now = new Date()
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`
}

const goSearch = () => {
    router.navigateTo('/pages/search/search')
}

const handleScan = () => {
    uni.showToast({ title: '扫码功能开发中', icon: 'none' })
}

const goNotice = () => {
    if (noticeItems.value.length) {
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

const handleQuickTap = (item: QuickTile) => {
    if (item.action === 'more') {
        goMore('quick')
        return
    }
    goLink(item.path)
}

const handleRecommendTap = (item: RecommendTile) => {
    if (item.action === 'more') {
        goMore('recommend')
        return
    }
    goLink(item.path)
}

const handleChipTap = (item: UtilityChip) => {
    if (item.path) {
        goLink(item.path)
        return
    }
    uni.showToast({ title: item.label, icon: 'none' })
}

const onHeroChange = (event: any) => {
    currentHero.value = Number(event?.detail?.current || 0)
}

onShow(async () => {
    await Promise.all([loadConfig(), loadDashboardData()])
})
</script>

<style scoped lang="scss">
.home-page {
    min-height: 100vh;
    background: linear-gradient(
            180deg,
            rgba(var(--color-primary-rgb), 0.06) 0,
            rgba(var(--color-primary-rgb), 0) 220rpx
        ),
        var(--color-bg-app);
    padding: 24rpx;
    box-sizing: border-box;
}

.phone-frame {
    width: 100%;
    max-width: 750rpx;
    min-height: calc(100vh - 48rpx);
    margin: 0 auto;
    background: var(--color-bg-app);
    border-radius: 32rpx;
    overflow: hidden;
    position: relative;
    border: 2rpx solid var(--color-border-light);
    box-shadow: var(--shadow-lg);
    padding-bottom: 200rpx;
}

.status-bar {
    height: 88rpx;
    padding: 0 40rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    font-size: 22rpx;
    font-weight: 600;
    background: linear-gradient(135deg, var(--color-primary), var(--color-minor));
    position: relative;
    z-index: 10;
}

.status-time {
    font-weight: 700;
}

.status-right {
    display: flex;
    align-items: center;
    gap: 10rpx;
}

.status-icons {
    color: rgba(255, 255, 255, 0.9);
    font-size: 22rpx;
}

:deep(.theme-switcher .theme-trigger) {
    width: 40rpx;
    height: 40rpx;
    color: rgba(255, 255, 255, 0.76);
    opacity: 1;
}

:deep(.theme-switcher .theme-trigger:active) {
    background: rgba(255, 255, 255, 0.16);
    color: #fff;
}

:deep(.theme-switcher .trigger-icon) {
    width: 18px;
    height: 18px;
    font-size: 18px;
}

.hero-shell {
    padding: 0;
}

.hero-bar {
    position: relative;
    overflow: hidden;
    border-radius: 0;
    padding: 34rpx 40rpx 56rpx;
    background: linear-gradient(135deg, var(--color-primary), var(--color-minor));
    box-shadow: none;
}

.hero-bar::before {
    content: '';
    position: absolute;
    right: -60rpx;
    top: -60rpx;
    width: 260rpx;
    height: 260rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
}

.hero-bar::after {
    content: '';
    position: absolute;
    left: -100rpx;
    bottom: -90rpx;
    width: 220rpx;
    height: 220rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.04);
}

.deco-ring {
    position: absolute;
    top: -56rpx;
    right: 34rpx;
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    border: 3rpx solid rgba(255, 255, 255, 0.16);
}

.deco-dot {
    position: absolute;
    right: 70rpx;
    bottom: 32rpx;
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    box-shadow: 28rpx -18rpx 0 rgba(255, 255, 255, 0.12), -18rpx 24rpx 0 rgba(255, 255, 255, 0.12);
}

.hero-top {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
}

.hero-welcome {
    display: flex;
    align-items: center;
    gap: 16rpx;
    min-width: 0;
}

.hero-avatar {
    width: 88rpx;
    height: 88rpx;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: 30rpx;
    font-weight: 700;
    flex-shrink: 0;
    box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.14);
}

.hero-greeting {
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.hero-name {
    font-size: 34rpx;
    font-weight: 700;
    line-height: 1.2;
    color: #fff;
}

.hero-sub {
    margin-top: 6rpx;
    font-size: 20rpx;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.78);
}

.hero-icon {
    position: relative;
    width: 72rpx;
    height: 72rpx;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.16);
    color: #fff;
    flex-shrink: 0;
    backdrop-filter: blur(10rpx);
    -webkit-backdrop-filter: blur(10rpx);
}

.hero-icon:active {
    transform: scale(var(--scale-active));
}

.hero-icon-text {
    font-size: 30rpx;
    line-height: 1;
}

.hero-badge {
    position: absolute;
    top: -8rpx;
    right: -6rpx;
    min-width: 34rpx;
    height: 34rpx;
    padding: 0 8rpx;
    border-radius: 999rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-danger);
    color: #fff;
    font-size: 18rpx;
    font-weight: 700;
    box-shadow: 0 0 0 4rpx rgba(91, 91, 214, 0.4);
}

.home-content {
    margin-top: -22rpx;
    position: relative;
    z-index: 3;
}

.asset-card {
    margin: 0 24rpx;
    padding: 20rpx 24rpx;
    display: flex;
    align-items: center;
    gap: 18rpx;
    background: var(--color-surface);
    border: 2rpx solid var(--color-border-light);
    border-radius: 28rpx;
    box-shadow: var(--shadow-sm);
    background: var(--color-surface);
}

.asset-left {
    flex: 1;
}

.asset-left-inline {
    display: flex;
    align-items: center;
    gap: 18rpx;
    min-width: 0;
}

.asset-label {
    font-size: 22rpx;
    color: var(--color-text-tertiary);
    flex-shrink: 0;
}

.asset-amount {
    display: flex;
    align-items: center;
    gap: 10rpx;
    min-width: 0;
}

.asset-count {
    font-size: 44rpx;
    font-weight: 800;
    color: var(--color-text);
    line-height: 1;
}

.asset-unit {
    font-size: 20rpx;
    color: var(--color-text-secondary);
}

.metric-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20rpx;
    flex-shrink: 0;
}

.metric-icon-md {
    width: 54rpx;
    height: 54rpx;
    border-radius: 18rpx;
    font-size: 26rpx;
}

.metric-icon-sm {
    width: 36rpx;
    height: 36rpx;
    border-radius: 12rpx;
    font-size: 18rpx;
}

.metric-icon-blue {
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.metric-icon-red {
    background: linear-gradient(135deg, var(--color-danger), #f87171);
}

.metric-icon-green {
    background: linear-gradient(135deg, var(--color-success), #4dd499);
}

.asset-right {
    display: flex;
    align-items: center;
    gap: 12rpx;
    flex-shrink: 0;
}

.asset-right-inline {
    width: auto;
}

.asset-item {
    padding: 10rpx 14rpx;
    border-radius: 22rpx;
    background: var(--color-surface-soft);
}

.asset-item-inline {
    min-width: 138rpx;
}

.asset-num {
    display: flex;
    align-items: center;
    gap: 6rpx;
    font-size: 24rpx;
    font-weight: 700;
}

.asset-num-danger {
    color: var(--color-danger);
}

.asset-num-success {
    color: var(--color-success);
}

.asset-item-label {
    display: block;
    margin-top: 4rpx;
    font-size: 16rpx;
    color: var(--color-text-secondary);
}

.search-row {
    margin: 20rpx 24rpx 0;
    display: flex;
    gap: 14rpx;
    align-items: center;
}

.search-input {
    flex: 1;
    height: 84rpx;
    padding: 0 24rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;
    border-radius: 24rpx;
    background: var(--color-surface);
    border: 2rpx solid var(--color-border-light);
    box-shadow: var(--shadow-sm);
    color: var(--color-text-secondary);
}

.search-input:active,
.search-qr:active {
    transform: scale(var(--scale-active));
}

.search-input-icon {
    font-size: 28rpx;
    color: var(--color-text-tertiary);
}

.search-input-text {
    font-size: 24rpx;
    color: var(--color-text-tertiary);
    letter-spacing: 0.02em;
}

.search-qr {
    width: 84rpx;
    height: 84rpx;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary-soft);
    color: var(--color-primary);
    font-size: 30rpx;
    border: 2rpx solid rgba(var(--color-primary-rgb), 0.12);
}

.content-shell {
    padding: 18rpx 24rpx 0;
}

.carousel-wrap {
    border-radius: 28rpx;
    overflow: hidden;
    background: transparent;
}

.carousel-swiper {
    height: 276rpx;
}

.carousel-slide {
    position: relative;
    height: 276rpx;
    border-radius: 28rpx;
    overflow: hidden;
    padding: 34rpx 30rpx 30rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: #fff;
}

.carousel-slide::before {
    content: '';
    position: absolute;
    top: -40rpx;
    right: -26rpx;
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    border: 2rpx solid rgba(255, 255, 255, 0.14);
}

.carousel-slide::after {
    content: '';
    position: absolute;
    left: 20rpx;
    right: 20rpx;
    bottom: 0;
    height: 8rpx;
    border-radius: 8rpx 8rpx 0 0;
    background: rgba(255, 255, 255, 0.08);
}

.carousel-icon {
    position: absolute;
    top: 24rpx;
    right: 30rpx;
    font-size: 92rpx;
    opacity: 0.18;
}

.carousel-title {
    position: relative;
    z-index: 2;
    font-size: 38rpx;
    font-weight: 700;
}

.carousel-desc {
    position: relative;
    z-index: 2;
    margin-top: 12rpx;
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.88);
}

.carousel-dots {
    position: absolute;
    left: 50%;
    bottom: 12rpx;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    gap: 8rpx;
    z-index: 3;
}

.carousel-dot {
    width: 10rpx;
    height: 10rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.4);
    transition: width 0.2s ease, background 0.2s ease;
}

.carousel-dot.active {
    width: 24rpx;
    background: rgba(255, 255, 255, 0.92);
}

.notice-strip {
    margin-top: 16rpx;
    padding: 14rpx 18rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    border-radius: 24rpx;
    background: var(--color-surface);
    border: 2rpx solid var(--color-border-light);
    box-shadow: var(--shadow-sm);
}

.notice-icon {
    width: 44rpx;
    height: 44rpx;
    border-radius: 14rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary-soft);
    color: var(--color-warning);
    font-size: 24rpx;
    flex-shrink: 0;
}

.notice-wrap {
    flex: 1;
    min-width: 0;
}

.notice-swiper {
    height: 30rpx;
}

.notice-line {
    display: block;
    font-size: 20rpx;
    color: var(--color-text);
    line-height: 30rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.notice-arrow {
    font-size: 24rpx;
    color: var(--color-warning);
}

.section-hdr {
    margin-top: 24rpx;
    margin-bottom: 14rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.section-hdr-tight {
    margin-top: 24rpx;
}

.section-title {
    font-size: 26rpx;
    font-weight: 700;
    color: var(--color-text);
}

.section-more {
    font-size: 20rpx;
    color: var(--color-text-tertiary);
}

.quick-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10rpx 0;
    padding: 22rpx 12rpx 14rpx;
    border-radius: 28rpx;
    background: var(--color-surface);
    border: 2rpx solid var(--color-border-light);
    box-shadow: var(--shadow-sm);
}

.quick-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
    padding: 8rpx 0;
}

.quick-item:active {
    transform: scale(var(--scale-active));
}

.quick-icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #fff;
    box-shadow: var(--shadow-sm);
}

.quick-icon-has-image {
    box-shadow: var(--shadow-sm);
}

.quick-image {
    width: 40rpx;
    height: 40rpx;
}

.quick-label {
    font-size: 19rpx;
    color: var(--color-text-secondary);
    line-height: 1.3;
}

.recommend-scroll,
.tool-strip {
    white-space: nowrap;
}

.recommend-track,
.tool-strip-track {
    display: inline-flex;
    gap: 16rpx;
    padding-bottom: 6rpx;
}

.recommend-card {
    width: 228rpx;
    flex-shrink: 0;
    overflow: hidden;
    border-radius: 28rpx;
    background: var(--color-surface);
    border: 2rpx solid var(--color-border-light);
    box-shadow: var(--shadow-sm);
    background: var(--color-surface);
}

.recommend-card:active {
    transform: scale(var(--scale-active));
}

.recommend-thumb {
    height: 144rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    color: #fff;
}

.thumb-icon {
    font-size: 42rpx;
}

.thumb-image {
    width: 66rpx;
    height: 66rpx;
}

.thumb-tag {
    position: absolute;
    top: 12rpx;
    left: 12rpx;
    padding: 4rpx 14rpx;
    border-radius: 999rpx;
    font-size: 18rpx;
    font-weight: 600;
    color: #fff;
    background: rgba(255, 255, 255, 0.22);
}

.recommend-body {
    padding: 16rpx 16rpx 18rpx;
}

.recommend-title {
    display: block;
    font-size: 23rpx;
    font-weight: 600;
    color: var(--color-text);
}

.recommend-desc {
    display: block;
    margin-top: 8rpx;
    font-size: 19rpx;
    line-height: 1.5;
    color: var(--color-text-secondary);
}

.tools-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16rpx;
}

.tool-card {
    position: relative;
    overflow: hidden;
    padding: 20rpx 18rpx 18rpx;
    border-radius: 28rpx;
    background: var(--color-surface);
    border: 2rpx solid var(--color-border-light);
    box-shadow: var(--shadow-sm);
}

.tool-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 20rpx;
    right: 20rpx;
    height: 5rpx;
    border-radius: 0 0 999rpx 999rpx;
    background: linear-gradient(135deg, var(--color-primary), var(--color-minor));
}

.tool-card:active {
    transform: scale(var(--scale-active));
}

.tool-top {
    display: flex;
    align-items: center;
    gap: 10rpx;
    margin-bottom: 10rpx;
}

.tool-icon {
    width: 58rpx;
    height: 58rpx;
    border-radius: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26rpx;
    flex-shrink: 0;
}

.tool-icon-image-wrap {
    background: rgba(255, 255, 255, 0.16);
}

.tool-icon-image {
    width: 30rpx;
    height: 30rpx;
    display: block;
}

.tool-title {
    flex: 1;
    font-size: 24rpx;
    font-weight: 600;
    color: var(--color-text);
}

.tool-tag {
    padding: 4rpx 10rpx;
    border-radius: 999rpx;
    font-size: 17rpx;
    font-weight: 600;
    color: var(--color-primary);
    background: var(--color-primary-soft);
    border: 2rpx solid rgba(var(--color-primary-rgb), 0.12);
}

.tool-desc {
    display: block;
    font-size: 18rpx;
    line-height: 1.5;
    color: var(--color-text-secondary);
}

.tool-bar {
    margin-top: 16rpx;
    height: 10rpx;
    border-radius: 999rpx;
    overflow: hidden;
    background: var(--color-surface-soft);
}

.tool-bar-in {
    height: 100%;
    border-radius: 999rpx;
    background: linear-gradient(135deg, var(--color-primary), var(--color-minor));
}

.tool-bar-label {
    margin-top: 8rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 17rpx;
    color: var(--color-text-tertiary);
}

.tool-chip {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10rpx;
    padding: 10rpx 18rpx;
    border-radius: 999rpx;
    background: var(--color-surface);
    border: 2rpx solid var(--color-border-light);
    box-shadow: var(--shadow-sm);
}

.tool-chip:active {
    transform: scale(var(--scale-active));
}

.tool-chip-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    flex-shrink: 0;
}

.tool-chip-text {
    font-size: 20rpx;
    color: var(--color-text-secondary);
    white-space: nowrap;
}

</style>
