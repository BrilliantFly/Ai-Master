/**
 * Used to parse the .env.development proxy configuration
 */
import type { ProxyOptions } from 'vite'

type ProxyItem = [string, string]

type ProxyList = ProxyItem[]

type ProxyTargetList = Record<string, ProxyOptions>

const httpsRE = /^https:\/\//

export function createProxy(list: ProxyList = []) {
  const ret: ProxyTargetList = {}
  
  // 首先添加固定的登录相关代理
  ret['/login'] = {
    target: 'http://localhost:8082',
    changeOrigin: true,
    rewrite: path => path
  }
  ret['/logout'] = {
    target: 'http://localhost:8082',
    changeOrigin: true,
    rewrite: path => path
  }
  ret['/getUserInfo'] = {
    target: 'http://localhost:8082',
    changeOrigin: true,
    rewrite: path => path
  }
  
  // 系统管理 /system/* - 保持原路径
  ret['/system'] = {
    target: 'http://localhost:8082',
    changeOrigin: true,
    rewrite: path => path
  }
  
  // 计划管理 /adminapi/plan/* - 重写为 /api/plan/*
  ret['/adminapi/plan'] = {
    target: 'http://localhost:8083',
    changeOrigin: true,
    rewrite: path => path.replace(/^\/adminapi\/plan/, '/api/plan')
  }
  
  // 然后处理环境变量中的代理配置
  for (const [prefix, target] of list) {
    const isHttps = httpsRE.test(target)

    const proxyConfig: ProxyOptions = {
      target: target,
      changeOrigin: true,
      ws: true
    }

    // /api 需要移除前缀
    if (prefix === '/api') {
      proxyConfig.rewrite = path => path.replace(/^\/api/, '')
    }
    // login/logout/getUserInfo 保持原路径
    else {
      proxyConfig.rewrite = path => path
    }

    if (isHttps) {
      proxyConfig.secure = false
    }

    ret[prefix] = proxyConfig
  }
  return ret
}