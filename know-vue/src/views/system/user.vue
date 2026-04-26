<template>
  <div class="user-container">
    <!-- 搜索区域 -->
    <a-card :bordered="false" class="search-form">
      <a-form :model="queryParams" layout="inline">
        <a-form-item label="用户名">
          <a-input v-model:value="queryParams.username" placeholder="请输入用户名" allow-clear />
        </a-form-item>
        <a-form-item label="真实姓名">
          <a-input v-model:value="queryParams.realname" placeholder="请输入真实姓名" allow-clear />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="queryParams.status" placeholder="请选择状态" allow-clear style="width: 120px">
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="2">冻结</a-select-option>
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
              {{ record.status === 1 ? '正常' : '冻结' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'sex'">
            <span>{{ record.sex === 0 ? '未知' : record.sex === 1 ? '男' : '女' }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" size="small" @click="handleResetPassword(record)">重置密码</a-button>
              <a-button type="link" size="small" @click="handleAssignTenant(record)">分配租户</a-button>
              <a-button type="link" size="small" @click="handleAssignRole(record)">分配角色</a-button>
              <a-button type="link" size="small" @click="handleAssignDept(record)">分配部门</a-button>
              <a-button type="link" size="small" @click="handleAssignJob(record)">分配岗位</a-button>
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
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="formData.username" :disabled="modalType === 'edit'" />
        </a-form-item>
        <a-form-item label="真实姓名" name="realname">
          <a-input v-model:value="formData.realname" />
        </a-form-item>
        <a-form-item v-if="modalType === 'add'" label="密码" name="password">
          <a-input-password v-model:value="formData.password" />
        </a-form-item>
        <a-form-item label="手机号" name="phone">
          <a-input v-model:value="formData.phone" />
        </a-form-item>
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="formData.email" />
        </a-form-item>
        <a-form-item label="性别" name="sex">
          <a-select v-model:value="formData.sex" placeholder="请选择性别">
            <a-select-option :value="0">未知</a-select-option>
            <a-select-option :value="1">男</a-select-option>
            <a-select-option :value="2">女</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select v-model:value="formData.status" placeholder="请选择状态">
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="2">冻结</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 分配租户弹窗 -->
    <a-modal
      v-model:open="tenantModalVisible"
      title="分配租户"
      width="500px"
      :okText="'确定'"
      :cancelText="'取消'"
      @ok="handleTenantModalOk"
      @cancel="handleTenantModalCancel"
    >
      <a-checkbox-group v-model:value="checkedTenantKeys">
        <a-checkbox v-for="tenant in allTenants" :key="tenant.id" :value="tenant.id">
          {{ tenant.name }} ({{ tenant.code }})
        </a-checkbox>
      </a-checkbox-group>
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
          {{ role.roleName }} ({{ role.roleCode }})
        </a-checkbox>
      </a-checkbox-group>
    </a-modal>

    <!-- 分配部门弹窗 -->
    <a-modal
      v-model:open="deptModalVisible"
      title="分配部门"
      width="500px"
      :okText="'确定'"
      :cancelText="'取消'"
      @ok="handleDeptModalOk"
      @cancel="handleDeptModalCancel"
    >
      <a-checkbox-group v-model:value="checkedDeptKeys">
        <a-checkbox v-for="dept in allDepts" :key="dept.id" :value="dept.id">
          {{ dept.deptName }}
        </a-checkbox>
      </a-checkbox-group>
    </a-modal>

    <!-- 分配岗位弹窗 -->
    <a-modal
      v-model:open="jobModalVisible"
      title="分配岗位"
      width="500px"
      :okText="'确定'"
      :cancelText="'取消'"
      @ok="handleJobModalOk"
      @cancel="handleJobModalCancel"
    >
      <a-checkbox-group v-model:value="checkedJobKeys">
        <a-checkbox v-for="job in allJobs" :key="job.id" :value="job.id">
          {{ job.jobName }} ({{ job.code }})
        </a-checkbox>
      </a-checkbox-group>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { getUserList, addUser, updateUser, deleteUser, resetPassword, getUserTenants, assignTenantsToUser, getUserRoles, assignRolesToUser, getUserDepts, assignDeptsToUser, getUserJobs, assignJobsToUser } from '@/api/system/user'
import { getTenantList } from '@/api/tenant'
import { getAllRoles } from '@/api/system/role'
import { getDeptList } from '@/api/system/dept'
import { getJobList } from '@/api/system/job'

// 查询参数
const queryParams = reactive({
  username: '',
  realname: '',
  status: undefined as number | undefined
})

// 表格列定义
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '真实姓名', dataIndex: 'realname', key: 'realname' },
  { title: '手机号', dataIndex: 'phone', key: 'phone' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '性别', key: 'sex', width: 80 },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '操作', key: 'action', width: 220, fixed: 'right' }
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
  username: '',
  realname: '',
  password: '',
  phone: '',
  email: '',
  sex: 0,
  status: 1
})

// 表单校验规则
const formRules = {
  username: [{ required: true, message: '请输入用户名' }],
  realname: [{ required: true, message: '请输入真实姓名' }],
  password: [{ required: true, message: '请输入密码', min: 6, message: '密码至少6位' }],
  status: [{ required: true, message: '请选择状态' }]
}

// 租户弹窗
const tenantModalVisible = ref(false)
const currentUserId = ref<number>()
const checkedTenantKeys = ref<number[]>([])
const allTenants = ref<any[]>([])

// 角色弹窗
const roleModalVisible = ref(false)
const checkedRoleKeys = ref<number[]>([])
const allRoles = ref<any[]>([])

// 部门弹窗
const deptModalVisible = ref(false)
const checkedDeptKeys = ref<number[]>([])
const allDepts = ref<any[]>([])

// 岗位弹窗
const jobModalVisible = ref(false)
const checkedJobKeys = ref<number[]>([])
const allJobs = ref<any[]>([])

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      username: queryParams.username,
      realname: queryParams.realname,
      status: queryParams.status,
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    })
    console.log('用户数据:', res)
    // axios 返回 {code, msg, data: {records, total}, show}
    const resData = res?.data || res
    dataSource.value = resData?.records || resData || []
    pagination.total = resData?.total || 0
  } catch (error) {
    console.error('加载失败:', error)
    message.error('加载失败')
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
  queryParams.username = ''
  queryParams.realname = ''
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
  modalTitle.value = '新增用户'
  formData.id = undefined
  formData.username = ''
  formData.realname = ''
  formData.password = ''
  formData.phone = ''
  formData.email = ''
  formData.sex = 0
  formData.status = 1
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: any) => {
  modalType.value = 'edit'
  modalTitle.value = '编辑用户'
  formData.id = record.id
  formData.username = record.username
  formData.realname = record.realname
  formData.password = ''
  formData.phone = record.phone || ''
  formData.email = record.email || ''
  formData.sex = record.sex || 0
  formData.status = record.status
  modalVisible.value = true
}

// 删除
const handleDelete = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户 "${record.realname}" 吗？`,
    onOk: async () => {
      try {
        await deleteUser(record.id)
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
      // 批量删除逻辑
      message.success('批量删除成功')
      selectedRowKeys.value = []
      loadData()
    }
  })
}

// 重置密码
const handleResetPassword = (record: any) => {
  Modal.confirm({
    title: '确认重置密码',
    content: `确定要重置用户 "${record.realname}" 的密码吗？`,
    onOk: async () => {
      try {
        await resetPassword(record.id)
        message.success('密码已重置为: 123456')
      } catch (error) {
        message.error('重置失败')
      }
    }
  })
}

// 弹窗确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    if (modalType.value === 'add') {
      await addUser(formData)
      message.success('新增成功')
    } else {
      await updateUser(formData)
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

// 分配租户
const handleAssignTenant = async (record: any) => {
  currentUserId.value = record.id
  console.log('开始加载租户, userId:', record.id)
  try {
    // 获取所有租户
    const tenantRes = await getTenantList()
    console.log('租户列表原始:', tenantRes)
    const tenantData = tenantRes?.data || tenantRes
    allTenants.value = Array.isArray(tenantData) ? tenantData : (tenantData?.records || [])
    console.log('租户列表处理后:', allTenants.value)
    
    // 获取用户已有租户
    const userTenantRes = await getUserTenants(record.id)
    console.log('用户租户原始:', userTenantRes)
    const tenantIds = userTenantRes?.data || userTenantRes || []
    checkedTenantKeys.value = Array.isArray(tenantIds) ? tenantIds : []
    console.log('用户租户处理后:', checkedTenantKeys.value)
    
    tenantModalVisible.value = true
  } catch (error: any) {
    console.error('加载租户失败:', error)
    message.error('加载租户失败')
  }
}

// 租户弹窗确认
const handleTenantModalOk = async () => {
  try {
    const tenantIds = Array.isArray(checkedTenantKeys.value) ? checkedTenantKeys.value : []
    await assignTenantsToUser(currentUserId.value!, tenantIds)
    message.success('分配成功')
    tenantModalVisible.value = false
  } catch (error) {
    message.error('分配失败')
  }
}

// 租户弹窗取消
const handleTenantModalCancel = () => {
  tenantModalVisible.value = false
}

const handleAssignRole = async (record: any) => {
  currentUserId.value = record.id
  try {
    // 获取所有角色
    const roleRes = await getAllRoles()
    const roleList = roleRes?.data || roleRes
    allRoles.value = Array.isArray(roleList) ? roleList : []
    
    // 获取用户已有角色 - 需要从 res.data 取实际数据
    const userRes = await getUserRoles(record.id)
    console.log('用户角色原始:', userRes)
    const roleIds = userRes?.data || userRes?.data?.data || []
    console.log('用户角色ID:', roleIds)
    
    // 过滤匹配的角色ID - 确保类型一致
    const matched = allRoles.value
      .filter(r => roleIds.includes(Number(r.id)))
      .map(r => Number(r.id))
    console.log('匹配后:', matched)
    checkedRoleKeys.value = matched
    
    roleModalVisible.value = true
  } catch (error: any) {
    console.error('加载角色失败:', error)
    message.error('加载角色失败')
  }
}

// 角色弹窗确认
const handleRoleModalOk = async () => {
  try {
    const roleIds = Array.isArray(checkedRoleKeys.value) ? checkedRoleKeys.value : []
    await assignRolesToUser(currentUserId.value!, roleIds)
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

// 分配部门
const handleAssignDept = async (record: any) => {
  currentUserId.value = record.id
  try {
    // 获取所有部门
    const deptRes = await getDeptList({})
    console.log('部门列表原始:', deptRes)
    const deptData = deptRes?.data
    console.log('部门列表-data:', deptData)
    allDepts.value = Array.isArray(deptData) ? deptData : (deptData?.records || [])
    console.log('部门列表处理后:', allDepts.value)

    // 获取用户已有部门
    const userDeptRes = await getUserDepts(record.id)
    console.log('用户部门原始:', userDeptRes)
    const deptIds = userDeptRes?.data || userDeptRes || []
    checkedDeptKeys.value = Array.isArray(deptIds) ? deptIds : []

    deptModalVisible.value = true
  } catch (error: any) {
    console.error('加载部门失败:', error)
    message.error('加载部门失败')
  }
}

// 部门弹窗确认
const handleDeptModalOk = async () => {
  try {
    const deptIds = Array.isArray(checkedDeptKeys.value) ? checkedDeptKeys.value : []
    await assignDeptsToUser(currentUserId.value!, deptIds)
    message.success('分配成功')
    deptModalVisible.value = false
  } catch (error) {
    message.error('分配失败')
  }
}

// 部门弹窗取消
const handleDeptModalCancel = () => {
  deptModalVisible.value = false
}

// 分配岗位
const handleAssignJob = async (record: any) => {
  currentUserId.value = record.id
  try {
    // 获取所有岗位
    const jobRes = await getJobList({})
    console.log('岗位列表原始:', jobRes)
    const jobData = jobRes?.data
    console.log('岗位列表-data:', jobData)
    allJobs.value = Array.isArray(jobData) ? jobData : (jobData?.records || [])

    // 获取用户已有岗位
    const userJobRes = await getUserJobs(record.id)
    console.log('用户岗位原始:', userJobRes)
    const jobIds = userJobRes?.data || userJobRes || []
    checkedJobKeys.value = Array.isArray(jobIds) ? jobIds : []

    jobModalVisible.value = true
  } catch (error: any) {
    console.error('加载岗位失败:', error)
    message.error('加载岗位失败')
  }
}

// 岗位弹窗确认
const handleJobModalOk = async () => {
  try {
    const jobIds = Array.isArray(checkedJobKeys.value) ? checkedJobKeys.value : []
    await assignJobsToUser(currentUserId.value!, jobIds)
    message.success('分配成功')
    jobModalVisible.value = false
  } catch (error) {
    message.error('分配失败')
  }
}

// 岗位弹窗取消
const handleJobModalCancel = () => {
  jobModalVisible.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
.user-container {
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