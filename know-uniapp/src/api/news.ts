import request from '@/utils/request'

/**
 * @description 获取文章分类
 * @return { Promise }
 */
export function getArticleCate() {
    return request.get({ url: '/article/cate' })
}

/**
 * @description 获取文章列表
 * @return { Promise }
 */
export function getArticleList(data: Record<string, any>) {
    return request.get({ url: '/article/lists', data: data })
}

/**
 * @description 获取文章详情
 * @param { number } id
 * @return { Promise }
 */
export function getArticleDetail(data: { id: number }) {
    return request.get({ url: '/article/detail', data: data })
}

/**
 * @description 加入收藏
 * @param { number } id
 * @return { Promise }
 */
export function addCollect(data: { id: number }) {
    return request.post({ url: '/article/addCollect', data: data }, { isAuth: true })
}

/**
 * @description 取消收藏
 * @param { number } id
 * @return { Promise }
 */
export function cancelCollect(data: { id: number }) {
    return request.post({ url: '/article/cancelCollect', data: data }, { isAuth: true })
}

/**
 * @description 获取收藏列表
 * @return { Promise }
 */
export function getCollect() {
    return request.get({ url: '/article/collect' })
}

/**
 * 新增评论
 * @param {any} data 
 * @return 
 */ 
export function addComment(data: any) {
    return request.post({ url: '/comment/addNew', data: data })
}

/**
 * 获取评论
 * @param {any} data 
 * @return 
 */ 
export function getComment(data: { articleId: number }) {
    return request.get({ url: '/comment/getComment', data: data })
}

/**
 * 删除
 * @param {any} data 
 * @return 
 */ 
export function deleteComment(data: any) {
    return request.post({ url: '/comment/delNew', data: data })
}