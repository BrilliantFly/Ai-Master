<template>
    <custom-tab-bar v-if="showTabbar" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import CustomTabBar from '@/components/custom-tab-bar/index.vue'

const appStore = useAppStore()

const showTabbar = computed(() => {
    const currentPages = getCurrentPages()
    const currentPage = currentPages[currentPages.length - 1]
    const currentRoute = '/' + currentPage.route

    const tabList = appStore.getTabbarConfig?.filter((item: any) => item.is_show == 1) || []
    
    return tabList.some((item: any) => {
        if (item.is_big === 1) {
            return item.big_position && currentRoute === '/pages/index/index'
        }
        return item.link?.path === currentRoute
    })
})
</script>
