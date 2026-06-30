import request from '@/utils/request'

// ==================== 字典类型 API ====================

/**
 * 获取字典类型列表
 */
export function getDictTypeList() {
    return request.get({ url: '/system/dict/type/list' }, { isAuth: true })
}

/**
 * 获取字典类型详情
 */
export function getDictType(id: number) {
    return request.get({ url: `/system/dict/type/${id}` }, { isAuth: true })
}

/**
 * 新增字典类型
 */
export function addDictType(data: any) {
    return request.post({ url: '/system/dict/type', data }, { isAuth: true })
}

/**
 * 修改字典类型
 */
export function updateDictType(data: any) {
    return request.put({ url: '/system/dict/type', data }, { isAuth: true })
}

/**
 * 删除字典类型
 */
export function deleteDictType(id: number) {
    return request.delete({ url: `/system/dict/type/${id}` }, { isAuth: true })
}

// ==================== 字典数据 API ====================

/**
 * 获取字典数据列表
 */
export function getDictList(dictTypeId: number) {
    return request.get({ url: '/system/dict/list', data: { dictTypeId } }, { isAuth: true })
}

/**
 * 获取字典数据详情
 */
export function getDict(id: number) {
    return request.get({ url: `/system/dict/${id}` }, { isAuth: true })
}

/**
 * 新增字典数据
 */
export function addDict(data: any) {
    return request.post({ url: '/system/dict', data }, { isAuth: true })
}

/**
 * 修改字典数据
 */
export function updateDict(data: any) {
    return request.put({ url: '/system/dict', data }, { isAuth: true })
}

/**
 * 删除字典数据
 */
export function deleteDict(id: number) {
    return request.delete({ url: `/system/dict/${id}` }, { isAuth: true })
}
