<template>
  <div class="tenant-container">
    <!-- 搜索区域 -->
    <a-card :bordered="false" class="search-form">
      <a-form :model="queryParams" layout="inline">
        <a-form-item label="租户名称">
          <a-input v-model:value="queryParams.name" placeholder="请输入租户名称" allow-clear />
        </a-form-item>
        <a-form-item label="租户编码">
          <a-input v-model:value="queryParams.code" placeholder="请输入租户编码" allow-clear />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="queryParams.status" placeholder="请选择状态" allow-clear style="width: 120px">
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="0">停用</a-select-option>
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
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '正常' : '停用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'expireTime'">
            {{ formatDate(record.expireTime) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" size="small" @click="handleAssignRole(record)">分配角色</a-button>
              <a-button type="link" size="small" @click="handleAssignUser(record)">分配用户</a-button>
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
      :okText="'确定'"
      :cancelText="'取消'"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :label-col="{ span: 6 }"
        :rules="formRules"
      >
        <a-form-item label="租户名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入租户名称" />
        </a-form-item>
        <a-form-item label="租户编码" name="code">
          <a-input v-model:value="formData.code" :disabled="modalType === 'edit'" placeholder="请输入租户编码" />
        </a-form-item>
        <a-form-item label="过期时间" name="expireTime">
          <a-date-picker v-model:value="formData.expireTime" style="width: 100%" placeholder="选择过期时间" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select v-model:value="formData.status" placeholder="请选择状态">
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="0">停用</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 分配角色弹窗 -->
    <a-modal
      v-model:open="roleModalVisible"
      title="分配角色"
      width="500px"
      :okText="'确定'"
      :cancelText="'取消'"
      @ok="handleRoleModalOk"
      @cancel="handleRoleModalCancel"
    >
      <a-checkbox-group v-model:value="checkedRoleKeys">
        <a-checkbox v-for="role in allRoles" :key="role.id" :value="role.id">
          {{ role.roleName }}
        </a-checkbox>
      </a-checkbox-group>
    </a-modal>

    <!-- 分配用户弹窗 -->
    <a-modal
      v-model:open="userModalVisible"
      title="分配用户"
      width="500px"
      :okText="'确定'"
      :cancelText="'取消'"
      @ok="handleUserModalOk"
      @cancel="handleUserModalCancel"
    >
      <a-checkbox-group v-model:value="checkedUserKeys">
        <a-checkbox v-for="user in allUsers" :key="user.id" :value="user.id">
          {{ user.username }} ({{ user.realname }})
        </a-checkbox>
      </a-checkbox-group>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import dayjs from 'dayjs'
import { message, Modal } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { getTenantList, addTenant, updateTenant, deleteTenant, getTenantRoles, assignTenantRoles, getTenantUsers, assignUsersToTenant, getAllUsers as getAllUsersApi } from '@/api/tenant'
import { getAllRoles } from '@/api/system/role'

// 查询参数
const queryParams = reactive({
  name: '',
  code: '',
  status: undefined as number | undefined
})

// 表格列定义
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '租户名称', dataIndex: 'name', key: 'name' },
  { title: '租户编码', dataIndex: 'code', key: 'code' },
  { title: '状态', key: 'status', width: 80 },
  { title: '过期时间', dataIndex: 'expireTime', key: 'expireTime' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '操作', key: 'action', width: 250, fixed: 'right' }
]

// 数据源
const dataSource = ref<any[]>([])
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
  name: '',
  code: '',
  expireTime: null as any,
  status: 1
})

// 角色弹窗
const roleModalVisible = ref(false)
const currentTenantId = ref<number>()
const checkedRoleKeys = ref<number[]>([])
const allRoles = ref<any[]>([])

// 用户弹窗
const userModalVisible = ref(false)
const checkedUserKeys = ref<number[]>([])
const allUsers = ref<any[]>([])

// 表单校验规则
const formRules = {
  name: [{ required: true, message: '请输入租户名称' }],
  code: [{ required: true, message: '请输入租户编码' }]
}

// 格式化日期
const formatDate = (date: string) => {
  return date ? dayjs(date).format('YYYY-MM-DD') : '-'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getTenantList({
      name: queryParams.name,
      code: queryParams.code,
      status: queryParams.status,
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    })
    console.log('>>> 租户返回 res:', res, 'type:', typeof res)
    
    // axios 返回 {code, msg, data: {...}, show}，实际数据在 data
    const listData = res?.data || res
    if (Array.isArray(listData)) {
      dataSource.value = listData
      pagination.total = listData.length
    } else {
      dataSource.value = listData?.records || listData?.data || []
      pagination.total = listData?.total || 0
    }
    console.log('>>> 最终 dataSource:', dataSource.value)
  } catch (error: any) {
    console.error('>>> 错误:', error)
    message.error(error?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  queryParams.name = ''
  queryParams.code = ''
  queryParams.status = undefined
  handleSearch()
}

// 分页变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 选择变化
const onSelectChange = (keys: number[]) => {
  selectedRowKeys.value = keys
}

// 新增
const handleAdd = () => {
  modalType.value = 'add'
  modalTitle.value = '新增租户'
  formData.id = undefined
  formData.name = ''
  formData.code = ''
  formData.expireTime = null
  formData.status = 1
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: any) => {
  modalType.value = 'edit'
  modalTitle.value = '编辑租户'
  formData.id = record.id
  formData.name = record.name
  formData.code = record.code
  formData.expireTime = record.expireTime ? dayjs(record.expireTime) : null
  formData.status = record.status
  modalVisible.value = true
}

// 删除
const handleDelete = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除租户 "${record.name}" 吗？`,
    onOk: async () => {
      try {
        await deleteTenant(record.id)
        message.success('删除成功')
        loadData()
      } catch (error) {
        message.error('删除失败')
      }
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) return
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条记录吗？`,
    onOk: async () => {
      for (const id of selectedRowKeys.value) {
        await deleteTenant(id)
      }
      message.success('批量删除成功')
      selectedRowKeys.value = []
      loadData()
    }
  })
}

// 分配角色
const handleAssignRole = async (record: any) => {
  currentTenantId.value = record.id
  console.log('开始加载角色, tenantId:', record.id)
  try {
    // 获取所有角色
    const roleRes = await getAllRoles()
    console.log('角色列表原始:', roleRes)
    const roleData = roleRes?.data || roleRes
    allRoles.value = Array.isArray(roleData) ? roleData : (roleData?.records || [])
    console.log('角色列表处理后:', allRoles.value)
    
    // 获取租户已有角色
    const tenantRoleRes = await getTenantRoles(record.id)
    console.log('租户角色原始:', tenantRoleRes)
    const roleIds = tenantRoleRes?.data || tenantRoleRes || []
    checkedRoleKeys.value = Array.isArray(roleIds) ? roleIds : (roleIds?.records || [])
    console.log('租户角色处理后:', checkedRoleKeys.value)
    
    roleModalVisible.value = true
  } catch (error: any) {
    console.error('加载角色失败:', error)
    message.error('加载角色失败')
  }
}

// 弹窗确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    const submitData = {
      ...formData,
      expireTime: formData.expireTime ? formData.expireTime.format('YYYY-MM-DD') : null
    }
    if (modalType.value === 'add') {
      await addTenant(submitData)
      message.success('新增成功')
    } else {
      await updateTenant(submitData)
      message.success('编辑成功')
    }
    modalVisible.value = false
    loadData()
  } catch (error) {
    // 表单校验失败
  }
}

// 弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
}

// 角色弹窗确认
const handleRoleModalOk = async () => {
  try {
    const roleIds = Array.isArray(checkedRoleKeys.value) ? checkedRoleKeys.value : []
    await assignTenantRoles(currentTenantId.value!, roleIds)
    message.success('分配成功')
    roleModalVisible.value = false
  } catch (error) {
    message.error('分配失败')
  }
}

// 角色弹窗取消
const handleRoleModalCancel = () => {
  roleModalVisible.value = false
}

// 分配用户
const handleAssignUser = async (record: any) => {
  currentTenantId.value = record.id
  console.log('开始加载用户, tenantId:', record.id)
  try {
    // 获取所有用户
    const userRes = await getAllUsersApi()
    console.log('用户列表原始:', userRes)
    const userData = userRes?.data || userRes
    allUsers.value = userData?.records || (Array.isArray(userData) ? userData : [])
    console.log('用户列表处理后:', allUsers.value)
    
    // 获取租户已有用户
    const tenantUserRes = await getTenantUsers(record.id)
    console.log('租户用户原始:', tenantUserRes)
    const userIds = tenantUserRes?.data || tenantUserRes || []
    checkedUserKeys.value = Array.isArray(userIds) ? userIds : []
    console.log('租户用户处理后:', checkedUserKeys.value)
    
    userModalVisible.value = true
  } catch (error: any) {
    console.error('加载用户失败:', error)
    message.error('加载用户失败')
  }
}

// 用户弹窗确认
const handleUserModalOk = async () => {
  try {
    const userIds = Array.isArray(checkedUserKeys.value) ? checkedUserKeys.value : []
    await assignUsersToTenant(currentTenantId.value!, userIds)
    message.success('分配成功')
    userModalVisible.value = false
  } catch (error) {
    message.error('分配失败')
  }
}

// 用户弹窗取消
const handleUserModalCancel = () => {
  userModalVisible.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
.tenant-container {
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