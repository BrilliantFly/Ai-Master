<template>
  <div class="p-4">
    <a-card title="习惯打卡">
      <a-row :gutter="16" class="mb-4">
        <a-col :span="6">
          <a-statistic title="习惯总数" :value="stats.totalCount" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="进行中" :value="stats.activeCount" value-style="color: #1890FF" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="已完成" :value="stats.completedCount" value-style="color: #52C41A" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="累计打卡" :value="stats.totalCheckins" />
        </a-col>
      </a-row>

      <a-row :gutter="[16, 16]">
        <a-col :span="8" v-for="habit in habits" :key="habit.id">
          <a-card :title="habit.name" :hoverable="true">
            <template #extra>
              <a-tag :color="habit.status === 0 ? 'blue' : habit.status === 1 ? 'green' : 'default'">
                {{ habit.status === 0 ? '进行中' : habit.status === 1 ? '已完成' : '已放弃' }}
              </a-tag>
            </template>
            <p>{{ habit.description || '暂无描述' }}</p>
            <a-progress :percent="Math.min(100, Math.round(habit.totalDays / habit.targetDays * 100))" />
            <p class="mt-2">
              连续 {{ habit.currentDays }} 天 / 累计 {{ habit.totalDays }} 天
            </p>
            <a-space>
              <a-button type="primary" size="small" @click="handleCheckin(habit.id)">打卡</a-button>
              <a-button size="small" @click="handleEdit(habit)">编辑</a-button>
              <a-popconfirm title="确定删除?" @confirm="handleDelete(habit.id)">
                <a-button danger size="small">删除</a-button>
              </a-popconfirm>
            </a-space>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card :hoverable="true">
            <div class="add-card" @click="showAddModal">
              <a-icon type="plus" style="font-size: 48px; color: #1890FF" />
              <p>添加习惯</p>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑习惯' : '新增习惯'"
      @ok="handleSave"
      :confirm-loading="saving"
    >
      <a-form :model="form" :label-col="{ span: 4 }">
        <a-form-item label="名称" required>
          <a-input v-model:value="form.name" placeholder="请输入习惯名称" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="form.description" :rows="2" />
        </a-form-item>
        <a-form-item label="目标天数">
          <a-input-number v-model:value="form.targetDays" :min="1" :max="365" />
        </a-form-item>
        <a-form-item label="颜色">
          <a-input v-model:value="form.color" type="color" style="width: 60px" />
        </a-form-item>
        <a-form-item label="提醒时间">
          <a-time-picker v-model:value="form.reminderTime" format="HH:mm" value-format="HH:mm" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getHabitList, getHabitStats, addHabit, updateHabit, deleteHabit, checkinHabit } from '@/api/plan/habit'
import { message } from 'ant-design-vue'

const loading = ref(false)
const saving = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const habits = ref<any[]>([])
const stats = ref({ totalCount: 0, activeCount: 0, completedCount: 0, totalCheckins: 0 })
const editId = ref<number | null>(null)

const form = reactive({
  name: '',
  description: '',
  targetDays: 30,
  color: '#52C41A',
  reminderTime: undefined
})

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.targetDays = 30
  form.color = '#52C41A'
  form.reminderTime = undefined
  editId.value = null
}

const fetchData = async () => {
  loading.value = true
  try {
    const [habitRes, statsRes] = await Promise.all([
      getHabitList({}),
      getHabitStats({})
    ])
    habits.value = habitRes?.data || habitRes || []
    stats.value = statsRes?.data || statsRes || { totalCount: 0, activeCount: 0, completedCount: 0, totalCheckins: 0 }
  } catch (e) {
    console.error('获取习惯数据失败:', e)
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
  form.name = record.name
  form.description = record.description || ''
  form.targetDays = record.targetDays || 30
  form.color = record.color || '#52C41A'
  form.reminderTime = record.reminderTime
  modalVisible.value = true
}

const handleSave = async () => {
  if (!form.name) {
    message.warning('请输入习惯名称')
    return
  }
  saving.value = true
  try {
    if (isEdit.value && editId.value) {
      await updateHabit({ id: editId.value, ...form })
      message.success('修改成功')
    } else {
      await addHabit(form)
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

const handleCheckin = async (id: number) => {
  try {
    await checkinHabit(id, {})
    message.success('打卡成功')
    await fetchData()
  } catch (e) {
    console.error('打卡失败:', e)
  }
}

const handleDelete = async (id: number) => {
  try {
    await deleteHabit(id)
    message.success('删除成功')
    await fetchData()
  } catch (e) {
    console.error('删除失败:', e)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
.mt-2 { margin-top: 8px; }
.add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 180px;
  cursor: pointer;
}
.add-card:hover {
  background: #f0f5ff;
  border-radius: 4px;
}
</style>
