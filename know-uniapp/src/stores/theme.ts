import { getDecorate } from '@/api/shop'
import { generateVars } from '@/utils/theme'
import { defineStore } from 'pinia'

export const VISUAL_THEMES = [
    { key: 'white', name: '纯白', icon: '☀️' },
    { key: 'dark', name: '深空', icon: '🌙' },
    { key: 'warm', name: '暖阳', icon: '🌅' },
    { key: 'aurora', name: '极光', icon: '🌌' },
    { key: 'purple', name: '暗紫', icon: '🔮' },
    { key: 'glass', name: '玻璃', icon: '🪟' },
    { key: 'orangold', name: '橘金', icon: '✨' },
    { key: 'macaron', name: '马卡龙', icon: '🧁' },
    { key: 'mint', name: '薄荷', icon: '🍃' },
    { key: 'lavender', name: '薰衣草', icon: '💜' },
    { key: 'milky', name: '奶白', icon: '🥛' },
    { key: 'matcha', name: '抹茶', icon: '🍵' },
    { key: 'berry', name: '浆果', icon: '🍓' },
    { key: 'ocean', name: '海洋', icon: '🌊' },
    { key: 'cream', name: '奶油', icon: '🧈' },
    { key: 'chocolate', name: '巧克力', icon: '🍫' },
    { key: 'neon', name: '霓虹', icon: '🌈' },
    { key: 'sakura', name: '樱花', icon: '🌸' },
    { key: 'forest', name: '森林', icon: '🌲' },
    { key: 'sunset', name: '日落', icon: '🌇' }
] as const

const THEME_STORAGE_KEY = 'know-theme'

interface ThemeStore {
    primaryColor: string
    minorColor: string
    btnColor: string
    navColor: string
    navBgColor: string
    vars: string
    currentVisualTheme: string
}
export const useThemeStore = defineStore({
    id: 'themeStore',
    state: (): ThemeStore => ({
        primaryColor: '',
        minorColor: '',
        btnColor: 'white',
        navColor: '#000000',
        navBgColor: '#ffffff',
        vars: '',
        currentVisualTheme: 'white'
    }),
    getters: {
        /** 当前视觉主题对象 */
        currentThemeConfig: (state) => {
            return VISUAL_THEMES.find((t) => t.key === state.currentVisualTheme) || VISUAL_THEMES[0]
        }
    },
    actions: {
        async getTheme() {
            const data = await getDecorate({
                id: 5
            })
            const { themeColor1, themeColor2, buttonColor, navigationBarColor, topTextColor } = data
            this.primaryColor = themeColor1
            this.minorColor = themeColor2
            this.btnColor = buttonColor
            this.navColor = topTextColor === 'white' ? '#ffffff' : '#000000'
            this.navBgColor = navigationBarColor || themeColor1
            this.vars = generateVars(
                {
                    primary: themeColor1
                },
                {
                    '--color-minor': themeColor2,
                    '--color-btn-text': buttonColor
                }
            )

            // 恢复保存的视觉主题
            const saved = uni.getStorageSync(THEME_STORAGE_KEY)
            if (saved) {
                this.currentVisualTheme = saved
                this.applyVisualTheme(saved)
            }
        },
        /** 切换视觉主题（7 套配色） */
        setVisualTheme(key: string) {
            this.currentVisualTheme = key
            uni.setStorageSync(THEME_STORAGE_KEY, key)
            this.applyVisualTheme(key)
        },
        /** 将主题应用到 <html> data-theme */
        applyVisualTheme(key: string) {
            // #ifdef H5
            document.documentElement.setAttribute('data-theme', key)
            // #endif
        },
        setTheme(color: string) {
            this.primaryColor = color
        }
    }
})
