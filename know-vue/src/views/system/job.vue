<template>
  <div class="job-container">
    <!-- 搜索区域 -->
    <a-card :bordered="false" class="search-form">
      <a-form :model="queryParams" layout="inline">
        <a-form-item label="岗位名称">
          <a-input v-model:value="queryParams.jobName" placeholder="请输入岗位名称" allow-clear />
        </a-form-item>
        <a-form-item label="岗位编码">
          <a-input v-model:value="queryParams.code" placeholder="请输入岗位编码" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="loadData">
              <template #icon><SearchOutlined /></template>
              查询
            </a-button>
            <a-button @click="handleReset">
              <template #icon><ReloadOutlined /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 表格区域 -->
    <a-card :bordered="false" class="table-wrapper">
      <a-space class="table-toolbar">
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          新增
        </a-button>
      </a-space>

      <a-table
        :columns="columns"
        :data-source="data"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '正常' : '停用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" danger size="small" @click="handleDelete(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal v-model:open="modalVisible" :title="modalTitle" width="500px" @ok="handleModalOk" @cancel="handleModalCancel">
      <a-form ref="formRef" :model="formData" :label-col="{ span: 5 }" :rules="formRules">
        <a-form-item label="岗位名称" name="jobName">
          <a-input v-model:value="formData.jobName" placeholder="请输入岗位名称" />
        </a-form-item>
        <a-form-item label="岗位编码" name="code">
          <a-input v-model:value="formData.code" placeholder="请输入岗位编码" />
        </a-form-item>
        <a-form-item label="排序" name="sort">
          <a-input-number v-model:value="formData.sort" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="1">正常</a-radio>
            <a-radio :value="0">停用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { getJobList, addJob, updateJob, deleteJob } from '@/api/system/job'

const queryParams = reactive({ jobName: '', code: '' })

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '岗位名称', dataIndex: 'jobName', key: 'jobName' },
  { title: '岗位编码', dataIndex: 'code', key: 'code' },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

const data = ref<any[]>([])
const loading = ref(false)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const modalVisible = ref(false)
const modalType = ref<'add' | 'edit'>('add')
const modalTitle = ref('')
const formRef = ref()
const formData = reactive({ id: undefined as number | undefined, jobName: '', code: '', sort: 0, status: 1 })
const formRules = {
  jobName: [{ required: true, message: '请输入岗位名称' }],
  code: [{ required: true, message: '请输入岗位编码' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getJobList({})
    console.log('岗位数据:', res)
    data.value = res?.data || res || []
    pagination.total = data.value.length
  } catch (error) {
    console.error('加载失败:', error)
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

const handleReset = () => {
  queryParams.jobName = ''
  queryParams.code = ''
  loadData()
}

const handleAdd = () => {
  modalType.value = 'add'
  modalTitle.value = '新增岗位'
  formData.id = undefined
  formData.jobName = ''
  formData.code = ''
  formData.sort = 0
  formData.status = 1
  modalVisible.value = true
}

const handleEdit = (record: any) => {
  modalType.value = 'edit'
  modalTitle.value = '编辑岗位'
  formData.id = record.id
  formData.jobName = record.jobName
  formData.code = record.code
  formData.sort = record.sort
  formData.status = record.status
  modalVisible.value = true
}

const handleDelete = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除岗位 "${record.jobName}" 吗？`,
    onOk: async () => {
      try {
        await deleteJob(record.id)
        message.success('删除成功')
        loadData()
      } catch (error) {
        message.error('删除失败')
      }
    }
  })
}

const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    if (modalType.value === 'add') {
      await addJob(formData)
      message.success('新增成功')
    } else {
      await updateJob(formData)
      message.success('编辑成功')
    }
    modalVisible.value = false
    loadData()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const handleModalCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
}

onMounted(() => { loadData() })
</script>

<style scoped lang="less">
.job-container {
  .search-form { margin-bottom: 16px; }
  .table-wrapper { .table-toolbar { margin-bottom: 16px; } }
}
</style>