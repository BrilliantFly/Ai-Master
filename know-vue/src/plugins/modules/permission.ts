import type { App } from 'vue'
import { permission } from '@/directives/permission'

export default {
  install(app: App) {
    // 注册权限指令
    app.directive('permission', permission)
  }
}