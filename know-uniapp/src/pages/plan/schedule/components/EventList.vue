<template>
    <view class="event-list">
        <!-- 日期标题 -->
        <view class="day-section premium-fade-in premium-d2" v-if="selectedDateLabel">
            <view class="day-header">
                <text class="day-label">{{ selectedDateLabel }} 的日程</text>
                <text class="day-count" v-if="filteredEvents.length"
                    >{{ filteredEvents.length }}项</text
                >
            </view>

            <!-- 四象限筛选 -->
            <scroll-view
                scroll-x
                class="filter-scroll premium-fade-in premium-d3"
                show-scrollbar="false"
            >
                <view class="filter-list">
                    <view
                        v-for="q in quadrants"
                        :key="q.value"
                        class="filter-pill"
                        :class="{ active: currentQuadrant === q.value }"
                        :style="
                            currentQuadrant === q.value
                                ? { background: q.color + '26', color: q.color }
                                : {}
                        "
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
                <view class="swipe-action action-done" @tap.stop="onSwipeAction('done', item)">
                    <text class="sa-icon">{{ completedMap[item.id] ? '↩' : '✓' }}</text>
                    <text class="sa-label">{{ completedMap[item.id] ? '取消' : '完成' }}</text>
                </view>
                <view class="swipe-action action-edit" @tap.stop="onSwipeAction('edit', item)">
                    <text class="sa-icon">✏️</text>
                    <text class="sa-label">编辑</text>
                </view>
                <view class="swipe-action action-delete" @tap.stop="onSwipeAction('delete', item)">
                    <text class="sa-icon">🗑</text>
                    <text class="sa-label">删除</text>
                </view>
            </view>

            <!-- 卡片内容 -->
            <view
                class="swipe-content"
                :data-swipe-id="item.id"
                :style="swipeStyle(item.id)"
                @touchstart="onTouchStart($event, item.id)"
                @touchmove="onTouchMove($event, item.id)"
                @touchend="onTouchEnd($event, item.id)"
                @touchcancel="onTouchCancel($event, item.id)"
                @tap="onCardTap(item)"
            >
                <view class="s-card premium-hover-lift" :class="{ done: completedMap[item.id] }">
                    <view
                        class="quadrant-bar"
                        :style="{ background: getQuadrantColor(item.quadrant) }"
                    ></view>
                    <view class="time-col">
                        <text class="t">{{ formatTime(item.startTime) }}</text>
                        <text v-if="item.endTime" class="t sub">{{
                            formatTime(item.endTime)
                        }}</text>
                    </view>
                    <view class="content">
                        <view class="ctitle">
                            <text>{{ item.title }}</text>
                            <text v-if="item.categoryName" class="tag">{{
                                item.categoryName
                            }}</text>
                        </view>
                        <view
                            v-if="
                                item.location ||
                                item.description ||
                                (item.subtasks && item.subtasks.length) ||
                                (item.progress !== undefined && item.progress !== null)
                            "
                            class="meta-row"
                        >
                            <text v-if="item.location" class="m-item">📍 {{ item.location }}</text>
                            <text v-if="item.tags && item.tags.length" class="m-item"
                                ># {{ item.tags.join(', ') }}</text
                            >
                        </view>
                        <view v-if="item.subtasks && item.subtasks.length" class="st-row">
                            <text
                                v-for="(st, stIdx) in item.subtasks"
                                :key="stIdx"
                                class="st-item"
                                :class="{ done: st.done }"
                            >
                                {{ st.done ? '●' : '○' }} {{ st.text || st }}
                            </text>
                            <text v-if="item.subtasks.length > 3" class="st-item"
                                >{{ item.subtasks.filter((s) => s.done).length }}/{{
                                    item.subtasks.length
                                }}</text
                            >
                        </view>
                        <text v-if="item.description" class="cdesc">{{ item.description }}</text>
                        <view
                            v-if="item.progress !== undefined && item.progress !== null"
                            class="progress-micro"
                        >
                            <view class="pm-fill" :style="{ width: item.progress + '%' }"></view>
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
import { useHoverEffect } from '@/hooks/useHoverEffect'

useHoverEffect('.filter-pill,.s-card')

const props = defineProps({
    selectedDateLabel: { type: String, default: '' },
    filteredEvents: { type: Array, default: () => [] },
    completedMap: { type: Object, default: () => ({}) },
    currentQuadrant: { type: Number, default: 0 },
    renderKey: { type: Number, default: 0 },
    quadrants: { type: Array, default: () => [] }
})

const emit = defineEmits(['check', 'quadrantChange', 'goDetail', 'delete', 'edit'])

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
const SWIPE_MAX = 216 // 最大滑动距离（三按钮宽度 72*3）

// 使用 ref({}) — 与打卡页面左滑实现一致的工作模式
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
        translateX: openId.value === id ? -SWIPE_MAX : 0,
        wasSwiped: false
    }
}

const onTouchMove = (e, id) => {
    const data = offsets.value[id]
    if (!data) return
    const touch = e.touches[0]
    const delta = touch.clientX - data.startX

    data.wasSwiped = true

    // 只允许左滑（delta < 0），不允许右拉
    if (delta > 0 && data.translateX >= 0) {
        return
    }

    let targetX = data.translateX + (touch.clientX - data.currentX)
    targetX = Math.max(-SWIPE_MAX, Math.min(0, targetX))
    data.translateX = targetX
    data.currentX = touch.clientX

    // 直接操作 DOM — 绕过 scroll-view 内的 Vue 渲染节流
    const el =
        typeof document !== 'undefined' ? document.querySelector(`[data-swipe-id="${id}"]`) : null
    if (el) {
        el.style.transform = `translateX(${targetX}px)`
        el.style.transition = 'none'
    }
}

const onTouchEnd = (e, id) => {
    const data = offsets.value[id]
    if (!data) return

    const absTranslate = Math.abs(data.translateX)

    // 已打开卡片上轻点（非滑动），关闭左滑并允许 tap 事件导航
    if (!data.wasSwiped && openId.value === id) {
        data.translateX = 0
        openId.value = null
        applySwipeX(id, 0, true)
        return
    }

    if (absTranslate > SWIPE_THRESHOLD) {
        openId.value = id
        data.translateX = -SWIPE_MAX
        applySwipeX(id, -SWIPE_MAX, true)
    } else {
        data.translateX = 0
        if (openId.value === id) {
            openId.value = null
        }
        applySwipeX(id, 0, true)
    }
}

/**
 * 直接操作 DOM 设置 translateX（带 transition）。
 * 这是关键修复：scroll-view 内的 :style 绑定在 uni-app H5 中可能不触发重绘。
 */
const applySwipeX = (id, x, smooth) => {
    const el =
        typeof document !== 'undefined' ? document.querySelector(`[data-swipe-id="${id}"]`) : null
    if (el) {
        el.style.transition = smooth ? 'transform 0.25s cubic-bezier(.22,1,.36,1)' : 'none'
        el.style.transform = `translateX(${x}px)`
    }
}

const onTouchCancel = (e, id) => {
    if (id) applySwipeX(id, 0, false)
}

const closeSwipe = (id) => {
    if (offsets.value[id]) {
        offsets.value[id].translateX = 0
    }
    if (openId.value === id) {
        openId.value = null
    }
    applySwipeX(id, 0, true)
}

const swipeStyle = (id) => {
    const data = offsets.value[id]
    const x = data ? data.translateX : openId.value === id ? -SWIPE_MAX : 0
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
    } else if (action === 'edit') {
        emit('edit', item)
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
    padding: 6px 14px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.04);
    font-size: 12px;
    color: var(--color-text-secondary, #8e8e93);
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
    cursor: pointer;
    transition: color 0.25s ease, background 0.25s ease, transform 0.2s ease;
}
.filter-pill.hover-active {
    background: rgba(0, 0, 0, 0.08);
    color: var(--color-text, #1d1d1f);
}
.filter-pill:active {
    transform: scale(var(--scale-active));
}
.filter-pill.active {
    font-weight: 600;
}
.pill-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

/* ===== s-card (schedule card, ref-aligned) ===== */
.s-card {
    display: flex;
    gap: 10px;
    padding: 14px;
    border-radius: 14px;
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border-light, #e4e7ed);
    cursor: pointer;
    transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 0.2s ease;
    position: relative;
    overflow: hidden;
}

.s-card.hover-active {
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
    border-color: transparent;
}

.s-card:active {
    transform: scale(var(--scale-active));
}

.s-card.done {
    animation: donePop 0.4s ease;
}

@keyframes donePop {
    0% {
        transform: scale(1);
    }
    40% {
        transform: scale(1.04);
    }
    100% {
        transform: scale(1);
    }
}

/* 已完成 */
.s-card.done {
    opacity: 0.65;
}

.s-card.done .ctitle {
    text-decoration: line-through;
    color: var(--color-text-tertiary, #b0b0b5);
}

.s-card.done .time-col .t {
    color: var(--color-success, #34c759);
}

.s-card.done::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(52, 199, 89, 0.06), rgba(52, 199, 89, 0.02));
    pointer-events: none;
}

/* 象限色条 */
.quadrant-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    border-radius: 0 2px 2px 0;
}

/* 时间列 */
.time-col {
    text-align: center;
    min-width: 40px;
    flex-shrink: 0;
}

.time-col .t {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text, #1d1d1f);
}

.time-col .t.sub {
    font-size: 10px;
    font-weight: 400;
    color: var(--color-text-tertiary, #b0b0b5);
}

/* 内容列 */
.content {
    flex: 1;
    min-width: 0;
}

.content .ctitle {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text, #1d1d1f);
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.content .ctitle .tag {
    font-size: 10px;
    padding: 1px 8px;
    border-radius: 4px;
    background: var(--color-primary-soft, rgba(255, 135, 0, 0.12));
    color: var(--color-primary, #ff8700);
    flex-shrink: 0;
}

.content .cdesc {
    font-size: 12px;
    color: var(--color-text-secondary, #8e8e93);
    line-height: 1.4;
    margin-top: 3px;
}

/* 元数据行 */
.meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 3px;
}

.meta-row .m-item {
    font-size: 10px;
    color: var(--color-text-tertiary, #b0b0b5);
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--color-surface-soft, #f5f5f7);
}

/* 子任务行 */
.st-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px dashed var(--color-border-light, rgba(0, 0, 0, 0.06));
}

.st-row .st-item {
    font-size: 11px;
    color: var(--color-text-tertiary, #b0b0b5);
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 1px 8px;
    border-radius: 4px;
    background: var(--color-surface-soft, #f5f5f7);
}

.st-row .st-item.done {
    color: var(--color-success, #34c759);
    background: var(--color-success-soft, rgba(52, 199, 89, 0.1));
}

/* 进度微条 */
.progress-micro {
    height: 3px;
    background: var(--color-border-light, #d1d1d6);
    border-radius: 2px;
    margin-top: 6px;
    overflow: hidden;
}

.progress-micro .pm-fill {
    height: 100%;
    border-radius: 2px;
    background: linear-gradient(135deg, var(--color-primary, #ff8700), #8980f0);
    transition: width 0.3s ease;
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
    margin: 0 20px 8px;
    overflow: hidden;
    border-radius: var(--radius-sm, 8px);
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

.swipe-action {
    width: 72px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;
    color: #fff;
    border: none;
    font-family: inherit;
    letter-spacing: 0.02em;
}
.swipe-action:active {
    filter: brightness(1.12);
    transform: scale(var(--scale-active));
}

.swipe-action.action-done {
    background-image: linear-gradient(135deg, var(--color-success), #4dd499);
}

.swipe-action.action-edit {
    background-image: linear-gradient(135deg, var(--color-primary), #8b8bf0);
}

.swipe-action.action-delete {
    background-image: linear-gradient(135deg, var(--color-danger), #f08080);
}

.swipe-action:last-child {
    border-radius: 0 var(--radius-sm, 8px) var(--radius-sm, 8px) 0;
}

.swipe-action .sa-icon {
    font-size: 20px;
    line-height: 1;
    margin-bottom: 2px;
}

.swipe-action .sa-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
}

/* 卡片内容（可滑出） */
.swipe-content {
    position: relative;
    z-index: 2;
    background: var(--color-surface, #ffffff);
    border-radius: 14px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: box-shadow 0.25s ease, border-color 0.25s ease;
    will-change: transform;
}
.swipe-content:active {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
