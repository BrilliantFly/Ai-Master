<template>
  <div class="tabbar-container">
    <!-- 搜索区域 -->
    <a-card :bordered="false" class="search-form">
      <a-form :model="queryParams" layout="inline">
        <a-form-item label="名称">
          <a-input v-model:value="queryParams.name" placeholder="请输入名称" allow-clear />
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
          <template v-if="column.key === 'isShow'">
            <a-tag :color="record.isShow === 1 ? 'green' : 'red'">
              {{ record.isShow === 1 ? '显示' : '隐藏' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'isBig'">
            <a-tag :color="record.isBig === 1 ? 'blue' : 'default'">
              {{ record.isBig === 1 ? '是' : '否' }}
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
<a-form ref="formRef" :model="formData" :label-col="{ span: 6 }" :rules="formRules">
        <a-form-item label="名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入名称" />
        </a-form-item>
        <a-form-item label="选中图标" name="selected">
          <a-input v-model:value="formData.selected" placeholder="请输入选中图标路径" />
        </a-form-item>
        <a-form-item label="未选中图标" name="unselected">
          <a-input v-model:value="formData.unselected" placeholder="请输入未选中图标路径" />
        </a-form-item>
        <a-form-item label="跳转配置" name="link">
          <a-textarea v-model:value="formData.link" placeholder='{"type":"shop","path":"/pages/index/index","canTab":true}' :rows="3" />
        </a-form-item>
        <a-form-item label="是否显示" name="isShow">
          <a-radio-group v-model:value="formData.isShow">
            <a-radio :value="1">显示</a-radio>
            <a-radio :value="0">隐藏</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="是否大按钮" name="isBig">
          <a-radio-group v-model:value="formData.isBig">
            <a-radio :value="1">是</a-radio>
            <a-radio :value="0">否</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="大按钮图标" name="bigIcon">
          <a-input v-model:value="formData.bigIcon" placeholder="请输入大按钮图标" />
        </a-form-item>
        <a-form-item label="大按钮类型" name="bigType">
          <a-select v-model:value="formData.bigType" placeholder="请选择类型">
            <a-select-option value="jump">跳转</a-select-option>
            <a-select-option value="popup">弹出</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="大按钮位置" name="bigPosition">
          <a-input-number v-model:value="formData.bigPosition" :min="1" :max="5" style="width: 100%" />
        </a-form-item>
        <a-form-item label="弹出菜单" name="bigList">
          <a-textarea v-model:value="formData.bigList" placeholder='[{"title":"菜单1","path":"/pages/xxx"}]' :rows="2" />
        </a-form-item>
        <a-form-item label="排序" name="sort">
          <a-input-number v-model:value="formData.sort" :min="0" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { getTabbarList, addTabbar, updateTabbar, deleteTabbar } from '@/api/system/tabbar'

const queryParams = reactive({ name: '' })

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '名称', dataIndex: 'name', key: 'name', width: 80 },
  { title: '选中图标', dataIndex: 'selected', key: 'selected' },
  { title: '未选中图标', dataIndex: 'unselected', key: 'unselected' },
  { title: '跳转配置', dataIndex: 'link', key: 'link', ellipsis: true },
  { title: '显示', dataIndex: 'isShow', key: 'isShow', width: 60 },
  { title: '大按钮', dataIndex: 'isBig', key: 'isBig', width: 60 },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 60 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' }
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
const formData = reactive({
  id: undefined as number | undefined,
  name: '',
  selected: '',
  unselected: '',
  link: '',
  isShow: 1,
  isBig: 0,
  bigIcon: '',
  bigType: 'jump',
  bigPosition: 2,
  bigList: '',
  sort: 0
})
const formRules = {
  name: [{ required: true, message: '请输入名称' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getTabbarList({})
    console.log('Tabbar数据:', res)
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
  queryParams.name = ''
  loadData()
}

const handleAdd = () => {
  modalType.value = 'add'
  modalTitle.value = '新增导航'
  formData.id = undefined
  formData.name = ''
  formData.selected = ''
  formData.unselected = ''
  formData.link = ''
  formData.isShow = 1
  formData.isBig = 0
  formData.bigIcon = ''
  formData.bigType = 'jump'
  formData.bigPosition = 2
  formData.bigList = ''
  formData.sort = 0
  modalVisible.value = true
}

const handleEdit = (record: any) => {
  modalType.value = 'edit'
  modalTitle.value = '编辑导航'
  formData.id = record.id
  formData.name = record.name
  formData.selected = record.selected || ''
  formData.unselected = record.unselected || ''
  formData.link = record.link || ''
  formData.isShow = record.isShow ?? 1
  formData.isBig = record.isBig ?? 0
  formData.bigIcon = record.bigIcon || ''
  formData.bigType = record.bigType || 'jump'
  formData.bigPosition = record.bigPosition ?? 2
  formData.bigList = record.bigList || ''
  formData.sort = record.sort ?? 0
  modalVisible.value = true
}

const handleDelete = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除导航 "${record.name}" 吗？`,
    onOk: async () => {
      try {
        await deleteTabbar(record.id)
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
      await addTabbar(formData)
      message.success('新增成功')
    } else {
      await updateTabbar(formData)
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
.tabbar-container {
  .search-form { margin-bottom: 16px; }
  .table-wrapper { .table-toolbar { margin-bottom: 16px; } }
}
</style>