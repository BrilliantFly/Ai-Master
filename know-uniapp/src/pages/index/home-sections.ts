export type RawHomeMenu = {
    id?: number
    menuName?: string
    menuCode?: string
    path?: string
    icon?: string | null
    sort?: number | string
    renderType?: number
    renderConfig?: string | null
}

export type HomeRenderConfig = {
    icon?: string
    iconClass?: string
    title?: string
    desc?: string
    tag?: string
    thumbBg?: string
    thumbImage?: string
    sections?: string[]
    section?: string
}

export type HomeDisplayItem = {
    id: number | string
    name: string
    code: string
    path: string
    icon: string
    iconClass: string
    iconIsImage: boolean
    thumbImage: string
    thumbImageIsImage: boolean
    sort: number
    title: string
    desc: string
    tag: string
    thumbBg: string
    sections: string[]
}

type PresetConfig = {
    icon: string
    iconClass: string
    title: string
    desc: string
    tag: string
    thumbBg: string
    thumbImage: string
    sections: string[]
}

const buildPreset = (
    icon: string,
    iconClass: string,
    title: string,
    desc: string,
    tag: string,
    thumbBg: string,
    thumbImage: string,
    sections: string[]
): PresetConfig => ({
    icon,
    iconClass,
    title,
    desc,
    tag,
    thumbBg,
    thumbImage,
    sections
})

const MENU_PRESETS: Record<string, PresetConfig> = {
    camera: buildPreset(
        '📹',
        'premium-icon-g1',
        '智能摄像头接入指引',
        '快速了解如何配置和接入你的设备',
        '设备',
        'linear-gradient(135deg,#e0e7ff,#c7d2fe)',
        '/static/images/home/camera.svg',
        ['quick', 'recommend']
    ),
    device: buildPreset(
        '📹',
        'premium-icon-g1',
        '智能设备管理',
        '快速查看和管理你的智能设备',
        '设备',
        'linear-gradient(135deg,#e0e7ff,#c7d2fe)',
        '/static/images/home/camera.svg',
        ['quick', 'recommend']
    ),
    monitor: buildPreset(
        '📹',
        'premium-icon-g1',
        '监控中心',
        '实时分析，异常告警，7x24h 守护',
        '设备',
        'linear-gradient(135deg,#e0e7ff,#c7d2fe)',
        '/static/images/home/camera.svg',
        ['quick', 'recommend']
    ),
    schedule: buildPreset(
        '📅',
        'premium-icon-g2',
        '四象限工作法',
        '高效管理你的每日任务',
        '效率',
        'linear-gradient(135deg,#d1fae5,#a7f3d0)',
        '/static/images/home/schedule.svg',
        ['quick', 'recommend', 'tool']
    ),
    plan: buildPreset(
        '📅',
        'premium-icon-g2',
        '计划管理升级',
        '甘特图、日程、习惯打卡全新体验',
        '计划',
        'linear-gradient(135deg,#d1fae5,#a7f3d0)',
        '/static/images/home/schedule.svg',
        ['quick', 'recommend', 'tool']
    ),
    calendar: buildPreset(
        '📅',
        'premium-icon-g2',
        '日历计划',
        '统一查看近期日程与安排',
        '计划',
        'linear-gradient(135deg,#d1fae5,#a7f3d0)',
        '/static/images/home/schedule.svg',
        ['quick', 'recommend', 'tool']
    ),
    gantt: buildPreset(
        '📋',
        'premium-icon-g2',
        '甘特图',
        '项目计划与进度追踪',
        '工具',
        'linear-gradient(135deg,#d1fae5,#a7f3d0)',
        '/static/images/home/gantt.svg',
        ['tool']
    ),
    habit: buildPreset(
        '🎯',
        'premium-icon-g3',
        '21 天习惯养成计划',
        '用科学方法培养持续力',
        '习惯',
        'linear-gradient(135deg,#fce7f3,#fbcfe8)',
        '/static/images/home/habit.svg',
        ['quick', 'recommend']
    ),
    checkin: buildPreset(
        '🎯',
        'premium-icon-g3',
        '打卡目标',
        '养成坚持记录的好习惯',
        '习惯',
        'linear-gradient(135deg,#fce7f3,#fbcfe8)',
        '/static/images/home/habit.svg',
        ['quick', 'recommend']
    ),
    collection: buildPreset(
        '⭐',
        'premium-icon-g8',
        '我的收藏',
        '快速回到你保存过的内容与入口',
        '收藏',
        'linear-gradient(135deg,#fff7ed,#fde68a)',
        '/static/images/home/collection.svg',
        ['quick', 'tool']
    ),
    favorite: buildPreset(
        '⭐',
        'premium-icon-g8',
        '收藏内容',
        '随时查看收藏的重点信息',
        '收藏',
        'linear-gradient(135deg,#fff7ed,#fde68a)',
        '/static/images/home/collection.svg',
        ['quick', 'tool']
    ),
    customer: buildPreset(
        '👥',
        'premium-icon-g5',
        '客户管理',
        '智能跟进提醒，高效维护客户关系',
        '客户',
        'linear-gradient(135deg,#ede9fe,#ddd6fe)',
        '/static/images/home/customer.svg',
        ['quick', 'tool']
    ),
    crm: buildPreset(
        '👥',
        'premium-icon-g5',
        '客户维护',
        '统一管理客户资料和跟进记录',
        '客户',
        'linear-gradient(135deg,#ede9fe,#ddd6fe)',
        '/static/images/home/customer.svg',
        ['quick', 'tool']
    ),
    service: buildPreset(
        '📄',
        'premium-icon-g10',
        '在线客服支持',
        '快速联系平台客服获取帮助',
        '服务',
        'linear-gradient(135deg,#d1fae5,#99f6e4)',
        '/static/images/home/service.svg',
        ['quick', 'tool']
    ),
    support: buildPreset(
        '📄',
        'premium-icon-g10',
        '支持服务',
        '获取帮助与常见问题解答',
        '服务',
        'linear-gradient(135deg,#d1fae5,#99f6e4)',
        '/static/images/home/service.svg',
        ['quick', 'tool']
    ),
    finance: buildPreset(
        '💳',
        'premium-icon-g10',
        '财务管理',
        '查看财务信息与收支概况',
        '财务',
        'linear-gradient(135deg,#ede9fe,#ddd6fe)',
        '/static/images/home/export.svg',
        ['quick', 'tool']
    ),
    wallet: buildPreset(
        '💳',
        'premium-icon-g10',
        '钱包余额',
        '查看账户余额与充值记录',
        '财务',
        'linear-gradient(135deg,#ede9fe,#ddd6fe)',
        '/static/images/home/export.svg',
        ['quick', 'tool']
    ),
    data: buildPreset(
        '📊',
        'premium-icon-g6',
        '数据分析',
        '设备与业务数据洞察',
        '数据',
        'linear-gradient(135deg,#e0f2fe,#bae6fd)',
        '/static/images/home/data.svg',
        ['quick', 'tool']
    ),
    report: buildPreset(
        '/static/images/home/export.svg',
        'premium-icon-g8',
        '报表导出',
        '一键生成运营报告',
        '工具',
        'linear-gradient(135deg,#ede9fe,#ddd6fe)',
        '/static/images/home/export.svg',
        ['tool']
    ),
    export: buildPreset(
        '/static/images/home/export.svg',
        'premium-icon-g8',
        '报表导出',
        '一键生成运营报告',
        '工具',
        'linear-gradient(135deg,#ede9fe,#ddd6fe)',
        '/static/images/home/export.svg',
        ['tool']
    ),
    alert: buildPreset(
        '🔔',
        'premium-icon-g4',
        '告警中心',
        '异常事件统一管理',
        '工具',
        'linear-gradient(135deg,#fee2e2,#fecaca)',
        '/static/images/home/alert.svg',
        ['tool']
    ),
    warning: buildPreset(
        '🔔',
        'premium-icon-g4',
        '告警中心',
        '重要提醒与异常事件汇总',
        '工具',
        'linear-gradient(135deg,#fee2e2,#fecaca)',
        '/static/images/home/alert.svg',
        ['tool']
    ),
    news: buildPreset(
        '📰',
        'premium-icon-g9',
        '热门资讯',
        '及时了解平台资讯与行业动态',
        '资讯',
        'linear-gradient(135deg,#dbeafe,#bfdbfe)',
        '/static/images/home/data.svg',
        ['quick', 'recommend']
    ),
    article: buildPreset(
        '📰',
        'premium-icon-g9',
        '精选文章',
        '发现更有价值的内容与经验分享',
        '文章',
        'linear-gradient(135deg,#dbeafe,#bfdbfe)',
        '/static/images/home/data.svg',
        ['quick', 'recommend']
    ),
    content: buildPreset(
        '📰',
        'premium-icon-g9',
        '内容中心',
        '浏览最新内容与专题推荐',
        '内容',
        'linear-gradient(135deg,#dbeafe,#bfdbfe)',
        '/static/images/home/data.svg',
        ['quick', 'recommend']
    )
}

const inferPresetCode = (item: RawHomeMenu) => {
    const code = String(item.menuCode || '')
        .toLowerCase()
        .trim()
    const name = String(item.menuName || '')
        .toLowerCase()
        .trim()
    const path = String(item.path || '')
        .toLowerCase()
        .trim()

    if (MENU_PRESETS[code]) return code

    if (code.includes('camera') || code.includes('device') || path.includes('/camera'))
        return 'camera'
    if (code.includes('schedule') || code.includes('calendar') || path.includes('/plan/schedule'))
        return 'schedule'
    if (code.includes('plan') || path.includes('/plan/home')) return 'plan'
    if (code.includes('habit') || code.includes('checkin') || path.includes('/plan/habit'))
        return 'habit'
    if (code.includes('customer') || code.includes('crm') || path.includes('/customer'))
        return 'customer'
    if (code.includes('service') || code.includes('support') || path.includes('/customer_service'))
        return 'service'
    if (code.includes('collection') || code.includes('favorite') || path.includes('/collection'))
        return 'collection'
    if (code.includes('news') || code.includes('article') || path.includes('/news')) return 'news'
    if (code.includes('data') || code.includes('analysis')) return 'data'
    if (
        code.includes('finance') ||
        code.includes('wallet') ||
        path.includes('/wallet') ||
        path.includes('/recharge')
    )
        return 'finance'
    if (code.includes('gantt')) return 'gantt'
    if (code.includes('alert') || code.includes('warning') || code.includes('alarm')) return 'alert'
    if (code.includes('report') || code.includes('export')) return 'report'

    if (name.includes('摄像') || name.includes('设备') || name.includes('监控')) return 'camera'
    if (name.includes('日程') || name.includes('计划') || name.includes('日历')) return 'schedule'
    if (name.includes('习惯') || name.includes('打卡')) return 'habit'
    if (name.includes('客户')) return 'customer'
    if (name.includes('客服') || name.includes('支持') || name.includes('服务')) return 'service'
    if (name.includes('收藏')) return 'collection'
    if (name.includes('资讯') || name.includes('文章') || name.includes('内容')) return 'news'
    if (name.includes('数据') || name.includes('分析')) return 'data'
    if (name.includes('财务') || name.includes('钱包') || name.includes('充值')) return 'finance'
    if (name.includes('甘特')) return 'gantt'
    if (name.includes('告警') || name.includes('提醒') || name.includes('预警')) return 'alert'
    if (name.includes('报表') || name.includes('导出')) return 'report'

    return code
}

export const REFERENCE_TOOL_ITEMS: HomeDisplayItem[] = [
    {
        id: 'tool-gantt',
        name: '甘特图',
        code: 'tool-gantt',
        path: '/pages/plan/schedule/index',
        icon: '📋',
        iconClass: 'premium-icon-g2',
        iconIsImage: false,
        thumbImage: '/static/images/home/gantt.svg',
        thumbImageIsImage: true,
        sort: 1,
        title: '甘特图',
        desc: '项目计划与进度追踪',
        tag: '工具',
        thumbBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
        sections: ['tool']
    },
    {
        id: 'tool-data',
        name: '数据分析',
        code: 'tool-data',
        path: '/pages/news/news',
        icon: '📊',
        iconClass: 'premium-icon-g6',
        iconIsImage: false,
        thumbImage: '/static/images/home/data.svg',
        thumbImageIsImage: true,
        sort: 2,
        title: '数据分析',
        desc: '设备与业务数据洞察',
        tag: '工具',
        thumbBg: 'linear-gradient(135deg,#e0f2fe,#bae6fd)',
        sections: ['tool']
    },
    {
        id: 'tool-alert',
        name: '告警中心',
        code: 'tool-alert',
        path: '/pages/camera/index',
        icon: '🔔',
        iconClass: 'premium-icon-g4',
        iconIsImage: false,
        thumbImage: '/static/images/home/alert.svg',
        thumbImageIsImage: true,
        sort: 3,
        title: '告警中心',
        desc: '异常事件统一管理',
        tag: '工具',
        thumbBg: 'linear-gradient(135deg,#fee2e2,#fecaca)',
        sections: ['tool']
    },
    {
        id: 'tool-export',
        name: '报表导出',
        code: 'tool-export',
        path: '/pages/news/news',
        icon: '📄',
        iconClass: 'premium-icon-g8',
        iconIsImage: false,
        thumbImage: '/static/images/home/export.svg',
        thumbImageIsImage: true,
        sort: 4,
        title: '报表导出',
        desc: '一键生成运营报告',
        tag: '工具',
        thumbBg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)',
        sections: ['tool']
    },
    {
        id: 'tool-focus',
        name: '番茄专注',
        code: 'tool-focus',
        path: '/pages/plan/focus/index',
        icon: '🍅',
        iconClass: 'premium-icon-g4',
        iconIsImage: false,
        thumbImage: '/static/images/home/schedule.svg',
        thumbImageIsImage: true,
        sort: 5,
        title: '番茄专注',
        desc: '25 分钟专注与节奏化休息',
        tag: '专注',
        thumbBg: 'linear-gradient(135deg,#fca5a5,#f97316)',
        sections: ['tool']
    }
]

const parseRenderConfig = (raw?: string | null): HomeRenderConfig => {
    if (!raw) return {}
    try {
        return JSON.parse(raw)
    } catch {
        return {}
    }
}

const isImageLike = (value?: string | null) => {
    if (!value) return false
    return (
        value.startsWith('/') ||
        value.startsWith('http') ||
        /\.(png|jpg|jpeg|svg|webp)$/i.test(value)
    )
}

const isBrokenText = (value?: string | null) => {
    if (!value) return true
    const trimmed = value.trim()
    if (!trimmed) return true
    return /^[?\uff1f\uFFFD\s]+$/.test(trimmed) || trimmed.includes('???')
}

const safeText = (value: string | null | undefined, fallback: string) => {
    return isBrokenText(value) ? fallback : String(value)
}

const normalizeSections = (config: HomeRenderConfig, code: string) => {
    if (Array.isArray(config.sections) && config.sections.length) {
        return config.sections
    }
    if (typeof config.section === 'string' && config.section) {
        return [config.section]
    }
    return MENU_PRESETS[code]?.sections || ['quick']
}

export const normalizeHomeMenuItems = (menus: RawHomeMenu[] = []): HomeDisplayItem[] => {
    return menus
        .map((item, index) => {
            const code = String(item.menuCode || '').toLowerCase()
            const presetCode = inferPresetCode(item)
            const config = parseRenderConfig(item.renderConfig)
            const preset = MENU_PRESETS[presetCode]
            const sort = Number(item.sort ?? index + 1)
            const rawIcon = preset?.icon || config.icon || item.icon || '📦'
            const rawThumbImage = config.thumbImage || preset?.thumbImage || rawIcon
            const titleFallback = preset?.title || `菜单 ${index + 1}`
            const descFallback = preset?.desc || '后台菜单动态渲染'
            const tagFallback = preset?.tag || '菜单'
            const name = safeText(item.menuName, titleFallback)

            return {
                id: item.id ?? `${code || 'menu'}-${index}`,
                name,
                code,
                path: item.path || '/pages/search/search',
                icon: rawIcon,
                iconClass: config.iconClass || preset?.iconClass || 'premium-icon-g8',
                iconIsImage: isImageLike(rawIcon),
                thumbImage: rawThumbImage,
                thumbImageIsImage: isImageLike(rawThumbImage),
                sort,
                title: safeText(config.title, titleFallback),
                desc: safeText(config.desc, descFallback),
                tag: safeText(config.tag, tagFallback),
                thumbBg:
                    config.thumbBg || preset?.thumbBg || 'linear-gradient(135deg,#e5e7eb,#cbd5e1)',
                sections: normalizeSections(config, code)
            }
        })
        .sort((a, b) => a.sort - b.sort)
}

export const buildHomeSections = (items: HomeDisplayItem[]) => {
    const quick = items.filter((item) => item.sections.includes('quick'))
    const recommend = items.filter((item) => item.sections.includes('recommend')).slice(0, 6)
    const dynamicTools = items.filter((item) => item.sections.includes('tool'))
    const mergedTools = [...dynamicTools]

    REFERENCE_TOOL_ITEMS.forEach((preset) => {
        const exists = mergedTools.some(
            (item) =>
                item.code === preset.code ||
                item.path === preset.path ||
                item.title === preset.title
        )
        if (!exists) {
            mergedTools.push(preset)
        }
    })

    const tools = mergedTools.sort((a, b) => a.sort - b.sort).slice(0, 6)

    return {
        quick,
        recommend,
        tools
    }
}
