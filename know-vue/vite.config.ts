import type { ConfigEnv, UserConfig } from 'vite'
import { loadEnv } from 'vite'
import { createProxy } from './build/vite/proxy'
import { createVitePlugins } from './build/vite/plugin'
import { wrapperEnv } from './build/utils'
// need install plugin @typings/node
import { resolve } from 'path'

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir)
}

// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd()

  const env = loadEnv(mode, root)

  // this function can be converted to different typings
  const viteEnv = wrapperEnv(env)
  const { VITE_PORT, VITE_PROXY, VITE_DROP_CONSOLE, VITE_API_MODE } = viteEnv

  const isBuild = command === 'build'

  // Transform proxy targets based on API mode
  let proxyList = VITE_PROXY || []
  if (VITE_API_MODE === 'microservice') {
    // Microservice mode: use gateway port 9001 for /api
    proxyList = proxyList.map(([prefix, target]: [string, string]) => {
      if (prefix === '/api') {
        return [prefix, 'http://localhost:9001']
      }
      return [prefix, target]
    })
  } else if (VITE_API_MODE === 'standalone') {
    // Standalone mode: /api → 8082
    proxyList = proxyList.map(([prefix, target]: [string, string]) => {
      if (prefix === '/api') {
        return [prefix, 'http://localhost:8082']
      }
      return [prefix, target]
    })
  }

  return {
    base: './',
    server: {
      // Listening on all local ips
      host: true,
      open: true,
      port: VITE_PORT,
      // Load proxy configuration from .env with mode-based transformation
      proxy: createProxy(proxyList)
    },

    // the project uses lots of vite plugins, so they are extracted and managed separately
    plugins: createVitePlugins(isBuild),

    build: {
      target: 'es2015',
      cssTarget: 'chrome86',
      minify: 'terser',
      terserOptions: {
        compress: {
          keep_infinity: true,
          // used to delete console and debugger in production environment
          drop_console: VITE_DROP_CONSOLE
        }
      },
      chunkSizeWarningLimit: 2000
    },

    css: {
      preprocessorOptions: {
        less: {
          charset: false,
          additionalData: `@import "${resolve('src/design/variable/index.less')}";`,
          javascriptEnabled: true
        }
      }
    },

    resolve: {
      alias: [
        {
          find: /@\//,
          replacement: pathResolve('src') + '/'
        }
      ]
    }
  }
}
