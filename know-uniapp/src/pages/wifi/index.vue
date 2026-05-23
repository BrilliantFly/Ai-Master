<template>
  <view class="wifi-page">
    <view class="title">WiFi管理</view>
    <view class="wifi-list">
      <view class="wifi-item" v-for="item in list" :key="item.id">
        <text class="name">{{ item.name }}</text>
        <text class="status">{{ item.connected ? '已连接' : '未连接' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const list = ref([
  { id: 1, name: 'Home-WiFi', connected: true },
  { id: 2, name: 'Office-WiFi', connected: false },
])
</script>

<style scoped>
.wifi-page { min-height: 100vh; background: #f5f5f5; }
.title { padding: 40rpx; font-size: 36rpx; font-weight: bold; background: #fff; }
.wifi-list { background: #fff; }
.wifi-item { display: flex; justify-content: space-between; padding: 30rpx; border-bottom: 1rpx solid #eee; }
.name { font-size: 30rpx; color: #333; }
.status { font-size: 28rpx; color: #999; }
</style>