<template>
  <div class="p-4">
    <a-card title="客户管理">
      <template #extra>
        <a-button type="primary">新增客户</a-button>
      </template>
      <a-table :columns="columns" :data-source="data" :pagination="false">
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '客户名称', dataIndex: 'name', key: 'name' },
  { title: '联系电话', dataIndex: 'phone', key: 'phone' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' }
]

const data = []
</script>
