<template>
    <view class="wifi-config-status-container">
        <!-- 状态指示器 -->
        <view class="status-indicator">
            <view class="status-circle" :class="statusClass">
                <view
                    class="pulse-ring"
                    v-if="status === 'waiting' || status === 'broadcasting'"
                ></view>
                <text class="status-icon">{{ statusIcon }}</text>
            </view>
        </view>

        <!-- 状态信息 -->
        <view class="status-info">
            <text class="status-title">{{ statusTitle }}</text>
            <text class="status-message">{{ statusMessage }}</text>
        </view>

        <!-- 进度条 -->
        <view class="progress-container" v-if="showProgress">
            <view class="progress-track">
                <view class="progress-fill" :style="{ width: progress + '%' }"></view>
            </view>
            <view class="progress-steps">
                <view
                    class="step"
                    v-for="(step, index) in steps"
                    :key="index"
                    :class="{ active: currentStep >= index, completed: currentStep > index }"
                >
                    <view class="step-dot">
                        <text v-if="currentStep > index">✓</text>
                    </view>
                    <text class="step-label">{{ step.label }}</text>
                </view>
            </view>
        </view>

        <!-- 发现的设备信息 -->
        <view class="discovered-device" v-if="discoveredDevice">
            <view class="device-card">
                <view class="device-header">
                    <text class="device-title">发现设备</text>
                    <text class="device-badge online">在线</text>
                </view>
                <view class="device-info">
                    <view class="info-row">
                        <text class="info-label">IP地址</text>
                        <text class="info-value">{{ discoveredDevice.ip }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">MAC地址</text>
                        <text class="info-value">{{ discoveredDevice.mac }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">端口</text>
                        <text class="info-value">{{ discoveredDevice.port }}</text>
                    </view>
                    <view class="info-row" v-if="discoveredDevice.manufacturer">
                        <text class="info-label">厂商</text>
                        <text class="info-value">{{ discoveredDevice.manufacturer }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 注意事项 -->
        <view class="tips-section" v-if="status === 'waiting'">
            <view class="tips-header">
                <text class="tips-title">⚠️ 配网提示</text>
            </view>
            <view class="tips-list">
                <text class="tip-item">1. 请确保摄像头已进入配网模式</text>
                <text class="tip-item">2. 摄像头与手机需连接同一WiFi</text>
                <text class="tip-item">3. 若配网失败，请重试或选择手动添加</text>
            </view>
        </view>

        <!-- 操作按钮 -->
        <view class="action-buttons">
            <button class="btn btn-secondary" @tap="onCancel" v-if="canCancel">取消</button>
            <button class="btn btn-primary" @tap="onManualAdd" v-if="showManualAdd">
                手动添加设备
            </button>
        </view>
    </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConfigStatus, DiscoveredDevice } from '@/utils/camera/wifiConfig'

interface Props {
    status: ConfigStatus['step']
    message: string
    progress: number
    discoveredDevice?: DiscoveredDevice | null
}

const props = withDefaults(defineProps<Props>(), {
    status: 'init',
    message: '',
    progress: 0,
    discoveredDevice: null
})

const emit = defineEmits(['cancel', 'manualAdd'])

const steps = [{ label: '准备' }, { label: '发送配置' }, { label: '等待连接' }, { label: '完成' }]

const currentStep = computed(() => {
    switch (props.status) {
        case 'init':
            return 0
        case 'broadcasting':
            return 1
        case 'waiting':
            return 2
        case 'success':
            return 3
        case 'failed':
            return -1
        default:
            return 0
    }
})

const statusClass = computed(() => {
    switch (props.status) {
        case 'init':
            return 'init'
        case 'broadcasting':
            return 'broadcasting'
        case 'waiting':
            return 'waiting'
        case 'success':
            return 'success'
        case 'failed':
            return 'failed'
        default:
            return 'init'
    }
})

const statusIcon = computed(() => {
    switch (props.status) {
        case 'init':
            return '📡'
        case 'broadcasting':
            return '📶'
        case 'waiting':
            return '⏳'
        case 'success':
            return '✅'
        case 'failed':
            return '❌'
        default:
            return '📡'
    }
})

const statusTitle = computed(() => {
    switch (props.status) {
        case 'init':
            return '准备配网'
        case 'broadcasting':
            return '发送配置中'
        case 'waiting':
            return '等待设备连接'
        case 'success':
            return '配网成功'
        case 'failed':
            return '配网失败'
        default:
            return '准备配网'
    }
})

const statusMessage = computed(() => props.message || '')

const showProgress = computed(() => {
    return props.status !== 'init' && props.status !== 'failed'
})

const canCancel = computed(() => {
    return props.status === 'broadcasting' || props.status === 'waiting'
})

const showManualAdd = computed(() => {
    return props.status === 'failed'
})

function onCancel() {
    emit('cancel')
}

function onManualAdd() {
    emit('manualAdd')
}
</script>

<style scoped lang="scss">
.wifi-config-status-container {
    min-height: 100vh;
    background: var(--color-bg-app);
    padding: 60rpx 30rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.status-indicator {
    margin-bottom: 60rpx;

    .status-circle {
        width: 160rpx;
        height: 160rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        transition: all 0.3s ease;

        &.init {
            background: var(--color-bg-app);
            border: 4rpx solid var(--color-border-light);

            .status-icon {
                font-size: 60rpx;
            }
        }

        &.broadcasting {
            background: var(--color-primary-mist);
            border: 4rpx solid var(--color-primary);

            .status-icon {
                font-size: 60rpx;
                animation: pulse 1s infinite;
            }
        }

        &.waiting {
            background: var(--color-warning-soft);
            border: 4rpx solid var(--color-warning);

            .status-icon {
                font-size: 60rpx;
            }
        }

        &.success {
            background: var(--color-success-soft);
            border: 4rpx solid var(--color-success);

            .status-icon {
                font-size: 60rpx;
            }
        }

        &.failed {
            background: var(--color-danger-soft);
            border: 4rpx solid var(--color-danger);

            .status-icon {
                font-size: 60rpx;
            }
        }

        .pulse-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 4rpx solid var(--color-primary);
            animation: pulse-ring 1.5s infinite;
        }
    }
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

@keyframes pulse-ring {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    100% {
        transform: scale(1.5);
        opacity: 0;
    }
}

.status-info {
    text-align: center;
    margin-bottom: 60rpx;

    .status-title {
        display: block;
        font-size: 36rpx;
        font-weight: 600;
        color: var(--color-text);
        margin-bottom: 16rpx;
    }

    .status-message {
        display: block;
        font-size: 28rpx;
        color: var(--color-text-secondary);
    }
}

.progress-container {
    width: 100%;
    background: var(--color-surface);
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;

    .progress-track {
        height: 8rpx;
        background: var(--color-border-light);
        border-radius: 4rpx;
        overflow: hidden;
        margin-bottom: 40rpx;

        .progress-fill {
            height: 100%;
            background: var(--color-primary);
            border-radius: 4rpx;
            transition: width 0.3s ease;
        }
    }

    .progress-steps {
        display: flex;
        justify-content: space-between;

        .step {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            position: relative;

            &:not(:last-child)::after {
                content: '';
                position: absolute;
                top: 16rpx;
                left: calc(50% + 20rpx);
                width: calc(100% - 40rpx);
                height: 2rpx;
                background: var(--color-border-light);
            }

            &.active:not(.completed)::after {
                background: var(--color-primary);
            }

            &.completed::after {
                background: var(--color-success);
            }

            .step-dot {
                width: 32rpx;
                height: 32rpx;
                border-radius: 50%;
                background: var(--color-border-light);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 12rpx;
                z-index: 1;

                text {
                    font-size: 20rpx;
                    color: var(--color-bg);
                }
            }

            &.active .step-dot {
                background: var(--color-primary);
            }

            &.completed .step-dot {
                background: var(--color-success);
            }

            .step-label {
                font-size: 24rpx;
                color: var(--color-text-tertiary);
            }

            &.active .step-label {
                color: var(--color-primary);
                font-weight: 500;
            }

            &.completed .step-label {
                color: var(--color-success);
            }
        }
    }
}

.discovered-device {
    width: 100%;

    .device-card {
        background: var(--color-surface);
        border-radius: 16rpx;
        padding: 30rpx;

        .device-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24rpx;

            .device-title {
                font-size: 32rpx;
                font-weight: 500;
                color: var(--color-text);
            }

            .device-badge {
                padding: 6rpx 16rpx;
                border-radius: 20rpx;
                font-size: 22rpx;

                &.online {
                    background: var(--color-success-soft);
                    color: var(--color-success);
                }
            }
        }

        .device-info {
            .info-row {
                display: flex;
                justify-content: space-between;
                padding: 16rpx 0;
                border-bottom: 1rpx solid var(--color-border-light);

                &:last-child {
                    border-bottom: none;
                }

                .info-label {
                    font-size: 26rpx;
                    color: var(--color-text-tertiary);
                }

                .info-value {
                    font-size: 26rpx;
                    color: var(--color-text);
                }
            }
        }
    }
}

.tips-section {
    width: 100%;
    background: var(--color-warning-soft);
    border-radius: 16rpx;
    padding: 30rpx;
    margin-top: 30rpx;

    .tips-header {
        margin-bottom: 20rpx;

        .tips-title {
            font-size: 28rpx;
            font-weight: 500;
            color: var(--color-warning);
        }
    }

    .tips-list {
        .tip-item {
            display: block;
            font-size: 24rpx;
            color: var(--color-text-secondary);
            line-height: 1.8;
        }
    }
}

.action-buttons {
    width: 100%;
    display: flex;
    gap: 24rpx;
    margin-top: 60rpx;

    .btn {
        flex: 1;
        height: 88rpx;
        border-radius: 44rpx;
        font-size: 30rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;

        &.btn-secondary {
            background: var(--color-surface);
            color: var(--color-text-secondary);
            border: 2rpx solid var(--color-border-light);
        }

        &.btn-primary {
            background: var(--color-primary);
            color: #fff;
        }
    }
}
</style>
