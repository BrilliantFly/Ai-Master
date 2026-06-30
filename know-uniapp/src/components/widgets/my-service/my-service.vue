<template>
    <view class="my-service-wrapper">
        <view class="wallet-card" @click="openLink('/packages/pages/recharge/recharge')">
            <view class="w-icon-bg">
                <text class="w-icon-text">¥</text>
            </view>
            <view class="w-info">
                <view class="w-label">钱包余额</view>
                <view class="w-amount">12,680.50</view>
            </view>
            <view class="w-action">充值</view>
        </view>

        <view class="menu-group" v-for="(group, gIdx) in menuGroups" :key="gIdx">
            <view class="group-title">{{ group.title }}</view>
            <template v-for="(item, index) in group.items" :key="index">
                <button
                    v-if="item.name === '联系客服' && isLogin"
                    class="menu-item contact-btn"
                    open-type="contact"
                    hover-class="menu-item-hover"
                >
                    <view class="m-icon" :style="{ background: item.iconBg }">
                        <text>{{ item.icon }}</text>
                    </view>
                    <view class="m-text">
                        <view class="m-title">{{ item.name }}</view>
                        <view class="m-desc">{{ item.desc }}</view>
                    </view>
                    <text class="m-arrow">›</text>
                </button>

                <view
                    v-else
                    class="menu-item"
                    hover-class="menu-item-hover"
                    @click="handleClick(item)"
                >
                    <view class="m-icon" :style="{ background: item.iconBg }">
                        <text>{{ item.icon }}</text>
                    </view>
                    <view class="m-text">
                        <view class="m-title">{{ item.name }}</view>
                        <view class="m-desc">{{ item.desc }}</view>
                    </view>
                    <text class="m-arrow">›</text>
                </view>
            </template>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { navigateTo, objectToQuery } from '@/utils/util'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { useRouter } from 'uniapp-router-next'

type DecorateLink =
    | string
    | {
          path?: string
          name?: string
          type?: string
          canTab?: boolean
          query?: Record<string, any>
      }

type DecorateItem = {
    name: string
    link?: DecorateLink
    is_show?: string | number
    icon?: string
    iconBg?: string
    desc?: string
}

const props = defineProps({
    content: {
        type: Object,
        default: () => ({})
    },
    styles: {
        type: Object,
        default: () => ({})
    }
})

const userStore = useUserStore()
const { isLogin } = storeToRefs(userStore)
const router = useRouter()

const ITEM_CONFIG: Record<
    string,
    { icon: string; iconBg: string; desc: string; fixedLink?: string }
> = {
    我的订单: { icon: '🧾', iconBg: '#eef2ff', desc: '查看所有服务和购买记录' },
    我的收藏: { icon: '⭐', iconBg: '#f0fdf4', desc: '收藏的设备、文章和模板' },
    消息通知: { icon: '🔔', iconBg: '#f0f9ff', desc: '推送、告警、通知偏好' },
    密码修改: { icon: '🔐', iconBg: '#fff7ed', desc: '修改登录密码保障账户安全' },
    绑定手机: { icon: '📱', iconBg: '#f5f5f5', desc: '管理绑定的手机号码' },
    关于我们: { icon: 'ℹ️', iconBg: '#eef2ff', desc: '版本 v2.4.0 · 检查更新' },
    我的资料: { icon: '👤', iconBg: '#fce7f3', desc: '编辑个人资料信息' },
    联系客服: { icon: '💬', iconBg: '#f3e8ff', desc: '在线客服为您服务' },
    主题设置: {
        icon: '🎨',
        iconBg: '#eef2ff',
        desc: '切换 7 套视觉主题',
        fixedLink: '/pages/user_set/user_set?section=theme'
    }
}

const normalizeLink = (item: DecorateItem): DecorateLink => {
    const cfg = ITEM_CONFIG[item.name]
    if (cfg?.fixedLink) return cfg.fixedLink
    return item.link || ''
}

const showList = computed<DecorateItem[]>(() => {
    const base = (props.content.data || []).filter(
        (item: DecorateItem) => `${item.is_show}` === '1'
    )
    const hasTheme = base.some((item: DecorateItem) => item.name === '主题设置')
    if (hasTheme) return base
    return [
        ...base,
        { name: '主题设置', link: '/pages/user_set/user_set?section=theme', is_show: '1' }
    ]
})

const menuGroups = computed(() => {
    const items = showList.value.map((item: DecorateItem) => {
        const cfg = ITEM_CONFIG[item.name] || { icon: '📦', iconBg: '#f5f5f5', desc: '' }
        return { ...item, ...cfg, link: normalizeLink(item) }
    })
    const primaryNames = ['我的订单', '我的收藏', '绑定手机']
    const primary = items.filter((item: DecorateItem) => primaryNames.includes(item.name))
    const secondary = items.filter((item: DecorateItem) => !primaryNames.includes(item.name))
    return [
        { title: '功能服务', items: primary },
        { title: '设置与支持', items: secondary }
    ]
})

const openLink = (link: DecorateLink) => {
    if (!link) return
    if (typeof link === 'string') {
        if (link.startsWith('/pages/') || link.startsWith('/packages/')) {
            router.navigateTo(link)
            return
        }
        if (/^https?:\/\//.test(link)) {
            const encoded = encodeURIComponent(link)
            router.navigateTo(`/pages/webview/webview?url=${encoded}`)
            return
        }
        router.navigateTo(link.startsWith('/') ? link : `/${link}`)
        return
    }
    if (link.path) {
        if (link.type && ['webview', 'phone', 'copy', 'mini_program'].includes(link.type)) {
            navigateTo({
                path: link.path,
                type: link.type,
                canTab: !!link.canTab,
                query: link.query,
                name: link.name
            })
            return
        }
        const url = link.query ? `${link.path}?${objectToQuery(link.query)}` : link.path
        if (link.canTab) {
            router.switchTab(url)
            return
        }
        router.navigateTo(url)
        return
    }
    if (typeof link !== 'string') {
        navigateTo({
            path: link.path,
            type: link.type || 'custom',
            canTab: !!link.canTab,
            query: link.query,
            name: link.name
        })
    }
}

const handleClick = (item: DecorateItem) => {
    if (item.name === '联系客服') {
        uni.showToast({ title: '联系客服', icon: 'none' })
        return
    }
    openLink(item.link || '')
}
</script>

<style lang="scss" scoped>
.my-service-wrapper {
    padding: 0 24rpx;
    margin-top: 48rpx;
}

.wallet-card {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 28rpx 24rpx;
    background: linear-gradient(
        135deg,
        var(--color-primary-soft) 0%,
        var(--color-primary-soft) 100%
    );
    border-radius: 24rpx;
    margin-bottom: 24rpx;
    border: 2rpx solid rgba(var(--color-primary-rgb), 0.12);
    transition: all 0.25s;
    cursor: pointer;
}

.wallet-card:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 20rpx rgba(var(--color-primary-rgb), 0.15);
}

.w-icon-bg {
    width: 72rpx;
    height: 72rpx;
    border-radius: 18rpx;
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.w-icon-text {
    font-size: 32rpx;
    color: #fff;
    font-weight: 700;
}

.w-info {
    flex: 1;
}

.w-label {
    font-size: 24rpx;
    color: var(--color-text-secondary);
    font-weight: 400;
}

.w-amount {
    font-size: 38rpx;
    font-weight: 700;
    color: var(--color-text);
    margin-top: 6rpx;
    letter-spacing: -0.5rpx;
}

.w-action {
    font-size: 24rpx;
    color: var(--color-primary);
    font-weight: 500;
    flex-shrink: 0;
}

.menu-group {
    background: var(--color-surface);
    border-radius: 24rpx;
    overflow: hidden;
    margin-bottom: 24rpx;
    border: 1rpx solid rgba(0, 0, 0, 0.04);
    box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
}

.group-title {
    font-size: 26rpx;
    font-weight: 600;
    color: var(--color-text-secondary);
    padding: 24rpx 28rpx 12rpx;
    letter-spacing: 1rpx;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 28rpx 28rpx;
    background: var(--color-surface);
    border: none;
    width: 100%;
    text-align: left;
    font-family: inherit;
    transition: all 0.15s;
    cursor: pointer;
    box-sizing: border-box;
}

.menu-item + .menu-item {
    border-top: 1rpx solid var(--color-border-light);
}

.menu-item-hover {
    background: var(--color-primary-mist);
}

.contact-btn {
    padding-left: 28rpx;
    padding-right: 28rpx;
    line-height: 1.5;
    background: var(--color-surface) !important;
    border-radius: 0;
}

.contact-btn::after {
    border: none !important;
}

.m-icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 30rpx;
}

.m-text {
    flex: 1;
    min-width: 0;
}

.m-title {
    font-size: 28rpx;
    font-weight: 500;
    color: var(--color-text);
    line-height: 1.3;
}

.m-desc {
    font-size: 22rpx;
    color: var(--color-text-secondary);
    margin-top: 4rpx;
    line-height: 1.3;
}

.m-arrow {
    font-size: 34rpx;
    color: var(--color-text-tertiary);
    flex-shrink: 0;
    font-weight: 300;
    padding-left: 12rpx;
}
</style>
