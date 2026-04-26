<template>
    <view class="custom-tab-bar">
        <view class="tab-bar-container safe-area-inset-bottom">
            <view
                v-for="(item, index) in tabList"
                :key="index"
                class="tab-bar-item"
                :class="{ active: currentIndex === index }"
                @click="handleClick(item, index)"
            >
                <template v-if="item.isBig === 1">
                    <view class="big-button" :style="bigButtonStyle">
                        <image v-if="item.bigIcon" :src="getImageUrl(item.bigIcon)" class="big-icon" mode="aspectFit" />
                        <text v-else class="iconfont icon-plus"></text>
                    </view>
                </template>
                <template v-else>
                    <image
                        :src="currentIndex === index ? getImageUrl(item.selectedIcon) : getImageUrl(item.icon)"
                        class="tab-icon"
                        mode="aspectFit"
                    />
                    <text class="tab-text">{{ item.menuName }}</text>
                </template>
            </view>
        </view>

        <view v-if="showPopup" class="popup-mask" @click="closePopup">
            <view class="popup-content" @click.stop>
                <view class="popup-header">请选择</view>
                <view
                    v-for="(menu, idx) in popupList"
                    :key="idx"
                    class="popup-item"
                    @click="handlePopupClick(menu)"
                >
                    <image v-if="menu.icon" :src="getImageUrl(menu.icon)" class="popup-icon" mode="aspectFit" />
                    <text class="popup-text">{{ menu.menuName || menu.name }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { navigateTo } from '@/utils/util'

interface TabbarItem {
    id: number
    menuName: string
    path: string
    icon: string
    selectedIcon: string
    link: any
    isShow: number
    isBig: number
    bigIcon: string
    bigType: string
    bigPosition: number
    bigList: any[]
    renderType: number
    renderConfig: string
    permissionCode: string
}

const appStore = useAppStore()
const currentIndex = ref(0)
const showPopup = ref(false)
const popupList = ref<any[]>([])
const currentPopupItem = ref<TabbarItem | null>(null)

const tabList = computed(() => {
    return appStore.getTabbarConfig
        ?.filter((item: any) => item.isShow == 1)
        .sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0))
        || []
})

const bigButtonStyle = computed(() => ({
    backgroundColor: appStore.getStyleConfig.selected_color || '#1890ff'
}))

const getImageUrl = (url: string) => {
    if (!url) return ''
    return url.indexOf('http') === -1 ? `${appStore.config.domain || ''}${url}` : url
}

const handleClick = (item: TabbarItem, index: number) => {
    if (item.isBig === 1) {
        currentPopupItem.value = item
        if (item.bigType === 'popup' && item.bigList?.length) {
            popupList.value = item.bigList
            showPopup.value = true
        } else if (item.path) {
            navigateTo({ path: item.path }, 'switchTab')
        }
        return
    }

    currentIndex.value = index
    if (item.path) {
        navigateTo({ path: item.path }, 'switchTab')
    }
}

const handlePopupClick = (menu: any) => {
    showPopup.value = false
    navigateTo({ path: menu.path }, 'navigateTo')
}

const closePopup = () => {
    showPopup.value = false
}

const updateCurrentIndex = () => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentPath = '/' + currentPage.route

    const index = tabList.value.findIndex((item: TabbarItem) => {
        if (item.isBig === 1) return false
        return item.path === currentPath
    })

    if (index >= 0) {
        currentIndex.value = index
    }
}

watch(() => tabList.value, () => {
    updateCurrentIndex()
}, { deep: true })

onMounted(() => {
    updateCurrentIndex()
})
</script>

<style scoped lang="scss">
.custom-tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 999;
    background: #fff;
}

.tab-bar-container {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 100rpx;
    padding-bottom: env(safe-area-inset-bottom);
    background: #fff;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.tab-bar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 10rpx 0;

    &.active {
        .tab-text {
            color: #1890ff;
        }
    }
}

.tab-icon {
    width: 48rpx;
    height: 48rpx;
}

.tab-text {
    font-size: 22rpx;
    color: #999;
    margin-top: 4rpx;
}

.big-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.4);
}

.big-icon {
    width: 60rpx;
    height: 60rpx;
}

.popup-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}

.popup-content {
    position: absolute;
    bottom: 120rpx;
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    border-radius: 16rpx;
    padding: 20rpx;
    min-width: 300rpx;
}

.popup-header {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #eee;
    margin-bottom: 20rpx;
    text-align: center;
}

.popup-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
        border-bottom: none;
    }
}

.popup-icon {
    width: 48rpx;
    height: 48rpx;
    margin-right: 16rpx;
}

.popup-text {
    font-size: 28rpx;
    color: #333;
}
</style>
