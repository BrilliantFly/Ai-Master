<template>
    <view class="customer-page">
        <view class="customer-header">
            <view>
                <text class="page-title">客户管理</text>
                <text class="page-subtitle">集中维护客户信息与跟进状态</text>
            </view>
            <view class="header-actions">
                <view class="premium-header-btn" @tap="goToSearch">搜</view>
            </view>
        </view>

        <view class="search-section">
            <view class="premium-search">
                <text class="search-icon">搜</text>
                <input
                    v-model="keyword"
                    placeholder="搜索客户名称、公司、手机号..."
                    confirm-type="search"
                />
                <view class="btn-scan" @tap="goToSearch">筛</view>
            </view>
        </view>

        <view class="stats-row premium-fade-in premium-d1">
            <view class="stat-card accent">
                <text class="stat-num">{{ customerStats.total }}</text>
                <text class="stat-label">总客户</text>
            </view>
            <view class="stat-card">
                <text class="stat-num">{{ customerStats.monthly }}</text>
                <text class="stat-label">本月新增</text>
            </view>
            <view class="stat-card">
                <text class="stat-num">{{ customerStats.following }}</text>
                <text class="stat-label">待跟进</text>
            </view>
        </view>

        <scroll-view class="alpha-nav" scroll-x>
            <view
                v-for="item in alphaTabs"
                :key="item"
                class="alpha-btn"
                :class="{ active: activeLetter === item }"
                @tap="activeLetter = item"
            >
                {{ item }}
            </view>
        </scroll-view>

        <view class="client-list premium-fade-in premium-d2">
            <template v-if="groupedCustomers.length">
                <view v-for="group in groupedCustomers" :key="group.letter">
                    <view class="group-header">{{ group.letter }}</view>
                    <view
                        v-for="customer in group.items"
                        :key="customer.id || customer.phone || customer.name"
                        class="client-card"
                        @tap="handleCustomerTap(customer)"
                    >
                        <view class="avatar" :style="{ background: customer.avatarBg }">{{ customer.avatarText }}</view>
                        <view class="client-info">
                            <view class="name-row">
                                <text class="client-name">{{ customer.name }}</text>
                                <text class="premium-tag" :class="customer.tagClass">{{ customer.statusText }}</text>
                            </view>
                            <text class="client-company">
                                {{ customer.companyName || '未设置公司' }}
                                <text class="client-phone">{{ customer.phone || '--' }}</text>
                            </text>
                        </view>
                    </view>
                </view>
            </template>

            <view v-else class="empty-state">
                <text class="empty-icon">客</text>
                <text class="empty-title">暂无客户数据</text>
                <text class="empty-desc">可以先从服务端同步客户，或稍后再试</text>
            </view>
        </view>

        <view class="fab" @tap="showAddTip">+</view>

        <PremiumBottomNav active="customer" />
    </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useRouter } from 'uniapp-router-next'
import PremiumBottomNav from '@/components/PremiumBottomNav.vue'
import { getCustomerStats, getMyCustomer, type CustomerInfo } from '@/api/customer'

type ViewCustomer = Partial<CustomerInfo> & {
    avatarText: string
    avatarBg: string
    letter: string
    tagClass: string
    statusText: string
    name: string
}

const router = useRouter()
const keyword = ref('')
const activeLetter = ref('全部')
const customers = ref<ViewCustomer[]>([])
const customerStats = ref({
    total: 0,
    monthly: 0,
    following: 0
})

const alphaTabs = ['全部', 'A', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'S', 'T', 'W', 'X', 'Y', 'Z']

const avatarGradients = [
    'linear-gradient(135deg,#5b5bd6,#8b8bf0)',
    'linear-gradient(135deg,#22b573,#4dd499)',
    'linear-gradient(135deg,#f0a020,#fbbf24)',
    'linear-gradient(135deg,#e85a5a,#f08080)',
    'linear-gradient(135deg,#a855f7,#c084fc)',
    'linear-gradient(135deg,#06b6d4,#22d3ee)',
    'linear-gradient(135deg,#f97316,#fb923c)',
    'linear-gradient(135deg,#ec4899,#f472b6)'
]

const normalizedCustomers = computed(() => {
    return customers.value.filter((item) => {
        const matchLetter = activeLetter.value === '全部' || item.letter === activeLetter.value
        const search = keyword.value.trim().toLowerCase()
        const matchKeyword =
            !search ||
            item.name?.toLowerCase().includes(search) ||
            item.companyName?.toLowerCase().includes(search) ||
            item.phone?.toLowerCase().includes(search)
        return matchLetter && matchKeyword
    })
})

const groupedCustomers = computed(() => {
    const map = new Map<string, ViewCustomer[]>()
    normalizedCustomers.value.forEach((item) => {
        if (!map.has(item.letter)) {
            map.set(item.letter, [])
        }
        map.get(item.letter)!.push(item)
    })
    return Array.from(map.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([letter, items]) => ({ letter, items }))
})

const getLetter = (name?: string) => {
    if (!name) return 'A'
    const first = name.trim().charAt(0).toUpperCase()
    return /[A-Z]/.test(first) ? first : 'A'
}

const getStatusText = (item: Partial<CustomerInfo>) => {
    return item.statusText || item.customerTypeText || '已联系'
}

const getTagClass = (statusText: string) => {
    if (statusText.includes('签')) return 'premium-tag-success'
    if (statusText.includes('约') || statusText.includes('跟')) return 'premium-tag-warning'
    if (statusText.includes('流')) return 'premium-tag-danger'
    return 'premium-tag-neutral'
}

const buildCustomerView = (item: Partial<CustomerInfo>, index: number): ViewCustomer => {
    const name = item.name || `客户 ${index + 1}`
    const statusText = getStatusText(item)
    return {
        ...item,
        name,
        statusText,
        avatarText: getLetter(name),
        letter: getLetter(name),
        avatarBg: avatarGradients[index % avatarGradients.length],
        tagClass: getTagClass(statusText)
    }
}

const withTimeout = async <T>(promise: Promise<T>, fallback: T, ms = 8000): Promise<T> => {
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

const loadCustomers = async () => {
    try {
        const data: any = await withTimeout(getMyCustomer() as Promise<any>, [])
        if (isHtmlResponse(data)) {
            throw new Error('customer api returned html')
        }
        const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.records)
                ? data.records
                : Array.isArray(data?.list)
                    ? data.list
                    : data
                        ? [data]
                        : []
        customers.value = list.map((item, index) => buildCustomerView(item, index))
    } catch (error) {
        console.error('加载客户失败', error)
        customers.value = []
    }
}

const loadStats = async () => {
    try {
        const res: any = await withTimeout(getCustomerStats() as Promise<any>, null)
        if (isHtmlResponse(res)) {
            throw new Error('customer stats api returned html')
        }
        const total = typeof res === 'number' ? res : res?.total || res?.count || res?.data || customers.value.length || 0
        customerStats.value = {
            total,
            monthly: res?.monthly || res?.monthCount || Math.min(total, 12),
            following: res?.following || res?.todo || Math.min(total, 6)
        }
    } catch (error) {
        console.error('加载客户统计失败', error)
        customerStats.value = {
            total: customers.value.length,
            monthly: customers.value.length,
            following: customers.value.length
        }
    }
}

const handleCustomerTap = (customer: ViewCustomer) => {
    if (customer.id) {
        router.navigateTo(`/pages/customer/followup?customerId=${customer.id}`)
        return
    }
    uni.showToast({ title: '当前客户暂无详情页', icon: 'none' })
}

const goToSearch = () => {
    router.navigateTo('/pages/search/search')
}

const showAddTip = () => {
    uni.showToast({ title: '新增客户功能待接入', icon: 'none' })
}

onShow(async () => {
    await loadCustomers()
    await loadStats()
})
</script>

<style scoped lang="scss">
.customer-page {
    min-height: 100vh;
    background: var(--color-bg-app);
    padding-bottom: 150rpx;
}

.customer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 40rpx 16rpx;
}

.page-title {
    display: block;
    font-size: 48rpx;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.2;
}

.page-subtitle {
    display: block;
    margin-top: 8rpx;
    font-size: 26rpx;
    color: var(--color-text-secondary);
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.search-section {
    padding: 0 40rpx 24rpx;
}

.stats-row {
    display: flex;
    gap: 18rpx;
    padding: 0 40rpx 24rpx;
}

.stat-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28rpx 10rpx 24rpx;
    border-radius: var(--radius-md);
    background: var(--color-surface-soft);
}

.stat-card.accent {
    background: var(--color-primary-soft);
}

.stat-num {
    font-size: 44rpx;
    font-weight: 700;
    color: var(--color-text);
}

.stat-label {
    margin-top: 6rpx;
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.alpha-nav {
    white-space: nowrap;
    padding: 0 40rpx 20rpx;
}

.alpha-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 64rpx;
    height: 64rpx;
    margin-right: 8rpx;
    padding: 0 16rpx;
    border-radius: 16rpx;
    background: var(--color-surface-soft);
    color: var(--color-text-tertiary);
    font-size: 24rpx;
    font-weight: 600;
}

.alpha-btn.active {
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
    color: #fff;
    box-shadow: var(--shadow-glow);
}

.client-list {
    padding: 0 40rpx 40rpx;
}

.group-header {
    padding: 24rpx 0 14rpx;
    font-size: 24rpx;
    font-weight: 600;
    color: var(--color-text-tertiary);
}

.client-card {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 22rpx 10rpx;
}

.client-card:active {
    background: var(--color-surface-soft);
    border-radius: var(--radius-md);
}

.avatar {
    width: 88rpx;
    height: 88rpx;
    border-radius: 28rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
}

.client-info {
    flex: 1;
    min-width: 0;
}

.name-row {
    display: flex;
    align-items: center;
    gap: 10rpx;
    flex-wrap: wrap;
}

.client-name {
    font-size: 30rpx;
    font-weight: 600;
    color: var(--color-text);
}

.client-company {
    display: block;
    margin-top: 6rpx;
    font-size: 24rpx;
    color: var(--color-text-secondary);
}

.client-phone {
    margin-left: 10rpx;
    color: var(--color-text-tertiary);
}

.fab {
    position: fixed;
    right: 40rpx;
    bottom: 122rpx;
    z-index: 50;
    width: 104rpx;
    height: 104rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 64rpx;
    box-shadow: var(--shadow-glow);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 120rpx 0 0;
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
</style>
