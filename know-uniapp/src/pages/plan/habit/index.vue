<template>
  <view class="plan-habit-page">
    <!-- 统计 -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="num">{{ stats.activeCount }}</text>
        <text class="label">进行中</text>
      </view>
      <view class="stat-item">
        <text class="num success">{{ stats.completedCount }}</text>
        <text class="label">已完成</text>
      </view>
      <view class="stat-item">
        <text class="num">{{ stats.totalCheckins }}</text>
        <text class="label">累计打卡</text>
      </view>
    </view>

    <!-- 日历 + 打卡列表（日历在前，列表在后） -->
    <scroll-view scroll-y class="calendar-scroll">
      <uni-calendar
        :insert="true"
        :lunar="false"
        :selected="calendarSelected"
        @change="onDateTap"
        @monthSwitch="onMonthSwitch"
      />
      <view class="calendar-day-title">
        <text>{{ selectedDateLabel ? selectedDateLabel + ' 打卡详情' : '点击日期查看打卡' }}</text>
      </view>
      <view v-if="dayHabitRecords.length === 0 && selectedDateLabel" class="empty-state">
        <text class="empty-icon">🎯</text>
        <text class="empty-text">该日无打卡记录</text>
      </view>
      <view
        v-for="item in dayHabitRecords"
        :key="item.habitId"
        class="habit-card"
      >
        <view class="habit-header">
          <view class="habit-info">
            <text class="habit-name">{{ item.habitName }}</text>
            <text class="habit-desc">{{ item.description || '坚持每天打卡' }}</text>
          </view>
          <view class="habit-status">
            <text v-if="item.checked" class="tag done">已打卡</text>
            <text v-else class="tag doing">未打卡</text>
          </view>
        </view>
        <view class="habit-streak" style="margin-top:16rpx">
          <text>🔥 连续 {{ item.currentDays || 0 }} 天</text>
          <button v-if="!item.checked" class="checkin-btn" @tap="handleQuickCheckin(item)">打卡</button>
          <text v-else class="checked-text">✅ 已打卡</text>
        </view>
      </view>
      <view style="height:120rpx"></view>
    </scroll-view>

    <!-- 新增按钮 -->
    <view class="add-btn-fixed" @tap="showAddModal">
      <text>+</text>
    </view>

    <!-- 新增/编辑弹窗 -->
    <view class="modal-mask" v-if="showModal" @tap="hideModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text>{{ isEdit ? '编辑习惯' : '新增习惯' }}</text>
          <text class="close" @tap="hideModal">✕</text>
        </view>
        <view class="modal-form">
          <u-input v-model="form.name" placeholder="习惯名称" border="true" :customStyle="{ marginBottom: '20rpx', padding: '20rpx' }" />
          <textarea v-model="form.description" placeholder="描述" class="form-textarea" />
          <view class="form-row">
            <text class="form-label">目标天数</text>
            <u-input v-model="form.targetDays" type="number" border="true" :customStyle="{ width: '160rpx', padding: '12rpx 16rpx', textAlign: 'center' }" />
          </view>
          <view class="form-btns">
            <button class="btn-cancel" @tap="hideModal">取消</button>
            <button class="btn-submit" @tap="handleSave">保存</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getHabitStats, addHabit, updateHabit, checkinHabit, deleteHabit, getCalendarMonthly } from '@/api/plan/habit'

const stats = ref({ activeCount: 0, completedCount: 0, totalCheckins: 0 })
const showModal = ref(false)
const isEdit = ref(false)
const editId = ref(null)

// 日历 + 列表
const calendarSelected = ref([])
const selectedDateLabel = ref('')
const dayHabitRecords = ref([])
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const allHabits = ref([])

const form = reactive({
  name: '',
  description: '',
  targetDays: 30
})

const fetchStats = async () => {
  try {
    const res = await getHabitStats({})
    stats.value = res || { activeCount: 0, completedCount: 0, totalCheckins: 0 }
  } catch (e) {
    console.error('获取统计失败', e)
  }
}

const showAddModal = () => {
  isEdit.value = false
  form.name = ''
  form.description = ''
  form.targetDays = 30
  editId.value = null
  showModal.value = true
}

const hideModal = () => { showModal.value = false }

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
    fetchStats()
    fetchCalendarMonthly()
    if (selectedDateLabel.value) {
      // 重新解析当前选中日期的打卡状态
      const parts = selectedDateLabel.value.split('-')
      const day = parseInt(parts[2])
      dayHabitRecords.value = allHabits.value.map(h => ({
        habitId: h.habitId || h.id,
        habitName: h.habitName || h.name || '未命名习惯',
        checked: (h.checkinDays || []).includes(day),
        currentDays: h.currentDays || 0,
        description: h.description || ''
      }))
    }
  } catch (e) {
    console.error(e)
  }
}

// ===== 日历模式 =====
const formatDateStr = (ts) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const fetchCalendarMonthly = async () => {
  try {
    const res = await getCalendarMonthly({ year: currentYear.value, month: currentMonth.value })
    if (!res) return
    // 保存所有习惯信息
    const habitsMap = res.habits || {}
    allHabits.value = Object.keys(habitsMap).map(k => {
      const habit = habitsMap[k] || {}
      return {
        id: habit.habitId || habit.id || k,
        habitId: habit.habitId || habit.id || k,
        habitName: habit.habitName || habit.name || '未命名习惯',
        description: habit.description || '',
        currentDays: habit.currentDays || 0,
        checkinDays: habit.checkinDays || []
      }
    })

    // 有习惯即有打卡内容 → 标记整个月所有日期
    const marks = []
    const hasActive = Object.keys(habitsMap).length > 0
    if (hasActive) {
      const daysInMonth = new Date(currentYear.value, currentMonth.value, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        marks.push({ date: `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}` })
      }
    }
    calendarSelected.value = marks
    calRenderKey.value++ // 强制日历重新渲染标记
  } catch (e) {
    console.error('获取日历数据失败', e)
  }
}

const onMonthSwitch = (e) => {
  currentYear.value = e.year || e.currentYear || new Date().getFullYear()
  currentMonth.value = e.month || e.currentMonth || new Date().getMonth() + 1
  selectedDateLabel.value = ''
  dayHabitRecords.value = []
  fetchCalendarMonthly()
}

const onDateTap = (e) => {
  let dateStr = ''
  if (typeof e === 'string') {
    dateStr = e
  } else if (e && typeof e === 'object') {
    dateStr = e.fulldate || `${e.year}-${String(e.month).padStart(2, '0')}-${String(e.date).padStart(2, '0')}`
  }
  if (!dateStr) return
  selectedDateLabel.value = dateStr

  // 计算选中日期是哪一天
  const parts = dateStr.split('-')
  const day = parseInt(parts[2])

  // 检查每个习惯在该日是否有打卡
  dayHabitRecords.value = allHabits.value.map(h => {
    const checked = (h.checkinDays || []).includes(day)
    return {
      habitId: h.habitId || h.id,
      habitName: h.habitName || h.name || '未命名习惯',
      checked,
      currentDays: h.currentDays || 0,
      description: h.description || ''
    }
  })
}

const handleQuickCheckin = async (item) => {
  try {
    await checkinHabit(item.habitId, {})
    uni.showToast({ title: '打卡成功!', icon: 'success' })
    // 刷新当前视图
    item.checked = true
    fetchStats()
    fetchCalendarMonthly()
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchStats()
  fetchCalendarMonthly()
})
</script>

<style scoped>
.plan-habit-page {
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

.habit-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin: 0 20rpx 16rpx;
}

.habit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.habit-info { display: flex; flex-direction: column; }
.habit-name { font-size: 32rpx; font-weight: 500; color: #333; }
.habit-desc { font-size: 24rpx; color: #999; margin-top: 8rpx; }

.tag {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}
.tag.doing { background: #E6F7FF; color: #1890FF; }
.tag.done { background: #F6FFED; color: #52C41A; }

.habit-streak {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 26rpx;
  color: #666;
}

.checkin-btn {
  background: #1890FF;
  color: #fff;
  font-size: 26rpx;
  padding: 8rpx 32rpx;
  border-radius: 30rpx;
  border: none;
  line-height: 1.8;
}

.checked-text {
  font-size: 26rpx;
  color: #52C41A;
}

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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}
.empty-icon { font-size: 80rpx; }
.empty-text { font-size: 28rpx; color: #999; margin-top: 16rpx; }
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
  margin-bottom: 20rpx;
}

.form-label { font-size: 28rpx; color: #666; }

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
