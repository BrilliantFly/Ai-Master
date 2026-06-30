<template>
    <view class="snapshots-page">
        <view class="snapshots-list" v-if="snapshots.length > 0">
            <view
                class="snapshot-item"
                v-for="(item, index) in snapshots"
                :key="item.id"
                @tap="previewSnapshot(item)"
            >
                <image
                    :src="item.thumbnail || item.cloudUrl"
                    mode="aspectFill"
                    class="snapshot-image"
                />
                <view class="snapshot-info">
                    <text class="snapshot-time">{{ formatTime(item.captureTime) }}</text>
                    <text class="snapshot-device">设备: {{ getDeviceName(item.deviceId) }}</text>
                </view>
                <view class="snapshot-actions">
                    <view class="action-btn" @tap.stop="shareSnapshot(item)">📤</view>
                    <view class="action-btn delete" @tap.stop="deleteSnapshot(item)">🗑</view>
                </view>
            </view>
        </view>

        <view class="empty-state" v-else-if="!loading">
            <text class="empty-icon">📷</text>
            <text class="empty-text">暂无截图记录</text>
        </view>

        <page-status :status="loading ? 'loading' : 'normal'" />
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
    getSnapshotPage,
    deleteSnapshot as apiDeleteSnapshot,
    type CameraSnapshot
} from '@/api/camera'

const snapshots = ref<CameraSnapshot[]>([])
const loading = ref(false)

onMounted(async () => {
    await loadSnapshots()
})

async function loadSnapshots() {
    loading.value = true
    try {
        const result = (await getSnapshotPage({ pageNum: 1, pageSize: 50 })) as any
        snapshots.value = result.records || []
    } catch (e) {
        console.error('加载截图失败', e)
    } finally {
        loading.value = false
    }
}

function formatTime(timestamp?: number): string {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleString()
}

function getDeviceName(deviceId?: number): string {
    return deviceId ? `设备${deviceId}` : '-'
}

function previewSnapshot(item: CameraSnapshot) {
    if (!item.filePath && !item.cloudUrl) return
    uni.previewImage({
        urls: [item.filePath || item.cloudUrl || '']
    })
}

async function deleteSnapshot(item: CameraSnapshot) {
    if (!item.id) return

    uni.showModal({
        title: '确认删除',
        content: '确定要删除这张截图吗？',
        success: async (res) => {
            if (res.confirm) {
                try {
                    await apiDeleteSnapshot(item.id!)
                    snapshots.value = snapshots.value.filter((s) => s.id !== item.id)
                    uni.showToast({ title: '删除成功', icon: 'success' })
                } catch (e) {
                    uni.showToast({ title: '删除失败', icon: 'none' })
                }
            }
        }
    })
}

function shareSnapshot(item: CameraSnapshot) {
    const url = item.cloudUrl || item.filePath
    if (url) {
        uni.share({
            provider: 'weixin',
            imageUrl: url
        })
    }
}
</script>

<style scoped lang="scss">
.snapshots-page {
    min-height: 100vh;
    background: var(--color-bg);
    padding: 24rpx;
}

.snapshots-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;

    .snapshot-item {
        background: var(--color-surface);
        border-radius: var(--radius-md);
        overflow: hidden;

        .snapshot-image {
            width: 100%;
            height: 240rpx;
        }

        .snapshot-info {
            padding: 16rpx;

            .snapshot-time {
                display: block;
                font-size: 24rpx;
                color: var(--color-text);
                margin-bottom: 6rpx;
            }

            .snapshot-device {
                display: block;
                font-size: 22rpx;
                color: var(--color-text-tertiary);
            }
        }

        .snapshot-actions {
            display: flex;
            justify-content: flex-end;
            padding: 0 16rpx 16rpx;
            gap: 16rpx;

            .action-btn {
                width: 56rpx;
                height: 56rpx;
                background: var(--color-surface-soft);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24rpx;

                &.delete {
                    background: var(--color-danger-soft);
                }
            }
        }
    }
}

.empty-state {
    padding: 120rpx 0;
    text-align: center;

    .empty-icon {
        display: block;
        font-size: 100rpx;
        margin-bottom: 30rpx;
    }

    .empty-text {
        font-size: 28rpx;
        color: #999;
    }
}
</style>
