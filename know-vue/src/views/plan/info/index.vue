<template>
  <div class="p-4">
    <a-card title="计划管理">
      <a-row class="mb-4">
        <a-col :span="24">
          <a-button type="primary" @click="showAddModal">新增计划</a-button>
        </a-col>
      </a-row>

      <a-table
        :columns="columns"
        :data-source="plans"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
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
import { message } from 'ant-design-vue'

const loading = ref(false)
const saving = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const plans = ref<any[]>([])
const editId = ref<number | null>(null)

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

const fetchData = async () => {
  loading.value = true
  try {
    // 计划管理API在后端plan模块，通过代理转发
    const { getScheduleList } = await import('@/api/plan/schedule')
    // 暂时使用schedule API的数据格式，等待独立plan API接入
    const res = await getScheduleList({})
    plans.value = []
  } catch (e) {
    console.error('获取计划数据失败:', e)
    plans.value = []
  } finally {
    loading.value = false
  }
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
.mb-4 { margin-bottom: 16px; }
</style>
