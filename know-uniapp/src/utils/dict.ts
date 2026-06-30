import { useDictStore } from '@/stores/dict'

/**
 * 字典工具函数
 * 用于在页面中快速获取字典标签
 */

/**
 * 根据字典类型和值获取标签
 */
export function getDictLabel(dictType: string, value: string): string {
    const dictStore = useDictStore()
    return dictStore.getDictLabel(dictType, value)
}

/**
 * 根据字典类型获取选项列表
 * 返回格式: [{ label, value }]
 */
export function getDictOptions(dictType: string): { label: string; value: string }[] {
    const dictStore = useDictStore()
    return dictStore.getDictOptions(dictType)
}

/**
 * 格式化字典值
 * 用于在列表中显示
 * @param dictType 字典类型
 * @param value 字典值
 * @param defaultValue 默认值（当找不到时返回）
 */
export function formatDict(dictType: string, value: string, defaultValue = '-'): string {
    if (value === undefined || value === null || value === '') {
        return defaultValue
    }
    return getDictLabel(dictType, value) || defaultValue
}

/**
 * 获取用户性别选项
 */
export function getSexOptions() {
    return getDictOptions('sys_user_sex')
}

/**
 * 获取用户性别标签
 */
export function getSexLabel(value: string): string {
    return getDictLabel('sys_user_sex', value)
}

/**
 * 获取岗位状态选项
 */
export function getPostStatusOptions() {
    return getDictOptions('sys_post_status')
}

/**
 * 获取岗位状态标签
 */
export function getPostStatusLabel(value: string): string {
    return getDictLabel('sys_post_status', value)
}

/**
 * 获取菜单状态选项
 */
export function getMenuStatusOptions() {
    return getDictOptions('sys_menu_status')
}

/**
 * 获取菜单状态标签
 */
export function getMenuStatusLabel(value: string): string {
    return getDictLabel('sys_menu_status', value)
}
