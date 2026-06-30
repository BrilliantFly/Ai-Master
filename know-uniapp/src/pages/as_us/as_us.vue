<template>
    <view class="as-us-page">
        <view class="logo">AI-Master</view>
        <text class="version">版本 1.0.0</text>
        <text class="desc">智能管理系统</text>
    </view>
</template>

<script setup lang="ts"></script>

<style scoped>
.as-us-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--color-bg);
}
.logo {
    font-size: 60rpx;
    font-weight: bold;
    color: var(--color-text);
    margin-bottom: 20rpx;
}
.version,
.desc {
    font-size: 28rpx;
    color: var(--color-text-tertiary);
}
</style>
