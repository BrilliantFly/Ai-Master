<template>
    <view class="schedule-detail-page">
        <view class="detail-header-bar">
            <view class="detail-header-copy">
                <text class="detail-page-title">日程详情</text>
                <text class="detail-page-sub">查看任务状态与时间线</text>
            </view>
        </view>

        <view v-if="loading" class="loading-state">
            <text>加载中...</text>
        </view>

        <template v-else-if="event">
            <view class="hero-card" :style="{ borderTopColor: getQuadrantColor(event.quadrant) }">
                <view class="hero-meta">
                    <text
                        class="hero-tag"
                        :style="{
                            background: getQuadrantColor(event.quadrant) + '22',
                            color: getQuadrantColor(event.quadrant)
                        }"
                    >
                        {{ quadrantLabel(event.quadrant) }}
                    </text>
                    <text class="hero-status" :class="event.status === 1 ? 'done' : 'todo'">
                        {{ event.status === 1 ? '已完成' : '待处理' }}
                    </text>
                </view>
                <text class="hero-title">{{ event.title }}</text>
                <text class="hero-desc">{{ event.content || '这条日程没有补充描述。' }}</text>
            </view>

            <view class="info-grid">
                <view class="info-card premium-card">
                    <text class="info-label">开始时间</text>
                    <text class="info-value">{{ formatDateTime(event.startTime) || '--' }}</text>
                </view>
                <view class="info-card premium-card">
                    <text class="info-label">结束时间</text>
                    <text class="info-value">{{ formatDateTime(event.endTime) || '--' }}</text>
                </view>
            </view>

            <view class="detail-section premium-card">
                <view class="section-title">详情信息</view>
                <view class="detail-row">
                    <text class="label">象限</text>
                    <text class="value">{{ quadrantLabel(event.quadrant) }}</text>
                </view>
                <view class="detail-row" v-if="event.location">
                    <text class="label">地点</text>
                    <text class="value">📍 {{ event.location }}</text>
                </view>
                <view class="detail-row" v-if="event.isRepeat">
                    <text class="label">重复</text>
                    <text class="value">{{ repeatLabel(event.repeatType) }}</text>
                </view>
                <view class="detail-row" v-if="event.priority">
                    <text class="label">优先级</text>
                    <text class="value">{{ priorityLabel(event.priority) }}</text>
                </view>
                <view class="detail-row" v-if="event.categoryId">
                    <text class="label">分类</text>
                    <text class="value">#{{ event.categoryId }}</text>
                </view>
                <view class="detail-row" v-if="event.completedTime">
                    <text class="label">完成时间</text>
                    <text class="value">{{ formatDateTime(event.completedTime) }}</text>
                </view>
            </view>

            <view class="timeline-card premium-card">
                <view class="section-title">时间线</view>
                <view class="timeline-item">
                    <view class="timeline-dot start"></view>
                    <view class="timeline-content">
                        <text class="timeline-name">开始</text>
                        <text class="timeline-time">{{
                            formatDateTime(event.startTime) || '--'
                        }}</text>
                    </view>
                </view>
                <view class="timeline-item" v-if="event.endTime">
                    <view class="timeline-dot end"></view>
                    <view class="timeline-content">
                        <text class="timeline-name">结束</text>
                        <text class="timeline-time">{{ formatDateTime(event.endTime) }}</text>
                    </view>
                </view>
                <view class="timeline-item" v-if="event.completedTime">
                    <view class="timeline-dot done"></view>
                    <view class="timeline-content">
                        <text class="timeline-name">完成</text>
                        <text class="timeline-time">{{ formatDateTime(event.completedTime) }}</text>
                    </view>
                </view>
            </view>

            <view class="detail-action-swipe">
                <view class="detail-swipe-actions">
                    <view
                        v-if="event.status === 0"
                        class="detail-swipe-btn detail-swipe-btn-complete"
                        @tap.stop="onDetailSwipeAction('complete')"
                    >
                        <text class="detail-swipe-label">完成</text>
                    </view>
                    <view
                        class="detail-swipe-btn detail-swipe-btn-delete"
                        @tap.stop="onDetailSwipeAction('delete')"
                    >
                        <text class="detail-swipe-label">删除</text>
                    </view>
                </view>
                <view
                    class="detail-swipe-content premium-card"
                    :style="detailSwipeStyle"
                    @touchstart="onDetailTouchStart"
                    @touchmove="onDetailTouchMove"
                    @touchend="onDetailTouchEnd"
                >
                    <view class="detail-action-copy">
                        <text class="detail-action-title">{{
                            event.status === 1 ? '日程已完成' : '左滑处理日程'
                        }}</text>
                        <text class="detail-action-sub">{{
                            event.status === 1 ? '左滑可删除该日程' : '完成或删除操作会在右侧显示'
                        }}</text>
                    </view>
                    <text class="detail-action-cue">左滑</text>
                </view>
            </view>
        </template>

        <view v-else class="loading-state">
            <text>未找到日程</text>
        </view>
    </view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { completeSchedule, deleteSchedule, getScheduleDetail } from '@/api/plan/schedule'

const event = ref(null)
const loading = ref(true)
const DETAIL_ACTION_WIDTH = 92
const DETAIL_SWIPE_THRESHOLD = 42
const detailSwipe = ref({
    startX: 0,
    currentX: 0,
    translateX: 0
})

const detailActionMax = computed(() =>
    event.value?.status === 0 ? DETAIL_ACTION_WIDTH * 2 : DETAIL_ACTION_WIDTH
)

const closeDetailSwipe = () => {
    detailSwipe.value.translateX = 0
}

const onDetailTouchStart = (e) => {
    const touch = e.touches[0]
    detailSwipe.value.startX = touch.clientX
    detailSwipe.value.currentX = touch.clientX
}

const onDetailTouchMove = (e) => {
    const touch = e.touches[0]
    let targetX = detailSwipe.value.translateX + (touch.clientX - detailSwipe.value.currentX)
    targetX = Math.max(-detailActionMax.value, Math.min(0, targetX))
    detailSwipe.value.translateX = targetX
    detailSwipe.value.currentX = touch.clientX
}

const onDetailTouchEnd = () => {
    if (Math.abs(detailSwipe.value.translateX) > DETAIL_SWIPE_THRESHOLD) {
        detailSwipe.value.translateX = -detailActionMax.value
    } else {
        closeDetailSwipe()
    }
}

const detailSwipeStyle = computed(() => {
    return `transform: translateX(${detailSwipe.value.translateX}px); transition: transform 0.25s cubic-bezier(.22,1,.36,1);`
})

const quadrantLabel = (q) => {
    const labels = {
        1: '重要紧急',
        2: '重要不紧急',
        3: '紧急不重要',
        4: '不紧急不重要'
    }
    return labels[q] || '未分类'
}

const getQuadrantColor = (q) => {
    const colors = {
        1: '#FF6B6B',
        2: '#4ECDC4',
        3: '#FFE66D',
        4: '#95A5A6'
    }
    return colors[q] || '#999999'
}

const repeatLabel = (repeatType) => {
    return ['不重复', '每天', '每周', '每月', '每年'][repeatType] || '重复'
}

const priorityLabel = (priority) => {
    return ['低', '中', '高'][priority - 1] || '中'
}

const formatDateTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
    ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
        2,
        '0'
    )}`
}

const fetchDetail = async (id) => {
    try {
        const res = await getScheduleDetail(id)
        event.value = res || null
    } catch (error) {
        console.error('获取详情失败', error)
    } finally {
        loading.value = false
    }
}

const handleComplete = async () => {
    if (!event.value) return
    try {
        await completeSchedule(event.value.id, {})
        uni.showToast({ title: '已完成', icon: 'success' })
        event.value.status = 1
        event.value.completedTime = Date.now()
        closeDetailSwipe()
    } catch (error) {
        console.error(error)
    }
}

const handleDelete = async () => {
    if (!event.value) return
    try {
        await deleteSchedule(event.value.id)
        uni.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 500)
    } catch (error) {
        console.error(error)
    }
}

const onDetailSwipeAction = (action) => {
    if (action === 'complete') {
        handleComplete()
        return
    }
    if (action === 'delete') {
        handleDelete()
    }
}

onMounted(() => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const id = currentPage.$page?.options?.id || currentPage.options?.id
    if (id) {
        fetchDetail(id)
    } else {
        loading.value = false
    }
})
</script>

<style scoped lang="scss">
.schedule-detail-page {
    min-height: 100vh;
    background: var(--color-bg-app);
    padding: 24rpx 24rpx 40rpx;
}

.detail-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20rpx;
    margin-bottom: 18rpx;
}

.detail-header-copy {
    display: flex;
    flex-direction: column;
}

.detail-page-title {
    font-size: 42rpx;
    font-weight: 700;
    color: var(--color-text);
}

.detail-page-sub {
    margin-top: 8rpx;
    font-size: 24rpx;
    color: var(--color-text-secondary);
}

.loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 160rpx 0;
    font-size: 28rpx;
    color: var(--color-text-tertiary);
}

.hero-card {
    background: var(--color-surface);
    border-radius: 24rpx;
    padding: 32rpx 30rpx;
    border-top: 8rpx solid var(--color-primary);
    box-shadow: var(--shadow-sm);
}

.hero-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
}

.hero-tag {
    font-size: 22rpx;
    padding: 6rpx 18rpx;
    border-radius: 999rpx;
}

.hero-status {
    font-size: 24rpx;
    font-weight: 600;
}

.hero-status.todo {
    color: var(--color-danger);
}

.hero-status.done {
    color: var(--color-success);
}

.hero-title {
    display: block;
    margin-top: 18rpx;
    font-size: 40rpx;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.35;
}

.hero-desc {
    display: block;
    margin-top: 14rpx;
    font-size: 26rpx;
    line-height: 1.7;
    color: var(--color-text-secondary);
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18rpx;
    margin-top: 20rpx;
}

.info-card {
    padding: 24rpx;
}

.info-label {
    display: block;
    font-size: 22rpx;
    color: var(--color-text-tertiary);
}

.info-value {
    display: block;
    margin-top: 10rpx;
    font-size: 28rpx;
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.5;
}

.detail-section,
.timeline-card {
    margin-top: 20rpx;
    padding: 28rpx 28rpx 16rpx;
}

.section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 12rpx;
}

.detail-row {
    display: flex;
    padding: 18rpx 0;
    border-bottom: 1rpx solid var(--color-border-light);
}

.detail-row:last-child {
    border-bottom: none;
}

.label {
    width: 150rpx;
    flex-shrink: 0;
    font-size: 26rpx;
    color: var(--color-text-tertiary);
}

.value {
    flex: 1;
    font-size: 26rpx;
    color: var(--color-text);
    line-height: 1.6;
}

.timeline-item {
    display: flex;
    align-items: flex-start;
    gap: 18rpx;
    padding: 14rpx 0;
}

.timeline-dot {
    width: 18rpx;
    height: 18rpx;
    border-radius: 50%;
    margin-top: 8rpx;
    flex-shrink: 0;
}

.timeline-dot.start {
    background: var(--color-primary);
}

.timeline-dot.end {
    background: #5ac8a0;
}

.timeline-dot.done {
    background: var(--color-success);
}

.timeline-content {
    display: flex;
    flex-direction: column;
}

.timeline-name {
    font-size: 24rpx;
    color: var(--color-text-secondary);
}

.timeline-time {
    margin-top: 6rpx;
    font-size: 26rpx;
    font-weight: 600;
    color: var(--color-text);
}

.detail-action-swipe {
    position: relative;
    margin-top: 20rpx;
    border-radius: 24rpx;
    overflow: hidden;
}

.detail-swipe-actions {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    display: flex;
}

.detail-swipe-btn {
    width: 92px;
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
}

.detail-swipe-btn-complete {
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
}

.detail-swipe-btn-delete {
    background: linear-gradient(135deg, var(--color-danger), #ff8f8f);
}

.detail-swipe-label {
    font-size: 26rpx;
    font-weight: 700;
}

.detail-swipe-content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24rpx;
    padding: 26rpx 28rpx;
    background: var(--color-surface);
    will-change: transform;
}

.detail-action-copy {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.detail-action-title {
    font-size: 28rpx;
    font-weight: 700;
    color: var(--color-text);
}

.detail-action-sub {
    font-size: 23rpx;
    color: var(--color-text-tertiary);
}

.detail-action-cue {
    flex-shrink: 0;
    font-size: 22rpx;
    color: var(--color-primary);
    background: var(--color-primary-soft);
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
}
</style>
