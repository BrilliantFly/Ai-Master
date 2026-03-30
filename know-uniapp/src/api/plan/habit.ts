import request from '@/utils/request'

export function getHabitList(params) {
  return request.get({ url: '/plan/habit/list', params })
}

export function getHabitStats(params) {
  return request.get({ url: '/plan/habit/stats', params })
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
  return request.post({ url: `/plan/habit/${id}/checkin`, params })
}

export function getHabitRecords(id, params) {
  return request.get({ url: `/plan/habit/${id}/records`, params })
}
