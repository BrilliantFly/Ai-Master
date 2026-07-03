import { ref, computed } from 'vue'
import {
    getScheduleByDate,
    getCalendarMonthly,
    getCategoryList,
    completeSchedule,
    uncompleteSchedule
} from '@/api/plan/schedule'
import { getHolidays } from '@/api/holiday'
import {
    generateWeeks,
    calcMonthlyStats,
    quadrantColor,
    getCurrentWeekDays,
    formatYYYYMMDD
} from '@/components/calendar-grid/calendar-utils.js'

// ===== 组合式函数 =====
export function useSchedule() {
    // --- 日历状态 ---
    const currentYear = ref(new Date().getFullYear())
    const currentMonth = ref(new Date().getMonth() + 1)
    const collapsed = ref(true)

    // --- 选中日期 ---
    const selectedDateLabel = ref('')
    const currentQuadrant = ref(0)

    // --- 数据 ---
    const dayEvents = ref([])
    const categories = ref([])

    // --- 日历标记 ---
    const calendarSelected = ref([])

    // --- 完成状态 ---
    const completedMap = ref({})
    const renderKey = ref(0)

    // --- 节假日 ---
    const holidays = ref(null)

    // --- 计算属性 ---
    const formatDateStr = (ts) => {
        if (!ts) return ''
        const d = new Date(ts)
        return formatYYYYMMDD(d.getFullYear(), d.getMonth() + 1, d.getDate())
    }

    const parseTags = (raw) => {
        if (Array.isArray(raw)) return raw
        return String(raw || '')
            .split(/[,，]/)
            .map((item) => item.trim())
            .filter(Boolean)
    }

    const parseSubtasks = (raw) => {
        if (Array.isArray(raw)) return raw
        if (!raw) return []
        try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) {
                return parsed
                    .map((item) => {
                        if (typeof item === 'string') return item
                        if (item && typeof item === 'object') {
                            return {
                                text: item.text || item.title || item.name || '',
                                done: !!item.done
                            }
                        }
                        return ''
                    })
                    .filter((item) => (typeof item === 'string' ? item : item.text))
            }
        } catch (error) {
            return String(raw)
                .split(/\r?\n/)
                .map((item) => item.trim())
                .filter(Boolean)
        }
        return []
    }

    const normalizeEvent = (event) => {
        const startTime = Number(event.startTime || 0)
        const endTime = Number(event.endTime || 0)
        return {
            ...event,
            startTime,
            endTime,
            description: event.description || event.content || '',
            tags: parseTags(event.tags),
            subtasks: parseSubtasks(event.subtasks),
            progress:
                event.progress === undefined || event.progress === null
                    ? event.status === 1
                        ? 100
                        : 0
                    : Number(event.progress),
            duration:
                startTime && endTime && endTime > startTime
                    ? Math.round((endTime - startTime) / 60000)
                    : 0,
            remind:
                event.remindMinutes === null ||
                event.remindMinutes === undefined ||
                Number(event.remindMinutes) < 0
                    ? []
                    : [event.remindMinutes],
            categoryName: categories.value.find((c) => c.id === event.categoryId)?.name || ''
        }
    }

    const filteredDayEvents = computed(() => {
        const events =
            currentQuadrant.value === 0
                ? dayEvents.value
                : dayEvents.value.filter((e) => e.quadrant === currentQuadrant.value)
        return [...events].sort((a, b) => (a.startTime || 0) - (b.startTime || 0))
    })

    // --- 日历网格 ---
    const weeks = computed(() => {
        return generateWeeks(
            currentYear.value,
            currentMonth.value,
            calendarSelected.value,
            holidays.value
        )
    })

    const currentWeekDays = computed(() => {
        return getCurrentWeekDays()
    })

    const monthlyStats = computed(() => {
        return calcMonthlyStats(calendarSelected.value)
    })

    let holidaysYear = 0 // 跟踪已获取的年份
    // --- 获取节假日 ---
    const fetchHolidays = async (year) => {
        const y = year || currentYear.value
        if (y !== holidaysYear) {
            holidays.value = await getHolidays(y)
            if (holidays.value) holidaysYear = y
        }
    }

    // --- 获取月度日历数据 ---
    const fetchCalendarMonthly = async () => {
        try {
            const res = await getCalendarMonthly({
                year: currentYear.value,
                month: currentMonth.value
            })
            if (!res) return
            calendarSelected.value = (res.events || [])
                .filter((e) => e.startTime)
                .map((e) => ({
                    date: formatDateStr(e.startTime),
                    quadrant: e.quadrant || 0,
                    status: e.status || 0,
                    id: e.id,
                    title: e.title || '',
                    content: e.content || ''
                }))
        } catch (e) {
            console.error('获取日历数据失败', e)
        }
    }

    // --- 切换月份 ---
    const onMonthSwitch = (year, month, targetDate) => {
        currentYear.value = year
        currentMonth.value = month
        fetchCalendarMonthly()
        fetchHolidays(year) // 跳转不同年份时重新获取节假日
        const nextDate = targetDate || `${year}-${String(month).padStart(2, '0')}-01`
        onDateTap(nextDate)
    }

    // --- 选中日期 ---
    const onDateTap = (dateStr) => {
        selectedDateLabel.value = dateStr
        currentQuadrant.value = 0
        fetchDayEvents(dateStr)
    }

    // --- 获取日事件 ---
    const fetchDayEvents = async (dateStr) => {
        try {
            const parts = dateStr.split('-')
            const ts = new Date(
                parseInt(parts[0]),
                parseInt(parts[1]) - 1,
                parseInt(parts[2])
            ).getTime()
            const res = await getScheduleByDate({ date: ts })
            const events = res || []
            dayEvents.value = events.map(normalizeEvent)
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

    // --- 完成/取消完成 ---
    const handleCheck = async (item) => {
        const wasCompleted = item.status === 1 || completedMap.value[item.id]
        completedMap.value = { ...completedMap.value, [item.id]: !wasCompleted }
        renderKey.value++
        try {
            if (wasCompleted) {
                await uncompleteSchedule(item.id, {})
                uni.showToast({ title: '已取消完成', icon: 'success' })
            } else {
                await completeSchedule(item.id, {})
                uni.showToast({ title: '已完成', icon: 'success' })
            }
            fetchCalendarMonthly()
        } catch (e) {
            completedMap.value = { ...completedMap.value, [item.id]: wasCompleted }
            console.error(e)
        }
    }

    // --- 折叠切换 ---
    const toggleCollapse = () => {
        collapsed.value = !collapsed.value
    }

    // --- 过滤 ---
    const filterByQuadrant = (q) => {
        currentQuadrant.value = q
    }

    // --- 初始化 ---
    const init = async () => {
        await fetchCalendarMonthly()
        await fetchHolidays()
        getCategoryList({})
            .then((res) => {
                categories.value = res || []
            })
            .catch(() => {})
        // 默认选中今天
        const now = new Date()
        const today = formatYYYYMMDD(now.getFullYear(), now.getMonth() + 1, now.getDate())
        onDateTap(today)
    }

    return {
        currentYear,
        currentMonth,
        collapsed,
        selectedDateLabel,
        currentQuadrant,
        dayEvents,
        filteredDayEvents,
        categories,
        calendarSelected,
        completedMap,
        renderKey,
        weeks,
        currentWeekDays,
        monthlyStats,
        holidays,
        quadrantColor,
        init,
        fetchCalendarMonthly,
        onMonthSwitch,
        onDateTap,
        fetchDayEvents,
        handleCheck,
        toggleCollapse,
        filterByQuadrant
    }
}
