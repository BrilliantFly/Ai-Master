<template>
    <view class="hero-card premium-card">
        <view class="hero-top">
            <text class="hero-month">{{ currentYear }} 年 {{ currentMonth }} 月</text>
            <text class="hero-badge">统计页</text>
        </view>
        <view class="hero-grid">
            <view class="hero-stat">
                <text class="hero-value">{{ overview.todayCompleted }}</text>
                <text class="hero-label">今日完成</text>
            </view>
            <view class="hero-stat">
                <text class="hero-value">{{ overview.totalCheckins }}</text>
                <text class="hero-label">累计打卡</text>
            </view>
            <view class="hero-stat">
                <text class="hero-value">{{ overview.scheduleRate }}%</text>
                <text class="hero-label">日程达成</text>
            </view>
        </view>
        <view class="ring-summary">
            <view class="ring-card">
                <text class="ring-label">日程完成率</text>
                <view class="ring-shell">
                    <view class="ring-fill" :style="{ width: `${overview.scheduleRate}%` }"></view>
                </view>
                <text class="ring-value">{{ overview.scheduleRate }}%</text>
            </view>
            <view class="ring-card">
                <text class="ring-label">习惯打卡率</text>
                <view class="ring-shell green">
                    <view
                        class="ring-fill green"
                        :style="{ width: `${overview.habitRate}%` }"
                    ></view>
                </view>
                <text class="ring-value">{{ overview.habitRate }}%</text>
            </view>
        </view>
    </view>
</template>

<script setup>
defineProps({
    currentYear: { type: Number, required: true },
    currentMonth: { type: Number, required: true },
    overview: { type: Object, required: true }
})
</script>

<style scoped lang="scss">
.hero-card {
    margin-bottom: 16px;
    padding: 24rpx 24rpx 22rpx;
}

.hero-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20rpx;
}

.hero-month {
    font-size: 30rpx;
    font-weight: 600;
    color: var(--color-text);
}

.hero-badge {
    font-size: 20rpx;
    color: var(--color-primary);
    background: var(--color-primary-soft);
    padding: 4rpx 14rpx;
    border-radius: 999rpx;
}

.hero-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;
    margin-top: 20rpx;
}

.hero-stat {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: var(--color-surface-soft);
    border-radius: 18rpx;
    padding: 20rpx 10rpx;
}

.hero-value {
    font-size: 34rpx;
    font-weight: 700;
    color: var(--color-text);
}

.hero-label {
    margin-top: 8rpx;
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.ring-summary {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18rpx;
    margin-top: 22rpx;
}

.ring-card {
    background: var(--color-surface-soft);
    border-radius: 20rpx;
    padding: 18rpx 18rpx 16rpx;
}

.ring-label {
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.ring-shell {
    margin-top: 14rpx;
    height: 14rpx;
    border-radius: 999rpx;
    background: rgba(var(--color-primary-rgb), 0.14);
    overflow: hidden;
}

.ring-shell.green {
    background: rgba(82, 196, 26, 0.14);
}

.ring-fill {
    height: 100%;
    border-radius: 999rpx;
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
}

.ring-fill.green {
    background: linear-gradient(135deg, var(--color-success), #34d399);
}

.ring-value {
    display: block;
    margin-top: 10rpx;
    font-size: 28rpx;
    font-weight: 700;
    color: var(--color-text);
}
</style>
