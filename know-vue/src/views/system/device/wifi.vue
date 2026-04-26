<template>
  <div class="p-4">
    <a-card title="Wi-Fi管理">
      <a-table :columns="columns" :data-source="data" :pagination="false">
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Wi-Fi名称', dataIndex: 'name', key: 'name' },
  { title: '密码', dataIndex: 'password', key: 'password' },
  { title: '状态', dataIndex: 'status', key: 'status' }
]

const data = []
</script>
