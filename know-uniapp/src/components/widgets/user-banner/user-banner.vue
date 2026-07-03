<template>
    <view class="service-banner" @click="handleClick">
        <view class="s-icon-wrap">
            <text class="s-icon">🎯</text>
        </view>
        <view class="s-text">
            <view class="s-title">AI 智能分析</view>
            <view class="s-desc">基于你的数据生成月度报告</view>
        </view>
        <view class="s-action">立即体验 →</view>
    </view>
</template>

<script setup lang="ts">
import { useRouter } from 'uniapp-router-next'

defineProps({
    content: {
        type: Object,
        default: () => ({})
    },
    styles: {
        type: Object,
        default: () => ({})
    }
})

const router = useRouter()

const handleClick = () => {
    router.navigateTo('/pages/plan/home/index')
}
</script>

<style lang="scss" scoped>
.service-banner {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 28rpx 28rpx;
    margin: 0 24rpx;
    margin-top: 16rpx;
    background: linear-gradient(
        135deg,
        var(--color-primary-soft) 0%,
        var(--color-primary-mist) 100%
    );
    border-radius: 24rpx;
    border: 2rpx solid rgba(var(--color-primary-rgb), 0.12);
    transition: all 0.25s;
    cursor: pointer;
}

.service-banner:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 24rpx rgba(var(--color-primary-rgb), 0.12);
}

.s-icon-wrap {
    width: 72rpx;
    height: 72rpx;
    border-radius: 18rpx;
    background: var(--gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.s-icon {
    font-size: 34rpx;
}

.s-text {
    flex: 1;
}

.s-title {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.3;
}

.s-desc {
    font-size: 22rpx;
    color: var(--color-text-secondary);
    margin-top: 4rpx;
    line-height: 1.3;
}

.s-action {
    font-size: 24rpx;
    color: var(--color-primary);
    font-weight: 500;
    flex-shrink: 0;
}
</style>
