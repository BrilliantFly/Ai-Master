<template>
    <view class="live-player-container">
        <!-- 视频播放器 -->
        <video
            ref="videoRef"
            class="video-player"
            :src="streamUrl"
            :poster="poster"
            :autoplay="autoplay"
            :muted="muted"
            :controls="false"
            :enable-progress-gesture="false"
            :enable-play-gesture="false"
            :show-center-play-btn="false"
            :show-loading="true"
            :show-fullscreen-btn="false"
            :show-play-btn="false"
            :show-center-play-btn="false"
            :objectFit="objectFit"
            :background="backgroundColor"
            @play="onPlay"
            @pause="onPause"
            @ended="onEnded"
            @error="onError"
            @waiting="onWaiting"
            @timeupdate="onTimeUpdate"
            @fullscreenchange="onFullscreenChange"
        />

        <!-- 加载状态 -->
        <view class="player-loading" v-if="isLoading">
            <view class="loading-spinner"></view>
            <text class="loading-text">{{ loadingText }}</text>
        </view>

        <!-- 错误状态 -->
        <view class="player-error" v-if="hasError">
            <text class="error-icon">⚠️</text>
            <text class="error-text">{{ errorMessage }}</text>
            <button class="retry-btn" @tap="retry">重新连接</button>
        </view>

        <!-- 播放按钮 -->
        <view class="play-button" v-if="!isPlaying && !isLoading && !hasError" @tap="play">
            <view class="play-icon">▶️</view>
        </view>

        <!-- 全屏按钮 -->
        <view class="fullscreen-btn" @tap="toggleFullscreen">
            <text>{{ isFullscreen ? '⛶' : '⛶' }}</text>
        </view>

        <!-- 设备信息 -->
        <view class="device-info" v-if="showDeviceInfo">
            <text class="device-name">{{ deviceName }}</text>
            <text class="device-status" :class="{ online: isOnline }">
                {{ isOnline ? '在线' : '离���' }}
            </text>
        </view>

        <!-- 画质切换 -->
        <view class="quality-selector" v-if="showQualitySelector && qualities.length > 1">
            <view
                class="quality-item"
                v-for="q in qualities"
                :key="q.value"
                :class="{ active: currentQuality === q.value }"
                @tap="switchQuality(q.value)"
            >
                {{ q.label }}
            </view>
        </view>

        <!-- 时间水印 -->
        <view class="time-watermark" v-if="showTimeWatermark">
            <text>{{ currentTime }}</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

export interface PlayerQuality {
    label: string
    value: string
    url: string
}

interface Props {
    streamUrl?: string
    poster?: string
    autoplay?: boolean
    muted?: boolean
    objectFit?: 'contain' | 'fill' | 'cover'
    backgroundColor?: string
    deviceName?: string
    showDeviceInfo?: boolean
    showQualitySelector?: boolean
    showTimeWatermark?: boolean
    qualities?: PlayerQuality[]
    currentQuality?: string
}

const props = withDefaults(defineProps<Props>(), {
    streamUrl: '',
    poster: '',
    autoplay: true,
    muted: false,
    objectFit: 'contain',
    backgroundColor: '#000',
    deviceName: '',
    showDeviceInfo: false,
    showQualitySelector: false,
    showTimeWatermark: true,
    qualities: () => [],
    currentQuality: 'main'
})

const emit = defineEmits([
    'play',
    'pause',
    'ended',
    'error',
    'waiting',
    'timeupdate',
    'fullscreenchange',
    'qualityChange'
])

const videoRef = ref<any>(null)
const isLoading = ref(false)
const isPlaying = ref(false)
const hasError = ref(false)
const isFullscreen = ref(false)
const isOnline = ref(true)
const loadingText = ref('正在连接...')
const errorMessage = ref('视频加载失败')
const currentTime = ref('')

// 定时器
let timeUpdateTimer: any = null

onMounted(() => {
    startTimeUpdate()
})

onUnmounted(() => {
    stopTimeUpdate()
})

function startTimeUpdate() {
    timeUpdateTimer = setInterval(() => {
        updateCurrentTime()
    }, 1000)
}

function stopTimeUpdate() {
    if (timeUpdateTimer) {
        clearInterval(timeUpdateTimer)
        timeUpdateTimer = null
    }
}

function updateCurrentTime() {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

// 播放控制
function play() {
    videoRef.value?.play()
}

function pause() {
    videoRef.value?.pause()
}

function stop() {
    videoRef.value?.pause()
    videoRef.value?.seek(0)
}

function seek(time: number) {
    videoRef.value?.seek(time)
}

// 全屏控制
function toggleFullscreen() {
    if (isFullscreen.value) {
        exitFullscreen()
    } else {
        enterFullscreen()
    }
}

function enterFullscreen() {
    videoRef.value?.requestFullScreen?.()
    isFullscreen.value = true
}

function exitFullscreen() {
    videoRef.value?.exitFullScreen?.()
    isFullscreen.value = false
}

// 画质切换
function switchQuality(quality: string) {
    emit('qualityChange', quality)
}

// 重试
function retry() {
    hasError.value = false
    isLoading.value = true
    loadingText.value = '正在重新连接...'

    setTimeout(() => {
        if (props.streamUrl) {
            play()
        } else {
            hasError.value = true
            errorMessage.value = '请先配置视频流地址'
        }
        isLoading.value = false
    }, 1000)
}

// 事件处理
function onPlay() {
    isPlaying.value = true
    isLoading.value = false
    hasError.value = false
    emit('play')
}

function onPause() {
    isPlaying.value = false
    emit('pause')
}

function onEnded() {
    isPlaying.value = false
    emit('ended')
}

function onError(e: any) {
    hasError.value = true
    isLoading.value = false
    isPlaying.value = false
    errorMessage.value = '视频加载失败，请检查设备连接'
    emit('error', e)
}

function onWaiting() {
    isLoading.value = true
    loadingText.value = '正在缓冲...'
    emit('waiting')
}

function onTimeUpdate(e: any) {
    isLoading.value = false
    emit('timeupdate', e)
}

function onFullscreenChange(e: any) {
    isFullscreen.value = e.detail?.fullScreen || false
    emit('fullscreenchange', e)
}

// 暴露方法
defineExpose({
    play,
    pause,
    stop,
    seek,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
    retry,
    videoRef
})
</script>

<style scoped lang="scss">
.live-player-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.video-player {
    width: 100%;
    height: 100%;
}

.player-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;

    .loading-spinner {
        width: 60rpx;
        height: 60rpx;
        border: 4rpx solid rgba(255, 255, 255, 0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .loading-text {
        margin-top: 20rpx;
        font-size: 26rpx;
        color: #fff;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.player-error {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;

    .error-icon {
        font-size: 80rpx;
        margin-bottom: 30rpx;
    }

    .error-text {
        font-size: 28rpx;
        color: #fff;
        margin-bottom: 40rpx;
    }

    .retry-btn {
        padding: 16rpx 48rpx;
        background: var(--color-primary);
        color: #fff;
        border-radius: 40rpx;
        font-size: 28rpx;
    }
}

.play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120rpx;
    height: 120rpx;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;

    .play-icon {
        font-size: 50rpx;
        margin-left: 8rpx;
    }
}

.fullscreen-btn {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 60rpx;
    height: 60rpx;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #fff;
    z-index: 10;
}

.device-info {
    position: absolute;
    top: 20rpx;
    left: 20rpx;
    display: flex;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
    padding: 10rpx 20rpx;
    border-radius: 20rpx;
    z-index: 10;

    .device-name {
        font-size: 24rpx;
        color: #fff;
        margin-right: 16rpx;
    }

    .device-status {
        font-size: 22rpx;
        color: var(--color-text-tertiary);

        &.online {
            color: var(--color-success);
        }
    }
}

.quality-selector {
    position: absolute;
    bottom: 120rpx;
    right: 20rpx;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 12rpx;
    padding: 16rpx;
    z-index: 10;

    .quality-item {
        padding: 12rpx 24rpx;
        font-size: 24rpx;
        color: #fff;
        text-align: center;
        border-radius: 8rpx;
        margin-bottom: 8rpx;

        &:last-child {
            margin-bottom: 0;
        }

        &.active {
            background: var(--color-primary);
        }
    }
}

.time-watermark {
    position: absolute;
    bottom: 20rpx;
    left: 20rpx;
    padding: 8rpx 16rpx;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 8rpx;
    z-index: 10;

    text {
        font-size: 22rpx;
        color: #fff;
        font-family: monospace;
    }
}
</style>
