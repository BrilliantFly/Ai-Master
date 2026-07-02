<template>
    <view class="plan-form-page">
        <view class="modal-sheet">
            <view class="modal-handle"></view>
            <text class="modal-title">{{ isEdit ? '编辑目标' : '新建目标' }}</text>

            <view class="form-card-schedule">
                <text class="form-card-header">基本设置</text>

                <view class="fgs-full">
                    <text class="fg-label">🎨 图标 <text class="required">*</text></text>
                    <view class="icon-preview-row" @tap="toggleIconPicker">
                        <view class="ip-badge" :style="{ background: selectedTheme.color }">
                            {{ selectedTheme.icon }}
                        </view>
                        <text class="ip-name">{{ selectedTheme.label }}</text>
                        <text class="ip-arrow">{{ iconPickerVisible ? '⌃' : '›' }}</text>
                    </view>
                    <view v-if="iconPickerVisible" class="icon-grid">
                        <view
                            v-for="theme in habitThemes"
                            :key="theme.key"
                            class="icon-chip"
                            :class="{ active: form.themeKey === theme.key }"
                            @tap.stop="selectTheme(theme.key)"
                        >
                            <view class="icon-chip-badge" :style="{ background: theme.color }">
                                {{ theme.icon }}
                            </view>
                            <text class="icon-chip-name">{{ theme.label }}</text>
                        </view>
                    </view>
                </view>

                <view class="fgs-full">
                    <text class="fg-label">📝 名称 <text class="required">*</text></text>
                    <view class="fg-input-wrap">
                        <input
                            v-model="form.name"
                            class="fg-input"
                            maxlength="20"
                            placeholder="如：每日跑步"
                            placeholder-class="field-placeholder"
                        />
                    </view>
                </view>

                <view class="fgs-full">
                    <text class="fg-label">🎯 目标值</text>
                    <view class="fg-input-wrap">
                        <input v-model="form.targetValue" class="fg-input" type="number" />
                    </view>
                </view>

                <view class="fgs-full">
                    <text class="fg-label">🔘 打卡方式</text>
                    <view class="track-type-row">
                        <view
                            class="track-type-opt"
                            :class="{ active: form.trackingType === 'boolean' }"
                            @tap="form.trackingType = 'boolean'"
                        >
                            ✅ 打卡/未打卡
                        </view>
                        <view
                            class="track-type-opt"
                            :class="{ active: form.trackingType === 'numeric' }"
                            @tap="form.trackingType = 'numeric'"
                        >
                            🔢 记录数值
                        </view>
                    </view>
                </view>

                <view class="fgs-row">
                    <view class="fgs-cell">
                        <text class="fg-label">🏷️ 分类</text>
                        <picker
                            :value="categoryIndex"
                            :range="categoryOptions"
                            @change="onCategoryChange"
                        >
                            <view class="fg-select">{{ categoryOptions[categoryIndex] }}</view>
                        </picker>
                    </view>
                    <view class="fgs-cell">
                        <text class="fg-label">单位</text>
                        <view class="fg-input-wrap">
                            <input
                                v-model="form.targetUnit"
                                class="fg-input"
                                placeholder="次"
                                placeholder-class="field-placeholder"
                            />
                        </view>
                    </view>
                </view>
            </view>

            <view class="form-card-schedule">
                <text class="form-card-header">目标设置</text>
                <view class="fgs-full">
                    <text class="fg-label">📖 目标描述</text>
                    <textarea
                        v-model="form.description"
                        class="fg-textarea"
                        maxlength="200"
                        placeholder="写下你的目标…"
                        placeholder-class="field-placeholder"
                    />
                </view>
                <view class="fgs-full">
                    <text class="fg-label">💪 激励语</text>
                    <view class="fg-input-wrap">
                        <input
                            v-model="form.motto"
                            class="fg-input"
                            maxlength="50"
                            placeholder="给自己的鼓励"
                            placeholder-class="field-placeholder"
                        />
                    </view>
                </view>
            </view>

            <view class="form-card-schedule">
                <text class="form-card-header">时间与外观</text>
                <view class="fgs-row">
                    <view class="fgs-cell">
                        <text class="fg-label">🔄 频率</text>
                        <view class="freq-row">
                            <input
                                v-model="form.freqTarget"
                                class="fg-input freq-input"
                                type="number"
                            />
                            <picker
                                :value="frequencyPeriodIndex"
                                :range="frequencyPeriodLabels"
                                @change="onFrequencyPeriodChange"
                            >
                                <view class="fg-select freq-select">{{
                                    frequencyPeriodLabels[frequencyPeriodIndex]
                                }}</view>
                            </picker>
                        </view>
                    </view>
                    <view class="fgs-cell">
                        <text class="fg-label">🕐 时间段</text>
                        <picker
                            :value="timePeriodIndex"
                            :range="timePeriodLabels"
                            @change="onTimePeriodChange"
                        >
                            <view class="fg-select">{{ timePeriodLabels[timePeriodIndex] }}</view>
                        </picker>
                    </view>
                </view>

                <view class="fgs-row">
                    <view class="fgs-cell">
                        <text class="fg-label">🔔 提醒时间</text>
                        <picker mode="time" :value="form.reminderTime" @change="onReminderChange">
                            <view class="fg-select">{{ form.reminderTime || '选择时间' }}</view>
                        </picker>
                    </view>
                    <view class="fgs-cell">
                        <text class="fg-label">📅 开始日期</text>
                        <picker mode="date" :value="form.startDate" @change="onStartDateChange">
                            <view class="fg-select">{{ form.startDate || '选择日期' }}</view>
                        </picker>
                    </view>
                </view>

                <view class="fgs-full">
                    <text class="fg-label">🎨 颜色标识</text>
                    <view class="color-strip">
                        <view
                            v-for="color in colorOptions"
                            :key="color"
                            class="color-opt"
                            :class="{ active: form.color === color }"
                            :style="{ background: color }"
                            @tap="selectColor(color)"
                        ></view>
                    </view>
                </view>

                <view class="switch-row">
                    <text class="fg-label mb-0">✅ 允许补卡</text>
                    <view
                        class="slider-toggle"
                        :class="{ on: form.allowBackfill }"
                        @tap="form.allowBackfill = !form.allowBackfill"
                    >
                        <view class="knob"></view>
                    </view>
                </view>
            </view>

            <view class="form-card-schedule more-card">
                <view class="more-summary" @tap="moreOpen = !moreOpen">
                    <text
                        ><text class="arrow">{{ moreOpen ? '▼' : '▶' }}</text> 更多设置</text
                    >
                </view>
                <view v-if="moreOpen" class="more-body">
                    <view class="fgs-row">
                        <view class="fgs-cell">
                            <text class="fg-label">📅 结束日期</text>
                            <picker mode="date" :value="form.endDate" @change="onEndDateChange">
                                <view class="fg-select">{{ form.endDate || '不设置' }}</view>
                            </picker>
                        </view>
                        <view class="fgs-cell">
                            <text class="fg-label">😴 休息日</text>
                            <view class="rest-days-strip">
                                <view
                                    v-for="day in restDayOptions"
                                    :key="day.value"
                                    class="rd-btn"
                                    :class="{ active: form.restDays.includes(day.value) }"
                                    @tap="toggleRestDay(day.value)"
                                >
                                    {{ day.label }}
                                </view>
                            </view>
                        </view>
                    </view>

                    <view class="fgs-row">
                        <view class="fgs-cell">
                            <text class="fg-label">🔔 第二提醒</text>
                            <picker
                                mode="time"
                                :value="form.secondReminder"
                                @change="onSecondReminderChange"
                            >
                                <view class="fg-select">{{ form.secondReminder || '不设置' }}</view>
                            </picker>
                        </view>
                        <view class="fgs-cell">
                            <text class="fg-label">目标天数</text>
                            <view class="fg-input-wrap">
                                <input v-model="form.targetDays" class="fg-input" type="number" />
                            </view>
                        </view>
                    </view>

                    <view class="fgs-full">
                        <text class="fg-label">💬 备注</text>
                        <textarea
                            v-model="form.note"
                            class="fg-textarea"
                            placeholder="可选备注…"
                            placeholder-class="field-placeholder"
                        />
                    </view>
                </view>
            </view>

            <view class="btn-row">
                <button class="btn-secondary" type="button" @tap="goBack">取消</button>
                <button class="btn-secondary template-btn" type="button" @tap="saveAsTemplate">
                    💾 存为模板
                </button>
                <button class="btn-primary" type="button" :disabled="submitting" @tap="handleSave">
                    {{ submitting ? '保存中...' : '保存打卡' }}
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { addHabit, getHabitDetail, updateHabit } from '@/api/plan/habit'
import { formatYYYYMMDD } from '@/components/calendar-grid/calendar-utils.js'

const categoryOptions = ['健康', '学习', '工作', '生活']
const frequencyPeriods = [
    { value: 'daily', label: '/每天', type: 1 },
    { value: 'weekday', label: '/工作日', type: 3 },
    { value: 'weekend', label: '/周末', type: 3 },
    { value: 'weekly', label: '/每周', type: 2 },
    { value: 'monthly', label: '/每月', type: 3 }
]
const timePeriods = [
    { value: 'all', label: '全天' },
    { value: 'morning', label: '早上' },
    { value: 'noon', label: '中午' },
    { value: 'afternoon', label: '下午' },
    { value: 'evening', label: '晚上' }
]
const colorOptions = [
    '#5b5bd6',
    '#22b573',
    '#f0a020',
    '#e85a5a',
    '#f97316',
    '#a855f7',
    '#06b6d4',
    '#6366f1'
]
const restDayOptions = [
    { value: '1', label: '一' },
    { value: '2', label: '二' },
    { value: '3', label: '三' },
    { value: '4', label: '四' },
    { value: '5', label: '五' },
    { value: '6', label: '六' },
    { value: '0', label: '日' }
]
const habitThemes = [
    { key: 'run', label: '跑步', icon: '🏃', color: '#6366f1' },
    { key: 'read', label: '阅读', icon: '📚', color: '#ef4444' },
    { key: 'fitness', label: '健身', icon: '💪', color: '#f59e0b' },
    { key: 'meditation', label: '冥想', icon: '🧘', color: '#10b981' },
    { key: 'write', label: '写作', icon: '✍️', color: '#06b6d4' },
    { key: 'water', label: '喝水', icon: '💧', color: '#3b82f6' },
    { key: 'food', label: '健康饮食', icon: '🥗', color: '#22c55e' },
    { key: 'brain', label: '脑力', icon: '🧠', color: '#a855f7' },
    { key: 'clean', label: '整理', icon: '🧹', color: '#f97316' },
    { key: 'goal', label: '目标', icon: '🎯', color: '#ec4899' },
    { key: 'music', label: '音乐', icon: '🎵', color: '#8b5cf6' },
    { key: 'photo', label: '摄影', icon: '📷', color: '#14b8a6' },
    { key: 'morning', label: '早起', icon: '🌄', color: '#f59e0b' },
    { key: 'diary', label: '日记', icon: '📝', color: '#6366f1' },
    { key: 'code', label: '编程', icon: '👨‍💻', color: '#3b82f6' },
    { key: 'habit', label: '习惯', icon: '🌱', color: '#22c55e' },
    { key: 'care', label: '关爱', icon: '❤️', color: '#ef4444' },
    { key: 'money', label: '理财', icon: '💰', color: '#f59e0b' }
]

const submitting = ref(false)
const editId = ref('')
const iconPickerVisible = ref(false)
const moreOpen = ref(false)
const today = new Date()

const form = reactive({
    name: '',
    description: '',
    motto: '',
    themeKey: 'goal',
    color: '#5b5bd6',
    category: '健康',
    targetValue: 1,
    targetUnit: '次',
    trackingType: 'boolean',
    note: '',
    targetDays: 30,
    freqTarget: 1,
    freqPeriod: 'daily',
    timePeriod: 'all',
    allowBackfill: true,
    restDays: [],
    startDate: formatYYYYMMDD(today.getFullYear(), today.getMonth() + 1, today.getDate()),
    endDate: '',
    reminderTime: '09:00',
    secondReminder: ''
})

const selectedTheme = computed(() => {
    return habitThemes.find((item) => item.key === form.themeKey) || habitThemes[0]
})
const isEdit = computed(() => !!editId.value)
const categoryIndex = computed(() => {
    const index = categoryOptions.findIndex((item) => item === form.category)
    return index >= 0 ? index : 0
})
const frequencyPeriodIndex = computed(() => {
    const index = frequencyPeriods.findIndex((item) => item.value === form.freqPeriod)
    return index >= 0 ? index : 0
})
const frequencyPeriodLabels = computed(() => frequencyPeriods.map((item) => item.label))
const timePeriodIndex = computed(() => {
    const index = timePeriods.findIndex((item) => item.value === form.timePeriod)
    return index >= 0 ? index : 0
})
const timePeriodLabels = computed(() => timePeriods.map((item) => item.label))

onLoad(async (query = {}) => {
    if (query.id) {
        editId.value = query.id
        await loadDetail(query.id)
    }
})

const normalizeDate = (dateStr) => dateStr.replace(/-/g, '/')
const formatDateValue = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return formatYYYYMMDD(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

const parseFrequencyRule = (detail) => {
    form.freqTarget = 1
    if (detail.frequencyType === 2) {
        try {
            const parsed = JSON.parse(detail.frequencyRule || '{}')
            form.freqTarget = parsed.timesPerWeek || 1
            form.freqPeriod = 'weekly'
        } catch {
            form.freqPeriod = 'weekly'
        }
        return
    }
    if (detail.frequencyType === 3 && detail.frequencyRule) {
        try {
            const parsed = JSON.parse(detail.frequencyRule)
            form.freqTarget = parsed.target || 1
            form.freqPeriod = parsed.period || 'daily'
            return
        } catch {
            form.freqPeriod = detail.frequencyRule || 'daily'
            return
        }
    }
    form.freqPeriod = 'daily'
}

const loadDetail = async (id) => {
    try {
        const detail = await getHabitDetail(id)
        if (!detail) return
        form.name = detail.name || ''
        form.description = detail.description || ''
        form.motto = detail.motto || ''
        const matchedTheme =
            habitThemes.find((item) => item.icon === detail.icon) ||
            habitThemes.find((item) => item.color === detail.color) ||
            habitThemes[9]
        form.themeKey = matchedTheme.key
        form.color = detail.color || matchedTheme.color || '#5b5bd6'
        form.targetDays = detail.targetDays || 30
        form.category = detail.category || '健康'
        form.targetValue = detail.targetValue || 1
        form.targetUnit = detail.targetUnit || '次'
        form.trackingType = detail.trackingType || 'boolean'
        form.note = detail.note || ''
        form.timePeriod = detail.timePeriod || 'all'
        form.allowBackfill = detail.allowBackfill !== false
        form.restDays = detail.restDays ? String(detail.restDays).split(',').filter(Boolean) : []
        form.startDate = formatDateValue(detail.startDate) || form.startDate
        form.endDate = formatDateValue(detail.endDate)
        form.reminderTime = detail.reminderTime || ''
        form.secondReminder = detail.secondReminder || ''
        parseFrequencyRule(detail)
    } catch (error) {
        console.error('加载习惯详情失败', error)
    }
}

const toggleIconPicker = () => {
    iconPickerVisible.value = !iconPickerVisible.value
}

const selectTheme = (key) => {
    const theme = habitThemes.find((item) => item.key === key)
    if (!theme) return
    form.themeKey = key
    form.color = theme.color
    iconPickerVisible.value = false
}

const selectColor = (color) => {
    form.color = color
}

const onCategoryChange = (e) => {
    form.category = categoryOptions[Number(e.detail.value)] || '健康'
}

const onFrequencyPeriodChange = (e) => {
    form.freqPeriod = frequencyPeriods[Number(e.detail.value)]?.value || 'daily'
}

const onTimePeriodChange = (e) => {
    form.timePeriod = timePeriods[Number(e.detail.value)]?.value || 'all'
}

const onStartDateChange = (e) => {
    form.startDate = e.detail.value
}

const onEndDateChange = (e) => {
    form.endDate = e.detail.value
}

const onReminderChange = (e) => {
    form.reminderTime = e.detail.value
}

const onSecondReminderChange = (e) => {
    form.secondReminder = e.detail.value
}

const toggleRestDay = (value) => {
    if (form.restDays.includes(value)) {
        form.restDays = form.restDays.filter((item) => item !== value)
        return
    }
    form.restDays = [...form.restDays, value]
}

const goBack = () => {
    uni.navigateBack()
}

const saveAsTemplate = () => {
    uni.showToast({ title: '模板入口已预留', icon: 'none' })
}

const buildFrequencyRule = () => {
    if (form.freqPeriod === 'daily') return ''
    if (form.freqPeriod === 'weekly') {
        return JSON.stringify({ timesPerWeek: Number(form.freqTarget) || 1 })
    }
    return JSON.stringify({ target: Number(form.freqTarget) || 1, period: form.freqPeriod })
}

const buildFrequencyType = () => {
    const period = frequencyPeriods.find((item) => item.value === form.freqPeriod)
    return period?.type || 1
}

const toTimestamp = (dateStr) => {
    if (!dateStr) return null
    const value = new Date(`${normalizeDate(dateStr)} 00:00:00`).getTime()
    return Number.isNaN(value) ? null : value
}

const buildPayload = () => {
    return {
        id: editId.value || undefined,
        name: form.name.trim(),
        description: form.description.trim(),
        motto: form.motto.trim(),
        icon: selectedTheme.value.icon,
        color: form.color || selectedTheme.value.color,
        category: form.category,
        targetValue: Number(form.targetValue) || 1,
        targetUnit: form.targetUnit.trim() || '次',
        trackingType: form.trackingType,
        note: form.note.trim(),
        targetDays: Number(form.targetDays) || 30,
        frequencyType: buildFrequencyType(),
        frequencyRule: buildFrequencyRule(),
        timePeriod: form.timePeriod,
        allowBackfill: form.allowBackfill,
        restDays: form.restDays.join(','),
        startDate: toTimestamp(form.startDate),
        endDate: toTimestamp(form.endDate),
        reminderTime: form.reminderTime || '',
        secondReminder: form.secondReminder || ''
    }
}

const validate = (payload) => {
    if (!payload.name) {
        uni.showToast({ title: '请输入习惯名称', icon: 'none' })
        return false
    }
    if (!payload.targetDays || payload.targetDays <= 0) {
        uni.showToast({ title: '目标天数需大于 0', icon: 'none' })
        return false
    }
    if (!payload.startDate) {
        uni.showToast({ title: '请选择有效的开始日期', icon: 'none' })
        return false
    }
    if (payload.endDate && payload.endDate < payload.startDate) {
        uni.showToast({ title: '结束日期不能早于开始日期', icon: 'none' })
        return false
    }
    return true
}

const handleSave = async () => {
    if (submitting.value) return
    const payload = buildPayload()
    if (!validate(payload)) return

    submitting.value = true
    try {
        if (isEdit.value) {
            await updateHabit(payload)
            uni.showToast({ title: '更新成功', icon: 'success' })
        } else {
            await addHabit(payload)
            uni.showToast({ title: '保存成功', icon: 'success' })
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
    background: var(--color-bg-app);
    padding: 20rpx 18rpx calc(env(safe-area-inset-bottom) + 30rpx);
    box-sizing: border-box;
}

.modal-sheet {
    max-width: 720rpx;
    margin: 0 auto;
    padding: 24rpx;
    border-radius: 30rpx;
    background: var(--color-surface);
    box-shadow: 0 24rpx 70rpx rgba(15, 23, 42, 0.12);
}

.modal-handle {
    width: 76rpx;
    height: 8rpx;
    border-radius: 999rpx;
    background: var(--color-border);
    margin: 0 auto 18rpx;
}

.modal-title {
    display: block;
    margin-bottom: 22rpx;
    font-size: 38rpx;
    font-weight: 800;
    color: var(--color-text);
}

.form-card-schedule {
    margin-bottom: 18rpx;
    padding: 22rpx;
    border-radius: 24rpx;
    background: var(--color-surface-soft);
    border: 2rpx solid var(--color-border-light);
}

.form-card-header {
    display: block;
    margin-bottom: 18rpx;
    font-size: 29rpx;
    font-weight: 800;
    color: var(--color-text);
}

.fgs-full {
    margin-top: 18rpx;
}

.fgs-full:first-of-type {
    margin-top: 0;
}

.fgs-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18rpx;
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
    color: var(--color-text);
}

.mb-0 {
    margin-bottom: 0;
}

.required {
    color: var(--color-danger);
}

.fg-input-wrap,
.fg-select,
.fg-input,
.fg-textarea {
    width: 100%;
    box-sizing: border-box;
    border-radius: 18rpx;
    border: 2rpx solid var(--color-border-light);
    background: var(--color-surface);
}

.fg-input,
.fg-select {
    height: 82rpx;
    padding: 0 20rpx;
    font-size: 26rpx;
    color: var(--color-text);
}

.fg-select {
    display: flex;
    align-items: center;
    font-weight: 700;
}

.fg-textarea {
    min-height: 128rpx;
    padding: 18rpx 20rpx;
    font-size: 26rpx;
    line-height: 1.55;
    color: var(--color-text);
}

.field-placeholder {
    color: var(--color-text-tertiary);
}

.icon-preview-row {
    min-height: 88rpx;
    padding: 0 20rpx;
    border-radius: 18rpx;
    border: 2rpx solid var(--color-border-light);
    background: var(--color-surface);
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.ip-badge,
.icon-chip-badge {
    width: 56rpx;
    height: 56rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 30rpx;
}

.ip-name {
    flex: 1;
    font-size: 26rpx;
    font-weight: 700;
    color: var(--color-text);
}

.ip-arrow {
    font-size: 34rpx;
    color: var(--color-text-tertiary);
}

.icon-grid {
    margin-top: 14rpx;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12rpx;
}

.icon-chip {
    min-height: 94rpx;
    padding: 12rpx 8rpx;
    border-radius: 18rpx;
    border: 2rpx solid var(--color-border-light);
    background: var(--color-surface);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
}

.icon-chip.active {
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
}

.icon-chip-name {
    font-size: 21rpx;
    font-weight: 700;
    color: var(--color-text-secondary);
}

.track-type-row {
    display: flex;
    gap: 14rpx;
}

.track-type-opt {
    flex: 1;
    min-height: 72rpx;
    border-radius: 16rpx;
    border: 3rpx solid var(--color-border-light);
    background: var(--color-surface);
    color: var(--color-text-secondary);
    font-size: 24rpx;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
}

.track-type-opt.active {
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
    color: var(--color-primary);
}

.freq-row {
    display: flex;
    gap: 10rpx;
}

.freq-input {
    width: 96rpx;
    text-align: center;
    font-weight: 800;
}

.freq-select {
    flex: 1;
}

.color-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 14rpx;
}

.color-opt {
    width: 50rpx;
    height: 50rpx;
    border-radius: 999rpx;
    border: 4rpx solid #fff;
    box-shadow: 0 0 0 2rpx rgba(15, 23, 42, 0.08);
}

.color-opt.active {
    box-shadow: 0 0 0 5rpx var(--color-primary-soft);
    transform: scale(1.08);
}

.switch-row {
    margin-top: 20rpx;
    min-height: 74rpx;
    padding: 0 18rpx;
    border-radius: 18rpx;
    background: var(--color-surface);
    border: 2rpx solid var(--color-border-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.slider-toggle {
    width: 92rpx;
    height: 50rpx;
    padding: 4rpx;
    border-radius: 999rpx;
    background: var(--color-border);
    box-sizing: border-box;
    transition: background 0.2s ease;
}

.slider-toggle.on {
    background: var(--color-primary);
}

.knob {
    width: 42rpx;
    height: 42rpx;
    border-radius: 999rpx;
    background: #fff;
    transition: transform 0.2s ease;
}

.slider-toggle.on .knob {
    transform: translateX(42rpx);
}

.more-card {
    background: var(--color-surface);
}

.more-summary {
    font-size: 26rpx;
    font-weight: 800;
    color: var(--color-text);
}

.arrow {
    margin-right: 8rpx;
    color: var(--color-primary);
}

.more-body {
    margin-top: 18rpx;
}

.rest-days-strip {
    display: flex;
    gap: 6rpx;
    flex-wrap: wrap;
}

.rd-btn {
    width: 42rpx;
    height: 42rpx;
    border-radius: 12rpx;
    border: 2rpx solid var(--color-border-light);
    background: var(--color-surface-soft);
    color: var(--color-text-secondary);
    font-size: 20rpx;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
}

.rd-btn.active {
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
    color: var(--color-primary);
}

.btn-row {
    display: flex;
    gap: 14rpx;
    margin-top: 22rpx;
}

.btn-primary,
.btn-secondary {
    height: 86rpx;
    border-radius: 18rpx;
    border: none;
    font-size: 27rpx;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-primary {
    flex: 1.15;
    color: #fff;
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
    box-shadow: var(--shadow-glow);
}

.btn-secondary {
    flex: 1;
    color: var(--color-text-secondary);
    background: var(--color-surface);
    border: 2rpx solid var(--color-border-light);
}

.template-btn {
    flex: 1.08;
}

.btn-primary[disabled] {
    opacity: 0.65;
}

@media (max-width: 360px) {
    .fgs-row {
        grid-template-columns: 1fr;
    }

    .btn-row {
        flex-direction: column;
    }
}
</style>
