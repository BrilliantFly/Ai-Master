<template>
    <view class="plan-stats-page">
        <view class="page-header">
            <view>
                <text class="page-title">统计洞察</text>
                <text class="page-subtitle">把日程、习惯和月度节奏集中到一个入口里</text>
            </view>
        </view>

        <StatsHero :current-year="currentYear" :current-month="currentMonth" :overview="overview" />

        <StatsTabs :tabs="tabs" :active-tab="activeTab" @change="activeTab = $event" />

        <OverviewTab v-if="activeTab === 'overview'" :overview="overview" @navigate="go($event)" />

        <ScheduleTab
            v-if="activeTab === 'schedule'"
            :schedule-weekly="scheduleWeekly"
            :schedule-trend="scheduleTrend"
            :quadrant-stats="quadrantStats"
        />

        <HabitTab
            v-if="activeTab === 'habit'"
            :best-habit-days="bestHabitDays"
            :habit-trend="habitTrend"
            :habit-ranking="habitRanking"
        />

        <AuditTab
            v-if="activeTab === 'audit'"
            :audit-ranges="auditRanges"
            :audit-range="auditRange"
            :time-audit-summary="timeAuditSummary"
            :audit-quadrant-stats="auditQuadrantStats"
            :audit-trend="auditTrend"
            :audit-top-tasks="auditTopTasks"
            @change-range="auditRange = $event"
        />

        <PremiumBottomNav active="plan" />
    </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'uniapp-router-next'
import PremiumBottomNav from '@/components/PremiumBottomNav.vue'
import StatsHero from './components/StatsHero.vue'
import StatsTabs from './components/StatsTabs.vue'
import OverviewTab from './components/OverviewTab.vue'
import ScheduleTab from './components/ScheduleTab.vue'
import HabitTab from './components/HabitTab.vue'
import AuditTab from './components/AuditTab.vue'
import {
    getTodayStats,
    getCalendarMonthly as getScheduleMonthly,
    getScheduleByDateRange,
    getScheduleByMonth,
    getScheduleList
} from '@/api/plan/schedule'
import { getHabitStats, getCalendarMonthly as getHabitMonthly } from '@/api/plan/habit'
import { getTodayFocusStats } from '@/api/plan/focus'
import { quadrantColor } from '@/components/calendar-grid/calendar-utils.js'
import { getTodayFocusSummary } from '@/utils/focus'

const tabs = [
    { key: 'overview', label: '概览' },
    { key: 'schedule', label: '日程' },
    { key: 'habit', label: '习惯' },
    { key: 'audit', label: '时间审计' }
]

const auditRanges = [
    { key: 'week', label: '本周' },
    { key: 'month', label: '本月' },
    { key: 'year', label: '本年' }
]

const activeTab = ref('overview')
const auditRange = ref('week')
const router = useRouter()
const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)

const todayStats = ref({ totalCount: 0, todoCount: 0, completedCount: 0 })
const habitStats = ref({ activeCount: 0, completedCount: 0, totalCheckins: 0 })
const scheduleMonthly = ref({ total: 0, completed: 0, rate: 0 })
const habitMonthly = ref({ total: 0, completed: 0, rate: 0 })
const weekEvents = ref([])
const monthEvents = ref([])
const yearEvents = ref([])
const habitList = ref([])
const focusSummary = ref({
    completedFocusCount: 0,
    completedBreakCount: 0,
    currentStreak: 0,
    totalFocusMinutes: 0,
    sessionHistory: [],
    hasTodayData: false
})

const overview = computed(() => ({
    todayCompleted: todayStats.value.completedCount || 0,
    totalCheckins: habitStats.value.totalCheckins || 0,
    focusCount: focusSummary.value.completedFocusCount || 0,
    focusMinutes: focusSummary.value.totalFocusMinutes || 0,
    scheduleRate: scheduleMonthly.value.rate || 0,
    habitRate: habitMonthly.value.rate || 0,
    scheduleTotal: scheduleMonthly.value.total || 0,
    scheduleDone: scheduleMonthly.value.completed || 0,
    habitDays: habitMonthly.value.completed || 0,
    activeHabits: habitStats.value.activeCount || 0,
    focusStreak: focusSummary.value.currentStreak || 0
}))

const scheduleWeekly = computed(() => {
    const total = weekEvents.value.length
    const completed = weekEvents.value.filter((item) => item.status === 1).length
    return {
        total,
        completed,
        todo: total - completed
    }
})

const scheduleTrend = computed(() => {
    const counts = Array.from({ length: 7 }, (_, index) => ({
        label: ['日', '一', '二', '三', '四', '五', '六'][index],
        count: 0
    }))

    weekEvents.value.forEach((item) => {
        if (!item.startTime) return
        const weekDay = new Date(item.startTime).getDay()
        counts[weekDay].count += 1
    })

    const maxCount = Math.max(...counts.map((item) => item.count), 1)
    return counts.map((item) => ({
        ...item,
        height: item.count === 0 ? 12 : Math.max(24, Math.round((item.count / maxCount) * 120))
    }))
})

const quadrantStats = computed(() => {
    const source = [
        { key: 1, label: '重要紧急', color: quadrantColor(1), count: 0 },
        { key: 2, label: '重要不紧急', color: quadrantColor(2), count: 0 },
        { key: 3, label: '紧急不重要', color: quadrantColor(3), count: 0 },
        { key: 4, label: '不紧急不重要', color: quadrantColor(4), count: 0 }
    ]

    weekEvents.value.forEach((item) => {
        const target = source.find((row) => row.key === item.quadrant)
        if (target) target.count += 1
    })

    const maxCount = Math.max(...source.map((item) => item.count), 1)
    return source.map((item) => ({
        ...item,
        width: item.count === 0 ? 0 : Math.max(12, Math.round((item.count / maxCount) * 100))
    }))
})

const bestHabitDays = computed(() => {
    return habitRanking.value[0]?.currentDays || 0
})

const habitRanking = computed(() => {
    return [...habitList.value].sort((a, b) => (b.currentDays || 0) - (a.currentDays || 0))
})

const habitTrend = computed(() => {
    const counts = Array.from({ length: habitMonthly.value.total || 0 }, (_, index) => ({
        label: `${index + 1}`,
        count: 0
    }))

    habitList.value.forEach((habit) => {
        ;(habit.checkinDays || []).forEach((day) => {
            if (counts[day - 1]) {
                counts[day - 1].count += 1
            }
        })
    })

    const maxCount = Math.max(...counts.map((item) => item.count), 1)
    return counts.map((item) => ({
        ...item,
        height: item.count === 0 ? 12 : Math.max(24, Math.round((item.count / maxCount) * 120))
    }))
})

const auditEvents = computed(() => {
    if (auditRange.value === 'week') return weekEvents.value
    if (auditRange.value === 'month') return monthEvents.value
    return yearEvents.value
})

const calculateDurationHours = (item) => {
    if (!item?.startTime || !item?.endTime || item.endTime <= item.startTime) return 1
    const diffHours = (item.endTime - item.startTime) / (1000 * 60 * 60)
    return Number(diffHours.toFixed(1))
}

const auditQuadrantStats = computed(() => {
    const source = [
        { key: 1, label: '重要紧急', color: quadrantColor(1), hours: 0 },
        { key: 2, label: '重要不紧急', color: quadrantColor(2), hours: 0 },
        { key: 3, label: '紧急不重要', color: quadrantColor(3), hours: 0 },
        { key: 4, label: '不紧急不重要', color: quadrantColor(4), hours: 0 }
    ]

    auditEvents.value.forEach((item) => {
        const target = source.find((row) => row.key === item.quadrant)
        if (!target) return
        target.hours = Number((target.hours + calculateDurationHours(item)).toFixed(1))
    })

    const totalHours = source.reduce((sum, item) => sum + item.hours, 0)
    return source.map((item) => ({
        ...item,
        percent: totalHours > 0 ? Math.round((item.hours / totalHours) * 100) : 0
    }))
})

const timeAuditSummary = computed(() => {
    const totalHours = auditQuadrantStats.value.reduce((sum, item) => sum + item.hours, 0)
    const segments = auditQuadrantStats.value
        .filter((item) => item.percent > 0)
        .map((item, index, arr) => {
            const previous = arr.slice(0, index).reduce((sum, row) => sum + row.percent, 0)
            const current = previous + item.percent
            return `${item.color} ${previous}% ${current}%`
        })

    return {
        totalHours: Number(totalHours.toFixed(1)),
        gradient: segments.length
            ? `conic-gradient(${segments.join(', ')})`
            : 'conic-gradient(#e5e7eb 0% 100%)'
    }
})

const auditTrend = computed(() => {
    const bucket = new Map()
    auditEvents.value.forEach((item) => {
        if (!item.startTime) return
        const date = new Date(item.startTime)
        const label =
            auditRange.value === 'week'
                ? ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
                : auditRange.value === 'month'
                ? `${date.getMonth() + 1}/${date.getDate()}`
                : `${date.getMonth() + 1}月`
        const prev = bucket.get(label) || 0
        bucket.set(label, Number((prev + calculateDurationHours(item)).toFixed(1)))
    })

    const rows = Array.from(bucket.entries()).map(([label, hours]) => ({ label, hours }))
    const maxHours = Math.max(...rows.map((item) => item.hours), 1)
    return rows.map((item) => ({
        ...item,
        height: item.hours === 0 ? 12 : Math.max(24, Math.round((item.hours / maxHours) * 120))
    }))
})

const auditTopTasks = computed(() => {
    return [...auditEvents.value]
        .map((item) => {
            const date = item.startTime ? new Date(item.startTime) : null
            return {
                ...item,
                hours: calculateDurationHours(item),
                dateLabel: date
                    ? `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(
                          2,
                          '0'
                      )}:${String(date.getMinutes()).padStart(2, '0')}`
                    : '未设置时间'
            }
        })
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5)
})

const getWeekRange = () => {
    const base = new Date()
    const day = base.getDay()
    const start = new Date(base)
    start.setHours(0, 0, 0, 0)
    start.setDate(base.getDate() - day)
    const end = new Date(start)
    end.setDate(start.getDate() + 7)
    end.setMilliseconds(-1)
    return {
        weekStart: start.getTime(),
        weekEnd: end.getTime()
    }
}

const loadTodayStats = async () => {
    const res = await getTodayStats({})
    todayStats.value = res || { totalCount: 0, todoCount: 0, completedCount: 0 }
}

const loadHabitStats = async () => {
    const res = await getHabitStats({})
    habitStats.value = res || { activeCount: 0, completedCount: 0, totalCheckins: 0 }
}

const loadScheduleMonthly = async () => {
    const res = await getScheduleMonthly({ year: currentYear.value, month: currentMonth.value })
    const events = res?.events || []
    monthEvents.value = events
    const total = events.length
    const completed = events.filter((item) => item.status === 1).length
    scheduleMonthly.value = {
        total,
        completed,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
}

const loadHabitMonthly = async () => {
    const res = await getHabitMonthly({ year: currentYear.value, month: currentMonth.value })
    const habitsMap = res?.habits || {}
    const marks = new Set()
    habitList.value = Object.values(habitsMap)
    habitList.value.forEach((habit) => {
        ;(habit?.checkinDays || []).forEach((day) => marks.add(day))
    })
    const total = new Date(currentYear.value, currentMonth.value, 0).getDate()
    const completed = marks.size
    habitMonthly.value = {
        total,
        completed,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
}

const loadWeekEvents = async () => {
    const res = await getScheduleByDateRange(getWeekRange())
    weekEvents.value = Array.isArray(res) ? res : []
}

const loadMonthEvents = async () => {
    const res = await getScheduleByMonth({ year: currentYear.value, month: currentMonth.value })
    monthEvents.value = Array.isArray(res) ? res : []
}

const loadYearEvents = async () => {
    const res = await getScheduleList({})
    const allEvents = Array.isArray(res) ? res : []
    yearEvents.value = allEvents.filter((item) => {
        if (!item?.startTime) return false
        return new Date(item.startTime).getFullYear() === currentYear.value
    })
}

const loadFocusSummary = () => {
    focusSummary.value = getTodayFocusSummary()
}

const loadFocusSummaryWithFallback = async () => {
    try {
        const stats = await getTodayFocusStats()
        const focusCount = Number(stats?.focusCount || 0)
        focusSummary.value = {
            completedFocusCount: focusCount,
            completedBreakCount: Number((stats?.breakCount || 0) + (stats?.longBreakCount || 0)),
            currentStreak: focusCount,
            totalFocusMinutes: Number(stats?.focusMinutes || 0),
            sessionHistory: Array.isArray(stats?.sessions) ? stats.sessions : [],
            hasTodayData: focusCount > 0
        }
    } catch (error) {
        console.error('加载后端专注统计失败，改用本地缓存', error)
        loadFocusSummary()
    }
}

const go = (url) => {
    router.navigateTo(url)
}

onMounted(async () => {
    try {
        await Promise.all([
            loadTodayStats(),
            loadHabitStats(),
            loadScheduleMonthly(),
            loadHabitMonthly(),
            loadWeekEvents(),
            loadMonthEvents(),
            loadYearEvents()
        ])
        await loadFocusSummaryWithFallback()
    } catch (error) {
        console.error('加载统计页数据失败', error)
    }
})
</script>

<style scoped lang="scss">
.plan-stats-page {
    min-height: 100vh;
    background: var(--color-bg-app);
    padding: 24rpx 16px 160rpx;
}

.page-header {
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

.schedule-grid {
    margin-top: 0;
    margin-bottom: 18rpx;
}

.hero-stat,
.summary-item,
.shortcut-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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
.summary-label,
.shortcut-desc {
    margin-top: 8rpx;
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.ring-summary {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18rpx;
    margin-top: 22rpx;
}

.ring-card {
    background: var(--color-surface-soft);
    border-radius: 20rpx;
    padding: 18rpx 18rpx 16rpx;
}

.ring-label {
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.ring-shell {
    margin-top: 14rpx;
    height: 14rpx;
    border-radius: 999rpx;
    background: rgba(var(--color-primary-rgb), 0.14);
    overflow: hidden;
}

.ring-shell.green {
    background: rgba(82, 196, 26, 0.14);
}

.ring-fill {
    height: 100%;
    border-radius: 999rpx;
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
}

.ring-fill.green {
    background: linear-gradient(135deg, var(--color-success), #34d399);
}

.ring-value {
    display: block;
    margin-top: 10rpx;
    font-size: 28rpx;
    font-weight: 700;
    color: var(--color-text);
}

.chart-block,
.quadrant-card,
.habit-rank-card {
    margin-top: 18rpx;
    padding: 20rpx;
    border-radius: 20rpx;
    background: var(--color-surface-soft);
}

.bar-scroll {
    width: 100%;
}

.bar-chart {
    display: flex;
    align-items: flex-end;
    gap: 18rpx;
    margin-top: 18rpx;
}

.bar-chart.long {
    min-width: 760rpx;
}

.bar-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
}

.bar-column.slim {
    width: 42rpx;
    flex: none;
}

.bar-value,
.bar-label {
    font-size: 20rpx;
    color: var(--color-text-tertiary);
}

.bar-track {
    width: 100%;
    height: 132rpx;
    display: flex;
    align-items: flex-end;
}

.bar-fill {
    width: 100%;
    min-height: 12rpx;
    border-radius: 999rpx 999rpx 10rpx 10rpx;
    background: linear-gradient(180deg, var(--color-primary), #8980f0);
}

.bar-fill.green {
    background: linear-gradient(180deg, var(--color-success), #34d399);
}

.bar-fill.orange {
    background: linear-gradient(180deg, #f59e0b, #f97316);
}

.range-row {
    display: flex;
    gap: 14rpx;
    margin-top: 18rpx;
}

.range-pill {
    min-width: 120rpx;
    height: 64rpx;
    padding: 0 20rpx;
    border-radius: 999rpx;
    background: var(--color-surface-soft);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22rpx;
    font-weight: 600;
}

.range-pill.active {
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
    color: #fff;
}

.audit-pie-card {
    margin-top: 18rpx;
    padding: 20rpx;
    border-radius: 20rpx;
    background: var(--color-surface-soft);
}

.audit-pie-shell {
    display: flex;
    justify-content: center;
    margin-top: 18rpx;
}

.audit-pie-circle {
    position: relative;
    width: 260rpx;
    height: 260rpx;
    border-radius: 50%;
    overflow: hidden;
}

.audit-pie-mask {
    position: absolute;
    inset: 0;
    border-radius: 50%;
}

.audit-pie-center {
    position: absolute;
    inset: 32rpx;
    border-radius: 50%;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.audit-pie-total {
    font-size: 40rpx;
    font-weight: 800;
    color: var(--color-text);
}

.audit-pie-label {
    margin-top: 8rpx;
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.audit-legend {
    margin-top: 20rpx;
}

.audit-legend-item + .audit-legend-item {
    margin-top: 12rpx;
}

.audit-legend-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16rpx;
}

.audit-legend-copy {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.audit-legend-value {
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.quadrant-list,
.habit-rank-list {
    margin-top: 18rpx;
}

.quadrant-item + .quadrant-item,
.habit-rank-item + .habit-rank-item {
    margin-top: 16rpx;
}

.quadrant-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16rpx;
}

.quadrant-copy {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.quadrant-dot {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
}

.quadrant-label,
.quadrant-count,
.habit-rank-name,
.habit-rank-days {
    font-size: 24rpx;
    color: var(--color-text);
}

.quadrant-track {
    margin-top: 10rpx;
    height: 12rpx;
    border-radius: 999rpx;
    background: rgba(15, 23, 42, 0.06);
    overflow: hidden;
}

.quadrant-fill {
    height: 100%;
    border-radius: 999rpx;
}

.habit-rank-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.habit-rank-index {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: var(--color-primary-soft);
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22rpx;
    font-weight: 700;
    flex-shrink: 0;
}

.habit-rank-copy {
    flex: 1;
    min-width: 0;
}

.habit-rank-desc {
    display: block;
    margin-top: 6rpx;
    font-size: 20rpx;
    color: var(--color-text-secondary);
}

@media (max-width: 760px) {
    .hero-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>
