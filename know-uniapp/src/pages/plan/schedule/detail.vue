<template>
    <view class="schedule-detail-page">
        <view class="detail-header-bar">
            <view class="detail-header-copy">
                <text class="detail-page-title">日程详情</text>
                <text class="detail-page-sub">保留当前日历不变，只调整详情信息与编辑入口</text>
            </view>
        </view>

        <view v-if="loading" class="loading-state">
            <text>加载中...</text>
        </view>

        <template v-else-if="event">
            <view class="hero-card" :style="{ borderLeftColor: getQuadrantColor(event.quadrant) }">
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

            <view class="summary-card premium-card">
                <view class="summary-chip">
                    <text class="summary-chip-label">状态</text>
                    <text class="summary-chip-value">{{
                        event.status === 1 ? '已完成' : '待处理'
                    }}</text>
                </view>
                <view class="summary-chip">
                    <text class="summary-chip-label">重复</text>
                    <text class="summary-chip-value">{{
                        event.isRepeat ? repeatLabel(event.repeatType) : '不重复'
                    }}</text>
                </view>
                <view class="summary-chip">
                    <text class="summary-chip-label">提醒</text>
                    <text class="summary-chip-value">{{ remindLabel(event.remindMinutes) }}</text>
                </view>
            </view>

            <view class="detail-section premium-card">
                <view class="section-title">详情信息</view>
                <view class="detail-row">
                    <text class="label">象限</text>
                    <text class="value">{{ quadrantLabel(event.quadrant) }}</text>
                </view>
                <view class="detail-row">
                    <text class="label">优先级</text>
                    <text class="value">{{ priorityLabel(event.priority) }}</text>
                </view>
                <view class="detail-row detail-progress-row" v-if="hasProgress">
                    <text class="label">进度</text>
                    <view class="value detail-progress-value">
                        <view class="detail-progress-bar">
                            <view
                                class="detail-progress-fill"
                                :style="{ width: progressValue + '%' }"
                            ></view>
                        </view>
                        <text class="detail-progress-text">{{ progressValue }}%</text>
                    </view>
                </view>
                <view class="detail-row" v-if="categoryDisplay">
                    <text class="label">分类</text>
                    <text class="value">{{ categoryDisplay }}</text>
                </view>
                <view class="detail-row" v-if="event.location">
                    <text class="label">地点</text>
                    <text class="value">{{ event.location }}</text>
                </view>
                <view class="detail-row" v-if="event.isRepeat">
                    <text class="label">重复</text>
                    <text class="value">{{ repeatLabel(event.repeatType) }}</text>
                </view>
                <view
                    class="detail-row"
                    v-if="event.remindMinutes !== null && event.remindMinutes !== undefined"
                >
                    <text class="label">提醒</text>
                    <text class="value">{{ remindLabel(event.remindMinutes) }}</text>
                </view>
                <view class="detail-row" v-if="event.completedTime">
                    <text class="label">完成时间</text>
                    <text class="value">{{ formatDateTime(event.completedTime) }}</text>
                </view>
            </view>

            <view class="detail-section premium-card" v-if="tagList.length">
                <view class="section-title">标签</view>
                <view class="tag-list">
                    <text v-for="tag in tagList" :key="tag" class="tag-chip">{{ tag }}</text>
                </view>
            </view>

            <view class="detail-section premium-card" v-if="subtaskList.length">
                <view class="section-title">子任务</view>
                <view
                    v-for="(task, index) in subtaskList"
                    :key="`${task}-${index}`"
                    class="detail-row"
                >
                    <text class="label">步骤 {{ index + 1 }}</text>
                    <text class="value">{{ task }}</text>
                </view>
            </view>

            <view class="detail-section premium-card" v-if="event.note">
                <view class="section-title">备注</view>
                <text class="note-text">{{ event.note }}</text>
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

            <view class="detail-toolbar">
                <button class="detail-toolbar-btn detail-toolbar-btn-muted" @tap="goEdit">
                    编辑
                </button>
            </view>

            <view class="detail-action-swipe">
                <view class="detail-swipe-actions">
                    <view
                        class="detail-swipe-btn detail-swipe-btn-complete"
                        @tap.stop="
                            onDetailSwipeAction(event.status === 1 ? 'uncomplete' : 'complete')
                        "
                    >
                        <text class="detail-swipe-label">{{
                            event.status === 1 ? '取消' : '完成'
                        }}</text>
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
import { computed, onMounted, ref } from 'vue'
import {
    completeSchedule,
    deleteSchedule,
    getCategoryList,
    getScheduleDetail,
    uncompleteSchedule
} from '@/api/plan/schedule'

const event = ref(null)
const loading = ref(true)
const categories = ref([])
const DETAIL_ACTION_WIDTH = 92
const DETAIL_SWIPE_THRESHOLD = 42
const detailSwipe = ref({
    startX: 0,
    currentX: 0,
    translateX: 0
})

const detailActionMax = computed(() => DETAIL_ACTION_WIDTH * 2)

const categoryDisplay = computed(() => {
    if (!event.value?.categoryId) return ''
    const matched = categories.value.find(
        (item) => String(item.id) === String(event.value.categoryId)
    )
    return matched?.name || `分类 #${event.value.categoryId}`
})

const tagList = computed(() => {
    return String(event.value?.tags || '')
        .split(/[,，]/)
        .map((item) => item.trim())
        .filter(Boolean)
})

const subtaskList = computed(() => {
    const raw = event.value?.subtasks
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
            return parsed
                .map((item) => {
                    if (typeof item === 'string') return item
                    if (item && typeof item === 'object') {
                        return item.title || item.name || item.text || ''
                    }
                    return ''
                })
                .filter(Boolean)
        }
    } catch (error) {
        return String(raw)
            .split(/\r?\n/)
            .map((item) => item.trim())
            .filter(Boolean)
    }
    return []
})

const clampProgress = (value) => {
    const progress = Number(value)
    if (!Number.isFinite(progress)) return 0
    return Math.max(0, Math.min(100, Math.round(progress)))
}

const hasProgress = computed(
    () => event.value?.progress !== null && event.value?.progress !== undefined
)

const progressValue = computed(() => clampProgress(event.value?.progress))

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
    const labels = {
        3: 'P1 高',
        2: 'P2 中',
        1: 'P3 低'
    }
    return labels[priority] || 'P2 中'
}

const remindLabel = (minutes) => {
    if (minutes === null || minutes === undefined || minutes === '' || Number(minutes) < 0)
        return '不提醒'
    if (Number(minutes) === 0) return '准时提醒'
    if (Number(minutes) < 60) return `提前 ${minutes} 分钟`
    return `提前 ${Math.round(Number(minutes) / 60)} 小时`
}

const formatDateTime = (ts) => {
    if (!ts) return ''
    const d = new Date(Number(ts))
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
    ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
        2,
        '0'
    )}`
}

const loadCategories = async () => {
    try {
        const list = await getCategoryList({})
        categories.value = Array.isArray(list) ? list : []
    } catch (error) {
        console.error('加载分类失败', error)
        categories.value = []
    }
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
        event.value.progress = 100
        closeDetailSwipe()
    } catch (error) {
        console.error(error)
    }
}

const handleUncomplete = async () => {
    if (!event.value) return
    try {
        await uncompleteSchedule(event.value.id, {})
        uni.showToast({ title: '已取消完成', icon: 'success' })
        event.value.status = 0
        event.value.completedTime = null
        if (!event.value.progress || event.value.progress >= 100) {
            event.value.progress = 0
        }
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

const goEdit = () => {
    if (!event.value?.id) return
    uni.navigateTo({ url: `/pages/plan/schedule/form?id=${event.value.id}` })
}

const onDetailSwipeAction = (action) => {
    if (action === 'complete') {
        handleComplete()
        return
    }
    if (action === 'uncomplete') {
        handleUncomplete()
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
    loadCategories()
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
    background: linear-gradient(
            180deg,
            rgba(var(--color-primary-rgb), 0.08),
            rgba(var(--color-primary-rgb), 0)
        ),
        var(--color-bg-app);
    padding: 18rpx 18rpx 34rpx;
}

.detail-header-bar {
    max-width: 720rpx;
    margin: 0 auto 16rpx;
    padding: 0 8rpx;
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
    max-width: 720rpx;
    margin: 0 auto;
    background: var(--color-surface);
    border-radius: 24rpx;
    padding: 32rpx;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-left: 8rpx solid var(--color-primary);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
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
    margin: 20rpx auto 0;
    max-width: 720rpx;
}

.info-card {
    padding: 24rpx;
    border-radius: 24rpx;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
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

.summary-card {
    margin-top: 20rpx;
    padding: 24rpx;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16rpx;
    max-width: 720rpx;
    margin-left: auto;
    margin-right: auto;
    border-radius: 24rpx;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.summary-chip {
    text-align: center;
    padding: 18rpx 12rpx;
    border-radius: 22rpx;
    background: var(--color-surface-soft);
    border: 1rpx solid var(--color-border-light);
}

.summary-chip-label {
    display: block;
    font-size: 22rpx;
    color: var(--color-text-tertiary);
}

.summary-chip-value {
    display: block;
    margin-top: 8rpx;
    font-size: 24rpx;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.4;
}

.detail-section,
.timeline-card {
    margin-top: 20rpx;
    padding: 28rpx 28rpx 18rpx;
    max-width: 720rpx;
    margin-left: auto;
    margin-right: auto;
    border-radius: 24rpx;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.section-title {
    font-size: 30rpx;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 14rpx;
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

.detail-progress-value {
    display: flex;
    align-items: center;
    gap: 18rpx;
    min-width: 0;
}

.detail-progress-bar {
    flex: 1;
    height: 12rpx;
    border-radius: 999rpx;
    background: var(--color-border-light);
    overflow: hidden;
}

.detail-progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--color-primary), #5ac8a0);
}

.detail-progress-text {
    flex-shrink: 0;
    min-width: 72rpx;
    text-align: right;
    font-size: 24rpx;
    font-weight: 800;
    color: var(--color-primary);
}

.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 14rpx;
}

.tag-chip {
    padding: 10rpx 20rpx;
    border-radius: 999rpx;
    background: var(--color-primary-mist);
    color: var(--color-primary);
    font-size: 24rpx;
    font-weight: 600;
}

.note-text {
    display: block;
    font-size: 26rpx;
    line-height: 1.8;
    color: var(--color-text-secondary);
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

.detail-toolbar {
    margin-top: 20rpx;
    max-width: 720rpx;
    margin-left: auto;
    margin-right: auto;
}

.detail-toolbar-btn {
    width: 100%;
    height: 82rpx;
    border-radius: 999rpx;
    font-size: 26rpx;
    font-weight: 700;
    box-sizing: border-box;
}

.detail-toolbar-btn-muted {
    background: var(--color-surface-soft);
    color: var(--color-text-secondary);
    border: 1rpx solid var(--color-border-light);
}

.detail-action-swipe {
    position: relative;
    margin-top: 20rpx;
    border-radius: 24rpx;
    overflow: hidden;
    max-width: 720rpx;
    margin-left: auto;
    margin-right: auto;
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
