<template>
    <view class="user premium-fade-in" :style="pageStyle">
        <view
            v-for="(item, index) in state.pages"
            :key="index"
            :class="'premium-fade-in premium-d' + Math.min(index + 1, 7)"
        >
            <template v-if="item.name === 'user-info'">
                <w-user-info
                    :pageMeta="state.meta"
                    :content="item.content"
                    :styles="item.styles"
                    :user="userInfo"
                    :is-login="isLogin"
                    :navColor="navColor"
                    :refresh-key="statsRefreshKey"
                />
            </template>

            <template v-else-if="item.name === 'my-service'">
                <w-my-service :content="item.content" :styles="item.styles" />
            </template>

            <template v-else-if="item.name === 'user-banner'">
                <w-user-banner :content="item.content" :styles="item.styles" />
            </template>
        </view>

        <tabbar />
    </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { getDecorate } from '@/api/shop'
import { useUserStore } from '@/stores/user'
import cache from '@/utils/cache'
import { BACK_URL } from '@/enums/constantEnums'

const state = reactive<{
    meta: any[]
    pages: any[]
}>({
    meta: [],
    pages: []
})

const userStore = useUserStore()
const { userInfo, isLogin } = storeToRefs(userStore)
const statsRefreshKey = ref(0)

const getData = async () => {
    const data = await getDecorate({ id: 2 })
    state.meta = JSON.parse(data.meta)
    state.pages = JSON.parse(data.data)
    uni.setNavigationBarTitle({
        title: state.meta[0]?.content?.title || '我的'
    })
    uni.setNavigationBarColor({
        frontColor: '#000000'
    })
}

const pageStyle = computed(() => {
    const { bg_type, bg_color, bg_image } = state.meta[0]?.content ?? {}
    if (bg_type !== undefined) {
        return bg_type === 1
            ? { 'background-color': bg_color || 'var(--color-bg-app)' }
            : { 'background-image': `url(${bg_image})` }
    }
    return { 'background-color': 'var(--color-bg-app)' }
})

const navColor = computed(() => {
    const { text_color } = state.meta[0]?.content ?? {}
    return text_color === 2 ? '#000000' : '#ffffff'
})

onShow(() => {
    if (!isLogin.value) {
        cache.set(BACK_URL, '/pages/user/user')
        uni.navigateTo({ url: '/pages/login/login' })
        return
    }
    userStore.getUser()
    statsRefreshKey.value += 1
})

getData()
</script>

<style lang="scss" scoped>
.user {
    position: relative;
    background-repeat: no-repeat;
    background-size: 100% auto;
    overflow: hidden;
    width: 100%;
    transition: background-color var(--duration) var(--ease),
        background-image var(--duration) var(--ease);
    min-height: calc(100vh - env(safe-area-inset-bottom));
    padding-bottom: 140rpx;
}
</style>
