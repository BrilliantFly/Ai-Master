<template>
    <view class="player-controls-container">
        <!-- 顶部控制栏 -->
        <view class="top-bar">
            <view class="back-btn" @tap="onBack">
                <text>←</text>
            </view>
            <view class="title-area">
                <text class="title">{{ deviceName || '视频监控' }}</text>
                <text class="subtitle" :class="{ recording: isRecording }">
                    {{ isRecording ? '录制中' : '直播' }}
                </text>
            </view>
            <view class="more-btn" @tap="onMore">
                <text>⋮</text>
            </view>
        </view>

        <!-- 底部控制栏 -->
        <view class="bottom-bar">
            <!-- 左侧操作按钮 -->
            <view class="action-buttons">
                <view class="action-btn" @tap="onSnapshot" :class="{ disabled: !isPlaying }">
                    <text>📷</text>
                    <text class="btn-label">截图</text>
                </view>
                <view class="action-btn" @tap="onRecord" :class="{ active: isRecording }">
                    <text>{{ isRecording ? '⏹' : '⏺' }}</text>
                    <text class="btn-label">{{ isRecording ? '停止' : '录像' }}</text>
                </view>
                <view class="action-btn" @tap="onAudio">
                    <text>{{ isMuted ? '🔇' : '🔊' }}</text>
                    <text class="btn-label">声音</text>
                </view>
                <view class="action-btn" @tap="onPtz">
                    <text>🎯</text>
                    <text class="btn-label">云台</text>
                </view>
            </view>

            <!-- PTZ控制面板 -->
            <view class="ptz-panel" v-if="showPtzPanel">
                <view class="ptz-grid">
                    <view class="ptz-btn empty"></view>
                    <view class="ptz-btn up" @tap="ptzControl('up')">↑</view>
                    <view class="ptz-btn empty"></view>
                    <view class="ptz-btn left" @tap="ptzControl('left')">←</view>
                    <view class="ptz-btn center" @tap="ptzControl('center')">●</view>
                    <view class="ptz-btn right" @tap="ptzControl('right')">→</view>
                    <view class="ptz-btn empty"></view>
                    <view class="ptz-btn down" @tap="ptzControl('down')">↓</view>
                    <view class="ptz-btn empty"></view>
                </view>
                <view class="ptz-zoom">
                    <view class="zoom-btn" @tap="ptzControl('zoom_in')">+</view>
                    <text class="zoom-label">变倍</text>
                    <view class="zoom-btn" @tap="ptzControl('zoom_out')">−</view>
                </view>
            </view>

            <!-- 进度信息 -->
            <view class="progress-info" v-if="isRecording">
                <view class="record-indicator">
                    <view class="record-dot"></view>
                    <text>录制中 {{ formatDuration(recordDuration) }}</text>
                </view>
            </view>
        </view>

        <!-- 快捷操作菜单 -->
        <view class="quick-menu" v-if="showQuickMenu" @tap="closeQuickMenu">
            <view class="menu-content" @tap.stop>
                <view class="menu-item" @tap="onChangeQuality">
                    <text>🎬</text>
                    <text>切换画质</text>
                </view>
                <view class="menu-item" @tap="onDeviceInfo">
                    <text>ℹ️</text>
                    <text>设备信息</text>
                </view>
                <view class="menu-item" @tap="onShare">
                    <text>📤</text>
                    <text>分享</text>
                </view>
                <view class="menu-item danger" @tap="onFullscreen">
                    <text>⛶</text>
                    <text>{{ isFullscreen ? '退出全屏' : '全屏' }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
    deviceName?: string
    isPlaying?: boolean
    isFullscreen?: boolean
    isMuted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    deviceName: '',
    isPlaying: false,
    isFullscreen: false,
    isMuted: false
})

const emit = defineEmits([
    'back',
    'snapshot',
    'record',
    'recordStart',
    'recordStop',
    'audio',
    'ptz',
    'fullscreen',
    'menu',
    'qualityChange',
    'deviceInfo',
    'share'
])

const showPtzPanel = ref(false)
const showQuickMenu = ref(false)
const isRecording = ref(false)
const recordDuration = ref(0)

// 录制定时器
let recordTimer: any = null

function togglePtzPanel() {
    showPtzPanel.value = !showPtzPanel.value
}

function onBack() {
    emit('back')
}

function onSnapshot() {
    if (!props.isPlaying) return
    emit('snapshot')
}

function onRecord() {
    if (isRecording.value) {
        stopRecord()
    } else {
        startRecord()
    }
}

function startRecord() {
    isRecording.value = true
    recordDuration.value = 0
    recordTimer = setInterval(() => {
        recordDuration.value++
    }, 1000)
    emit('recordStart')
}

function stopRecord() {
    isRecording.value = false
    if (recordTimer) {
        clearInterval(recordTimer)
        recordTimer = null
    }
    emit('recordStop')
}

function onAudio() {
    emit('audio')
}

function onPtz() {
    showPtzPanel.value = !showPtzPanel.value
}

function ptzControl(direction: string) {
    emit('ptz', direction)
}

function onMore() {
    showQuickMenu.value = true
}

function closeQuickMenu() {
    showQuickMenu.value = false
}

function onChangeQuality() {
    closeQuickMenu()
    emit('qualityChange')
}

function onDeviceInfo() {
    closeQuickMenu()
    emit('deviceInfo')
}

function onShare() {
    closeQuickMenu()
    emit('share')
}

function onFullscreen() {
    closeQuickMenu()
    emit('fullscreen')
}

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
</script>

<style scoped lang="scss">
.player-controls-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.top-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 88rpx;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    padding-top: env(safe-area-inset-top);
    z-index: 100;

    .back-btn {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36rpx;
        color: #fff;
    }

    .title-area {
        flex: 1;
        text-align: center;

        .title {
            display: block;
            font-size: 30rpx;
            color: #fff;
            font-weight: 500;
        }

        .subtitle {
            display: block;
            font-size: 22rpx;
            color: var(--color-text-tertiary);

            &.recording {
                color: var(--color-danger);
            }
        }
    }

    .more-btn {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36rpx;
        color: #fff;
    }
}

.bottom-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
    padding-bottom: env(safe-area-inset-bottom);
    z-index: 100;

    .action-buttons {
        display: flex;
        justify-content: space-around;
        padding: 30rpx 20rpx 20rpx;

        .action-btn {
            display: flex;
            flex-direction: column;
            align-items: center;

            text:first-child {
                font-size: 40rpx;
                margin-bottom: 8rpx;
            }

            .btn-label {
                font-size: 22rpx;
                color: #fff;
            }

            &.active {
                text:first-child {
                    color: var(--color-danger);
                }
            }

            &.disabled {
                opacity: 0.5;
            }
        }
    }

    .ptz-panel {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20rpx;
        gap: 40rpx;

        .ptz-grid {
            display: grid;
            grid-template-columns: repeat(3, 70rpx);
            grid-template-rows: repeat(3, 70rpx);
            gap: 8rpx;

            .ptz-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 12rpx;
                font-size: 32rpx;
                color: #fff;

                &.empty {
                    background: transparent;
                }

                &.center {
                    background: rgba(255, 255, 255, 0.3);
                }

                &:active {
                    background: rgba(var(--color-primary-rgb), 0.6);
                }
            }
        }

        .ptz-zoom {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8rpx;

            .zoom-btn {
                width: 50rpx;
                height: 50rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                font-size: 28rpx;
                color: #fff;

                &:active {
                    background: rgba(var(--color-primary-rgb), 0.6);
                }
            }

            .zoom-label {
                font-size: 20rpx;
                color: var(--color-text-tertiary);
            }
        }
    }

    .progress-info {
        display: flex;
        justify-content: center;
        padding-bottom: 20rpx;

        .record-indicator {
            display: flex;
            align-items: center;
            background: rgba(0, 0, 0, 0.5);
            padding: 8rpx 20rpx;
            border-radius: 20rpx;

            .record-dot {
                width: 12rpx;
                height: 12rpx;
                background: var(--color-danger);
                border-radius: 50%;
                margin-right: 12rpx;
                animation: blink 1s infinite;
            }

            text {
                font-size: 24rpx;
                color: #fff;
            }
        }
    }
}

@keyframes blink {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.3;
    }
}

.quick-menu {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;

    .menu-content {
        background: var(--color-surface);
        border-radius: 16rpx;
        min-width: 400rpx;
        overflow: hidden;

        .menu-item {
            display: flex;
            align-items: center;
            padding: 30rpx 40rpx;
            border-bottom: 1rpx solid var(--color-border-light);

            &:last-child {
                border-bottom: none;
            }

            text:first-child {
                font-size: 32rpx;
                margin-right: 20rpx;
            }

            text:last-child {
                font-size: 28rpx;
                color: var(--color-text);
            }

            &.danger {
                text:last-child {
                    color: var(--color-danger);
                }
            }
        }
    }
}
</style>
