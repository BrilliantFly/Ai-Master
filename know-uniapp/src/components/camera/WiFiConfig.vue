<template>
    <view class="wifi-config-container">
        <view class="wifi-config-header">
            <text class="title">WiFi配网</text>
            <text class="subtitle">将摄像头连接到您的WiFi网络</text>
        </view>

        <!-- 当前连接的WiFi -->
        <view class="current-wifi-card" v-if="currentWifi">
            <view class="wifi-icon">
                <text class="iconfont">📶</text>
            </view>
            <view class="wifi-info">
                <text class="wifi-name">{{ currentWifi.SSID || '未连接' }}</text>
                <text class="wifi-signal" v-if="currentWifi.signalStrength">
                    信号强度: {{ getSignalText(currentWifi.signalStrength) }}
                </text>
            </view>
            <view class="wifi-status">
                <text class="status-tag" :class="{ connected: !!currentWifi.SSID }">
                    {{ currentWifi.SSID ? '已连接' : '未连接' }}
                </text>
            </view>
        </view>

        <!-- WiFi列表 -->
        <view class="wifi-list-section">
            <view class="section-header">
                <text class="section-title">可用WiFi</text>
                <view class="refresh-btn" @tap="refreshWifiList">
                    <text class="iconfont">🔄</text>
                    <text>刷新</text>
                </view>
            </view>

            <view class="wifi-list" v-if="wifiList.length > 0">
                <view
                    class="wifi-item"
                    v-for="(wifi, index) in wifiList"
                    :key="index"
                    :class="{ selected: selectedSSID === wifi.SSID, secured: wifi.secure }"
                    @tap="selectWifi(wifi)"
                >
                    <view class="wifi-item-left">
                        <text class="wifi-item-icon">{{ wifi.secure ? '🔒' : '📶' }}</text>
                        <view class="wifi-item-info">
                            <text class="wifi-item-name">{{ wifi.SSID || '隐藏网络' }}</text>
                            <text class="wifi-item-detail">
                                {{ wifi.secure ? '已加密' : '开放网络' }} |
                                {{ getSignalText(wifi.signalStrength) }}
                            </text>
                        </view>
                    </view>
                    <view class="wifi-item-right">
                        <view class="signal-bars">
                            <view
                                class="signal-bar"
                                v-for="i in 4"
                                :key="i"
                                :class="{ active: getSignalLevel(wifi.signalStrength) >= i }"
                            ></view>
                        </view>
                        <text class="select-indicator" v-if="selectedSSID === wifi.SSID">✓</text>
                    </view>
                </view>
            </view>

            <view class="wifi-list-empty" v-else-if="!isScanning">
                <text>暂未发现可用WiFi</text>
                <text class="hint">请确保位置权限已开启</text>
                <button class="scan-btn" @tap="startWifiScan">开始扫描</button>
            </view>

            <view class="wifi-list-loading" v-else>
                <text class="loading-text">正在扫描...</text>
                <view class="loading-dots">
                    <text class="dot"></text>
                    <text class="dot"></text>
                    <text class="dot"></text>
                </view>
            </view>
        </view>

        <!-- WiFi密码输入 -->
        <view class="password-section" v-if="selectedSSID && needsPassword">
            <view class="section-title">输入WiFi密码</view>
            <view class="password-input-wrapper">
                <input
                    type="password"
                    v-model="wifiPassword"
                    placeholder="请输入WiFi密码"
                    class="password-input"
                    :password="!showPassword"
                />
                <view class="toggle-visibility" @tap="showPassword = !showPassword">
                    <text>{{ showPassword ? '👁' : '👁‍🗨' }}</text>
                </view>
            </view>
        </view>

        <!-- 开始配网按钮 -->
        <view class="config-action">
            <button class="config-btn" :disabled="!canStartConfig" @tap="startConfig">
                <text v-if="!isConfiguring">开始配网</text>
                <text v-else>配网中...</text>
            </button>
        </view>

        <!-- 配网进度 -->
        <view class="config-progress" v-if="isConfiguring">
            <view class="progress-header">
                <text class="progress-title">{{ configStatus.message }}</text>
                <text class="progress-percent">{{ configStatus.progress }}%</text>
            </view>
            <view class="progress-bar">
                <view class="progress-fill" :style="{ width: configStatus.progress + '%' }"></view>
            </view>
        </view>

        <!-- 配网结果 -->
        <view class="config-result" v-if="configResult">
            <view
                class="result-card"
                :class="{ success: configResult.success, failed: !configResult.success }"
            >
                <text class="result-icon">{{ configResult.success ? '✅' : '❌' }}</text>
                <text class="result-message">{{ configResult.message }}</text>
                <button class="result-action" v-if="configResult.success" @tap="goToDeviceList">
                    查看设备列表
                </button>
                <button class="result-action retry" v-else @tap="retryConfig">重新配网</button>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { scanWifiList, getConnectedWifi } from '@/api/wifi'
import {
    WiFiConfigManager,
    type WifiConfigData,
    type ConfigStatus
} from '@/utils/camera/wifiConfig'
import { WifiUtils } from '@/utils/wifi'

interface WifiInfo {
    SSID: string
    BSSID: string
    secure: boolean
    signalStrength: number
}

const wifiList = ref<WifiInfo[]>([])
const currentWifi = ref<WifiInfo | null>(null)
const selectedSSID = ref<string>('')
const wifiPassword = ref('')
const showPassword = ref(false)
const isScanning = ref(false)
const isConfiguring = ref(false)
const configStatus = ref<ConfigStatus>({
    step: 'init',
    message: '',
    progress: 0
})
const configResult = ref<{ success: boolean; message: string } | null>(null)

const wifiConfigManager = new WiFiConfigManager()

const needsPassword = computed(() => {
    const wifi = wifiList.value.find((w) => w.SSID === selectedSSID.value)
    return wifi?.secure === true
})

const canStartConfig = computed(() => {
    if (!selectedSSID.value) return false
    const wifi = wifiList.value.find((w) => w.SSID === selectedSSID.value)
    if (wifi?.secure && !wifiPassword.value) return false
    return true
})

onMounted(async () => {
    await loadCurrentWifi()
})

onLoad(() => {
    // 设置状态回调
    wifiConfigManager.setStatusCallback((status) => {
        configStatus.value = status
    })

    wifiConfigManager.setDiscoveredCallback((device) => {
        console.log('发现设备:', device)
    })
})

async function loadCurrentWifi() {
    try {
        currentWifi.value = (await getConnectedWifi()) as WifiInfo
    } catch (e) {
        console.error('获取当前WiFi失败', e)
    }
}

async function refreshWifiList() {
    await startWifiScan()
}

async function startWifiScan() {
    if (isScanning.value) return

    isScanning.value = true
    wifiList.value = []

    try {
        const list = (await scanWifiList()) as WifiInfo[]
        wifiList.value = list.sort((a, b) => b.signalStrength - a.signalStrength)
    } catch (e: any) {
        uni.showToast({ title: e.message || '扫描失败', icon: 'none' })
    } finally {
        isScanning.value = false
    }
}

function selectWifi(wifi: WifiInfo) {
    selectedSSID.value = wifi.SSID

    if (!wifi.secure) {
        wifiPassword.value = ''
    }
}

function startConfig() {
    if (!canStartConfig.value) return

    isConfiguring.value = true
    configResult.value = null

    const wifiData: WifiConfigData = {
        ssid: selectedSSID.value,
        password: wifiPassword.value
    }

    wifiConfigManager
        .startConfig(wifiData)
        .then((success) => {
            configResult.value = {
                success: true,
                message: '配网成功！设备已连接到您的WiFi'
            }
        })
        .catch((err) => {
            configResult.value = {
                success: false,
                message: err.message || '配网失败，请重试'
            }
        })
        .finally(() => {
            isConfiguring.value = false
        })
}

function retryConfig() {
    configResult.value = null
    wifiPassword.value = ''
    startConfig()
}

function goToDeviceList() {
    uni.navigateTo({
        url: '/pages/camera/list'
    })
}

function getSignalLevel(signal: number): number {
    return WifiUtils.getSignalLevel(signal)
}

function getSignalText(signal: number): string {
    return WifiUtils.getSignalText(signal)
}
</script>

<style scoped lang="scss">
.wifi-config-container {
    min-height: 100vh;
    background: var(--color-bg-app);
    padding: 30rpx;
}

.wifi-config-header {
    text-align: center;
    padding: 40rpx 0;

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

.current-wifi-card {
    display: flex;
    align-items: center;
    background: var(--color-surface);
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    box-shadow: var(--shadow-sm);

    .wifi-icon {
        width: 80rpx;
        height: 80rpx;
        background: var(--color-success-soft);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;

        .iconfont {
            font-size: 36rpx;
        }
    }

    .wifi-info {
        flex: 1;

        .wifi-name {
            display: block;
            font-size: 32rpx;
            font-weight: 500;
            color: var(--color-text);
        }

        .wifi-signal {
            display: block;
            font-size: 24rpx;
            color: var(--color-text-tertiary);
            margin-top: 8rpx;
        }
    }

    .wifi-status {
        .status-tag {
            padding: 8rpx 20rpx;
            border-radius: 20rpx;
            font-size: 24rpx;
            background: var(--color-bg-app);
            color: var(--color-text-tertiary);

            &.connected {
                background: var(--color-success-soft);
                color: var(--color-success);
            }
        }
    }
}

.wifi-list-section {
    background: var(--color-surface);
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24rpx;

        .section-title {
            font-size: 30rpx;
            font-weight: 500;
            color: var(--color-text);
        }

        .refresh-btn {
            display: flex;
            align-items: center;
            color: var(--color-primary);
            font-size: 26rpx;

            .iconfont {
                margin-right: 8rpx;
            }
        }
    }
}

.wifi-list {
    .wifi-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24rpx;
        border-radius: 12rpx;
        margin-bottom: 16rpx;
        background: var(--color-surface-soft);
        transition: all 0.2s;

        &.selected {
            background: var(--color-primary-mist);
            border: 2rpx solid var(--color-primary);
        }

        &:active {
            opacity: 0.8;
        }

        .wifi-item-left {
            display: flex;
            align-items: center;

            .wifi-item-icon {
                font-size: 32rpx;
                margin-right: 16rpx;
            }

            .wifi-item-info {
                .wifi-item-name {
                    display: block;
                    font-size: 28rpx;
                    color: var(--color-text);
                    margin-bottom: 6rpx;
                }

                .wifi-item-detail {
                    display: block;
                    font-size: 22rpx;
                    color: var(--color-text-tertiary);
                }
            }
        }

        .wifi-item-right {
            display: flex;
            align-items: center;

            .signal-bars {
                display: flex;
                align-items: flex-end;
                height: 24rpx;
                margin-right: 16rpx;

                .signal-bar {
                    width: 6rpx;
                    margin-right: 4rpx;
                    background: var(--color-border-light);
                    border-radius: 2rpx;

                    &:nth-child(1) {
                        height: 8rpx;
                    }
                    &:nth-child(2) {
                        height: 14rpx;
                    }
                    &:nth-child(3) {
                        height: 20rpx;
                    }
                    &:nth-child(4) {
                        height: 26rpx;
                    }

                    &.active {
                        background: var(--color-primary);
                    }
                }
            }

            .select-indicator {
                color: var(--color-primary);
                font-size: 32rpx;
                font-weight: 600;
            }
        }
    }
}

.wifi-list-empty,
.wifi-list-loading {
    text-align: center;
    padding: 60rpx 0;
    color: var(--color-text-tertiary);
    font-size: 28rpx;

    .hint {
        display: block;
        font-size: 24rpx;
        color: var(--color-text-tertiary);
        margin-top: 12rpx;
    }

    .scan-btn {
        margin-top: 30rpx;
        background: var(--color-primary);
        color: #fff;
        border-radius: 40rpx;
        font-size: 28rpx;
        padding: 16rpx 60rpx;
    }

    .loading-dots {
        display: flex;
        justify-content: center;
        margin-top: 20rpx;

        .dot {
            width: 12rpx;
            height: 12rpx;
            background: var(--color-primary);
            border-radius: 50%;
            margin: 0 6rpx;
            animation: dot-bounce 1.4s infinite ease-in-out both;

            &:nth-child(1) {
                animation-delay: -0.32s;
            }
            &:nth-child(2) {
                animation-delay: -0.16s;
            }
        }
    }
}

@keyframes dot-bounce {
    0%,
    80%,
    100% {
        transform: scale(0);
    }
    40% {
        transform: scale(1);
    }
}

.password-section {
    background: var(--color-surface);
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;

    .section-title {
        font-size: 30rpx;
        font-weight: 500;
        color: var(--color-text);
        margin-bottom: 24rpx;
    }

    .password-input-wrapper {
        display: flex;
        align-items: center;
        background: var(--color-bg-app);
        border-radius: 12rpx;
        padding: 0 24rpx;

        .password-input {
            flex: 1;
            height: 88rpx;
            font-size: 28rpx;
        }

        .toggle-visibility {
            padding: 20rpx;
            font-size: 32rpx;
        }
    }
}

.config-action {
    padding: 30rpx 0;

    .config-btn {
        width: 100%;
        height: 88rpx;
        background: var(--color-primary);
        color: #fff;
        border-radius: 44rpx;
        font-size: 32rpx;
        font-weight: 500;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;

        &[disabled] {
            background: var(--color-text-tertiary);
        }
    }
}

.config-progress {
    background: var(--color-surface);
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;

    .progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20rpx;

        .progress-title {
            font-size: 28rpx;
            color: var(--color-text);
        }

        .progress-percent {
            font-size: 28rpx;
            color: var(--color-primary);
            font-weight: 500;
        }
    }

    .progress-bar {
        height: 12rpx;
        background: var(--color-border-light);
        border-radius: 6rpx;
        overflow: hidden;

        .progress-fill {
            height: 100%;
            background: var(--color-primary);
            border-radius: 6rpx;
            transition: width 0.3s ease;
        }
    }
}

.config-result {
    .result-card {
        background: var(--color-surface);
        border-radius: 16rpx;
        padding: 60rpx 30rpx;
        text-align: center;

        .result-icon {
            display: block;
            font-size: 80rpx;
            margin-bottom: 30rpx;
        }

        .result-message {
            display: block;
            font-size: 30rpx;
            color: var(--color-text);
            margin-bottom: 40rpx;
        }

        .result-action {
            background: var(--color-primary);
            color: #fff;
            border-radius: 40rpx;
            font-size: 28rpx;
            padding: 20rpx 60rpx;
            border: none;

            &.retry {
                background: var(--color-danger);
            }
        }
    }
}
</style>
