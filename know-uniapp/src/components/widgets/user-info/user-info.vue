<template>
    <view class="user-info_widget">
        <!-- #ifndef H5 -->
        <u-sticky h5-nav-height="0" bg-color="transparent">
            <u-navbar
                :is-back="false"
                :is-fixed="false"
                :title="metaData.title"
                :custom-title="metaData.title_type == 2"
                :border-bottom="false"
                :title-bold="true"
                :background="{ background: 'rgba(256,256,256,0)' }"
                :title-color="navColor"
            >
                <template #title>
                    <image class="!h-[54rpx]" :src="metaData.title_img" mode="widthFix"></image>
                </template>
            </u-navbar>
        </u-sticky>
        <!-- #endif -->

        <view
            class="profile-section flex items-center justify-between px-[50rpx] pb-[60rpx] pt-[50rpx]"
        >
            <view
                v-if="isLogin"
                class="flex items-center"
                @click="navigateTo('/pages/user_data/user_data')"
            >
                <view class="profile-avatar-wrap">
                    <u-avatar :src="displayAvatar" :size="128"></u-avatar>
                </view>
                <view class="text-white ml-[24rpx]">
                    <view class="profile-name">{{ displayName }}</view>
                    <view class="profile-account" @click.stop="copy(displayAccount)">
                        <text class="account-icon">#</text>
                        账号：{{ displayAccount }}
                    </view>
                </view>
            </view>

            <navigator v-else class="flex items-center" hover-class="none" url="/pages/login/login">
                <view class="profile-avatar-wrap">
                    <u-avatar src="/static/images/user/default_avatar.png" :size="128"></u-avatar>
                </view>
                <view class="text-white text-3xl ml-[24rpx]">未登录</view>
            </navigator>

            <navigator v-if="isLogin" hover-class="none" url="/pages/user_set/user_set">
                <view class="settings-btn">
                    <u-icon name="setting" color="#fff" :size="44"></u-icon>
                </view>
            </navigator>
        </view>

        <view class="stats-card">
            <view class="stat-item" @click="navigateTo('/pages/camera/index')">
                <view class="num">{{ stats.deviceCount }}</view>
                <view class="label">设备数</view>
            </view>
            <view class="stat-item" @click="navigateTo('/pages/plan/home/index')">
                <view class="num">{{ stats.todayCheckins }}</view>
                <view class="label">今日打卡</view>
            </view>
            <view class="stat-item" @click="navigateTo('/pages/plan/schedule/index')">
                <view class="num">{{ stats.todoCount }}</view>
                <view class="label">待办</view>
            </view>
            <view class="stat-item" @click="navigateTo('/pages/customer/info')">
                <view class="num">{{ stats.customerCount }}</view>
                <view class="label">客户</view>
            </view>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { computed, reactive, watch } from 'vue'
import { useCopy } from '@/hooks/useCopy'
import { getCameraPage } from '@/api/camera'
import { getHabitStats } from '@/api/plan/habit'
import { getTodayStats } from '@/api/plan/schedule'
import { getCustomerStats } from '@/api/customer'

const props = defineProps({
    pageMeta: {
        type: Object,
        default: () => []
    },
    content: {
        type: Object,
        default: () => ({})
    },
    styles: {
        type: Object,
        default: () => ({})
    },
    user: {
        type: Object,
        default: () => ({})
    },
    isLogin: {
        type: Boolean
    },
    refreshKey: {
        type: Number,
        default: 0
    },
    navColor: {
        type: String,
        default: '#000000'
    }
})

const stats = reactive({
    deviceCount: 0,
    todayCheckins: 0,
    todoCount: 0,
    customerCount: 0
})

const { copy } = useCopy()

const metaData: any = computed(() => props.pageMeta[0]?.content || {})

const displayName = computed(() => {
    return (
        props.user?.nickname ||
        props.user?.realName ||
        props.user?.realname ||
        props.user?.name ||
        props.user?.username ||
        '用户'
    )
})

const displayAccount = computed(() => {
    return (
        props.user?.account ||
        props.user?.username ||
        props.user?.mobile ||
        props.user?.phone ||
        '未设置'
    )
})

const displayAvatar = computed(() => {
    return props.user?.avatar || '/static/images/user/default_avatar.png'
})

const loadStats = async () => {
    if (!props.isLogin) {
        stats.deviceCount = 0
        stats.todayCheckins = 0
        stats.todoCount = 0
        stats.customerCount = 0
        return
    }

    getCameraPage({ pageNum: 1, pageSize: 1 })
        .then((res: any) => {
            if (res && res.total !== undefined) stats.deviceCount = res.total
        })
        .catch((error: any) => console.error('加载设备数失败', error))

    getHabitStats()
        .then((res: any) => {
            if (res && res.todayCheckins !== undefined) stats.todayCheckins = res.todayCheckins
        })
        .catch((error: any) => console.error('加载打卡统计失败', error))

    getTodayStats()
        .then((res: any) => {
            if (res && res.todoCount !== undefined) stats.todoCount = res.todoCount
        })
        .catch((error: any) => console.error('加载待办统计失败', error))

    getCustomerStats()
        .then((res: any) => {
            if (res !== undefined && res !== null) {
                if (typeof res === 'number') {
                    stats.customerCount = res
                } else if (res.total !== undefined) {
                    stats.customerCount = res.total
                } else if (res.data !== undefined && typeof res.data === 'number') {
                    stats.customerCount = res.data
                } else if (res.count !== undefined) {
                    stats.customerCount = res.count
                }
            }
        })
        .catch((error: any) => console.error('加载客户统计失败', error))
}

const navigateTo = (url: string) => {
    uni.navigateTo({ url })
}

watch(
    () => [props.isLogin, props.refreshKey],
    () => {
        loadStats()
    },
    { immediate: true }
)
</script>

<style lang="scss" scoped>
.user-info_widget {
    position: relative;
}

.profile-section {
    position: relative;
    z-index: 2;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url(../../../static/images/user/my_topbg.png), var(--gradient-primary);
        background-repeat: no-repeat;
        background-position: bottom;
        background-size: 100%;
        z-index: -1;
        border-radius: 0 0 48rpx 48rpx;
        box-shadow: 0 8rpx 40rpx rgba(var(--color-primary-rgb), 0.35);
    }
}

.profile-avatar-wrap {
    position: relative;

    &::after {
        content: '';
        position: absolute;
        inset: -6rpx;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.1));
        z-index: -1;
    }
}

.profile-name {
    font-size: 36rpx;
    font-weight: 700;
    color: #fff;
    letter-spacing: 1rpx;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.profile-account {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.75);
    margin-top: 10rpx;
    display: flex;
    align-items: center;
    gap: 6rpx;
    background: rgba(255, 255, 255, 0.12);
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    backdrop-filter: blur(10rpx);
    -webkit-backdrop-filter: blur(10rpx);
    border: 1rpx solid rgba(255, 255, 255, 0.1);
    width: fit-content;
}

.account-icon {
    font-size: 22rpx;
}

.settings-btn {
    width: 80rpx;
    height: 80rpx;
    border-radius: 40rpx;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(10rpx);
    -webkit-backdrop-filter: blur(10rpx);
    border: 1rpx solid rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s;
}

.settings-btn:active {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(0.92);
}

.stats-card {
    display: flex;
    align-items: center;
    margin: -40rpx 32rpx 0;
    padding: 30rpx 8rpx;
    background: var(--color-surface);
    border-radius: 24rpx;
    box-shadow: 0 8rpx 48rpx rgba(0, 0, 0, 0.08);
    position: relative;
    z-index: 10;
    border: 1rpx solid rgba(0, 0, 0, 0.04);
    transition: all 0.3s;
}

.stat-item {
    flex: 1;
    text-align: center;
    padding: 8rpx 0;
    position: relative;
    transition: all 0.2s;
}

.stat-item:active {
    transform: scale(0.92);
}

.stat-item + .stat-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    height: 60%;
    width: 1rpx;
    background: var(--color-border-light);
}

.stat-item .num {
    font-size: 40rpx;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.2;
}

.stat-item .label {
    font-size: 22rpx;
    color: var(--color-text-secondary);
    margin-top: 6rpx;
    font-weight: 400;
}
</style>
