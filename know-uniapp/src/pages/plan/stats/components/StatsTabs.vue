<template>
    <view class="tab-row">
        <view
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-pill"
            :class="{ active: activeTab === tab.key }"
            @tap="$emit('change', tab.key)"
        >
            <text>{{ tab.label }}</text>
        </view>
    </view>
</template>

<script setup>
defineProps({
    tabs: { type: Array, required: true },
    activeTab: { type: String, required: true }
})

defineEmits(['change'])
</script>

<style scoped lang="scss">
.tab-row {
    display: flex;
    gap: 14rpx;
    padding: 0 2rpx 16rpx;
    overflow-x: auto;
}

.tab-pill {
    min-width: 140rpx;
    height: 72rpx;
    padding: 0 24rpx;
    border-radius: 999rpx;
    background: var(--color-surface-soft);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 600;
}

.tab-pill.active {
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
    color: #fff;
    box-shadow: var(--shadow-glow);
}
</style>
