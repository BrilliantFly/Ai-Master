<template>
    <view class="detail-page">
        <!-- 设备信息卡片 -->
        <view class="device-card">
            <view class="card-header">
                <view class="device-status" :class="{ online: device.status === 1 }">
                    {{ device.status === 1 ? '在线' : '离线' }}
                </view>
            </view>

            <view class="card-body">
                <view class="info-row">
                    <text class="label">设备名称</text>
                    <text class="value">{{ device.deviceName }}</text>
                </view>
                <view class="info-row">
                    <text class="label">设备编号</text>
                    <text class="value">{{ device.deviceCode }}</text>
                </view>
                <view class="info-row" v-if="device.ipAddress">
                    <text class="label">IP地址</text>
                    <text class="value">{{ device.ipAddress }}</text>
                </view>
                <view class="info-row" v-if="device.port">
                    <text class="label">端口</text>
                    <text class="value">{{ device.port }}</text>
                </view>
                <view class="info-row" v-if="device.manufacturer">
                    <text class="label">厂商</text>
                    <text class="value">{{ device.manufacturer }}</text>
                </view>
                <view class="info-row" v-if="device.deviceModel">
                    <text class="label">型号</text>
                    <text class="value">{{ device.deviceModel }}</text>
                </view>
                <view class="info-row" v-if="device.position">
                    <text class="label">安装位置</text>
                    <text class="value">{{ device.position }}</text>
                </view>
            </view>
        </view>

        <!-- 操作按钮 -->
        <view class="action-section">
            <view class="action-btn" @tap="goToPlayer">
                <text class="icon">▶️</text>
                <text class="text">观看直播</text>
            </view>
            <view class="action-btn" @tap="onSnapshot">
                <text class="icon">📷</text>
                <text class="text">截图</text>
            </view>
            <view class="action-btn" @tap="onRecord">
                <text class="icon">🎬</text>
                <text class="text">录像</text>
            </view>
            <view class="action-btn" @tap="goToEdit">
                <text class="icon">✏️</text>
                <text class="text">编辑</text>
            </view>
        </view>

        <!-- 删除按钮 -->
        <view class="danger-zone">
            <button class="delete-btn" @tap="onDelete">删除设备</button>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCameraDetail, deleteCamera, type CameraDevice } from '@/api/camera'

const device = ref<CameraDevice>({})
const deviceId = ref<number>(0)

onLoad((query: any) => {
    if (query.id) {
        deviceId.value = parseInt(query.id)
        loadDevice()
    }
})

async function loadDevice() {
    try {
        device.value = (await getCameraDetail(deviceId.value)) as CameraDevice
    } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
    }
}

function goToPlayer() {
    uni.navigateTo({
        url: `/pages/camera/player?id=${deviceId.value}`
    })
}

function onSnapshot() {
    uni.showToast({ title: '截图功能开发中', icon: 'none' })
}

function onRecord() {
    uni.showToast({ title: '录像功能开发中', icon: 'none' })
}

function goToEdit() {
    uni.showToast({ title: '编辑功能开发中', icon: 'none' })
}

function onDelete() {
    uni.showModal({
        title: '确认删除',
        content: '确定要删除此设备吗？删除后不可恢复。',
        success: async (res) => {
            if (res.confirm) {
                try {
                    await deleteCamera(deviceId.value)
                    uni.showToast({ title: '删除成功', icon: 'success' })
                    setTimeout(() => {
                        uni.navigateBack()
                    }, 1500)
                } catch (e) {
                    uni.showToast({ title: '删除失败', icon: 'none' })
                }
            }
        }
    })
}
</script>

<style scoped lang="scss">
.detail-page {
    min-height: 100vh;
    background: var(--color-bg);
    padding: 24rpx;
}

.device-card {
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: 30rpx;
    margin-bottom: 30rpx;

    .card-header {
        margin-bottom: 24rpx;

        .device-status {
            display: inline-block;
            padding: 8rpx 24rpx;
            border-radius: 20rpx;
            font-size: 24rpx;
            background: var(--color-surface-soft);
            color: var(--color-text-tertiary);

            &.online {
                background: var(--color-success-soft);
                color: var(--color-success);
            }
        }
    }

    .card-body {
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 20rpx 0;
            border-bottom: 1rpx solid var(--color-border-light);

            &:last-child {
                border-bottom: none;
            }

            .label {
                font-size: 28rpx;
                color: var(--color-text-tertiary);
            }

            .value {
                font-size: 28rpx;
                color: var(--color-text);
            }
        }
    }
}

.action-section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24rpx;
    margin-bottom: 30rpx;

    .action-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: var(--color-surface);
        border-radius: var(--radius-md);
        padding: 30rpx 0;

        .icon {
            font-size: 40rpx;
            margin-bottom: 12rpx;
        }

        .text {
            font-size: 24rpx;
            color: var(--color-text-secondary);
        }
    }
}

.danger-zone {
    padding-top: 60rpx;

    .delete-btn {
        width: 100%;
        height: 88rpx;
        background: var(--color-danger-soft);
        color: var(--color-danger);
        border-radius: 44rpx;
        font-size: 30rpx;
    }
}
</style>
