<template>
  <div class="p-4">
    <a-card title="摄像头管理">
      <a-table :columns="columns" :data-source="data" :pagination="false">
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '设备名称', dataIndex: 'name', key: 'name' },
  { title: 'IP地址', dataIndex: 'ip', key: 'ip' },
  { title: '状态', dataIndex: 'status', key: 'status' }
]

const data = []
</script>