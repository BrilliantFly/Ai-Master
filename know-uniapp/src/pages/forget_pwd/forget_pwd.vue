<template>
    <view class="forget-pwd-page">
        <view class="title">找回密码</view>
        <input type="text" placeholder="手机号" class="input" />
        <input type="text" placeholder="验证码" class="input" />
        <input type="password" placeholder="新密码" class="input" />
        <button class="btn">确认</button>
    </view>
</template>

<script setup lang="ts"></script>

<style scoped>
.forget-pwd-page {
    min-height: 100vh;
    padding: 60rpx 40rpx;
    background: var(--color-bg);
}
.title {
    font-size: 48rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 60rpx;
}
.input {
    border: 1rpx solid var(--color-border);
    padding: 24rpx;
    border-radius: 8rpx;
    margin-bottom: 30rpx;
    font-size: 30rpx;
}
.btn {
    background: var(--color-primary);
    color: #fff;
    border-radius: 8rpx;
    margin-top: 40rpx;
}
</style>
