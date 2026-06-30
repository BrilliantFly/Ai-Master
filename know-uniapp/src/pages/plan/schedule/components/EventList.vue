<template>
    <view class="event-list">
        <!-- 日期标题 -->
        <view class="day-section" v-if="selectedDateLabel">
            <view class="day-header">
                <text class="day-label">{{ selectedDateLabel }} 的日程</text>
                <text class="day-count" v-if="filteredEvents.length"
                    >{{ filteredEvents.length }}项</text
                >
            </view>

            <!-- 四象限筛选 -->
            <scroll-view scroll-x class="filter-scroll" show-scrollbar="false">
                <view class="filter-list">
                    <view
                        v-for="q in quadrants"
                        :key="q.value"
                        class="filter-pill"
                        :class="{ active: currentQuadrant === q.value }"
                        @tap="$emit('quadrantChange', q.value)"
                    >
                        <view class="pill-dot" :style="{ background: q.color }"></view>
                        <text>{{ q.label }}</text>
                    </view>
                </view>
            </scroll-view>
        </view>

        <!-- 空状态 -->
        <view v-if="filteredEvents.length === 0 && selectedDateLabel" class="empty-state">
            <text class="empty-icon">📅</text>
            <text class="empty-text">{{
                currentQuadrant === 0 ? '该日暂无日程' : '该象限暂无日程'
            }}</text>
        </view>

        <!-- 日程卡片（左滑操作） -->
        <view
            v-for="item in filteredEvents"
            :key="'sched-' + item.id + '-' + renderKey"
            class="swipe-wrap"
        >
            <!-- 操作按钮（左滑后露出） -->
            <view class="swipe-actions">
                <view class="swipe-btn swipe-btn-done" @tap.stop="onSwipeAction('done', item)">
                    <text class="swipe-btn-icon">✓</text>
                    <text class="swipe-btn-label">完成</text>
                </view>
                <view class="swipe-btn swipe-btn-delete" @tap.stop="onSwipeAction('delete', item)">
                    <text class="swipe-btn-icon">✕</text>
                    <text class="swipe-btn-label">删除</text>
                </view>
            </view>

            <!-- 卡片内容 -->
            <view
                class="swipe-content"
                :style="swipeStyle(item.id)"
                @touchstart="onTouchStart($event, item.id)"
                @touchmove="onTouchMove($event, item.id)"
                @touchend="onTouchEnd($event, item.id)"
                @tap="onCardTap(item)"
            >
                <view class="schedule-card" :class="{ completed: completedMap[item.id] }">
                    <view class="check-col">
                        <view
                            class="check-circle"
                            :class="{ checked: completedMap[item.id] }"
                            @tap.stop="$emit('check', item)"
                        >
                            <text v-if="completedMap[item.id]">✓</text>
                        </view>
                    </view>
                    <view class="timeline-col">
                        <text class="time-text">{{ formatTime(item.startTime) }}</text>
                        <text class="time-text end">{{ formatTime(item.endTime) }}</text>
                        <view class="time-line"></view>
                    </view>
                    <view class="content-col">
                        <view class="content-title">
                            <text>{{ item.title }}</text>
                            <text
                                class="quadrant-tag"
                                :style="{
                                    background: getQuadrantColor(item.quadrant) + '22',
                                    color: getQuadrantColor(item.quadrant)
                                }"
                            >
                                {{ getQuadrantLabel(item.quadrant) }}
                            </text>
                            <text v-if="item.isRepeat && item.repeatType" class="meta-repeat">{{
                                repeatIconMap[item.repeatType]
                            }}</text>
                        </view>
                        <view class="content-meta" v-if="item.location || item.categoryName">
                            <text v-if="item.location" class="content-meta-tag"
                                >📍 {{ item.location }}</text
                            >
                            <text v-if="item.categoryName" class="content-meta-tag">{{
                                item.categoryName
                            }}</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { QUADRANT_COLORS, quadrantColor } from '@/components/calendar-grid/calendar-utils.js'

const props = defineProps({
    selectedDateLabel: { type: String, default: '' },
    filteredEvents: { type: Array, default: () => [] },
    completedMap: { type: Object, default: () => ({}) },
    currentQuadrant: { type: Number, default: 0 },
    renderKey: { type: Number, default: 0 },
    quadrants: { type: Array, default: () => [] }
})

const emit = defineEmits(['check', 'quadrantChange', 'goDetail', 'delete'])

const QUADRANT_LABELS = {
    1: '重要紧急',
    2: '重要不紧急',
    3: '紧急不重要',
    4: '不紧急不重要'
}

const REPEAT_ICON = {
    1: '🔄',
    2: '🔄',
    3: '🔄',
    4: '🔄'
}

const formatTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const getQuadrantColor = (q) => quadrantColor(q)
const getQuadrantLabel = (q) => QUADRANT_LABELS[q] || ''
const repeatIconMap = REPEAT_ICON

// ===== 左滑逻辑 =====
const SWIPE_THRESHOLD = 50 // 超过此距离触发
const SWIPE_MAX = 140 // 最大滑动距离（两按钮宽度）

// 每个项的滑动偏移量
const offsets = ref({})

// 当前打开项
const openId = ref(null)

const onTouchStart = (e, id) => {
    const touch = e.touches[0]
    if (openId.value !== null && openId.value !== id) {
        closeSwipe(openId.value)
    }
    // 记录起始位置
    offsets.value[id] = {
        startX: touch.clientX,
        currentX: touch.clientX,
        translateX: openId.value === id ? -SWIPE_MAX : 0
    }
}

const onTouchMove = (e, id) => {
    const data = offsets.value[id]
    if (!data) return
    const touch = e.touches[0]
    const delta = touch.clientX - data.startX

    // 只允许左滑（delta < 0）
    if (delta > 0 && data.translateX >= 0) {
        data.translateX = 0
        return
    }

    let targetX = data.translateX + (touch.clientX - data.currentX)
    // 限制范围：-SWIPE_MAX ~ 0
    targetX = Math.max(-SWIPE_MAX, Math.min(0, targetX))
    data.translateX = targetX
    data.currentX = touch.clientX
}

const onTouchEnd = (e, id) => {
    const data = offsets.value[id]
    if (!data) return

    const absTranslate = Math.abs(data.translateX)

    if (absTranslate > SWIPE_THRESHOLD) {
        // 超过阈值 → 打开
        openId.value = id
        // 弹到最大位置
        data.translateX = -SWIPE_MAX
    } else {
        // 未超过阈值 → 关闭
        data.translateX = 0
        if (openId.value === id) {
            openId.value = null
        }
    }
}

const closeSwipe = (id) => {
    if (offsets.value[id]) {
        offsets.value[id].translateX = 0
    }
    if (openId.value === id) {
        openId.value = null
    }
}

const swipeStyle = (id) => {
    const data = offsets.value[id]
    const x = data ? data.translateX : openId.value === id ? -SWIPE_MAX : 0
    // 用 transition 让回弹平滑
    return `transform: translateX(${x}px); transition: transform 0.25s cubic-bezier(.22,1,.36,1);`
}

const onCardTap = (item) => {
    if (openId.value === item.id) {
        closeSwipe(item.id)
        return
    }
    // 关闭其他打开的
    if (openId.value !== null) {
        closeSwipe(openId.value)
    }
    emit('goDetail', item)
}

const onSwipeAction = (action, item) => {
    if (action === 'done') {
        emit('check', item)
    } else if (action === 'delete') {
        emit('delete', item)
    }
    closeSwipe(item.id)
}
</script>

<style scoped>
.day-section {
    padding: 0 20px;
}
.day-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0 12px;
}
.day-label {
    font-size: 17px;
    font-weight: 600;
    color: var(--color-text, #1d1d1f);
}
.day-count {
    font-size: 12px;
    color: var(--color-text-secondary, #8e8e93);
    background: var(--color-bg, #f5f5f7);
    padding: 2px 12px;
    border-radius: 10px;
}

/* 四象限筛选 */
.filter-scroll {
    margin-bottom: 12px;
}
.filter-list {
    display: flex;
    gap: 8px;
}
.filter-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 16px;
    border-radius: 20px;
    background: var(--color-bg, #f5f5f7);
    font-size: 12px;
    color: var(--color-text-secondary, #8e8e93);
    white-space: nowrap;
    flex-shrink: 0;
}
.filter-pill.active {
    background: var(--color-primary-mist, #f5f3ff);
    color: var(--color-primary, #ff8700);
    font-weight: 500;
}
.pill-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 0;
}
.empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
}
.empty-text {
    font-size: 14px;
    color: var(--color-text-secondary, #8e8e93);
}

/* ===== 左滑容器 ===== */
.swipe-wrap {
    position: relative;
    margin: 0 20px 10px;
    overflow: hidden;
    border-radius: 14px;
}

.swipe-actions {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: row;
    z-index: 1;
}

.swipe-btn {
    width: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    cursor: pointer;
    transition: opacity 0.2s;
}
.swipe-btn:active {
    opacity: 0.85;
}

.swipe-btn-done {
    background: var(--color-primary, #ff8700);
    color: #fff;
}

.swipe-btn-delete {
    background: var(--color-danger, #ff3b30);
    color: #fff;
}

.swipe-btn-icon {
    font-size: 18px;
    line-height: 1;
}

.swipe-btn-label {
    font-size: 11px;
    font-weight: 500;
}

/* 卡片内容（可滑出） */
.swipe-content {
    position: relative;
    z-index: 2;
    background: var(--color-surface, #fff);
    will-change: transform;
}

/* 日程卡片 */
.schedule-card {
    display: flex;
    gap: 14px;
    background: var(--color-surface, #fff);
    border-radius: 14px;
    padding: 16px 16px 15px;
    border: 1px solid var(--color-border-light, #f2f2f7);
    align-items: flex-start;
}
.schedule-card.completed {
    opacity: 0.6;
}

.check-col {
    display: flex;
    align-items: flex-start;
    padding-top: 4px;
}
.check-circle {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid var(--color-border-light, #d1d1d6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: transparent;
    flex-shrink: 0;
}
.check-circle.checked {
    background: var(--color-primary, #ff8700);
    border-color: var(--color-primary, #ff8700);
    color: #fff;
}

.timeline-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 50px;
    flex-shrink: 0;
}
.time-text {
    font-size: 12px;
    color: var(--color-text, #1d1d1f);
    font-weight: 700;
    line-height: 1.1;
}
.time-text.end {
    margin-top: 3px;
    font-size: 10px;
    color: var(--color-text-tertiary, #8e8e93);
    font-weight: 500;
}
.time-line {
    width: 1px;
    background: linear-gradient(180deg, rgba(255, 135, 0, 0.28), rgba(255, 135, 0, 0.04));
    margin: 6px 0 0;
    min-height: 48px;
}

.content-col {
    flex: 1;
    min-width: 0;
    padding-top: 1px;
}
.content-title {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text, #1d1d1f);
}
.quadrant-tag {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 999px;
    white-space: nowrap;
}
.meta-repeat {
    font-size: 12px;
}
.content-meta {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;
}
.content-meta-tag {
    font-size: 11px;
    color: var(--color-text-secondary, #8e8e93);
    background: var(--color-bg, #f5f5f7);
    padding: 2px 8px;
    border-radius: 4px;
}
</style>
