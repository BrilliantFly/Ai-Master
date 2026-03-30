<template>
	<page-meta :page-style="$theme.pageStyle">
		<!-- #ifndef H5 -->
		<navigation-bar :front-color="$theme.navColor" :background-color="$theme.navBgColor" />
		<!-- #endif -->
	</page-meta>
	<view class="index" :style="pageStyle">
		<!-- 组件 -->
		<template v-for="(item, index) in state.pages" :key="index">
			<template v-if="item.name == 'search'">
				<w-search :pageMeta="state.meta" :content="item.content" :styles="item.styles" :percent="percent"
					:isLargeScreen="isLargeScreen" />
			</template>
			<template v-if="item.name == 'banner'">
				<w-banner :content="item.content" :styles="item.styles" :isLargeScreen="isLargeScreen"
					@change="handleBanner" />
			</template>

		</template>

		<!--通知栏-->
		<view class="relative mx-[20rpx] mt-[20rpx]">
			<uni-notice-bar class="notice-bar-info" show-icon scrollable color="#2979FF" background-color="#EAF2FF"
				:text="noticeInfos" />
		</view>

		<template v-for="(item, index) in state.pages" :key="index">
			<!--中间菜单-->
			<template v-if="item.name == 'nav'">
				<w-nav :content="item.content" :styles="item.styles" />
			</template>
			<!--中间banner-->
			<template v-if="item.name == 'middle-banner'">
				<w-middle-banner :content="item.content" :styles="item.styles" />
			</template>
		</template>

		<w-popular></w-popular>

		<!-- <view class="article" v-if="state.article.length">
            <view
                class="flex items-center article-title mx-[20rpx] my-[30rpx] text-lg font-medium"
            >
                最新文章
            </view>
            <news-card
                v-for="item in state.article"
                :key="item.id"
                :news-id="item.id"
                :item="item"
            />
        </view> -->

		<!--  #ifdef H5  -->
		<view class="text-center py-4 mb-12">
			<router-navigate class="mx-1 text-xs text-[#495770]" :to="{
                    path: '/pages/webview/webview',
                    query: {
                        url: item.value
                    }
                }" v-for="item in appStore.getCopyrightConfig" :key="item.key">
				{{ item.key }}
			</router-navigate>
		</view>
		<!--  #endif  -->

		<!-- 返回顶部按钮 -->
		<u-back-top :scroll-top="scrollTop" :top="100" :customStyle="{
                backgroundColor: '#FFF',
                color: '#000',
                boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)'
            }">
		</u-back-top>

		<!--  #ifdef MP  -->
		<!--  微信小程序隐私弹窗  -->
		<MpPrivacyPopup></MpPrivacyPopup>
		<!--  #endif  -->

		<tabbar />
	</view>
</template>

<script setup lang="ts">
	import { getIndex } from '@/api/shop'
	import { onLoad, onPageScroll } from "@dcloudio/uni-app";
	import { computed, reactive, ref } from 'vue'
	import { useAppStore } from '@/stores/app'

	// #ifdef MP
	import MpPrivacyPopup from './component/mp-privacy-popup.vue'
	// #endif

	const appStore = useAppStore()
	const state = reactive<{
		pages : any[]
		meta : any[]
		article : any[]
		bannerImage : string
	}>({
		pages: [],
		meta: [],
		article: [],
		bannerImage: ''
	})
	const scrollTop = ref<number>(0)
	const percent = ref<number>(0)

	const noticeInfos = 'uView UI众多组件覆盖开发过程的各个需求，组件功能丰富，多端兼容。让您快速集成，开箱即用';

	// 是否联动背景图
	const isLinkage = computed(() => {
		return state.pages.find((item : any) => item.name === 'banner')?.content.bg_style === 1
	})
	// 是否大屏banner
	const isLargeScreen = computed(() => {
		return state.pages.find((item : any) => item.name === 'banner')?.content.style === 2
	})

	// 根页面样式
	const pageStyle = computed(() => {
		const { bg_type, bg_color, bg_image } = state.meta[0]?.content ?? {}
		if (!isLinkage.value) {
			return bg_type == 1 ?
				{ 'background-color': bg_color } :
				{ 'background-image': `url(${bg_image})` }
		}
		else return { 'background-image': `url(${state.bannerImage})` }
	})

	const handleBanner = (url : string) => {
		state.bannerImage = url
	}

	const getData = async () => {
		const data = await getIndex()
		state.pages = JSON.parse(data?.page?.data)
		state.meta = JSON.parse(data?.page?.meta)
		state.article = data.article
		uni.setNavigationBarTitle({
			title: state.meta[0].content.title
		})
	}

	onPageScroll((event : any) => {
		scrollTop.value = event.scrollTop
		const top = uni.upx2px(100)
		percent.value = event.scrollTop / top > 1 ? 1 : event.scrollTop / top
	})

	onLoad(() => { getData() })
</script>

<style lang="scss" scoped>
	.index {
		position: relative;
		background-repeat: no-repeat;
		background-size: 100% auto;
		overflow: hidden;
		width: 100%;
		transition: all 1s;
		min-height: calc(100vh - env(safe-area-inset-bottom));
	}

	.article-title {
		&::before {
			content: '';
			width: 8rpx;
			height: 34rpx;
			display: block;
			margin-right: 10rpx;
			@apply bg-primary;
		}
	}

	uni-view.uni-noticebar.notice-bar-info {
		border-radius: 10px;
	}
</style>