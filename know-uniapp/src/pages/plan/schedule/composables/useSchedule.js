import { ref, computed } from 'vue'
import {
    getScheduleByDate,
    getCalendarMonthly,
    getCategoryList,
    completeSchedule
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
            dayEvents.value = events.map((e) => ({
                ...e,
                categoryName: categories.value.find((c) => c.id === e.categoryId)?.name || ''
            }))
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
