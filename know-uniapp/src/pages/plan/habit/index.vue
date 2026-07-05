<template>
    <view class="plan-habit-page">
        <view class="page-header">
            <view>
                <text class="page-title">🎯 习惯打卡</text>
                <text class="page-subtitle">用连续打卡培养稳定节奏</text>
            </view>
            <view class="header-actions">
                <view class="premium-header-btn" @tap="goAddHabit">+</view>
            </view>
        </view>

        <scroll-view scroll-y class="calendar-scroll">
            <view class="streak-cards premium-fade-in premium-d1">
                <view class="streak-card" style="--card-accent: #6366f1">
                    <text class="streak-num">{{ checkedCount }}</text>
                    <text class="streak-label">今日已打卡</text>
                </view>
                <view class="streak-card" style="--card-accent: #f59e0b">
                    <text class="streak-num">{{ bestHabit?.currentDays || 0 }}</text>
                    <text class="streak-label">最长连续</text>
                </view>
                <view class="streak-card" style="--card-accent: #10b981">
                    <text class="streak-num">{{ monthlyStats.rate }}%</text>
                    <text class="streak-label">本月完成率</text>
                </view>
            </view>
            <CalendarGrid
                :year="currentYear"
                :month="currentMonth"
                :weeks="weeks"
                :current-week-days="currentWeekDays"
                :monthly-stats="monthlyStats"
                :collapsed="collapsed"
                :selected-date="selectedDateLabel"
                :event-count="dayHabitRecords.length"
                :quadrant-color="quadrantColor"
                @date-tap="onDateTap"
                @month-switch="onMonthSwitch"
                @toggle-collapse="toggleCollapse"
            />

            <view class="checkin-tabs premium-fade-in premium-d1">
                <view
                    class="checkin-tab"
                    :class="{ active: activeTab === 'checkin' }"
                    @tap="activeTab = 'checkin'"
                >
                    打卡
                    <text class="tab-badge">{{ checkedCount }}/{{ dayHabitRecords.length }}</text>
                </view>
                <view
                    class="checkin-tab"
                    :class="{ active: activeTab === 'manage' }"
                    @tap="activeTab = 'manage'"
                >
                    管理 <text class="tab-badge">{{ allHabits.length }}</text>
                </view>
            </view>

            <view v-if="activeTab === 'checkin'" class="badge-strip premium-fade-in premium-d2">
                <scroll-view scroll-x class="badge-scroll" show-scrollbar="false">
                    <view
                        v-for="ms in milestoneStatus"
                        :key="ms.days"
                        class="badge-item"
                        :class="{ unlocked: ms.unlocked }"
                    >
                        <text class="badge-icon">{{ ms.icon }}</text>
                        <text class="badge-days">{{ ms.days }}天</text>
                    </view>
                </scroll-view>
            </view>

            <view
                v-if="activeTab === 'checkin' && selectedDateLabel"
                class="day-overview premium-card premium-fade-in premium-d2"
            >
                <view class="overview-top">
                    <text class="overview-date">{{ selectedDateLabel }}</text>
                    <text class="overview-count">{{ dayHabitRecords.length }} 个习惯</text>
                </view>
                <view class="overview-chips">
                    <text class="overview-chip">已打卡 {{ checkedCount }}</text>
                    <text class="overview-chip">未打卡 {{ uncheckedCount }}</text>
                    <text class="overview-chip">月完成率 {{ monthlyStats.rate }}%</text>
                </view>
                <view class="overview-progress" v-if="dayHabitRecords.length > 0">
                    <view class="overview-bar">
                        <view class="overview-fill" :style="{ width: dayCheckRate + '%' }"></view>
                    </view>
                    <text class="overview-rate">{{ dayCheckRate }}%</text>
                </view>
            </view>

            <view
                class="day-title premium-fade-in premium-d3"
                v-if="activeTab === 'checkin' && selectedDateLabel"
            >
                <text>{{ selectedDateLabel }} 打卡详情</text>
            </view>

            <view
                v-if="activeTab === 'checkin' && dayHabitRecords.length === 0 && selectedDateLabel"
                class="empty-state"
            >
                <text class="empty-icon">🎯</text>
                <text class="empty-text">该日暂无打卡记录</text>
            </view>

            <template v-if="activeTab === 'checkin'">
                <view v-for="item in dayHabitRecords" :key="item.habitId" class="goal-card-wrap">
                    <view class="swipe-actions">
                        <view class="swipe-action action-done" @tap.stop="onHabitSwipeAction(item)">
                            <text class="sa-icon">{{ item.checked ? '↩' : '✓' }}</text>
                            <text class="sa-label">{{ item.checked ? '取消' : '完成' }}</text>
                        </view>
                        <view
                            class="swipe-action action-edit"
                            @tap.stop="editHabitFromCheckin(item)"
                        >
                            <text class="sa-icon">✏️</text>
                            <text class="sa-label">编辑</text>
                        </view>
                        <view class="swipe-action action-archive" @tap.stop="archiveHabit(item)">
                            <text class="sa-icon">📦</text>
                            <text class="sa-label">结束</text>
                        </view>
                    </view>
                    <view
                        class="swipe-content"
                        :style="habitSwipeStyle(item.habitId)"
                        @touchstart="onHabitTouchStart($event, item.habitId)"
                        @touchmove="onHabitTouchMove($event, item.habitId)"
                        @touchend="onHabitTouchEnd($event, item.habitId)"
                        @tap="openHabitDetail(item)"
                    >
                        <view
                            class="goal-card color-border premium-hover-lift"
                            :style="{ borderLeftColor: item.color || '#5b5bd6' }"
                        >
                            <view class="g-header">
                                <text class="g-icon">{{ item.icon || '🎯' }}</text>
                                <text class="g-name">{{ item.habitName }}</text>
                                <text
                                    class="g-badge"
                                    :style="{
                                        background: (item.color || '#5b5bd6') + '22',
                                        color: item.color || '#5b5bd6'
                                    }"
                                    >{{ getFrequencyMeta(item).label }}</text
                                >
                            </view>
                            <view class="g-streak">
                                <text
                                    ><text class="fire-icon">🔥</text> 连续
                                    {{ item.currentDays || 0 }} 天</text
                                >
                            </view>
                            <view v-if="hasReminder(item)" class="g-reminder">
                                <text class="g-reminder-icon">🔔</text>
                                <text class="g-reminder-text">{{ buildReminderText(item) }}</text>
                            </view>
                            <view v-if="getCardWeekData(item).weekDays" class="g-progress">
                                <view class="g-progress-bar">
                                    <view
                                        class="g-progress-fill"
                                        :style="{ width: getCardWeekData(item).rate + '%' }"
                                    ></view>
                                </view>
                                <view class="g-progress-label">
                                    <text>本周 {{ getCardWeekData(item).completed }}/7</text>
                                    <text>{{ getCardWeekData(item).rate }}%</text>
                                </view>
                            </view>
                            <view v-if="item.description" class="g-note">
                                <text class="g-note-icon">📌</text>
                                <text class="g-note-text">{{ item.description }}</text>
                            </view>
                            <view v-if="item.note" class="g-note">
                                <text class="g-note-icon">📝</text>
                                <text class="g-note-text">{{ item.note }}</text>
                            </view>
                            <view class="g-footer">
                                <view class="g-week">
                                    <view
                                        v-for="day in getCardWeekData(item).weekDays"
                                        :key="day.date"
                                        class="g-week-day"
                                        :class="{ done: day.checked, today: day.isToday }"
                                    >
                                        <text>{{ day.isToday ? '今' : day.label }}</text>
                                    </view>
                                </view>
                                <button
                                    class="checkin-btn"
                                    :class="{ checked: item.checked }"
                                    @tap.stop="onHabitSwipeAction(item)"
                                >
                                    <text>{{ item.checked ? '✓' : '○' }}</text>
                                </button>
                            </view>
                        </view>
                    </view>
                </view>
            </template>

            <view v-if="activeTab === 'manage'" class="section-pad premium-fade-in premium-d2">
                <view class="section-sub">进行中的目标</view>
                <view v-if="allHabits.length === 0" class="empty-state">
                    <text class="empty-icon">🎯</text>
                    <text class="empty-text">还没有目标，点击右下角 + 新建</text>
                </view>
                <template v-for="(group, cat) in groupedHabits" :key="cat">
                    <view class="grp-header" @tap="toggleGroup(cat)">
                        <text class="grp-arrow" :class="{ collapsed: isGroupCollapsed(cat) }"
                            >▼</text
                        >
                        <text class="grp-name">{{ cat || '未分类' }}</text>
                        <text class="grp-count">{{ group.length }}项</text>
                    </view>
                    <view v-show="!isGroupCollapsed(cat)">
                        <view
                            v-for="(habit, hIdx) in group"
                            :key="habit.habitId || habit.id"
                            class="manage-item"
                            @tap="openHabitDetail(toHabitRecord(habit))"
                        >
                            <text class="mi-icon">{{ habit.icon || '🎯' }}</text>
                            <view class="mi-info">
                                <text class="mi-name">{{
                                    habit.habitName || habit.name || '未命名习惯'
                                }}</text>
                                <text class="mi-sub">{{ buildManageMeta(habit) }}</text>
                            </view>
                            <view class="manage-actions">
                                <button
                                    class="mi-action move-btn"
                                    type="button"
                                    @tap.stop="moveHabit(habit, -1, cat)"
                                    :disabled="hIdx === 0"
                                >
                                    ▲
                                </button>
                                <button
                                    class="mi-action move-btn"
                                    type="button"
                                    @tap.stop="moveHabit(habit, 1, cat)"
                                    :disabled="hIdx === group.length - 1"
                                >
                                    ▼
                                </button>
                            </view>
                            <button
                                class="mi-action end-btn"
                                type="button"
                                @tap.stop="archiveHabitFromManage(habit)"
                            >
                                结束
                            </button>
                        </view>
                    </view>
                </template>
                <view
                    style="
                        font-size: 12px;
                        color: var(--color-text-tertiary);
                        margin: 16px 0 10px;
                        font-weight: 500;
                    "
                    >已结束的目标</view
                >
                <view
                    v-if="archivedHabits.length === 0"
                    style="
                        text-align: center;
                        padding: 24px 0;
                        font-size: 12px;
                        color: var(--color-text-tertiary);
                    "
                    >暂无结束的目标</view
                >
                <view
                    v-for="habit in archivedHabits"
                    :key="'arch-' + (habit.habitId || habit.id)"
                    class="manage-item archived"
                    @tap="openHabitDetail(toHabitRecord(habit))"
                >
                    <text class="mi-icon">{{ habit.icon || '🎯' }}</text>
                    <view class="mi-info">
                        <text class="mi-name">{{
                            habit.habitName || habit.name || '未命名习惯'
                        }}</text>
                        <text class="mi-sub">{{ buildArchivedMeta(habit) }}</text>
                    </view>
                    <button
                        class="mi-action"
                        type="button"
                        @tap.stop="restoreHabitFromManage(habit)"
                    >
                        恢复
                    </button>
                </view>
                <view
                    style="
                        margin-top: 16px;
                        display: flex;
                        gap: 8px;
                        justify-content: center;
                        flex-wrap: wrap;
                        border-top: 1px solid var(--color-border-light);
                        padding-top: 12px;
                    "
                >
                    <button type="button" @tap="goAddHabit" class="manage-bottom-btn">
                        📋 习惯模板
                    </button>
                    <button type="button" @tap="goStatsPage" class="manage-bottom-btn">
                        🔒 密码锁
                    </button>
                </view>
            </view>

            <view style="height: 180rpx"></view>
        </scroll-view>

        <view class="floating-add" @tap="goAddHabit">+</view>

        <view
            v-if="detailModal.visible"
            class="achievement-mask habit-detail-overlay"
            @tap="closeHabitDetail"
        >
            <view class="habit-detail-modal" @tap.stop>
                <view class="modal-handle"></view>
                <view class="habit-detail-top">
                    <view class="habit-detail-hero">
                        <text class="habit-detail-icon" :style="{ color: detailModal.color }">{{
                            detailModal.icon
                        }}</text>
                        <view class="habit-detail-copy">
                            <text class="habit-detail-name">{{ detailModal.name }}</text>
                            <text class="habit-detail-sub">{{
                                `${detailModal.frequencyLabel} · ${detailModal.category || '健康'}`
                            }}</text>
                        </view>
                    </view>
                    <text class="habit-streak-badge" :style="{ color: detailModal.color }"
                        >🔥 {{ detailModal.currentDays }}天</text
                    >
                </view>

                <view class="habit-detail-stats">
                    <view class="habit-detail-stat">
                        <text class="habit-detail-stat-num">{{ detailModal.weekCompleted }}</text>
                        <text class="habit-detail-stat-label">本周完成</text>
                    </view>
                    <view class="habit-detail-stat">
                        <text class="habit-detail-stat-num primary"
                            >{{ detailModal.weekRate }}%</text
                        >
                        <text class="habit-detail-stat-label">完成率</text>
                    </view>
                    <view class="habit-detail-stat">
                        <text class="habit-detail-stat-num warning">{{
                            detailModal.currentDays
                        }}</text>
                        <text class="habit-detail-stat-label">连续天数</text>
                    </view>
                </view>

                <view v-if="detailModal.description" class="habit-detail-note-card primary-mist">
                    <text class="habit-detail-desc">{{ `📌 ${detailModal.description}` }}</text>
                </view>

                <view v-if="detailModal.motto" class="habit-detail-note-card">
                    <text class="habit-detail-motto">{{ `💬 ${detailModal.motto}` }}</text>
                </view>

                <view class="habit-detail-lines">
                    <text class="habit-detail-line">{{
                        `🎯 目标：${detailModal.targetValue || 1}${
                            detailModal.targetUnit || '次'
                        }/${detailModal.periodLabel}`
                    }}</text>
                    <text class="habit-detail-line">{{
                        `🔔 提醒：${detailModal.reminderText}`
                    }}</text>
                    <text class="habit-detail-line">{{
                        `📅 开始：${detailModal.startDate || '--'}${
                            detailModal.endDate ? ` → ${detailModal.endDate}` : ''
                        }`
                    }}</text>
                </view>

                <view v-if="detailModal.note" class="habit-detail-note-card">
                    <text class="habit-detail-motto">{{ `📝 今日备注：${detailModal.note}` }}</text>
                </view>

                <view
                    v-if="detailModal.allowBackfill"
                    class="detail-dashed-btn warning"
                    @tap="handleBackfillEntry"
                >
                    📅 补卡（本月剩余 3/3 次）
                </view>
                <view class="detail-dashed-btn primary" @tap="handleShareEntry">📤 分享</view>

                <view class="habit-detail-section">
                    <text class="habit-detail-section-title">最近 7 天</text>
                    <view class="habit-week-strip">
                        <view
                            v-for="day in detailModal.recentDays"
                            :key="day.date"
                            class="habit-week-day"
                            :class="{ checked: day.checked, today: day.isToday }"
                        >
                            <text class="habit-week-name">{{ day.label }}</text>
                            <text class="habit-week-date">{{ day.dayNumber }}</text>
                            <text class="habit-week-dot">{{ day.checked ? '✓' : '' }}</text>
                        </view>
                    </view>
                </view>

                <view class="habit-detail-actions">
                    <button
                        class="detail-action-btn detail-action-btn-muted"
                        @tap="editHabitFromDetail"
                    >
                        编辑
                    </button>
                    <button
                        class="detail-action-btn detail-action-btn-primary"
                        @tap="handleDetailCheckin"
                    >
                        {{ detailModal.checked ? '取消打卡' : '立即打卡' }}
                    </button>
                </view>
                <view class="habit-detail-secondary-actions">
                    <button class="detail-action-mini" type="button" @tap="handleBackfillEntry">
                        补卡
                    </button>
                    <button class="detail-action-mini" type="button" @tap="handleShareEntry">
                        分享
                    </button>
                </view>
            </view>
        </view>

        <view v-if="achievementModal.visible" class="achievement-mask" @tap="closeAchievementModal">
            <view class="achievement-modal premium-card" @tap.stop>
                <text class="achievement-emoji">{{ achievementModal.icon }}</text>
                <text class="achievement-title">{{ achievementModal.title }}</text>
                <text class="achievement-desc"
                    >{{ achievementModal.habitName }} 已连续打卡
                    {{ achievementModal.days }} 天</text
                >
                <text class="achievement-copy">{{ achievementModal.desc }}</text>
                <button class="achievement-btn" type="button" @tap="closeAchievementModal">
                    继续打卡
                </button>
            </view>
        </view>

        <HabitFormSheet
            :visible="showForm"
            :edit-data="editingHabit"
            :selected-date="selectedDateLabel"
            @close="
                showForm = false;
                editingHabit = null
            "
            @saved="onFormSaved"
        />
        <PremiumBottomNav active="plan" />
    </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import PremiumBottomNav from '@/components/PremiumBottomNav.vue'
import CalendarGrid from '@/components/calendar-grid/CalendarGrid.vue'
import HabitFormSheet from './components/HabitFormSheet.vue'
import {
    checkinHabit,
    getCalendarMonthly,
    getHabitStats,
    uncheckinHabit,
    updateHabit
} from '@/api/plan/habit'
import { getHolidays } from '@/api/holiday'
import {
    formatYYYYMMDD,
    generateWeeks,
    quadrantColor
} from '@/components/calendar-grid/calendar-utils.js'
import { useHoverEffect } from '@/hooks/useHoverEffect'

useHoverEffect('.manage-item,.mi-action,.swipe-action,.goal-card,.checkin-btn,.floating-add')

const MILESTONES = [
    { days: 7, icon: '🌱', title: '初露锋芒', desc: '坚持了一周，好的开始已经形成。' },
    { days: 21, icon: '🌿', title: '习惯渐成', desc: '21 天打卡完成，节奏开始稳定下来。' },
    { days: 66, icon: '🌳', title: '根深蒂固', desc: '66 天后，习惯已经开始融入你的生活。' },
    { days: 100, icon: '🏆', title: '百日坚守', desc: '一百天不间断，这份执行力非常难得。' },
    { days: 200, icon: '💎', title: '坚韧不拔', desc: '两百天的累计坚持，已经是一种可靠能力。' },
    { days: 365, icon: '👑', title: '年度王者', desc: '一年如一日，你把习惯真正变成了日常。' }
]

const stats = ref({ activeCount: 0, completedCount: 0, totalCheckins: 0 })
const hasLoaded = ref(false)
const activeTab = ref('checkin')

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const collapsed = ref(true)
const selectedDateLabel = ref('')
const habitCalendarMarks = ref([])
const dayHabitRecords = ref([])
const allHabits = ref([])
const holidays = ref(null)
const holidaysYear = ref(0)
const showForm = ref(false)
const editingHabit = ref(null)

const achievementModal = ref({
    visible: false,
    icon: '',
    title: '',
    desc: '',
    habitName: '',
    days: 0
})
const detailModal = ref({
    visible: false,
    habitId: '',
    name: '',
    icon: '🎯',
    description: '',
    category: '',
    color: '#5b5bd6',
    motto: '',
    trackingType: 'boolean',
    targetValue: 1,
    targetUnit: '次',
    frequencyType: 1,
    frequencyRule: '',
    frequencyLabel: '每天',
    periodLabel: '天',
    weekRate: 0,
    checked: false,
    currentDays: 0,
    totalDays: 0,
    startDate: '',
    endDate: '',
    reminderTime: '',
    secondReminder: '',
    reminderText: '不提醒',
    allowBackfill: true,
    note: '',
    weekCompleted: 0,
    recentDays: []
})

const currentWeekDays = computed(() => {
    if (!weeks.value.length) return []
    const today = new Date()
    const todayStr = formatYYYYMMDD(today.getFullYear(), today.getMonth() + 1, today.getDate())
    const targetStr = selectedDateLabel.value || todayStr
    for (const week of weeks.value) {
        const found = week.find((day) => day.date === targetStr)
        if (found) {
            return week.map((day, index) => ({
                ...day,
                weekLabel: ['日', '一', '二', '三', '四', '五', '六'][index]
            }))
        }
    }
    return []
})

const weeks = computed(() =>
    generateWeeks(currentYear.value, currentMonth.value, habitCalendarMarks.value, holidays.value)
)
const monthlyStats = computed(() => {
    const daysInMonth = new Date(currentYear.value, currentMonth.value, 0).getDate()
    const checkedDays = new Set(habitCalendarMarks.value.map((item) => item.date))
    const total = daysInMonth
    const completed = checkedDays.size
    return {
        total,
        completed,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
})
const checkedCount = computed(() => dayHabitRecords.value.filter((item) => item.checked).length)
const uncheckedCount = computed(() => dayHabitRecords.value.filter((item) => !item.checked).length)
const dayCheckRate = computed(() => {
    if (!dayHabitRecords.value.length) return 0
    return Math.round((checkedCount.value / dayHabitRecords.value.length) * 100)
})
const todayDate = computed(() => {
    const now = new Date()
    return formatYYYYMMDD(now.getFullYear(), now.getMonth() + 1, now.getDate())
})
const selectedRecordDate = () => {
    const dateStr = selectedDateLabel.value || todayDate.value
    const parts = dateStr.split('-').map((item) => Number(item))
    return new Date(parts[0], parts[1] - 1, parts[2]).getTime()
}
const bestHabit = computed(() => {
    if (!allHabits.value.length) return null
    return [...allHabits.value].sort((a, b) => (b.currentDays || 0) - (a.currentDays || 0))[0]
})
const milestoneStatus = computed(() => {
    const bestDays = bestHabit.value?.currentDays || 0
    return MILESTONES.map((milestone) => ({
        ...milestone,
        unlocked: bestDays >= milestone.days
    }))
})
const unlockedMilestoneCount = computed(() => {
    return milestoneStatus.value.filter((item) => item.unlocked).length
})

const collapsedGroups = ref({})

const groupedHabits = computed(() => {
    const groups = {}
    const active = allHabits.value.filter((h) => !h.endDate)
    active.forEach((habit) => {
        const cat = habit.category || '未分类'
        if (!groups[cat]) groups[cat] = []
        groups[cat].push(habit)
    })
    return groups
})

const archivedHabits = computed(() => {
    return allHabits.value.filter((h) => h.endDate)
})

const toggleGroup = (cat) => {
    collapsedGroups.value[cat] = !collapsedGroups.value[cat]
}

const isGroupCollapsed = (cat) => {
    return !!collapsedGroups.value[cat]
}

const HABIT_SWIPE_THRESHOLD = 42
const HABIT_SWIPE_MAX = 210
const habitSwipeOffsets = ref({})
const openHabitId = ref(null)

const closeHabitSwipe = (id) => {
    if (habitSwipeOffsets.value[id]) {
        habitSwipeOffsets.value[id].translateX = 0
    }
    if (openHabitId.value === id) {
        openHabitId.value = null
    }
}

const onHabitTouchStart = (e, id) => {
    const touch = e.touches[0]
    if (openHabitId.value !== null && openHabitId.value !== id) {
        closeHabitSwipe(openHabitId.value)
    }
    habitSwipeOffsets.value[id] = {
        startX: touch.clientX,
        currentX: touch.clientX,
        translateX: openHabitId.value === id ? -HABIT_SWIPE_MAX : 0
    }
}

const onHabitTouchMove = (e, id) => {
    const data = habitSwipeOffsets.value[id]
    if (!data) return
    const touch = e.touches[0]
    let targetX = data.translateX + (touch.clientX - data.currentX)
    targetX = Math.max(-HABIT_SWIPE_MAX, Math.min(0, targetX))
    data.translateX = targetX
    data.currentX = touch.clientX
}

const onHabitTouchEnd = (e, id) => {
    const data = habitSwipeOffsets.value[id]
    if (!data) return
    if (Math.abs(data.translateX) > HABIT_SWIPE_THRESHOLD) {
        openHabitId.value = id
        data.translateX = -HABIT_SWIPE_MAX
    } else {
        closeHabitSwipe(id)
    }
}

const habitSwipeStyle = (id) => {
    const data = habitSwipeOffsets.value[id]
    const x = data ? data.translateX : openHabitId.value === id ? -HABIT_SWIPE_MAX : 0
    return `transform: translateX(${x}px); transition: transform 0.25s cubic-bezier(.22,1,.36,1);`
}

const fetchStats = async () => {
    try {
        const res = await getHabitStats({})
        stats.value = res || { activeCount: 0, completedCount: 0, totalCheckins: 0 }
    } catch (error) {
        console.error('获取统计失败', error)
    }
}

const fetchHolidays = async (year = currentYear.value) => {
    if (year !== holidaysYear.value) {
        holidays.value = await getHolidays(year)
        if (holidays.value) holidaysYear.value = year
    }
}

const formatTimestampDate = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return formatYYYYMMDD(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

const getFrequencyMeta = (habit) => {
    if (habit.frequencyType === 2) return { label: '每周', period: '周' }
    if (habit.frequencyType === 3) {
        try {
            const parsed = JSON.parse(habit.frequencyRule || '{}')
            const periodMap = {
                weekday: ['工作日', '天'],
                weekend: ['周末', '天'],
                monthly: ['每月', '月'],
                daily: ['每天', '天']
            }
            const [label, period] = periodMap[parsed.period] || ['自定义', '天']
            return { label, period }
        } catch {
            return { label: '自定义', period: '天' }
        }
    }
    return { label: '每天', period: '天' }
}

const normalizeReminderTime = (value) => {
    if (value === null || value === undefined) return ''
    return String(value).trim()
}

const buildReminderText = (habit = {}) => {
    const reminders = [habit.reminderTime, habit.secondReminder].map(normalizeReminderTime).filter(Boolean)
    return reminders.length ? reminders.join(' / ') : '不提醒'
}

const hasReminder = (habit) => buildReminderText(habit) !== '不提醒'

const buildManageMeta = (habit = {}) => {
    const parts = [`连续 ${habit.currentDays || 0} 天`, habit.category || '健康']
    if (hasReminder(habit)) {
        parts.push(`🔔 ${buildReminderText(habit)}`)
    }
    return parts.join(' · ')
}

const buildArchivedMeta = (habit = {}) => {
    const parts = ['已结束', habit.category || '健康']
    if (hasReminder(habit)) {
        parts.push(`🔔 ${buildReminderText(habit)}`)
    }
    return parts.join(' · ')
}

const mapHabitRecordsForDay = (dateStr) => {
    if (!dateStr) return []
    const day = Number(dateStr.split('-')[2])
    return allHabits.value.map((habit) => {
        const checked = (habit.checkinDays || []).includes(day)
        return {
            habitId: habit.habitId || habit.id,
            habitName: habit.habitName || habit.name || '未命名习惯',
            checked,
            currentDays: habit.currentDays || 0,
            totalDays: habit.totalDays || 0,
            description: habit.description || '',
            icon: habit.icon || '🎯',
            color: habit.color || '#5b5bd6',
            category: habit.category || '',
            motto: habit.motto || '',
            trackingType: habit.trackingType || 'boolean',
            targetValue: habit.targetValue || 1,
            targetUnit: habit.targetUnit || '次',
            frequencyType: habit.frequencyType || 1,
            frequencyRule: habit.frequencyRule || '',
            timePeriod: habit.timePeriod || 'all',
            allowBackfill: habit.allowBackfill !== false,
            note: habit.note || '',
            checkinDays: habit.checkinDays || [],
            reminderTime: habit.reminderTime || '',
            secondReminder: habit.secondReminder || '',
            reminderText: buildReminderText(habit),
            startDate: formatTimestampDate(habit.startDate),
            endDate: formatTimestampDate(habit.endDate)
        }
    })
}

const toHabitRecord = (habit) => {
    const dateStr = selectedDateLabel.value || todayDate.value
    const day = Number(dateStr.split('-')[2])
    return {
        habitId: habit.habitId || habit.id,
        habitName: habit.habitName || habit.name || '未命名习惯',
        checked: (habit.checkinDays || []).includes(day),
        currentDays: habit.currentDays || 0,
        totalDays: habit.totalDays || 0,
        description: habit.description || '',
        icon: habit.icon || '🎯',
        color: habit.color || '#5b5bd6',
        category: habit.category || '',
        motto: habit.motto || '',
        trackingType: habit.trackingType || 'boolean',
        targetValue: habit.targetValue || 1,
        targetUnit: habit.targetUnit || '次',
        frequencyType: habit.frequencyType || 1,
        frequencyRule: habit.frequencyRule || '',
        timePeriod: habit.timePeriod || 'all',
        allowBackfill: habit.allowBackfill !== false,
        note: habit.note || '',
        checkinDays: habit.checkinDays || [],
        reminderTime: habit.reminderTime || '',
        secondReminder: habit.secondReminder || '',
        reminderText: buildReminderText(habit),
        startDate: formatTimestampDate(habit.startDate),
        endDate: formatTimestampDate(habit.endDate)
    }
}

const fetchCalendarData = async () => {
    try {
        const res = await getCalendarMonthly({ year: currentYear.value, month: currentMonth.value })
        if (!res) return
        const habitsMap = res.habits || {}
        allHabits.value = Object.keys(habitsMap).map((key) => {
            const habit = habitsMap[key] || {}
            return {
                id: habit.habitId || habit.id || key,
                habitId: habit.habitId || habit.id || key,
                habitName: habit.habitName || habit.name || '未命名习惯',
                description: habit.description || '',
                currentDays: habit.currentDays || 0,
                totalDays: habit.totalDays || 0,
                icon: habit.icon || '🎯',
                color: habit.color || '#5b5bd6',
                category: habit.category || '',
                motto: habit.motto || '',
                trackingType: habit.trackingType || 'boolean',
                targetValue: habit.targetValue || 1,
                targetUnit: habit.targetUnit || '次',
                frequencyType: habit.frequencyType || 1,
                frequencyRule: habit.frequencyRule || '',
                timePeriod: habit.timePeriod || 'all',
                allowBackfill: habit.allowBackfill !== false,
                note: habit.note || '',
                reminderTime: habit.reminderTime || '',
                secondReminder: habit.secondReminder || '',
                reminderText: buildReminderText(habit),
                startDate: habit.startDate || '',
                endDate: habit.endDate || '',
                checkinDays: habit.checkinDays || []
            }
        })

        const marks = []
        allHabits.value.forEach((habit) => {
            ;(habit.checkinDays || []).forEach((day) => {
                marks.push({
                    date: formatYYYYMMDD(currentYear.value, currentMonth.value, day),
                    quadrant: 2,
                    status: 1,
                    habitId: habit.habitId
                })
            })
        })
        habitCalendarMarks.value = marks
        if (selectedDateLabel.value) {
            dayHabitRecords.value = mapHabitRecordsForDay(selectedDateLabel.value)
        }
    } catch (error) {
        console.error('获取月历数据失败', error)
    }
}

const onMonthSwitch = async (year, month) => {
    currentYear.value = year
    currentMonth.value = month
    selectedDateLabel.value = ''
    dayHabitRecords.value = []
    await fetchHolidays(year)
    await fetchCalendarData()
}

const onDateTap = (dateStr) => {
    selectedDateLabel.value = dateStr
    dayHabitRecords.value = mapHabitRecordsForDay(dateStr)
}

const toggleCollapse = () => {
    collapsed.value = !collapsed.value
}

const closeAchievementModal = () => {
    achievementModal.value.visible = false
}

const closeHabitDetail = () => {
    detailModal.value.visible = false
}

const buildRecentDays = (item) => {
    const checkedDays = new Set((item.checkinDays || []).map((day) => Number(day)))
    const base = selectedDateLabel.value
        ? new Date(selectedDateLabel.value.replace(/-/g, '/'))
        : new Date()
    const labels = ['日', '一', '二', '三', '四', '五', '六']
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(base)
        date.setDate(base.getDate() - 6 + index)
        const dateStr = formatYYYYMMDD(date.getFullYear(), date.getMonth() + 1, date.getDate())
        return {
            date: dateStr,
            label: labels[date.getDay()],
            dayNumber: date.getDate(),
            checked: checkedDays.has(date.getDate()),
            isToday: dateStr === todayDate.value
        }
    })
}

const openHabitDetail = (item) => {
    const recentDays = buildRecentDays(item)
    const weekCompleted = recentDays.filter((day) => day.checked).length
    const frequencyMeta = getFrequencyMeta(item)
    detailModal.value = {
        visible: true,
        habitId: item.habitId,
        name: item.habitName,
        icon: item.icon || '🎯',
        color: item.color || '#5b5bd6',
        description: item.description || '',
        category: item.category || '',
        motto: item.motto || '',
        trackingType: item.trackingType || 'boolean',
        targetValue: item.targetValue || 1,
        targetUnit: item.targetUnit || '次',
        frequencyType: item.frequencyType || 1,
        frequencyRule: item.frequencyRule || '',
        frequencyLabel: frequencyMeta.label,
        periodLabel: frequencyMeta.period,
        checked: item.checked,
        currentDays: item.currentDays || 0,
        totalDays: item.totalDays || 0,
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        reminderTime: item.reminderTime || '',
        secondReminder: item.secondReminder || '',
        reminderText: buildReminderText(item),
        allowBackfill: item.allowBackfill !== false,
        note: item.note || '',
        weekCompleted,
        weekRate: Math.round((weekCompleted / 7) * 100),
        recentDays
    }
}

const showAchievementModal = (milestone, habitName) => {
    achievementModal.value = {
        visible: true,
        icon: milestone.icon,
        title: milestone.title,
        desc: milestone.desc,
        habitName,
        days: milestone.days
    }
}

const maybeShowMilestone = (previousDays, habit) => {
    const currentDays = habit?.currentDays || 0
    if (currentDays <= previousDays) return
    const milestone = MILESTONES.find((item) => item.days === currentDays)
    if (!milestone) return
    showAchievementModal(milestone, habit.habitName || habit.name || '当前习惯')
}

const handleQuickCheckin = async (item) => {
    try {
        const previousDays = item.currentDays || 0
        await checkinHabit(item.habitId, { recordDate: selectedRecordDate() })
        uni.showToast({ title: '打卡成功', icon: 'success' })
        await refreshHabitPage()
        const updatedHabit = allHabits.value.find(
            (habit) => String(habit.habitId || habit.id) === String(item.habitId)
        )
        maybeShowMilestone(previousDays, updatedHabit)
    } catch (error) {
        console.error(error)
    }
}

const handleQuickUncheckin = async (item) => {
    try {
        await uncheckinHabit(item.habitId, { recordDate: selectedRecordDate() })
        uni.showToast({ title: '已取消打卡', icon: 'success' })
        await refreshHabitPage()
    } catch (error) {
        console.error(error)
    }
}

const onHabitSwipeAction = (item) => {
    closeHabitSwipe(item.habitId)
    if (item.checked) {
        handleQuickUncheckin(item)
        return
    }
    handleQuickCheckin(item)
}

const handleDetailCheckin = async () => {
    if (detailModal.value.checked) {
        await handleQuickUncheckin({
            habitId: detailModal.value.habitId
        })
        closeHabitDetail()
        return
    }
    await handleQuickCheckin({
        habitId: detailModal.value.habitId,
        currentDays: detailModal.value.currentDays
    })
    closeHabitDetail()
}

const editHabitFromDetail = () => {
    if (!detailModal.value.habitId) return
    closeHabitDetail()
    const habit = allHabits.value.find(
        (h) => String(h.habitId || h.id) === String(detailModal.value.habitId)
    )
    editingHabit.value = habit || { habitId: detailModal.value.habitId }
    showForm.value = true
}

const getCardWeekData = (item) => {
    const checkedDays = new Set((item.checkinDays || []).map((day) => Number(day)))
    const base = selectedDateLabel.value
        ? new Date(selectedDateLabel.value.replace(/-/g, '/'))
        : new Date()
    const labels = ['日', '一', '二', '三', '四', '五', '六']
    const weekDays = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(base)
        date.setDate(base.getDate() - 6 + index)
        const dayNum = date.getDate()
        const dateStr = formatYYYYMMDD(date.getFullYear(), date.getMonth() + 1, date.getDate())
        return {
            date: dateStr,
            label: labels[date.getDay()],
            dayNumber: dayNum,
            checked: checkedDays.has(dayNum),
            isToday: dateStr === todayDate.value
        }
    })
    const completed = weekDays.filter((day) => day.checked).length
    return {
        weekDays,
        completed,
        rate: Math.round((completed / 7) * 100)
    }
}

const editHabitFromCheckin = (item) => {
    const habit = allHabits.value.find((h) => String(h.habitId || h.id) === String(item.habitId))
    editingHabit.value = habit || { habitId: item.habitId }
    showForm.value = true
}

const archiveHabit = (item) => {
    archiveHabitFromManage(item)
}

const moveHabit = (habit, dir, cat) => {
    const group = groupedHabits.value[cat] || []
    const idx = group.indexOf(habit)
    if (idx === -1) return
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= group.length) return
    // Swap in the actual allHabits array
    const aIdx = allHabits.value.indexOf(habit)
    const aTarget = allHabits.value.indexOf(group[newIdx])
    if (aIdx === -1 || aTarget === -1) return
    const tmp = allHabits.value[aIdx]
    allHabits.value[aIdx] = allHabits.value[aTarget]
    allHabits.value[aTarget] = tmp
    // Force reactivity by replacing the array
    allHabits.value = [...allHabits.value]
}

const archiveHabitFromManage = (habit) => {
    const habitId = habit.habitId || habit.id
    uni.showModal({
        title: '结束目标',
        content: `确定要结束「${habit.habitName || habit.name || '未命名习惯'}」吗？`,
        success: async (res) => {
            if (res.confirm) {
                await updateHabit({
                    id: habitId,
                    endDate: Date.now(),
                    status: 2
                })
                uni.showToast({ title: '已结束', icon: 'success' })
                await refreshHabitPage()
            }
        }
    })
}

const restoreHabitFromManage = async (habit) => {
    const habitId = habit.habitId || habit.id
    if (!habitId) return
    try {
        await updateHabit({
            id: habitId,
            endDate: 0,
            status: 0
        })
        uni.showToast({ title: '已恢复', icon: 'success' })
        await refreshHabitPage()
    } catch (error) {
        console.error(error)
    }
}

const editHabitFromManage = (habit) => {
    editingHabit.value = habit
    showForm.value = true
}

const handleBackfillEntry = async () => {
    if (!detailModal.value.habitId) return
    if (detailModal.value.checked) {
        uni.showToast({ title: '该日已打卡', icon: 'none' })
        return
    }
    await handleQuickCheckin({
        habitId: detailModal.value.habitId,
        currentDays: detailModal.value.currentDays
    })
    closeHabitDetail()
}

const handleShareEntry = () => {
    uni.showToast({ title: '分享入口已预留', icon: 'none' })
}

const refreshHabitPage = async () => {
    await fetchStats()
    await fetchCalendarData()
    if (selectedDateLabel.value) {
        dayHabitRecords.value = mapHabitRecordsForDay(selectedDateLabel.value)
    }
}

const goAddHabit = () => {
    editingHabit.value = null
    showForm.value = true
}

const onFormSaved = async () => {
    showForm.value = false
    editingHabit.value = null
    await refreshHabitPage()
}

const goStatsPage = () => {
    uni.navigateTo({ url: '/pages/plan/stats/index' })
}

onMounted(async () => {
    await fetchStats()
    await fetchHolidays()
    await fetchCalendarData()
    const now = new Date()
    const today = formatYYYYMMDD(now.getFullYear(), now.getMonth() + 1, now.getDate())
    onDateTap(today)
    hasLoaded.value = true
})

onShow(async () => {
    if (!hasLoaded.value) return
    await refreshHabitPage()
})
</script>

<style scoped>
.plan-habit-page {
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

.header-actions {
    display: flex;
    align-items: center;
    gap: 16rpx;
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

.calendar-scroll {
    padding-bottom: 20rpx;
}

.checkin-tabs {
    display: flex;
    gap: 0;
    padding: 0 40rpx 24rpx;
    margin-bottom: 24rpx;
    border-bottom: 2rpx solid var(--color-border-light);
}

.checkin-tab {
    flex: 1;
    min-height: 70rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    color: var(--color-text-tertiary);
    font-size: 28rpx;
    font-weight: 700;
    border-bottom: 4rpx solid transparent;
}

.checkin-tab.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
}

.tab-badge {
    font-size: 21rpx;
    color: inherit;
    opacity: 0.72;
}

.section-pad {
    padding: 0 32rpx 180rpx;
}

.manage-item {
    display: flex;
    align-items: center;
    padding: 14px 16px;
    border-radius: var(--radius-md, 12px);
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border-light);
    margin-bottom: 8px;
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    animation: cardSlideIn 0.4s ease both;
}
.manage-item.hover-active {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.manage-item:active {
    transform: scale(0.96);
}

.mi-icon {
    font-size: 24px;
    margin-right: 12px;
    flex-shrink: 0;
}

.mi-info {
    flex: 1;
    min-width: 0;
}

.mi-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
}

.mi-sub {
    font-size: 11px;
    color: var(--color-text-tertiary);
    margin-top: 2px;
}

.mi-action {
    font-size: 12px;
    color: var(--color-danger, #ff3b30);
    padding: 6px 12px;
    border-radius: var(--radius-sm, 6px);
    border: none;
    background: var(--color-danger-soft, rgba(255, 59, 48, 0.1));
    cursor: pointer;
    flex-shrink: 0;
}
.mi-action.hover-active {
    background: var(--color-danger, #ff3b30);
    color: #fff;
}
.mi-action:active {
    transform: scale(0.94);
}
.mi-action:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none !important;
}
.mi-action.move-btn {
    font-size: 14px;
    padding: 4px 6px;
    background: var(--color-surface-soft, #f5f5f7);
    color: var(--color-text-tertiary);
}
.mi-action.move-btn.hover-active {
    background: var(--color-border-light, #d1d1d6);
    color: var(--color-text-secondary);
}
.mi-action.end-btn {
    color: var(--color-danger, #ff3b30);
    background: var(--color-danger-soft, rgba(255, 59, 48, 0.1));
}
.manage-actions {
    display: flex;
    gap: 2px;
    margin-right: 4px;
}

.grp-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border-radius: var(--radius-sm, 6px);
    cursor: pointer;
    background: var(--color-surface-soft, #f5f5f7);
    margin-bottom: 4px;
    user-select: none;
    -webkit-user-select: none;
}
.grp-header:active {
    transform: scale(0.99);
}
.grp-arrow {
    font-size: 11px;
    color: var(--color-text-tertiary);
    transition: transform 0.2s;
    display: inline-block;
}
.grp-arrow.collapsed {
    transform: rotate(-90deg);
}
.grp-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
}
.grp-count {
    font-size: 11px;
    color: var(--color-text-tertiary);
}
.manage-item.archived {
    opacity: 0.5;
}
.manage-bottom-btn {
    padding: 10px 20px;
    border: 1.5px dashed var(--color-primary);
    border-radius: var(--radius-sm, 8px);
    background: transparent;
    color: var(--color-primary);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
}
.manage-bottom-btn:active {
    transform: scale(0.96);
}

.section-sub {
    font-size: 12px;
    color: var(--color-text-tertiary);
    margin: 16px 0 10px;
    font-weight: 500;
}

.section-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20rpx;
    margin-bottom: 20rpx;
}

.section-title {
    display: block;
    font-size: 30rpx;
    font-weight: 700;
    color: var(--color-text);
}

.section-subtitle {
    display: block;
    margin-top: 8rpx;
    font-size: 22rpx;
    line-height: 1.5;
    color: var(--color-text-secondary);
}

.section-badge {
    font-size: 22rpx;
    font-weight: 700;
    color: var(--color-primary);
    background: var(--color-primary-soft, #eef2ff);
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
}

.section-badge.accent {
    color: var(--color-success);
    background: rgba(82, 196, 26, 0.14);
}

.insight-entry,
.milestone-card {
    margin: 0 16px 14px;
    padding: 24rpx;
}

.premium-card {
    border-radius: 24rpx;
    background: var(--color-surface, #ffffff);
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.milestone-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16rpx;
}

.milestone-item {
    min-height: 148rpx;
    padding: 18rpx 12rpx;
    border-radius: 24rpx;
    background: var(--color-surface-soft, #f8fafc);
    border: 2rpx solid transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    opacity: 0.6;
}

.milestone-item.unlocked {
    opacity: 1;
    border-color: rgba(82, 196, 26, 0.24);
    background: linear-gradient(180deg, rgba(82, 196, 26, 0.12), rgba(82, 196, 26, 0.04));
}

.milestone-icon {
    font-size: 40rpx;
}

.milestone-name {
    margin-top: 10rpx;
    font-size: 24rpx;
    font-weight: 700;
    color: var(--color-text);
}

.milestone-days {
    margin-top: 6rpx;
    font-size: 21rpx;
    color: var(--color-text-secondary);
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
    background: var(--color-surface-soft, #f8fafc);
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
    background: var(--color-surface-soft, #f8fafc);
    overflow: hidden;
}

.overview-fill {
    height: 100%;
    border-radius: 999rpx;
    background: linear-gradient(135deg, var(--color-primary, #6366f1), #8980f0);
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
    background: var(--color-surface-soft, #f8fafc);
    border: 2rpx solid transparent;
}

.stat-card.accent {
    background: var(--color-primary-soft, #eef2ff);
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

.day-title {
    padding: 0 32rpx 12rpx;
    font-size: 28rpx;
    font-weight: 600;
    color: var(--color-text);
}

/* ===== Goal Card (checkin) ===== */
.goal-card-wrap {
    position: relative;
    margin: 0 16px 8px;
    border-radius: 12px;
    overflow: hidden;
}

.goal-card-wrap .swipe-actions {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    display: flex;
}

.goal-card-wrap .swipe-action {
    width: 70px;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: #fff;
    font-size: 11px;
    cursor: pointer;
}

.goal-card-wrap .swipe-action.action-done {
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
}

.goal-card-wrap .swipe-action.action-edit {
    background: var(--color-primary, #ff8700);
}

.goal-card-wrap .swipe-action.action-archive {
    background: var(--color-text-tertiary, #8e8e93);
}

.goal-card-wrap .swipe-action.hover-active {
    opacity: 0.9;
}

.goal-card-wrap .swipe-action:active {
    transform: scale(0.95);
}

.goal-card-wrap .swipe-action .sa-icon {
    font-size: 16px;
    line-height: 1;
}

.goal-card-wrap .swipe-action .sa-label {
    font-size: 10px;
    font-weight: 500;
}

.goal-card-wrap .swipe-content {
    position: relative;
    z-index: 2;
    background: var(--color-surface, #ffffff);
    will-change: transform;
}

.goal-card {
    border-radius: 12px;
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border-light);
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: box-shadow 0.25s ease, border-color 0.25s ease;
    animation: cardSlideIn 0.4s ease both;
}

.goal-card.hover-active {
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
}

.goal-card:active {
    transform: scale(0.96);
}

@keyframes cardSlideIn {
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes donePop {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.2);
    }
    100% {
        transform: scale(1);
    }
}

.goal-card.color-border {
    border-left: 4px solid var(--color-primary);
}

.goal-card .g-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.goal-card .g-icon {
    font-size: 32px;
    line-height: 1;
    flex-shrink: 0;
}

.goal-card .g-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    flex: 1;
    margin-left: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.goal-card .g-badge {
    font-size: 10px;
    padding: 2px 10px;
    border-radius: 6px;
    font-weight: 500;
    flex-shrink: 0;
}

.goal-card .g-streak {
    font-size: 12px;
    color: var(--color-warning, #f0a020);
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.goal-card .g-streak .fire-icon {
    display: inline-block;
    animation: firePulse 2s infinite;
}

.goal-card .g-reminder {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    gap: 5px;
    margin-bottom: 8px;
    padding: 3px 8px;
    border-radius: 6px;
    background: var(--color-surface-soft, #f8fafc);
    color: var(--color-text-secondary);
    font-size: 11px;
    line-height: 1.4;
}

.goal-card .g-reminder-icon {
    flex-shrink: 0;
}

.goal-card .g-reminder-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@keyframes firePulse {
    0%,
    100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.15);
    }
}

.goal-card .g-progress {
    margin-bottom: 10px;
}

.goal-card .g-progress-bar {
    height: 6px;
    border-radius: 3px;
    background: var(--color-border-light, #d1d1d6);
    overflow: hidden;
    position: relative;
}

.goal-card .g-progress-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
    transition: width 0.5s ease;
}

.goal-card .g-progress-label {
    font-size: 10px;
    color: var(--color-text-tertiary, #b0b0b5);
    margin-top: 3px;
    display: flex;
    justify-content: space-between;
}

.goal-card .g-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 10px;
    border-top: 1px solid var(--color-border-light, #d1d1d6);
}

.goal-card .g-week {
    display: flex;
    gap: 3px;
}

.goal-card .g-week-day {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    background: var(--color-surface-soft, #f5f5f7);
    color: var(--color-text-tertiary, #b0b0b5);
}

.goal-card .g-week-day.done {
    background: var(--color-success-soft, rgba(52, 199, 89, 0.12));
    color: var(--color-success, #34c759);
}

.goal-card .g-week-day.today {
    border: 1.5px solid var(--color-primary, #ff8700);
}

.checkin-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2px solid var(--color-border, #d1d1d6);
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: var(--color-text-tertiary, #b0b0b5);
    transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease,
        box-shadow 0.25s ease;
    flex-shrink: 0;
    padding: 0;
}

.checkin-btn.hover-active {
    transform: scale(1.05);
}

.checkin-btn.checked {
    background: var(--color-success, #34c759);
    border-color: var(--color-success, #34c759);
    color: #fff;
    box-shadow: 0 4px 12px rgba(52, 199, 89, 0.3);
}

.checkin-btn:active {
    transform: scale(0.9);
}

.floating-add {
    position: fixed;
    right: 40rpx;
    bottom: 122rpx;
    z-index: 50;
    width: 104rpx;
    height: 104rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary, #ff8700), #8980f0);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 64rpx;
    box-shadow: var(--shadow-glow, 0 8rpx 32rpx rgba(255, 135, 0, 0.2));
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.floating-add.hover-active {
    transform: scale(1.08);
    box-shadow: 0 12rpx 40rpx rgba(var(--color-primary-rgb, 255, 135, 0), 0.3);
}
.floating-add:active {
    transform: scale(0.95);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 120rpx 0;
}

.empty-icon {
    font-size: 80rpx;
}

.empty-text {
    font-size: 28rpx;
    color: var(--color-text-tertiary);
    margin-top: 16rpx;
}

.achievement-mask {
    position: fixed;
    inset: 0;
    z-index: 120;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32rpx;
}

.habit-detail-overlay {
    align-items: flex-end;
    padding: 0 0 calc(env(safe-area-inset-bottom));
}

.achievement-modal {
    width: 90%;
    max-width: 560rpx;
    padding: 40rpx 32rpx;
    border-radius: 32rpx;
    text-align: center;
    animation: achievementPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes achievementPopIn {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.habit-detail-modal {
    width: 100%;
    max-width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    padding: 18rpx 24rpx calc(28rpx + env(safe-area-inset-bottom));
    border-radius: 32rpx 32rpx 0 0;
    background: var(--color-surface, #ffffff);
    box-shadow: 0 -8rpx 40rpx rgba(15, 23, 42, 0.12);
}

.modal-handle {
    width: 72rpx;
    height: 8rpx;
    border-radius: 999rpx;
    background: var(--color-border);
    margin: 0 auto 18rpx;
}

.habit-detail-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20rpx;
}

.habit-detail-hero {
    display: flex;
    align-items: center;
    gap: 18rpx;
}

.habit-detail-icon {
    width: 88rpx;
    height: 88rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-soft, #f8fafc);
    font-size: 54rpx;
}

.habit-detail-copy {
    display: flex;
    flex-direction: column;
}

.habit-detail-name {
    font-size: 40rpx;
    font-weight: 700;
    color: var(--color-text);
}

.habit-detail-sub {
    margin-top: 6rpx;
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.habit-streak-badge {
    padding: 8rpx 24rpx;
    border-radius: 12rpx;
    background: var(--color-surface-soft, #f8fafc);
    font-size: 24rpx;
    font-weight: 800;
}

.habit-detail-stats {
    margin-top: 24rpx;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14rpx;
}

.habit-detail-stat {
    padding: 22rpx 12rpx;
    border-radius: 18rpx;
    background: var(--color-surface-soft, #f8fafc);
    text-align: center;
}

.habit-detail-stat-num {
    display: block;
    font-size: 42rpx;
    font-weight: 700;
    color: var(--color-text);
}

.habit-detail-stat-num.primary {
    color: var(--color-primary);
}

.habit-detail-stat-num.warning {
    color: var(--color-warning);
}

.habit-detail-stat-label {
    display: block;
    margin-top: 6rpx;
    font-size: 20rpx;
    color: var(--color-text-secondary);
}

.habit-detail-note-card {
    margin-top: 20rpx;
    padding: 18rpx 24rpx;
    border-radius: 18rpx;
    background: var(--color-surface-soft, #f8fafc);
    text-align: center;
}

.habit-detail-note-card.primary-mist {
    background: var(--color-primary-soft, #eef2ff);
    text-align: left;
}

.habit-detail-motto {
    display: block;
    font-size: 23rpx;
    line-height: 1.5;
    color: var(--color-text-tertiary);
}

.habit-detail-lines {
    margin-top: 18rpx;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
}

.habit-detail-line {
    font-size: 23rpx;
    line-height: 1.45;
    color: var(--color-text-secondary);
}

.detail-dashed-btn {
    margin-top: 16rpx;
    min-height: 74rpx;
    border-radius: 18rpx;
    border: 3rpx dashed var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 25rpx;
    font-weight: 700;
    background: transparent;
}

.detail-dashed-btn.primary {
    color: var(--color-primary);
}

.detail-dashed-btn.warning {
    color: var(--color-warning);
    border-color: var(--color-warning);
}

.habit-detail-section {
    margin-top: 22rpx;
    padding-top: 18rpx;
    border-top: 1rpx solid var(--color-border-light);
}

.habit-detail-section-title {
    display: block;
    font-size: 24rpx;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 12rpx;
}

.habit-detail-desc {
    display: block;
    font-size: 24rpx;
    line-height: 1.6;
    color: var(--color-text-secondary);
}

.habit-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18rpx;
    padding: 10rpx 0;
}

.habit-detail-label {
    font-size: 22rpx;
    color: var(--color-text-tertiary);
}

.habit-detail-value {
    font-size: 22rpx;
    font-weight: 600;
    color: var(--color-text);
}

.habit-week-strip {
    display: flex;
    gap: 8rpx;
}

.habit-week-day {
    flex: 1;
    min-height: 88rpx;
    border-radius: 16rpx;
    background: var(--color-surface-soft, #f8fafc);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
}

.habit-week-day.checked {
    background: var(--color-primary-mist, #eef2ff);
    border-color: rgba(var(--color-primary-rgb, 99, 102, 241), 0.3);
}

.habit-week-day.today {
    box-shadow: inset 0 0 0 2rpx var(--color-primary, #6366f1);
}

.habit-week-name {
    font-size: 20rpx;
    color: var(--color-text-tertiary);
}

.habit-week-dot {
    min-height: 16rpx;
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16rpx;
    font-weight: 700;
}

.habit-week-date {
    font-size: 18rpx;
    color: var(--color-text-tertiary);
    opacity: 0.72;
}

.habit-detail-actions {
    display: flex;
    gap: 16rpx;
    margin-top: 26rpx;
}

.habit-detail-secondary-actions {
    display: none;
}

.detail-action-btn {
    flex: 1;
    height: 84rpx;
    border: none;
    border-radius: 999rpx;
    font-size: 26rpx;
    font-weight: 700;
    box-sizing: border-box;
}

.detail-action-btn-muted {
    background: var(--color-surface-soft, #f8fafc);
    color: var(--color-text-secondary, #64748b);
    border: 1rpx solid var(--color-border-light);
}

.detail-action-btn-primary,
button.detail-action-btn-primary {
    background: linear-gradient(135deg, var(--color-primary, #6366f1), #8980f0);
    color: #fff;
    box-shadow: var(--shadow-glow);
}

.detail-action-mini {
    height: 70rpx;
    border-radius: 999rpx;
    border: 1rpx solid var(--color-border-light);
    background: var(--color-surface-soft, #f8fafc);
    color: var(--color-text-secondary, #64748b);
    font-size: 24rpx;
    font-weight: 700;
}

.achievement-emoji {
    display: block;
    font-size: 84rpx;
}

.achievement-title {
    display: block;
    margin-top: 18rpx;
    font-size: 38rpx;
    font-weight: 800;
    color: var(--color-text);
}

.achievement-desc {
    display: block;
    margin-top: 16rpx;
    font-size: 26rpx;
    font-weight: 600;
    line-height: 1.5;
    color: var(--color-text);
}

.achievement-copy {
    display: block;
    margin-top: 12rpx;
    font-size: 24rpx;
    line-height: 1.6;
    color: var(--color-text-secondary);
}

.achievement-btn {
    margin-top: 28rpx;
    width: 100%;
    height: 88rpx;
    border: none;
    border-radius: 999rpx;
    background: linear-gradient(135deg, var(--color-primary, #6366f1), #8980f0);
    color: #fff;
    font-size: 28rpx;
    font-weight: 700;
}

/* ---- streak cards ---- */
.streak-cards {
    display: flex;
    gap: 16rpx;
    padding: 16rpx 32rpx 24rpx;
}
.streak-card {
    flex: 1;
    background: var(--color-surface, #ffffff);
    border-radius: 24rpx;
    padding: 20rpx 16rpx;
    border-top: 4rpx solid var(--card-accent, #6366f1);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rpx;
}
.streak-num {
    font-size: 36rpx;
    font-weight: 800;
    color: var(--card-accent, #6366f1);
    line-height: 1.2;
}
.streak-label {
    font-size: 22rpx;
    color: var(--color-text-secondary, #6b7280);
    font-weight: 500;
}
.streak-card:active {
    transform: scale(0.96);
}

/* ---- badge strip ---- */
.badge-strip {
    padding: 0 32rpx 20rpx;
}
.badge-scroll {
    display: flex;
    flex-direction: row;
    white-space: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 4rpx 0;
}
.badge-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
    padding: 12rpx 20rpx;
    margin-right: 12rpx;
    border-radius: 20rpx;
    background: var(--color-surface-soft, #f5f5f7);
    border: 2rpx solid var(--color-border-light, #e5e7eb);
    opacity: 0.45;
    filter: grayscale(1);
    transition: all 0.3s ease;
    flex-shrink: 0;
}
.badge-item.unlocked {
    opacity: 1;
    filter: grayscale(0);
    border-color: var(--color-primary, #6366f1);
    background: var(--color-surface, #ffffff);
    box-shadow: 0 2rpx 8rpx rgba(99, 102, 241, 0.12);
}
.badge-icon {
    font-size: 32rpx;
    line-height: 1;
}
.badge-days {
    font-size: 20rpx;
    font-weight: 600;
    color: var(--color-text-secondary, #6b7280);
}
.badge-item.unlocked .badge-days {
    color: var(--color-primary, #6366f1);
}

/* ---- g-note ---- */
.g-note {
    display: flex;
    align-items: flex-start;
    gap: 6rpx;
    margin: -2rpx 0 8rpx;
    padding: 8rpx 12rpx;
    background: var(--color-surface-soft, #f5f5f7);
    border-radius: 8rpx;
}
.g-note-icon {
    font-size: 22rpx;
    flex-shrink: 0;
    margin-top: 2rpx;
}
.g-note-text {
    font-size: 22rpx;
    color: var(--color-text-secondary, #6b7280);
    line-height: 1.5;
    flex: 1;
    word-break: break-all;
}

/* ---- popCheck animation ---- */
.checkin-btn.checked {
    animation: popCheck 0.4s cubic-bezier(.34,1.56,.64,1);
}
@keyframes popCheck {
    0% { transform: scale(1); }
    40% { transform: scale(1.3); }
    70% { transform: scale(0.92); }
    100% { transform: scale(1); }
}
</style>
