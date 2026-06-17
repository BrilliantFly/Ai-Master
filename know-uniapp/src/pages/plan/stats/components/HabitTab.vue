<template>
    <view class="section-card premium-card">
        <view class="section-head">
            <text class="section-title">习惯统计</text>
            <text class="section-badge green">最佳连续 {{ bestHabitDays }} 天</text>
        </view>

        <view class="chart-block">
            <view class="chart-head">
                <text class="chart-title">本月打卡趋势</text>
            </view>
            <scroll-view scroll-x class="bar-scroll" show-scrollbar="false">
                <view class="bar-chart long">
                    <view v-for="item in habitTrend" :key="item.label" class="bar-column slim">
                        <text class="bar-value">{{ item.count }}</text>
                        <view class="bar-track">
                            <view
                                class="bar-fill green"
                                :style="{ height: `${item.height}rpx` }"
                            ></view>
                        </view>
                        <text class="bar-label">{{ item.label }}</text>
                    </view>
                </view>
            </scroll-view>
        </view>

        <view class="habit-rank-card">
            <view class="chart-head">
                <text class="chart-title">习惯排行</text>
            </view>
            <view class="habit-rank-list">
                <view
                    v-for="(habit, index) in habitRanking"
                    :key="habit.habitId || habit.id"
                    class="habit-rank-item"
                >
                    <text class="habit-rank-index">{{ index + 1 }}</text>
                    <view class="habit-rank-copy">
                        <text class="habit-rank-name">{{ habit.habitName }}</text>
                        <text class="habit-rank-desc">{{ habit.description || '持续打卡中' }}</text>
                    </view>
                    <text class="habit-rank-days">{{ habit.currentDays || 0 }} 天</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
defineProps({
    bestHabitDays: { type: Number, required: true },
    habitTrend: { type: Array, required: true },
    habitRanking: { type: Array, required: true }
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

.section-badge.green {
    color: var(--color-success);
    background: rgba(82, 196, 26, 0.14);
}

.chart-block,
.habit-rank-card {
    margin-top: 18rpx;
    padding: 20rpx;
    border-radius: 20rpx;
    background: var(--color-surface-soft);
}

.bar-scroll {
    width: 100%;
}

.bar-chart.long {
    display: flex;
    align-items: flex-end;
    gap: 18rpx;
    margin-top: 18rpx;
    min-width: 760rpx;
}

.bar-column.slim {
    width: 42rpx;
    flex: none;
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

.bar-fill.green {
    width: 100%;
    min-height: 12rpx;
    border-radius: 999rpx 999rpx 10rpx 10rpx;
    background: linear-gradient(180deg, var(--color-success), #34d399);
}

.habit-rank-list {
    margin-top: 18rpx;
}

.habit-rank-item + .habit-rank-item {
    margin-top: 16rpx;
}

.habit-rank-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.habit-rank-index {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: var(--color-primary-soft);
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22rpx;
    font-weight: 700;
    flex-shrink: 0;
}

.habit-rank-copy {
    flex: 1;
    min-width: 0;
}

.habit-rank-name,
.habit-rank-days {
    font-size: 24rpx;
    color: var(--color-text);
}

.habit-rank-desc {
    display: block;
    margin-top: 6rpx;
    font-size: 20rpx;
    color: var(--color-text-secondary);
}
</style>
