<template>
    <view class="news-page">
        <view class="news-header">
            <text class="title">文章资讯</text>
        </view>
        <view class="news-list">
            <view class="news-item" v-for="item in list" :key="item.id">
                <text class="news-title">{{ item.title }}</text>
                <text class="news-desc">{{ item.desc }}</text>
            </view>
        </view>
        <PremiumBottomNav active="article" />
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PremiumBottomNav from '@/components/PremiumBottomNav.vue'

const list = ref([
    { id: 1, title: '欢迎使用', desc: '欢迎使用AI管理系统' },
    { id: 2, title: '摄像头管理', desc: '智能摄像头管理系统' }
])
</script>

<style scoped>
.news-page {
    min-height: 100vh;
    background: var(--color-bg);
    padding: 20rpx 20rpx 160rpx;
}
.news-header {
    padding: 30rpx 20rpx;
}
.title {
    font-size: 36rpx;
    font-weight: bold;
    color: var(--color-text);
}
.news-list {
    background: var(--color-surface);
    border-radius: 16rpx;
    overflow: hidden;
}
.news-item {
    padding: 30rpx;
    border-bottom: 1rpx solid var(--color-border-light);
}
.news-title {
    font-size: 32rpx;
    color: var(--color-text);
    font-weight: 500;
    display: block;
    margin-bottom: 10rpx;
}
.news-desc {
    font-size: 26rpx;
    color: var(--color-text-tertiary);
}
</style>
