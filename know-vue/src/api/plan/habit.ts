import { service } from '@/utils/axios'

export function getHabitList(params) {
  return service({
    url: '/habit/list',
    method: 'get',
    params
  })
}

export function getHabitPage(params) {
  return service({
    url: '/habit/page',
    method: 'get',
    params
  })
}

export function getHabitStats(params) {
  return service({
    url: '/habit/stats',
    method: 'get',
    params
  })
}

export function addHabit(data) {
  return service({
    url: '/habit',
    method: 'post',
    data
  })
}

export function updateHabit(data) {
  return service({
    url: '/habit',
    method: 'put',
    data
  })
}

export function deleteHabit(id) {
  return service({
    url: `/habit/${id}`,
    method: 'delete'
  })
}

export function getHabitDetail(id) {
  return service({
    url: `/habit/${id}`,
    method: 'get'
  })
}

export function checkinHabit(id, params) {
  return service({
    url: `/habit/${id}/checkin`,
    method: 'post',
    params
  })
}

export function getHabitRecords(id, params) {
  return service({
    url: `/habit/${id}/records`,
    method: 'get',
    params
  })
}
