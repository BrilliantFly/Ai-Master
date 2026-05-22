<template>
  <view class="schedule-detail-page">
    <view v-if="loading" class="loading-state">
      <text>加载中...</text>
    </view>
    <template v-else-if="event">
      <view class="detail-header" :style="{ borderLeftColor: getQuadrantColor(event.quadrant) }">
        <text class="detail-title">{{ event.title }}</text>
        <text class="detail-status" :class="event.status === 1 ? 'done' : 'todo'">
          {{ event.status === 1 ? '✅ 已完成' : '⏳ 待办' }}
        </text>
      </view>

      <view class="detail-section">
        <view class="detail-row">
          <text class="label">象限</text>
          <text class="value">{{ quadrantLabel(event.quadrant) }}</text>
        </view>
        <view class="detail-row" v-if="event.content">
          <text class="label">描述</text>
          <text class="value">{{ event.content }}</text>
        </view>
        <view class="detail-row" v-if="event.startTime">
          <text class="label">开始时间</text>
          <text class="value">{{ formatDateTime(event.startTime) }}</text>
        </view>
        <view class="detail-row" v-if="event.endTime">
          <text class="label">结束时间</text>
          <text class="value">{{ formatDateTime(event.endTime) }}</text>
        </view>
        <view class="detail-row" v-if="event.location">
          <text class="label">地点</text>
          <text class="value">📍 {{ event.location }}</text>
        </view>
        <view class="detail-row" v-if="event.categoryId">
          <text class="label">分类</text>
          <text class="value">{{ event.categoryId }}</text>
        </view>
        <view class="detail-row" v-if="event.completedTime">
          <text class="label">完成时间</text>
          <text class="value">{{ formatDateTime(event.completedTime) }}</text>
        </view>
      </view>

      <view class="detail-actions">
        <button
          v-if="event.status === 0"
          class="action-btn primary"
          @tap="handleComplete"
        >标记完成</button>
        <button
          class="action-btn danger"
          @tap="handleDelete"
        >删除</button>
      </view>
    </template>
    <view v-else class="loading-state">
      <text>未找到日程</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getScheduleDetail, completeSchedule, deleteSchedule } from '@/api/plan/schedule'

const event = ref(null)
const loading = ref(true)

const quadrantLabel = (q) => {
  const labels = { 1: '重要紧急', 2: '重要不紧急', 3: '紧急不重要', 4: '不紧急不重要' }
  return labels[q] || '未分类'
}

const getQuadrantColor = (q) => {
  const colors = { 1: '#FF6B6B', 2: '#4ECDC4', 3: '#FFE66D', 4: '#95A5A6' }
  return colors[q] || '#999'
}

const formatDateTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const fetchDetail = async (id) => {
  try {
    const res = await getScheduleDetail(id)
    event.value = res || null
  } catch (e) {
    console.error('获取详情失败', e)
  } finally {
    loading.value = false
  }
}

const handleComplete = async () => {
  if (!event.value) return
  try {
    await completeSchedule(event.value.id, {})
    uni.showToast({ title: '已完成', icon: 'success' })
    event.value.status = 1
    event.value.completedTime = Date.now()
  } catch (e) {
    console.error(e)
  }
}

const handleDelete = async () => {
  if (!event.value) return
  try {
    await deleteSchedule(event.value.id)
    uni.showToast({ title: '已删除', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 500)
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage.$page?.options?.id || currentPage.options?.id
  if (id) {
    fetchDetail(id)
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.schedule-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 120rpx 0;
  font-size: 28rpx;
  color: #999;
}

.detail-header {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  border-left: 8rpx solid #1890FF;
  margin-bottom: 20rpx;
}

.detail-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.detail-status {
  font-size: 28rpx;
}
.detail-status.todo { color: #FF6B6B; }
.detail-status.done { color: #52C41A; }

.detail-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.detail-row {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.detail-row:last-child { border-bottom: none; }

.detail-row .label {
  width: 140rpx;
  font-size: 28rpx;
  color: #999;
  flex-shrink: 0;
}

.detail-row .value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.detail-actions {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 0;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.action-btn.primary {
  background: #1890FF;
  color: #fff;
}

.action-btn.danger {
  background: #fff;
  color: #FF4D4F;
  border: 2rpx solid #FF4D4F;
}
</style>
