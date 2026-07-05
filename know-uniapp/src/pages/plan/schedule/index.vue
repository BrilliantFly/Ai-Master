<template>
    <view class="plan-schedule-page">
        <view class="page-header">
            <view class="header-left">
                <text class="header-title">日程计划</text>
                <text class="header-sub">高效管理你的每一项安排</text>
            </view>
            <view class="header-actions">
                <view class="premium-header-btn" @tap="toggleMatrix" title="矩阵">⊞</view>
                <view class="premium-header-btn" @tap="showPinSettings" title="加锁">🔒</view>
                <view class="premium-header-btn" :class="{ active: batchMode }" @tap="toggleBatchMode" title="批量操作">☰</view>
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

            <view class="stats-row premium-fade-in premium-d1">
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

            <view v-show="batchMode" class="batch-bar">
                <text class="batch-bar-text">批量操作模式</text>
                <button class="batch-bar-btn" @tap="exitBatchMode">退出</button>
            </view>

            <view
                v-if="selectedDateLabel && filteredDayEvents.length > 0"
                class="day-overview premium-card premium-fade-in premium-d2"
            >
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
                @edit="handleEdit"
                @delete="handleDelete"
            />

            <view style="height: 180rpx"></view>
        </scroll-view>

        <view class="floating-add" @tap="goAddSchedule">+</view>

        <PremiumBottomNav active="plan" />

        <!-- Matrix Modal -->
        <view v-if="matrixVisible" class="matrix-overlay" @tap="toggleMatrix">
            <view class="matrix-modal premium-card premium-fade-in" @tap.stop>
                <view class="matrix-header">
                    <text class="matrix-title"
                        >艾森豪威尔 <text class="matrix-title-accent">矩阵</text></text
                    >
                    <text class="matrix-sub">将任务分类到四个象限，明确优先级</text>
                    <button class="matrix-close" type="button" @tap="toggleMatrix">✕</button>
                </view>
                <view class="matrix-grid">
                    <view
                        v-for="q in quadrantMatrix"
                        :key="q.value"
                        class="matrix-cell"
                        :style="{ borderTopColor: q.color }"
                    >
                        <text class="matrix-cell-title">{{ q.label }}</text>
                        <text class="matrix-cell-count">{{ q.count }} 项</text>
                        <view
                            v-for="evt in q.events"
                            :key="evt.id"
                            class="matrix-event"
                            @tap="goToDetail(evt)"
                        >
                            <text class="matrix-event-time">{{ formatEventTime(evt) }}</text>
                            <text class="matrix-event-title">{{ evt.title }}</text>
                        </view>
                        <view v-if="q.count === 0" class="matrix-empty">暂无任务</view>
                    </view>
                </view>
            </view>
        </view>

        <!-- Toggle Zone (hidden) -->
        <view style="display: none">
            <view class="toggle-zone">
                <text>🍅 番茄钟</text>
                <text>📊 时间追踪</text>
                <text>📅 倒数日</text>
            </view>
        </view>

        <!-- Detail Sheet Overlay -->
        <view v-if="detailVisible" class="detail-overlay" @tap="closeDetail">
            <view class="detail-sheet premium-fade-in" @tap.stop>
                <view class="modal-handle"></view>
                <view class="detail-hero">
                    <view
                        class="detail-quadrant-bar"
                        :style="{ background: quadrantColor(detailItem?.quadrant) }"
                    ></view>
                    <text class="detail-title">{{ detailItem?.title || '' }}</text>
                    <text v-if="detailItem?.categoryName" class="detail-tag">{{
                        detailItem.categoryName
                    }}</text>
                </view>
                <view class="detail-body">
                    <view v-if="detailItem?.startTime || detailItem?.endTime" class="detail-row">
                        <text class="detail-row-icon">🕐</text>
                        <text class="detail-row-text">{{ formatDetailTime(detailItem) }}</text>
                    </view>
                    <view v-if="detailItem?.quadrant" class="detail-row">
                        <text class="detail-row-icon">🎯</text>
                        <text class="detail-row-text">{{
                            getQuadrantLabel(detailItem.quadrant)
                        }}</text>
                    </view>
                    <view v-if="detailItem?.location" class="detail-row">
                        <text class="detail-row-icon">📍</text>
                        <text class="detail-row-text">{{ detailItem.location }}</text>
                    </view>
                    <view v-if="hasRelevantMeta(detailItem)" class="detail-meta-row">
                        <text
                            v-if="priorityMeta(detailItem).visible"
                            class="detail-meta-chip"
                            :class="priorityMeta(detailItem).className"
                        >
                            {{ priorityMeta(detailItem).label }}
                        </text>
                        <text v-if="detailItem?.duration" class="detail-meta-chip"
                            >⏱ {{ detailItem.duration }}分钟</text
                        >
                        <text
                            v-if="detailItem?.remind && detailItem.remind.length"
                            class="detail-meta-chip"
                            >🔔
                            {{
                                detailItem.remind.length > 1
                                    ? detailItem.remind.length + '次提醒'
                                    : '1次提醒'
                            }}</text
                        >
                        <text v-for="t in detailItem?.tags || []" :key="t" class="detail-meta-chip"
                            ># {{ t }}</text
                        >
                    </view>
                    <view
                        v-if="detailItem?.subtasks && detailItem.subtasks.length"
                        class="detail-subtasks"
                    >
                        <text class="detail-subtask-title">📋 子任务</text>
                        <view
                            v-for="(st, idx) in detailItem.subtasks"
                            :key="idx"
                            class="detail-subtask-item"
                            :class="{ done: st.done }"
                        >
                            <text>{{ st.done ? '●' : '○' }} {{ st.text || st }}</text>
                        </view>
                    </view>
                    <text v-if="detailItem?.description" class="detail-desc">{{
                        detailItem.description
                    }}</text>
                    <view
                        v-if="detailItem?.progress !== undefined && detailItem.progress !== null"
                        class="detail-progress"
                    >
                        <view class="detail-progress-bar">
                            <view
                                class="detail-progress-fill"
                                :style="{ width: detailItem.progress + '%' }"
                            ></view>
                        </view>
                        <text class="detail-progress-label">{{ detailItem.progress }}%</text>
                    </view>
                </view>
                <view class="detail-actions">
                    <view
                        class="detail-action-btn"
                        :class="{ primary: !completedMap[detailItem?.id] }"
                        @tap="toggleCompleteFromDetail"
                    >
                        <text>{{ completedMap[detailItem?.id] ? '↩ 取消完成' : '✅ 完成' }}</text>
                    </view>
                    <view class="detail-action-btn secondary" @tap="editFromDetail">
                        <text>✏️ 编辑</text>
                    </view>
                    <view class="detail-action-btn danger" @tap="deleteFromDetail">
                        <text>🗑 删除</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- Form Sheet Overlay -->
        <ScheduleFormSheet
            :visible="showForm"
            :edit-data="editingSchedule"
            :selected-date="selectedDateLabel"
            @close="
                showForm = false;
                editingSchedule = null
            "
            @saved="onFormSaved"
        />
    </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import PremiumBottomNav from '@/components/PremiumBottomNav.vue'
import CalendarGrid from '@/components/calendar-grid/CalendarGrid.vue'
import EventList from './components/EventList.vue'
import ScheduleFormSheet from './components/ScheduleFormSheet.vue'
import { useSchedule } from './composables/useSchedule'
import { deleteSchedule, getTodayStats } from '@/api/plan/schedule'
import { useHoverEffect } from '@/hooks/useHoverEffect'

useHoverEffect('.stat-card,.detail-action-btn')

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

const matrixVisible = ref(false)
const showForm = ref(false)
const editingSchedule = ref(null)
const batchMode = ref(false)

const detailVisible = ref(false)
const detailItem = ref(null)

const toggleMatrix = () => {
    matrixVisible.value = !matrixVisible.value
}
const showPinSettings = () => {
    uni.showToast({ title: '锁屏设置', icon: 'none' })
}
const toggleBatchMode = () => {
    batchMode.value = !batchMode.value
}
const exitBatchMode = () => {
    batchMode.value = false
}

const showDetail = (item) => {
    detailItem.value = item
    detailVisible.value = true
}
const closeDetail = () => {
    detailVisible.value = false
    detailItem.value = null
}
const formatDetailTime = (item) => {
    if (!item?.startTime) return '--:--'
    const st = formatEventTime(item)
    if (!item?.endTime) return st
    return st + ' — ' + formatEventTime({ startTime: item.endTime })
}
const hasRelevantMeta = (item) => {
    if (!item) return false
    return (
        priorityMeta(item).visible ||
        !!item.duration ||
        !!item.remind?.length ||
        !!item.tags?.length
    )
}
const priorityMeta = (item) => {
    const priority = item?.priority
    if (!priority || Number(priority) === 2 || priority === 'medium') {
        return { visible: false, label: '', className: '' }
    }
    if (Number(priority) === 3 || priority === 'high' || priority === 'p0') {
        return { visible: true, label: '🔴 高', className: 'priority-high' }
    }
    return { visible: true, label: '🟢 低', className: 'priority-low' }
}
const getQuadrantLabel = (q) => {
    return quadrants.find((item) => item.value === q)?.label || ''
}
const toggleCompleteFromDetail = async () => {
    if (!detailItem.value) return
    await handleCheckAndRefresh(detailItem.value)
    closeDetail()
}
const editFromDetail = () => {
    if (!detailItem.value) return
    const item = detailItem.value
    closeDetail()
    handleEdit(item)
}
const deleteFromDetail = async () => {
    if (!detailItem.value) return
    const item = detailItem.value
    closeDetail()
    await handleDelete(item)
}

const quadrantMatrix = computed(() => {
    return quadrants
        .filter((q) => q.value > 0)
        .map((q) => {
            const events = (filteredDayEvents.value || []).filter((e) => e.quadrant === q.value)
            return { ...q, events, count: events.length }
        })
})

const formatEventTime = (evt) => {
    if (!evt.startTime) return '--:--'
    const d = new Date(evt.startTime)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

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
    editingSchedule.value = null
    showForm.value = true
}

const onFormSaved = async () => {
    showForm.value = false
    editingSchedule.value = null
    await refreshCurrentSchedule()
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

const handleEdit = (item) => {
    editingSchedule.value = item
    showForm.value = true
}

const goToDetail = (item) => {
    showDetail(item)
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

.stat-card {
    flex: 1;
    border-radius: 24rpx;
    padding: 20rpx;
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.06));
    box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.04));
    text-align: center;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
}
.stat-card.hover-active {
    background: var(--color-surface-soft);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
}
.stat-card:active {
    transform: scale(0.96);
}

.stat-card.accent {
    background: var(--color-primary-soft);
    border-color: var(--color-primary-mist);
}

.stat-num {
    font-size: 40rpx;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.2;
}

.stat-label {
    font-size: 24rpx;
    color: var(--color-text-secondary);
    margin-top: 8rpx;
}

.batch-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 32rpx;
    margin: 0 32rpx 20rpx;
    background: var(--color-primary-soft);
    border-radius: 24rpx;
}

.batch-bar-text {
    font-size: 26rpx;
    font-weight: 600;
    color: var(--color-primary);
}

.batch-bar-btn {
    padding: 8rpx 24rpx;
    border-radius: 999rpx;
    background: var(--color-primary);
    color: #fff;
    font-size: 24rpx;
    border: none;
}

.module-summary {
    display: flex;
    justify-content: space-between;
    gap: 18rpx;
    margin: 0 32rpx 20rpx;
    padding: 24rpx;
    border-radius: 24rpx;
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.06));
    box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.04));
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
    color: var(--color-text-secondary);
}

.summary-value {
    margin-top: 8rpx;
    font-size: 34rpx;
    font-weight: 600;
    color: var(--color-text);
}

.day-overview {
    margin: 0 32rpx 20rpx;
    padding: 24rpx;
    border-radius: 24rpx;
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.06));
    box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.04));
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
    height: 6rpx;
    border-radius: 999rpx;
    background: var(--color-surface-soft);
    overflow: hidden;
}

.overview-fill {
    height: 100%;
    border-radius: 999rpx;
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-mist, #8980f0));
}

.overview-rate {
    font-size: 22rpx;
    font-weight: 600;
    color: var(--color-primary);
}

.floating-add {
    position: fixed;
    right: 40rpx;
    bottom: 122rpx;
    z-index: 50;
    width: 104rpx;
    height: 104rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary, #ff8700), var(--color-primary-mist, #8980f0));
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 64rpx;
    box-shadow: var(--shadow-glow, 0 8rpx 32rpx rgba(255, 135, 0, 0.2));
}

/* Matrix Modal */
.matrix-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 400;
    display: flex;
    align-items: center;
    justify-content: center;
}

.matrix-modal {
    width: 92%;
    max-width: 750rpx;
    max-height: 88vh;
    overflow-y: auto;
    padding: 48rpx 40rpx 40rpx;
    position: relative;
    border-radius: 32rpx;
}

.matrix-header {
    text-align: center;
    margin-bottom: 32rpx;
}

.matrix-title {
    font-size: 36rpx;
    font-weight: 700;
}

.matrix-title-accent {
    color: var(--color-primary);
}

.matrix-sub {
    font-size: 22rpx;
    color: var(--color-text-secondary);
    margin-top: 8rpx;
}

.matrix-close {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    border: none;
    background: var(--color-surface-soft, #f5f5f7);
    font-size: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.matrix-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rpx;
    border-radius: 16rpx;
    overflow: hidden;
}

.matrix-cell {
    background: var(--color-surface-soft, #f5f5f7);
    padding: 20rpx;
    border-top: 6rpx solid #999;
    min-height: 120rpx;
}

.matrix-cell-title {
    font-size: 26rpx;
    font-weight: 600;
    display: block;
}

.matrix-cell-count {
    font-size: 20rpx;
    color: var(--color-text-secondary);
}

.matrix-event {
    margin-top: 12rpx;
    padding: 8rpx 12rpx;
    background: #fff;
    border-radius: 8rpx;
    font-size: 22rpx;
}

.matrix-event-time {
    color: var(--color-text-secondary);
    font-size: 20rpx;
}

.matrix-event-title {
    font-weight: 500;
}

.matrix-empty {
    font-size: 20rpx;
    color: var(--color-text-tertiary);
    margin-top: 20rpx;
}

/* ===== Detail Sheet Modal ===== */
.detail-overlay {
    position: fixed;
    inset: 0;
    z-index: 400;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    animation: overlayFadeIn 0.25s ease;
}

@keyframes overlayFadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.detail-sheet {
    width: 100%;
    max-width: 420px;
    max-height: 80vh;
    background: var(--color-surface, #ffffff);
    border-radius: 32rpx 32rpx 0 0;
    padding: 18rpx 24px calc(28rpx + env(safe-area-inset-bottom));
    box-shadow: 0 -8rpx 40rpx rgba(15, 23, 42, 0.12);
    overflow-y: auto;
    animation: sheetSlideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes sheetSlideUp {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
}

.detail-hero {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 0 14px;
    flex-wrap: wrap;
}

.detail-quadrant-bar {
    position: absolute;
    left: -24px;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 0 2px 2px 0;
}

.detail-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-text, #1d1d1f);
    flex: 1;
    min-width: 0;
}

.detail-tag {
    font-size: 11px;
    padding: 2px 10px;
    border-radius: 6px;
    background: var(--color-primary-soft, rgba(255, 135, 0, 0.12));
    color: var(--color-primary, #ff8700);
    font-weight: 500;
    flex-shrink: 0;
}

.detail-body {
    padding: 4px 0 16px;
    border-top: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.06));
}

.detail-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
}

.detail-row-icon {
    font-size: 14px;
    width: 24px;
    text-align: center;
    flex-shrink: 0;
}

.detail-row-text {
    font-size: 14px;
    color: var(--color-text-secondary, #8e8e93);
    flex: 1;
}

.detail-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 8px 0;
}

.detail-meta-chip {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    background: var(--color-surface-soft, #f5f5f7);
    color: var(--color-text-tertiary, #b0b0b5);
}

.detail-meta-chip.priority-high {
    color: var(--color-danger, #ff3b30);
    background: rgba(255, 59, 48, 0.08);
}

.detail-meta-chip.priority-low {
    color: var(--color-success, #34c759);
    background: rgba(52, 199, 89, 0.08);
}

.detail-subtasks {
    padding: 10px 0;
}

.detail-subtask-title {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text, #1d1d1f);
    margin-bottom: 6px;
}

.detail-subtask-item {
    font-size: 12px;
    color: var(--color-text-secondary, #8e8e93);
    padding: 3px 0;
}

.detail-subtask-item.done {
    color: var(--color-success, #34c759);
    text-decoration: line-through;
}

.detail-desc {
    display: block;
    font-size: 13px;
    color: var(--color-text-secondary, #8e8e93);
    line-height: 1.5;
    padding: 8px 0;
}

.detail-progress {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
}

.detail-progress-bar {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: var(--color-border-light, #d1d1d6);
    overflow: hidden;
}

.detail-progress-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(135deg, var(--color-primary, #ff8700), #8980f0);
    transition: width 0.3s ease;
}

.detail-progress-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-primary, #ff8700);
}

.detail-actions {
    display: flex;
    gap: 8px;
    padding-top: 14px;
    border-top: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.06));
}

.detail-action-btn {
    flex: 1;
    padding: 12px 0;
    border-radius: 10px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
}
.detail-action-btn.hover-active {
    transform: translateY(-1px);
}
.detail-action-btn:active {
    transform: scale(0.95);
}

.detail-action-btn.primary {
    background: linear-gradient(135deg, var(--color-primary, #ff8700), #8980f0);
    color: #fff;
    box-shadow: 0 4px 12px rgba(255, 135, 0, 0.25);
}

.detail-action-btn.secondary {
    background: var(--color-surface-soft, #f5f5f7);
    color: var(--color-text-secondary, #8e8e93);
}

.detail-action-btn.danger {
    background: var(--color-danger-soft, rgba(255, 59, 48, 0.08));
    color: var(--color-danger, #ff3b30);
}
</style>
