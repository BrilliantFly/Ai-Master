<template>
    <view class="cal-card">
        <view class="cal-nav">
            <view class="nav-left">
                <text class="nav-arrow" @tap="prevMonth">◀</text>
                <text class="nav-title">{{ year }} / {{ String(month).padStart(2, '0') }}</text>
                <text class="nav-arrow" @tap="nextMonth">▶</text>
            </view>
            <view class="nav-right">
                <text class="today-btn" @tap="goToday">今天</text>
                <text class="collapse-btn" @tap="$emit('toggleCollapse')">{{
                    collapsed ? '展开' : '收起'
                }}</text>
            </view>
        </view>

        <view v-if="collapsed" class="cal-week-row">
            <view
                v-for="day in currentWeek"
                :key="day.date"
                class="week-day"
                :class="{
                    'is-today': day.isToday,
                    'is-selected': day.date === selectedDate,
                    'other-month': !day.isCurrentMonth
                }"
                @tap="tapDate(day.date)"
            >
                <text class="wd-label">{{ day.weekLabel }}</text>
                <text class="wd-num">{{ day.day }}</text>
                <text
                    v-if="day.festivalTag"
                    class="wd-festival-tag"
                    :class="{ rest: day.festivalTag === '休', work: day.festivalTag === '班' }"
                    >{{ day.festivalTag }}</text
                >
                <text v-if="day.primarySubLabel" class="wd-sub primary">{{
                    day.primarySubLabel
                }}</text>
                <text v-if="day.secondarySubLabel" class="wd-sub secondary">{{
                    day.secondarySubLabel
                }}</text>
                <view class="wd-dots" v-if="day.marked || (day.events && day.events.length)">
                    <view class="wd-dot" v-if="day.marked"></view>
                    <view
                        v-for="(evt, ei) in (day.events || []).slice(0, 2)"
                        :key="ei"
                        class="wd-dot q"
                        :style="{ background: quadrantColor(evt.quadrant) }"
                    ></view>
                </view>
            </view>
        </view>

        <view class="cal-summary">
            <text class="cs-main"
                >{{ summaryInfo.prefix }} {{ summaryInfo.weekday }} · {{ summaryInfo.month }}/{{
                    summaryInfo.day
                }}</text
            >
            <text class="cs-sub">{{ eventCount }} 项日程</text>
        </view>

        <view v-if="!collapsed" class="cal-body-expand">
            <view class="cal-weekdays">
                <text v-for="w in weekHeaders" :key="w" class="wd-header">{{ w }}</text>
            </view>
            <view class="cal-grid">
                <view v-for="(week, wi) in weeks" :key="wi" class="cal-week">
                    <view
                        v-for="day in week"
                        :key="day.date"
                        class="cal-day"
                        :class="{
                            'other-month': !day.isCurrentMonth,
                            'is-today': day.isToday,
                            'is-selected': day.date === selectedDate,
                            'is-holiday': day.isHoliday,
                            'is-workday': day.isWorkday,
                            'is-rich': day.hasRichLabel
                        }"
                        @tap="tapDate(day.date)"
                    >
                        <view class="day-top">
                            <text class="day-num">{{ day.day }}</text>
                            <text v-if="day.events && day.events.length" class="day-cnt">{{
                                day.events.length
                            }}</text>
                        </view>
                        <text
                            v-if="day.festivalTag"
                            class="day-festival-tag"
                            :class="{
                                rest: day.festivalTag === '休',
                                work: day.festivalTag === '班'
                            }"
                            >{{ day.festivalTag }}</text
                        >
                        <text
                            v-if="day.primarySubLabel"
                            class="day-primary"
                            :class="{
                                holiday: day.isHoliday,
                                term: day.isTerm && !day.holidayName && !day.festivalName
                            }"
                            >{{ day.primarySubLabel }}</text
                        >
                        <text v-if="day.secondarySubLabel" class="day-secondary">{{
                            day.secondarySubLabel
                        }}</text>
                        <view v-if="day.marked" class="day-dots">
                            <view class="mark-dot"></view>
                        </view>
                        <view v-if="day.events && day.events.length" class="day-dots">
                            <view
                                v-for="(evt, ei) in day.events.slice(0, 3)"
                                :key="ei"
                                class="event-dot"
                                :class="{ done: evt.status === 1 }"
                                :style="{ background: quadrantColor(evt.quadrant) }"
                            ></view>
                            <text v-if="day.events.length > 3" class="more-dots"
                                >+{{ day.events.length - 3 }}</text
                            >
                        </view>
                    </view>
                </view>
            </view>

            <view v-if="monthlyStats.total > 0" class="month-progress">
                <text class="mp-label">本月完成率</text>
                <text class="mp-value">{{ monthlyStats.rate }}%</text>
                <view class="mp-bar">
                    <view class="mp-fill" :style="{ width: monthlyStats.rate + '%' }"></view>
                </view>
                <text class="mp-count">{{ monthlyStats.completed }}/{{ monthlyStats.total }}</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    weeks: { type: Array, default: () => [] },
    currentWeekDays: { type: Array, default: () => [] },
    monthlyStats: { type: Object, default: () => ({ total: 0, completed: 0, rate: 0 }) },
    collapsed: { type: Boolean, default: false },
    selectedDate: { type: String, default: '' },
    summaryDate: { type: String, default: '' },
    eventCount: { type: Number, default: 0 },
    quadrantColor: { type: Function, default: () => '#999' }
})

const emit = defineEmits(['dateTap', 'monthSwitch', 'toggleCollapse'])

const weekHeaders = ['日', '一', '二', '三', '四', '五', '六']

const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate()
    ).padStart(2, '0')}`
}

const summaryInfo = computed(() => {
    const baseDate = props.summaryDate || props.selectedDate || formatDate(new Date())
    const d = new Date(baseDate)
    const today = formatDate(new Date())
    return {
        prefix: baseDate === today ? '今天' : '已选',
        weekday: weekHeaders[d.getDay()],
        month: d.getMonth() + 1,
        day: d.getDate()
    }
})

const currentWeek = computed(() => {
    if (!props.weeks.length) return []
    const today = new Date()
    const todayStr = formatDate(today)
    const targetStr = props.selectedDate || todayStr
    for (const week of props.weeks) {
        for (const day of week) {
            if (day.date === targetStr) {
                return week.map((item, index) => ({
                    ...item,
                    weekLabel: weekHeaders[index]
                }))
            }
        }
    }
    return (props.weeks[0] || []).map((item, index) => ({
        ...item,
        weekLabel: weekHeaders[index]
    }))
})

const prevMonth = () => {
    let y = props.year
    let m = props.month - 1
    if (m < 1) {
        m = 12
        y--
    }
    emit('monthSwitch', y, m)
}

const nextMonth = () => {
    let y = props.year
    let m = props.month + 1
    if (m > 12) {
        m = 1
        y++
    }
    emit('monthSwitch', y, m)
}

const goToday = () => {
    const now = new Date()
    const today = formatDate(now)
    if (props.year === now.getFullYear() && props.month === now.getMonth() + 1) {
        emit('dateTap', today)
        return
    }
    emit('monthSwitch', now.getFullYear(), now.getMonth() + 1, today)
}

const tapDate = (dateStr) => {
    emit('dateTap', dateStr)
}
</script>

<style scoped>
.cal-card {
    background: var(--color-surface, #fff);
    border-radius: 14px;
    padding: 12px 8px 8px;
    margin: 0 16px 8px;
    box-shadow: var(--shadow-sm);
}

.cal-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px 10px;
}

.nav-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.nav-arrow {
    font-size: 14px;
    color: var(--color-primary, #ff8700);
    padding: 4px 6px;
}

.nav-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text, #1d1d1f);
}

.nav-right {
    display: flex;
    align-items: center;
    gap: 6px;
}

.today-btn {
    font-size: 12px;
    color: var(--color-primary, #ff8700);
    background: var(--color-primary-mist, #fff0e0);
    padding: 3px 10px;
    border-radius: 12px;
}

.collapse-btn {
    font-size: 12px;
    color: var(--color-text-secondary, #8e8e93);
    padding: 3px 6px;
}

.cal-weekdays {
    display: flex;
}

.wd-header {
    flex: 1;
    text-align: center;
    font-size: 11px;
    color: var(--color-text-secondary, #8e8e93);
    padding: 4px 0 8px;
}

.cal-grid {
}

.cal-week {
    display: flex;
}

.cal-day {
    flex: 1;
    min-height: 72px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 0 6px;
    position: relative;
    border-radius: 8px;
    overflow: visible;
}

.cal-day.is-rich {
    min-height: 78px;
}

.cal-day.is-selected {
    background: var(--color-primary-mist, #fff5eb);
}

.cal-day.other-month .day-num {
    color: var(--color-text-tertiary, #d1d1d6);
}

.cal-day.is-today .day-num {
    background: var(--color-primary, #ff8700);
    color: #fff;
    width: 26px;
    height: 26px;
    line-height: 26px;
    border-radius: 50%;
    font-weight: 700;
}

.cal-day.is-today.is-selected .day-num {
    background: var(--color-primary, #ff8700);
    color: #fff;
}

.cal-day.is-holiday .day-num {
    color: var(--color-danger, #ff3b30);
}

.cal-day.is-selected.is-holiday .day-num {
    color: var(--color-primary, #ff8700);
    font-weight: 600;
}

.cal-day.is-workday .day-num {
    color: var(--color-text-secondary, #8e8e93);
    text-decoration: underline;
}

.day-num {
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    line-height: 1.2;
}

.day-top {
    display: flex;
    align-items: center;
    gap: 2px;
}

.day-cnt {
    font-size: 9px;
    font-weight: 600;
    color: var(--color-primary, #ff8700);
    background: var(--color-primary-mist, #fff0e0);
    min-width: 16px;
    height: 15px;
    line-height: 15px;
    text-align: center;
    border-radius: 7px;
    padding: 0 4px;
    flex-shrink: 0;
}

.day-primary,
.day-secondary {
    max-width: 100%;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.day-primary {
    margin-top: 2px;
    font-size: 9px;
    color: var(--color-text-secondary, #8e8e93);
    max-width: 92%;
}

.day-primary.holiday {
    color: var(--color-danger, #ff3b30);
}

.day-primary.term {
    color: #5ac8a0;
}

.day-secondary {
    margin-top: 1px;
    font-size: 8px;
    color: var(--color-text-tertiary, #c7c7cc);
    max-width: 88%;
}

.day-festival-tag {
    position: absolute;
    top: 1px;
    right: 2px;
    font-size: 8px;
    font-weight: 600;
    padding: 0 3px;
    border-radius: 3px;
    line-height: 1.4;
    z-index: 1;
}

.day-festival-tag.rest {
    background: #c7f0c7;
    color: #1a7a1a;
}

.day-festival-tag.work {
    background: #ff3b30;
    color: #fff;
}

.day-dots {
    display: flex;
    justify-content: center;
    gap: 2px;
    flex-wrap: wrap;
    min-height: 10px;
    margin-top: auto;
    padding-top: 4px;
}

.event-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
}

.event-dot.done {
    opacity: 0.35;
}

.more-dots {
    font-size: 8px;
    color: var(--color-text-secondary, #8e8e93);
}

.mark-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--color-text-tertiary, #c7c7cc);
}

.cal-body-expand {
    overflow: hidden;
    animation: calExpandIn 0.24s ease;
}

@keyframes calExpandIn {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.cal-week-row {
    display: flex;
    padding: 6px 4px 2px;
}

.week-day {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 10px 2px 8px;
    border-radius: 10px;
    position: relative;
}

.week-day.is-today {
    background: var(--color-primary-mist, #fff0e0);
}

.week-day.is-selected {
    box-shadow: inset 0 0 0 1px rgba(255, 135, 0, 0.18);
}

.week-day.other-month .wd-num {
    color: var(--color-text-tertiary, #d1d1d6);
}

.week-day .wd-num {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text, #1d1d1f);
    line-height: 1.2;
}

.week-day .wd-label {
    font-size: 10px;
    color: var(--color-text-secondary, #8e8e93);
}

.wd-festival-tag {
    position: absolute;
    top: 0;
    right: 1px;
    font-size: 7px;
    font-weight: 600;
    padding: 0 2px;
    border-radius: 2px;
    line-height: 1.3;
    z-index: 1;
}

.wd-festival-tag.rest {
    background: #c7f0c7;
    color: #1a7a1a;
}

.wd-festival-tag.work {
    background: #ff3b30;
    color: #fff;
}

.wd-sub {
    font-size: 8px;
    color: var(--color-text-tertiary, #c7c7cc);
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 90%;
}

.wd-sub.primary {
    color: var(--color-text-secondary, #8e8e93);
    font-weight: 500;
    max-width: 88%;
}

.wd-sub.secondary {
    font-size: 7px;
    max-width: 82%;
}

.wd-dots {
    display: flex;
    justify-content: center;
    gap: 1px;
    flex-wrap: wrap;
    min-height: 8px;
    margin-top: 2px;
}

.wd-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--color-text-tertiary, #c7c7cc);
}

.wd-dot.q {
    width: 4px;
    height: 4px;
}

.cal-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 8px 10px 10px;
}

.cs-main {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text, #1d1d1f);
    flex: 1;
    min-width: 0;
}

.cs-sub {
    font-size: 11px;
    color: var(--color-text-secondary, #8e8e93);
    background: var(--color-bg, #f7f7fc);
    padding: 2px 10px;
    border-radius: 999px;
}

.month-progress {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    margin: 8px 4px 0;
    background: var(--color-bg, #f7f7fc);
    border-radius: 8px;
}

.mp-label {
    font-size: 11px;
    color: var(--color-text-secondary, #8e8e93);
    white-space: nowrap;
}

.mp-value {
    font-size: 11px;
    color: var(--color-success, #34c759);
    font-weight: 600;
    white-space: nowrap;
}

.mp-bar {
    flex: 1;
    height: 4px;
    background: var(--color-border-light, #e5e5ea);
    border-radius: 2px;
    overflow: hidden;
}

.mp-fill {
    height: 100%;
    background: var(--color-success, #34c759);
    border-radius: 2px;
    transition: width 0.3s;
}

.mp-count {
    font-size: 10px;
    color: var(--color-text-secondary, #8e8e93);
    white-space: nowrap;
}
</style>
