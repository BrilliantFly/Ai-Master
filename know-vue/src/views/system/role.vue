<template>
  <div class="role-container">
    <!-- 搜索区域 -->
    <a-card :bordered="false" class="search-form">
      <a-form :model="queryParams" layout="inline">
        <a-form-item label="角色名称">
          <a-input v-model:value="queryParams.roleName" placeholder="请输入角色名称" allow-clear />
        </a-form-item>
        <a-form-item label="角色编码">
          <a-input v-model:value="queryParams.roleCode" placeholder="请输入角色编码" allow-clear />
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
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" size="small" @click="handleAssignMenu(record)">分配权限</a-button>
              <a-button type="link" size="small" @click="handleDataScope(record)">数据权限</a-button>
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
        <a-form-item label="角色名称" name="roleName">
          <a-input v-model:value="formData.roleName" placeholder="请输入角色名称" />
        </a-form-item>
        <a-form-item label="角色编码" name="roleCode">
          <a-input v-model:value="formData.roleCode" :disabled="modalType === 'edit'" placeholder="请输入角色编码" />
        </a-form-item>
        <a-form-item label="排序" name="sort">
          <a-input-number v-model:value="formData.sort" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select v-model:value="formData.status" placeholder="请选择状态">
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="0">停用</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 分配权限弹窗 -->
    <a-modal
      v-model:open="menuModalVisible"
      title="分配菜单权限"
      width="500px"
      @ok="handleMenuModalOk"
      @cancel="handleMenuModalCancel"
    >
      <a-tree
        v-model:checkedKeys="checkedMenuKeys"
        :tree-data="menuTreeData"
        checkable
        default-expand-all
      />
    </a-modal>

    <!-- 数据权限配置弹窗 -->
    <a-modal
      v-model:open="dataScopeModalVisible"
      title="配置数据权限"
      width="600px"
      @ok="handleDataScopeModalOk"
      @cancel="handleDataScopeModalCancel"
    >
      <a-form :label-col="{ span: 6 }">
        <a-form-item label="权限类型">
          <a-radio-group v-model:value="dataScopeType">
            <a-radio :value="1">全部数据权限</a-radio>
            <a-radio :value="2">本部门数据权限</a-radio>
            <a-radio :value="3">本部门及子部门</a-radio>
            <a-radio :value="4">仅本人数据权限</a-radio>
            <a-radio :value="5">自定义数据权限</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-show="dataScopeType === 5" label="选择部门">
          <a-tree
            v-model:checkedKeys="checkedDeptKeys"
            :tree-data="deptTreeData"
            checkable
            default-expand-all
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { getRoleList, addRole, updateRole, deleteRole, getRoleMenus, assignRoleMenus, getRoleDataScopeType, saveRoleDataScope } from '@/api/system/role'
import { getMenuList } from '@/api/system/menu'
import { getDeptList } from '@/api/system/dept'

// 查询参数
const queryParams = reactive({
  roleName: '',
  roleCode: '',
  status: undefined as number | undefined
})

// 表格列定义
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '角色名称', dataIndex: 'roleName', key: 'roleName' },
  { title: '角色编码', dataIndex: 'roleCode', key: 'roleCode' },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '状态', key: 'status', width: 80 },
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
  roleName: '',
  roleCode: '',
  sort: 0,
  status: 1
})

// 菜单弹窗
const menuModalVisible = ref(false)
const currentRoleId = ref<number>()
const checkedMenuKeys = ref<number[]>([])
const menuTreeData = ref<any[]>([])

// 数据权限弹窗
const dataScopeModalVisible = ref(false)
const dataScopeType = ref(1)
const customDeptIds = ref<number[]>([])
const deptTreeData = ref<any[]>([])
const checkedDeptKeys = ref<number[]>([])

// 数据权限类型选项
const dataScopeOptions = [
  { label: '全部数据权限', value: 1 },
  { label: '本部门数据权限', value: 2 },
  { label: '本部门及子部门', value: 3 },
  { label: '仅本人数据权限', value: 4 },
  { label: '自定义数据权限', value: 5 }
]

// 表单校验规则
const formRules = {
  roleName: [{ required: true, message: '请输入角色名称' }],
  roleCode: [{ required: true, message: '请输入角色编码' }]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getRoleList({
      roleName: queryParams.roleName,
      roleCode: queryParams.roleCode,
      status: queryParams.status,
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    })
    console.log('角色数据:', res)
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
  queryParams.roleName = ''
  queryParams.roleCode = ''
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
  modalTitle.value = '新增角色'
  formData.id = undefined
  formData.roleName = ''
  formData.roleCode = ''
  formData.sort = 0
  formData.status = 1
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: any) => {
  modalType.value = 'edit'
  modalTitle.value = '编辑角色'
  formData.id = record.id
  formData.roleName = record.roleName
  formData.roleCode = record.roleCode
  formData.sort = record.sort || 0
  formData.status = record.status
  modalVisible.value = true
}

// 删除
const handleDelete = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除角色 "${record.roleName}" 吗？`,
    onOk: async () => {
      try {
        await deleteRole(record.id)
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
      message.success('批量删除成功')
      selectedRowKeys.value = []
      loadData()
    }
  })
}

// 分配菜单权限
const handleAssignMenu = async (record: any) => {
  currentRoleId.value = record.id
  try {
    // 获取所有菜单并转换为树结构
    const menuRes = await getMenuList()
    console.log('菜单列表原始:', menuRes)
    const menus = menuRes?.data || []
    menuTreeData.value = buildMenuTree(menus)
    console.log('菜单树构建后:', menuTreeData.value, '菜单数:', menus.length)
    // 获取角色已有菜单
    const roleMenuRes = await getRoleMenus(record.id)
    console.log('角色菜单原始:', roleMenuRes)
    const menuIds = roleMenuRes?.data || roleMenuRes || []
    // 转换为数字类型确保匹配
    const menuIdNums = Array.isArray(menuIds) ? menuIds.map((id: any) => Number(id)) : []
    console.log('角色菜单ID:', menuIdNums)
    checkedMenuKeys.value = menuIdNums
    console.log('checkedMenuKeys 设置后:', checkedMenuKeys.value)
    menuModalVisible.value = true
  } catch (error) {
    console.error('加载菜单失败:', error)
    message.error('加载菜单失败')
  }
}

// 构建菜单树
const buildMenuTree = (menus: any[]): any[] => {
  const map = new Map<number, any>()
  const roots: any[] = []
  
  menus.forEach(menu => {
    map.set(menu.id, { ...menu, key: menu.id, title: menu.menuName, children: [] })
  })
  
  map.forEach(menu => {
    if (menu.parentId === 0 || !map.has(menu.parentId)) {
      roots.push(menu)
    } else {
      const parent = map.get(menu.parentId)
      if (parent) {
        parent.children.push(menu)
      }
    }
  })
  
  return roots
}

// 弹窗确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    if (modalType.value === 'add') {
      await addRole(formData)
      message.success('新增成功')
    } else {
      await updateRole(formData)
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

// 菜单弹窗确认
const handleMenuModalOk = async () => {
  try {
    await assignRoleMenus(currentRoleId.value!, checkedMenuKeys.value)
    message.success('分配成功')
    menuModalVisible.value = false
  } catch (error) {
    message.error('分配失败')
  }
}

// 菜单弹窗取消
const handleMenuModalCancel = () => {
  menuModalVisible.value = false
}

// ==================== 数据权限管理 ====================
// 数据权限配置
const handleDataScope = async (record: any) => {
  currentRoleId.value = record.id
  try {
    // 获取部门列表构建树
    const deptRes = await getDeptList()
    const depts = deptRes?.data || []
    deptTreeData.value = buildDeptTree(depts)

    console.log('=== 数据权限调试 ===')
    console.log('roleId:', record.id)
    
    // 获取角色的数据权限类型
    const typeRes = await getRoleDataScopeType(record.id)
    console.log('typeRes:', typeRes)
    dataScopeType.value = typeRes?.data ?? 1

    // 如果是自定义权限，获取已选部门
    if (dataScopeType.value === 5) {
      const scopeRes = await getRoleDataScope(record.id)
      console.log('scopeRes:', scopeRes)
      const scopeData = scopeRes?.data ?? []
      checkedDeptKeys.value = scopeData
        .filter((item: any) => item.deptId)
        .map((item: any) => String(item.deptId))
    } else {
      checkedDeptKeys.value = []
    }

    dataScopeModalVisible.value = true
  } catch (error) {
    console.error('加载数据权限失败:', error)
    message.error('加载数据权限失败')
  }
}

// 构建部门树
const buildDeptTree = (depts: any[]): any[] => {
  const map = new Map<number, any>()
  const roots: any[] = []

  depts.forEach(dept => {
    map.set(dept.id, { key: String(dept.id), title: dept.deptName, value: dept.id, children: [] })
  })

  map.forEach(dept => {
    if (dept.parentId === 0 || !map.has(dept.parentId)) {
      roots.push(dept)
    } else {
      const parent = map.get(dept.parentId)
      if (parent) {
        parent.children.push(dept)
      }
    }
  })

  return roots
}

// 数据权限弹窗确认
const handleDataScopeModalOk = async () => {
  try {
    const deptIds = dataScopeType.value === 5 ? checkedDeptKeys.value.map(Number) : undefined
    await saveRoleDataScope(currentRoleId.value!, dataScopeType.value, deptIds)
    message.success('保存成功')
    dataScopeModalVisible.value = false
  } catch (error) {
    message.error('保存失败')
  }
}

// 数据权限弹窗取消
const handleDataScopeModalCancel = () => {
  dataScopeModalVisible.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
.role-container {
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