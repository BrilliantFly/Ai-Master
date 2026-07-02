<template>
    <view class="plan-schedule-page">
        <view class="page-header">
            <view class="header-left">
                <text class="header-title">日程计划</text>
                <text class="header-sub">高效管理你的每一项安排</text>
            </view>
            <view class="header-actions">
                <view class="premium-header-btn" @tap="goAddSchedule">+</view>
            </view>
        </view>

        <scroll-view scroll-y class="calendar-scroll">
            <CalendarGrid
                :year="currentYear"
                :month="currentMonth"
                :weeks="weeks"
                :current-week-days="currentWeekDays"
                :monthly-stats="monthlyStats"
                :collapsed="collapsed"
                :selected-date="selectedDateLabel"
                :summary-date="selectedDateLabel"
                :event-count="filteredDayEvents.length"
                :quadrant-color="quadrantColor"
                @date-tap="onDateTap"
                @month-switch="onMonthSwitch"
                @toggle-collapse="toggleCollapse"
            />

            <view class="stats-row premium-anim-fade-up premium-anim-delay-1">
                <view class="stat-card accent">
                    <text class="stat-num">{{ todayStats.completedCount }}</text>
                    <text class="stat-label">已完成</text>
                </view>
                <view class="stat-card">
                    <text class="stat-num">{{ todayStats.todoCount }}</text>
                    <text class="stat-label">待处理</text>
                </view>
                <view class="stat-card">
                    <text class="stat-num">{{ todayStats.totalCount }}</text>
                    <text class="stat-label">总任务</text>
                </view>
            </view>

            <view class="module-summary premium-card">
                <view class="summary-item">
                    <text class="summary-label">月完成率</text>
                    <text class="summary-value">{{ monthlyStats.rate }}%</text>
                </view>
                <view class="summary-item">
                    <text class="summary-label">月任务数</text>
                    <text class="summary-value">{{ monthlyStats.total }}</text>
                </view>
                <view class="summary-item">
                    <text class="summary-label">已完成</text>
                    <text class="summary-value">{{ monthlyStats.completed }}</text>
                </view>
            </view>

            <view v-if="selectedDateLabel" class="day-overview premium-card">
                <view class="overview-top">
                    <text class="overview-date">{{ selectedDateLabel }}</text>
                    <text class="overview-count">{{ filteredDayEvents.length }} 项安排</text>
                </view>
                <view class="overview-chips">
                    <text class="overview-chip">完成 {{ todayStats.completedCount }}</text>
                    <text class="overview-chip">待办 {{ todayStats.todoCount }}</text>
                    <text class="overview-chip"
                        >象限 {{ currentQuadrant === 0 ? '全部' : getCurrentQuadrantLabel() }}</text
                    >
                </view>
                <view class="overview-progress" v-if="todayStats.totalCount > 0">
                    <view class="overview-bar">
                        <view class="overview-fill" :style="{ width: dayProgress + '%' }"></view>
                    </view>
                    <text class="overview-rate">{{ dayProgress }}%</text>
                </view>
            </view>

            <EventList
                :selected-date-label="selectedDateLabel"
                :filtered-events="filteredDayEvents"
                :completed-map="completedMap"
                :current-quadrant="currentQuadrant"
                :render-key="renderKey"
                :quadrants="quadrants"
                @check="handleCheckAndRefresh"
                @quadrant-change="filterByQuadrant"
                @go-detail="goToDetail"
                @delete="handleDelete"
            />

            <view style="height: 180rpx"></view>
        </scroll-view>

        <view class="floating-add" @tap="goAddSchedule">+</view>

        <PremiumBottomNav active="plan" />
    </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import PremiumBottomNav from '@/components/PremiumBottomNav.vue'
import CalendarGrid from '@/components/calendar-grid/CalendarGrid.vue'
import EventList from './components/EventList.vue'
import { useSchedule } from './composables/useSchedule'
import { deleteSchedule, getTodayStats } from '@/api/plan/schedule'

const quadrants = [
    { value: 0, label: '全部', color: '#999999' },
    { value: 1, label: '重要紧急', color: '#FF6B6B' },
    { value: 2, label: '重要不紧急', color: '#4ECDC4' },
    { value: 3, label: '紧急不重要', color: '#FFE66D' },
    { value: 4, label: '不紧急不重要', color: '#95A5A6' }
]
const quadrantOptions = ['重要紧急', '重要不紧急', '紧急不重要', '不紧急不重要']

const todayStats = ref({ totalCount: 0, todoCount: 0, completedCount: 0 })
const hasLoaded = ref(false)

const {
    currentYear,
    currentMonth,
    collapsed,
    selectedDateLabel,
    currentQuadrant,
    filteredDayEvents,
    completedMap,
    renderKey,
    weeks,
    currentWeekDays,
    monthlyStats,
    quadrantColor,
    init,
    fetchCalendarMonthly,
    onMonthSwitch,
    onDateTap,
    fetchDayEvents,
    handleCheck,
    toggleCollapse,
    filterByQuadrant
} = useSchedule()

const fetchStats = async () => {
    try {
        const res = await getTodayStats({})
        todayStats.value = res || { totalCount: 0, todoCount: 0, completedCount: 0 }
    } catch (error) {
        console.error('获取统计失败', error)
    }
}

const refreshSelectedDayStats = () => {
    const events = filteredDayEvents.value || []
    const totalCount = events.length
    const completedCount = events.filter(
        (item) => item.status === 1 || completedMap.value[item.id]
    ).length
    todayStats.value = {
        totalCount,
        todoCount: totalCount - completedCount,
        completedCount
    }
}

const refreshCurrentSchedule = async () => {
    await fetchCalendarMonthly()
    if (selectedDateLabel.value) {
        await fetchDayEvents(selectedDateLabel.value)
        refreshSelectedDayStats()
        return
    }
    await fetchStats()
}

const goAddSchedule = () => {
    const query = selectedDateLabel.value ? `?date=${selectedDateLabel.value}` : ''
    uni.navigateTo({ url: `/pages/plan/schedule/form${query}` })
}

const handleCheckAndRefresh = async (item) => {
    await handleCheck(item)
    if (selectedDateLabel.value) {
        await fetchDayEvents(selectedDateLabel.value)
        refreshSelectedDayStats()
        return
    }
    await fetchStats()
}

const handleDelete = async (item) => {
    if (!item?.id) return
    try {
        await deleteSchedule(item.id)
        uni.showToast({ title: '已删除', icon: 'success' })
        await fetchCalendarMonthly()
        if (selectedDateLabel.value) {
            await fetchDayEvents(selectedDateLabel.value)
            refreshSelectedDayStats()
            return
        }
        await fetchStats()
    } catch (error) {
        console.error(error)
    }
}

const goToDetail = (item) => {
    uni.navigateTo({ url: `/pages/plan/schedule/detail?id=${item.id}` })
}

const getCurrentQuadrantLabel = () => {
    return quadrants.find((item) => item.value === currentQuadrant.value)?.label || '全部'
}

const dayProgress = computed(() => {
    if (!todayStats.value.totalCount) return 0
    return Math.round((todayStats.value.completedCount / todayStats.value.totalCount) * 100)
})

onMounted(async () => {
    await init()
    if (selectedDateLabel.value) {
        refreshSelectedDayStats()
    } else {
        await fetchStats()
    }
    hasLoaded.value = true
})

onShow(async () => {
    if (!hasLoaded.value) return
    await refreshCurrentSchedule()
})
</script>

<style scoped lang="scss">
.plan-schedule-page {
    min-height: 100vh;
    background: var(--color-bg-app);
    padding-bottom: 150rpx;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 40rpx 16rpx;
}

.header-left {
    display: flex;
    flex-direction: column;
}

.header-title {
    font-size: 48rpx;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.2;
}

.header-sub {
    margin-top: 8rpx;
    font-size: 26rpx;
    color: var(--color-text-secondary);
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.calendar-scroll {
    padding-bottom: 20rpx;
}

.stats-row {
    display: flex;
    gap: 18rpx;
    padding: 0 32rpx 20rpx;
}

.module-summary {
    display: flex;
    justify-content: space-between;
    gap: 18rpx;
    margin: 0 16px 14px;
    padding: 20rpx 24rpx;
}

.summary-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.summary-label {
    font-size: 22rpx;
    color: var(--color-text-tertiary);
}

.summary-value {
    margin-top: 8rpx;
    font-size: 30rpx;
    font-weight: 700;
    color: var(--color-text);
}

.day-overview {
    margin: 0 16px 14px;
    padding: 22rpx 24rpx;
}

.overview-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20rpx;
}

.overview-date {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--color-text);
}

.overview-count {
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.overview-chips {
    display: flex;
    gap: 12rpx;
    flex-wrap: wrap;
    margin-top: 14rpx;
}

.overview-chip {
    font-size: 22rpx;
    color: var(--color-text-secondary);
    background: var(--color-surface-soft);
    padding: 6rpx 16rpx;
    border-radius: 999rpx;
}

.overview-progress {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-top: 16rpx;
}

.overview-bar {
    flex: 1;
    height: 10rpx;
    border-radius: 999rpx;
    background: var(--color-surface-soft);
    overflow: hidden;
}

.overview-fill {
    height: 100%;
    border-radius: 999rpx;
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
}

.overview-rate {
    font-size: 22rpx;
    font-weight: 600;
    color: var(--color-primary);
}

.stat-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30rpx 10rpx 26rpx;
    border-radius: var(--radius-md);
    background: var(--color-surface-soft);
    border: 2rpx solid transparent;
}

.stat-card.accent {
    background: var(--color-primary-soft);
    border-color: var(--color-primary-mist);
}

.stat-num {
    font-size: 46rpx;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.2;
}

.stat-label {
    margin-top: 8rpx;
    font-size: 23rpx;
    color: var(--color-text-secondary);
}

.floating-add {
    position: fixed;
    right: 40rpx;
    bottom: 122rpx;
    z-index: 50;
    width: 104rpx;
    height: 104rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 64rpx;
    box-shadow: var(--shadow-glow);
}
</style>
