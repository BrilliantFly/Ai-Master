<template>
    <view class="section-card premium-card">
        <view class="section-head">
            <text class="section-title">概览</text>
        </view>
        <view class="summary-grid">
            <view class="summary-item">
                <text class="summary-label">日程总数</text>
                <text class="summary-value">{{ overview.scheduleTotal }}</text>
            </view>
            <view class="summary-item">
                <text class="summary-label">已完成日程</text>
                <text class="summary-value">{{ overview.scheduleDone }}</text>
            </view>
            <view class="summary-item">
                <text class="summary-label">打卡天数</text>
                <text class="summary-value">{{ overview.habitDays }}</text>
            </view>
            <view class="summary-item">
                <text class="summary-label">进行中习惯</text>
                <text class="summary-value">{{ overview.activeHabits }}</text>
            </view>
            <view class="summary-item">
                <text class="summary-label">今日番茄</text>
                <text class="summary-value">{{ overview.focusCount }}</text>
            </view>
            <view class="summary-item">
                <text class="summary-label">专注分钟</text>
                <text class="summary-value">{{ overview.focusMinutes }}</text>
            </view>
        </view>

        <view class="shortcut-grid">
            <view class="shortcut-item" @tap="$emit('navigate', '/pages/plan/schedule/index')">
                <text class="shortcut-title">日程统计</text>
                <text class="shortcut-desc">查看月历与本周安排</text>
            </view>
            <view class="shortcut-item" @tap="$emit('navigate', '/pages/plan/habit/index')">
                <text class="shortcut-title">习惯统计</text>
                <text class="shortcut-desc">追踪习惯与打卡节奏</text>
            </view>
            <view class="shortcut-item" @tap="$emit('navigate', '/pages/plan/focus/index')">
                <text class="shortcut-title">番茄专注</text>
                <text class="shortcut-desc">
                    {{ overview.focusCount }} 轮 · 连续 {{ overview.focusStreak }} 轮
                </text>
            </view>
        </view>
    </view>
</template>

<script setup>
defineProps({
    overview: { type: Object, required: true }
})

defineEmits(['navigate'])
</script>

<style scoped lang="scss">
.section-card {
    margin-bottom: 16px;
    padding: 24rpx 24rpx 22rpx;
}

.section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: var(--color-text);
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16rpx;
    margin-top: 20rpx;
}

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

.summary-value {
    font-size: 34rpx;
    font-weight: 700;
    color: var(--color-text);
}

.summary-label,
.shortcut-desc {
    margin-top: 8rpx;
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.shortcut-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18rpx;
    margin-top: 20rpx;
}

.shortcut-item {
    align-items: flex-start;
    padding: 22rpx;
}

.shortcut-title {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--color-text);
}
</style>
