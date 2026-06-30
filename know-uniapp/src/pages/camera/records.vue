<template>
    <view class="records-page">
        <view class="records-list" v-if="records.length > 0">
            <view
                class="record-item"
                v-for="item in records"
                :key="item.id"
                @tap="playRecord(item)"
            >
                <view class="record-icon">🎬</view>
                <view class="record-info">
                    <text class="record-name">{{ formatRecordName(item) }}</text>
                    <text class="record-time">{{ formatTime(item.startTime) }}</text>
                    <text class="record-duration">{{ formatDuration(item.duration) }}</text>
                </view>
                <view class="record-actions">
                    <view class="action-btn play" @tap.stop="playRecord(item)">▶️</view>
                    <view class="action-btn download" @tap.stop="downloadRecord(item)">📥</view>
                    <view class="action-btn delete" @tap.stop="deleteRecord(item)">🗑</view>
                </view>
            </view>
        </view>

        <view class="empty-state" v-else-if="!loading">
            <text class="empty-icon">🎬</text>
            <text class="empty-text">暂无录像记录</text>
        </view>

        <page-status :status="loading ? 'loading' : 'normal'" />
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
    getRecordPage,
    deleteRecord as apiDeleteRecord,
    type CameraRecord,
    RecordType
} from '@/api/camera'

const records = ref<CameraRecord[]>([])
const loading = ref(false)

onMounted(async () => {
    await loadRecords()
})

async function loadRecords() {
    loading.value = true
    try {
        const result = (await getRecordPage({ pageNum: 1, pageSize: 50 })) as any
        records.value = result.records || []
    } catch (e) {
        console.error('加载录像失败', e)
    } finally {
        loading.value = false
    }
}

function formatRecordName(item: CameraRecord): string {
    const typeMap: Record<number, string> = {
        [RecordType.Manual]: '手动录制',
        [RecordType.Timed]: '定时���制',
        [RecordType.Motion]: '移动侦测'
    }
    return typeMap[item.recordType || 1] || '录像'
}

function formatTime(timestamp?: number): string {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleString()
}

function formatDuration(seconds?: number): string {
    if (!seconds) return '0秒'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}小时${m}分`
    if (m > 0) return `${m}分${s}秒`
    return `${s}秒`
}

function playRecord(item: CameraRecord) {
    if (!item.filePath) {
        uni.showToast({ title: '文件路径不存在', icon: 'none' })
        return
    }
    uni.navigateTo({
        url: `/pages/camera/player?id=${item.deviceId}&record=${item.id}`
    })
}

async function downloadRecord(item: CameraRecord) {
    if (!item.filePath) return
    uni.showToast({ title: '开始下载...', icon: 'loading' })
    // TODO: 实现下载逻辑
}

async function deleteRecord(item: CameraRecord) {
    if (!item.id) return

    uni.showModal({
        title: '确认删除',
        content: '确定要删除这条录像吗？',
        success: async (res) => {
            if (res.confirm) {
                try {
                    await apiDeleteRecord(item.id!)
                    records.value = records.value.filter((r) => r.id !== item.id)
                    uni.showToast({ title: '删除成功', icon: 'success' })
                } catch (e) {
                    uni.showToast({ title: '删除失败', icon: 'none' })
                }
            }
        }
    })
}
</script>

<style scoped lang="scss">
.records-page {
    min-height: 100vh;
    background: var(--color-bg);
    padding: 24rpx;
}

.records-list {
    .record-item {
        display: flex;
        align-items: center;
        background: var(--color-surface);
        border-radius: var(--radius-md);
        padding: 24rpx;
        margin-bottom: 24rpx;

        .record-icon {
            width: 80rpx;
            height: 80rpx;
            background: var(--color-primary-mist);
            border-radius: 12rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36rpx;
            margin-right: 20rpx;
        }

        .record-info {
            flex: 1;

            .record-name {
                display: block;
                font-size: 28rpx;
                color: var(--color-text);
                margin-bottom: 8rpx;
            }

            .record-time {
                display: block;
                font-size: 24rpx;
                color: var(--color-text-tertiary);
                margin-bottom: 6rpx;
            }

            .record-duration {
                display: block;
                font-size: 24rpx;
                color: var(--color-primary);
            }
        }

        .record-actions {
            display: flex;
            gap: 12rpx;

            .action-btn {
                width: 56rpx;
                height: 56rpx;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24rpx;

                &.play {
                    background: var(--color-primary-mist);
                }
                &.download {
                    background: var(--color-success-soft);
                }
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
