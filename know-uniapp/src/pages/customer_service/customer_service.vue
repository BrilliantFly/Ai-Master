<template>
    <view class="customer-service-page">
        <view class="header">
            <text class="title">联系客服</text>
        </view>
        <view class="content">
            <text class="desc">客服时间: 9:00-18:00</text>
            <text class="phone">联系电话: 400-xxx-xxxx</text>
        </view>
    </view>
</template>

<script setup lang="ts"></script>

<style scoped>
.customer-service-page {
    min-height: 100vh;
    padding: 30rpx;
    background: var(--color-bg);
}
.header {
    padding: 30rpx 0;
}
.title {
    font-size: 36rpx;
    font-weight: bold;
    color: var(--color-text);
}
.content {
    background: var(--color-surface);
    border-radius: 16rpx;
    padding: 40rpx;
}
.desc,
.phone {
    display: block;
    font-size: 30rpx;
    color: var(--color-text-secondary);
    margin-bottom: 20rpx;
}
</style>
