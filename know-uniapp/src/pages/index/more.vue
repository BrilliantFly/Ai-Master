<template>
    <view class="more-page">
        <view class="page-header">
            <view>
                <text class="page-title">{{ sectionTitle }}</text>
                <text class="page-subtitle">后台菜单动态展示更多内容</text>
            </view>
        </view>

        <view v-if="items.length" class="more-list">
            <view
                v-for="item in items"
                :key="item.id"
                class="more-card premium-card"
                @tap="goLink(item.path)"
            >
                <view
                    class="more-icon"
                    :class="[
                        item.iconIsImage ? 'more-icon-image-wrap' : item.iconClass,
                        !item.iconIsImage ? 'premium-icon-gw' : ''
                    ]"
                >
                    <image
                        v-if="item.iconIsImage"
                        class="more-image"
                        :src="resolveMenuIcon(item.icon)"
                        mode="aspectFit"
                    />
                    <text v-else>{{ item.icon }}</text>
                </view>
                <view class="more-copy">
                    <text class="more-name">{{ item.title }}</text>
                    <text class="more-desc">{{ item.desc }}</text>
                </view>
                <text class="more-arrow">›</text>
            </view>
        </view>

        <view v-else class="empty-state">
            <text class="empty-icon">📦</text>
            <text class="empty-title">暂无更多内容</text>
            <text class="empty-desc">请先在后台添加菜单配置后再查看</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useRoute, useRouter } from 'uniapp-router-next'
import { getHomeMenu } from '@/api/system/menu'
import { useAppStore } from '@/stores/app'
import { buildHomeSections, normalizeHomeMenuItems } from './home-sections'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const menuList = ref<any[]>([])

const section = computed(() => String(route.query.section || 'quick'))
const allItems = computed(() => normalizeHomeMenuItems(menuList.value))
const grouped = computed(() => buildHomeSections(allItems.value))

const sectionTitleMap: Record<string, string> = {
    quick: '首页菜单',
    recommend: '热门推荐',
    tools: '常用工具'
}

const sectionTitle = computed(() => sectionTitleMap[section.value] || '更多内容')

const items = computed(() => {
    if (section.value === 'recommend') return grouped.value.recommend
    if (section.value === 'tools') return grouped.value.tools
    return grouped.value.quick
})

const resolveMenuIcon = (icon?: string) => {
    if (!icon) return ''
    return icon.startsWith('http') ? icon : appStore.getImageUrl(icon)
}

const loadMenus = async () => {
    let menus = appStore.getHomeMenu as any[]
    if (!menus?.length) {
        try {
            const data = await getHomeMenu()
            menus = Array.isArray(data) ? data : []
        } catch (error) {
            console.error('加载更多页菜单失败', error)
            menus = []
        }
    }
    menuList.value = Array.isArray(menus) ? menus : []
}

const goLink = (path?: string) => {
    if (!path) return
    if (['/pages/index/index', '/pages/user/user', '/pages/news/news'].includes(path)) {
        router.switchTab(path)
        return
    }
    router.navigateTo(path)
}

onShow(() => {
    loadMenus()
})
</script>

<style scoped lang="scss">
.more-page {
    min-height: 100vh;
    background: var(--color-bg-app);
    padding: 24rpx 32rpx 80rpx;
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
}

.more-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.more-card {
    display: flex;
    align-items: center;
    gap: 18rpx;
    padding: 22rpx;
}

.more-icon {
    width: 84rpx;
    height: 84rpx;
    border-radius: 22rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 34rpx;
}

.more-icon-image-wrap {
    background: var(--color-surface);
    border: 1rpx solid var(--color-border-light);
    box-shadow: var(--shadow-sm);
}

.more-image {
    width: 46rpx;
    height: 46rpx;
}

.more-copy {
    flex: 1;
    min-width: 0;
}

.more-name {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: var(--color-text);
}

.more-desc {
    display: block;
    margin-top: 8rpx;
    font-size: 22rpx;
    line-height: 1.6;
    color: var(--color-text-secondary);
}

.more-arrow {
    font-size: 34rpx;
    color: var(--color-text-tertiary);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding-top: 140rpx;
}

.empty-icon {
    font-size: 88rpx;
}

.empty-title {
    margin-top: 18rpx;
    font-size: 32rpx;
    font-weight: 600;
    color: var(--color-text);
}

.empty-desc {
    margin-top: 12rpx;
    font-size: 24rpx;
    line-height: 1.7;
    color: var(--color-text-secondary);
}
</style>
