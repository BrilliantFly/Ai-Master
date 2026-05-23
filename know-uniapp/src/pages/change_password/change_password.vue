<template>
  <view class="change-password-page">
    <view class="form">
      <input type="password" placeholder="旧密码" class="input" />
      <input type="password" placeholder="新密码" class="input" />
      <input type="password" placeholder="确认密码" class="input" />
      <button class="btn">修改密码</button>
    </view>
  </view>
</template>

<script setup lang="ts">
</script>

<style scoped>
.change-password-page { min-height: 100vh; padding: 30rpx; background: #f5f5f5; }
.form { background: #fff; border-radius: 16rpx; padding: 40rpx; }
.input { border: 1rpx solid #ddd; padding: 20rpx; border-radius: 8rpx; margin-bottom: 30rpx; font-size: 30rpx; }
.btn { background: #007aff; color: #fff; border-radius: 8rpx; }
</style>