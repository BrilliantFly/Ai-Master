<template>
    <view class="discover-page">
        <view class="discover-header">
            <text class="title">发现设备</text>
            <text class="subtitle">在局域网内搜索可用的摄像头设备</text>
        </view>

        <!-- 扫描进度 -->
        <view class="scan-status" v-if="isScanning">
            <view class="scan-animation">
                <view class="radar-wave" v-for="i in 3" :key="i"></view>
                <view class="radar-center">📡</view>
            </view>
            <text class="scan-text">正在扫描...</text>
            <text class="scan-hint">请确保设备与手机在同一局域网</text>
        </view>

        <!-- 发现结果 -->
        <view class="discover-result" v-if="!isScanning && discoveredDevices.length > 0">
            <view class="result-header">
                <text class="result-count">发现 {{ discoveredDevices.length }} 台设备</text>
                <view class="rescan-btn" @tap="startDiscover">
                    <text>重新扫描</text>
                </view>
            </view>

            <view class="device-list">
                <view
                    class="device-item"
                    v-for="(device, index) in discoveredDevices"
                    :key="index"
                    @tap="selectDevice(device)"
                >
                    <view class="device-icon">{{ getBrandIcon(device.brand) }}</view>
                    <view class="device-info">
                        <text class="device-ip">{{ device.ip }}</text>
                        <text class="device-brand">{{ device.brand || '未知设备' }}</text>
                    </view>
                    <view class="device-status">
                        <text class="status-badge" :class="{ added: device.isAdded }">
                            {{ device.isAdded ? '已添加' : '可添加' }}
                        </text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 空状态 -->
        <view
            class="empty-state"
            v-if="!isScanning && discoveredDevices.length === 0 && hasSearched"
        >
            <text class="empty-icon">📷</text>
            <text class="empty-text">未发现可用的摄像头设备</text>
            <button class="rescan-btn" @tap="startDiscover">重新扫描</button>
        </view>

        <!-- 手动添加 -->
        <view class="manual-add">
            <text class="manual-title">或</text>
            <button class="manual-btn" @tap="goToManualAdd">手动添加设备</button>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onMounted } from 'vue'

interface LanDevice {
    ip: string
    mac?: string
    port?: number
    brand?: string
    deviceType?: string
    isAdded: boolean
    online?: boolean
}

const isScanning = ref(false)
const hasSearched = ref(false)
const discoveredDevices = ref<LanDevice[]>([])

onMounted(() => {
    startDiscover()
})

function startDiscover() {
    isScanning.value = true
    hasSearched.value = true
    discoveredDevices.value = []

    // 模拟设备发现过程
    setTimeout(() => {
        // TODO: 实现真实的设备发现逻辑
        discoveredDevices.value = [
            { ip: '192.168.1.100', port: 8000, brand: 'Hikvision', isAdded: false, online: true },
            { ip: '192.168.1.101', port: 37777, brand: 'Dahua', isAdded: true, online: true }
        ]
        isScanning.value = false
    }, 3000)
}

function selectDevice(device: LanDevice) {
    if (device.isAdded) {
        uni.showToast({ title: '设备已添加', icon: 'none' })
        return
    }

    uni.navigateTo({
        url: `/pages/camera/add?ip=${device.ip}&port=${device.port}&brand=${device.brand}`
    })
}

function goToManualAdd() {
    uni.navigateTo({ url: '/pages/camera/add' })
}

function getBrandIcon(brand?: string): string {
    const iconMap: Record<string, string> = {
        Hikvision: '📹',
        Dahua: '📷',
        UniView: '🎥',
        EZVIZ: '🏠'
    }
    return iconMap[brand || ''] || '📹'
}
</script>

<style scoped lang="scss">
.discover-page {
    min-height: 100vh;
    background: var(--color-bg);
    padding: 30rpx;
}

.discover-header {
    text-align: center;
    padding: 60rpx 0;

    .title {
        display: block;
        font-size: 36rpx;
        font-weight: 600;
        color: var(--color-text);
        margin-bottom: 12rpx;
    }

    .subtitle {
        display: block;
        font-size: 26rpx;
        color: var(--color-text-tertiary);
    }
}

.scan-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80rpx 0;

    .scan-animation {
        position: relative;
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 40rpx;

        .radar-wave {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 2rpx solid var(--color-primary);
            border-radius: 50%;
            animation: radar 2s infinite;

            &:nth-child(1) {
                animation-delay: 0s;
            }
            &:nth-child(2) {
                animation-delay: 0.4s;
            }
            &:nth-child(3) {
                animation-delay: 0.8s;
            }
        }

        .radar-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 60rpx;
        }
    }

    .scan-text {
        font-size: 32rpx;
        color: var(--color-text);
        margin-bottom: 12rpx;
    }

    .scan-hint {
        font-size: 24rpx;
        color: var(--color-text-tertiary);
    }
}

@keyframes radar {
    0% {
        transform: scale(0.5);
        opacity: 1;
    }
    100% {
        transform: scale(1.5);
        opacity: 0;
    }
}

.discover-result {
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: 30rpx;

    .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24rpx;

        .result-count {
            font-size: 28rpx;
            color: var(--color-text);
        }

        .rescan-btn {
            font-size: 26rpx;
            color: var(--color-primary);
        }
    }

    .device-list {
        .device-item {
            display: flex;
            align-items: center;
            padding: 24rpx 0;
            border-bottom: 1rpx solid var(--color-border-light);

            &:last-child {
                border-bottom: none;
            }

            .device-icon {
                width: 80rpx;
                height: 80rpx;
                background: var(--color-surface-soft);
                border-radius: 12rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36rpx;
                margin-right: 20rpx;
            }

            .device-info {
                flex: 1;

                .device-ip {
                    display: block;
                    font-size: 28rpx;
                    color: var(--color-text);
                    margin-bottom: 6rpx;
                }

                .device-brand {
                    display: block;
                    font-size: 24rpx;
                    color: var(--color-text-tertiary);
                }
            }

            .device-status {
                .status-badge {
                    padding: 8rpx 20rpx;
                    border-radius: 20rpx;
                    font-size: 22rpx;
                    background: var(--color-primary-mist);
                    color: var(--color-primary);

                    &.added {
                        background: var(--color-surface-soft);
                        color: var(--color-text-tertiary);
                    }
                }
            }
        }
    }
}

.empty-state {
    text-align: center;
    padding: 80rpx 0;

    .empty-icon {
        display: block;
        font-size: 100rpx;
        margin-bottom: 30rpx;
    }

    .empty-text {
        display: block;
        font-size: 28rpx;
        color: var(--color-text-tertiary);
        margin-bottom: 40rpx;
    }

    .rescan-btn {
        background: var(--color-primary);
        color: #fff;
        border-radius: 40rpx;
        padding: 20rpx 60rpx;
    }
}

.manual-add {
    text-align: center;
    padding: 60rpx 0;

    .manual-title {
        display: block;
        font-size: 26rpx;
        color: var(--color-text-tertiary);
        margin-bottom: 24rpx;
    }

    .manual-btn {
        background: transparent;
        border: 2rpx solid var(--color-primary);
        color: var(--color-primary);
        border-radius: 40rpx;
        padding: 20rpx 60rpx;
    }
}
</style>
