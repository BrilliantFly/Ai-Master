<template>
    <view class="theme-switcher">
        <view class="theme-trigger" @tap.stop="togglePanel" title="切换主题">
            <view class="trigger-icon">
                <text>🎨</text>
            </view>
        </view>

        <view v-if="isOpen" class="theme-overlay" @tap="closePanel"></view>

        <view class="theme-panel" :class="{ open: isOpen }">
            <view
                v-for="theme in themes"
                :key="theme.key"
                class="theme-option"
                :class="{ active: current === theme.key }"
                :data-theme="theme.key"
                @tap.stop="selectTheme(theme.key)"
            >
                <text class="swatch" :style="{ background: swatchBg(theme.key) }"></text>
                <text class="theme-name">{{ theme.name }}</text>
                <text class="check">✓</text>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useThemeStore, VISUAL_THEMES, THEME_COLORS } from '@/stores/theme'

const themeStore = useThemeStore()
const isOpen = ref(false)

const themes = VISUAL_THEMES
const current = computed(() => themeStore.currentVisualTheme)

/** 从 THEME_COLORS 取主色用于 swatch 显示 */
const swatchBg = (key: string) => {
    const colors = THEME_COLORS[key]
    return colors ? colors['--color-primary'] : '#5b5bd6'
}

const togglePanel = () => {
    isOpen.value = !isOpen.value
}

const closePanel = () => {
    isOpen.value = false
}

const selectTheme = (key: string) => {
    themeStore.setVisualTheme(key)
    closePanel()
}
</script>

<style scoped lang="scss">
.theme-switcher {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    z-index: 220;
}

.theme-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    color: var(--color-text-secondary);
    opacity: 0.7;
    transition: all var(--duration) var(--ease);
}

.theme-trigger:active {
    opacity: 1;
    background: var(--color-surface-soft);
}

.trigger-icon {
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.theme-overlay {
    position: fixed;
    inset: 0;
    background: transparent;
    z-index: 210;
}

.theme-panel {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: var(--color-bg-app);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    padding: 6px;
    display: none;
    z-index: 220;
    min-width: 148px;
    transform-origin: top right;
    animation: themeIn 0.2s var(--ease-out-expo);
}

.theme-panel.open {
    display: block;
}

@keyframes themeIn {
    from {
        opacity: 0;
        transform: scale(0.92) translateY(-6px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.theme-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
    white-space: nowrap;
    transition: all var(--duration) var(--ease);
}

.theme-option:active {
    background: var(--color-surface-soft);
    color: var(--color-text);
}

.theme-option.active {
    color: var(--color-primary);
    background: var(--color-primary-mist);
}

.swatch {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 1.5px solid var(--color-border-light);
    position: relative;
    /* 背景色由内联 :style 驱动 */
}

.theme-option.active .swatch {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-mist);
}

.theme-name {
    font-size: 13px;
}

.check {
    margin-left: auto;
    font-size: 14px;
    color: var(--color-primary);
    display: none;
}

.theme-option.active .check {
    display: inline-flex;
}
</style>
