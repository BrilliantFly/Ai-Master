<template>
    <view class="section-card premium-card">
        <view class="section-head">
            <text class="section-title">日程统计</text>
            <text class="section-badge">本周 {{ scheduleWeekly.total }} 项</text>
        </view>

        <view class="summary-grid schedule-grid">
            <view class="summary-item">
                <text class="summary-label">本周完成</text>
                <text class="summary-value">{{ scheduleWeekly.completed }}</text>
            </view>
            <view class="summary-item">
                <text class="summary-label">本周待办</text>
                <text class="summary-value">{{ scheduleWeekly.todo }}</text>
            </view>
        </view>

        <view class="chart-block">
            <view class="chart-head">
                <text class="chart-title">近七天任务分布</text>
            </view>
            <view class="bar-chart">
                <view v-for="item in scheduleTrend" :key="item.label" class="bar-column">
                    <text class="bar-value">{{ item.count }}</text>
                    <view class="bar-track">
                        <view class="bar-fill" :style="{ height: `${item.height}rpx` }"></view>
                    </view>
                    <text class="bar-label">{{ item.label }}</text>
                </view>
            </view>
        </view>

        <view class="quadrant-card">
            <view class="chart-head">
                <text class="chart-title">四象限分布</text>
            </view>
            <view class="quadrant-list">
                <view v-for="item in quadrantStats" :key="item.label" class="quadrant-item">
                    <view class="quadrant-main">
                        <view class="quadrant-copy">
                            <text class="quadrant-dot" :style="{ background: item.color }"></text>
                            <text class="quadrant-label">{{ item.label }}</text>
                        </view>
                        <text class="quadrant-count">{{ item.count }} 项</text>
                    </view>
                    <view class="quadrant-track">
                        <view
                            class="quadrant-fill"
                            :style="{ width: `${item.width}%`, background: item.color }"
                        ></view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
defineProps({
    scheduleWeekly: { type: Object, required: true },
    scheduleTrend: { type: Array, required: true },
    quadrantStats: { type: Array, required: true }
})
</script>

<style scoped lang="scss">
.section-card {
    margin-bottom: 16px;
    padding: 24rpx 24rpx 22rpx;
}

.section-head,
.chart-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20rpx;
}

.section-title,
.chart-title {
    font-size: 30rpx;
    font-weight: 600;
    color: var(--color-text);
}

.section-badge {
    font-size: 20rpx;
    color: var(--color-primary);
    background: var(--color-primary-soft);
    padding: 4rpx 14rpx;
    border-radius: 999rpx;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16rpx;
}

.schedule-grid {
    margin-top: 0;
    margin-bottom: 18rpx;
}

.summary-item {
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

.summary-label {
    margin-top: 8rpx;
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.chart-block,
.quadrant-card {
    margin-top: 18rpx;
    padding: 20rpx;
    border-radius: 20rpx;
    background: var(--color-surface-soft);
}

.bar-chart {
    display: flex;
    align-items: flex-end;
    gap: 18rpx;
    margin-top: 18rpx;
}

.bar-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
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

.quadrant-list {
    margin-top: 18rpx;
}

.quadrant-item + .quadrant-item {
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
.quadrant-count {
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
</style>
