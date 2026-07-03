import colorsLib from 'css-color-function'

const lightConfig = {
    'dark-2': 'shade(20%)',
    'light-3': 'tint(30%)',
    'light-5': 'tint(50%)',
    'light-7': 'tint(70%)',
    'light-9': 'tint(90%)'
}

const darkConfig = {
    'light-3': 'shade(20%)',
    'light-5': 'shade(30%)',
    'light-7': 'shade(50%)',
    'light-9': 'shade(70%)',
    'dark-2': 'tint(20%)'
}

/** #hex → 'r,g,b' */
export function hexToRgb(hex: string): string {
    const h = hex.replace('#', '')
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return isNaN(r) ? '0,0,0' : `${r},${g},${b}`
}

/**
 * @author Jason
 * @description 用于生成主题的行为变量
 * 可选值有primary、success、warning、error、info
 */
export const generateVarsMap = (color: string, type = 'primary', isDark = false) => {
    const colors: Record<string, string> = {
        [`--color-${type}`]: color
    }
    const config: Record<string, string> = isDark ? darkConfig : lightConfig
    for (const key in config) {
        colors[`--color-${type}-${key}`] = `color(${color} ${config[key]})`
    }

    // 为主色附加 RGB 和渐变色变量
    if (type === 'primary') {
        colors['--color-primary-rgb'] = hexToRgb(color)
        colors['--gradient-primary'] = `linear-gradient(135deg,${color} 0%,rgba(${hexToRgb(
            color
        )},0.08) 100%)`
    }

    return colors
}

/**
 * @author Jason
 * @description 生成主题
 */
export const generateVars = (
    options: Record<string, string>,
    extra: Record<string, string> = {},
    isDark = false
) => {
    const varsMap: Record<string, string> = Object.keys(options).reduce((prev, key) => {
        return Object.assign(prev, generateVarsMap(options[key], key, isDark))
    }, extra)

    const vars = Object.keys(varsMap).reduce((prev, key) => {
        const color = colorsLib.convert(varsMap[key])
        return `${prev}${key}:${color};`
    }, '')
    return vars
}

/** 用服务端配色覆盖视觉主题的基础色，返回新的色值表 */
export function mergeServerColors(
    themeColors: Record<string, string>,
    server: { primaryColor: string; minorColor: string; btnColor: string }
): Record<string, string> {
    const out = { ...themeColors }
    if (server.primaryColor) {
        out['--color-primary'] = server.primaryColor
        out['--color-primary-rgb'] = hexToRgb(server.primaryColor)
        out['--gradient-primary'] = `linear-gradient(135deg,${
            server.primaryColor
        } 0%,rgba(${hexToRgb(server.primaryColor)},0.08) 100%)`
    }
    if (server.minorColor) out['--color-minor'] = server.minorColor
    if (server.btnColor) out['--color-btn-text'] = server.btnColor
    return out
}
