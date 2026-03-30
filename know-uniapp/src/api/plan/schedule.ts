import request from '@/utils/request'

export function getScheduleList(params) {
  return request.get({ url: '/plan/event/list', params })
}

export function getScheduleByDate(params) {
  return request.get({ url: '/plan/event/date', params })
}

export function getScheduleByQuadrant(quadrant, params) {
  return request.get({ url: `/plan/event/quadrant/${quadrant}`, params })
}

export function getTodayStats(params) {
  return request.get({ url: '/plan/event/today', params })
}

export function addSchedule(data, params) {
  return request.post({ url: '/plan/event', data, params })
}

export function updateSchedule(data) {
  return request.put({ url: '/plan/event', data })
}

export function completeSchedule(id, params) {
  return request.put({ url: `/plan/event/${id}/complete`, params })
}

export function deleteSchedule(id) {
  return request.delete({ url: `/plan/event/${id}` })
}

export function getScheduleDetail(id) {
  return request.get({ url: `/plan/event/${id}` })
}

export function getCategoryList(params) {
  return request.get({ url: '/plan/category/list', params })
}
