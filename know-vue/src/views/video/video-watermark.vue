<template>
  <div class="p-4">
    <a-card title="视频水印">
      <a-form layout="vertical">
        <a-form-item label="水印文字">
          <a-input v-model:value="watermarkText" placeholder="请输入水印文字" />
        </a-form-item>
        <a-form-item label="位置">
          <a-select v-model:value="position">
            <a-select-option value="top-left">左上角</a-select-option>
            <a-select-option value="top-right">右上角</a-select-option>
            <a-select-option value="bottom-left">左下角</a-select-option>
            <a-select-option value="bottom-right">右下角</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary">应用水印</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const watermarkText = ref('')
const position = ref('bottom-right')
</script>