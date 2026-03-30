<template>
	<view class="home-page">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="search-input" @click="goSearch">
				<text class="icon">🔍</text>
				<text class="placeholder">搜索</text>
			</view>
		</view>

		<!-- 轮播图 -->
		<view class="banner-section" v-if="bannerList.length">
			<swiper class="banner-swiper" indicator-dots indicator-color="rgba(255,255,255,0.5)" indicator-active-color="#fff" autoplay circular>
				<swiper-item v-for="(item, index) in bannerList" :key="index" @click="goLink(item.link)">
					<image :src="item.image" mode="aspectFill" class="banner-image" />
				</swiper-item>
			</swiper>
		</view>

		<!-- 通知公告 -->
		<view class="notice-section" v-if="noticeList.length" @click="goNotice">
			<view class="notice-icon">📢</view>
			<swiper class="notice-swiper" vertical autoplay circular :interval="3000" :display-multiple-items="1">
				<swiper-item v-for="(item, index) in noticeList" :key="index">
					<view class="notice-item">{{ item.title }}</view>
				</swiper-item>
			</swiper>
			<text class="notice-more">更多 ></text>
		</view>

		<!-- 滚动菜单 -->
		<view class="menu-section" v-if="menuList.length">
			<scroll-view class="menu-scroll" scroll-x>
				<view class="menu-list">
					<view 
						v-for="(item, index) in menuList" 
						:key="index" 
						class="menu-item"
						@click="goLink(item.path)"
					>
						<view class="menu-icon" :style="{ backgroundColor: item.color || '#1890FF' }">
							{{ item.name.slice(0, 1) }}
						</view>
						<text class="menu-name">{{ item.name }}</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 九宫格菜单 -->
		<view class="grid-section" v-if="gridList.length">
			<view class="grid-list">
				<view 
					v-for="(item, index) in gridList" 
					:key="index" 
					class="grid-item"
					@click="goLink(item.path)"
				>
					<view class="grid-icon" :style="{ backgroundColor: item.color || '#52C41A' }">
						{{ item.name.slice(0, 1) }}
					</view>
					<text class="grid-name">{{ item.name }}</text>
				</view>
			</view>
		</view>

		<!-- 内容区域 -->
		<view class="content-section">
			<view class="section-title">推荐内容</view>
			<!-- 这里可以放置文章列表或其他内容 -->
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive, onMounted } from 'vue'
	import { onShow } from '@dcloudio/uni-app'
	import { getHomeConfig } from '@/api/plan/home'

	const bannerList = ref<any[]>([])
	const noticeList = ref<any[]>([])
	const menuList = ref<any[]>([])
	const gridList = ref<any[]>([])

	const userId = 1
	const roleId = '1'

	const loadConfig = async () => {
		try {
			const data = await getHomeConfig({ userId, roleId })
			const config = data || {}

			// 解析轮播图
			if (config.banner && config.banner.content) {
				try {
					const content = JSON.parse(config.banner.content)
					bannerList.value = content.banners || []
				} catch (e) {
					bannerList.value = []
				}
			}

			// 解析通知
			if (config.notice && config.notice.content) {
				try {
					const content = JSON.parse(config.notice.content)
					noticeList.value = content.notices || []
				} catch (e) {
					noticeList.value = []
				}
			}

			// 解析滚动菜单
			if (config.menu && config.menu.content) {
				try {
					const content = JSON.parse(config.menu.content)
					menuList.value = content.menus || []
				} catch (e) {
					menuList.value = []
				}
			}

			// 解析九宫格
			if (config.grid && config.grid.content) {
				try {
					const content = JSON.parse(config.grid.content)
					gridList.value = content.grids || []
				} catch (e) {
					gridList.value = []
				}
			}
		} catch (e) {
			console.error('加载首页配置失败', e)
		}
	}

	const goSearch = () => {
		uni.navigateTo({
			url: '/pages/search/search'
		})
	}

	const goNotice = () => {
		uni.navigateTo({
			url: '/pages/notice/notice'
		})
	}

	const goLink = (path: string) => {
		if (!path) return
		uni.navigateTo({
			url: path
		})
	}

	onShow(() => {
		loadConfig()
	})

	onMounted(() => {
		loadConfig()
	})
</script>

<style lang="scss" scoped>
	.home-page {
		min-height: 100vh;
		background: #f5f5f5;
	}

	.search-bar {
		padding: 20rpx 30rpx;
		background: #fff;
	}

	.search-input {
		display: flex;
		align-items: center;
		background: #f5f5f5;
		border-radius: 40rpx;
		padding: 16rpx 30rpx;
	}

	.search-input .icon {
		margin-right: 16rpx;
	}

	.search-input .placeholder {
		color: #999;
		font-size: 28rpx;
	}

	.banner-section {
		padding: 20rpx;
	}

	.banner-swiper {
		width: 100%;
		height: 300rpx;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.banner-image {
		width: 100%;
		height: 100%;
	}

	.notice-section {
		display: flex;
		align-items: center;
		background: #fff;
		margin: 0 20rpx 20rpx;
		padding: 20rpx 24rpx;
		border-radius: 12rpx;
	}

	.notice-icon {
		font-size: 36rpx;
		margin-right: 16rpx;
	}

	.notice-swiper {
		flex: 1;
		height: 48rpx;
	}

	.notice-item {
		font-size: 26rpx;
		color: #333;
		line-height: 48rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.notice-more {
		font-size: 24rpx;
		color: #999;
		margin-left: 16rpx;
	}

	.menu-section {
		background: #fff;
		margin: 0 20rpx 20rpx;
		padding: 24rpx 0;
		border-radius: 12rpx;
	}

	.menu-scroll {
		white-space: nowrap;
	}

	.menu-list {
		display: inline-flex;
		padding: 0 20rpx;
	}

	.menu-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 40rpx;
	}

	.menu-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 12rpx;
	}

	.menu-name {
		font-size: 24rpx;
		color: #333;
	}

	.grid-section {
		background: #fff;
		margin: 0 20rpx 20rpx;
		padding: 24rpx;
		border-radius: 12rpx;
	}

	.grid-list {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 24rpx;
	}

	.grid-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.grid-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 12rpx;
	}

	.grid-name {
		font-size: 24rpx;
		color: #333;
	}

	.content-section {
		background: #fff;
		margin: 0 20rpx;
		padding: 24rpx;
		border-radius: 12rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}
</style>
