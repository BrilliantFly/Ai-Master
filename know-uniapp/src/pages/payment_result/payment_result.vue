<template>
    <view class="payment-result-page">
        <view class="result">支付成功</view>
        <text class="amount">¥0.00</text>
        <button class="btn">完成</button>
    </view>
</template>

<script setup lang="ts"></script>

<style scoped>
.payment-result-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--color-bg);
}
.result {
    font-size: 40rpx;
    font-weight: bold;
    color: var(--color-text);
    margin-bottom: 20rpx;
}
.amount {
    font-size: 60rpx;
    color: var(--color-primary);
    margin-bottom: 60rpx;
}
.btn {
    background: var(--color-primary);
    color: #fff;
    padding: 20rpx 80rpx;
    border-radius: 8rpx;
}
</style>
