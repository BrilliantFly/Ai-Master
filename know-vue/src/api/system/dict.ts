import { service } from '@/utils/axios'

export interface DictQuery extends Pagination {
  dictName?: string
  dictType?: string
  status?: number
}

export interface Dict {
  id?: number
  dictName: string
  dictType: string
  status?: number
  createTime?: string
}

// ==================== 字典类型 API ====================
export function getDictTypeList(params: DictQuery): Promise<any> {
  return service({
    url: '/system/dict/type/list',
    method: 'get',
    params
  })
}

export function getDictType(id: number): Promise<any> {
  return service({
    url: `/system/dict/type/${id}`,
    method: 'get'
  })
}

export function addDictType(data: Dict): Promise<any> {
  return service({
    url: '/system/dict/type',
    method: 'post',
    data
  })
}

export function updateDictType(data: Dict): Promise<any> {
  return service({
    url: '/system/dict/type',
    method: 'put',
    data
  })
}

export function deleteDictType(id: number): Promise<any> {
  return service({
    url: `/system/dict/type/${id}`,
    method: 'delete'
  })
}

// ==================== 字典数据 API ====================
export interface DictData {
  id?: number
  dictTypeId: number
  dictLabel: string
  dictValue: string
  sort?: number
  status?: number
}

export function getDictList(dictTypeId: number): Promise<any> {
  return service({
    url: '/system/dict/list',
    method: 'get',
    params: { dictTypeId }
  })
}

export function getDict(id: number): Promise<any> {
  return service({
    url: `/system/dict/${id}`,
    method: 'get'
  })
}

export function addDict(data: DictData): Promise<any> {
  return service({
    url: '/system/dict',
    method: 'post',
    data
  })
}

export function updateDict(data: DictData): Promise<any> {
  return service({
    url: '/system/dict',
    method: 'put',
    data
  })
}

export function deleteDict(id: number): Promise<any> {
  return service({
    url: `/system/dict/${id}`,
    method: 'delete'
  })
}