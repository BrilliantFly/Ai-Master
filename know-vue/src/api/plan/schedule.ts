import { service } from '@/utils/axios'

export function getScheduleList(params) {
  return service({
    url: '/adminapi/plan/event/list',
    method: 'get',
    params
  })
}

export function getScheduleByDate(params) {
  return service({
    url: '/adminapi/plan/event/date',
    method: 'get',
    params
  })
}

export function getScheduleByQuadrant(quadrant, params) {
  return service({
    url: `/adminapi/plan/event/quadrant/${quadrant}`,
    method: 'get',
    params
  })
}

export function getTodayStats(params) {
  return service({
    url: '/adminapi/plan/event/today',
    method: 'get',
    params
  })
}

export function addSchedule(data, params) {
  return service({
    url: '/adminapi/plan/event',
    method: 'post',
    data,
    params
  })
}

export function updateSchedule(data) {
  return service({
    url: '/adminapi/plan/event',
    method: 'put',
    data
  })
}

export function completeSchedule(id, params) {
  return service({
    url: `/adminapi/plan/event/${id}/complete`,
    method: 'put',
    params
  })
}

export function deleteSchedule(id) {
  return service({
    url: `/adminapi/plan/event/${id}`,
    method: 'delete'
  })
}

export function getScheduleDetail(id) {
  return service({
    url: `/adminapi/plan/event/${id}`,
    method: 'get'
  })
}

export function getScheduleCategoryList(params) {
  return service({
    url: '/adminapi/plan/category/list',
    method: 'get',
    params
  })
}
