<template>
    <!-- 鼠标事件通过 raw DOM document-level capture 绕过 uni-app 事件系统 -->
    <view class="plan-home-page">
        <!-- ===== Hero Bar (gradient bg, avatar, greeting) ===== -->
        <view class="hero-bar">
            <view class="deco-ring"></view>
            <view class="deco-dot"></view>
            <view class="hero-top">
                <view class="hero-welcome">
                    <view class="hero-avatar">P</view>
                    <view class="hero-greeting">
                        <text class="name">计划总览</text>
                        <text class="sub"
                            >{{ currentYear }} 年 {{ currentMonth }} 月 · 高效管理每一天</text
                        >
                    </view>
                </view>
                <view class="hero-icon" @tap="go('/pages/plan/stats/index')">
                    🔔 <text class="badge">{{ scheduleStats.todoCount }}</text>
                </view>
            </view>
        </view>

        <!-- ===== Asset Card (overlapping, shadow-glow) ===== -->
        <view class="asset-card premium-fade-in" @tap="go('/pages/plan/schedule/index')">
            <view class="asset-left">
                <view class="asset-label">今日概要</view>
                <view class="asset-amount">
                    <span class="metric-icon blue md">📋</span>
                    {{ scheduleStats.todoCount }} <small>今日待办</small>
                </view>
            </view>
            <view class="asset-right">
                <view class="asset-item">
                    <view class="num num-flex" :style="{ color: 'var(--color-success)' }">
                        <span class="metric-icon green sm">✅</span>
                        {{ scheduleStats.completedCount }}
                    </view>
                    <view class="lbl">已完成</view>
                </view>
                <view class="asset-item">
                    <view class="num num-flex" :style="{ color: 'var(--color-primary)' }">
                        <span class="metric-icon blue sm">🎯</span> {{ habitStats.totalCheckins }}
                    </view>
                    <view class="lbl">累计打卡</view>
                </view>
            </view>
        </view>

        <!-- ===== Search Row ===== -->
        <view class="search-row premium-fade-in premium-d1">
            <view class="search-input" @tap="go('/pages/plan/schedule/index')">
                <span class="icon">🔍</span>
                <span class="text">搜索日程、习惯、记录...</span>
            </view>
            <view class="search-qr" @tap="go('/pages/plan/stats/index')">📊</view>
        </view>

        <view class="content">
            <!-- ===== Carousel ===== -->
            <view class="carousel-wrap premium-fade-in premium-d1">
                <swiper
                    class="carousel-swiper"
                    :indicator-dots="false"
                    :autoplay="true"
                    :interval="3500"
                    :circular="true"
                    @change="onCarouselChange"
                >
                    <swiper-item
                        v-for="(slide, idx) in carouselSlides"
                        :key="idx"
                        class="carousel-slide"
                        :style="{ background: slide.bg }"
                    >
                        <view class="carousel-inner">
                            <span class="c-icon">{{ slide.icon }}</span>
                            <span class="c-title">{{ slide.title }}</span>
                            <span class="c-desc">{{ slide.desc }}</span>
                        </view>
                    </swiper-item>
                </swiper>
                <view class="carousel-dots">
                    <view
                        v-for="(_, idx) in carouselSlides"
                        :key="idx"
                        class="carousel-dot"
                        :class="{ active: carouselIndex === idx }"
                    ></view>
                </view>
            </view>

            <!-- ===== Notice Strip (todayHighlights) ===== -->
            <view
                v-if="todayHighlights.length"
                class="notice-strip premium-fade-in premium-d2"
                @tap="go('/pages/plan/schedule/index')"
            >
                <span class="n-icon">📢</span>
                <view class="n-wrap">
                    <view
                        class="n-scroll"
                        :style="{ transform: 'translateY(-' + noticeIdx * 16 + 'px)' }"
                    >
                        <span v-for="(item, idx) in noticeList" :key="idx" class="n-text">{{
                            item.text
                        }}</span>
                    </view>
                </view>
                <span class="n-arrow">›</span>
            </view>

            <!-- ===== Quick Menu ===== -->
            <view class="section-hdr premium-fade-in premium-d2">
                <span class="title">快捷功能</span>
                <span class="more premium-more-link" @tap="go('/pages/plan/stats/index')"
                    >全部 <span>→</span></span
                >
            </view>
            <view class="quick-grid premium-fade-in premium-d2">
                <view
                    v-for="(item, idx) in quickItems"
                    :key="idx"
                    class="quick-item"
                    @tap="go(item.path)"
                >
                    <view class="quick-icon" :style="{ background: item.bg }">{{ item.icon }}</view>
                    <span class="quick-label">{{ item.label }}</span>
                </view>
            </view>

            <!-- ===== 热门推荐 ===== -->
            <view class="section-hdr premium-fade-in premium-d4">
                <span class="title">热门推荐</span>
                <span class="more premium-more-link" @tap="go('/pages/plan/stats/index')"
                    >查看全部 <span>→</span></span
                >
            </view>
            <view class="recommend-scroll premium-fade-in premium-d4">
                <view class="recommend-card" @tap="go('/pages/plan/schedule/index')">
                    <view
                        class="recommend-thumb"
                        style="background: linear-gradient(135deg, #1a1a2e, #6366f1)"
                    >
                        <span class="r-icon">🤖</span>
                        <span class="r-tag">热门</span>
                    </view>
                    <view class="recommend-body">
                        <span class="r-title">AI 技术专题</span>
                        <span class="r-desc">前沿AI技术解析与应用</span>
                    </view>
                </view>
                <view class="recommend-card" @tap="go('/pages/plan/habit/index')">
                    <view
                        class="recommend-thumb"
                        style="background: linear-gradient(135deg, #0f3443, #22b573)"
                    >
                        <span class="r-icon">📋</span>
                        <span class="r-tag">推荐</span>
                    </view>
                    <view class="recommend-body">
                        <span class="r-title">项目管理实践</span>
                        <span class="r-desc">高效团队协作方法总结</span>
                    </view>
                </view>
                <view class="recommend-card" @tap="go('/pages/plan/focus/index')">
                    <view
                        class="recommend-thumb"
                        style="background: linear-gradient(135deg, #2d1b69, #a855f7)"
                    >
                        <span class="r-icon">📊</span>
                        <span class="r-tag">干货</span>
                    </view>
                    <view class="recommend-body">
                        <span class="r-title">数据分析方法</span>
                        <span class="r-desc">从数据到决策的完整路径</span>
                    </view>
                </view>
                <view class="recommend-card" @tap="go('/pages/plan/stats/index')">
                    <view
                        class="recommend-thumb"
                        style="background: linear-gradient(135deg, #78350f, #f0a020)"
                    >
                        <span class="r-icon">🔭</span>
                        <span class="r-tag">新知</span>
                    </view>
                    <view class="recommend-body">
                        <span class="r-title">行业趋势洞察</span>
                        <span class="r-desc">2026下半年关键风向标</span>
                    </view>
                </view>
            </view>

            <!-- ===== Tools Grid ===== -->
            <view class="section-hdr premium-fade-in premium-d5">
                <span class="title">常用工具</span>
                <span class="more premium-more-link" @tap="go('/pages/plan/focus/index')"
                    >更多 <span>→</span></span
                >
            </view>
            <view class="tools-grid premium-fade-in premium-d5">
                <!-- 番茄专注 -->
                <view class="tool-card" @tap="go('/pages/plan/focus/index')">
                    <view class="t-top">
                        <view
                            class="t-icon"
                            style="background: linear-gradient(135deg, #f97316, #fb923c)"
                            >🍅</view
                        >
                        <span class="t-title">番茄专注</span>
                        <span class="t-tag">{{ focusSummary.completedFocusCount }}轮</span>
                    </view>
                    <span class="t-desc">今日专注 {{ focusSummary.totalFocusMinutes }} 分钟</span>
                    <view class="t-bar">
                        <view class="t-bar-in" :style="{ width: focusBarWidth + '%' }"></view>
                    </view>
                    <view class="t-bar-label">
                        <span>完成度</span><span>{{ focusBarWidth }}%</span>
                    </view>
                </view>
                <!-- 习惯打卡 -->
                <view class="tool-card" @tap="go('/pages/plan/habit/index')">
                    <view class="t-top">
                        <view
                            class="t-icon"
                            style="background: linear-gradient(135deg, #22b573, #34d399)"
                            >🎯</view
                        >
                        <span class="t-title">习惯打卡</span>
                        <span class="t-tag">{{ habitStats.activeCount }}个</span>
                    </view>
                    <span class="t-desc">累计打卡 {{ habitStats.totalCheckins }} 天</span>
                    <view class="t-bar">
                        <view class="t-bar-in" :style="{ width: habitBarWidth + '%' }"></view>
                    </view>
                    <view class="t-bar-label">
                        <span>完成率</span><span>{{ habitBarWidth }}%</span>
                    </view>
                </view>
                <!-- 日程统计 -->
                <view class="tool-card" @tap="go('/pages/plan/schedule/index')">
                    <view class="t-top">
                        <view
                            class="t-icon"
                            style="background: linear-gradient(135deg, #6366f1, #818cf8)"
                            >📋</view
                        >
                        <span class="t-title">日程统计</span>
                        <span class="t-tag">今日</span>
                    </view>
                    <span class="t-desc"
                        >{{ scheduleStats.completedCount }}/{{
                            scheduleStats.totalCount
                        }}
                        已完成</span
                    >
                    <view class="t-bar">
                        <view class="t-bar-in" :style="{ width: schedBarWidth + '%' }"></view>
                    </view>
                    <view class="t-bar-label">
                        <span>完成率</span><span>{{ schedBarWidth }}%</span>
                    </view>
                </view>
                <!-- 统计洞察 -->
                <view class="tool-card" @tap="go('/pages/plan/stats/index')">
                    <view class="t-top">
                        <view
                            class="t-icon"
                            style="background: linear-gradient(135deg, #a855f7, #c084fc)"
                            >📊</view
                        >
                        <span class="t-title">统计洞察</span>
                        <span class="t-tag">分析</span>
                    </view>
                    <span class="t-desc">集中查看计划模块的统计分析</span>
                    <view class="t-bar">
                        <view class="t-bar-in" style="width: 72%"></view>
                    </view>
                    <view class="t-bar-label"> <span>数据</span><span>月度</span> </view>
                </view>
            </view>

            <!-- ===== Tool Chips ===== -->
            <view class="section-hdr premium-fade-in premium-d6">
                <span class="title">便捷工具</span>
                <span class="more premium-more-link" @tap="go('/pages/plan/habit/index')"
                    >更多 <span>→</span></span
                >
            </view>
            <view class="tool-strip premium-fade-in premium-d7">
                <span class="tool-chip" @tap="go('/pages/plan/schedule/index')"
                    ><span class="dot" style="background: var(--color-primary)"></span> 📅
                    日程计划</span
                >
                <span class="tool-chip" @tap="go('/pages/plan/habit/index')"
                    ><span class="dot" style="background: var(--color-success)"></span> 🎯
                    习惯打卡</span
                >
                <span class="tool-chip" @tap="go('/pages/plan/focus/index')"
                    ><span class="dot" style="background: var(--color-warning)"></span> 🍅 专注
                    {{ focusSummary.totalFocusMinutes }}m</span
                >
                <span class="tool-chip" @tap="go('/pages/plan/stats/index')"
                    ><span class="dot" style="background: var(--color-minor)"></span> 📊
                    统计洞察</span
                >
            </view>
        </view>

        <PremiumBottomNav active="plan" />
    </view>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'uniapp-router-next'
import PremiumBottomNav from '@/components/PremiumBottomNav.vue'
import { getTodayStats, getScheduleByDate } from '@/api/plan/schedule'
import { getHabitStats } from '@/api/plan/habit'
import { quadrantColor } from '@/components/calendar-grid/calendar-utils.js'
import { getTodayFocusStats } from '@/api/plan/focus'
import { getTodayFocusSummary } from '@/utils/focus'
import { useHoverEffect } from '@/hooks/useHoverEffect'

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)
const router = useRouter()

const scheduleStats = ref({ totalCount: 0, todoCount: 0, completedCount: 0 })
const habitStats = ref({ activeCount: 0, completedCount: 0, totalCheckins: 0 })
const todayHighlights = ref([])
const focusSummary = ref({
    completedFocusCount: 0,
    totalFocusMinutes: 0,
    currentStreak: 0
})
const carouselIndex = ref(0)
const noticeIdx = ref(0)
let noticeTimer = null

const todayTs = computed(() => {
    return new Date(currentYear.value, currentMonth.value - 1, now.getDate()).getTime()
})

const carouselSlides = [
    {
        icon: '🏆',
        title: 'AI 智能监控升级',
        desc: '实时分析 · 异常告警 · 7x24h 守护',
        bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)'
    },
    {
        icon: '📋',
        title: '计划管理 3.0 上线',
        desc: '甘特图 · 日程 · 打卡 · 目标追踪',
        bg: 'linear-gradient(135deg,#d4956b,#e8b88a)'
    },
    {
        icon: '📊',
        title: '数据分析工具上新',
        desc: '经营看板 · 报表导出 · 智能分析',
        bg: 'linear-gradient(135deg,#22b573,#4dd499)'
    }
]

const quickItems = [
    {
        icon: '📅',
        label: '日程计划',
        bg: 'linear-gradient(135deg,#6366f1,#818cf8)',
        path: '/pages/plan/schedule/index'
    },
    {
        icon: '🎯',
        label: '习惯打卡',
        bg: 'linear-gradient(135deg,#22b573,#34d399)',
        path: '/pages/plan/habit/index'
    },
    {
        icon: '🍅',
        label: '番茄专注',
        bg: 'linear-gradient(135deg,#f97316,#fb923c)',
        path: '/pages/plan/focus/index'
    },
    {
        icon: '📊',
        label: '统计洞察',
        bg: 'linear-gradient(135deg,#a855f7,#c084fc)',
        path: '/pages/plan/stats/index'
    },
    { icon: '🔔', label: '告警中心', bg: 'linear-gradient(135deg,#e85a5a,#f08080)', path: '' },
    { icon: '👥', label: '客户管理', bg: 'linear-gradient(135deg,#4f8cff,#6aa8ff)', path: '' },
    { icon: '💳', label: '财务管理', bg: 'linear-gradient(135deg,#ec4899,#f472b6)', path: '' },
    { icon: '📋', label: '项目管理', bg: 'linear-gradient(135deg,#06b6d4,#22d3ee)', path: '' },
    { icon: '📄', label: '文档管理', bg: 'linear-gradient(135deg,#f0a020,#fbbf24)', path: '' },
    { icon: '•••', label: '更多功能', bg: 'linear-gradient(135deg,#9ca3af,#d1d5db)', path: '' }
]

const noticeList = computed(() => {
    if (todayHighlights.value.length === 0) return [{ text: '今天还没有日程安排' }]
    return todayHighlights.value.map((item) => ({
        text: item.title + (item.status === 1 ? ' ✅ 已完成' : ' ⏳ 待处理')
    }))
})

const focusBarWidth = computed(() => {
    const max = 120 // 120分钟 = 2小时为100%
    return Math.min(100, Math.round((focusSummary.value.totalFocusMinutes / max) * 100))
})
const habitBarWidth = computed(() => {
    const total = habitStats.value.activeCount + habitStats.value.completedCount
    if (total === 0) return 0
    return Math.round((habitStats.value.completedCount / total) * 100)
})
const schedBarWidth = computed(() => {
    const total = scheduleStats.value.totalCount
    if (total === 0) return 0
    return Math.round((scheduleStats.value.completedCount / total) * 100)
})

const loadTodaySchedule = async () => {
    try {
        const events = await getScheduleByDate({ date: todayTs.value })
        todayHighlights.value = Array.isArray(events) ? events.slice(0, 4) : []
    } catch (error) {
        console.error('加载今日日程失败', error)
        todayHighlights.value = []
    }
}

const loadScheduleStats = async () => {
    try {
        const stats = await getTodayStats({})
        scheduleStats.value = stats || { totalCount: 0, todoCount: 0, completedCount: 0 }
    } catch (error) {
        console.error('加载日程统计失败', error)
    }
}

const loadHabitStats = async () => {
    try {
        const stats = await getHabitStats({})
        habitStats.value = stats || { activeCount: 0, completedCount: 0, totalCheckins: 0 }
    } catch (error) {
        console.error('加载习惯统计失败', error)
    }
}

const loadFocusSummary = () => {
    const summary = getTodayFocusSummary()
    focusSummary.value = {
        completedFocusCount: summary.completedFocusCount,
        totalFocusMinutes: summary.totalFocusMinutes,
        currentStreak: summary.currentStreak
    }
}

const loadFocusSummaryWithFallback = async () => {
    try {
        const stats = await getTodayFocusStats()
        const focusCount = Number(stats?.focusCount || 0)
        focusSummary.value = {
            completedFocusCount: focusCount,
            totalFocusMinutes: Number(stats?.focusMinutes || 0),
            currentStreak: focusCount
        }
    } catch (error) {
        console.error('加载专注统计失败，改用本地缓存', error)
        loadFocusSummary()
    }
}

const formatTime = (ts) => {
    if (!ts) return '--:--'
    const d = new Date(ts)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const go = (url) => {
    if (!url) return
    router.navigateTo(url)
}

const onCarouselChange = (e) => {
    carouselIndex.value = e.detail?.current || 0
}

const startNoticeRotation = () => {
    if (noticeTimer) clearInterval(noticeTimer)
    const items = noticeList.value
    if (items.length <= 1) return
    noticeTimer = setInterval(() => {
        noticeIdx.value = (noticeIdx.value + 1) % items.length
    }, 3000)
}

// Hover 系统 — 通过 useHoverEffect composable 管理
useHoverEffect(
    '.quick-item,.recommend-card,.tool-card,.tool-chip,.notice-strip,.search-input,.search-qr,.asset-card,.hero-icon',
    '.plan-home-page'
)

onMounted(async () => {
    await Promise.all([loadTodaySchedule(), loadScheduleStats(), loadHabitStats()])
    await loadFocusSummaryWithFallback()
    startNoticeRotation()
})

onUnmounted(() => {
    if (noticeTimer) clearInterval(noticeTimer)
})
</script>

<style scoped lang="scss">
/* ===== Page Container ===== */
.plan-home-page {
    background: var(--color-bg-app);
    padding-bottom: 160rpx;
}

/* ===== Hero Bar (gradient bg, deco circles) ===== */
.hero-bar {
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
    padding: 20px 20px 32px;
    position: relative;
    overflow: hidden;
}
.hero-bar::before {
    content: '';
    position: absolute;
    right: -30px;
    top: -30px;
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    pointer-events: none;
}
.hero-bar::after {
    content: '';
    position: absolute;
    left: -50px;
    bottom: -40px;
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.04);
    pointer-events: none;
}
.deco-ring {
    position: absolute;
    right: 50px;
    top: -8px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.08);
    pointer-events: none;
}
.deco-dot {
    position: absolute;
    left: 70px;
    top: 14px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    pointer-events: none;
}
.hero-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
}
.hero-welcome {
    display: flex;
    align-items: center;
    gap: 10px;
}
.hero-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 700;
    font-size: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(8px);
    flex-shrink: 0;
}
.hero-greeting {
    color: #fff;
}
.hero-greeting .name {
    font-size: 18px;
    font-weight: 700;
    display: block;
}
.hero-greeting .sub {
    font-size: 12px;
    opacity: 0.75;
    margin-top: 3px;
    display: block;
}
.hero-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
    position: relative;
    backdrop-filter: blur(8px);
    transition: background var(--duration) var(--ease);
}
.hero-icon:active {
    background: rgba(255, 255, 255, 0.3);
}
.hero-icon .badge {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    background: var(--color-danger);
    font-size: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: #fff;
    border: 2px solid transparent;
}

/* ===== Asset Card (overlapping, shadow-glow) ===== */
.asset-card {
    margin: -20px 16px 0;
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: 18px 20px;
    box-shadow: var(--shadow-glow);
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 16px;
    border: 1px solid var(--color-border-light);
    cursor: pointer;
    transition: all var(--duration) var(--ease);
}
.asset-card:active {
    transform: scale(0.98);
}
.asset-left {
    flex: 1;
}
.asset-label {
    font-size: 12px;
    color: var(--color-text-tertiary);
    letter-spacing: 0.5px;
}
.asset-amount {
    font-size: 24px;
    font-weight: 800;
    color: var(--color-text);
    line-height: 1.3;
    display: flex;
    align-items: center;
    gap: 8px;
}
.asset-amount small {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-tertiary);
}
.asset-right {
    display: flex;
    gap: 20px;
    padding-left: 16px;
    border-left: 1px solid var(--color-border-light);
}
.asset-item {
    text-align: center;
}
.asset-item .num {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-text);
}
.asset-item .lbl {
    font-size: 10px;
    color: var(--color-text-tertiary);
    margin-top: 2px;
}
.asset-item .num-flex {
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: center;
}
.metric-icon {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
}
.metric-icon.green {
    background: var(--color-success-soft);
    color: var(--color-success);
}
.metric-icon.red {
    background: var(--color-danger-soft);
    color: var(--color-danger);
}
.metric-icon.blue {
    background: var(--color-primary-soft);
    color: var(--color-primary);
}
.metric-icon.sm {
    width: 22px;
    height: 22px;
    font-size: 10px;
    border-radius: 5px;
}
.metric-icon.md {
    width: 28px;
    height: 28px;
    font-size: 12px;
    border-radius: 6px;
}

/* ===== Search ===== */
.search-row {
    margin: 12px 16px 0;
    display: flex;
    gap: 8px;
}
.search-input {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--color-surface);
    border-radius: var(--radius-xl);
    padding: 10px 16px;
    border: 1px solid var(--color-border-light);
    cursor: pointer;
    transition: all var(--duration) var(--ease);
}
.search-input:active {
    transform: scale(0.98);
}
.search-input .icon {
    font-size: 14px;
    color: var(--color-text-tertiary);
}
.search-input .text {
    flex: 1;
    font-size: 13px;
    color: var(--color-text-tertiary);
}
.search-qr {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    border: 1px solid var(--color-border-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    transition: all var(--duration) var(--ease);
}
.search-qr:active {
    transform: scale(0.92);
}

/* ===== Content ===== */
.content {
    padding: 12px 16px 100px;
}

/* ===== Carousel ===== */
.carousel-wrap {
    border-radius: var(--radius-md);
    overflow: hidden;
    position: relative;
    box-shadow: var(--shadow-sm);
}
.carousel-swiper {
    height: 130px;
}
.carousel-slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 20px 18px;
    color: #fff;
    cursor: pointer;
}
.carousel-inner {
}
.carousel-inner .c-icon {
    font-size: 22px;
    display: block;
    margin-bottom: 4px;
}
.carousel-inner .c-title {
    font-size: 15px;
    font-weight: 700;
    display: block;
}
.carousel-inner .c-desc {
    font-size: 11px;
    opacity: 0.8;
    display: block;
    margin-top: 2px;
}
.carousel-dots {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 5px;
    z-index: 5;
}
.carousel-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: all 0.3s;
}
.carousel-dot.active {
    width: 16px;
    border-radius: 3px;
    background: #fff;
}

/* ===== Section Header ===== */
.section-hdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 20px 0 10px;
}
.section-hdr .title {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text);
}

/* ===== Notice Strip ===== */
.notice-strip {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 14px;
    background: var(--color-warning-soft);
    border-radius: var(--radius-md);
    padding: 10px 14px;
    cursor: pointer;
    border: 1px solid var(--color-warning);
    transition: all var(--duration) var(--ease);
}
.notice-strip .n-icon {
    font-size: 14px;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-sm);
    background: var(--color-primary-soft);
    color: var(--color-warning);
    display: flex;
    align-items: center;
    justify-content: center;
}
.notice-strip .n-wrap {
    flex: 1;
    overflow: hidden;
    height: 16px;
    position: relative;
}
.notice-strip .n-scroll {
    transition: transform 0.4s ease;
}
.notice-strip .n-text {
    font-size: 12px;
    color: var(--color-text);
    line-height: 16px;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.notice-strip .n-arrow {
    font-size: 12px;
    color: var(--color-warning);
    flex-shrink: 0;
}

/* ===== Quick Menu (5-column grid) ===== */
.quick-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px 0;
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: 16px 8px 8px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-border-light);
    transition: all var(--duration) var(--ease);
}
.quick-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    padding: 4px 0;
    transition: transform 0.15s;
}
.quick-item:active {
    transform: scale(0.92);
}
.quick-icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #fff;
    transition: transform 0.2s;
}
.quick-label {
    font-size: 11px;
    color: var(--color-text-secondary);
    font-weight: 500;
}

/* ===== 热门推荐 (horizontal scroll) ===== */
.recommend-scroll {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 4px;
}
.recommend-scroll::-webkit-scrollbar {
    display: none;
}
.recommend-card {
    flex-shrink: 0;
    width: 120px;
    background: var(--color-surface);
    border-radius: var(--radius-md);
    overflow: hidden;
    cursor: pointer;
    border: 1px solid var(--color-border-light);
    transition: all var(--duration) var(--ease);
}
.recommend-card:active {
    transform: scale(0.96);
}
.recommend-thumb {
    height: 75px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    color: #fff;
}
.recommend-thumb .r-icon {
    font-size: 24px;
}
.recommend-thumb .r-tag {
    position: absolute;
    top: 6px;
    left: 6px;
    font-size: 9px;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.24);
    color: #fff;
    font-weight: 600;
}
.recommend-body {
    padding: 10px 10px 12px;
}
.recommend-body .r-title {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
}
.recommend-body .r-desc {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    line-height: 1.5;
    color: var(--color-text-secondary);
}

/* ===== Tools Grid (2x2 cards) ===== */
.tools-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}
.tool-card {
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: 16px 14px 14px;
    border: 1px solid var(--color-border-light);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all var(--duration) var(--ease);
}
.tool-card:active {
    transform: scale(0.97);
}
.tool-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 12px;
    right: 12px;
    height: 3px;
    border-radius: 0 0 3px 3px;
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
}
.tool-card .t-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}
.tool-card .t-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #fff;
    flex-shrink: 0;
}
.tool-card .t-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
}
.tool-card .t-tag {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--color-primary-soft);
    color: var(--color-primary);
    margin-left: auto;
    font-weight: 600;
    border: 1px solid rgba(var(--color-primary-rgb), 0.12);
}
.tool-card .t-desc {
    font-size: 11px;
    color: var(--color-text-secondary);
    display: block;
}
.tool-card .t-bar {
    margin-top: 10px;
    height: 5px;
    border-radius: 3px;
    background: var(--color-surface-soft);
    overflow: hidden;
}
.tool-card .t-bar-in {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
    transition: width 0.6s ease;
}
.tool-card .t-bar-label {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: var(--color-text-tertiary);
    margin-top: 4px;
}

/* ===== Tool Strip (chips) ===== */
.tool-strip {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 4px;
}
.tool-strip::-webkit-scrollbar {
    display: none;
}
.tool-chip {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 999px;
    background: var(--color-surface);
    cursor: pointer;
    font-size: 12px;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-light);
    transition: all var(--duration) var(--ease);
}
.tool-chip:active {
    transform: scale(0.95);
}
.tool-chip .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
}

/* ===== Swiper overrides ===== */
.carousel-swiper ::v-deep .uni-swiper-dots {
    display: none;
}

/* ===== Hover effects (via JS toggled .hover-active class) ===== */
.hero-icon.hover-active {
    background: rgba(255, 255, 255, 0.25);
}
.asset-card.hover-active {
    box-shadow: var(--shadow-md);
}
.search-input.hover-active {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
}
.search-qr.hover-active {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
}
.notice-strip.hover-active {
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
}
.quick-item.hover-active .quick-icon {
    transform: scale(1.1);
}
.recommend-card.hover-active {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: transparent;
}
.tool-card.hover-active {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: transparent;
}
.tool-chip.hover-active {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
    border-color: var(--color-primary);
}
</style>
