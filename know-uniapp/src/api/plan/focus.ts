import request from '@/utils/request'

export function addFocusSession(data) {
    return request.post({ url: '/plan/focus/session', data })
}

export function getTodayFocusSessions() {
    return request.get({ url: '/plan/focus/today' })
}

export function getTodayFocusStats() {
    return request.get({ url: '/plan/focus/stats' })
}
