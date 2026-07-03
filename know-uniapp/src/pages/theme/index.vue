<template>
    <view class="theme-page">
        <view class="page-header">
            <text class="page-title">主题设置</text>
            <text class="page-subtitle">切换 20 套视觉主题，其他页面会一起跟随变化</text>
        </view>

        <view class="theme-card premium-card">
            <view
                v-for="theme in themes"
                :key="theme.key"
                class="theme-row"
                :class="{ active: current === theme.key }"
                @tap="selectTheme(theme.key)"
            >
                <view class="row-left">
                    <text class="swatch" :style="{ background: swatchBg(theme.key) }"></text>
                    <view class="text-block">
                        <text class="theme-name">{{ theme.name }}</text>
                        <text class="theme-desc">{{ descriptions[theme.key] }}</text>
                    </view>
                </view>
                <text class="check">{{ current === theme.key ? '✓' : '' }}</text>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore, VISUAL_THEMES, THEME_COLORS } from '@/stores/theme'

const themeStore = useThemeStore()
const themes = VISUAL_THEMES
const current = computed(() => themeStore.currentVisualTheme)

/** 获取主题的主色用于 swatch 显示 */
const swatchBg = (key: string) => {
    const colors = THEME_COLORS[key]
    return colors ? colors['--color-primary'] : '#5b5bd6'
}

const descriptions: Record<string, string> = {
    white: '纯白、简洁、清爽',
    dark: '深空、稳重、聚焦内容',
    warm: '暖阳、柔和、亲切',
    aurora: '极光、明亮、科技感',
    purple: '暗紫、对比强、夜间风格',
    glass: '玻璃、通透、未来感',
    orangold: '橙金、温暖、轻奢',
    macaron: '甜美、柔和、轻盈',
    mint: '清新、自然、通透',
    lavender: '柔紫、安静、梦幻',
    milky: '奶白、温柔、轻暖',
    matcha: '抹茶、自然、治愈',
    berry: '浆果、活力、浓郁',
    ocean: '海洋、清透、理性',
    cream: '奶油、柔亮、温暖',
    chocolate: '巧克力、沉稳、醇厚',
    neon: '霓虹、高对比、未来感',
    sakura: '樱花、浪漫、轻粉',
    forest: '森林、沉静、自然',
    sunset: '日落、暖橘、氛围感'
}

const selectTheme = (key: string) => {
    themeStore.setVisualTheme(key)
}
</script>

<style scoped lang="scss">
.theme-page {
    min-height: 100vh;
    background: var(--color-bg-app);
    padding: 24rpx 16px 40rpx;
}

.page-header {
    padding: 0 8rpx 18rpx;
}

.page-title {
    display: block;
    font-size: 42rpx;
    font-weight: 700;
    color: var(--color-text);
}

.page-subtitle {
    display: block;
    margin-top: 8rpx;
    font-size: 24rpx;
    color: var(--color-text-secondary);
    line-height: 1.6;
}

.theme-card {
    padding: 6px 0;
}

.theme-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 18px;
    border-bottom: 1px solid var(--color-border-light);
}

.theme-row:last-child {
    border-bottom: none;
}

.theme-row.active {
    background: var(--color-primary-mist);
}

.row-left {
    display: flex;
    align-items: center;
    gap: 14px;
}

.swatch {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 1.5px solid var(--color-border-light);
    position: relative;
    /* 背景色由内联 :style 驱动 */
}

.text-block {
    display: flex;
    flex-direction: column;
}

.theme-name {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--color-text);
}

.theme-desc {
    margin-top: 6rpx;
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.check {
    font-size: 28rpx;
    color: var(--color-primary);
    font-weight: 700;
}
</style>
