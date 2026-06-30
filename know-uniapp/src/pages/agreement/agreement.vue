<template>
    <view class="agreement-page">
        <text class="title">用户协议</text>
        <text class="content">本协议是用户与AI-Master之间的协议...</text>
    </view>
</template>

<script setup lang="ts"></script>

<style scoped>
.agreement-page {
    min-height: 100vh;
    padding: 30rpx;
    background: var(--color-bg);
}
.title {
    font-size: 36rpx;
    font-weight: bold;
    color: var(--color-text);
    display: block;
    margin-bottom: 30rpx;
}
.content {
    font-size: 28rpx;
    color: var(--color-text-secondary);
    line-height: 1.8;
}
</style>
