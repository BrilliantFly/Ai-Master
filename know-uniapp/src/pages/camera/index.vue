<template>
    <view class="device-page">
        <view class="device-header">
            <text class="page-title">设备中心</text>
            <view class="header-actions">
                <view class="premium-header-btn" @tap="goToSort">⇅</view>
                <view class="premium-header-btn" @tap="goToDiscover">搜</view>
            </view>
        </view>

        <view class="search-section">
            <view class="premium-search">
                <text class="search-icon">搜</text>
                <input
                    v-model="searchKey"
                    placeholder="搜索设备名称、IP、型号..."
                    confirm-type="search"
                    @confirm="applyFilter"
                />
                <view class="btn-scan" @tap="goToDiscover">扫</view>
            </view>
        </view>

        <view class="overview-cards premium-fade-in premium-d1">
            <view class="ov-card accent">
                <view class="ov-icon premium-icon-g1 premium-icon-gw">📹</view>
                <text class="ov-num">{{ overview.total }}</text>
                <text class="ov-label">总设备</text>
            </view>
            <view class="ov-card">
                <view class="ov-icon premium-icon-g2 premium-icon-gw">🟢</view>
                <text class="ov-num">{{ overview.online }}</text>
                <text class="ov-label">在线</text>
            </view>
            <view class="ov-card warn">
                <view class="ov-icon premium-icon-g4 premium-icon-gw">🔶</view>
                <text class="ov-num">{{ overview.offline }}</text>
                <text class="ov-label">离线</text>
            </view>
            <view class="ov-card">
                <view class="ov-icon premium-icon-g3 premium-icon-gw">⭐</view>
                <text class="ov-num">{{ favoriteIds.length }}</text>
                <text class="ov-label">收藏</text>
            </view>
        </view>

        <view
            v-if="filteredDevices.length || loading"
            class="premium-segment-alt segment-alt premium-fade-in premium-d2"
        >
            <scroll-view class="premium-filter-tabs filter-tabs" scroll-x>
                <view
                    v-for="item in filterTabs"
                    :key="item.key"
                    class="premium-filter-tab"
                    :class="{ active: currentFilter === item.key }"
                    @tap="currentFilter = item.key"
                >
                    <text>{{ item.label }}</text>
                    <text class="tab-count">{{ item.count }}</text>
                </view>
            </scroll-view>

            <view v-if="filteredDevices.length" class="device-list">
                <view
                    v-for="device in filteredDevices"
                    :key="device.id || device.deviceCode"
                    class="device-card"
                    @tap="goToDetail(device)"
                >
                    <view class="thumb">
                        <image
                            v-if="device.snapshotUrl"
                            :src="device.snapshotUrl"
                            mode="aspectFill"
                            class="thumb-image"
                        />
                        <text v-else class="thumb-emoji">📹</text>
                        <view class="status-dot" :class="device.status === 1 ? 'online' : 'offline'"></view>
                    </view>

                    <view class="info">
                        <view class="name">
                            <text>{{ device.deviceName || '未命名设备' }}</text>
                            <text class="tag" :class="device.status === 1 ? 'online' : 'offline'">
                                {{ device.status === 1 ? '在线' : '离线' }}
                            </text>
                        </view>
                        <view class="model">{{ device.deviceModel || device.manufacturer || 'Unknown Model' }}</view>
                        <view class="ip">{{ device.ipAddress || '-' }}:{{ device.port || 8080 }}</view>
                        <view class="meta">
                            <text>{{ device.status === 1 ? '信号稳定' : '等待重连' }}</text>
                            <text v-if="device.manufacturer">{{ device.manufacturer }}</text>
                        </view>
                    </view>

                    <view class="actions">
                        <view class="action-btn play" @tap.stop="goToPlay(device)">▶</view>
                        <view class="action-btn" @tap.stop="toggleFavorite(device)">⋯</view>
                    </view>
                </view>
            </view>
        </view>

        <view v-else class="empty-state">
            <text class="empty-icon">📹</text>
            <text class="empty-title">暂无设备</text>
            <text class="empty-desc">可以先添加设备，或从局域网中发现可接入摄像头</text>
        </view>

        <page-status :status="loading ? 'loading' : 'normal'" />

        <view class="add-bar">
            <button class="premium-btn premium-btn-primary add-btn" @tap="goToAdd">添加设备</button>
            <button class="btn-discover" @tap="goToDiscover">搜 发现设备</button>
        </view>

        <PremiumBottomNav active="device" />
    </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import { useRouter } from 'uniapp-router-next'
import PremiumBottomNav from '@/components/PremiumBottomNav.vue'
import { getCameraFavorites, getCameraList, type CameraDevice } from '@/api/camera'

const router = useRouter()
const deviceList = ref<CameraDevice[]>([])
const favoriteIds = ref<number[]>([])
const searchKey = ref('')
const currentFilter = ref<'all' | 'online' | 'offline' | 'favorite'>('all')
const loading = ref(false)

const normalizedDevices = computed(() =>
    deviceList.value.map((device) => ({
        ...device,
        deviceName: device.deviceName || (device as any).name || '未命名设备',
        ipAddress: device.ipAddress || (device as any).ip || '-'
    }))
)

const overview = computed(() => {
    const total = normalizedDevices.value.length
    const online = normalizedDevices.value.filter((item) => item.status === 1).length
    const offline = total - online
    return { total, online, offline }
})

const filterTabs = computed(() => [
    { key: 'all', label: '全部', count: overview.value.total },
    { key: 'online', label: '在线', count: overview.value.online },
    { key: 'offline', label: '离线', count: overview.value.offline },
    { key: 'favorite', label: '收藏', count: favoriteIds.value.length }
])

const filteredDevices = computed(() => {
    const keyword = searchKey.value.trim().toLowerCase()
    return normalizedDevices.value.filter((item) => {
        const matchFilter =
            currentFilter.value === 'all' ||
            (currentFilter.value === 'online' && item.status === 1) ||
            (currentFilter.value === 'offline' && item.status !== 1) ||
            (currentFilter.value === 'favorite' && isFavorite(item.id))

        const matchKeyword =
            !keyword ||
            item.deviceName?.toLowerCase().includes(keyword) ||
            item.ipAddress?.toLowerCase().includes(keyword) ||
            item.deviceModel?.toLowerCase().includes(keyword) ||
            item.manufacturer?.toLowerCase().includes(keyword)

        return matchFilter && matchKeyword
    })
})

const withTimeout = async <T>(promise: Promise<T>, fallback: T, ms = 1800): Promise<T> => {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
        return await Promise.race([
            promise,
            new Promise<T>((resolve) => {
                timer = setTimeout(() => resolve(fallback), ms)
            })
        ])
    } finally {
        if (timer) clearTimeout(timer)
    }
}

const isHtmlResponse = (value: unknown) => {
    return typeof value === 'string' && /<(?:!DOCTYPE|html|body|head)\b/i.test(value)
}

const loadDevices = async () => {
    loading.value = true
    try {
        const devices = await withTimeout(getCameraList() as Promise<any>, [])

        if (isHtmlResponse(devices)) {
            throw new Error('device api returned html')
        }

        deviceList.value = Array.isArray(devices) ? devices : []
        loading.value = false

        const favorites = await withTimeout(getCameraFavorites() as Promise<any>, [])
        if (isHtmlResponse(favorites)) {
            throw new Error('favorites api returned html')
        }
        favoriteIds.value = Array.isArray(favorites) ? favorites.map((item) => item.id!).filter(Boolean) : []
    } catch (error) {
        console.error('加载设备失败', error)
        deviceList.value = []
        favoriteIds.value = []
    } finally {
        loading.value = false
    }
}

const applyFilter = () => {
    currentFilter.value = 'all'
}

const isFavorite = (id?: number) => {
    return !!id && favoriteIds.value.includes(id)
}

const toggleFavorite = (device: CameraDevice) => {
    const id = device.id
    if (!id) return
    if (isFavorite(id)) {
        favoriteIds.value = favoriteIds.value.filter((item) => item !== id)
    } else {
        favoriteIds.value = [...favoriteIds.value, id]
    }
}

const goToSort = () => {
    uni.showToast({ title: '排序功能待接入', icon: 'none' })
}

const goToAdd = () => {
    router.navigateTo('/pages/camera/add')
}

const goToDiscover = () => {
    router.navigateTo('/pages/camera/discover')
}

const goToDetail = (device: CameraDevice) => {
    if (!device.id) return
    router.navigateTo(`/pages/camera/detail?id=${device.id}`)
}

const goToPlay = (device: CameraDevice) => {
    if (!device.id) return
    router.navigateTo(`/pages/camera/player?id=${device.id}`)
}

onShow(() => {
    loadDevices()
})

onPullDownRefresh(async () => {
    await loadDevices()
    uni.stopPullDownRefresh()
})
</script>

<style scoped lang="scss">
.device-page {
    min-height: 100vh;
    background: var(--color-bg-app);
    padding-bottom: 220rpx;
}

.device-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 20px 20px;
}

.page-title {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -.03em;
    color: var(--color-text);
}

.header-actions {
    display: flex;
    gap: 10px;
}

.search-section {
    padding: 0 20px 20px;
}

.overview-cards {
    display: flex;
    gap: 10px;
    padding: 0 20px 24px;
}

.ov-card {
    flex: 1;
    border-radius: var(--radius-md);
    padding: 14px 12px;
    background: var(--color-surface-soft);
    transition: all var(--duration) var(--ease);
    cursor: pointer;
    border: 1px solid transparent;
    text-align: center;
}

.ov-card.accent {
    background: var(--color-primary-soft);
    border-color: var(--color-primary-mist);
}

.ov-card.warn {
    background: var(--color-danger-soft);
    border-color: var(--color-danger-soft);
}

.ov-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px;
    font-size: 20px;
}

.ov-num {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -.03em;
    color: var(--color-text);
}

.ov-label {
    font-size: 12px;
    color: var(--color-text-secondary);
    margin-top: 3px;
    font-weight: 400;
}

.device-list {
    padding: 0 20px 120px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.device-card {
    display: flex;
    gap: 16px;
    padding: 16px;
    border-radius: var(--radius-md);
    background: var(--color-surface);
    border: 1px solid var(--color-border-light);
    cursor: pointer;
    transition: all var(--duration) var(--ease);
    box-shadow: var(--shadow-sm);
}

.thumb {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    flex-shrink: 0;
    background: var(--color-surface-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34px;
    position: relative;
}

.thumb-image {
    width: 100%;
    height: 100%;
}

.status-dot {
    position: absolute;
    top: 7px;
    right: 7px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    border: 2px solid var(--color-bg-app);
}

.status-dot.online {
    background: var(--color-success);
    box-shadow: 0 0 8px rgba(34, 181, 115, .5);
}

.status-dot.offline {
    background: var(--color-text-tertiary);
}

.info {
    flex: 1;
    min-width: 0;
    padding-top: 2px;
}

.name {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.tag {
    font-size: 10px;
    font-weight: 500;
    padding: 2px 9px;
    border-radius: 6px;
}

.tag.online {
    background: var(--color-success-soft);
    color: var(--color-success);
}

.tag.offline {
    background: var(--color-surface-soft);
    color: var(--color-text-tertiary);
}

.model {
    font-size: 12px;
    color: var(--color-text-secondary);
    margin-bottom: 5px;
    font-weight: 400;
}

.ip {
    font-size: 12px;
    color: var(--color-text-tertiary);
    font-family: var(--font-mono);
    letter-spacing: .02em;
    font-weight: 400;
}

.meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 7px;
    font-size: 11px;
    color: var(--color-text-tertiary);
}

.actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;
    flex-shrink: 0;
}

.action-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid var(--color-border-light);
    background: var(--color-surface-soft);
    color: var(--color-text-tertiary);
    font-size: 15px;
    cursor: pointer;
    transition: all var(--duration) var(--ease);
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-btn.play {
    background: var(--color-primary-soft);
    border-color: var(--color-primary-mist);
    color: var(--color-primary);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 140rpx 40rpx 0;
    text-align: center;
}

.empty-icon {
    font-size: 96rpx;
}

.empty-title {
    margin-top: 18rpx;
    font-size: 32rpx;
    font-weight: 600;
    color: var(--color-text);
}

.empty-desc {
    margin-top: 12rpx;
    font-size: 24rpx;
    line-height: 1.7;
    color: var(--color-text-secondary);
}

.add-bar {
    display: flex;
    gap: 10px;
    padding: 0 20px 16px;
    margin-top: 4px;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 90px;
    max-width: 420px;
    margin-left: auto;
    margin-right: auto;
    z-index: 60;
}

.add-btn,
.btn-discover {
    flex: 1;
    padding: 14px 0;
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius-md);
}

.btn-discover {
    background: var(--color-surface-soft);
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
}
</style>
