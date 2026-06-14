# 日历页面改版实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 替换 `uni-calendar` 为自建日历组件，支持格子内四象限彩色圆点、农历/节假日、折叠展开、月完成率

**Architecture:**
- 将现有 968 行 index.vue 拆分为：`CalendarGrid.vue`（自建日历）、`EventList.vue`（事件列表）、`AddScheduleModal.vue`（添加弹窗）、`useSchedule.js`（组合式逻辑）
- 日历格子内渲染：公历日期 + 农历小字 + 节假日标注 + 四象限颜色圆点
- 节假日数据从 `timor.tech` API 获取并缓存到 localStorage
- 农历引擎从 `uni-calendar/util.js` 复用（已有完整农历库）

**Tech Stack:** uni-app (Vue 3), CSS variables, timor.tech API

**Files:**
- Create: `src/pages/plan/schedule/components/CalendarGrid.vue`
- Create: `src/pages/plan/schedule/components/EventList.vue`
- Create: `src/pages/plan/schedule/components/AddScheduleModal.vue`
- Create: `src/pages/plan/schedule/composables/useSchedule.js`
- Delete: `src/pages/plan/schedule/components/` (empty dir initial)
- Modify: `src/pages/plan/schedule/index.vue` (重写)
- Modify: `src/uni_modules/uni-calendar/components/uni-calendar/calendar.js` (如果直接引用农历引擎)

---

### 前置确认

- [ ] **Step 0: 确认农历库路径**

检查 `uni-calendar` 的农历引擎导出方式，确认能否直接 `import`：

```bash
grep -n "export" src/uni_modules/uni-calendar/components/uni-calendar/calendar.js
```

该文件是 CommonJS? ES Module? 如果无导出，准备复制到 `composables/` 下直接引用。

---

## Chunk 1: 基础设施 — composables + 工具函数

**Files:**
- Create: `src/pages/plan/schedule/composables/useSchedule.js`

- [ ] **Step 1: 创建 useSchedule.js（组合式函数）**

从现有 `index.vue` 提取所有业务逻辑到组合式函数：

```js
import { ref, computed } from 'vue'
import { getScheduleByDate, getCalendarMonthly, getCategoryList, getTodayStats, completeSchedule, deleteSchedule } from '@/api/plan/schedule'
import { getHolidays } from '@/api/holiday'  // 新增（Chunk 3）

export function useSchedule() {
  // === 日历状态 ===
  const currentYear = ref(new Date().getFullYear())
  const currentMonth = ref(new Date().getMonth() + 1)
  const currentDate = ref('')  // '2026-06-14'
  const collapsed = ref(false) // 日历折叠状态

  // === 选中日期 ===
  const selectedDateLabel = ref('')
  const currentQuadrant = ref(0)

  // === 日程数据 ===
  const dayEvents = ref([])
  const categories = ref([])

  // === 日历标记（圆点数据）===
  const calendarSelected = ref([])

  // === 完成状态 ===
  const completedMap = ref({})
  const renderKey = ref(0)

  // === 月度统计数据 ===
  const monthlyStats = computed(() => {
    const total = calendarSelected.value.length
    const done = Object.values(completedMap.value).filter(Boolean).length
    return { total, completed: done, rate: total > 0 ? Math.round(done / total * 100) : 0 }
  })

  // === 格式化 ===
  const formatDateStr = (ts) => {
    const d = new Date(ts)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  // === 获取月度日历数据 ===
  const fetchCalendarMonthly = async () => {
    try {
      const res = await getCalendarMonthly({ year: currentYear.value, month: currentMonth.value })
      if (!res) return
      // 保留完整的 event 信息（含 quadrant），不仅仅是日期标记
      const events = (res.events || []).filter(e => e.startTime)
      calendarSelected.value = events.map(e => ({
        date: formatDateStr(e.startTime),
        quadrant: e.quadrant || 0,
        status: e.status || 0
      }))
    } catch (e) {
      console.error('获取日历数据失败', e)
    }
  }

  // === 切换月份 ===
  const onMonthSwitch = (year, month) => {
    currentYear.value = year
    currentMonth.value = month
    fetchCalendarMonthly()
    // 切换后选中 1 号
    const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
    onDateTap(firstDay)
  }

  // === 选中日期 ===
  const onDateTap = (dateStr) => {
    selectedDateLabel.value = dateStr
    currentQuadrant.value = 0
    fetchDayEvents(dateStr)
  }

  // === 获取日事件 ===
  const fetchDayEvents = async (dateStr) => {
    try {
      const parts = dateStr.split('-')
      const ts = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).getTime()
      const res = await getScheduleByDate({ date: ts })
      const events = res || []
      dayEvents.value = events.map(e => ({
        ...e,
        categoryName: categories.value.find(c => c.id === e.categoryId)?.name || ''
      }))
      const totalCount = events.length
      const completedCount = events.filter(e => e.status === 1).length
      // 同步 completedMap
      const map = {}
      for (const e of events) {
        if (e.status === 1) map[e.id] = true
      }
      completedMap.value = { ...completedMap.value, ...map }
    } catch (e) {
      console.error('获取当日日程失败', e)
    }
  }

  // === 完成/取消完成 ===
  const handleCheck = async (item) => {
    completedMap.value = { ...completedMap.value, [item.id]: true }
    renderKey.value++
    try {
      await completeSchedule(item.id, {})
      uni.showToast({ title: '已完成', icon: 'success' })
      fetchCalendarMonthly()
    } catch (e) {
      console.error(e)
    }
  }

  // === 四象限筛选 ===
  const filteredDayEvents = computed(() => {
    if (currentQuadrant.value === 0) return dayEvents.value
    return dayEvents.value.filter(e => e.quadrant === currentQuadrant.value)
  })

  // === 折叠 ===
  const toggleCollapse = () => { collapsed.value = !collapsed.value }

  return {
    currentYear, currentMonth, currentDate, collapsed,
    selectedDateLabel, currentQuadrant,
    dayEvents, filteredDayEvents, categories,
    calendarSelected, completedMap, renderKey, monthlyStats,
    fetchCalendarMonthly, onMonthSwitch, onDateTap,
    fetchDayEvents, handleCheck, toggleCollapse
  }
}
```

- [ ] **Step 2: 复制农历库**

```bash
cp src/uni_modules/uni-calendar/components/uni-calendar/calendar.js src/pages/plan/schedule/composables/lunar-calendar.js
```

检查其导出方式，若未导出则添加：

```js
// 在文件末尾追加
export default {
  solar2lunar,
  lunar2solar
}
```

---

## Chunk 2: 创建 CalendarGrid.vue

**Files:**
- Create: `src/pages/plan/schedule/components/CalendarGrid.vue`

- [ ] **Step 3: 编写 CalendarGrid.vue 基础网格**

```vue
<template>
  <view class="cal-card">
    <!-- 月份导航栏 -->
    <view class="cal-nav">
      <view class="nav-arrows">
        <text class="nav-arrow" @tap="prevMonth">◀</text>
        <text class="nav-title">{{ currentYear }} / {{ String(currentMonth).padStart(2, '0') }}</text>
        <text class="nav-arrow" @tap="nextMonth">▶</text>
      </view>
      <view class="nav-actions">
        <text class="today-btn" @tap="goToday">今天</text>
        <text class="collapse-btn" @tap="$emit('toggleCollapse')">
          {{ collapsed ? '▼' : '▲' }}
        </text>
      </view>
    </view>

    <!-- 折叠状态：只显示当前周 -->
    <template v-if="collapsed">
      <view class="cal-week-row" v-if="currentWeekDays.length">
        <text
          v-for="day in currentWeekDays"
          :key="day.date"
          class="week-day"
          :class="{ 'is-today': day.isToday, 'is-selected': day.date === selectedDate }"
          @tap="$emit('dateTap', day.date)"
        >
          <text class="wd-num">{{ day.day }}</text>
          <text class="wd-label">{{ day.weekLabel }}</text>
        </text>
      </view>
      <view class="cal-summary">今日 · {{ eventCount }} 项日程</view>
    </template>

    <!-- 展开状态：完整月视图 -->
    <template v-else>
      <view class="cal-weekdays">
        <text v-for="w in weekDays" :key="w" class="wd-header">{{ w }}</text>
      </view>
      <view class="cal-grid">
        <view
          v-for="(week, wi) in weeks"
          :key="wi"
          class="cal-week"
        >
          <view
            v-for="day in week"
            :key="day.date"
            class="cal-day"
            :class="{
              'other-month': !day.isCurrentMonth,
              'is-today': day.isToday,
              'is-selected': day.date === selectedDate,
              'is-holiday': day.isHoliday,
              'is-workday': day.isWorkday  // 补班日
            }"
            @tap="$emit('dateTap', day.date)"
          >
            <text class="day-num">{{ day.day }}</text>
            <!-- 农历 -->
            <text class="day-lunar" v-if="day.lunar">{{ day.lunar }}</text>
            <!-- 节假日名 -->
            <text class="day-holiday-name" v-if="day.holidayName">{{ day.holidayName }}</text>
            <!-- 事件圆点 -->
            <view class="day-dots" v-if="day.events.length">
              <view
                v-for="(evt, ei) in day.events.slice(0, 3)"
                :key="ei"
                class="event-dot"
                :class="{ done: evt.status === 1 }"
                :style="{ background: quadrantColor(evt.quadrant) }"
              ></view>
              <text v-if="day.events.length > 3" class="more-dots">+{{ day.events.length - 3 }}</text>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- 月完成率 -->
    <view class="month-progress" v-if="!collapsed">
      <text class="mp-label">本月完成率</text>
      <text class="mp-value">{{ monthlyRate }}%</text>
      <view class="mp-bar">
        <view class="mp-fill" :style="{ width: monthlyRate + '%' }"></view>
      </view>
    </view>
  </view>
</template>
```

- [ ] **Step 4: 实现 dateUtils（周计算、农历查询、节假日映射）**

在 `useSchedule.js` 中或单独文件实现以下工具函数：

```js
// 生成 6×7 日期矩阵
function generateWeeks(year, month, events, holidays, lunarData) {
  const firstDay = new Date(year, month - 1, 1).getDay()  // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysInPrev = new Date(year, month - 1, 0).getDate()

  const allDays = []

  // 上月填充
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i
    const dateStr = formatYYYYMMDD(year, month - 1, d)
    allDays.push(buildDay(dateStr, d, false, year, month - 1, events, holidays, lunarData))
  }
  // 当月
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatYYYYMMDD(year, month, d)
    allDays.push(buildDay(dateStr, d, true, year, month, events, holidays, lunarData))
  }
  // 下月填充
  const remaining = 42 - allDays.length
  for (let d = 1; d <= remaining; d++) {
    const dateStr = formatYYYYMMDD(year, month + 1, d)
    allDays.push(buildDay(dateStr, d, false, year, month + 1, events, holidays, lunarData))
  }

  // 分割成 6 周
  const weeks = []
  for (let i = 0; i < 42; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }
  return weeks
}

function buildDay(dateStr, day, isCurrentMonth, year, month, events, holidays, lunarData) {
  const eventList = events.filter(e => e.date === dateStr) || []
  const holiday = holidays ? holidays[dateStr] : null
  const lunar = getLunarDate(year, month, day)  // 调用农历库
  return {
    date: dateStr,
    day,
    isCurrentMonth,
    isToday: dateStr === todayStr(),
    isHoliday: holiday?.holiday === true,
    isWorkday: holiday?.holiday === false && holiday?.name,
    holidayName: holiday?.holiday === true ? holiday.name : '',
    lunar: lunar.day === 1 ? lunar.monthName + '月' : lunar.dayName,
    events: eventList,
    weekLabel: ['日','一','二','三','四','五','六'][new Date(dateStr).getDay()]
  }
}
```

- [ ] **Step 5: 获取当前周（折叠用）**

```js
function getCurrentWeekDays(year, month) {
  const today = new Date()
  const dayOfWeek = today.getDay()  // 0=Sun
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - dayOfWeek)  // 周日开始

  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    days.push({
      date: formatYYYYMMDD(d.getFullYear(), d.getMonth() + 1, d.getDate()),
      day: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
      weekLabel: ['日','一','二','三','四','五','六'][i]
    })
  }
  return days
}
```

- [ ] **Step 6: CalendarGrid.vue 样式**

```css
.cal-card {
  background: #fff;
  border-radius: 14px;
  padding: 12px 8px 8px;
  margin: 0 16px 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.cal-nav {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 4px 8px;
}
.nav-arrows { display: flex; align-items: center; gap: 10px; }
.nav-arrow { font-size: 14px; color: #FF8700; padding: 4px 6px; }
.nav-title { font-size: 16px; font-weight: 600; }
.today-btn {
  font-size: 12px; color: #FF8700; background: #FFF0E0;
  padding: 3px 10px; border-radius: 12px;
}
.collapse-btn { font-size: 12px; color: #8e8e93; margin-left: 8px; }

/* 工作日历表头 */
.cal-weekdays {
  display: flex;
}
.wd-header {
  flex: 1; text-align: center;
  font-size: 11px; color: #8e8e93; padding: 4px 0;
}

/* 日历网格 */
.cal-grid { }
.cal-week { display: flex; }
.cal-day {
  flex: 1; min-height: 48px;
  display: flex; flex-direction: column; align-items: center;
  padding: 2px 0; position: relative;
}
.cal-day.other-month .day-num { color: #d1d1d6; }
.cal-day.is-today .day-num {
  background: #FF8700; color: white;
  width: 26px; height: 26px; line-height: 26px;
  border-radius: 50%; font-weight: 700;
}
.cal-day.is-selected .day-num { color: #FF8700; font-weight: 600; }
.cal-day.is-holiday .day-num { color: #FF3B30; }
.cal-day.is-workday .day-num { color: #8e8e93; text-decoration: underline; }

.day-num { font-size: 14px; font-weight: 500; text-align: center; }
.day-lunar { font-size: 9px; color: #c7c7cc; line-height: 1; margin-top: 1px; }
.day-holiday-name { font-size: 8px; color: #FF3B30; line-height: 1; }

/* 事件圆点 */
.day-dots {
  display: flex; justify-content: center; gap: 2px;
  flex-wrap: wrap; min-height: 10px; margin-top: 2px;
}
.event-dot { width: 5px; height: 5px; border-radius: 50%; }
.event-dot.done { opacity: 0.35; }
.more-dots { font-size: 8px; color: #8e8e93; }

/* 折叠状态：当前周 */
.cal-week-row {
  display: flex; padding: 8px 4px;
}
.week-day {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 2px; padding: 6px 2px;
  border-radius: 10px;
}
.week-day.is-today { background: #FFF0E0; }
.week-day.is-selected { background: #f2f2f7; }
.wd-num { font-size: 16px; font-weight: 600; }
.wd-label { font-size: 10px; color: #8e8e93; }
.cal-summary { font-size: 12px; color: #8e8e93; padding: 4px 8px 8px; }

/* 月完成率 */
.month-progress {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 8px 0; margin-top: 4px;
  border-top: 1px solid #f2f2f7;
}
.mp-label { font-size: 11px; color: #8e8e93; }
.mp-value { font-size: 11px; color: #34c759; font-weight: 600; }
.mp-bar { flex: 1; height: 4px; background: #e5e5ea; border-radius: 2px; }
.mp-fill { height: 100%; background: #34c759; border-radius: 2px; }
```

---

## Chunk 3: 节假日 API

**Files:**
- Create: `src/api/holiday.js`

- [ ] **Step 7: 创建节假日 API 封装**

```js
const HOLIDAY_CACHE_KEY = 'holiday_cache'
const CACHE_DURATION = 3600 * 24 * 365 * 1000  // 1 年

export async function getHolidays(year) {
  // 先检查缓存
  const cached = getCache(year)
  if (cached) return cached

  try {
    const [res, err] = await uni.request({
      url: `https://timor.tech/api/holiday/year/${year}`,
      method: 'GET'
    })
    if (err) throw err
    if (res.data && res.data.code === 0) {
      setCache(year, res.data.holiday)
      return res.data.holiday
    }
    return null
  } catch (e) {
    console.error('获取节假日失败', e)
    return null
  }
}

function getCache(year) {
  try {
    const raw = uni.getStorageSync(HOLIDAY_CACHE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.year === year && Date.now() - data.time < CACHE_DURATION) {
      return data.holidays
    }
    return null
  } catch { return null }
}

function setCache(year, holidays) {
  try {
    uni.setStorageSync(HOLIDAY_CACHE_KEY, JSON.stringify({
      year, holidays, time: Date.now()
    }))
  } catch {}
}
```

- [ ] **Step 8: 整合节假日到 useSchedule**

在 `useSchedule.js` 中添加：

```js
import { getHolidays } from '@/api/holiday'
const holidays = ref(null)

// 在 fetchCalendarMonthly 中并行拉取节假日
const fetchHolidays = async () => {
  if (!holidays.value) {
    holidays.value = await getHolidays(currentYear.value)
  }
}

// 在 onMonthSwitch 中检查跨年
const prevYear = currentYear.value
```

---

## Chunk 4: 提取 EventList.vue + AddScheduleModal.vue

- [ ] **Step 9: 创建 EventList.vue**

从 `index.vue:45-110` 提取事件列表 + 筛选逻辑：

```vue
<template>
  <view class="event-list">
    <!-- 日期标题 -->
    <view class="day-section" v-if="selectedDateLabel">
      <view class="day-header">
        <text class="day-label">{{ selectedDateLabel }} 的日程</text>
        <text class="day-count" v-if="filteredEvents.length">{{ filteredEvents.length }}项</text>
      </view>

      <!-- 四象限筛选 -->
      <scroll-view scroll-x class="filter-scroll" show-scrollbar="false">
        <view class="filter-list">
          <view
            v-for="q in quadrants"
            :key="q.value"
            class="filter-pill"
            :class="{ active: currentQuadrant === q.value }"
            @tap="$emit('quadrantChange', q.value)"
          >
            <view class="pill-dot" :style="{ background: q.color }"></view>
            <text>{{ q.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 空状态 -->
    <view v-if="filteredEvents.length === 0 && selectedDateLabel" class="empty-state">
      <text class="empty-icon">📅</text>
      <text class="empty-text">{{ currentQuadrant === 0 ? '该日暂无日程' : '该象限暂无日程' }}</text>
    </view>

    <!-- 日程卡片 -->
    <view
      v-for="item in filteredEvents"
      :key="'sched-' + item.id + '-' + renderKey"
      class="schedule-card"
      :class="{ completed: completedMap[item.id] }"
      @tap="$emit('goDetail', item)"
    >
      <!-- 卡片内容：保持现有样式 -->
      <view class="check-col">
        <view class="check-circle" :class="{ checked: completedMap[item.id] }" @tap.stop="$emit('check', item)">
          <text v-if="completedMap[item.id]">✓</text>
        </view>
      </view>
      <view class="timeline-col">
        <text class="time-text">{{ formatTime(item.startTime) }}</text>
        <view class="time-line"></view>
        <text class="time-text end">{{ formatTime(item.endTime) }}</text>
      </view>
      <view class="content-col">
        <view class="content-title">
          <text>{{ item.title }}</text>
          <text class="quadrant-tag" :style="{ background: getQuadrantColor(item.quadrant) + '22', color: getQuadrantColor(item.quadrant) }">
            {{ quadrants.find(q => q.value === item.quadrant)?.label || '' }}
          </text>
          <text v-if="item.isRepeat && item.repeatType" class="meta-repeat">{{ repeatIconMap[item.repeatType] }}</text>
        </view>
        <view class="content-meta" v-if="item.location || item.categoryName">
          <text v-if="item.location" class="content-meta-tag">📍 {{ item.location }}</text>
          <text v-if="item.categoryName" class="content-meta-tag">{{ item.categoryName }}</text>
        </view>
      </view>
    </view>
  </view>
</template>
```

**Props:** `selectedDateLabel`, `filteredEvents`, `completedMap`, `currentQuadrant`, `renderKey`, `quadrants`
**Events:** `@check`, `@quadrantChange`, `@goDetail`

- [ ] **Step 10: 创建 AddScheduleModal.vue**

从 `index.vue:120-400` 提取 Modal 表单部分，Props/Events 封装方式与现有保持一致。

**Props:** `showModal`, `form`, `categories`, `quadrants`
**Events:** `@close`, `@submit`, `@update:form`

---

## Chunk 5: 重写 index.vue + 联调

- [ ] **Step 11: 重写 index.vue**

精简后的主页面：

```vue
<template>
  <view class="plan-schedule-page">
    <view class="page-header">
      <view class="header-left">
        <text class="header-title">📅 日程计划</text>
        <text class="header-sub">高效管理你的每一天</text>
      </view>
      <view class="header-actions">
        <view class="header-btn" @tap="showAddModal">+</view>
      </view>
    </view>

    <scroll-view scroll-y class="calendar-scroll">
      <!-- 日历组件 -->
      <CalendarGrid
        :year="currentYear"
        :month="currentMonth"
        :events="calendarSelected"
        :holidays="holidays"
        :collapsed="collapsed"
        :selected-date="selectedDateLabel"
        @dateTap="onDateTap"
        @monthSwitch="onMonthSwitch"
        @toggleCollapse="toggleCollapse"
      />

      <!-- 事件列表 -->
      <EventList
        :selected-date-label="selectedDateLabel"
        :filtered-events="filteredDayEvents"
        :completed-map="completedMap"
        :current-quadrant="currentQuadrant"
        :render-key="renderKey"
        :quadrants="quadrants"
        @check="handleCheck"
        @quadrant-change="filterByQuadrant"
        @go-detail="goToDetail"
      />

      <view style="height:80px"></view>
    </scroll-view>

    <view class="fab" @tap="showAddModal">
      <text class="fab-icon">+</text>
    </view>

    <AddScheduleModal
      :show-modal="showModal"
      :form="form"
      :categories="categories"
      :quadrants="quadrants"
      @close="hideModal"
      @submit="handleAdd"
    />
  </view>
</template>

<script setup>
import CalendarGrid from './components/CalendarGrid.vue'
import EventList from './components/EventList.vue'
import AddScheduleModal from './components/AddScheduleModal.vue'
import { useSchedule } from './composables/useSchedule'

const {
  currentYear, currentMonth, collapsed,
  selectedDateLabel, currentQuadrant,
  dayEvents, filteredDayEvents, categories,
  calendarSelected, completedMap, renderKey,
  fetchCalendarMonthly, onMonthSwitch,
  onDateTap, handleCheck, toggleCollapse
} = useSchedule()

// ... 保留 Modal 表单逻辑（这部分 Change 不大）
</script>
```

- [ ] **Step 12: 编译验证**

```bash
cd E:\Ai-Master\know-uniapp
npm run build:mp-weixin
```

预期输出：`DONE  Build complete.`

用 LSP 检查语法错误（如无 Vue LSP，以 `npm run build` 为准）：

```bash
# 或仅检查编译
npx vue-tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 13: 功能验证**

验证清单：
1. 日历默认展开，显示完整月视图
2. 格子内有四象限颜色圆点（红/青/黄/灰）
3. 今天显示橙色圆形背景
4. 点击折叠按钮，切换为当前周紧凑行
5. 点击日期，下方事件列表更新
6. 月完成率进度条显示百分比
7. 农历小字显示在日期下方
8. 法定假日日期数字标红（需联调 API 确认）
9. 四象限筛选 pills 点击过滤事件列表
10. 添加、完成、删除操作正常
