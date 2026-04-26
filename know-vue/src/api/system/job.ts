import { service } from '@/utils/axios'

export interface JobQuery extends Pagination {
  jobName?: string
  code?: string
  status?: number
}

export interface Job {
  id?: number
  jobName: string
  code: string
  sort?: number
  status?: number
  createTime?: string
}

// 使用 /system/job/list 或 /system/job/page
export function getJobList(params: JobQuery): Promise<any> {
  console.log('调用岗位API:', '/system/job/list', params)
  return service({
    url: '/system/job/list',
    method: 'get',
    params
  }).catch(err => {
    console.error('岗位API错误:', err)
    throw err
  })
}

export function getJob(id: number): Promise<any> {
  return service({
    url: `/system/job/${id}`,
    method: 'get'
  })
}

export function addJob(data: Job): Promise<any> {
  return service({
    url: '/system/job',
    method: 'post',
    data
  })
}

export function updateJob(data: Job): Promise<any> {
  return service({
    url: '/system/job',
    method: 'put',
    data
  })
}

export function deleteJob(id: number): Promise<any> {
  return service({
    url: `/system/job/${id}`,
    method: 'delete'
  })
}