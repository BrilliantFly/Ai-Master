<template>
    <page-meta :page-style="$theme.pageStyle">
        <!-- #ifndef H5 -->
        <navigation-bar :front-color="$theme.navColor" :background-color="$theme.navBgColor" />
        <!-- #endif -->
    </page-meta>

    <view class="user-set">
        <navigator url="/pages/user_data/user_data">
            <view class="item profile-card bg-white mt-[20rpx]">
                <u-avatar :src="displayAvatar" shape="square" :size="100"></u-avatar>
                <view class="ml-[20rpx] flex flex-1 justify-between items-center">
                    <view>
                        <view class="mb-[15rpx] text-xl font-medium">{{ displayName }}</view>
                        <view class="text-content text-xs">账号：{{ displayAccount }}</view>
                    </view>
                    <u-icon name="arrow-right" color="#666"></u-icon>
                </view>
            </view>
        </navigator>

        <view class="group-card bg-white mt-[20rpx]">
            <view class="item btn-border flex flex-1 justify-between" @click="handlePwd">
                <view>登录密码</view>
                <u-icon name="arrow-right" color="#666"></u-icon>
            </view>

            <view class="item btn-border flex flex-1 justify-between" @click="toggleThemePanel">
                <view>主题设置</view>
                <view class="flex items-center">
                    <view class="text-muted mr-[20rpx]">{{ currentThemeName }}</view>
                    <u-icon
                        :name="showThemePanel ? 'arrow-up' : 'arrow-down'"
                        color="#666"
                    ></u-icon>
                </view>
            </view>

            <view v-if="showThemePanel" class="theme-panel">
                <view
                    v-for="theme in themes"
                    :key="theme.key"
                    class="theme-row"
                    :class="{ active: currentTheme === theme.key }"
                    @click="selectTheme(theme.key)"
                >
                    <view class="theme-left">
                        <text class="swatch" :class="'sw-' + theme.key"></text>
                        <view class="theme-copy">
                            <view class="theme-name">{{ theme.name }}</view>
                            <view class="theme-desc">{{ descriptions[theme.key] }}</view>
                        </view>
                    </view>
                    <text class="theme-check">{{ currentTheme === theme.key ? '✓' : '' }}</text>
                </view>
            </view>

            <!-- #ifdef H5 || MP-WEIXIN -->
            <view
                v-if="isWeixin"
                class="item btn-border flex flex-1 justify-between"
                @click="bindWechatLock"
            >
                <view>绑定微信</view>
                <view class="flex justify-between">
                    <view class="text-muted mr-[20rpx]">
                        {{ userInfo.is_auth ? '已绑定' : '未绑定' }}
                    </view>
                    <u-icon v-if="userInfo.is_auth == 0" name="arrow-right" color="#666"></u-icon>
                </view>
            </view>
            <!-- #endif -->

            <navigator :url="`/pages/agreement/agreement?type=${AgreementEnum.PRIVACY}`">
                <view class="item btn-border flex flex-1 justify-between">
                    <view>隐私政策</view>
                    <u-icon name="arrow-right" color="#666"></u-icon>
                </view>
            </navigator>

            <navigator :url="`/pages/agreement/agreement?type=${AgreementEnum.SERVICE}`">
                <view class="item btn-border flex flex-1 justify-between">
                    <view>服务协议</view>
                    <u-icon name="arrow-right" color="#666"></u-icon>
                </view>
            </navigator>

            <navigator url="/pages/as_us/as_us">
                <view class="item flex flex-1 justify-between">
                    <view>关于我们</view>
                    <view class="flex justify-between">
                        <view class="text-muted mr-[20rpx]">
                            {{ appStore.config.version }}
                        </view>
                        <u-icon name="arrow-right" color="#666"></u-icon>
                    </view>
                </view>
            </navigator>
        </view>

        <view class="mt-[60rpx] mx-[26rpx]">
            <u-button type="primary" shape="circle" @click="showLogout = true">退出登录</u-button>
        </view>

        <u-action-sheet
            :list="list"
            v-model="show"
            @click="handleClick"
            :safe-area-inset-bottom="true"
        ></u-action-sheet>

        <u-popup
            class="pay-popup"
            v-model="showLogout"
            round
            mode="center"
            borderRadius="10"
            :maskCloseAble="false"
        >
            <view class="content bg-white w-[560rpx] p-[40rpx]">
                <view class="text-2xl font-medium text-center">温馨提示</view>
                <view class="pt-[30rpx] pb-[40rpx]">
                    <view>是否清除当前登录信息，退出登录？</view>
                </view>
                <view class="flex">
                    <view class="flex-1 mr-[20rpx]">
                        <u-button
                            shape="circle"
                            type="primary"
                            plain
                            size="medium"
                            hover-class="none"
                            :customStyle="{ width: '100%' }"
                            @click="showLogout = false"
                        >
                            取消
                        </u-button>
                    </view>
                    <view class="flex-1">
                        <u-button
                            shape="circle"
                            type="primary"
                            size="medium"
                            hover-class="none"
                            :customStyle="{ width: '100%' }"
                            @click="logoutHandle"
                        >
                            确认
                        </u-button>
                    </view>
                </view>
            </view>
        </u-popup>
    </view>
</template>

<script setup lang="ts">
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useThemeStore, VISUAL_THEMES } from '@/stores/theme'
import { AgreementEnum } from '@/enums/agreementEnums'
import { isWeixinClient } from '@/utils/client'
import { mnpAuthBind, oaAuthBind } from '@/api/account'
import { useLockFn } from '@/hooks/useLockFn'
import { useRouter } from 'uniapp-router-next'

// #ifdef H5
import wechatOa from '@/utils/wechat'
// #endif

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const themeStore = useThemeStore()
const userInfo = computed(() => userStore.userInfo || {})

const displayName = computed(() => {
    return (
        userInfo.value?.nickname ||
        userInfo.value?.realName ||
        userInfo.value?.realname ||
        userInfo.value?.name ||
        userInfo.value?.username ||
        '用户'
    )
})

const displayAccount = computed(() => {
    return (
        userInfo.value?.account ||
        userInfo.value?.username ||
        userInfo.value?.mobile ||
        userInfo.value?.phone ||
        '未设置'
    )
})

const displayAvatar = computed(() => {
    return userInfo.value?.avatar || '/static/images/user/default_avatar.png'
})

const list = ref([{ text: '修改密码' }, { text: '忘记密码' }])

const themes = VISUAL_THEMES
const currentTheme = computed(() => themeStore.currentVisualTheme)
const currentThemeName = computed(() => {
    const matched = themes.find((item) => item.key === currentTheme.value)
    return matched?.name || '默认'
})

const descriptions: Record<string, string> = {
    white: '纯白、简洁、清爽',
    dark: '深空、稳重、聚焦内容',
    warm: '暖阳、柔和、亲切',
    aurora: '极光、明亮、科技感',
    purple: '暗紫、对比强、夜间风格',
    glass: '玻璃、通透、未来感',
    orangold: '橙金、温暖、轻奢'
}

const isWeixin = ref(true)
// #ifdef H5
isWeixin.value = isWeixinClient()
// #endif

const show = ref(false)
const showLogout = ref(false)
const showThemePanel = ref(false)

const loadUser = async () => {
    if (!userStore.isLogin) return
    await userStore.getUser()
}

const toggleThemePanel = () => {
    showThemePanel.value = !showThemePanel.value
}

const selectTheme = (key: string) => {
    themeStore.setVisualTheme(key)
    uni.showToast({ title: '主题已切换', icon: 'none' })
}

const handleClick = (index: number) => {
    switch (index) {
        case 0:
            router.navigateTo('/pages/change_password/change_password')
            break
        case 1:
            router.navigateTo('/pages/forget_pwd/forget_pwd')
            break
    }
}

const handlePwd = () => {
    if (!userInfo.value.has_password) {
        router.navigateTo('/pages/change_password/change_password?type=set')
        return
    }
    show.value = true
}

const logoutHandle = () => {
    userStore.logout()
    router.redirectTo('/pages/login/login')
}

const bindWechat = async () => {
    if (userInfo.value.is_auth) return
    try {
        uni.showLoading({ title: '请稍候...' })
        // #ifdef MP-WEIXIN
        const { code }: any = await uni.login({ provider: 'weixin' })
        await mnpAuthBind({ code })
        // #endif
        // #ifdef H5
        if (isWeixin.value) {
            wechatOa.getUrl()
        }
        // #endif
        await userStore.getUser()
        uni.hideLoading()
    } catch (error) {
        uni.hideLoading()
        uni.$u.toast(error)
    }
}

const { lockFn: bindWechatLock } = useLockFn(bindWechat)

onShow(() => {
    loadUser()
})

onLoad(async (options) => {
    await loadUser()

    if (options.section === 'theme') {
        showThemePanel.value = true
    }

    // #ifdef H5
    const { code } = options
    if (!isWeixin.value) return
    if (code) {
        uni.showLoading({ title: '请稍候...' })
        try {
            await oaAuthBind({ code })
            await userStore.getUser()
        } catch (error) {}
        uni.hideLoading()
        router.redirectTo('/pages/user_set/user_set')
    }
    // #endif
})
</script>

<style lang="scss" scoped>
.user-set {
    padding: 0 24rpx 60rpx;
}

.group-card,
.profile-card {
    border-radius: 24rpx;
    overflow: hidden;
    background: var(--color-surface);
    box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.05);
}

.item {
    padding: 30rpx;
}

.btn-border {
    border-bottom: 2rpx solid var(--color-border-light);
}

.text-content,
.text-muted {
    color: var(--color-text-secondary);
}

.theme-panel {
    padding: 8rpx 24rpx 18rpx;
    background: var(--color-primary-mist);
}

.theme-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22rpx 8rpx;
    border-bottom: 1rpx solid rgba(var(--color-primary-rgb), 0.08);
}

.theme-row:last-child {
    border-bottom: none;
}

.theme-row.active {
    background: rgba(var(--color-primary-rgb), 0.08);
    border-radius: 18rpx;
    padding-left: 18rpx;
    padding-right: 18rpx;
}

.theme-left {
    display: flex;
    align-items: center;
    gap: 18rpx;
}

.theme-copy {
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

.theme-check {
    font-size: 30rpx;
    color: var(--color-primary);
    font-weight: 700;
}

.swatch {
    width: 28rpx;
    height: 28rpx;
    border-radius: 50%;
    border: 2rpx solid rgba(0, 0, 0, 0.08);
    flex-shrink: 0;
}

.sw-white {
    background: #f8fafc;
}

.sw-dark {
    background: #111827;
}

.sw-warm {
    background: #f6c38b;
}

.sw-aurora {
    background: #60a5fa;
}

.sw-purple {
    background: #7c3aed;
}

.sw-glass {
    background: linear-gradient(135deg, #667eea, #764ba2);
}

.sw-orangold {
    background: linear-gradient(135deg, #e87a5d, #d4a04a);
}
</style>
