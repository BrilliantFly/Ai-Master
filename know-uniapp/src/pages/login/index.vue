<template>
    <view class="login-container">
        <view class="login-header">
            <image
                :src="appStore.getWebsiteConfig.shop_logo"
                mode="widthFix"
                class="logo"
            />
        </view>
        
        <view class="login-form">
            <view class="input-item">
                <image src="/static/images/icon/icon_user.png" class="input-icon" />
                <input
                    v-model="formData.username"
                    type="text"
                    placeholder="请输入用户名"
                    class="input-field"
                />
            </view>
            
            <view class="input-item">
                <image src="/static/images/icon/icon_password.png" class="input-icon" />
                <input
                    v-model="formData.password"
                    type="password"
                    placeholder="请输入密码"
                    class="input-field"
                />
            </view>
            
            <view class="login-btn" :class="{ disabled: !canLogin }" @click="handleLogin">
                登录
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { login } from '@/api/auth'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { createRouter } from 'uniapp-router-next'

const router = createRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const formData = reactive({
    username: '',
    password: ''
})

const canLogin = computed(() => {
    return formData.username && formData.password
})

const handleLogin = async () => {
    if (!canLogin.value) return
    
    if (!formData.username) {
        uni.showToast({ title: '请输入用户名', icon: 'none' })
        return
    }
    if (!formData.password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return
    }
    
    uni.showLoading({ title: '登录中...' })
    
    try {
        const data = await login(formData.username, formData.password)
        
        // Store token
        userStore.login(data.token)
        
        // Get user info
        await userStore.getUser()
        
        uni.hideLoading()
        uni.showToast({ title: '登录成功', icon: 'success' })
        
        // Navigate to home page
        router.switchTab('/pages/index/index')
    } catch (error: any) {
        uni.hideLoading()
        uni.showToast({ title: error || '登录失败', icon: 'none' })
    }
}
</script>

<style lang="scss" scoped>
.login-container {
    min-height: 100vh;
    background-color: #fff;
    padding: 120rpx 60rpx 0;
    box-sizing: border-box;
}

.login-header {
    display: flex;
    justify-content: center;
    margin-bottom: 100rpx;
}

.logo {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
}

.login-form {
    width: 100%;
}

.input-item {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
    border: 1rpx solid #ddd;
    border-radius: 10rpx;
    margin-bottom: 30rpx;
}

.input-icon {
    width: 40rpx;
    height: 40rpx;
    margin-right: 20rpx;
}

.input-field {
    flex: 1;
    height: 60rpx;
    font-size: 28rpx;
}

.login-btn {
    height: 90rpx;
    line-height: 90rpx;
    text-align: center;
    background-color: #07c160;
    color: #fff;
    border-radius: 45rpx;
    font-size: 32rpx;
    margin-top: 60rpx;
    
    &.disabled {
        opacity: 0.5;
    }
}
</style>
