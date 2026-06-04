<template>
  <div class="gantt-container">
    <a-card :bordered="false">
      <template #title>
        <a-space>
          <BarChartOutlined />
          <span>甘特图</span>
          <a-tag v-if="events.length" color="blue">{{ events.length }} 项</a-tag>
          <a-tag v-else color="default">加载中</a-tag>
        </a-space>
      </template>
      <template #extra>
        <a-space>
          <a-button @click="handlePrev">
            <template #icon><LeftOutlined /></template>
          </a-button>
          <span class="gantt-date-range">{{ dateRangeText }}</span>
          <a-button @click="handleNext">
            <template #icon><RightOutlined /></template>
          </a-button>
          <a-button @click="goBack">
            <template #icon><ArrowLeftOutlined /></template>
            返回计划管理
          </a-button>
        </a-space>
      </template>

      <a-spin :spinning="loading">
        <div class="gantt-wrapper" v-if="events.length">
          <!-- 缩放控制 -->
          <div class="gantt-controls">
            <a-slider
              v-model:value="dayWidth"
              :min="30"
              :max="200"
              :step="10"
              style="width: 200px"
            />
            <span style="font-size: 12px; color: #888;">缩放</span>
          </div>

          <!-- 甘特图主体 -->
          <div class="gantt-viewport" ref="viewportRef">
            <!-- 左侧标签列 -->
            <div class="gantt-labels" :style="{ marginTop: headerHeight + 'px' }">
              <div
                class="gantt-label-row"
                v-for="event in events"
                :key="'label-' + event.id"
                :style="{ height: rowHeight + 'px' }"
              >
                <div class="gantt-label-text" :title="event.title">
                  {{ event.title }}
                </div>
                <div class="gantt-label-time">
                  {{ formatDate(event.startTime) }}
                </div>
              </div>
            </div>

            <!-- 右侧时间线 -->
            <div class="gantt-timeline" ref="timelineRef">
              <!-- 日期头 -->
              <div class="gantt-header" ref="headerRef">
                <div
                  class="gantt-header-cell"
                  v-for="day in days"
                  :key="day.date"
                  :class="{ weekend: day.isWeekend }"
                  :style="{ width: dayWidth + 'px', minWidth: dayWidth + 'px' }"
                >
                  <div class="gantt-header-weekday">{{ day.weekday }}</div>
                  <div class="gantt-header-date">{{ day.label }}</div>
                </div>
              </div>

              <!-- 时间线行 -->
              <div class="gantt-rows">
                <div
                  class="gantt-row"
                  v-for="event in events"
                  :key="'row-' + event.id"
                  :style="{ height: rowHeight + 'px' }"
                >
                  <!-- 网格线 -->
                  <div
                    class="gantt-gridline"
                    v-for="day in days"
                    :key="'grid-' + day.date"
                    :class="{ weekend: day.isWeekend }"
                    :style="{ width: dayWidth + 'px', minWidth: dayWidth + 'px' }"
                  />

                  <!-- 条形图 -->
                  <div
                    v-if="getBarStyle(event)"
                    class="gantt-bar"
                    :style="getBarStyle(event)"
                    :class="getBarClass(event)"
                    @click="handleBarClick(event)"
                    :title="event.title"
                  >
                    <span class="gantt-bar-inner">
                      {{ event.title }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <a-empty v-else description="暂无日程数据，请先在日程管理添加事件" />
      </a-spin>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getScheduleList } from '@/api/plan/schedule'
import { message } from 'ant-design-vue'
import { BarChartOutlined, LeftOutlined, RightOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'

const router = useRouter()

const loading = ref(false)
const events = ref<any[]>([])

// 甘特图配置
const rowHeight = 40
const headerHeight = 44
const dayWidth = ref(80)

// 当前可视范围中心时间戳
const centerTime = ref(Date.now())

const viewportRef = ref<HTMLDivElement>()
const timelineRef = ref<HTMLDivElement>()
const headerRef = ref<HTMLDivElement>()

// 所有事件的起止范围
const range = computed(() => {
  if (!events.value.length) return { min: 0, max: 0 }
  let min = Infinity
  let max = -Infinity
  events.value.forEach((e: any) => {
    if (e.startTime && e.startTime < min) min = e.startTime
    if (e.endTime && e.endTime > max) max = e.endTime
  })
  // 没有时间范围则用今天
  if (min === Infinity) {
    const today = new Date()
    min = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    max = min + 86400000
  }
  // 留点边距
  const pad = (max - min) * 0.1 || 86400000
  return { min: min - pad, max: max + pad }
})

// 生成日期头
const days = computed(() => {
  const { min, max } = range.value
  if (!min || !max) return []
  const startDate = new Date(min)
  const endDate = new Date(max)
  const result: any[] = []
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  while (current.getTime() <= endDate.getTime()) {
    const dow = current.getDay()
    result.push({
      date: current.getTime(),
      label: `${current.getMonth() + 1}/${current.getDate()}`,
      weekday: ['日', '一', '二', '三', '四', '五', '六'][dow],
      isWeekend: dow === 0 || dow === 6
    })
    current.setDate(current.getDate() + 1)
  }
  return result
})

const dateRangeText = computed(() => {
  if (!days.value.length) return ''
  const first = days.value[0]
  const last = days.value[days.value.length - 1]
  return `${first.label} - ${last.label}`
})

// 计算条形图位置
const getBarStyle = (event: any) => {
  const { min, max } = range.value
  if (!min || !max || !event.startTime || !event.endTime) return null
  const totalPixels = days.value.length * dayWidth.value
  const totalMs = max - min
  const left = ((event.startTime - min) / totalMs) * totalPixels
  const width = ((event.endTime - event.startTime) / totalMs) * totalPixels
  return {
    left: left + 'px',
    width: Math.max(width, 8) + 'px'
  }
}

const getBarClass = (event: any) => {
  const status = event.status
  return {
    'gantt-bar-done': status === 1 || status === 2,
    'gantt-bar-pending': status === 0,
    'gantt-bar-canceled': status === 3
  }
}

const formatDate = (ts: number) => {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

const handleBarClick = (event: any) => {
  // 点击条形图跳转到日程管理查看详情
  router.push({
    path: '/plan/schedule',
    query: { highlight: String(event.id) }
  })
}

const goBack = () => {
  router.push('/plan/info')
}

const handlePrev = () => {
  centerTime.value -= 7 * 86400000
}

const handleNext = () => {
  centerTime.value += 7 * 86400000
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getScheduleList({})
    events.value = res?.data || res || []
  } catch (e) {
    console.error('获取甘特图数据失败:', e)
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.gantt-container {
  padding: 16px;
}

.gantt-date-range {
  font-size: 13px;
  color: #666;
  min-width: 120px;
  text-align: center;
}

.gantt-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.gantt-viewport {
  display: flex;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

/* 左侧标签 */
.gantt-labels {
  flex-shrink: 0;
  width: 160px;
  border-right: 2px solid #e8e8e8;
  background: #fafafa;
  overflow: hidden;
}

.gantt-label-row {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 10px;
  border-bottom: 1px solid #f0f0f0;
  overflow: hidden;
}

.gantt-label-text {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.gantt-label-time {
  font-size: 11px;
  color: #999;
  line-height: 1.2;
}

/* 右侧时间线 */
.gantt-timeline {
  flex: 1;
  overflow-x: auto;
  position: relative;
}

/* 日期头 */
.gantt-header {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fafafa;
  border-bottom: 2px solid #e8e8e8;
}

.gantt-header-cell {
  flex-shrink: 0;
  text-align: center;
  padding: 4px 0;
  border-right: 1px solid #f0f0f0;
  user-select: none;
}

.gantt-header-cell.weekend {
  background: #fff8f0;
}

.gantt-header-weekday {
  font-size: 11px;
  color: #999;
  line-height: 1.4;
}

.gantt-header-date {
  font-size: 12px;
  color: #333;
  font-weight: 500;
  line-height: 1.4;
}

.gantt-header-cell.weekend .gantt-header-date {
  color: #fa8c16;
}

/* 行 */
.gantt-rows {
  position: relative;
}

.gantt-row {
  position: relative;
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.gantt-row:last-child {
  border-bottom: none;
}

.gantt-gridline {
  flex-shrink: 0;
  border-right: 1px solid #f5f5f5;
}

.gantt-gridline.weekend {
  background: #fffbf0;
}

/* 条形图 */
.gantt-bar {
  position: absolute;
  top: 4px;
  bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: opacity 0.2s, box-shadow 0.2s;
  z-index: 2;
  min-width: 8px;
}

.gantt-bar:hover {
  opacity: 0.85;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 5;
}

.gantt-bar-inner {
  font-size: 11px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 6px;
  line-height: 1;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 颜色按状态 */
.gantt-bar-pending {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
}

.gantt-bar-done {
  background: linear-gradient(135deg, #52c41a, #73d13d);
}

.gantt-bar-canceled {
  background: linear-gradient(135deg, #d9d9d9, #bfbfbf);
}

.gantt-bar-pending .gantt-bar-inner {
  color: #fff;
}
.gantt-bar-done .gantt-bar-inner {
  color: #fff;
}
.gantt-bar-canceled .gantt-bar-inner {
  color: #999;
}
</style>
