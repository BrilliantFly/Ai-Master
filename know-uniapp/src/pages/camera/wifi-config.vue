<template>
    <view class="wifi-config-page">
        <WiFiConfig />
    </view>
</template>

<script setup lang="ts">
import WiFiConfig from '@/components/camera/WiFiConfig.vue'
</script>

<style lang="scss">
.wifi-config-page {
    min-height: 100vh;
    background: var(--color-bg);
}
</style>
