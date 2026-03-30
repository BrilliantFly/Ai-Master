import { service } from '@/utils/axios'

export function getHomeConfig(params) {
  return service({
    url: '/plan/home/config',
    method: 'get',
    params
  })
}

export function getHomeConfigList(params) {
  return service({
    url: '/plan/home/config/list',
    method: 'get',
    params
  })
}

export function addHomeConfig(data) {
  return service({
    url: '/plan/home/config',
    method: 'post',
    data
  })
}

export function updateHomeConfig(data) {
  return service({
    url: '/plan/home/config',
    method: 'put',
    data
  })
}

export function deleteHomeConfig(id) {
  return service({
    url: `/plan/home/config/${id}`,
    method: 'delete'
  })
}
