export const FOCUS_STORAGE_KEY = 'plan_focus_state_v1'
export const FOCUS_MINUTES = 25
export const BREAK_MINUTES = 5
export const LONG_BREAK_MINUTES = 15
export const LONG_BREAK_EVERY = 4

export const buildFocusTodayKey = (date = new Date()) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export const normalizeFocusHistory = (list) => {
    if (!Array.isArray(list)) return []
    return list.filter((item) => item && item.phase && item.finishedAt).slice(0, 12)
}

export const readFocusState = () => {
    try {
        const raw = uni.getStorageSync(FOCUS_STORAGE_KEY)
        if (!raw) return null
        return JSON.parse(raw)
    } catch (error) {
        console.error('读取番茄钟本地状态失败', error)
        return null
    }
}

export const saveFocusState = (payload) => {
    uni.setStorageSync(FOCUS_STORAGE_KEY, JSON.stringify(payload))
}

export const getTodayFocusSummary = () => {
    const parsed = readFocusState()
    if (!parsed) {
        return {
            completedFocusCount: 0,
            completedBreakCount: 0,
            currentStreak: 0,
            totalFocusMinutes: 0,
            sessionHistory: [],
            hasTodayData: false
        }
    }

    const sameDay = parsed.todayKey === buildFocusTodayKey()
    if (!sameDay) {
        return {
            completedFocusCount: 0,
            completedBreakCount: 0,
            currentStreak: 0,
            totalFocusMinutes: 0,
            sessionHistory: [],
            hasTodayData: false
        }
    }

    const completedFocusCount = parsed.completedFocusCount || 0
    const completedBreakCount = parsed.completedBreakCount || 0
    const currentStreak = parsed.currentStreak || 0
    const sessionHistory = normalizeFocusHistory(parsed.sessionHistory)

    return {
        completedFocusCount,
        completedBreakCount,
        currentStreak,
        totalFocusMinutes: completedFocusCount * FOCUS_MINUTES,
        sessionHistory,
        hasTodayData: true
    }
}
