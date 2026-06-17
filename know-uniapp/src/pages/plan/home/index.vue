<template>
    <view class="plan-home-page">
        <view class="page-header">
            <view>
                <text class="page-title">计划总览</text>
                <text class="page-subtitle">把日程、习惯和本月节奏放在一个视图里</text>
            </view>
        </view>

        <view class="hero-card premium-card">
            <view class="hero-top">
                <text class="hero-month">{{ currentYear }} 年 {{ currentMonth }} 月</text>
                <text class="hero-badge">计划模块</text>
            </view>
            <view class="hero-grid">
                <view class="hero-stat">
                    <text class="hero-value">{{ scheduleStats.completedCount }}</text>
                    <text class="hero-label">今日完成</text>
                </view>
                <view class="hero-stat">
                    <text class="hero-value">{{ scheduleStats.todoCount }}</text>
                    <text class="hero-label">今日待办</text>
                </view>
                <view class="hero-stat">
                    <text class="hero-value">{{ habitStats.totalCheckins }}</text>
                    <text class="hero-label">累计打卡</text>
                </view>
            </view>
        </view>

        <view class="section-card premium-card">
            <view class="section-head">
                <text class="section-title">快捷入口</text>
            </view>
            <view class="quick-grid">
                <view class="quick-item" @tap="go('/pages/plan/schedule/index')">
                    <view class="quick-icon quick-icon-orange">📅</view>
                    <text class="quick-name">日程计划</text>
                    <text class="quick-desc">查看月历和任务安排</text>
                </view>
                <view class="quick-item" @tap="go('/pages/plan/habit/index')">
                    <view class="quick-icon quick-icon-green">🎯</view>
                    <text class="quick-name">习惯打卡</text>
                    <text class="quick-desc">连续打卡与习惯维护</text>
                </view>
                <view class="quick-item quick-item-wide" @tap="go('/pages/plan/stats/index')">
                    <view class="quick-icon quick-icon-blue">📊</view>
                    <text class="quick-name">统计洞察</text>
                    <text class="quick-desc">集中查看计划模块的统计分析</text>
                </view>
                <view class="quick-item quick-item-wide" @tap="go('/pages/plan/focus/index')">
                    <view class="quick-icon quick-icon-red">🍅</view>
                    <text class="quick-name">番茄专注</text>
                    <text class="quick-desc">开始一轮 25 分钟专注与节奏化休息</text>
                </view>
            </view>
        </view>

        <view class="section-card premium-card">
            <view class="section-head">
                <text class="section-title">今日提醒</text>
            </view>
            <view v-if="todayHighlights.length" class="highlight-list">
                <view
                    v-for="item in todayHighlights"
                    :key="item.id"
                    class="highlight-item"
                    @tap="go(`/pages/plan/schedule/detail?id=${item.id}`)"
                >
                    <view
                        class="highlight-dot"
                        :style="{ background: quadrantColor(item.quadrant) }"
                    ></view>
                    <view class="highlight-content">
                        <text class="highlight-title">{{ item.title }}</text>
                        <text class="highlight-time"
                            >{{ formatTime(item.startTime) }} - {{ formatTime(item.endTime) }}</text
                        >
                    </view>
                    <text class="highlight-tag">{{ item.status === 1 ? '已完成' : '待处理' }}</text>
                </view>
            </view>
            <view v-else class="empty-tip">今天还没有日程安排</view>
        </view>

        <view class="section-card premium-card">
            <view class="section-head">
                <text class="section-title">今日专注</text>
                <text class="hero-badge">{{ focusSummary.completedFocusCount }} 个番茄</text>
            </view>
            <view class="focus-summary">
                <view class="focus-chip">
                    <text class="focus-chip-label">专注分钟</text>
                    <text class="focus-chip-value">{{ focusSummary.totalFocusMinutes }}</text>
                </view>
                <view class="focus-chip">
                    <text class="focus-chip-label">连续轮次</text>
                    <text class="focus-chip-value">{{ focusSummary.currentStreak }}</text>
                </view>
                <view class="focus-action" @tap="go('/pages/plan/focus/index')">
                    <text class="focus-action-title">继续专注</text>
                    <text class="focus-action-desc">打开番茄专注页</text>
                </view>
            </view>
        </view>

        <PremiumBottomNav active="plan" />
    </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'uniapp-router-next'
import PremiumBottomNav from '@/components/PremiumBottomNav.vue'
import { getTodayStats, getScheduleByDate } from '@/api/plan/schedule'
import { getHabitStats } from '@/api/plan/habit'
import { quadrantColor } from '@/components/calendar-grid/calendar-utils.js'
import { getTodayFocusStats } from '@/api/plan/focus'
import { getTodayFocusSummary } from '@/utils/focus'

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

const todayTs = computed(() => {
    return new Date(currentYear.value, currentMonth.value - 1, now.getDate()).getTime()
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
    router.navigateTo(url)
}

onMounted(async () => {
    await Promise.all([loadTodaySchedule(), loadScheduleStats(), loadHabitStats()])
    await loadFocusSummaryWithFallback()
})
</script>

<style scoped lang="scss">
.plan-home-page {
    min-height: 100vh;
    background: var(--color-bg-app);
    padding: 24rpx 16px 160rpx;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20rpx;
    padding: 0 8rpx 18rpx;
}

.page-title {
    display: block;
    font-size: 48rpx;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.2;
}

.page-subtitle {
    display: block;
    margin-top: 8rpx;
    font-size: 26rpx;
    color: var(--color-text-secondary);
}

.hero-card,
.section-card {
    margin-bottom: 16px;
    padding: 24rpx 24rpx 22rpx;
}

.hero-top,
.section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.hero-month,
.section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: var(--color-text);
}

.hero-badge {
    font-size: 20rpx;
    color: var(--color-primary);
    background: var(--color-primary-soft);
    padding: 4rpx 14rpx;
    border-radius: 999rpx;
}

.hero-grid,
.summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;
    margin-top: 20rpx;
}

.summary-grid {
    grid-template-columns: repeat(2, 1fr);
}

.hero-stat,
.summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-soft);
    border-radius: 18rpx;
    padding: 20rpx 10rpx;
}

.hero-value,
.summary-value {
    font-size: 34rpx;
    font-weight: 700;
    color: var(--color-text);
}

.hero-label,
.summary-label {
    margin-top: 8rpx;
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.quick-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18rpx;
    margin-top: 20rpx;
}

.quick-item {
    background: var(--color-surface-soft);
    border-radius: 20rpx;
    padding: 22rpx;
}

.quick-item-wide {
    grid-column: span 2;
}

.quick-icon {
    width: 76rpx;
    height: 76rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34rpx;
}

.quick-icon-orange {
    background: linear-gradient(135deg, #f0a020, #fbbf24);
}

.quick-icon-green {
    background: linear-gradient(135deg, #22b573, #34d399);
}

.quick-icon-blue {
    background: linear-gradient(135deg, #4f8cff, #6aa8ff);
}

.quick-icon-red {
    background: linear-gradient(135deg, #f97316, #ef4444);
}

.quick-name {
    display: block;
    margin-top: 14rpx;
    font-size: 28rpx;
    font-weight: 600;
    color: var(--color-text);
}

.quick-desc {
    display: block;
    margin-top: 8rpx;
    font-size: 22rpx;
    line-height: 1.6;
    color: var(--color-text-secondary);
}

.highlight-list {
    margin-top: 18rpx;
}

.highlight-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 16rpx 0;
    border-bottom: 1rpx solid var(--color-border-light);
}

.highlight-item:last-child {
    border-bottom: none;
}

.highlight-dot {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    flex-shrink: 0;
}

.highlight-content {
    flex: 1;
    min-width: 0;
}

.highlight-title {
    display: block;
    font-size: 26rpx;
    font-weight: 600;
    color: var(--color-text);
}

.highlight-time {
    display: block;
    margin-top: 6rpx;
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.highlight-tag {
    font-size: 20rpx;
    color: var(--color-text-tertiary);
}

.empty-tip {
    margin-top: 18rpx;
    font-size: 24rpx;
    color: var(--color-text-secondary);
}

.focus-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;
    margin-top: 18rpx;
}

.focus-chip,
.focus-action {
    background: var(--color-surface-soft);
    border-radius: 18rpx;
    padding: 20rpx 16rpx;
}

.focus-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.focus-chip-label,
.focus-action-desc {
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.focus-chip-value {
    margin-top: 8rpx;
    font-size: 34rpx;
    font-weight: 700;
    color: var(--color-text);
}

.focus-action {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.focus-action-title {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--color-text);
}
</style>
