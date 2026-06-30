<template>
    <view class="playback-page">
        <!-- 视频播放器 -->
        <video
            ref="videoRef"
            class="video-player"
            :src="currentRecord?.filePath || ''"
            :poster="poster"
            :autoplay="false"
            controls
            :show-center-play-btn="true"
            :show-progress="true"
            object-fit="contain"
            @play="onPlay"
            @pause="onPause"
            @ended="onEnded"
            @timeupdate="onTimeUpdate"
            @fullscreenchange="onFullscreenChange"
        />

        <!-- 顶部控制栏 -->
        <view class="top-bar">
            <view class="back-btn" @tap="onBack">
                <text>←</text>
            </view>
            <view class="title-area">
                <text class="title">{{ deviceName }}</text>
                <text class="subtitle">{{ formatDate(selectedDate) }}</text>
            </view>
            <view class="date-btn" @tap="showDatePicker">
                <text>📅</text>
            </view>
        </view>

        <!-- 底部控制栏 -->
        <view class="bottom-bar">
            <!-- 时间轴 -->
            <view class="timeline-section">
                <view class="timeline-header">
                    <text class="timeline-date">{{ formatDate(selectedDate) }}</text>
                    <view class="timeline-nav">
                        <text class="nav-btn" @tap="prevDay">◀</text>
                        <text class="today-btn" @tap="goToToday">今天</text>
                        <text class="nav-btn" @tap="nextDay">▶</text>
                    </view>
                </view>

                <!-- 时间轴 -->
                <scroll-view class="timeline-scroll" scroll-x>
                    <view class="timeline-track">
                        <view
                            v-for="hour in 24"
                            :key="hour"
                            class="hour-marker"
                            :class="{ active: currentHour === hour - 1 }"
                            @tap="selectHour(hour - 1)"
                        >
                            <view class="hour-label"
                                >{{ String(hour - 1).padStart(2, '0') }}:00</view
                            >
                            <view class="hour-bar">
                                <!-- 录像片段 -->
                                <view
                                    v-for="(segment, idx) in getRecordSegmentsForHour(hour - 1)"
                                    :key="idx"
                                    class="record-segment"
                                    :style="getSegmentStyle(segment)"
                                    @tap="selectSegment(segment)"
                                />
                            </view>
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- 播放控制 -->
            <view class="playback-controls">
                <view class="control-btn" @tap="skipBackward">
                    <text>⏪</text>
                </view>
                <view class="control-btn play" @tap="togglePlay">
                    <text>{{ isPlaying ? '⏸' : '▶️' }}</text>
                </view>
                <view class="control-btn" @tap="skipForward">
                    <text>⏩</text>
                </view>
            </view>

            <!-- 录像列表 -->
            <view class="record-list-section">
                <view class="section-header">
                    <text class="section-title">录像列表</text>
                    <text class="record-count">{{ records.length }} 条</text>
                </view>

                <scroll-view class="record-list" scroll-y>
                    <view
                        class="record-item"
                        v-for="record in records"
                        :key="record.id"
                        :class="{ active: currentRecord?.id === record.id }"
                        @tap="selectRecord(record)"
                    >
                        <view class="record-time">
                            <text class="time-text">{{ formatTime(record.startTime) }}</text>
                            <text class="duration-text">{{ formatDuration(record.duration) }}</text>
                        </view>
                        <view class="record-info">
                            <text class="record-type">{{
                                getRecordTypeName(record.recordType)
                            }}</text>
                            <view class="record-status" :class="{ completed: record.status === 1 }">
                                {{ getStatusName(record.status) }}
                            </view>
                        </view>
                        <view class="record-actions">
                            <text class="action-btn" @tap.stop="playRecord(record)">▶️</text>
                            <text class="action-btn" @tap.stop="downloadRecord(record)">📥</text>
                            <text class="action-btn delete" @tap.stop="deleteRecord(record)"
                                >🗑</text
                            >
                        </view>
                    </view>

                    <view class="empty-list" v-if="records.length === 0">
                        <text>当日无录像记录</text>
                    </view>
                </scroll-view>
            </view>
        </view>

        <!-- 日期选择器 -->
        <view class="date-picker" v-if="showPicker" @tap="closePicker">
            <view class="picker-content" @tap.stop>
                <picker-view :value="pickerValue" @change="onDateChange" class="date-picker-view">
                    <picker-view-column>
                        <view v-for="year in years" :key="year" class="picker-item"
                            >{{ year }}年</view
                        >
                    </picker-view-column>
                    <picker-view-column>
                        <view v-for="month in months" :key="month" class="picker-item"
                            >{{ month }}月</view
                        >
                    </picker-view-column>
                    <picker-view-column>
                        <view v-for="day in days" :key="day" class="picker-item">{{ day }}日</view>
                    </picker-view-column>
                </picker-view>
                <view class="picker-actions">
                    <button class="picker-btn cancel" @tap="closePicker">取消</button>
                    <button class="picker-btn confirm" @tap="confirmDate">确定</button>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onLoad } from 'vue'
import { onLoad as onUniLoad } from '@dcloudio/uni-app'
import {
    getRecordPage,
    deleteRecord as deleteRecordApi,
    getCameraDetail,
    type CameraRecord,
    type CameraDevice,
    RecordType,
    RecordStatus
} from '@/api/camera'

const videoRef = ref<any>(null)
const device = ref<CameraDevice | null>(null)
const deviceId = ref<number>(0)
const records = ref<CameraRecord[]>([])
const currentRecord = ref<CameraRecord | null>(null)
const selectedDate = ref(new Date())
const currentHour = ref(new Date().getHours())
const isPlaying = ref(false)
const isFullscreen = ref(false)
const showPicker = ref(false)
const poster = ref('')

// 设备名称
const deviceName = computed(() => device.value?.deviceName || '录像回放')

// 日期选择器数据
const years = computed(() => {
    const current = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => current - i)
})
const months = Array.from({ length: 12 }, (_, i) => i + 1)
const days = computed(() => {
    const year = selectedDate.value.getFullYear()
    const month = selectedDate.value.getMonth() + 1
    return Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => i + 1)
})

const pickerValue = ref([0, 0, 0])

onUniLoad(async (query: any) => {
    if (query.id) {
        deviceId.value = parseInt(query.id)
        await loadDevice()
        await loadRecords()
    }
    if (query.date) {
        selectedDate.value = new Date(query.date)
    }
})

async function loadDevice() {
    try {
        device.value = (await getCameraDetail(deviceId.value)) as CameraDevice
    } catch (e) {
        console.error('加载设备失败', e)
    }
}

async function loadRecords() {
    try {
        const result = (await getRecordPage({
            deviceId: deviceId.value,
            pageNum: 1,
            pageSize: 100
        })) as any

        // 过滤当天的记录
        const dayStart = new Date(selectedDate.value)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(selectedDate.value)
        dayEnd.setHours(23, 59, 59, 999)

        records.value = (result.records || []).filter((r: CameraRecord) => {
            if (!r.startTime) return false
            const startTime = new Date(r.startTime)
            return startTime >= dayStart && startTime <= dayEnd
        })
    } catch (e) {
        console.error('加载录像失败', e)
    }
}

// 获取某小时的录像片段
function getRecordSegmentsForHour(hour: number): { start: number; end: number }[] {
    return records.value
        .filter((r) => {
            if (!r.startTime) return false
            const startHour = new Date(r.startTime).getHours()
            return startHour === hour
        })
        .map((r) => {
            const start = new Date(r.startTime).getMinutes()
            const duration = r.duration || 0
            return {
                start,
                end: Math.min(start + Math.floor(duration / 60), 60)
            }
        })
}

function getSegmentStyle(segment: { start: number; end: number }) {
    const left = (segment.start / 60) * 100
    const width = ((segment.end - segment.start) / 60) * 100
    return {
        left: `${left}%`,
        width: `${width}%`
    }
}

function selectHour(hour: number) {
    currentHour.value = hour
}

function selectSegment(segment: { start: number; end: number }) {
    // 跳转到片段开始时间
    const time = currentHour.value * 3600 + segment.start * 60
    videoRef.value?.seek(time)
}

function selectRecord(record: CameraRecord) {
    currentRecord.value = record
}

function playRecord(record: CameraRecord) {
    currentRecord.value = record
    setTimeout(() => {
        videoRef.value?.play()
    }, 100)
}

async function downloadRecord(record: CameraRecord) {
    if (!record.filePath) return
    uni.showToast({ title: '开始下载...', icon: 'loading' })
    // TODO: 实现下载
}

async function deleteRecord(record: CameraRecord) {
    if (!record.id) return

    uni.showModal({
        title: '确认删除',
        content: '确定要删除这条录像吗？',
        success: async (res) => {
            if (res.confirm) {
                try {
                    await deleteRecordApi(record.id)
                    records.value = records.value.filter((r) => r.id !== record.id)
                    uni.showToast({ title: '删除成功', icon: 'success' })
                } catch (e) {
                    uni.showToast({ title: '删除失败', icon: 'none' })
                }
            }
        }
    })
}

// 播放控制
function togglePlay() {
    if (isPlaying.value) {
        videoRef.value?.pause()
    } else {
        videoRef.value?.play()
    }
}

function skipForward() {
    const currentTime = videoRef.value?.currentTime || 0
    videoRef.value?.seek(currentTime + 10)
}

function skipBackward() {
    const currentTime = videoRef.value?.currentTime || 0
    videoRef.value?.seek(Math.max(0, currentTime - 10))
}

// 日期控制
function prevDay() {
    const date = new Date(selectedDate.value)
    date.setDate(date.getDate() - 1)
    selectedDate.value = date
    loadRecords()
}

function nextDay() {
    const date = new Date(selectedDate.value)
    date.setDate(date.getDate() + 1)
    if (date <= new Date()) {
        selectedDate.value = date
        loadRecords()
    }
}

function goToToday() {
    selectedDate.value = new Date()
    loadRecords()
}

function showDatePicker() {
    showPicker.value = true
}

function closePicker() {
    showPicker.value = false
}

function onDateChange(e: any) {
    pickerValue.value = e.detail.value
}

function confirmDate() {
    const year = years.value[pickerValue.value[0]]
    const month = months[pickerValue.value[1]]
    const day = days.value[pickerValue.value[2]]
    selectedDate.value = new Date(year, month - 1, day)
    showPicker.value = false
    loadRecords()
}

// 事件处理
function onPlay() {
    isPlaying.value = true
}

function onPause() {
    isPlaying.value = false
}

function onEnded() {
    isPlaying.value = false
}

function onTimeUpdate(e: any) {
    // 更新时间显示
}

function onFullscreenChange(e: any) {
    isFullscreen.value = e.detail?.fullScreen || false
}

function onBack() {
    uni.navigateBack()
}

// 格式化函数
function formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function formatTime(timestamp?: number): string {
    if (!timestamp) return '--:--'
    const date = new Date(timestamp)
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(
        2,
        '0'
    )}`
}

function formatDuration(seconds?: number): string {
    if (!seconds) return '0秒'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    if (m > 0) return `${m}分${s}秒`
    return `${s}秒`
}

function getRecordTypeName(type?: number): string {
    const map: Record<number, string> = {
        [RecordType.Manual]: '手动录制',
        [RecordType.Timed]: '定时录制',
        [RecordType.Motion]: '移动侦测'
    }
    return map[type || 1] || '录像'
}

function getStatusName(status?: number): string {
    const map: Record<number, string> = {
        [RecordStatus.Recording]: '录制中',
        [RecordStatus.Completed]: '已完成',
        [RecordStatus.Uploaded]: '已上传'
    }
    return map[status || 0] || '未知'
}
</script>

<style scoped lang="scss">
.playback-page {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    display: flex;
    flex-direction: column;
}

.video-player {
    width: 100%;
    height: 400rpx;
    background: #000;
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

    .back-btn,
    .date-btn {
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
        }

        .subtitle {
            display: block;
            font-size: 22rpx;
            color: rgba(255, 255, 255, 0.6);
        }
    }
}

.bottom-bar {
    flex: 1;
    background: var(--color-surface);
    display: flex;
    flex-direction: column;
}

.timeline-section {
    padding: 24rpx 30rpx;
    border-bottom: 1rpx solid var(--color-border-light);

    .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20rpx;

        .timeline-date {
            font-size: 28rpx;
            color: var(--color-text);
            font-weight: 500;
        }

        .timeline-nav {
            display: flex;
            align-items: center;
            gap: 16rpx;

            .nav-btn {
                width: 48rpx;
                height: 48rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--color-surface-soft);
                border-radius: 8rpx;
                font-size: 24rpx;
            }

            .today-btn {
                padding: 8rpx 20rpx;
                background: var(--color-primary);
                color: #fff;
                border-radius: 20rpx;
                font-size: 24rpx;
            }
        }
    }

    .timeline-scroll {
        width: 100%;
        white-space: nowrap;
    }

    .timeline-track {
        display: inline-flex;
    }

    .hour-marker {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 80rpx;
        flex-shrink: 0;

        .hour-label {
            font-size: 20rpx;
            color: var(--color-text-tertiary);
            margin-bottom: 8rpx;
        }

        .hour-bar {
            width: 60rpx;
            height: 40rpx;
            background: var(--color-border-light);
            border-radius: 4rpx;
            position: relative;
        }

        .record-segment {
            position: absolute;
            height: 100%;
            background: var(--color-success);
            border-radius: 4rpx;
        }

        &.active .hour-label {
            color: var(--color-primary);
            font-weight: 500;
        }
    }
}

.playback-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 30rpx;
    gap: 40rpx;

    .control-btn {
        width: 80rpx;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-surface-soft);
        border-radius: 50%;
        font-size: 36rpx;

        &.play {
            width: 100rpx;
            height: 100rpx;
            background: var(--color-primary);
            color: #fff;
            font-size: 44rpx;
        }
    }
}

.record-list-section {
    flex: 1;
    padding: 0 30rpx;

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx 0;
        border-bottom: 1rpx solid var(--color-border-light);

        .section-title {
            font-size: 28rpx;
            color: var(--color-text);
        }

        .record-count {
            font-size: 24rpx;
            color: var(--color-text-tertiary);
        }
    }

    .record-list {
        height: 400rpx;
    }

    .record-item {
        display: flex;
        align-items: center;
        padding: 24rpx 0;
        border-bottom: 1rpx solid var(--color-border-light);

        &.active {
            background: var(--color-primary-mist);
            margin: 0 -30rpx;
            padding: 24rpx 30rpx;
        }

        .record-time {
            margin-right: 24rpx;

            .time-text {
                display: block;
                font-size: 28rpx;
                color: var(--color-text);
            }

            .duration-text {
                display: block;
                font-size: 22rpx;
                color: var(--color-text-tertiary);
            }
        }

        .record-info {
            flex: 1;

            .record-type {
                display: block;
                font-size: 26rpx;
                color: var(--color-text);
                margin-bottom: 6rpx;
            }

            .record-status {
                display: inline-block;
                padding: 4rpx 12rpx;
                background: var(--color-surface-soft);
                border-radius: 12rpx;
                font-size: 20rpx;
                color: var(--color-text-tertiary);

                &.completed {
                    background: var(--color-success-soft);
                    color: var(--color-success);
                }
            }
        }

        .record-actions {
            display: flex;
            gap: 16rpx;

            .action-btn {
                width: 56rpx;
                height: 56rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--color-surface-soft);
                border-radius: 50%;
                font-size: 24rpx;

                &.delete {
                    background: var(--color-danger-soft);
                }
            }
        }
    }

    .empty-list {
        text-align: center;
        padding: 60rpx;
        color: var(--color-text-tertiary);
    }
}

.date-picker {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    z-index: 200;

    .picker-content {
        width: 100%;
        background: var(--color-surface);
        border-radius: 24rpx 24rpx 0 0;
        padding: 30rpx;

        .date-picker-view {
            height: 400rpx;

            .picker-item {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32rpx;
            }
        }

        .picker-actions {
            display: flex;
            gap: 24rpx;
            margin-top: 30rpx;

            .picker-btn {
                flex: 1;
                height: 80rpx;
                border-radius: 40rpx;
                font-size: 30rpx;

                &.cancel {
                    background: var(--color-surface-soft);
                    color: var(--color-text-secondary);
                }

                &.confirm {
                    background: var(--color-primary);
                    color: #fff;
                }
            }
        }
    }
}
</style>
