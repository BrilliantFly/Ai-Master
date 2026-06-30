<template>
    <view class="followup-page">
        <view class="title">添加跟进</view>
        <textarea placeholder="跟进内容..." class="textarea"></textarea>
        <button class="btn">提交</button>
    </view>
</template>

<script setup lang="ts"></script>

<style scoped>
.followup-page {
    min-height: 100vh;
    padding: 40rpx;
    background: var(--color-bg);
}
.title {
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
}
.textarea {
    width: 100%;
    height: 300rpx;
    border: 1rpx solid var(--color-border);
    padding: 20rpx;
    border-radius: 8rpx;
    font-size: 30rpx;
}
.btn {
    background: var(--color-primary);
    color: #fff;
    border-radius: 8rpx;
    margin-top: 40rpx;
}
</style>
