import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import postcssRemToResponsivePixel from 'postcss-rem-to-responsive-pixel'
import postcssWeappTailwindcssRename from 'weapp-tailwindcss-webpack-plugin/postcss'
import vwt from 'weapp-tailwindcss-webpack-plugin/vite'
import uniRouter from 'unplugin-uni-router/vite'

const isH5 = process.env.UNI_PLATFORM === 'h5'
const isApp = process.env.UNI_PLATFORM === 'app'
const weappTailwindcssDisabled = isH5 || isApp

const postcssPlugin = [autoprefixer(), tailwindcss()]
if (!weappTailwindcssDisabled) {
    postcssPlugin.push(
        postcssRemToResponsivePixel({
            rootValue: 32,
            propList: ['*'],
            transformUnit: 'rpx'
        })
    )
    postcssPlugin.push(postcssWeappTailwindcssRename())
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        uni(),
        uniRouter(),
        weappTailwindcssDisabled ? undefined : vwt(),
        // 处理 /mobile 无尾部斜杠时 301 重定向到 /mobile/
        {
            name: 'h5-base-redirect',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url === '/mobile') {
                        res.statusCode = 301
                        res.setHeader('Location', '/mobile/')
                        res.end()
                        return
                    }
                    if (req.url === '/mobile/') {
                        req.url = '/mobile/index.html'
                    }
                    next()
                })
            }
        }
    ].filter(Boolean),
    css: {
        postcss: {
            plugins: postcssPlugin
        }
    },
    server: {
        port: 8991,
        proxy: {
            // 计划模块 (由 know-boot-system/8082 提供服务)
            '/api/plan': {
                target: 'http://localhost:8082',
                changeOrigin: true
            },
            // Python AI服务 (如有)
            '/api/python': {
                target: 'http://localhost:5000',
                changeOrigin: true
            },
            // 默认 → know-boot-system (8082)
            '/api': {
                target: 'http://localhost:8082',
                changeOrigin: true
            }
        }
    },
    build: {
        rollupOptions: {
            external: ['E:\\System Volume Information']
        }
    }
})
