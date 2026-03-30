import request from '@/utils/request'

export function getHomeConfig(params) {
  return request.get({ url: '/plan/home/config', params })
}
