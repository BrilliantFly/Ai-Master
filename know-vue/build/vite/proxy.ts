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
  for (const [prefix, target] of list) {
    const isHttps = httpsRE.test(target)

    const proxyConfig: ProxyOptions = {
      target: target,
      changeOrigin: true,
      ws: true
    }
    
    if (prefix === '/customer') {
      proxyConfig.rewrite = path => path
    } else {
      proxyConfig.rewrite = path => path.replace(new RegExp(`^${prefix}`), '')
    }

    if (isHttps) {
      proxyConfig.secure = false
    }

    ret[prefix] = proxyConfig
  }
  return ret
}
