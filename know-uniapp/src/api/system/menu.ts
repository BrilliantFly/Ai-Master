import request from '@/utils/request'

/**
 * 菜单类型常量
 */
export const MENU_TYPE_TABBAR = 1
export const MENU_TYPE_HOME = 2
export const MENU_TYPE_SIDEBAR = 3

/**
 * 渲染类型常量
 */
export const RENDER_TYPE_DYNAMIC = 1
export const RENDER_TYPE_FORM = 2
export const RENDER_TYPE_CUSTOM = 3

/**
 * 分页查询菜单配置
 */
export function getMenuConfigPage(params) {
    return request.get({ url: '/system/menu/config/page', params })
}

/**
 * 获取菜单配置列表
 */
export function getMenuConfigList(params) {
    return request.get({ url: '/system/menu/config/list', params })
}

/**
 * 根据菜单类型获取菜单列表
 */
export function getMenuConfigByType(menuType) {
    return request.get({ url: `/system/menu/config/type/${menuType}` })
}

/**
 * 获取TabBar菜单列表
 */
export function getTabbarMenu() {
    return request.get({ url: '/system/menu/config/tabbar' })
}

/**
 * 获取TabBar菜单列表（带权限）
 */
export function getTabbarMenuByUser() {
    return request.get({ url: '/system/menu/config/tabbar/user' }, { isAuth: true })
}

/**
 * 获取首页菜单列表
 */
export function getHomeMenu() {
    return request.get({ url: '/system/menu/config/home' })
}

/**
 * 获取首页菜单列表（带权限）
 */
export function getHomeMenuByUser() {
    return request.get({ url: '/system/menu/config/home/user' }, { isAuth: true })
}

/**
 * 获取用户可用菜单列表
 */
export function getUserMenu() {
    return request.get({ url: '/system/menu/config/user' }, { isAuth: true })
}

/**
 * 获取菜单详情
 */
export function getMenuConfigDetail(id) {
    return request.get({ url: `/system/menu/config/${id}` })
}

/**
 * 新增菜单配置
 */
export function addMenuConfig(data) {
    return request.post({ url: '/system/menu/config', data })
}

/**
 * 修改菜单配置
 */
export function updateMenuConfig(data) {
    return request.put({ url: '/system/menu/config', data })
}

/**
 * 删除菜单配置
 */
export function deleteMenuConfig(id) {
    return request.delete({ url: `/system/menu/config/${id}` })
}
