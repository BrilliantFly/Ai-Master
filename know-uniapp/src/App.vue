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
@import './styles/variables.scss';
@import './styles/themes.scss';
@import './styles/public.scss';
@import './styles/premium.scss';

page {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.45;
    letter-spacing: 0.01em;
}
</style>
