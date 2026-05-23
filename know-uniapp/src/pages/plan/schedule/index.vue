<template>
  <view class="plan-schedule-page">
    <!-- 顶部统计 -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="num">{{ todayStats.totalCount }}</text>
        <text class="label">全部</text>
      </view>
      <view class="stat-item">
        <text class="num warn">{{ todayStats.todoCount }}</text>
        <text class="label">待办</text>
      </view>
      <view class="stat-item">
        <text class="num success">{{ todayStats.completedCount }}</text>
        <text class="label">完成</text>
      </view>
    </view>

    <!-- 日历 + 日程列表（日历在前，列表在后） -->
    <scroll-view scroll-y class="calendar-scroll">
      <uni-calendar
        :insert="true"
        :lunar="false"
        :selected="calendarSelected"
        @change="onDateTap"
        @monthSwitch="onMonthSwitch"
      />
      <view class="calendar-day-title">
        <text>{{ selectedDateLabel ? selectedDateLabel + ' 的日程' : '点击日期查看日程' }}</text>
      </view>

      <!-- 四象限筛选 -->
      <scroll-view scroll-x class="quadrant-bar" v-if="selectedDateLabel">
        <view
          v-for="q in quadrants"
          :key="q.value"
          class="quadrant-pill"
          :class="{ active: currentQuadrant === q.value }"
          @tap="filterByQuadrant(q.value)"
        >
          <view class="pill-dot" :style="{ background: q.color }"></view>
          <text>{{ q.label }}</text>
        </view>
      </scroll-view>

      <view v-if="filteredDayEvents.length === 0 && selectedDateLabel" class="empty-state">
        <text class="empty-icon">📅</text>
        <text class="empty-text">{{ currentQuadrant === 0 ? '该日暂无日程' : '该象限暂无日程' }}</text>
      </view>
      <view
        v-for="item in filteredDayEvents"
        :key="'sched-' + item.id + '-' + renderKey"
        class="schedule-card"
        :class="{ completed: item.status === 1 }"
        @tap="goToDetail(item)"
      >
        <view class="card-left">
          <view class="quadrant-indicator" :style="{ background: getQuadrantColor(item.quadrant) }"></view>
        </view>
        <view class="card-body">
          <text class="card-title">{{ item.title }}</text>
          <text class="card-time">{{ formatTime(item.startTime) }} - {{ formatTime(item.endTime) }}</text>
          <text v-if="item.location" class="card-location">📍 {{ item.location }}</text>
        </view>
        <view class="card-right">
          <view
            class="check-btn"
            :style="completedMap[item.id] ? { background: '#52C41A', borderColor: '#52C41A', color: '#fff' } : {}"
            @tap.stop="handleCheck(item)"
          >
            <text>✓</text>
          </view>
        </view>
      </view>
      <view style="height:120rpx"></view>
    </scroll-view>

    <!-- 底部新增按钮 -->
    <view class="add-btn-fixed" @tap="showAddModal">
      <text>+</text>
    </view>

    <!-- 新增弹窗 -->
    <view class="modal-mask" v-if="showModal">
      <view class="modal-content">
        <view class="modal-header">
          <text>新增日程</text>
          <text class="close" @tap="hideModal">×</text>
        </view>
        <view class="modal-form">
          <u-input v-model="form.title" placeholder="日程标题" :border="true" :customStyle="{padding:'20rpx',fontSize:'28rpx',marginBottom:'20rpx'}" />
          <textarea :value="form.content" @input="onContentInput" placeholder="描述（可选）" class="form-textarea" />
          <view class="form-row">
            <text class="form-label">象限</text>
            <picker :value="form.quadrant - 1" :range="quadrantOptions" @change="onQuadrantChange">
              <text class="picker-value">{{ quadrantOptions[form.quadrant - 1] }}</text>
            </picker>
          </view>
          <view class="form-row">
            <text class="form-label">开始</text>
            <picker mode="date" @change="onStartDateChange">
              <text>{{ form.startDate || '选择日期' }}</text>
            </picker>
          </view>
          <view class="form-btns">
            <button class="btn-cancel" @tap="hideModal">取消</button>
            <button class="btn-submit" @tap="handleAdd">保存</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getTodayStats, addSchedule, completeSchedule, getScheduleByDate, getCalendarMonthly } from '@/api/plan/schedule'

const todayStats = ref({ totalCount: 0, todoCount: 0, completedCount: 0 })
const showModal = ref(false)

// 日历 + 列表
const calendarSelected = ref([])
const selectedDateLabel = ref('')
const dayEvents = ref([])
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const renderKey = ref(0) // 强制刷新用
const completedMap = ref({}) // 独立完成状态，直接用 ref 驱动渲染

// 四象限筛选
const currentQuadrant = ref(0)
const quadrants = [
  { value: 0, label: '全部', color: '#999' },
  { value: 1, label: '重要紧急', color: '#FF6B6B' },
  { value: 2, label: '重要不紧急', color: '#4ECDC4' },
  { value: 3, label: '紧急不重要', color: '#FFE66D' },
  { value: 4, label: '不紧急不重要', color: '#95A5A6' }
]
const filteredDayEvents = computed(() => {
  if (currentQuadrant.value === 0) return dayEvents.value
  return dayEvents.value.filter(item => item.quadrant === currentQuadrant.value)
})

const filterByQuadrant = (q) => { currentQuadrant.value = q }

const quadrantOptions = ['重要紧急', '重要不紧急', '紧急不重要', '不紧急不重要']

const form = ref({
  title: '',
  content: '',
  quadrant: 2,
  startDate: '',
  eventType: 1
})

const onTitleInput = (e) => {
  const val = e.detail ? e.detail.value : e.target.value
  form.value.title = val || ''
}
const onContentInput = (e) => {
  const val = e.detail ? e.detail.value : e.target.value
  form.value.content = val || ''
}

const getQuadrantColor = (q) => {
  const colors = { 1: '#FF6B6B', 2: '#4ECDC4', 3: '#FFE66D', 4: '#95A5A6' }
  return colors[q] || '#999'
}

const fetchStats = async () => {
  try {
    const res = await getTodayStats({})
    todayStats.value = res || { totalCount: 0, todoCount: 0, completedCount: 0 }
  } catch (e) {
    console.error('获取统计失败', e)
  }
}

const formatTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

const handleCheck = (item) => {
  // 用独立 completedMap 驱动视觉更新，完全绕过 dayEvents 响应式链
  completedMap.value = { ...completedMap.value, [item.id]: true }
  renderKey.value++
  // 本地更新统计（不重新拉取列表，避免覆盖 completedMap）
  todayStats.value.todoCount = Math.max(0, todayStats.value.todoCount - 1)
  todayStats.value.completedCount += 1
  // 异步调用 API
  completeSchedule(item.id, {}).then(() => {
    uni.showToast({ title: '已完成', icon: 'success' })
    fetchCalendarMonthly()
  }).catch(e => {
    console.error(e)
  })
}

const showAddModal = () => { showModal.value = true }
const hideModal = () => { showModal.value = false }

const onQuadrantChange = (e) => { form.value.quadrant = e.detail.value + 1 }
const onStartDateChange = (e) => { form.value.startDate = e.detail.value }

const handleAdd = async () => {
  if (!form.value.title) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }
  try {
    await addSchedule(form.value, {})
    uni.showToast({ title: '添加成功', icon: 'success' })
    hideModal()
    form.value.title = ''
    form.value.content = ''
    form.value.startDate = ''
    fetchStats()
    fetchCalendarMonthly()
    if (selectedDateLabel.value) {
      fetchDayEvents(selectedDateLabel.value)
    }
  } catch (e) {
    console.error(e)
  }
}

const goToDetail = (item) => {
  uni.navigateTo({ url: `/pages/plan/schedule/detail?id=${item.id}` })
}

// ===== 日历 + 列表 =====
const formatDateStr = (ts) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const fetchCalendarMonthly = async () => {
  try {
    const res = await getCalendarMonthly({ year: currentYear.value, month: currentMonth.value })
    if (!res) return
    // 为有日程的日期生成标记
    const marks = (res.events || []).reduce((acc, e) => {
      if (e.startTime) {
        const dateStr = formatDateStr(e.startTime)
        if (!acc.find(m => m.date === dateStr)) {
          acc.push({ date: dateStr })
        }
      }
      return acc
    }, [])
    calendarSelected.value = marks
  } catch (e) {
    console.error('获取日历数据失败', e)
  }
}

const onMonthSwitch = (e) => {
  currentYear.value = e.year || e.currentYear || new Date().getFullYear()
  currentMonth.value = e.month || e.currentMonth || new Date().getMonth() + 1
  fetchCalendarMonthly()
}

const onDateTap = (e) => {
  // uni-calendar change event returns date string '2026-05-20' or object
  let dateStr = ''
  if (typeof e === 'string') {
    dateStr = e
  } else if (e && typeof e === 'object') {
    dateStr = e.fulldate || `${e.year}-${String(e.month).padStart(2, '0')}-${String(e.date).padStart(2, '0')}`
  }
  if (!dateStr) return
  selectedDateLabel.value = dateStr
  currentQuadrant.value = 0  // 切换日期时重置象限筛选
  fetchDayEvents(dateStr)
}

const fetchDayEvents = async (dateStr) => {
  try {
    const parts = dateStr.split('-')
    const ts = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).getTime()
    const res = await getScheduleByDate({ date: ts })
    dayEvents.value = res || []
    // 更新统计：基于当前选中日期的数据
    const events = res || []
    const totalCount = events.length
    const completedCount = events.filter(e => e.status === 1).length
    todayStats.value = { totalCount, todoCount: totalCount - completedCount, completedCount }
    // 从服务端数据同步 completedMap
    const map = {}
    for (const e of events) {
      if (e.status === 1) map[e.id] = true
    }
    completedMap.value = map
  } catch (e) {
    console.error('获取当日日程失败', e)
  }
}

onMounted(() => {
  fetchStats()
  fetchCalendarMonthly()
})
</script>

<style scoped>
.plan-schedule-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.stats-bar {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
  margin-bottom: 16rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1rpx solid #eee;
}

.stat-item:last-child { border-right: none; }

.stat-item .num { font-size: 40rpx; font-weight: bold; color: #333; }
.stat-item .warn { color: #FF6B6B; }
.stat-item .success { color: #52C41A; }
.stat-item .label { font-size: 24rpx; color: #999; margin-top: 4rpx; }

.calendar-scroll {
  padding: 0 0 120rpx;
}

.calendar-day-title {
  padding: 20rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  background: #fff;
  margin-top: 8rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.quadrant-bar {
  white-space: nowrap;
  background: #fff;
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.quadrant-pill {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 24rpx;
  margin-right: 16rpx;
  border-radius: 30rpx;
  background: #f5f5f5;
  font-size: 26rpx;
  line-height: 1.4;
  transition: all 0.2s;
}

.quadrant-pill.active {
  background: #E6F7FF;
  color: #1890FF;
  font-weight: 500;
}

.pill-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  margin-right: 8rpx;
  flex-shrink: 0;
}

.schedule-card {
  display: flex;
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin: 0 20rpx 16rpx;
  align-items: center;
}

.schedule-card.completed { opacity: 0.6; }

.card-left {
  margin-right: 16rpx;
}

.quadrant-indicator {
  width: 8rpx;
  height: 48rpx;
  border-radius: 4rpx;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title { font-size: 30rpx; font-weight: 500; color: #333; }
.card-time { font-size: 24rpx; color: #999; margin-top: 8rpx; }
.card-location { font-size: 24rpx; color: #666; margin-top: 4rpx; }

.card-right {
  margin-left: 16rpx;
}

.check-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ddd;
  font-size: 28rpx;
}

.check-btn.done {
  background: #52C41A;
  border-color: #52C41A;
  color: #fff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}
.empty-icon { font-size: 80rpx; }
.empty-text { font-size: 28rpx; color: #999; margin-top: 16rpx; }

.add-btn-fixed {
  position: fixed;
  bottom: 40rpx;
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #1890FF;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.4);
}

.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: #fff;
  border-radius: 16rpx;
  width: 600rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
  font-size: 32rpx;
  font-weight: 500;
}

.close { color: #999; font-size: 36rpx; }

.modal-form { padding: 30rpx; }

.form-textarea {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  width: 100%;
  height: 120rpx;
  box-sizing: border-box;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  margin-bottom: 20rpx;
}

.form-label { font-size: 28rpx; color: #666; }
.picker-value { font-size: 28rpx; color: #333; }

.form-btns {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.btn-cancel, .btn-submit {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel { background: #f5f5f5; color: #666; }
.btn-submit { background: #1890FF; color: #fff; }
</style>
