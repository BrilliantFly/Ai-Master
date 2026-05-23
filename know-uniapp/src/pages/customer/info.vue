<template>
  <view class="customer-info-page">
    <view class="header">客户详情</view>
    <view class="info">
      <text class="label">姓名</text>
      <text class="value">-</text>
    </view>
    <view class="info">
      <text class="label">电话</text>
      <text class="value">-</text>
    </view>
    <view class="info">
      <text class="label">备注</text>
      <text class="value">-</text>
    </view>
  </view>
</template>

<script setup lang="ts">
</script>

<style scoped>
.customer-info-page { min-height: 100vh; background: #f5f5f5; }
.header { padding: 40rpx; font-size: 36rpx; font-weight: bold; background: #fff; }
.info { display: flex; justify-content: space-between; padding: 30rpx; background: #fff; border-bottom: 1rpx solid #eee; }
.label, .value { font-size: 30rpx; color: #333; }
</style>