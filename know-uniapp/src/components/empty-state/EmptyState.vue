<template>
    <view class="empty-state" :style="{ padding: padding }">
        <text v-if="icon" class="empty-icon">{{ icon }}</text>
        <text v-if="title" class="empty-title">{{ title }}</text>
        <text v-if="desc" class="empty-desc">{{ desc }}</text>
        <slot />
    </view>
</template>

<script lang="ts" setup>
withDefaults(
    defineProps<{
        icon?: string
        title?: string
        desc?: string
        padding?: string
    }>(),
    {
        padding: '140rpx 0 0'
    }
)
</script>

<style lang="scss" scoped>
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
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
</style>
