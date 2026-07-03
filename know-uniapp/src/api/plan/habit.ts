import request from '@/utils/request'

export function getHabitList(params) {
    return request.get({ url: '/plan/habit/list', data: params })
}

export function getHabitStats(params) {
    return request.get({ url: '/plan/habit/stats', data: params })
}

export function addHabit(data) {
    return request.post({ url: '/plan/habit', data })
}

export function updateHabit(data) {
    return request.put({ url: '/plan/habit', data })
}

export function deleteHabit(id) {
    return request.delete({ url: `/plan/habit/${id}` })
}

export function getHabitDetail(id) {
    return request.get({ url: `/plan/habit/${id}` })
}

export function checkinHabit(id, params) {
    return request.post({ url: `/plan/habit/${id}/checkin`, data: params })
}

export function uncheckinHabit(id, params) {
    return request.post({ url: `/plan/habit/${id}/uncheckin`, data: params })
}

export function getHabitRecords(id, params) {
    return request.get({ url: `/plan/habit/${id}/records`, data: params })
}

export function getCalendarMonthly(params) {
    return request.get({ url: '/plan/calendar/monthly', data: params })
}
