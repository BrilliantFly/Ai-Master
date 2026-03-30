<template>
    <div class="my-service bg-white mx-[20rpx] mt-[20rpx] rounded-lg p-[30rpx]">
        <div
            v-if="content.title"
            class="title font-medium text-lg"
        >
            <div>{{ content.title }}</div>
        </div>
        <div v-if="content.style == 1" class="grid grid-cols-4 gap-x-9 gap-y-7">
            <div
                v-for="(item, index) in showList"
                :key="index"
                class="flex flex-col items-center pt-[40rpx]"
                @click="handleClick(item.link,item.name)"
            >
				<!-- <u-image width="52" height="52" :src="getImageUrl(item.image)" alt="" />
				<div class="mt-[22rpx] text-sm">{{ item.name }}</div> -->
				
				<u-image v-if="item.name !== '联系客服'" width="52" height="52" :src="getImageUrl(item.image)" alt="" />
				<div v-if="item.name !== '联系客服'" class="mt-[22rpx] text-sm">{{ item.name }}</div>
				
				<!--isLogin 因为点击按钮同时触发客服及跳转登陆界面，所有未登录不显示-->
				<button v-if="item.name === '联系客服' && isLogin" class="contact-button" open-type="contact">
					<u-image class="contact-image" width="52" height="52" :src="getImageUrl(item.image)" alt="" />
					<div class="mt-[22rpx] text-sm">{{ item.name }}</div>
				</button>
				
				
				<!-- <view v-if="item.name !== '联系客服'" @click="handleClick(item.link,item.name)">
					<u-image  width="52" height="52" :src="getImageUrl(item.image)" alt="" />
					<div class="mt-[22rpx] text-sm">{{ item.name }}</div>
				</view>
                <view v-else>
					<button class="contact-button" open-type="contact">
						<u-image class="contact-image" width="52" height="52" :src="getImageUrl(item.image)" alt="" />
						<div class="mt-[22rpx] text-sm">{{ item.name }}</div>
					</button>
				</view> -->
            </div>
        </div>
        <div v-if="content.style == 2">
            <div
                v-for="(item, index) in showList"
                :key="index"
                class="flex items-center border-light border-solid border-0 border-b h-[100rpx] px-[24rpx]"
                @click="handleClick(item.link,item.name)"
            >
               <u-image width="48" height="48" :src="getImageUrl(item.image)" alt="" />
                <div class="ml-[20rpx] flex-1 text-sm">{{ item.name }}</div>
                <div class="text-muted">
                    <u-icon name="arrow-right" />
                </div>
				
				<!-- <u-image v-if="item.name !== '联系客服'" width="48" height="48" :src="getImageUrl(item.image)" alt="" />
				<div v-if="item.name !== '联系客服'" class="ml-[20rpx] flex-1 text-sm">{{ item.name }}</div>
				<div v-if="item.name !== '联系客服'" class="text-muted">
				    <u-icon name="arrow-right" />
				</div>
				
				<button v-if="item.name === '联系客服'" class="contact-button-other" open-type="contact">
					<u-image  width="48" height="48" :src="getImageUrl(item.image)" alt="" />
					<div class="ml-[20rpx] flex-1 text-sm">{{ item.name }}</div>
					<div class="text-muted">
					    <u-icon name="arrow-right" />
					</div>
				</button> -->
				
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/stores/app'
import { navigateTo } from '@/utils/util'
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

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
const { getImageUrl } = useAppStore()

import { ref } from 'vue';
import type { ComponentPublicInstance } from 'vue';
const contactBtn = ref<ComponentPublicInstance | null>(null);

const userStore = useUserStore()
const { userInfo, isLogin } = storeToRefs(userStore)

const handleClick = (link: any,name: any) => {
	
	if(name == '联系客服'){
		// 获取token，如果没有token隐藏
	}else{
		navigateTo(link)
	}
	
	//navigateTo(link)
}

const showList = computed(() => {
    return props.content.data?.filter((item: any) => item.is_show == '1') || []
})
</script>

<style lang="scss">
	.contact-button {
		padding-left: 0px;
	    padding-right: 0px;
		line-height: 1.555556;
		display: block;
		background: white;
		// display: contents;  这个设置导致点击结果联系客服
	}
	
	// 去除按钮边框
	.contact-button::after {
		border: none !important;
	}
	
	.contact-image{
		margin: 0 auto;
		display: list-item;  // 兼容小程序居中
		margin-left: 9px;	// 兼容小程序居中
	}
</style>
