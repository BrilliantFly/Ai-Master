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
    { id: 2, name: 'Office-WiFi', connected: false }
])
</script>

<style scoped>
.wifi-page {
    min-height: 100vh;
    background: var(--color-bg);
}
.title {
    padding: 40rpx;
    font-size: 36rpx;
    font-weight: bold;
    background: var(--color-surface);
}
.wifi-list {
    background: var(--color-surface);
}
.wifi-item {
    display: flex;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid var(--color-border-light);
}
.name {
    font-size: 30rpx;
    color: var(--color-text);
}
.status {
    font-size: 28rpx;
    color: var(--color-text-tertiary);
}
</style>
