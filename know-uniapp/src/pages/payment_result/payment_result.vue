<template>
  <view class="payment-result-page">
    <view class="result">支付成功</view>
    <text class="amount">¥0.00</text>
    <button class="btn">完成</button>
  </view>
</template>

<script setup lang="ts">
</script>

<style scoped>
.payment-result-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; }
.result { font-size: 40rpx; font-weight: bold; color: #333; margin-bottom: 20rpx; }
.amount { font-size: 60rpx; color: #007aff; margin-bottom: 60rpx; }
.btn { background: #007aff; color: #fff; padding: 20rpx 80rpx; border-radius: 8rpx; }
</style>