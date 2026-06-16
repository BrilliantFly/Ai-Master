<template>
  <view class="plan-habit-page">
    <view class="page-header">
      <view>
        <text class="page-title">习惯打卡</text>
        <text class="page-subtitle">用连续打卡培养稳定节奏</text>
      </view>
      <view class="header-actions">
        <view class="premium-header-btn" @tap="goAddHabit">+</view>
      </view>
    </view>

    <scroll-view scroll-y class="calendar-scroll">
      <CalendarGrid
        :year="currentYear"
        :month="currentMonth"
        :weeks="weeks"
        :current-week-days="currentWeekDays"
        :monthly-stats="monthlyStats"
        :collapsed="collapsed"
        :selected-date="selectedDateLabel"
        :event-count="dayHabitRecords.length"
        :quadrant-color="quadrantColor"
        @date-tap="onDateTap"
        @month-switch="onMonthSwitch"
        @toggle-collapse="toggleCollapse"
      />

      <view class="stats-row premium-anim-fade-up premium-anim-delay-1">
        <view class="stat-card">
          <text class="stat-num">{{ stats.activeCount }}</text>
          <text class="stat-label">进行中</text>
        </view>
        <view class="stat-card accent">
          <text class="stat-num">{{ stats.completedCount }}</text>
          <text class="stat-label">已完成</text>
        </view>
        <view class="stat-card">
          <text class="stat-num">{{ stats.totalCheckins }}</text>
          <text class="stat-label">累计打卡</text>
        </view>
      </view>

      <view class="module-summary premium-card">
        <view class="summary-item">
          <text class="summary-label">月完成率</text>
          <text class="summary-value">{{ monthlyStats.rate }}%</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">打卡天数</text>
          <text class="summary-value">{{ monthlyStats.completed }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">月天数</text>
          <text class="summary-value">{{ monthlyStats.total }}</text>
        </view>
      </view>

      <view v-if="selectedDateLabel" class="day-overview premium-card">
        <view class="overview-top">
          <text class="overview-date">{{ selectedDateLabel }}</text>
          <text class="overview-count">{{ dayHabitRecords.length }} 个习惯</text>
        </view>
        <view class="overview-chips">
          <text class="overview-chip">已打卡 {{ checkedCount }}</text>
          <text class="overview-chip">未打卡 {{ uncheckedCount }}</text>
          <text class="overview-chip">月完成率 {{ monthlyStats.rate }}%</text>
        </view>
        <view class="overview-progress" v-if="dayHabitRecords.length > 0">
          <view class="overview-bar">
            <view class="overview-fill" :style="{ width: dayCheckRate + '%' }"></view>
          </view>
          <text class="overview-rate">{{ dayCheckRate }}%</text>
        </view>
      </view>

      <view class="day-title" v-if="selectedDateLabel">
        <text>{{ selectedDateLabel }} 打卡详情</text>
      </view>

      <view v-if="dayHabitRecords.length === 0 && selectedDateLabel" class="empty-state">
        <text class="empty-icon">🎯</text>
        <text class="empty-text">该日暂无打卡记录</text>
      </view>

      <view
        v-for="item in dayHabitRecords"
        :key="item.habitId"
        class="habit-swipe-wrap"
      >
        <view class="habit-swipe-actions">
          <view
            class="habit-swipe-btn"
            :class="item.checked ? 'habit-swipe-btn-done' : 'habit-swipe-btn-checkin'"
            @tap.stop="onHabitSwipeAction(item)"
          >
            <text class="habit-swipe-icon">{{ item.checked ? '✓' : '打' }}</text>
            <text class="habit-swipe-label">{{ item.checked ? '已完成' : '打卡' }}</text>
          </view>
        </view>
        <view
          class="habit-swipe-content"
          :style="habitSwipeStyle(item.habitId)"
          @touchstart="onHabitTouchStart($event, item.habitId)"
          @touchmove="onHabitTouchMove($event, item.habitId)"
          @touchend="onHabitTouchEnd($event, item.habitId)"
        >
          <view class="habit-card premium-card">
            <view class="habit-header">
              <view class="habit-info">
                <view class="habit-title-row">
                  <text class="habit-name">{{ item.habitName }}</text>
                  <text class="habit-chip">习惯</text>
                </view>
                <text class="habit-desc">{{ item.description || '坚持每天打卡' }}</text>
              </view>
              <view class="habit-status">
                <text v-if="item.checked" class="premium-tag premium-tag-success">已打卡</text>
                <text v-else class="premium-tag premium-tag-warning">未打卡</text>
              </view>
            </view>
            <view class="habit-footer">
              <text class="streak-text">连续 {{ item.currentDays || 0 }} 天</text>
              <text :class="item.checked ? 'checked-text' : 'swipe-hint-text'">
                {{ item.checked ? '今天已完成' : '左滑打卡' }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <view style="height: 180rpx"></view>
    </scroll-view>

    <view class="floating-add" @tap="goAddHabit">+</view>

    <PremiumBottomNav active="plan" />
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import PremiumBottomNav from '@/components/PremiumBottomNav.vue'
import CalendarGrid from '@/components/calendar-grid/CalendarGrid.vue'
import { checkinHabit, getCalendarMonthly, getHabitStats } from '@/api/plan/habit'
import { getHolidays } from '@/api/holiday'
import { formatYYYYMMDD, generateWeeks, quadrantColor } from '@/components/calendar-grid/calendar-utils.js'

const stats = ref({ activeCount: 0, completedCount: 0, totalCheckins: 0 })
const hasLoaded = ref(false)

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const collapsed = ref(true)
const selectedDateLabel = ref('')
const habitCalendarMarks = ref([])
const dayHabitRecords = ref([])
const allHabits = ref([])
const holidays = ref(null)
const holidaysYear = ref(0)

const currentWeekDays = computed(() => {
  if (!weeks.value.length) return []
  const today = new Date()
  const todayStr = formatYYYYMMDD(today.getFullYear(), today.getMonth() + 1, today.getDate())
  const targetStr = selectedDateLabel.value || todayStr
  for (const week of weeks.value) {
    const found = week.find((day) => day.date === targetStr)
    if (found) {
      return week.map((day, index) => ({
        ...day,
        weekLabel: ['日', '一', '二', '三', '四', '五', '六'][index]
      }))
    }
  }
  return []
})

const weeks = computed(() => generateWeeks(currentYear.value, currentMonth.value, habitCalendarMarks.value, holidays.value))
const monthlyStats = computed(() => {
  const daysInMonth = new Date(currentYear.value, currentMonth.value, 0).getDate()
  const checkedDays = new Set(habitCalendarMarks.value.map((item) => item.date))
  const total = daysInMonth
  const completed = checkedDays.size
  return {
    total,
    completed,
    rate: total > 0 ? Math.round((completed / total) * 100) : 0
  }
})
const checkedCount = computed(() => dayHabitRecords.value.filter((item) => item.checked).length)
const uncheckedCount = computed(() => dayHabitRecords.value.filter((item) => !item.checked).length)
const dayCheckRate = computed(() => {
  if (!dayHabitRecords.value.length) return 0
  return Math.round((checkedCount.value / dayHabitRecords.value.length) * 100)
})

const HABIT_SWIPE_THRESHOLD = 42
const HABIT_SWIPE_MAX = 92
const habitSwipeOffsets = ref({})
const openHabitId = ref(null)

const closeHabitSwipe = (id) => {
  if (habitSwipeOffsets.value[id]) {
    habitSwipeOffsets.value[id].translateX = 0
  }
  if (openHabitId.value === id) {
    openHabitId.value = null
  }
}

const onHabitTouchStart = (e, id) => {
  const touch = e.touches[0]
  if (openHabitId.value !== null && openHabitId.value !== id) {
    closeHabitSwipe(openHabitId.value)
  }
  habitSwipeOffsets.value[id] = {
    startX: touch.clientX,
    currentX: touch.clientX,
    translateX: openHabitId.value === id ? -HABIT_SWIPE_MAX : 0
  }
}

const onHabitTouchMove = (e, id) => {
  const data = habitSwipeOffsets.value[id]
  if (!data) return
  const touch = e.touches[0]
  let targetX = data.translateX + (touch.clientX - data.currentX)
  targetX = Math.max(-HABIT_SWIPE_MAX, Math.min(0, targetX))
  data.translateX = targetX
  data.currentX = touch.clientX
}

const onHabitTouchEnd = (e, id) => {
  const data = habitSwipeOffsets.value[id]
  if (!data) return
  if (Math.abs(data.translateX) > HABIT_SWIPE_THRESHOLD) {
    openHabitId.value = id
    data.translateX = -HABIT_SWIPE_MAX
  } else {
    closeHabitSwipe(id)
  }
}

const habitSwipeStyle = (id) => {
  const data = habitSwipeOffsets.value[id]
  const x = data ? data.translateX : (openHabitId.value === id ? -HABIT_SWIPE_MAX : 0)
  return `transform: translateX(${x}px); transition: transform 0.25s cubic-bezier(.22,1,.36,1);`
}

const fetchStats = async () => {
  try {
    const res = await getHabitStats({})
    stats.value = res || { activeCount: 0, completedCount: 0, totalCheckins: 0 }
  } catch (error) {
    console.error('获取统计失败', error)
  }
}

const fetchHolidays = async (year = currentYear.value) => {
  if (year !== holidaysYear.value) {
    holidays.value = await getHolidays(year)
    if (holidays.value) holidaysYear.value = year
  }
}

const mapHabitRecordsForDay = (dateStr) => {
  if (!dateStr) return []
  const day = Number(dateStr.split('-')[2])
  return allHabits.value.map((habit) => {
    const checked = (habit.checkinDays || []).includes(day)
    return {
      habitId: habit.habitId || habit.id,
      habitName: habit.habitName || habit.name || '未命名习惯',
      checked,
      currentDays: habit.currentDays || 0,
      description: habit.description || ''
    }
  })
}

const fetchCalendarData = async () => {
  try {
    const res = await getCalendarMonthly({ year: currentYear.value, month: currentMonth.value })
    if (!res) return
    const habitsMap = res.habits || {}
    allHabits.value = Object.keys(habitsMap).map((key) => {
      const habit = habitsMap[key] || {}
      return {
        id: habit.habitId || habit.id || key,
        habitId: habit.habitId || habit.id || key,
        habitName: habit.habitName || habit.name || '未命名习惯',
        description: habit.description || '',
        currentDays: habit.currentDays || 0,
        checkinDays: habit.checkinDays || []
      }
    })

    const marks = []
    allHabits.value.forEach((habit) => {
      ;(habit.checkinDays || []).forEach((day) => {
        marks.push({
          date: formatYYYYMMDD(currentYear.value, currentMonth.value, day),
          quadrant: 2,
          status: 1,
          habitId: habit.habitId
        })
      })
    })
    habitCalendarMarks.value = marks
    if (selectedDateLabel.value) {
      dayHabitRecords.value = mapHabitRecordsForDay(selectedDateLabel.value)
    }
  } catch (error) {
    console.error('获取月历数据失败', error)
  }
}

const onMonthSwitch = async (year, month) => {
  currentYear.value = year
  currentMonth.value = month
  selectedDateLabel.value = ''
  dayHabitRecords.value = []
  await fetchHolidays(year)
  await fetchCalendarData()
}

const onDateTap = (dateStr) => {
  selectedDateLabel.value = dateStr
  dayHabitRecords.value = mapHabitRecordsForDay(dateStr)
}

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

const handleQuickCheckin = async (item) => {
  try {
    await checkinHabit(item.habitId, {})
    uni.showToast({ title: '打卡成功', icon: 'success' })
    await fetchStats()
    await fetchCalendarData()
    if (selectedDateLabel.value) {
      dayHabitRecords.value = mapHabitRecordsForDay(selectedDateLabel.value)
    }
  } catch (error) {
    console.error(error)
  }
}

const onHabitSwipeAction = (item) => {
  closeHabitSwipe(item.habitId)
  if (item.checked) return
  handleQuickCheckin(item)
}

const refreshHabitPage = async () => {
  await fetchStats()
  await fetchCalendarData()
  if (selectedDateLabel.value) {
    dayHabitRecords.value = mapHabitRecordsForDay(selectedDateLabel.value)
  }
}

const goAddHabit = () => {
  uni.navigateTo({ url: '/pages/plan/habit/form' })
}

onMounted(async () => {
  await fetchStats()
  await fetchHolidays()
  await fetchCalendarData()
  const now = new Date()
  const today = formatYYYYMMDD(now.getFullYear(), now.getMonth() + 1, now.getDate())
  onDateTap(today)
  hasLoaded.value = true
})

onShow(async () => {
  if (!hasLoaded.value) return
  await refreshHabitPage()
})
</script>

<style scoped>
.plan-habit-page {
  min-height: 100vh;
  background: var(--color-bg-app);
  padding-bottom: 150rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 40rpx 16rpx;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.page-title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
}

.page-subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: var(--color-text-secondary);
}

.calendar-scroll {
  padding-bottom: 20rpx;
}

.stats-row {
  display: flex;
  gap: 18rpx;
  padding: 0 32rpx 20rpx;
}

.module-summary {
  display: flex;
  justify-content: space-between;
  gap: 18rpx;
  margin: 0 16px 14px;
  padding: 20rpx 24rpx;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.summary-label {
  font-size: 22rpx;
  color: var(--color-text-tertiary);
}

.summary-value {
  margin-top: 8rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--color-text);
}

.day-overview {
  margin: 0 16px 14px;
  padding: 22rpx 24rpx;
}

.overview-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
}

.overview-date {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text);
}

.overview-count {
  font-size: 22rpx;
  color: var(--color-text-secondary);
}

.overview-chips {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-top: 14rpx;
}

.overview-chip {
  font-size: 22rpx;
  color: var(--color-text-secondary);
  background: var(--color-surface-soft);
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
}

.overview-progress {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
}

.overview-bar {
  flex: 1;
  height: 10rpx;
  border-radius: 999rpx;
  background: var(--color-surface-soft);
  overflow: hidden;
}

.overview-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--color-primary), #8980f0);
}

.overview-rate {
  font-size: 22rpx;
  font-weight: 600;
  color: var(--color-primary);
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 10rpx 26rpx;
  border-radius: var(--radius-md);
  background: var(--color-surface-soft);
  border: 2rpx solid transparent;
}

.stat-card.accent {
  background: var(--color-primary-soft);
  border-color: var(--color-primary-mist);
}

.stat-num {
  font-size: 46rpx;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
}

.stat-label {
  margin-top: 8rpx;
  font-size: 23rpx;
  color: var(--color-text-secondary);
}

.day-title {
  padding: 0 32rpx 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text);
}

.habit-swipe-wrap {
  position: relative;
  margin: 0 16px 10px;
  border-radius: 14px;
  overflow: hidden;
}

.habit-swipe-actions {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
}

.habit-swipe-btn {
  width: 92px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: #fff;
}

.habit-swipe-btn-checkin {
  background: linear-gradient(135deg, var(--color-primary), #8980f0);
}

.habit-swipe-btn-done {
  background: linear-gradient(135deg, var(--color-success), #5ac8a0);
}

.habit-swipe-icon {
  font-size: 30rpx;
  font-weight: 700;
}

.habit-swipe-label {
  font-size: 24rpx;
  font-weight: 600;
}

.habit-swipe-content {
  position: relative;
  z-index: 2;
  background: var(--color-surface);
  will-change: transform;
}

.habit-card {
  margin: 0;
  padding: 24rpx 28rpx;
}

.habit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
}

.habit-info {
  display: flex;
  flex-direction: column;
}

.habit-title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-wrap: wrap;
}

.habit-name {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-text);
}

.habit-chip {
  font-size: 20rpx;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}

.habit-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--color-text-secondary);
}

.habit-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18rpx;
}

.streak-text {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  background: var(--color-surface-soft);
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
}

.checkin-btn {
  background: linear-gradient(135deg, var(--color-primary), #8980f0);
  color: #fff;
  font-size: 26rpx;
  padding: 8rpx 30rpx;
  border-radius: 999rpx;
  border: none;
  line-height: 1.8;
}

.checked-text {
  font-size: 24rpx;
  color: var(--color-success);
}

.swipe-hint-text {
  font-size: 24rpx;
  color: var(--color-text-tertiary);
}

.floating-add {
  position: fixed;
  right: 40rpx;
  bottom: 122rpx;
  z-index: 50;
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), #8980f0);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64rpx;
  box-shadow: var(--shadow-glow);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
}

.empty-text {
  font-size: 28rpx;
  color: var(--color-text-tertiary);
  margin-top: 16rpx;
}
</style>
