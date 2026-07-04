/**
 * useHoverEffect — 可复用的 hover 交互系统
 *
 * uni-app H5 中 <view> 渲染为 <uni-view> 自定义元素，
 * CSS :hover 和 JS mouseover/mouseout 均不触发。
 *
 * 本 composable 通过 document-level capture 监听 mousemove，
 * 绕开 uni-app 事件系统，为指定元素切换 .hover-active 类。
 *
 * 用法 (在 <script setup> 中):
 *   import { useHoverEffect } from '@/hooks/useHoverEffect'
 *
 *   // 自动管理生命周期
 *   useHoverEffect(['.s-card', '.filter-pill', '.btn-primary'])
 *
 *   // 带作用域限制（只在 .plan-habit-page 内生效）
 *   useHoverEffect(['.btn-save', '.btn-cancel'], '.plan-habit-page')
 *
 * CSS 配合 (在 scoped style 中):
 *   .s-card.hover-active { box-shadow: var(--shadow-md); transform: translateY(-2px); }
 */
import { onMounted, onUnmounted } from 'vue'

export function useHoverEffect(targetSelectors: string | string[], scopeSelector?: string) {
    if (typeof document === 'undefined') return { clearHover: () => {} } // SSR guard

    const selectors = Array.isArray(targetSelectors) ? targetSelectors.join(',') : targetSelectors
    let hoverEl: Element | null = null

    function onDocHoverMove(e: MouseEvent) {
        const target = e.target as Element | null
        if (!target) {
            clearHover()
            return
        }

        // 作用域检查：鼠标在指定容器外时清除 hover
        if (scopeSelector && !target.closest(scopeSelector)) {
            clearHover()
            return
        }

        const el = target.closest(selectors)
        if (el !== hoverEl) {
            if (hoverEl) hoverEl.classList.remove('hover-active')
            hoverEl = el
            if (hoverEl) hoverEl.classList.add('hover-active')
        }
    }

    function clearHover() {
        if (hoverEl) {
            hoverEl.classList.remove('hover-active')
            hoverEl = null
        }
    }

    onMounted(() => {
        document.addEventListener('mousemove', onDocHoverMove, { capture: true })
    })

    onUnmounted(() => {
        document.removeEventListener('mousemove', onDocHoverMove, { capture: true })
        clearHover()
    })

    return { clearHover }
}
