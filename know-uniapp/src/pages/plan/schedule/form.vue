<template>
    <view class="plan-form-page">
        <view class="sheet-shell premium-card">
            <view class="sheet-handle"></view>
            <view class="sheet-header">
                <text class="sheet-kicker">日程计划</text>
                <text class="sheet-title">{{ isEdit ? '编辑日程' : '新建日程' }}</text>
                <text class="sheet-subtitle">保留当前日历不变，只调整日程表单内容与信息结构</text>
            </view>

            <view class="form-card">
                <view class="field-block">
                    <text class="field-label">日程标题 <text class="required">*</text></text>
                    <input
                        v-model="form.title"
                        class="field-input"
                        placeholder="输入日程标题"
                        placeholder-class="field-placeholder"
                    />
                </view>

                <view class="field-block">
                    <text class="field-label">描述</text>
                    <textarea
                        :value="form.content"
                        class="field-textarea"
                        placeholder="补充说明，可选"
                        placeholder-class="field-placeholder"
                        @input="onContentInput"
                    />
                </view>

                <view class="section-card">
                    <text class="section-card-title">基本信息</text>

                    <view class="field-grid">
                        <view class="field-grid-item">
                            <text class="field-label">开始日期</text>
                            <picker mode="date" :value="form.startDate" @change="onStartDateChange">
                                <view class="picker-pill picker-pill-block">{{
                                    form.startDate || '选择日期'
                                }}</view>
                            </picker>
                        </view>
                        <view class="field-grid-item">
                            <text class="field-label">分类</text>
                            <picker
                                :value="categoryIndex"
                                :range="categoryOptions"
                                range-key="name"
                                @change="onCategoryChange"
                            >
                                <view class="picker-pill picker-pill-block">{{
                                    selectedCategoryName
                                }}</view>
                            </picker>
                        </view>
                    </view>

                    <view class="field-grid">
                        <view class="field-grid-item">
                            <text class="field-label">开始时间</text>
                            <picker
                                mode="time"
                                :value="form.startClock"
                                @change="onStartClockChange"
                            >
                                <view class="picker-pill picker-pill-block">{{
                                    form.startClock || '选择时间'
                                }}</view>
                            </picker>
                        </view>
                        <view class="field-grid-item">
                            <text class="field-label">结束时间</text>
                            <picker mode="time" :value="form.endClock" @change="onEndClockChange">
                                <view class="picker-pill picker-pill-block">{{
                                    form.endClock || '选择时间'
                                }}</view>
                            </picker>
                        </view>
                    </view>

                    <view class="field-block field-block-compact">
                        <text class="field-label">地点</text>
                        <input
                            v-model="form.location"
                            class="field-input"
                            placeholder="添加地点，可选"
                            placeholder-class="field-placeholder"
                        />
                    </view>
                </view>

                <view class="section-card">
                    <text class="section-card-title">优先级设置</text>

                    <view class="field-block field-block-compact">
                        <text class="field-label">四象限</text>
                        <text class="field-help">用于区分优先级和处理方式</text>
                    </view>

                    <view class="quadrant-grid">
                        <view
                            v-for="item in quadrantCards"
                            :key="item.value"
                            class="quadrant-card"
                            :class="{ active: form.quadrant === item.value }"
                            @tap="form.quadrant = item.value"
                        >
                            <text class="quadrant-icon">{{ item.icon }}</text>
                            <text class="quadrant-name">{{ item.label }}</text>
                        </view>
                    </view>

                    <view class="field-row field-row-tight">
                        <view class="field-copy">
                            <text class="field-label">优先级</text>
                            <text class="field-help">用于详情页和列表排序展示</text>
                        </view>
                        <picker
                            :value="priorityIndex"
                            :range="priorityOptions"
                            @change="onPriorityChange"
                        >
                            <view class="picker-pill">{{ priorityOptions[priorityIndex] }}</view>
                        </picker>
                    </view>
                </view>

                <view class="section-card">
                    <text class="section-card-title">时间与提醒</text>

                    <view class="field-row field-row-tight">
                        <view class="field-copy">
                            <text class="field-label">重复设置</text>
                            <text class="field-help">{{ repeatSummary }}</text>
                        </view>
                        <picker
                            :value="repeatPickerValue"
                            :range="repeatOptions"
                            @change="onRepeatChange"
                        >
                            <view class="picker-pill">{{ repeatOptions[repeatPickerValue] }}</view>
                        </picker>
                    </view>

                    <view class="field-row field-row-tight">
                        <view class="field-copy">
                            <text class="field-label">提醒设置</text>
                            <text class="field-help">{{ remindSummary }}</text>
                        </view>
                        <picker
                            :value="form.remindIndex"
                            :range="remindLabels"
                            @change="onRemindChange"
                        >
                            <view class="picker-pill">{{ remindLabels[form.remindIndex] }}</view>
                        </picker>
                    </view>
                </view>

                <view class="section-card">
                    <view class="section-card-head">
                        <text class="section-card-title">更多设置</text>
                        <text class="section-card-tip">补齐标签、子任务和备注</text>
                    </view>

                    <view class="field-block field-block-compact">
                        <text class="field-label">标签</text>
                        <input
                            v-model="form.tags"
                            class="field-input"
                            placeholder="例如：会议, 工作, 重要"
                            placeholder-class="field-placeholder"
                        />
                        <text class="field-help field-help-inline">使用逗号分隔多个标签</text>
                    </view>

                    <view class="field-block field-block-compact">
                        <text class="field-label">子任务</text>
                        <textarea
                            :value="form.subtasksText"
                            class="field-textarea field-textarea-compact"
                            placeholder="每行一个子任务"
                            placeholder-class="field-placeholder"
                            @input="onSubtasksInput"
                        />
                    </view>

                    <view class="field-block field-block-compact">
                        <text class="field-label">备注</text>
                        <textarea
                            :value="form.note"
                            class="field-textarea field-textarea-compact"
                            placeholder="记录执行要点或补充说明，可选"
                            placeholder-class="field-placeholder"
                            @input="onNoteInput"
                        />
                    </view>
                </view>
            </view>

            <view class="form-actions">
                <button class="action-btn cancel" type="button" @tap="goBack">取消</button>
                <button
                    class="action-btn submit"
                    type="button"
                    :disabled="submitting"
                    @tap="handleSave"
                >
                    {{ submitting ? '保存中...' : isEdit ? '更新日程' : '保存日程' }}
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
    addSchedule,
    getCategoryList,
    getScheduleDetail,
    updateSchedule
} from '@/api/plan/schedule'
import { formatYYYYMMDD } from '@/components/calendar-grid/calendar-utils.js'

const quadrantCards = [
    { value: 1, label: '重要紧急', icon: '🔥' },
    { value: 2, label: '重要不紧急', icon: '📘' },
    { value: 3, label: '紧急不重要', icon: '⚡' },
    { value: 4, label: '不紧急不重要', icon: '🫧' }
]
const priorityOptions = ['P0 最高', 'P1 高', 'P2 中', 'P3 低']
const repeatOptions = ['不重复', '每天', '每周', '每月', '每年']
const remindOptions = [
    { label: '不提醒', minutes: null },
    { label: '准时提醒', minutes: 0 },
    { label: '提前 5 分钟', minutes: 5 },
    { label: '提前 15 分钟', minutes: 15 },
    { label: '提前 30 分钟', minutes: 30 },
    { label: '提前 1 小时', minutes: 60 }
]
const remindLabels = remindOptions.map((item) => item.label)

const submitting = ref(false)
const editId = ref('')
const categoryOptions = ref([{ id: null, name: '未分类' }])

const today = new Date()
const form = reactive({
    title: '',
    content: '',
    tags: '',
    subtasksText: '',
    note: '',
    quadrant: 2,
    priority: 2,
    categoryId: null,
    location: '',
    startDate: formatYYYYMMDD(today.getFullYear(), today.getMonth() + 1, today.getDate()),
    startClock: '09:00',
    endClock: '10:00',
    repeatType: 0,
    remindIndex: 0,
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

const priorityIndex = computed(() => {
    if (form.priority === 3) return 1
    if (form.priority === 2) return 2
    if (form.priority === 1) return 3
    return 2
})

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
    return remindOptions[form.remindIndex].minutes === null
        ? '保存后不会发送提醒'
        : '将在开始前按设定时间提醒'
})

onLoad(async (query = {}) => {
    if (query.date) {
        form.startDate = query.date
    }
    await loadCategories()
    if (query.id) {
        editId.value = query.id
        await loadDetail(query.id)
    }
})

const normalizeDate = (dateStr) => dateStr.replace(/-/g, '/')

const buildTimestamp = (dateStr, clock) => {
    return new Date(`${normalizeDate(dateStr)} ${clock}`).getTime()
}

const formatDateTimeText = (timestamp) => {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
}

const formatClock = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(
        2,
        '0'
    )}`
}

const parseSubtasksText = (raw) => {
    if (!raw) return ''
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
                .join('\n')
        }
    } catch (error) {
        return raw
    }
    return raw
}

const serializeSubtasks = (text) => {
    const list = (text || '')
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)
    return list.length ? JSON.stringify(list) : ''
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
        form.content = detail.content || ''
        form.tags = detail.tags || ''
        form.subtasksText = parseSubtasksText(detail.subtasks)
        form.note = detail.note || ''
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
        const remindIndex = remindOptions.findIndex(
            (item) => String(item.minutes) === String(detail.remindMinutes)
        )
        form.remindIndex = remindIndex >= 0 ? remindIndex : 0
    } catch (error) {
        console.error('加载日程详情失败', error)
    }
}

const onContentInput = (e) => {
    const value = e.detail ? e.detail.value : e.target.value
    form.content = value || ''
}

const onSubtasksInput = (e) => {
    const value = e.detail ? e.detail.value : e.target.value
    form.subtasksText = value || ''
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
    form.priority = [3, 3, 2, 1][index] || 2
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

const onRemindChange = (e) => {
    form.remindIndex = Number(e.detail.value)
}

const goBack = () => {
    uni.navigateBack()
}

const buildPayload = () => {
    const startTime = buildTimestamp(form.startDate, form.startClock)
    const endTime = buildTimestamp(form.startDate, form.endClock)
    const remindConfig = remindOptions[form.remindIndex]
    const remindMinutes = remindConfig.minutes
    const remindTime =
        remindMinutes === null ? '' : formatDateTimeText(startTime - remindMinutes * 60 * 1000)

    return {
        id: editId.value || undefined,
        title: form.title.trim(),
        content: form.content.trim(),
        tags: normalizeTags(form.tags),
        subtasks: serializeSubtasks(form.subtasksText),
        note: form.note.trim(),
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
            await addSchedule(payload, {})
            uni.showToast({ title: '添加成功', icon: 'success' })
        }
        setTimeout(() => uni.navigateBack(), 500)
    } catch (error) {
        console.error(error)
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped lang="scss">
.plan-form-page {
    min-height: 100vh;
    background: linear-gradient(
            180deg,
            rgba(var(--color-primary-rgb), 0.08),
            rgba(var(--color-primary-rgb), 0)
        ),
        var(--color-bg-app);
    padding: 18rpx 18rpx calc(env(safe-area-inset-bottom) + 28rpx);
    box-sizing: border-box;
}

.sheet-shell {
    max-width: 720rpx;
    margin: 0 auto;
    padding: 18rpx 24rpx 28rpx;
    border-radius: 32rpx;
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

.sheet-subtitle {
    margin-top: 12rpx;
    font-size: 25rpx;
    color: var(--color-text-secondary);
    line-height: 1.6;
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
    background: var(--color-surface-soft);
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
    background: var(--color-surface-soft);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
}

.quadrant-card.active {
    border-color: var(--color-primary);
    background: var(--color-primary-mist);
    box-shadow: 0 10rpx 24rpx rgba(var(--color-primary-rgb), 0.12);
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
}

.action-btn.cancel {
    background: var(--color-surface);
    color: var(--color-text-secondary);
    border: 2rpx solid var(--color-border-light);
}

.action-btn.submit {
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
    color: #fff;
    box-shadow: var(--shadow-glow);
}

.action-btn[disabled] {
    opacity: 0.65;
}
</style>
