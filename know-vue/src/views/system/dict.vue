<template>
  <div class="dict-container">
    <!-- 搜索区域 -->
    <a-card :bordered="false" class="search-form">
      <a-form :model="queryParams" layout="inline">
        <a-form-item label="字典名称">
          <a-input v-model:value="queryParams.dictName" placeholder="请输入字典名称" allow-clear />
        </a-form-item>
        <a-form-item label="字典编码">
          <a-input v-model:value="queryParams.dictType" placeholder="请输入字典编码" allow-clear />
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
              <a-button type="link" size="small" @click="handleDictData(record)">字典数据</a-button>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" danger size="small" @click="handleDelete(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 字典类型 - 新增/编辑弹窗 -->
    <a-modal v-model:open="modalVisible" :title="modalTitle" width="500px" @ok="handleModalOk" @cancel="handleModalCancel">
      <a-form ref="formRef" :model="formData" :label-col="{ span: 5 }" :rules="formRules">
        <a-form-item label="字典名称" name="dictName">
          <a-input v-model:value="formData.dictName" placeholder="请输入字典名称" />
        </a-form-item>
        <a-form-item label="字典编码" name="dictType">
          <a-input v-model:value="formData.dictType" placeholder="请输入字典编码" :disabled="modalType === 'edit'" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="1">正常</a-radio>
            <a-radio :value="0">停用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 字典数据 - 弹窗 -->
    <a-modal v-model:open="dictDataVisible" :title="'字典数据 - ' + currentDictTypeName" width="800px" :footer="null">
      <div class="dict-data-toolbar">
        <a-button type="primary" size="small" @click="handleAddDictData">
          <template #icon><PlusOutlined /></template>
          新增数据
        </a-button>
      </div>
      <a-table
        :columns="dictDataColumns"
        :data-source="dictDataList"
        :loading="dictDataLoading"
        :pagination="false"
        row-key="id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '正常' : '停用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEditDictData(record)">编辑</a-button>
              <a-button type="link" danger size="small" @click="handleDeleteDictData(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-modal>

    <!-- 字典数据 - 新增/编辑弹窗 -->
    <a-modal v-model:open="dictDataModalVisible" :title="dictDataModalTitle" width="500px" @ok="handleDictDataModalOk" @cancel="handleDictDataModalCancel">
      <a-form ref="dictDataFormRef" :model="dictDataForm" :label-col="{ span: 5 }" :rules="dictDataFormRules">
        <a-form-item label="字典标签" name="dictLabel">
          <a-input v-model:value="dictDataForm.dictLabel" placeholder="请输入字典标签" />
        </a-form-item>
        <a-form-item label="字典值" name="dictValue">
          <a-input v-model:value="dictDataForm.dictValue" placeholder="请输入字典值" />
        </a-form-item>
        <a-form-item label="排序" name="sort">
          <a-input-number v-model:value="dictDataForm.sort" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="dictDataForm.status">
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
import { getDictTypeList, addDictType, updateDictType, deleteDictType, getDictList, addDict, updateDict, deleteDict } from '@/api/system/dict'

const queryParams = reactive({ dictName: '', dictType: '' })

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '字典名称', dataIndex: 'dictName', key: 'dictName' },
  { title: '字典编码', dataIndex: 'dictType', key: 'dictType' },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 250, fixed: 'right' }
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
const formData = reactive({ id: undefined as number | undefined, dictName: '', dictType: '', status: 1 })
const formRules = {
  dictName: [{ required: true, message: '请输入字典名称' }],
  dictType: [{ required: true, message: '请输入字典编码' }]
}

// ==================== 字典数据相关 ====================
const dictDataVisible = ref(false)
const dictDataLoading = ref(false)
const currentDictTypeId = ref<number>()
const currentDictTypeName = ref('')
const dictDataList = ref<any[]>([])

const dictDataColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '字典标签', dataIndex: 'dictLabel', key: 'dictLabel' },
  { title: '字典值', dataIndex: 'dictValue', key: 'dictValue' },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 150 }
]

const dictDataModalVisible = ref(false)
const dictDataModalType = ref<'add' | 'edit'>('add')
const dictDataModalTitle = ref('')
const dictDataFormRef = ref()
const dictDataForm = reactive({
  id: undefined as number | undefined,
  dictTypeId: 0,
  dictLabel: '',
  dictValue: '',
  sort: 0,
  status: 1
})
const dictDataFormRules = {
  dictLabel: [{ required: true, message: '请输入字典标签' }],
  dictValue: [{ required: true, message: '请输入字典值' }]
}

// ==================== 字典类型操作 ====================
const loadData = async () => {
  loading.value = true
  try {
    const res = await getDictTypeList({ dictName: queryParams.dictName, dictType: queryParams.dictType })
    console.log('字典数据:', res)
    const responseData = res?.data
    if (Array.isArray(responseData)) {
      data.value = responseData
    } else if (responseData?.records) {
      data.value = responseData.records
    } else {
      data.value = []
    }
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
  queryParams.dictName = ''
  queryParams.dictType = ''
  loadData()
}

const handleAdd = () => {
  modalType.value = 'add'
  modalTitle.value = '新增字典'
  formData.id = undefined
  formData.dictName = ''
  formData.dictType = ''
  formData.status = 1
  modalVisible.value = true
}

const handleEdit = (record: any) => {
  modalType.value = 'edit'
  modalTitle.value = '编辑字典'
  formData.id = record.id
  formData.dictName = record.dictName
  formData.dictType = record.dictType
  formData.status = record.status
  modalVisible.value = true
}

const handleDelete = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除字典 "${record.dictName}" 吗？`,
    onOk: async () => {
      try {
        await deleteDictType(record.id)
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
      await addDictType(formData)
      message.success('新增成功')
    } else {
      await updateDictType(formData)
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

// ==================== 字典数据操作 ====================
const handleDictData = async (record: any) => {
  currentDictTypeId.value = record.id
  currentDictTypeName.value = `${record.dictName} (${record.dictType})`
  dictDataVisible.value = true
  await loadDictData()
}

const loadDictData = async () => {
  if (!currentDictTypeId.value) return
  dictDataLoading.value = true
  try {
    const res = await getDictList(currentDictTypeId.value)
    const responseData = res?.data
    if (Array.isArray(responseData)) {
      dictDataList.value = responseData
    } else if (responseData?.records) {
      dictDataList.value = responseData.records
    } else {
      dictDataList.value = []
    }
  } catch (error) {
    console.error('加载字典数据失败:', error)
    message.error('加载字典数据失败')
  } finally {
    dictDataLoading.value = false
  }
}

const handleAddDictData = () => {
  dictDataModalType.value = 'add'
  dictDataModalTitle.value = '新增字典数据'
  dictDataForm.id = undefined
  dictDataForm.dictTypeId = currentDictTypeId.value!
  dictDataForm.dictLabel = ''
  dictDataForm.dictValue = ''
  dictDataForm.sort = 0
  dictDataForm.status = 1
  dictDataModalVisible.value = true
}

const handleEditDictData = (record: any) => {
  dictDataModalType.value = 'edit'
  dictDataModalTitle.value = '编辑字典数据'
  dictDataForm.id = record.id
  dictDataForm.dictTypeId = record.dictTypeId
  dictDataForm.dictLabel = record.dictLabel
  dictDataForm.dictValue = record.dictValue
  dictDataForm.sort = record.sort
  dictDataForm.status = record.status
  dictDataModalVisible.value = true
}

const handleDeleteDictData = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除字典数据 "${record.dictLabel}" 吗？`,
    onOk: async () => {
      try {
        await deleteDict(record.id)
        message.success('删除成功')
        loadDictData()
      } catch (error) {
        message.error('删除失败')
      }
    }
  })
}

const handleDictDataModalOk = async () => {
  try {
    await dictDataFormRef.value.validate()
    if (dictDataModalType.value === 'add') {
      await addDict(dictDataForm)
      message.success('新增成功')
    } else {
      await updateDict(dictDataForm)
      message.success('编辑成功')
    }
    dictDataModalVisible.value = false
    loadDictData()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const handleDictDataModalCancel = () => {
  dictDataModalVisible.value = false
  dictDataFormRef.value?.resetFields()
}

onMounted(() => { loadData() })
</script>

<style scoped lang="less">
.dict-container {
  .search-form { margin-bottom: 16px; }
  .table-wrapper { .table-toolbar { margin-bottom: 16px; } }
  .dict-data-toolbar { margin-bottom: 12px; }
}
</style>