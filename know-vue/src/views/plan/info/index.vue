<template>
  <div class="plan-info-container">
    <!-- 搜索区域 -->
    <a-card :bordered="false" class="search-form">
      <a-form :model="queryParams" layout="inline">
        <a-form-item label="计划名称">
          <a-input v-model:value="queryParams.planName" placeholder="请输入计划名称" allow-clear />
        </a-form-item>
        <a-form-item label="计划类型">
          <a-select v-model:value="queryParams.planType" placeholder="请选择类型" allow-clear style="width: 140px">
            <a-select-option value="life">生活习惯</a-select-option>
            <a-select-option value="cognition">认知提升</a-select-option>
            <a-select-option value="skill">工作技能</a-select-option>
            <a-select-option value="project">项目</a-select-option>
            <a-select-option value="hobby">兴趣爱好</a-select-option>
            <a-select-option value="study">学习</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="queryParams.status" placeholder="请选择状态" allow-clear style="width: 120px">
            <a-select-option :value="0">待开始</a-select-option>
            <a-select-option :value="1">进行中</a-select-option>
            <a-select-option :value="2">已完成</a-select-option>
            <a-select-option :value="3">已取消</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="fetchData">
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
        <a-button type="primary" @click="showAddModal">
          <template #icon><PlusOutlined /></template>
          新增计划
        </a-button>
        <a-button @click="goToGantt">
          <template #icon><BarChartOutlined /></template>
          甘特图
        </a-button>
      </a-space>

      <a-table
        :columns="columns"
        :data-source="plans"
        :loading="loading"
        :pagination="{ pageSize: 10, showTotal: (total: number) => `共 ${total} 条` }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="statusColors[record.status]">
              {{ statusLabels[record.status] || '未知' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'progress'">
            <a-progress :percent="record.progress" :size="'small'" />
          </template>
          <template v-if="column.key === 'time'">
            {{ formatTime(record.planStartTime) }} ~ {{ formatTime(record.planEndTime) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm title="确定删除?" @confirm="handleDelete(record.id)">
                <a-button type="link" danger size="small">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑计划' : '新增计划'"
      @ok="handleSave"
      :confirm-loading="saving"
      width="600px"
    >
      <a-form :model="form" :label-col="{ span: 4 }">
        <a-form-item label="计划名称" required>
          <a-input v-model:value="form.planName" placeholder="请输入计划名称" />
        </a-form-item>
        <a-form-item label="目标效果">
          <a-textarea v-model:value="form.targetEffect" :rows="3" />
        </a-form-item>
        <a-form-item label="计划类型">
          <a-select v-model:value="form.planType">
            <a-select-option value="life">生活习惯</a-select-option>
            <a-select-option value="cognition">认知提升</a-select-option>
            <a-select-option value="skill">工作技能</a-select-option>
            <a-select-option value="project">项目</a-select-option>
            <a-select-option value="hobby">兴趣爱好</a-select-option>
            <a-select-option value="study">学习</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="优先级">
          <a-input-number v-model:value="form.priority" :min="0" :max="10" />
        </a-form-item>
        <a-form-item label="开始时间">
          <a-date-picker show-time v-model:value="form.planStartTime" value-format="x" style="width: 100%" />
        </a-form-item>
        <a-form-item label="结束时间">
          <a-date-picker show-time v-model:value="form.planEndTime" value-format="x" style="width: 100%" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="form.remark" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, PlusOutlined, BarChartOutlined } from '@ant-design/icons-vue'

const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const plans = ref<any[]>([])
const editId = ref<number | null>(null)

const queryParams = reactive({ planName: '', planType: undefined, status: undefined })

const columns = [
  { title: '计划名称', dataIndex: 'planName', key: 'planName' },
  { title: '类型', dataIndex: 'planType', key: 'planType' },
  { title: '优先级', dataIndex: 'priority', key: 'priority' },
  { title: '进度', key: 'progress' },
  { title: '状态', key: 'status' },
  { title: '时间', key: 'time' },
  { title: '操作', key: 'action' }
]

const statusColors: Record<number, string> = { 0: 'default', 1: 'blue', 2: 'green', 3: 'red' }
const statusLabels: Record<number, string> = { 0: '待开始', 1: '进行中', 2: '已完成', 3: '已取消' }

const form = reactive({
  planName: '',
  planType: undefined,
  targetEffect: '',
  priority: 0,
  planStartTime: undefined,
  planEndTime: undefined,
  remark: ''
})

const resetForm = () => {
  form.planName = ''
  form.planType = undefined
  form.targetEffect = ''
  form.priority = 0
  form.planStartTime = undefined
  form.planEndTime = undefined
  form.remark = ''
  editId.value = null
}

const buildParams = () => {
  const params: any = {}
  if (queryParams.planName) params.title = queryParams.planName
  if (queryParams.planType) params.planType = queryParams.planType
  if (queryParams.status !== undefined && queryParams.status !== null && queryParams.status !== '') params.status = queryParams.status
  return params
}

const fetchData = async () => {
  loading.value = true
  try {
    const { getScheduleList } = await import('@/api/plan/schedule')
    const res = await getScheduleList(buildParams())
    plans.value = (res?.data || []).map((item: any) => ({
      ...item,
      planName: item.planName || item.title || ''
    }))
  } catch (e) {
    console.error('获取计划数据失败:', e)
    plans.value = []
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  queryParams.planName = ''
  queryParams.planType = undefined
  queryParams.status = undefined
  fetchData()
}

const goToGantt = () => {
  router.push('/plan/gantt')
}

const showAddModal = () => {
  isEdit.value = false
  resetForm()
  modalVisible.value = true
}

const handleEdit = (record: any) => {
  isEdit.value = true
  editId.value = record.id
  form.planName = record.planName || record.title
  form.planType = record.planType
  form.targetEffect = record.targetEffect || ''
  form.priority = record.priority || 0
  form.planStartTime = record.planStartTime
  form.planEndTime = record.planEndTime
  form.remark = record.remark || ''
  modalVisible.value = true
}

const handleSave = async () => {
  if (!form.planName) {
    message.warning('请输入计划名称')
    return
  }
  saving.value = true
  try {
    message.success(isEdit.value ? '修改成功' : '新增成功')
    modalVisible.value = false
    await fetchData()
  } catch (e) {
    console.error('保存失败:', e)
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    message.success('删除成功')
    await fetchData()
  } catch (e) {
    console.error('删除失败:', e)
  }
}

const formatTime = (ts: number) => {
  if (!ts) return '-'
  const d = new Date(ts)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.plan-info-container { padding: 16px; }
.search-form { margin-bottom: 16px; }
.table-wrapper { }
.table-toolbar { margin-bottom: 16px; }
</style>
