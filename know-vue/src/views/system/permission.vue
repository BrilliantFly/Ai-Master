<template>
  <div class="permission-container">
    <!-- 搜索区域 -->
    <a-card :bordered="false" class="search-form">
      <a-form :model="queryParams" layout="inline">
        <a-form-item label="权限名称">
          <a-input v-model:value="queryParams.name" placeholder="请输入权限名称" allow-clear />
        </a-form-item>
        <a-form-item label="权限编码">
          <a-input v-model:value="queryParams.code" placeholder="请输入权限编码" allow-clear />
        </a-form-item>
        <a-form-item label="权限类型">
          <a-select v-model:value="queryParams.permissionType" placeholder="请选择权限类型" allow-clear style="width: 120px">
            <a-select-option value="button">按钮</a-select-option>
            <a-select-option value="api">接口</a-select-option>
            <a-select-option value="data">数据</a-select-option>
            <a-select-option value="menu">菜单</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="queryParams.status" placeholder="请选择状态" allow-clear style="width: 120px">
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
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
        <a-button danger :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">
          <template #icon><DeleteOutlined /></template>
          批量删除
        </a-button>
      </a-space>

      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'permissionType'">
            <a-tag :color="getPermissionTypeColor(record.permissionType)">
              {{ getPermissionTypeName(record.permissionType) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'resourceType'">
            <a-tag>{{ getResourceTypeName(record.resourceType) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" size="small" @click="handleAddChild(record)">新增子权限</a-button>
              <a-button type="link" danger size="small" @click="handleDelete(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="600px"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :label-col="{ span: 6 }"
        :rules="formRules"
      >
        <a-form-item label="父级权限" name="parentId">
          <a-tree-select
            v-model:value="formData.parentId"
            :tree-data="treeData"
            :replace-keys="{ title: 'name', value: 'id', key: 'id' }"
            placeholder="请选择父级权限"
            allow-clear
            tree-default-expand-all
          />
        </a-form-item>
        <a-form-item label="权限名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入权限名称" />
        </a-form-item>
        <a-form-item label="权限编码" name="code">
          <a-input v-model:value="formData.code" :disabled="modalType === 'edit'" placeholder="请输入权限编码，如 system:user:add" />
        </a-form-item>
        <a-form-item label="权限类型" name="permissionType">
          <a-select v-model:value="formData.permissionType" placeholder="请选择权限类型">
            <a-select-option value="button">按钮</a-select-option>
            <a-select-option value="api">接口</a-select-option>
            <a-select-option value="data">数据</a-select-option>
            <a-select-option value="menu">菜单</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="资源类型" name="resourceType">
          <a-select v-model:value="formData.resourceType" placeholder="请选择资源类型">
            <a-select-option value="button">按钮</a-select-option>
            <a-select-option value="menu">菜单</a-select-option>
            <a-select-option value="api">接口</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="路由路径" name="path">
          <a-input v-model:value="formData.path" placeholder="请输入路由/接口路径" />
        </a-form-item>
        <a-form-item label="前端组件" name="component">
          <a-input v-model:value="formData.component" placeholder="请输入前端组件路径" />
        </a-form-item>
        <a-form-item label="图标" name="icon">
          <a-input v-model:value="formData.icon" placeholder="请输入图标" />
        </a-form-item>
        <a-form-item label="排序" name="sort">
          <a-input-number v-model:value="formData.sort" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select v-model:value="formData.status" placeholder="请选择状态">
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { getPermissionList, getPermissionTree, addPermission, updatePermission, deletePermission } from '@/api/system/permission'

// 查询参数
const queryParams = reactive({
  name: '',
  code: '',
  permissionType: undefined as string | undefined,
  status: undefined as number | undefined
})

// 表格列定义
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '权限名称', dataIndex: 'name', key: 'name' },
  { title: '权限编码', dataIndex: 'code', key: 'code' },
  { title: '权限类型', key: 'permissionType', width: 100 },
  { title: '资源类型', key: 'resourceType', width: 100 },
  { title: '路由路径', dataIndex: 'path', key: 'path' },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 220, fixed: 'right' }
]

// 数据源
const dataSource = ref<any[]>([])
const treeData = ref<any[]>([])
const loading = ref(false)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 选中行
const selectedRowKeys = ref<number[]>([])

// 弹窗
const modalVisible = ref(false)
const modalType = ref<'add' | 'edit'>('add')
const modalTitle = ref('')

const formRef = ref()
const formData = reactive({
  id: undefined as number | undefined,
  parentId: 0,
  name: '',
  code: '',
  permissionType: 'button',
  resourceType: 'button',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  status: 1
})

// 表单校验规则
const formRules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限编码', trigger: 'blur' }],
  permissionType: [{ required: true, message: '请选择权限类型', trigger: 'change' }]
}

// 权限类型颜色
const getPermissionTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    button: 'blue',
    api: 'green',
    data: 'orange',
    menu: 'purple'
  }
  return colorMap[type] || 'default'
}

// 权限类型名称
const getPermissionTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    button: '按钮',
    api: '接口',
    data: '数据',
    menu: '菜单'
  }
  return nameMap[type] || type
}

// 资源类型名称
const getResourceTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    button: '按钮',
    menu: '菜单',
    api: '接口'
  }
  return nameMap[type] || type
}

// 查询
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  queryParams.name = ''
  queryParams.code = ''
  queryParams.permissionType = undefined
  queryParams.status = undefined
  handleSearch()
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getPermissionList({
      ...queryParams,
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    })
    if (res.result) {
      dataSource.value = res.result.records || []
      pagination.total = res.result.total || 0
    }
  } finally {
    loading.value = false
  }
}

// 加载树数据
const loadTreeData = async () => {
  try {
    const res = await getPermissionTree()
    if (res.result) {
      treeData.value = [{ id: 0, name: '顶级权限', children: res.result }] as any[]
    }
  } catch (e) {
    console.error(e)
  }
}

// 表格变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 行选择
const onSelectChange = (keys: number[]) => {
  selectedRowKeys.value = keys
}

// 新增
const handleAdd = () => {
  modalType.value = 'add'
  modalTitle.value = '新增权限'
  Object.assign(formData, {
    id: undefined,
    parentId: 0,
    name: '',
    code: '',
    permissionType: 'button',
    resourceType: 'button',
    path: '',
    component: '',
    icon: '',
    sort: 0,
    status: 1
  })
  modalVisible.value = true
}

// 新增子权限
const handleAddChild = (record: any) => {
  modalType.value = 'add'
  modalTitle.value = '新增子权限'
  Object.assign(formData, {
    id: undefined,
    parentId: record.id,
    name: '',
    code: record.code + ':',
    permissionType: 'button',
    resourceType: 'button',
    path: '',
    component: '',
    icon: '',
    sort: 0,
    status: 1
  })
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: any) => {
  modalType.value = 'edit'
  modalTitle.value = '编辑权限'
  Object.assign(formData, record)
  modalVisible.value = true
}

// 删除
const handleDelete = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除权限「${record.name}」吗？`,
    onOk: async () => {
      try {
        const res = await deletePermission(record.id)
        if (res.success) {
          message.success('删除成功')
          loadData()
        }
      } catch (e) {
        console.error(e)
      }
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) return
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条权限吗？`,
    onOk: async () => {
      try {
        for (const id of selectedRowKeys.value) {
          await deletePermission(id)
        }
        message.success('删除成功')
        selectedRowKeys.value = []
        loadData()
      } catch (e) {
        console.error(e)
      }
    }
  })
}

// 弹窗确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    if (modalType.value === 'add') {
      const res = await addPermission(formData)
      if (res.success) {
        message.success('新增成功')
        modalVisible.value = false
        loadData()
        loadTreeData()
      }
    } else {
      const res = await updatePermission(formData)
      if (res.success) {
        message.success('修改成功')
        modalVisible.value = false
        loadData()
        loadTreeData()
      }
    }
  } catch (e) {
    console.error(e)
  }
}

// 弹窗取消
const handleModalCancel = () => {
  formRef.value?.resetFields()
}

onMounted(() => {
  loadData()
  loadTreeData()
})
</script>

<style scoped lang="less">
.permission-container {
  .search-form {
    margin-bottom: 16px;
  }

  .table-wrapper {
    .table-toolbar {
      margin-bottom: 16px;
    }
  }
}
</style>