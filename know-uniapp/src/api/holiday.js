import schedules from '@/data/holiday-schedules.js'

const CACHE_KEY = 'holiday_cache_v2'
const CACHE_TTL = 3600 * 24 * 365 * 1000

const normalizeHolidayMap = (input) => {
    const result = {}
    if (!input || typeof input !== 'object') return result
    for (const [date, info] of Object.entries(input)) {
        if (!info || typeof info !== 'object') continue
        if (typeof info.holiday !== 'boolean') continue
        result[date] = {
            holiday: info.holiday,
            name: info.name || (info.holiday ? '节假日' : '调休')
        }
    }
    return result
}

const mergeHolidayMaps = (baseMap, patchMap) => {
    const merged = { ...baseMap }
    for (const [date, info] of Object.entries(patchMap)) {
        merged[date] = info
    }
    return merged
}

const getSourceFingerprint = (year) => {
    try {
        return JSON.stringify(normalizeHolidayMap(schedules[year]))
    } catch {
        return ''
    }
}

async function fetchRemoteHolidays(year) {
    return await new Promise((resolve, reject) => {
        uni.request({
            url: `https://timor.tech/api/holiday/year/${year}`,
            method: 'GET',
            success: (resp) => resolve(resp),
            fail: (err) => reject(err)
        })
    })
}

export async function getHolidays(year) {
    const cached = getCache(year)
    if (cached) return cached

    const localMap = normalizeHolidayMap(schedules[year])

    try {
        const res = await fetchRemoteHolidays(year)
        const remoteMap = res?.data?.code === 0 ? normalizeHolidayMap(res.data.holiday) : {}

        const finalMap = Object.keys(remoteMap).length
            ? mergeHolidayMaps(localMap, remoteMap)
            : localMap

        setCache(year, finalMap)
        return finalMap
    } catch (error) {
        console.warn('节假日远程接口不可用，回退到本地静态表', error)
        setCache(year, localMap)
        return localMap
    }
}

function getCache(year) {
    try {
        const raw = uni.getStorageSync(CACHE_KEY)
        if (!raw) return null
        const data = JSON.parse(raw)
        if (data.year !== year) return null
        if (Date.now() - data.time > CACHE_TTL) return null
        if ((data.sourceFingerprint || '') !== getSourceFingerprint(year)) return null
        return normalizeHolidayMap(data.holidays)
    } catch {
        return null
    }
}

function setCache(year, holidays) {
    try {
        uni.setStorageSync(
            CACHE_KEY,
            JSON.stringify({
                year,
                holidays,
                sourceFingerprint: getSourceFingerprint(year),
                time: Date.now()
            })
        )
    } catch {
        // ignore cache failures
    }
}
