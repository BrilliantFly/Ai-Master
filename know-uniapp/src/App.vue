<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useAppStore } from './stores/app'
import { useUserStore } from './stores/user'
import { useDictStore } from './stores/dict'
import { useThemeStore } from './stores/theme'
import { useRouter, useRoute } from 'uniapp-router-next'

const appStore = useAppStore()
const userStore = useUserStore()
const dictStore = useDictStore()
const themeStore = useThemeStore()
const router = useRouter()
const route = useRoute()

// 同步设置 data-theme（在首次渲染前确保 themes.scss 的 CSS 变量生效）
//#ifdef H5
try {
    const saved = uni.getStorageSync('know-theme')
    document.documentElement.setAttribute('data-theme', saved || 'white')
} catch (_e) {
    document.documentElement.setAttribute('data-theme', 'white')
}
//#endif

//#ifdef H5
const setH5WebIcon = () => {
    const config = appStore.getWebsiteConfig
    let favicon: HTMLLinkElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (!favicon) {
        favicon = document.createElement('link') as HTMLLinkElement
        favicon.rel = 'icon'
        document.head.appendChild(favicon)
    }
    favicon.href = config.h5_favicon
}
//#endif

const getConfig = async () => {
    await appStore.getConfig()
    //#ifdef H5
    setH5WebIcon()
    //#endif
    const { status, page_status, page_url } = appStore.getH5Config
    if (route.meta.webview) return
    //#ifdef H5
    if (status == 0) {
        if (page_status == 1) {
            location.href = page_url
            return
        }
        router.reLaunch('/pages/empty/empty')
    }
    //#endif
}

// 初始化数据
const initData = async () => {
    await userStore.getUser()
    await dictStore.loadDictData()
    // 加载用户菜单配置（带权限）
    await appStore.loadUserMenuConfig()
}

onLaunch(async () => {
    await themeStore.getTheme()
    await getConfig()
    //#ifdef H5
    setH5WebIcon()
    //#endif

    // 始终加载公共菜单配置（免登录 TabBar + 首页）
    await appStore.loadPublicMenuConfig()

    // 如果已登录则加载带权限的用户数据
    if (userStore.isLogin) {
        await initData()
    }
})
</script>
<style lang="scss">
/* H5 端：主题变量由 themes.scss 通过 html[data-theme='X'] 提供，优先级最高
   此处仅保留排版属性与主题切换过渡。v-bind 用于非 H5 端（小程序/App）。*/
page {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.45;
    letter-spacing: 0.01em;

    /* 主题切换过渡（平滑切换背景、文字、边框色） */
    transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1),
        color 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 页内容器级元素继承主题过渡 */
page view,
page scroll-view,
page swiper,
page cover-view,
page cover-image {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.25s ease;
}

/* 非 H5 端：通过 v-bind 注入主题变量到 page 元素 */
/* #ifndef H5 */
page {
    --color-bg: v-bind('themeStore.themeInlineVars["--color-bg"]');
    --color-bg-app: v-bind('themeStore.themeInlineVars["--color-bg-app"]');
    --color-surface: v-bind('themeStore.themeInlineVars["--color-surface"]');
    --color-surface-soft: v-bind('themeStore.themeInlineVars["--color-surface-soft"]');
    --color-surface-hover: v-bind('themeStore.themeInlineVars["--color-surface-hover"]');
    --color-text: v-bind('themeStore.themeInlineVars["--color-text"]');
    --color-text-secondary: v-bind('themeStore.themeInlineVars["--color-text-secondary"]');
    --color-text-tertiary: v-bind('themeStore.themeInlineVars["--color-text-tertiary"]');
    --color-border: v-bind('themeStore.themeInlineVars["--color-border"]');
    --color-border-light: v-bind('themeStore.themeInlineVars["--color-border-light"]');
    --color-border-hover: v-bind('themeStore.themeInlineVars["--color-border-hover"]');
    --color-primary: v-bind('themeStore.themeInlineVars["--color-primary"]');
    --color-primary-rgb: v-bind('themeStore.themeInlineVars["--color-primary-rgb"]');
    --color-primary-soft: v-bind('themeStore.themeInlineVars["--color-primary-soft"]');
    --color-primary-mist: v-bind('themeStore.themeInlineVars["--color-primary-mist"]');
    --color-minor: v-bind('themeStore.themeInlineVars["--color-minor"]');
    --color-btn-text: v-bind('themeStore.themeInlineVars["--color-btn-text"]');
    --gradient-primary: v-bind('themeStore.themeInlineVars["--gradient-primary"]');
}
/* #endif */
</style>
