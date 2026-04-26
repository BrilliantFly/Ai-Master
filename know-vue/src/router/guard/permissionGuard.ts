import type { Router, RouteRecordRaw } from 'vue-router'

import { useUserStoreWithOut } from '@/stores/modules/user'
import { usePermissionStoreWithOut } from '@/stores/modules/permission'

import { RootRoute, PageNotFoundRoute } from '@/router/routes'

const whiteList = ['/login']

export function createPermissionGuard(router: Router) {
  const userStore = useUserStoreWithOut()
  const permissionStore = usePermissionStoreWithOut()

router.beforeEach(async (to, from, next) => {
    console.log('[PermissionGuard] to:', to.path, 'from:', from.path)
    
    // 使用 getter 获取 token，确保从 localStorage 读取
    const token = userStore.getToken
    console.log('[PermissionGuard] token:', token)
    
    // Whitelist can be directly entered
    if (whiteList.includes(to.path)) {
      if (to.path === '/login' && token) {
        const isSessionTimeout = userStore.sessionTimeout
        try {
          await userStore.afterLoginAction()
          if (!isSessionTimeout) {
            next((to.query?.redirect as string) || '/')
            return
          }
        } catch {}
      }
      next()
      return
    }

    // Token does not exist
    if (!token) {
      console.log('[PermissionGuard] No token, redirect to login')
      // You can access without permission. You need to set the routing meta.ignoreAuth to true
      if (to.meta.ignoreAuth) {
        next()
        return
      }

      // redirect login page
      const redirectData: { path: string; replace: boolean; query?: Recordable<string> } = {
        path: '/login',
        replace: true
      }
      if (to.path) {
        redirectData.query = {
          ...redirectData.query,
          redirect: to.path
        }
      }

      next(redirectData)
      return
    }

    // Jump to the 404 page after processing the login
    if (
      from.path === '/login' &&
      to.name === PageNotFoundRoute.name &&
      to.fullPath !== ((userStore.userInfo as any)?.homePath || '/home')
    ) {
      next((userStore.userInfo as any)?.homePath || '/home')
      return
    }

    // Get userinfo while last fetch time is empty
    if (userStore.lastUpdateTime === 0) {
      console.log('[PermissionGuard] Fetching user info...')
      try {
        await userStore.getUserInfoAction()
      } catch (err) {
        console.log('[PermissionGuard] Get user info error:', err)
        next()
        return
      }
    }

    console.log('[PermissionGuard] Building routes...')
    const routes = await permissionStore.buildRoutesAction()

    routes.forEach(route => {
      router.addRoute(route as unknown as RouteRecordRaw)
    })

    router.addRoute(PageNotFoundRoute as unknown as RouteRecordRaw)
    console.log('[PermissionGuard] Routes built, allowing navigation')

if (to.name === PageNotFoundRoute.name) {
      next({ path: to.fullPath, replace: true, query: to.query })
    } else {
      next()
    }
  })
}
