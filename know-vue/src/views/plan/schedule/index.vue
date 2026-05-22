<template>
  <div class="p-4">
    <a-card title="日程管理">
      <a-row :gutter="16" class="mb-4">
        <a-col :span="6">
          <a-statistic title="今日待办" :value="todayStats.todoCount" value-style="color: #FF4D4F" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="今日完成" :value="todayStats.completedCount" value-style="color: #52C41A" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="总计" :value="todayStats.totalCount" />
        </a-col>
        <a-col :span="6" class="text-right">
          <a-button type="primary" @click="showAddModal">新增日程</a-button>
        </a-col>
      </a-row>

      <a-table
        :columns="columns"
        :data-source="events"
        :loading="loading"
        :pagination="{ pageSize: 20 }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'quadrant'">
            <a-tag :color="quadrantColors[record.quadrant]">
              {{ quadrantLabels[record.quadrant] || '未分类' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? '#52C41A' : '#FF4D4F'">
              {{ record.status === 1 ? '已完成' : '待完成' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'time'">
            {{ formatTime(record.startTime) }} ~ {{ formatTime(record.endTime) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleComplete(record)">完成</a-button>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm title="确定删除?" @confirm="handleDelete(record.id)">
                <a-button type="link" danger size="small">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑日程' : '新增日程'"
      @ok="handleSave"
      :confirm-loading="saving"
    >
      <a-form :model="form" :label-col="{ span: 4 }">
        <a-form-item label="标题" required>
          <a-input v-model:value="form.title" placeholder="请输入日程标题" />
        </a-form-item>
        <a-form-item label="内容">
          <a-textarea v-model:value="form.content" :rows="3" />
        </a-form-item>
        <a-form-item label="象限">
          <a-select v-model:value="form.quadrant">
            <a-select-option :value="1">重要紧急</a-select-option>
            <a-select-option :value="2">重要不紧急</a-select-option>
            <a-select-option :value="3">紧急不重要</a-select-option>
            <a-select-option :value="4">不紧急不重要</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="分类">
          <a-select v-model:value="form.categoryId">
            <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="开始时间">
          <a-date-picker show-time v-model:value="form.startTime" value-format="x" style="width: 100%" />
        </a-form-item>
        <a-form-item label="结束时间">
          <a-date-picker show-time v-model:value="form.endTime" value-format="x" style="width: 100%" />
        </a-form-item>
        <a-form-item label="地点">
          <a-input v-model:value="form.location" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getScheduleList, addSchedule, updateSchedule, completeSchedule, deleteSchedule, getTodayStats, getScheduleCategoryList } from '@/api/plan/schedule'
import { message } from 'ant-design-vue'

const loading = ref(false)
const saving = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const events = ref<any[]>([])
const categories = ref<any[]>([])
const todayStats = ref({ todoCount: 0, completedCount: 0, totalCount: 0 })
const editId = ref<number | null>(null)

const columns = [
  { title: '标题', dataIndex: 'title', key: 'title' },
  { title: '象限', key: 'quadrant' },
  { title: '优先级', dataIndex: 'priority', key: 'priority' },
  { title: '时间', key: 'time' },
  { title: '状态', key: 'status' },
  { title: '地点', dataIndex: 'location', key: 'location' },
  { title: '操作', key: 'action' }
]

const quadrantColors: Record<number, string> = { 1: '#FF6B6B', 2: '#4ECDC4', 3: '#FFE66D', 4: '#95A5A6' }
const quadrantLabels: Record<number, string> = { 1: '重要紧急', 2: '重要不紧急', 3: '紧急不重要', 4: '不紧急不重要' }

const form = reactive({
  title: '',
  content: '',
  quadrant: 2,
  categoryId: undefined,
  startTime: undefined,
  endTime: undefined,
  location: '',
  eventType: 1
})

const resetForm = () => {
  form.title = ''
  form.content = ''
  form.quadrant = 2
  form.categoryId = undefined
  form.startTime = undefined
  form.endTime = undefined
  form.location = ''
  form.eventType = 1
  editId.value = null
}

const fetchData = async () => {
  loading.value = true
  try {
    const [eventRes, statsRes, catRes] = await Promise.all([
      getScheduleList({}),
      getTodayStats({}),
      getScheduleCategoryList({})
    ])
    events.value = eventRes?.data || eventRes || []
    todayStats.value = statsRes?.data || statsRes || { todoCount: 0, completedCount: 0, totalCount: 0 }
    categories.value = catRes?.data || catRes || []
  } catch (e) {
    console.error('获取日程数据失败:', e)
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
  form.title = record.title
  form.content = record.content || ''
  form.quadrant = record.quadrant || 2
  form.categoryId = record.categoryId
  form.startTime = record.startTime
  form.endTime = record.endTime
  form.location = record.location || ''
  modalVisible.value = true
}

const handleSave = async () => {
  if (!form.title) {
    message.warning('请输入标题')
    return
  }
  saving.value = true
  try {
    if (isEdit.value && editId.value) {
      await updateSchedule({ id: editId.value, ...form })
      message.success('修改成功')
    } else {
      await addSchedule(form)
      message.success('新增成功')
    }
    modalVisible.value = false
    await fetchData()
  } catch (e) {
    console.error('保存失败:', e)
  } finally {
    saving.value = false
  }
}

const handleComplete = async (record: any) => {
  try {
    await completeSchedule(record.id)
    message.success('已完成')
    await fetchData()
  } catch (e) {
    console.error('完成失败:', e)
  }
}

const handleDelete = async (id: number) => {
  try {
    await deleteSchedule(id)
    message.success('删除成功')
    await fetchData()
  } catch (e) {
    console.error('删除失败:', e)
  }
}

const formatTime = (ts: number) => {
  if (!ts) return '-'
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
.text-right { text-align: right; }
</style>
