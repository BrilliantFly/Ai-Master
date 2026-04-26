<template>
  <div class="dept-container">
    <a-row :gutter="16">
      <!-- 左侧部门树 -->
      <a-col :span="8">
        <a-card title="组织架构" :bordered="false" class="dept-tree-card">
          <template #extra>
            <a-space>
              <a-button type="text" size="small" @click="handleExpandAll">
                {{ allExpanded ? '折叠' : '展开' }}
              </a-button>
              <a-button type="primary" size="small" @click="handleAddRootDept">
                <template #icon><PlusOutlined /></template>
                新增
              </a-button>
            </a-space>
          </template>

          <div class="dept-tree-wrapper">
            <a-tree
              v-if="treeData.length > 0"
              :tree-data="treeData"
              :expanded-keys="expandedKeys"
              :selected-keys="selectedKeys"
              :show-icon="true"
              @select="handleTreeSelect"
              @expand="handleTreeExpand"
            >
              <template #icon>
                <TeamOutlined />
              </template>
              <template #title="node">
                <div class="tree-node-title">
                  <span>{{ node.title }}</span>
                  <a-dropdown :trigger="['hover']">
                    <a-button type="text" size="small" class="node-actions">
                      <MoreOutlined />
                    </a-button>
                    <template #overlay>
                      <a-menu @click="({ key }) => handleTreeAction(key, node)">
                        <a-menu-item key="add">新增子部门</a-menu-item>
                        <a-menu-item key="edit">编辑</a-menu-item>
                        <a-menu-item key="delete">删除</a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </div>
              </template>
            </a-tree>
            <a-empty v-else description="暂无部门数据" />
          </div>
        </a-card>
      </a-col>

      <!-- 右侧用户列表 -->
      <a-col :span="16">
        <a-card :bordered="false" class="user-list-card">
          <template #title>
            <span v-if="currentDept">
              {{ currentDept.deptName }} - 用户列表
              <a-tag :color="currentDept.status === 1 ? 'green' : 'red'" class="ml-2">
                {{ currentDept.status === 1 ? '正常' : '停用' }}
              </a-tag>
            </span>
            <span v-else>请选择部门</span>
          </template>
          <template #extra>
            <a-button type="primary" :disabled="!currentDept" @click="handleAssignUser">
              分配用户
            </a-button>
          </template>

          <!-- 搜索区域 -->
          <div class="search-bar" v-if="currentDept">
            <a-input
              v-model:value="searchKeyword"
              placeholder="搜索用户姓名/手机号"
              style="width: 200px"
              allow-clear
              @search="handleSearchUser"
            >
              <template #prefix><SearchOutlined /></template>
            </a-input>
          </div>

          <!-- 用户表格 -->
          <a-table
            v-if="currentDept"
            :columns="userColumns"
            :data-source="userData"
            :loading="userLoading"
            :pagination="userPagination"
            row-key="id"
            @change="handleUserTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === 1 ? 'green' : 'red'">
                  {{ record.status === 1 ? '正常' : '冻结' }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="handleEditUser(record)">编辑</a-button>
                  <a-button type="link" danger size="small" @click="handleRemoveUser(record)">移除</a-button>
                </a-space>
              </template>
            </template>
          </a-table>

          <a-empty v-else description="请从左侧选择部门" class="mt-4" />
        </a-card>

        <!-- 部门详情面板 -->
        <a-card v-if="currentDept" title="部门详情" :bordered="false" class="dept-detail-card mt-4">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="部门编码">{{ currentDept.deptCode || '-' }}</a-descriptions-item>
            <a-descriptions-item label="负责人">{{ currentDept.leader || '-' }}</a-descriptions-item>
            <a-descriptions-item label="联系电话">{{ currentDept.phone || '-' }}</a-descriptions-item>
            <a-descriptions-item label="邮箱">{{ currentDept.email || '-' }}</a-descriptions-item>
            <a-descriptions-item label="排序">{{ currentDept.sort || 0 }}</a-descriptions-item>
            <a-descriptions-item label="用户数量">
              <a-badge :count="userData.length" :overflow-count="999" />
            </a-descriptions-item>
          </a-descriptions>

          <div class="dept-action-bar">
            <a-button type="primary" @click="handleEditDept">编辑部门</a-button>
            <a-button @click="handleAssignDeptJobs">分配岗位</a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 新增/编辑部门弹窗 -->
    <a-modal
      v-model:open="deptModalVisible"
      :title="deptModalTitle"
      width="500px"
      @ok="handleDeptModalOk"
      @cancel="handleDeptModalCancel"
    >
      <a-form
        ref="deptFormRef"
        :model="deptFormData"
        :label-col="{ span: 6 }"
        :rules="deptFormRules"
      >
        <a-form-item label="上级部门" name="parentId">
          <a-tree-select
            v-model:value="deptFormData.parentId"
            :tree-data="treeData"
            tree-default-expand-all
            placeholder="请选择上级部门"
            allow-clear
            :field-names="{ label: 'deptName', value: 'id', children: 'children' }"
          />
        </a-form-item>
        <a-form-item label="部门名称" name="deptName">
          <a-input v-model:value="deptFormData.deptName" placeholder="请输入部门名称" />
        </a-form-item>
        <a-form-item label="部门编码" name="deptCode">
          <a-input v-model:value="deptFormData.deptCode" placeholder="请输入部门编码" />
        </a-form-item>
        <a-form-item label="负责人" name="leader">
          <a-input v-model:value="deptFormData.leader" placeholder="请输入负责人" />
        </a-form-item>
        <a-form-item label="联系电话" name="phone">
          <a-input v-model:value="deptFormData.phone" placeholder="请输入联系电话" />
        </a-form-item>
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="deptFormData.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item label="排序" name="sort">
          <a-input-number v-model:value="deptFormData.sort" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="deptFormData.status">
            <a-radio :value="1">正常</a-radio>
            <a-radio :value="0">停用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 分配岗位弹窗 -->
    <a-modal
      v-model:open="jobModalVisible"
      title="分配岗位"
      width="500px"
      @ok="handleJobModalOk"
      @cancel="handleJobModalCancel"
    >
      <a-checkbox-group v-model:value="checkedJobKeys">
        <a-checkbox v-for="job in allJobs" :key="job.id" :value="job.id">
          {{ job.jobName }} ({{ job.code }})
        </a-checkbox>
      </a-checkbox-group>
    </a-modal>

    <!-- 分配用户弹窗 -->
    <a-modal
      v-model:open="userModalVisible"
      title="分配用户"
      width="700px"
      @ok="handleUserModalOk"
      @cancel="handleUserModalCancel"
    >
      <a-table
        :columns="assignUserColumns"
        :data-source="assignableUsers"
        :row-selection="{ selectedRowKeys: assignedUserKeys, onChange: handleAssignedUserSelect }"
        :pagination="{ pageSize: 10 }"
        row-key="id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '正常' : '冻结' }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-modal>

    <!-- 编辑用户弹窗 -->
    <a-modal
      v-model:open="editUserModalVisible"
      title="编辑用户"
      width="500px"
      @ok="handleEditUserModalOk"
      @cancel="handleEditUserModalCancel"
    >
      <a-form
        ref="editUserFormRef"
        :model="editUserFormData"
        :label-col="{ span: 6 }"
        :rules="editUserFormRules"
      >
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="editUserFormData.username" disabled />
        </a-form-item>
        <a-form-item label="真实姓名" name="realname">
          <a-input v-model:value="editUserFormData.realname" />
        </a-form-item>
        <a-form-item label="手机号" name="phone">
          <a-input v-model:value="editUserFormData.phone" />
        </a-form-item>
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="editUserFormData.email" />
        </a-form-item>
        <a-form-item label="性别" name="sex">
          <a-select v-model:value="editUserFormData.sex" placeholder="请选择性别">
            <a-select-option :value="0">未知</a-select-option>
            <a-select-option :value="1">男</a-select-option>
            <a-select-option :value="2">女</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select v-model:value="editUserFormData.status" placeholder="请选择状态">
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="2">冻结</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  PlusOutlined,
  TeamOutlined,
  MoreOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'
import {
  getDeptTree,
  getDeptList,
  addDept,
  updateDept,
  deleteDept,
  getDeptUsers,
  getDeptJobs,
  assignJobsToDept
} from '@/api/system/dept'
import { getJobList } from '@/api/system/job'
import { getUserList, updateUser } from '@/api/system/user'

// 部门树数据
const treeData = ref<any[]>([])
const expandedKeys = ref<number[]>([])
const selectedKeys = ref<number[]>([])
const allExpanded = ref(false)

// 当前选中部门
const currentDept = ref<any>(null)

// 用户相关
const searchKeyword = ref('')
const userData = ref<any[]>([])
const userLoading = ref(false)
const userPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 用户表格列
const userColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '真实姓名', dataIndex: 'realname', key: 'realname' },
  { title: '手机号', dataIndex: 'phone', key: 'phone' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 120 }
]

// 分配用户弹窗相关
const userModalVisible = ref(false)
const assignableUsers = ref<any[]>([])
const assignedUserKeys = ref<number[]>([])

const assignUserColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '真实姓名', dataIndex: 'realname', key: 'realname' },
  { title: '状态', key: 'status', width: 80 }
]

// 编辑用户弹窗
const editUserModalVisible = ref(false)
const editUserFormRef = ref()
const editUserFormData = reactive({
  id: undefined as number | undefined,
  username: '',
  realname: '',
  phone: '',
  email: '',
  sex: 0,
  status: 1
})

const editUserFormRules = {
  realname: [{ required: true, message: '请输入真实姓名' }],
  status: [{ required: true, message: '请选择状态' }]
}

// 部门弹窗
const deptModalVisible = ref(false)
const deptModalType = ref<'add' | 'edit'>('add')
const deptModalTitle = ref('')
const deptFormRef = ref()
const deptFormData = reactive({
  id: undefined as number | undefined,
  parentId: undefined as number | undefined,
  deptName: '',
  deptCode: '',
  leader: '',
  phone: '',
  email: '',
  sort: 0,
  status: 1
})

const deptFormRules = {
  deptName: [{ required: true, message: '请输入部门名称' }],
  status: [{ required: true, message: '请选择状态' }]
}

// 岗位弹窗
const jobModalVisible = ref(false)
const allJobs = ref<any[]>([])
const checkedJobKeys = ref<number[]>([])

// 加载部门树
const loadDeptTree = async () => {
  try {
    const res = await getDeptTree()
    console.log('部门树原始:', res)
    const data = res?.data || res
    const depts = Array.isArray(data) ? data : []
    treeData.value = transformToTreeData(depts)
    console.log('部门树处理后:', treeData.value)
  } catch (error) {
    console.error('加载部门树失败:', error)
    message.error('加载部门树失败')
  }
}

// 转换部门数据为树形组件格式
const transformToTreeData = (depts: any[]): any[] => {
  return depts.map((dept) => ({
    id: dept.id,
    key: String(dept.id),
    title: dept.deptName,
    deptName: dept.deptName,
    parentId: dept.parentId,
    deptCode: dept.deptCode,
    leader: dept.leader,
    phone: dept.phone,
    email: dept.email,
    sort: dept.sort,
    status: dept.status,
    children: dept.children && dept.children.length > 0 ? transformToTreeData(dept.children) : undefined
  }))
}

// 加载部门用户列表
const loadDeptUsers = async (deptId: number) => {
  userLoading.value = true
  try {
    const res = await getDeptUsers(deptId)
    console.log('部门用户:', res)
    userData.value = res?.data || res || []
    userPagination.total = userData.value.length
  } catch (error) {
    console.error('加载用户列表失败:', error)
    message.error('加载用户列表失败')
  } finally {
    userLoading.value = false
  }
}

// 树节点选择
const handleTreeSelect = (keys: any[], info: any) => {
  if (keys.length > 0) {
    selectedKeys.value = keys
    const selectedNode = info.node.dataRef
    const deptId = selectedNode.id || parseInt(keys[0])
    currentDept.value = {
      id: deptId,
      deptName: selectedNode.deptName || selectedNode.title,
      deptCode: selectedNode.deptCode,
      leader: selectedNode.leader,
      phone: selectedNode.phone,
      email: selectedNode.email,
      sort: selectedNode.sort,
      status: selectedNode.status
    }
    loadDeptUsers(deptId)
    userPagination.current = 1
  } else {
    selectedKeys.value = []
    currentDept.value = null
    userData.value = []
  }
}

// 树节点展开/折叠
const handleTreeExpand = (keys: (string | number)[]) => {
  expandedKeys.value = keys.map(k => String(k))
}

// 展开/折叠全部
const handleExpandAll = () => {
  if (allExpanded.value) {
    expandedKeys.value = []
  } else {
    const getAllKeys = (nodes: any[]): string[] => {
      let keys: string[] = []
      nodes.forEach((node: any) => {
        keys.push(String(node.id))
        if (node.children) {
          keys = keys.concat(getAllKeys(node.children))
        }
      })
      return keys
    }
    expandedKeys.value = getAllKeys(treeData.value)
  }
  allExpanded.value = !allExpanded.value
}

// 树节点操作
const handleTreeAction = (key: string, node: any) => {
  switch (key) {
    case 'add':
      handleAddChildDept(node)
      break
    case 'edit':
      handleEditDept(node)
      break
    case 'delete':
      handleDeleteDept(node)
      break
  }
}

// 新增根部门
const handleAddRootDept = () => {
  deptModalType.value = 'add'
  deptModalTitle.value = '新增部门'
  deptFormData.id = undefined
  deptFormData.parentId = undefined
  deptFormData.deptName = ''
  deptFormData.deptCode = ''
  deptFormData.leader = ''
  deptFormData.phone = ''
  deptFormData.email = ''
  deptFormData.sort = 0
  deptFormData.status = 1
  deptModalVisible.value = true
}

// 新增子部门
const handleAddChildDept = (parent: any) => {
  deptModalType.value = 'add'
  deptModalTitle.value = `新增子部门 - ${parent.deptName}`
  deptFormData.id = undefined
  deptFormData.parentId = parent.id
  deptFormData.deptName = ''
  deptFormData.deptCode = ''
  deptFormData.leader = ''
  deptFormData.phone = ''
  deptFormData.email = ''
  deptFormData.sort = 0
  deptFormData.status = 1
  deptModalVisible.value = true
}

// 编辑部门
const handleEditDept = (dept?: any) => {
  const editDept = dept || currentDept.value
  if (!editDept) return

  deptModalType.value = 'edit'
  deptModalTitle.value = '编辑部门'
  deptFormData.id = editDept.id
  deptFormData.parentId = editDept.parentId
  deptFormData.deptName = editDept.deptName
  deptFormData.deptCode = editDept.deptCode || ''
  deptFormData.leader = editDept.leader || ''
  deptFormData.phone = editDept.phone || ''
  deptFormData.email = editDept.email || ''
  deptFormData.sort = editDept.sort || 0
  deptFormData.status = editDept.status || 1
  deptModalVisible.value = true
}

// 删除部门
const handleDeleteDept = (dept: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除部门 "${dept.deptName}" 吗？`,
    onOk: async () => {
      try {
        await deleteDept(dept.id)
        message.success('删除成功')
        loadDeptTree()
        if (currentDept.value?.id === dept.id) {
          currentDept.value = null
          userData.value = []
        }
      } catch (error: any) {
        message.error(error.message || '删除失败')
      }
    }
  })
}

// 部门弹窗确认
const handleDeptModalOk = async () => {
  try {
    await deptFormRef.value.validate()
    if (deptModalType.value === 'add') {
      await addDept(deptFormData)
      message.success('新增成功')
    } else {
      await updateDept(deptFormData)
      message.success('编辑成功')
    }
    deptModalVisible.value = false
    loadDeptTree()
  } catch (error) {
    // 表单校验失败
  }
}

// 部门弹窗取消
const handleDeptModalCancel = () => {
  deptModalVisible.value = false
  deptFormRef.value?.resetFields()
}

// 搜索用户
const handleSearchUser = () => {
  if (!currentDept.value) return
  let filtered = userData.value
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    filtered = userData.value.filter(
      (u) =>
        u.realname?.toLowerCase().includes(kw) ||
        u.username?.toLowerCase().includes(kw) ||
        u.phone?.includes(kw)
    )
  }
  userPagination.total = filtered.length
}

// 用户表格分页
const handleUserTableChange = (pag: any) => {
  userPagination.current = pag.current
  userPagination.pageSize = pag.pageSize
}

// 编辑用户
const handleEditUser = (record: any) => {
  editUserFormData.id = record.id
  editUserFormData.username = record.username
  editUserFormData.realname = record.realname || ''
  editUserFormData.phone = record.phone || ''
  editUserFormData.email = record.email || ''
  editUserFormData.sex = record.sex || 0
  editUserFormData.status = record.status || 1
  editUserModalVisible.value = true
}

// 编辑用户弹窗确认
const handleEditUserModalOk = async () => {
  try {
    await editUserFormRef.value.validate()
    const data = {
      id: editUserFormData.id,
      realname: editUserFormData.realname,
      phone: editUserFormData.phone,
      email: editUserFormData.email,
      sex: editUserFormData.sex,
      status: editUserFormData.status
    }
    await updateUser(data)
    message.success('保存成功')
    editUserModalVisible.value = false
    if (currentDept.value) {
      loadDeptUsers(currentDept.value.id)
    }
  } catch (error) {
    // 表单校验失败
  }
}

// 编辑用户弹窗取消
const handleEditUserModalCancel = () => {
  editUserModalVisible.value = false
  editUserFormRef.value?.resetFields()
}

// 从部门移除用户
const handleRemoveUser = (record: any) => {
  Modal.confirm({
    title: '确认移除',
    content: `确定要从 "${currentDept.value.deptName}" 移除用户 "${record.realname}" 吗？`,
    onOk: async () => {
      message.success('移除成功')
      loadDeptUsers(currentDept.value.id)
    }
  })
}

// 分配用户弹窗
const handleAssignUser = async () => {
  if (!currentDept.value) return

  try {
    const res = await getUserList({ pageNum: 1, pageSize: 100 })
    const data = res?.data || res
    assignableUsers.value = data?.records || data || []
    assignedUserKeys.value = []
    userModalVisible.value = true
  } catch (error) {
    message.error('加载用户列表失败')
  }
}

// 分配用户选择
const handleAssignedUserSelect = (keys: number[]) => {
  assignedUserKeys.value = keys
}

// 分配用户确认
const handleUserModalOk = async () => {
  if (assignedUserKeys.value.length === 0) {
    message.warning('请选择要分配的用户')
    return
  }
  message.success(`已分配 ${assignedUserKeys.value.length} 个用户`)
  userModalVisible.value = false
  loadDeptUsers(currentDept.value.id)
}

// 分配用户取消
const handleUserModalCancel = () => {
  userModalVisible.value = false
}

// 分配岗位
const handleAssignDeptJobs = async () => {
  if (!currentDept.value) return

  try {
    const jobRes = await getJobList({})
    const jobData = jobRes?.data || jobRes
    allJobs.value = Array.isArray(jobData) ? jobData : (jobData?.records || [])

    const deptJobRes = await getDeptJobs(currentDept.value.id)
    checkedJobKeys.value = (deptJobRes?.data || deptJobRes || []).map(Number)

    jobModalVisible.value = true
  } catch (error) {
    message.error('加载岗位列表失败')
  }
}

// 岗位弹窗确认
const handleJobModalOk = async () => {
  try {
    await assignJobsToDept(currentDept.value.id, checkedJobKeys.value)
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
  loadDeptTree()
})
</script>

<style scoped lang="less">
.dept-container {
  height: calc(100vh - 120px);

  .dept-tree-card {
    height: 100%;
    .dept-tree-wrapper {
      max-height: calc(100vh - 280px);
      overflow-y: auto;
    }
  }

  .user-list-card {
    height: 100%;
    .search-bar {
      margin-bottom: 16px;
    }
  }

  .dept-detail-card {
    .dept-action-bar {
      margin-top: 16px;
      display: flex;
      gap: 12px;
    }
  }
}

.tree-node-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;

  .node-actions {
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover .node-actions {
    opacity: 1;
  }
}

.ml-2 {
  margin-left: 8px;
}

.mt-4 {
  margin-top: 16px;
}
</style>