import CALENDAR from '@/utils/lunar-calendar.js'

export const formatYYYYMMDD = (y, m, d) => {
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export const todayStr = () => {
    const n = new Date()
    return formatYYYYMMDD(n.getFullYear(), n.getMonth() + 1, n.getDate())
}

export const getWeekDay = (dateStr) => {
    return new Date(dateStr).getDay()
}

export const SOLAR_FESTIVALS = {
    '1-1': '元旦',
    '2-14': '情人节',
    '3-8': '妇女节',
    '3-12': '植树节',
    '4-1': '愚人节',
    '4-22': '地球日',
    '5-1': '劳动节',
    '5-4': '青年节',
    '5-12': '护士节',
    '5-20': '520',
    '6-1': '儿童节',
    '7-1': '建党节',
    '8-1': '建军节',
    '9-10': '教师节',
    '10-1': '国庆节',
    '10-24': '程序员节',
    '11-11': '双十一',
    '12-24': '平安夜',
    '12-25': '圣诞节',
    '12-31': '跨年夜'
}

export const LUNAR_FESTIVALS = {
    '1-1': '春节',
    '1-15': '元宵节',
    '2-2': '龙抬头',
    '3-3': '上巳节',
    '5-5': '端午节',
    '7-7': '七夕节',
    '7-15': '中元节',
    '8-15': '中秋节',
    '9-9': '重阳节',
    '10-15': '下元节',
    '12-8': '腊八节',
    '12-23': '小年'
}

const getNthWeekdayOfMonth = (year, month, weekday, nth) => {
    const firstDay = new Date(year, month - 1, 1).getDay()
    const offset = (7 + weekday - firstDay) % 7
    return 1 + offset + (nth - 1) * 7
}

const getWeekBasedFestival = (y, m, d) => {
    if (m === 5 && d === getNthWeekdayOfMonth(y, 5, 0, 2)) return '母亲节'
    if (m === 6 && d === getNthWeekdayOfMonth(y, 6, 0, 3)) return '父亲节'
    if (m === 11 && d === getNthWeekdayOfMonth(y, 11, 4, 4)) return '感恩节'
    return ''
}

export const getLunarInfo = (y, m, d) => {
    try {
        const info = CALENDAR.solar2lunar(y, m, d)
        if (!info) return { lunar: null, isTerm: false, termName: '', festivalName: '' }

        const lunar = info.IDayCn === '初一' ? `${info.IMonthCn}月` : info.IDayCn
        let festivalName = ''

        const solarKey = `${m}-${d}`
        if (SOLAR_FESTIVALS[solarKey]) {
            festivalName = SOLAR_FESTIVALS[solarKey]
        }

        if (!festivalName) {
            const weekFestival = getWeekBasedFestival(y, m, d)
            if (weekFestival) {
                festivalName = weekFestival
            }
        }

        if (!festivalName) {
            const lunarKey = `${info.lMonth}-${info.lDay}`
            if (LUNAR_FESTIVALS[lunarKey]) {
                festivalName = LUNAR_FESTIVALS[lunarKey]
            }
        }

        if (!festivalName && info.lMonth === 12 && info.lDay >= 29) {
            try {
                const nextD = new Date(y, m - 1, d + 1)
                const nextInfo = CALENDAR.solar2lunar(
                    nextD.getFullYear(),
                    nextD.getMonth() + 1,
                    nextD.getDate()
                )
                if (nextInfo && nextInfo.lMonth === 1 && nextInfo.lDay === 1) {
                    festivalName = '除夕'
                }
            } catch {
                // ignore
            }
        }

        return {
            lunar,
            isTerm: !!info.isTerm,
            termName: info.Term || '',
            festivalName
        }
    } catch {
        return { lunar: null, isTerm: false, termName: '', festivalName: '' }
    }
}

export const QUADRANT_COLORS = {
    1: '#FF6B6B',
    2: '#4ECDC4',
    3: '#FFE66D',
    4: '#95A5A6'
}

export const quadrantColor = (q) => QUADRANT_COLORS[q] || '#999'

export function calcMonthlyStats(events) {
    if (!events || events.length === 0) return { total: 0, completed: 0, rate: 0 }
    const total = events.length
    const completed = events.filter((e) => e.status === 1).length
    return { total, completed, rate: Math.round((completed / total) * 100) }
}

export function buildDayData(dateStr, day, isCurrentMonth, y, m, events, holidays) {
    const dayEvents = events.filter((e) => e.date === dateStr) || []
    const holiday = holidays ? holidays[dateStr] : null
    const lunarInfo = getLunarInfo(y, m, day)
    const weekday = getWeekDay(dateStr)

    const isHoliday = holiday && holiday.holiday === true
    const isWorkday = holiday && holiday.holiday === false && !!holiday.name
    const holidayName = isHoliday ? holiday.name : ''
    const workdayName = isWorkday ? holiday.name || '调休' : ''

    const festivalTag = isHoliday ? '休' : isWorkday ? '班' : ''

    const primarySubLabel =
        holidayName ||
        workdayName ||
        lunarInfo.festivalName ||
        lunarInfo.termName ||
        lunarInfo.lunar ||
        ''
    const secondarySubLabel =
        holidayName || workdayName
            ? lunarInfo.termName || lunarInfo.lunar || ''
            : lunarInfo.festivalName
            ? lunarInfo.termName || lunarInfo.lunar || ''
            : lunarInfo.termName
            ? lunarInfo.lunar || ''
            : ''

    return {
        date: dateStr,
        day,
        isCurrentMonth,
        isToday: dateStr === todayStr(),
        isHoliday,
        isWorkday,
        holidayName,
        festivalTag,
        lunar: lunarInfo.lunar,
        isTerm: lunarInfo.isTerm,
        termName: lunarInfo.termName,
        festivalName: lunarInfo.festivalName,
        primarySubLabel,
        secondarySubLabel,
        hasRichLabel: !!(
            holidayName ||
            workdayName ||
            lunarInfo.festivalName ||
            lunarInfo.termName
        ),
        events: dayEvents,
        weekday
    }
}

export function generateWeeks(year, month, events, holidays) {
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const daysInPrev = new Date(year, month - 1, 0).getDate()

    const allDays = []

    for (let i = firstDay - 1; i >= 0; i--) {
        const d = daysInPrev - i
        const dateStr = formatYYYYMMDD(year, month - 1, d)
        allDays.push(buildDayData(dateStr, d, false, year, month - 1, events, holidays))
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = formatYYYYMMDD(year, month, d)
        allDays.push(buildDayData(dateStr, d, true, year, month, events, holidays))
    }

    const remaining = 42 - allDays.length
    for (let d = 1; d <= remaining; d++) {
        const dateStr = formatYYYYMMDD(year, month + 1, d)
        allDays.push(buildDayData(dateStr, d, false, year, month + 1, events, holidays))
    }

    const weeks = []
    for (let i = 0; i < 42; i += 7) {
        weeks.push(allDays.slice(i, i + 7))
    }
    return weeks
}

export function getCurrentWeekDays() {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const start = new Date(today)
    start.setDate(today.getDate() - dayOfWeek)

    const days = []
    for (let i = 0; i < 7; i++) {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        const y = d.getFullYear()
        const m = d.getMonth() + 1
        const day = d.getDate()
        days.push({
            date: formatYYYYMMDD(y, m, day),
            day,
            isToday: todayStr() === formatYYYYMMDD(y, m, day),
            weekLabel: ['日', '一', '二', '三', '四', '五', '六'][i]
        })
    }
    return days
}
