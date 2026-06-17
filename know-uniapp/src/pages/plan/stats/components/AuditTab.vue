<template>
    <view class="section-card premium-card">
        <view class="section-head">
            <text class="section-title">时间审计</text>
            <text class="section-badge">{{ timeAuditSummary.totalHours }}h</text>
        </view>

        <view class="range-row">
            <view
                v-for="item in auditRanges"
                :key="item.key"
                class="range-pill"
                :class="{ active: auditRange === item.key }"
                @tap="$emit('change-range', item.key)"
            >
                <text>{{ item.label }}</text>
            </view>
        </view>

        <view class="audit-pie-card">
            <view class="chart-head">
                <text class="chart-title">四象限耗时占比</text>
            </view>
            <view class="audit-pie-shell">
                <view class="audit-pie-circle">
                    <view
                        class="audit-pie-mask"
                        :style="{ background: timeAuditSummary.gradient }"
                    ></view>
                    <view class="audit-pie-center">
                        <text class="audit-pie-total">{{ timeAuditSummary.totalHours }}h</text>
                        <text class="audit-pie-label">总投入</text>
                    </view>
                </view>
            </view>
            <view class="audit-legend">
                <view
                    v-for="item in auditQuadrantStats"
                    :key="item.label"
                    class="audit-legend-item"
                >
                    <view class="audit-legend-copy">
                        <text class="quadrant-dot" :style="{ background: item.color }"></text>
                        <text class="quadrant-label">{{ item.label }}</text>
                    </view>
                    <text class="audit-legend-value">{{ item.hours }}h / {{ item.percent }}%</text>
                </view>
            </view>
        </view>

        <view class="chart-block">
            <view class="chart-head">
                <text class="chart-title">每日耗时趋势</text>
            </view>
            <scroll-view scroll-x class="bar-scroll" show-scrollbar="false">
                <view class="bar-chart long">
                    <view v-for="item in auditTrend" :key="item.label" class="bar-column slim">
                        <text class="bar-value">{{ item.hours }}</text>
                        <view class="bar-track">
                            <view
                                class="bar-fill orange"
                                :style="{ height: `${item.height}rpx` }"
                            ></view>
                        </view>
                        <text class="bar-label">{{ item.label }}</text>
                    </view>
                </view>
            </scroll-view>
        </view>

        <view class="rank-card">
            <view class="chart-head">
                <text class="chart-title">耗时 TOP 5</text>
            </view>
            <view class="rank-list">
                <view
                    v-for="(item, index) in auditTopTasks"
                    :key="item.id || `${item.title}-${index}`"
                    class="rank-item"
                >
                    <text class="rank-index">{{ index + 1 }}</text>
                    <view class="rank-copy">
                        <text class="rank-name">{{ item.title || '未命名日程' }}</text>
                        <text class="rank-desc">{{ item.dateLabel }}</text>
                    </view>
                    <text class="rank-hours">{{ item.hours }}h</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
defineProps({
    auditRanges: { type: Array, required: true },
    auditRange: { type: String, required: true },
    timeAuditSummary: { type: Object, required: true },
    auditQuadrantStats: { type: Array, required: true },
    auditTrend: { type: Array, required: true },
    auditTopTasks: { type: Array, required: true }
})

defineEmits(['change-range'])
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

.range-row {
    display: flex;
    gap: 14rpx;
    margin-top: 18rpx;
}

.range-pill {
    min-width: 120rpx;
    height: 64rpx;
    padding: 0 20rpx;
    border-radius: 999rpx;
    background: var(--color-surface-soft);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22rpx;
    font-weight: 600;
}

.range-pill.active {
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
    color: #fff;
}

.audit-pie-card,
.chart-block,
.rank-card {
    margin-top: 18rpx;
    padding: 20rpx;
    border-radius: 20rpx;
    background: var(--color-surface-soft);
}

.audit-pie-shell {
    display: flex;
    justify-content: center;
    margin-top: 18rpx;
}

.audit-pie-circle {
    position: relative;
    width: 260rpx;
    height: 260rpx;
    border-radius: 50%;
    overflow: hidden;
}

.audit-pie-mask {
    position: absolute;
    inset: 0;
    border-radius: 50%;
}

.audit-pie-center {
    position: absolute;
    inset: 32rpx;
    border-radius: 50%;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.audit-pie-total {
    font-size: 40rpx;
    font-weight: 800;
    color: var(--color-text);
}

.audit-pie-label {
    margin-top: 8rpx;
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.audit-legend {
    margin-top: 20rpx;
}

.audit-legend-item + .audit-legend-item {
    margin-top: 12rpx;
}

.audit-legend-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16rpx;
}

.audit-legend-copy {
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
.audit-legend-value {
    font-size: 22rpx;
    color: var(--color-text-secondary);
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

.bar-fill.orange {
    width: 100%;
    min-height: 12rpx;
    border-radius: 999rpx 999rpx 10rpx 10rpx;
    background: linear-gradient(180deg, #f59e0b, #f97316);
}

.rank-list {
    margin-top: 18rpx;
}

.rank-item + .rank-item {
    margin-top: 16rpx;
}

.rank-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.rank-index {
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

.rank-copy {
    flex: 1;
    min-width: 0;
}

.rank-name,
.rank-hours {
    font-size: 24rpx;
    color: var(--color-text);
}

.rank-desc {
    display: block;
    margin-top: 6rpx;
    font-size: 20rpx;
    color: var(--color-text-secondary);
}
</style>
