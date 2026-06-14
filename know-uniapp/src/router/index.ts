import routes from 'uni-router-routes'
import { createRouter } from 'uniapp-router-next'

import { ClientEnum } from '@/enums/appEnums'
import { useUserStore } from '@/stores/user'
import { client } from '@/utils/client'
import cache from '@/utils/cache'
import { BACK_URL } from '@/enums/constantEnums'

// #ifdef H5
import wechatOa from '@/utils/wechat'
// #endif

const router = createRouter({
    routes: [
        ...routes,
        {
            path: '*',
            redirect() {
                return {
                    name: '404'
                }
            }
        }
    ],
    debug: import.meta.env.DEV,
    // @ts-ignore
    platform: process.env.UNI_PLATFORM,
    h5: {}
})

let isFirstEach = true

router.beforeEach(async (to, from) => {
    if (isFirstEach) {
        const userStore = useUserStore()
        if (!userStore.isLogin && !to.meta.white) {
            cache.set(BACK_URL, to.fullPath)
        }
        isFirstEach = false
    }
})

router.afterEach((to, from) => {
    const userStore = useUserStore()
    if (!userStore.isLogin && !to.meta.white) {
        cache.set(BACK_URL, to.fullPath)
    }
})

router.beforeEach(async (to, from) => {
    if (to.path === '/pages/plan/home') {
        return {
            path: '/pages/plan/home/index',
            query: to.query
        }
    }

    const userStore = useUserStore()
    if (!userStore.isLogin && to.meta.auth) {
        return '/pages/login/login'
    }
})

// #ifdef H5
router.beforeEach(async (to, from) => {
    const { code, state, scene } = to.query

    if (code && state && scene) {
        wechatOa.setAuthData({
            code,
            scene
        })
        delete to.query.code
        delete to.query.state
        return {
            path: to.path,
            force: true,
            navType: 'reLaunch',
            query: to.query
        }
    }
})

router.afterEach((to, from) => {
    setTimeout(async () => {
        if (client === ClientEnum.OA_WEIXIN && !to.meta.webview) {
            await wechatOa.config()
        }
    })
})
// #endif

export default router
