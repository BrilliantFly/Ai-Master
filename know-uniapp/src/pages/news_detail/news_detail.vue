<template>
  <view class="news-detail-page">
    <view class="title">{{ title }}</view>
    <view class="content">{{ content }}</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('文章详情')
const content = ref('文章内容...')
</script>

<style scoped>
.news-detail-page { min-height: 100vh; padding: 30rpx; background: #fff; }
.title { font-size: 40rpx; font-weight: bold; color: #333; margin-bottom: 30rpx; }
.content { font-size: 30rpx; color: #666; line-height: 1.8; }
</style>