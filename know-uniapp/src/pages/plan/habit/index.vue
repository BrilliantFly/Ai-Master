<template>
  <view class="plan-habit-page">
    <view class="page-header">
      <view>
        <text class="page-title">习惯打卡</text>
        <text class="page-subtitle">用连续打卡培养稳定节奏</text>
      </view>
      <view class="header-actions">
        <view class="premium-header-btn" @tap="showAddModal">+</view>
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
        class="habit-card premium-card"
      >
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
          <button v-if="!item.checked" class="checkin-btn" @tap="handleQuickCheckin(item)">打卡</button>
          <text v-else class="checked-text">今天已完成</text>
        </view>
      </view>

      <view style="height: 180rpx"></view>
    </scroll-view>

    <view class="floating-add" @tap="showAddModal">+</view>

    <view class="modal-mask" v-if="showModal" @tap="hideModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text>{{ isEdit ? '编辑习惯' : '新增习惯' }}</text>
          <text class="close" @tap="hideModal">×</text>
        </view>
        <view class="modal-form">
          <u-input
            v-model="form.name"
            placeholder="习惯名称"
            border="true"
            :customStyle="{ marginBottom: '20rpx', padding: '20rpx' }"
          />
          <textarea v-model="form.description" placeholder="描述" class="form-textarea" />
          <view class="form-row">
            <text class="form-label">目标天数</text>
            <u-input
              v-model="form.targetDays"
              type="number"
              border="true"
              :customStyle="{ width: '160rpx', padding: '12rpx 16rpx', textAlign: 'center' }"
            />
          </view>
          <view class="form-btns">
            <button class="btn-cancel" @tap="hideModal">取消</button>
            <button class="btn-submit" @tap="handleSave">保存</button>
          </view>
        </view>
      </view>
    </view>

    <PremiumBottomNav active="plan" />
  </view>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import PremiumBottomNav from '@/components/PremiumBottomNav.vue'
import CalendarGrid from '@/components/calendar-grid/CalendarGrid.vue'
import { addHabit, checkinHabit, getCalendarMonthly, getHabitStats, updateHabit } from '@/api/plan/habit'
import { getHolidays } from '@/api/holiday'
import { formatYYYYMMDD, generateWeeks, quadrantColor } from '@/components/calendar-grid/calendar-utils.js'

const stats = ref({ activeCount: 0, completedCount: 0, totalCheckins: 0 })
const showModal = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const collapsed = ref(true)
const selectedDateLabel = ref('')
const habitCalendarMarks = ref([])
const dayHabitRecords = ref([])
const allHabits = ref([])
const holidays = ref(null)
const holidaysYear = ref(0)

const form = reactive({
  name: '',
  description: '',
  targetDays: 30
})

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

const resetForm = () => {
  isEdit.value = false
  editId.value = null
  form.name = ''
  form.description = ''
  form.targetDays = 30
}

const showAddModal = () => {
  resetForm()
  showModal.value = true
}

const hideModal = () => {
  showModal.value = false
}

const handleSave = async () => {
  if (!form.name) {
    uni.showToast({ title: '请输入习惯名称', icon: 'none' })
    return
  }
  try {
    if (isEdit.value && editId.value) {
      await updateHabit({ id: editId.value, ...form })
    } else {
      await addHabit(form)
    }
    uni.showToast({ title: '保存成功', icon: 'success' })
    hideModal()
    await fetchStats()
    await fetchCalendarData()
  } catch (error) {
    console.error(error)
  }
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

onMounted(async () => {
  await fetchStats()
  await fetchHolidays()
  await fetchCalendarData()
  const now = new Date()
  const today = formatYYYYMMDD(now.getFullYear(), now.getMonth() + 1, now.getDate())
  onDateTap(today)
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

.habit-card {
  margin: 0 16px 10px;
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

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  width: 600rpx;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1px solid var(--color-border-light);
  font-size: 32rpx;
  font-weight: 500;
}

.close {
  color: var(--color-text-tertiary);
  font-size: 36rpx;
}

.modal-form {
  padding: 30rpx;
}

.form-textarea {
  border: 1px solid var(--color-border);
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
  margin-bottom: 20rpx;
}

.form-label {
  font-size: 28rpx;
  color: var(--color-text-secondary);
}

.form-btns {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background: var(--color-bg-app);
  color: var(--color-text-secondary);
}

.btn-submit {
  background: var(--color-primary);
  color: var(--color-btn-text);
}
</style>
