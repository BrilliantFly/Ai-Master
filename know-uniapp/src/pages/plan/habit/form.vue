<template>
    <view class="plan-form-page">
        <view class="form-hero">
            <text class="hero-kicker">习惯打卡</text>
            <text class="hero-title">新增习惯</text>
            <text class="hero-subtitle"
                >补齐频率、开始日期和提醒设置，让习惯计划更接近日常使用场景。</text
            >
        </view>

        <view class="form-card premium-card">
            <view class="field-block">
                <text class="field-label">习惯名称 <text class="required">*</text></text>
                <input
                    v-model="form.name"
                    class="field-input"
                    placeholder="例如：早起、阅读、运动"
                    placeholder-class="field-placeholder"
                />
            </view>

            <view class="field-block">
                <text class="field-label">描述</text>
                <textarea
                    v-model="form.description"
                    class="field-textarea"
                    placeholder="写下这个习惯的提醒或目标，可选"
                    placeholder-class="field-placeholder"
                />
            </view>

            <view class="field-block">
                <text class="field-label">习惯主题</text>
                <view class="theme-grid">
                    <view
                        v-for="theme in habitThemes"
                        :key="theme.key"
                        class="theme-chip"
                        :class="{ active: form.themeKey === theme.key }"
                        :style="themeChipStyle(theme)"
                        @tap="selectTheme(theme.key)"
                    >
                        <text class="theme-icon">{{ theme.icon }}</text>
                        <text class="theme-label">{{ theme.label }}</text>
                    </view>
                </view>
            </view>

            <view class="field-row">
                <view class="field-copy">
                    <text class="field-label">目标天数</text>
                    <text class="field-help">默认 30 天，可按习惯周期调整</text>
                </view>
                <input v-model="form.targetDays" class="days-input" type="number" />
            </view>

            <view class="field-row">
                <view class="field-copy">
                    <text class="field-label">打卡频率</text>
                    <text class="field-help">{{ frequencySummary }}</text>
                </view>
                <picker
                    :value="form.frequencyType - 1"
                    :range="frequencyOptions"
                    @change="onFrequencyChange"
                >
                    <view class="picker-pill">{{ frequencyOptions[form.frequencyType - 1] }}</view>
                </picker>
            </view>

            <view v-if="form.frequencyType === 2" class="field-row field-row-sub">
                <view class="field-copy">
                    <text class="field-label">每周次数</text>
                    <text class="field-help">填写 1 到 7 之间的次数</text>
                </view>
                <input v-model="form.weeklyTimes" class="days-input" type="number" />
            </view>

            <view v-if="form.frequencyType === 3" class="field-block field-block-sub">
                <text class="field-label">自定义频率说明</text>
                <input
                    v-model="form.customFrequency"
                    class="field-input"
                    placeholder="例如：周一、周三、周五"
                    placeholder-class="field-placeholder"
                />
            </view>

            <view class="field-row">
                <view class="field-copy">
                    <text class="field-label">开始日期</text>
                    <text class="field-help">用于生成习惯的起始记录时间</text>
                </view>
                <picker mode="date" :value="form.startDate" @change="onStartDateChange">
                    <view class="picker-pill">{{ form.startDate || '选择日期' }}</view>
                </picker>
            </view>

            <view class="field-row">
                <view class="field-copy">
                    <text class="field-label">提醒时间</text>
                    <text class="field-help">{{
                        form.reminderTime ? '已设置固定提醒时间' : '暂不提醒，可稍后补充'
                    }}</text>
                </view>
                <view class="row-actions">
                    <picker mode="time" :value="form.reminderTime" @change="onReminderChange">
                        <view class="picker-pill">{{ form.reminderTime || '选择时间' }}</view>
                    </picker>
                    <text v-if="form.reminderTime" class="clear-link" @tap="clearReminder"
                        >清除</text
                    >
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
                {{ submitting ? '保存中...' : '保存习惯' }}
            </button>
        </view>
    </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { addHabit } from '@/api/plan/habit'
import { formatYYYYMMDD } from '@/components/calendar-grid/calendar-utils.js'

const frequencyOptions = ['每天', '每周多次', '自定义']
const habitThemes = [
    { key: 'health', label: '健康', icon: '💪', color: '#22c55e' },
    { key: 'study', label: '学习', icon: '📚', color: '#3b82f6' },
    { key: 'sport', label: '运动', icon: '🏃', color: '#f97316' },
    { key: 'mood', label: '情绪', icon: '💗', color: '#ec4899' }
]

const submitting = ref(false)
const today = new Date()

const form = reactive({
    name: '',
    description: '',
    themeKey: 'health',
    targetDays: 30,
    frequencyType: 1,
    weeklyTimes: 3,
    customFrequency: '',
    startDate: formatYYYYMMDD(today.getFullYear(), today.getMonth() + 1, today.getDate()),
    reminderTime: ''
})

const selectedTheme = computed(() => {
    return habitThemes.find((item) => item.key === form.themeKey) || habitThemes[0]
})

const frequencySummary = computed(() => {
    if (form.frequencyType === 1) return '默认每天打卡一次'
    if (form.frequencyType === 2) return `当前设置为每周 ${form.weeklyTimes || 0} 次`
    return '按自定义规则记录打卡节奏'
})

const normalizeDate = (dateStr) => dateStr.replace(/-/g, '/')

const selectTheme = (key) => {
    form.themeKey = key
}

const themeChipStyle = (theme) => {
    if (form.themeKey !== theme.key) return {}
    return {
        borderColor: theme.color,
        background: `${theme.color}18`
    }
}

const onFrequencyChange = (e) => {
    form.frequencyType = Number(e.detail.value) + 1
}

const onStartDateChange = (e) => {
    form.startDate = e.detail.value
}

const onReminderChange = (e) => {
    form.reminderTime = e.detail.value
}

const clearReminder = () => {
    form.reminderTime = ''
}

const goBack = () => {
    uni.navigateBack()
}

const buildFrequencyRule = () => {
    if (form.frequencyType === 1) return ''
    if (form.frequencyType === 2) {
        return JSON.stringify({ timesPerWeek: Number(form.weeklyTimes) || 0 })
    }
    return form.customFrequency.trim()
}

const buildPayload = () => {
    return {
        name: form.name.trim(),
        description: form.description.trim(),
        icon: selectedTheme.value.icon,
        color: selectedTheme.value.color,
        targetDays: Number(form.targetDays) || 30,
        frequencyType: form.frequencyType,
        frequencyRule: buildFrequencyRule(),
        startDate: new Date(`${normalizeDate(form.startDate)} 00:00:00`).getTime(),
        reminderTime: form.reminderTime || ''
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
    if (form.frequencyType === 2) {
        const times = Number(form.weeklyTimes)
        if (!times || times < 1 || times > 7) {
            uni.showToast({ title: '每周次数需在 1 到 7 之间', icon: 'none' })
            return false
        }
    }
    if (form.frequencyType === 3 && !form.customFrequency.trim()) {
        uni.showToast({ title: '请补充自定义频率说明', icon: 'none' })
        return false
    }
    if (Number.isNaN(payload.startDate)) {
        uni.showToast({ title: '请选择有效的开始日期', icon: 'none' })
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
        await addHabit(payload)
        uni.showToast({ title: '保存成功', icon: 'success' })
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
    background: radial-gradient(
            circle at 10% 0%,
            rgba(var(--color-primary-rgb), 0.12),
            transparent 38%
        ),
        var(--color-bg-app);
    padding: 28rpx 28rpx calc(env(safe-area-inset-bottom) + 36rpx);
    box-sizing: border-box;
}

.form-hero {
    display: flex;
    flex-direction: column;
    padding: 18rpx 8rpx 26rpx;
}

.hero-kicker {
    font-size: 23rpx;
    color: var(--color-primary);
    font-weight: 700;
}

.hero-title {
    margin-top: 8rpx;
    font-size: 48rpx;
    font-weight: 800;
    color: var(--color-text);
    line-height: 1.2;
}

.hero-subtitle {
    margin-top: 12rpx;
    font-size: 25rpx;
    color: var(--color-text-secondary);
    line-height: 1.6;
}

.form-card {
    padding: 28rpx;
    border-radius: 28rpx;
}

.field-block {
    margin-bottom: 28rpx;
}

.field-block-sub {
    padding-top: 26rpx;
    border-top: 2rpx solid var(--color-border-light);
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
.days-input,
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

.field-placeholder {
    color: var(--color-text-tertiary);
}

.theme-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18rpx;
}

.theme-chip {
    display: flex;
    align-items: center;
    gap: 12rpx;
    min-height: 92rpx;
    padding: 0 22rpx;
    border-radius: 22rpx;
    border: 2rpx solid var(--color-border-light);
    background: var(--color-surface-soft);
}

.theme-chip.active {
    box-shadow: 0 10rpx 26rpx rgba(0, 0, 0, 0.06);
}

.theme-icon {
    font-size: 32rpx;
}

.theme-label {
    font-size: 26rpx;
    font-weight: 700;
    color: var(--color-text);
}

.field-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24rpx;
    padding-top: 26rpx;
    border-top: 2rpx solid var(--color-border-light);
}

.field-row-sub {
    padding-top: 20rpx;
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

.days-input {
    width: 170rpx;
    height: 74rpx;
    padding: 0 18rpx;
    text-align: center;
    font-size: 28rpx;
    font-weight: 700;
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

.row-actions {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.clear-link {
    font-size: 24rpx;
    color: var(--color-primary);
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
