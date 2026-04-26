<template>
  <div class="p-4">
    <a-card title="视频播放器">
      <div class="video-container">
        <video-player ref="player" :options="videoOptions" />
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const player = ref()

const videoOptions = reactive({
  autoplay: false,
  controls: true,
  sources: [],
  fluid: true
})
</script>

<style scoped>
.video-container {
  width: 100%;
  max-width: 800px;
}
</style>