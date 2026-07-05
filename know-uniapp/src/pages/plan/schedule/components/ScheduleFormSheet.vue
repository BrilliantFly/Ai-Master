<template>
    <view v-if="visible" class="form-overlay" @tap="onOverlayTap">
        <view class="form-sheet" @tap.stop>
            <view class="sheet-handle"></view>
            <view class="sheet-header">
                <text class="sheet-kicker">日程计划</text>
                <text class="sheet-title">{{ isEdit ? '编辑日程' : '新建日程' }}</text>
                <text class="sheet-subtitle">高效管理你的每一项安排</text>
            </view>

            <view class="form-card">
            <view class="section-card">
                <text class="section-card-title">基本信息</text>
                <view class="fgs-full">
                    <text class="fg-label">📝 日程标题 <text class="required">*</text></text>
                    <view class="fg-input-wrap">
                        <input
                            v-model="form.title"
                            class="fg-input"
                            placeholder="输入日程标题"
                            placeholder-class="field-placeholder"
                        />
                        <view class="focus-bar"></view>
                    </view>
                </view>

                <view class="fgs-row">
                    <view class="fgs-cell">
                        <text class="fg-label">📅 开始日期 <text class="required">*</text></text>
                        <picker mode="date" :value="form.startDate" @change="onStartDateChange">
                            <view class="fg-select">{{ form.startDate || '选择日期' }}</view>
                        </picker>
                    </view>
                    <view class="fgs-cell">
                        <text class="fg-label">🏷️ 分类</text>
                        <picker
                            :value="categoryIndex"
                            :range="categoryOptions"
                            range-key="name"
                            @change="onCategoryChange"
                        >
                            <view class="fg-select">{{ selectedCategoryName }}</view>
                        </picker>
                    </view>
                </view>

                <view class="fgs-row mt-10">
                    <view class="fgs-cell">
                        <text class="fg-label">🕐 开始时间</text>
                        <picker mode="time" :value="form.startClock" @change="onStartClockChange">
                            <view class="fg-select">{{ form.startClock || '选择时间' }}</view>
                        </picker>
                    </view>
                    <view class="fgs-cell">
                        <text class="fg-label">🕐 结束时间</text>
                        <picker mode="time" :value="form.endClock" @change="onEndClockChange">
                            <view class="fg-select">{{ form.endClock || '选择时间' }}</view>
                        </picker>
                    </view>
                </view>

                <view class="fgs-full">
                    <text class="fg-label">📍 地点</text>
                    <view class="fg-input-wrap">
                        <input
                            v-model="form.location"
                            class="fg-input"
                            placeholder="添加地点，可选"
                            placeholder-class="field-placeholder"
                        />
                        <view class="focus-bar"></view>
                    </view>
                </view>
            </view>

            <view class="section-card">
                <text class="section-card-title">优先级设置</text>

                <view class="fgs-full">
                    <text class="fg-label">📊 四象限</text>
                </view>

                <view class="quad-grid">
                    <view
                        v-for="item in quadrantCards"
                        :key="item.value"
                        class="quad-option"
                        :class="{ active: form.quadrant === item.value }"
                        @tap="form.quadrant = item.value"
                    >
                        <text class="q-icon">{{ item.icon }}</text>
                        <text>{{ item.label }}</text>
                    </view>
                </view>

                <view class="fgs-full">
                    <text class="fg-label">⚡ 优先级</text>
                    <picker
                        :value="priorityIndex"
                        :range="priorityOptions"
                        @change="onPriorityChange"
                    >
                        <view class="fg-select">{{ priorityOptions[priorityIndex] }}</view>
                    </picker>
                </view>
            </view>

            <view class="section-card">
                <text class="section-card-title">时间与提醒</text>

                <view class="fgs-full">
                    <text class="fg-label">🔄 重复设置</text>
                    <picker
                        :value="repeatPickerValue"
                        :range="repeatOptions"
                        @change="onRepeatChange"
                    >
                        <view class="fg-select">{{ repeatOptions[repeatPickerValue] }}</view>
                    </picker>
                </view>

                <view class="fgs-full">
                    <text class="fg-label">🔔 提醒设置</text>
                    <view class="check-grid">
                        <view
                            v-for="item in remindOptions"
                            :key="item.label"
                            class="check-chip"
                            :class="{ active: form.remindMinutes.includes(item.minutes) }"
                            @tap="toggleRemind(item.minutes)"
                        >
                            {{ item.label }}
                        </view>
                    </view>
                </view>

                <view class="fgs-full progress-row">
                    <text class="fg-label">📈 完成进度</text>
                    <slider
                        :value="form.progress"
                        min="0"
                        max="100"
                        activeColor="var(--color-primary)"
                        backgroundColor="var(--color-border)"
                        block-size="20"
                        @change="onProgressChange"
                    />
                    <text class="progress-val">{{ form.progress }}%</text>
                </view>
            </view>

            <view class="section-card">
                <view class="more-summary" @tap="moreOpen = !moreOpen">
                    <text
                        ><text class="arrow">{{ moreOpen ? '▼' : '▶' }}</text> 更多设置</text
                    >
                </view>
                <view class="section-body" :class="{ open: moreOpen }">
                    <view class="fgs-full">
                        <text class="fg-label">🏷️ 标签</text>
                        <view class="fg-input-wrap">
                            <input
                                v-model="form.tags"
                                class="fg-input"
                                placeholder="例如：会议, 工作, 重要"
                                placeholder-class="field-placeholder"
                            />
                            <view class="focus-bar"></view>
                        </view>
                    </view>

                    <view class="fgs-full">
                        <view class="subtask-head">
                            <text class="fg-label">📋 子任务</text>
                            <text class="subtask-count">{{ form.subtasks.length }} 项</text>
                        </view>
                        <view class="subtask-list">
                            <view
                                v-for="(task, index) in form.subtasks"
                                :key="index"
                                class="subtask-row"
                            >
                                <input
                                    v-model="form.subtasks[index]"
                                    class="fg-input"
                                    placeholder="子任务内容"
                                    placeholder-class="field-placeholder"
                                />
                                <button
                                    class="subtask-del"
                                    type="button"
                                    @tap="removeSubtask(index)"
                                >
                                    ×
                                </button>
                            </view>
                        </view>
                        <button class="btn-add-sub" type="button" @tap="addSubtask">
                            ＋ 添加子任务
                        </button>
                    </view>

                    <view class="fgs-full">
                        <text class="fg-label">💬 备注</text>
                        <textarea
                            :value="form.note"
                            class="fg-textarea"
                            placeholder="记录执行要点或补充说明，可选"
                            placeholder-class="field-placeholder"
                            @input="onNoteInput"
                        />
                    </view>
                </view>
            </view>
            </view>

            <view class="form-actions">
                <view class="action-btn cancel" @tap="onCancel">取消</view>
                <view class="action-btn submit" :class="{ disabled: submitting }" @tap="handleSave">
                    {{ submitting ? '保存中...' : isEdit ? '更新日程' : '保存日程' }}
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import {
    addSchedule,
    getCategoryList,
    getScheduleDetail,
    updateSchedule
} from '@/api/plan/schedule'
import { formatYYYYMMDD } from '@/components/calendar-grid/calendar-utils.js'
import { useHoverEffect } from '@/hooks/useHoverEffect'

useHoverEffect(
    '.action-btn.cancel,.action-btn.submit,.section-card,.fg-input,.fg-select,.fg-textarea,.quad-option,.check-chip,.more-summary,.subtask-del,.btn-add-sub'
)

const props = defineProps({
    visible: { type: Boolean, default: false },
    editData: { type: Object, default: null },
    selectedDate: { type: String, default: '' }
})

const emit = defineEmits(['close', 'saved'])

const quadrantCards = [
    { value: 1, label: '重要紧急', icon: '🔴' },
    { value: 2, label: '重要不紧急', icon: '🟡' },
    { value: 3, label: '紧急不重要', icon: '🔵' },
    { value: 4, label: '不紧急不重要', icon: '⚪' }
]
const priorityOptions = ['P0 最高', 'P1 高', 'P2 中', 'P3 低']
const repeatOptions = ['不重复', '每天', '每周', '每月', '每年', '自定义']
const remindOptions = [
    { label: '准时', minutes: 0 },
    { label: '提前 5 分钟', minutes: 5 },
    { label: '提前 15 分钟', minutes: 15 },
    { label: '提前 30 分钟', minutes: 30 },
    { label: '提前 1 小时', minutes: 60 },
    { label: '提前 2 小时', minutes: 120 },
    { label: '提前 1 天', minutes: 1440 },
    { label: '提前 1 周', minutes: 10080 }
]

const submitting = ref(false)
const editId = ref('')
const categoryOptions = ref([{ id: null, name: '未分类' }])
const editDataCache = ref(null)
const moreOpen = ref(false)

const today = new Date()
const form = reactive({
    title: '',
    content: '',
    tags: '',
    subtasks: [],
    note: '',
    progress: 0,
    quadrant: 2,
    priority: 2,
    categoryId: null,
    location: '',
    startDate: formatYYYYMMDD(today.getFullYear(), today.getMonth() + 1, today.getDate()),
    startClock: '09:00',
    endClock: '10:00',
    repeatType: 0,
    remindMinutes: [],
    cronExpr: '',
    eventType: 1
})

const isEdit = computed(() => !!editId.value)

const categoryIndex = computed(() => {
    const index = categoryOptions.value.findIndex((item) => item.id === form.categoryId)
    return index >= 0 ? index : 0
})

const selectedCategoryName = computed(() => {
    return categoryOptions.value[categoryIndex.value]?.name || '未分类'
})

const priorityIndex = computed(() => form.priority)

const repeatPickerValue = computed(() => {
    if (!form.repeatType) return 0
    return Math.min(form.repeatType, repeatOptions.length - 1)
})

const repeatSummary = computed(() => {
    return form.repeatType === 0
        ? '默认只创建一次'
        : `当前已设置为${repeatOptions[repeatPickerValue.value]}重复`
})

const remindSummary = computed(() => {
    return form.remindMinutes.length > 0 ? '将在开始前按设定时间提醒' : '保存后不会发送提醒'
})

const resetForm = () => {
    const now = new Date()
    form.title = ''

    form.tags = ''
    form.subtasks = []
    form.note = ''
    form.progress = 0
    form.quadrant = 2
    form.priority = 2
    form.categoryId = null
    form.location = ''
    form.startDate = formatYYYYMMDD(now.getFullYear(), now.getMonth() + 1, now.getDate())
    form.startClock = '09:00'
    form.endClock = '10:00'
    form.repeatType = 0
    form.remindMinutes = []
    form.cronExpr = ''
    form.eventType = 1
    editId.value = ''
    editDataCache.value = null
    moreOpen.value = false
}

const initForm = async () => {
    await loadCategories()
    if (props.selectedDate) {
        form.startDate = props.selectedDate
    }
    if (props.editData && props.editData.id) {
        editId.value = props.editData.id
        editDataCache.value = props.editData
        await loadDetail(props.editData.id)
    }
}

watch(
    () => props.visible,
    async (val) => {
        if (val) {
            resetForm()
            await initForm()
        }
    }
)

const normalizeDate = (dateStr) => dateStr.replace(/-/g, '/')

const buildTimestamp = (dateStr, clock) => {
    return new Date(`${normalizeDate(dateStr)} ${clock}`).getTime()
}

const formatDateTimeText = (timestamp) => {
    const date = new Date(Number(timestamp))
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
}

const formatClock = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(Number(timestamp))
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(
        2,
        '0'
    )}`
}

const parseSubtasks = (raw) => {
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
            return parsed
                .map((item) => {
                    if (typeof item === 'string') return item
                    if (item && typeof item === 'object') {
                        return item.title || item.name || item.text || ''
                    }
                    return ''
                })
                .filter(Boolean)
        }
    } catch (error) {
        return String(raw)
            .split(/\r?\n/)
            .map((item) => item.trim())
            .filter(Boolean)
    }
    return []
}

const serializeSubtasks = (list) => {
    const tasks = (list || []).map((item) => item.trim()).filter(Boolean)
    return tasks.length ? JSON.stringify(tasks) : ''
}

const normalizeTags = (text) => {
    return (text || '')
        .split(/[,，]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .join(',')
}

const loadCategories = async () => {
    try {
        const list = await getCategoryList({})
        if (Array.isArray(list) && list.length) {
            categoryOptions.value = [{ id: null, name: '未分类' }, ...list]
        }
    } catch (error) {
        console.error('加载分类失败', error)
    }
}

const loadDetail = async (id) => {
    try {
        const detail = await getScheduleDetail(id)
        if (!detail) return
        form.title = detail.title || ''

        form.tags = detail.tags || ''
        form.subtasks = parseSubtasks(detail.subtasks)
        form.note = detail.note || ''
        form.progress = Number(detail.progress || 0)
        form.quadrant = detail.quadrant || 2
        form.priority = detail.priority || 2
        form.categoryId = detail.categoryId ?? null
        form.location = detail.location || ''
        form.startDate = detail.startTime
            ? formatDateTimeText(detail.startTime).slice(0, 10)
            : form.startDate
        form.startClock = detail.startTime ? formatClock(detail.startTime) : form.startClock
        form.endClock = detail.endTime ? formatClock(detail.endTime) : form.endClock
        form.repeatType = detail.isRepeat ? detail.repeatType || 0 : 0
        form.cronExpr = detail.cronExpr || ''
        if (detail.remindMinutesList) {
            try {
                form.remindMinutes = JSON.parse(detail.remindMinutesList)
            } catch {
                form.remindMinutes = []
            }
        } else if (detail.remindMinutes !== undefined && detail.remindMinutes !== null) {
            form.remindMinutes = [Number(detail.remindMinutes)]
        } else {
            form.remindMinutes = []
        }
    } catch (error) {
        console.error('加载日程详情失败', error)
    }
}

const onNoteInput = (e) => {
    const value = e.detail ? e.detail.value : e.target.value
    form.note = value || ''
}

const onCategoryChange = (e) => {
    const index = Number(e.detail.value)
    form.categoryId = categoryOptions.value[index]?.id ?? null
}

const onPriorityChange = (e) => {
    const index = Number(e.detail.value)
    form.priority = index
}

const onStartDateChange = (e) => {
    form.startDate = e.detail.value
}

const onStartClockChange = (e) => {
    form.startClock = e.detail.value
}

const onEndClockChange = (e) => {
    form.endClock = e.detail.value
}

const onRepeatChange = (e) => {
    form.repeatType = Number(e.detail.value)
}

const toggleRemind = (minutes) => {
    if (form.remindMinutes.includes(minutes)) {
        form.remindMinutes = form.remindMinutes.filter((m) => m !== minutes)
    } else {
        form.remindMinutes = [...form.remindMinutes, minutes]
    }
}

const onProgressChange = (e) => {
    form.progress = Number(e.detail.value || 0)
}

const addSubtask = () => {
    form.subtasks = [...form.subtasks, '']
}

const removeSubtask = (index) => {
    form.subtasks = form.subtasks.filter((_, i) => i !== index)
}

const onOverlayTap = () => {
    emit('close')
}

const onCancel = () => {
    emit('close')
}

const buildPayload = () => {
    const startTime = buildTimestamp(form.startDate, form.startClock)
    const endTime = buildTimestamp(form.startDate, form.endClock)
    const remindMinutes = form.remindMinutes.length > 0 ? Math.min(...form.remindMinutes) : -1
    const remindTime =
        remindMinutes < 0 ? '' : formatDateTimeText(startTime - remindMinutes * 60 * 1000)

    return {
        id: editId.value || undefined,
        title: form.title.trim(),

        tags: normalizeTags(form.tags),
        subtasks: serializeSubtasks(form.subtasks),
        note: form.note.trim(),
        progress: form.progress,
        quadrant: form.quadrant,
        priority: form.priority,
        categoryId: form.categoryId,
        eventType: form.eventType,
        startTime,
        endTime,
        isAllDay: 0,
        isRepeat: form.repeatType > 0 ? 1 : 0,
        repeatType: form.repeatType > 0 ? form.repeatType : null,
        repeatRule: form.repeatType > 0 ? JSON.stringify({ repeatType: form.repeatType }) : '',
        remindTime,
        remindMinutes,
        remindMinutesList: form.remindMinutes.length > 0 ? JSON.stringify(form.remindMinutes) : '',
        cronExpr: form.cronExpr || '',
        location: form.location.trim()
    }
}

const handleSave = async () => {
    if (!form.title.trim()) {
        uni.showToast({ title: '请输入标题', icon: 'none' })
        return
    }

    const payload = buildPayload()
    if (Number.isNaN(payload.startTime) || Number.isNaN(payload.endTime)) {
        uni.showToast({ title: '请选择有效的时间', icon: 'none' })
        return
    }
    if (payload.endTime <= payload.startTime) {
        uni.showToast({ title: '结束时间需晚于开始时间', icon: 'none' })
        return
    }
    if (submitting.value) return

    submitting.value = true
    try {
        if (isEdit.value) {
            await updateSchedule(payload)
            uni.showToast({ title: '更新成功', icon: 'success' })
        } else {
            await addSchedule(payload)
            uni.showToast({ title: '添加成功', icon: 'success' })
        }
        emit('saved')
        emit('close')
    } catch (error) {
        console.error(error)
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped lang="scss">
.form-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 300;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    animation: overlayFadeIn 0.2s ease;
}

.form-sheet {
    width: 100%;
    max-width: 750rpx;
    max-height: 88vh;
    overflow-y: auto;
    padding: 18rpx 24rpx 28rpx;
    border-radius: 32rpx 32rpx 0 0;
    background: var(--color-bg-app, #ffffff);
    animation: sheetSlideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.sheet-handle {
    width: 72rpx;
    height: 8rpx;
    border-radius: 999rpx;
    background: var(--color-border);
    margin: 4rpx auto 18rpx;
}

.sheet-header {
    display: flex;
    flex-direction: column;
    padding: 6rpx 8rpx 24rpx;
}

.sheet-kicker {
    font-size: 23rpx;
    color: var(--color-primary);
    font-weight: 700;
}

.sheet-title {
    margin-top: 8rpx;
    font-size: 48rpx;
    font-weight: 800;
    color: var(--color-text);
    line-height: 1.2;
}

.form-card {
    padding: 0 4rpx;
}

.section-card {
    border-top: 2rpx solid var(--color-border-light);
    padding-top: 26rpx;
    margin-top: 26rpx;
}

.section-card:first-of-type {
    border-top: none;
    padding-top: 0;
    margin-top: 0;
}

.section-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20rpx;
    margin-bottom: 18rpx;
}

.section-card-title {
    display: block;
    font-size: 28rpx;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 18rpx;
}

.section-card-head .section-card-title {
    margin-bottom: 0;
}

.section-card-tip {
    flex-shrink: 0;
    font-size: 22rpx;
    color: var(--color-text-tertiary);
}

.field-block {
    margin-bottom: 28rpx;
}

.field-block-compact {
    margin-bottom: 18rpx;
}

.field-label {
    display: block;
    font-size: 26rpx;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 14rpx;
}

.required {
    color: var(--color-danger);
}

.field-input,
.field-textarea,
.picker-pill {
    background: var(--color-surface-soft, #f8fafc);
    border: 2rpx solid var(--color-border-light);
    border-radius: 20rpx;
    box-sizing: border-box;
    color: var(--color-text);
}

.field-input {
    height: 94rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
}

.field-textarea {
    width: 100%;
    height: 180rpx;
    padding: 22rpx 24rpx;
    font-size: 28rpx;
    line-height: 1.6;
}

.field-textarea-compact {
    height: 150rpx;
}

.field-placeholder {
    color: var(--color-text-tertiary);
}

.field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18rpx;
    margin-bottom: 18rpx;
}

.field-grid-item {
    min-width: 0;
}

.field-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24rpx;
    padding: 22rpx 0;
}

.field-row-tight {
    border-top: 2rpx solid var(--color-border-light);
}

.field-copy {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.field-help {
    font-size: 22rpx;
    color: var(--color-text-tertiary);
    line-height: 1.5;
}

.field-help-inline {
    display: block;
    margin-top: 10rpx;
}

.picker-pill {
    min-width: 220rpx;
    min-height: 74rpx;
    padding: 0 22rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 25rpx;
    font-weight: 700;
}

.picker-pill-block {
    width: 100%;
    justify-content: flex-start;
    text-align: left;
    font-weight: 600;
}

.quadrant-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18rpx;
}

.quadrant-card {
    min-height: 110rpx;
    padding: 18rpx 16rpx;
    border-radius: 22rpx;
    border: 2rpx solid var(--color-border-light);
    background: var(--color-surface-soft, #f8fafc);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
}

.quadrant-card.active {
    border-color: var(--color-primary, #6366f1);
    background: var(--color-primary-mist, #eef2ff);
    box-shadow: 0 10rpx 24rpx rgba(var(--color-primary-rgb, 99, 102, 241), 0.12);
}

.quadrant-icon {
    font-size: 28rpx;
}

.quadrant-name {
    font-size: 22rpx;
    font-weight: 600;
    color: var(--color-text);
}

.form-actions {
    display: flex;
    gap: 20rpx;
    margin-top: 28rpx;
    padding-top: 14rpx;
    border-top: 2rpx solid var(--color-border-light);
}

.action-btn {
    flex: 1;
    height: 92rpx;
    border: none;
    border-radius: 999rpx;
    font-size: 29rpx;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s, color 0.25s;
}

.action-btn.cancel {
    background: var(--color-surface-secondary, #f0f1f3);
    color: var(--color-text-secondary, #6b7280);
    border: 2rpx solid transparent;
}

.action-btn.cancel.hover-active {
    background: var(--color-border-light);
    color: var(--color-text);
}

.action-btn.cancel:active {
    transform: scale(var(--scale-active));
}

.action-btn.submit {
    background: linear-gradient(135deg, var(--color-primary, #6366f1), #8980f0) !important;
    color: #fff !important;
    box-shadow: var(--shadow-glow);
}

.action-btn.submit.disabled {
    background: linear-gradient(135deg, var(--color-primary, #6366f1), #8980f0) !important;
    color: #fff !important;
}

.action-btn.submit.hover-active {
    transform: translateY(-1rpx);
    box-shadow: 0 8rpx 32rpx rgba(var(--color-primary-rgb, 99, 102, 241), 0.3);
}

.action-btn.submit:active {
    transform: scale(var(--scale-active));
    box-shadow: 0 2rpx 12rpx rgba(var(--color-primary-rgb, 99, 102, 241), 0.15);
}

.action-btn.disabled {
    opacity: 0.65;
    transform: none !important;
    box-shadow: none !important;
}

.action-btn:focus-visible {
    outline: 2rpx solid var(--color-primary);
    outline-offset: 1rpx;
}

.form-card {
    background: var(--color-surface, #ffffff);
    border: 2rpx solid var(--color-border-light);
    border-radius: 24rpx;
    padding: 24rpx;
    box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.05);
}

.fgs-full {
    margin-top: 18rpx;
}

.fgs-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18rpx;
    margin-top: 18rpx;
}

.mt-10 {
    margin-top: 18rpx;
}

.fgs-cell {
    min-width: 0;
}

.fg-label {
    display: block;
    margin-bottom: 10rpx;
    font-size: 24rpx;
    font-weight: 700;
    color: var(--color-text-secondary);
}

.fg-input,
.fg-select,
.fg-textarea {
    width: 100%;
    box-sizing: border-box;
    border: 2rpx solid var(--color-border);
    border-radius: 16rpx;
    background: var(--color-surface-soft, #f8fafc);
    color: var(--color-text);
    font-size: 27rpx;
    transition: border-color 0.22s, box-shadow 0.22s, background 0.22s;
}

.fg-input.hover-active,
.fg-select.hover-active,
.fg-textarea.hover-active {
    border-color: var(--color-border-hover, #c8ccd8);
    background: var(--color-surface-hover, #f2f4f8);
}

.fg-input:focus,
.fg-select:focus,
.fg-textarea:focus {
    border-color: var(--color-primary, #6366f1);
    box-shadow: 0 0 0 4rpx rgba(var(--color-primary-rgb, 99, 102, 241), 0.12);
    background: var(--color-surface, #ffffff);
}

.fg-input:focus-visible,
.fg-select:focus-visible,
.fg-textarea:focus-visible {
    outline: 2rpx solid var(--color-primary, #6366f1);
    outline-offset: 1rpx;
}

.fg-input,
.fg-select {
    min-height: 84rpx;
    padding: 0 22rpx;
    display: flex;
    align-items: center;
}

.fg-textarea {
    min-height: 132rpx;
    padding: 20rpx 22rpx;
    line-height: 1.6;
}

.quad-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12rpx;
}

.quad-option {
    min-height: 86rpx;
    border: 2rpx solid var(--color-border);
    border-radius: 16rpx;
    background: var(--color-surface-soft, #f8fafc);
    color: var(--color-text-secondary);
    font-size: 23rpx;
    font-weight: 700;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4rpx;
    transition: border-color 0.2s, background 0.2s, color 0.2s, transform 0.2s;
    -webkit-user-select: none;
    user-select: none;
}

.quad-option.hover-active {
    border-color: var(--color-primary, #6366f1);
    background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.06);
}

.quad-option:active {
    transform: scale(var(--scale-active));
}

.quad-option.active {
    border-color: var(--color-primary, #6366f1);
    background: var(--color-primary, #6366f1);
    color: #fff;
    font-weight: 800;
}

.quad-option:focus-visible {
    outline: 2rpx solid var(--color-primary, #6366f1);
    outline-offset: 1rpx;
}

.q-icon {
    font-size: 30rpx;
}

.check-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10rpx;
}

.check-chip {
    min-height: 70rpx;
    padding: 0 8rpx;
    border-radius: 16rpx;
    border: 2rpx solid var(--color-border);
    background: var(--color-surface-soft, #f8fafc);
    color: var(--color-text-secondary);
    font-size: 22rpx;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: border-color 0.2s, background 0.2s, color 0.2s, transform 0.2s;
    -webkit-user-select: none;
    user-select: none;
    position: relative;
}

.check-chip.hover-active {
    border-color: var(--color-primary);
}

.check-chip:active {
    transform: scale(var(--scale-active));
}

.check-chip.active {
    border-color: var(--color-primary, #6366f1);
    background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.1);
    color: var(--color-primary, #6366f1);
    font-weight: 800;
}

.check-chip.active::after {
    content: '✓';
    position: absolute;
    top: 1rpx;
    right: 5rpx;
    font-size: 18rpx;
    font-weight: 700;
    color: var(--color-primary);
}

.check-chip:focus-visible {
    outline: 2rpx solid var(--color-primary);
    outline-offset: 1rpx;
}

.progress-row {
    position: relative;
}

.progress-val {
    display: block;
    margin-top: 4rpx;
    text-align: right;
    color: var(--color-primary);
    font-size: 24rpx;
    font-weight: 800;
}

.more-summary {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    font-weight: 800;
    color: var(--color-text-secondary);
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
    transition: color 0.25s;
}

.more-summary.hover-active {
    color: var(--color-primary);
}

.more-summary:focus-visible {
    outline: 2rpx solid var(--color-primary);
    outline-offset: 1rpx;
}

.more-summary.active {
    color: var(--color-primary);
}

.arrow {
    margin-right: 10rpx;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: inline-block;
}

.arrow.open {
    transform: rotate(180deg);
}

.section-body {
    margin-top: 16rpx;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: max-height 0.35s ease, opacity 0.35s ease, padding 0.35s ease;
}
.section-body.open {
    max-height: 800px;
    opacity: 1;
}

.subtask-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.subtask-count {
    color: var(--color-text-tertiary);
    font-size: 22rpx;
}

.subtask-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.subtask-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.subtask-row .fg-input {
    flex: 1;
}

.subtask-del {
    width: 64rpx;
    height: 64rpx;
    border: none;
    border-radius: 16rpx;
    background: var(--color-danger-soft);
    color: var(--color-danger);
    font-size: 32rpx;
    line-height: 64rpx;
    transition: background 0.2s, color 0.2s, transform 0.2s;
}

.subtask-del.hover-active {
    background: rgba(var(--color-danger-rgb), 0.15);
    color: var(--color-danger);
}

.subtask-del:active {
    transform: scale(var(--scale-active));
}

.subtask-del:focus-visible {
    outline: 2rpx solid var(--color-danger);
    outline-offset: 1rpx;
}

.btn-add-sub {
    margin-top: 12rpx;
    padding: 14rpx 22rpx;
    border: 2rpx dashed var(--color-border);
    border-radius: 16rpx;
    background: transparent;
    color: var(--color-text-tertiary);
    font-size: 24rpx;
    transition: border-color 0.2s, color 0.2s, background 0.2s, gap 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
}

.btn-add-sub.hover-active {
    border-color: var(--color-primary, #6366f1);
    color: var(--color-primary, #6366f1);
    background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.06);
    gap: 10rpx;
}

.btn-add-sub:active {
    transform: scale(var(--scale-active));
}

.btn-add-sub:focus-visible {
    outline: 2rpx solid var(--color-primary, #6366f1);
    outline-offset: 1rpx;
}
/* ===== Focus bar for input wraps ===== */
.fg-input-wrap {
    position: relative;
}

.focus-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4rpx;
    border-radius: 2rpx;
    background: var(--color-primary, #6366f1);
    opacity: 0;
    transition: opacity 0.22s ease;
    pointer-events: none;
}

.fg-input-wrap:focus-within .focus-bar {
    opacity: 1;
}

/* ===== Placeholder style ===== */
::v-deep .field-placeholder {
    color: var(--color-text-tertiary);
    font-style: italic;
    font-weight: 400;
}

/* ===== Keyframe animations ===== */
@keyframes overlayFadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes sheetSlideUp {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
}

@keyframes cardSlideIn {
    from {
        opacity: 0;
        transform: translateY(12rpx);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
