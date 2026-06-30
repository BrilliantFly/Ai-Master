<template>
    <view class="player-page">
        <!-- 视频播放器 -->
        <LivePlayer
            ref="playerRef"
            :streamUrl="streamUrl"
            :poster="poster"
            :autoplay="true"
            :muted="isMuted"
            :deviceName="device?.deviceName || device?.name"
            :showDeviceInfo="true"
            :showQualitySelector="true"
            :qualities="qualities"
            :currentQuality="currentQuality"
            :showTimeWatermark="true"
            @play="onPlay"
            @pause="onPause"
            @error="onError"
            @qualityChange="onQualityChange"
        />

        <!-- 播放控制栏 -->
        <PlayerControls
            :deviceName="device?.deviceName || device?.name"
            :isPlaying="isPlaying"
            :isFullscreen="isFullscreen"
            :isMuted="isMuted"
            @back="onBack"
            @snapshot="onSnapshot"
            @recordStart="onRecordStart"
            @recordStop="onRecordStop"
            @audio="toggleAudio"
            @fullscreen="toggleFullscreen"
            @menu="showMenu"
        />
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { onLoad, onShow, onHide, onUnload } from '@dcloudio/uni-app'
import {
    getCameraDetail,
    startRecord,
    stopRecord as stopRecordApi,
    saveSnapshot,
    type CameraDevice
} from '@/api/camera'

const playerRef = ref<any>(null)
const device = ref<CameraDevice | null>(null)
const deviceId = ref<number>(0)
const streamUrl = ref('')
const poster = ref('')
const isPlaying = ref(false)
const isFullscreen = ref(false)
const isMuted = ref(false)
const isRecording = ref(false)
const recordingId = ref<number | null>(null)
const qualities = ref([
    { label: '主码流', value: 'main', url: '' },
    { label: '子码流', value: 'sub', url: '' }
])
const currentQuality = ref('main')

onLoad(async (query: any) => {
    if (query.id) {
        deviceId.value = parseInt(query.id)
        await loadDevice()
    }
})

onShow(() => {
    if (deviceId.value) {
        startLive()
    }
})

onHide(() => {
    // 页面隐藏时暂停播放
    playerRef.value?.pause()
})

onUnload(() => {
    // 页面卸载时停止录像
    if (isRecording.value) {
        onRecordStop()
    }
})

async function loadDevice() {
    try {
        device.value = (await getCameraDetail(deviceId.value)) as CameraDevice
        generateStreamUrl()
    } catch (e) {
        console.error('加载设备失败', e)
        uni.showToast({ title: '加载设备失败', icon: 'none' })
    }
}

function generateStreamUrl() {
    if (!device.value) return

    const { ipAddress, port, username, password, streamUrl: savedUrl } = device.value

    if (savedUrl) {
        // 使用已保存的流地址
        streamUrl.value = savedUrl
    } else if (ipAddress) {
        // 生成RTSP流地址
        const p = port || 554
        const user = username ? `${username}:${password}@` : ''
        streamUrl.value = `rtsp://${user}${ipAddress}:${p}/live/stream`
    }

    // 设置缩略图
    if (device.value.snapshotUrl) {
        poster.value = device.value.snapshotUrl
    }
}

function startLive() {
    if (streamUrl.value) {
        playerRef.value?.play()
    }
}

function onPlay() {
    isPlaying.value = true
}

function onPause() {
    isPlaying.value = false
}

function onError(e: any) {
    console.error('播放错误', e)
    uni.showToast({ title: '视频加载失败', icon: 'none' })
}

function onBack() {
    uni.navigateBack()
}

async function onSnapshot() {
    if (!deviceId.value) return

    uni.showLoading({ title: '截图保存中...' })

    try {
        // 获取当前视频画面截图
        const canvas = uni.createCanvasContext('snapshot-canvas')
        // 注意：实际需要使用 uni.canvasToTempFilePath 获取视频截图
        // 这里简化处理，使用模拟路径
        const filePath = `snapshot_${Date.now()}.jpg`

        await saveSnapshot(deviceId.value, filePath)
        uni.showToast({ title: '截图已保存', icon: 'success' })
    } catch (e) {
        uni.showToast({ title: '截图失败', icon: 'none' })
    } finally {
        uni.hideLoading()
    }
}

async function onRecordStart() {
    if (!deviceId.value) return

    try {
        const record = await startRecord(deviceId.value)
        recordingId.value = record.id
        isRecording.value = true
        uni.showToast({ title: '开始录像', icon: 'success' })
    } catch (e) {
        uni.showToast({ title: '录像启动失败', icon: 'none' })
    }
}

async function onRecordStop() {
    if (!recordingId.value) return

    try {
        await stopRecordApi(recordingId.value)
        isRecording.value = false
        recordingId.value = null
        uni.showToast({ title: '录像已保存', icon: 'success' })
    } catch (e) {
        uni.showToast({ title: '停止录像失败', icon: 'none' })
    }
}

function toggleAudio() {
    isMuted.value = !isMuted.value
}

function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value
    playerRef.value?.toggleFullscreen()
}

function onQualityChange(quality: string) {
    currentQuality.value = quality
    // TODO: 根据画质切换视频流
    uni.showToast({ title: `已切换至${quality === 'main' ? '主码流' : '子码流'}`, icon: 'none' })
}

function showMenu() {
    uni.showActionSheet({
        itemList: ['切换画质', '设备信息', '分享链接', '全屏播放'],
        success: (res) => {
            switch (res.tapIndex) {
                case 0:
                    onQualityChange(currentQuality.value === 'main' ? 'sub' : 'main')
                    break
                case 1:
                    showDeviceInfo()
                    break
                case 2:
                    shareStream()
                    break
                case 3:
                    toggleFullscreen()
                    break
            }
        }
    })
}

function showDeviceInfo() {
    if (!device.value) return

    uni.showModal({
        title: '设备信息',
        content: `名称: ${device.value.deviceName}\nIP: ${device.value.ipAddress}\n端口: ${
            device.value.port
        }\n厂商: ${device.value.manufacturer || '-'}`
    })
}

function shareStream() {
    if (!device.value) return

    uni.setClipboardData({
        data: streamUrl.value,
        success: () => {
            uni.showToast({ title: '链接已复制', icon: 'success' })
        }
    })
}
</script>

<style lang="scss">
.player-page {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
}
</style>
