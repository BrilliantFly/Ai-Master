<template>
  <view class="plan-form-page">
    <view class="form-hero">
      <text class="hero-kicker">日程计划</text>
      <text class="hero-title">新增日程</text>
      <text class="hero-subtitle">把事项、象限和日期拆开填写，保存后回到日程列表。</text>
    </view>

    <view class="form-card premium-card">
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

      <view class="field-row">
        <view class="field-copy">
          <text class="field-label">四象限</text>
          <text class="field-help">用于区分优先级</text>
        </view>
        <picker :value="form.quadrant - 1" :range="quadrantOptions" @change="onQuadrantChange">
          <view class="picker-pill">{{ quadrantOptions[form.quadrant - 1] }}</view>
        </picker>
      </view>

      <view class="field-row">
        <view class="field-copy">
          <text class="field-label">开始日期</text>
          <text class="field-help">默认使用当前选中日期</text>
        </view>
        <picker mode="date" :value="form.startDate" @change="onStartDateChange">
          <view class="picker-pill">{{ form.startDate || '选择日期' }}</view>
        </picker>
      </view>
    </view>

    <view class="form-actions">
      <button class="action-btn cancel" @tap="goBack">取消</button>
      <button class="action-btn submit" :disabled="submitting" @tap="handleSave">
        {{ submitting ? '保存中...' : '保存日程' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { addSchedule } from '@/api/plan/schedule'
import { formatYYYYMMDD } from '@/components/calendar-grid/calendar-utils.js'

const quadrantOptions = ['重要紧急', '重要不紧急', '紧急不重要', '不紧急不重要']
const submitting = ref(false)

const today = new Date()
const form = reactive({
  title: '',
  content: '',
  quadrant: 2,
  startDate: formatYYYYMMDD(today.getFullYear(), today.getMonth() + 1, today.getDate()),
  eventType: 1
})

onLoad((query = {}) => {
  if (query.date) {
    form.startDate = query.date
  }
})

const onContentInput = (e) => {
  const val = e.detail ? e.detail.value : e.target.value
  form.content = val || ''
}

const onQuadrantChange = (e) => {
  form.quadrant = Number(e.detail.value) + 1
}

const onStartDateChange = (e) => {
  form.startDate = e.detail.value
}

const goBack = () => {
  uni.navigateBack()
}

const handleSave = async () => {
  if (!form.title) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }
  if (submitting.value) return
  submitting.value = true
  try {
    await addSchedule({ ...form }, {})
    uni.showToast({ title: '添加成功', icon: 'success' })
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
  background:
    radial-gradient(circle at 10% 0%, rgba(var(--color-primary-rgb), 0.12), transparent 38%),
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

.field-placeholder {
  color: var(--color-text-tertiary);
}

.field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24rpx;
  padding: 26rpx 0;
  border-top: 2rpx solid var(--color-border-light);
}

.field-copy {
  display: flex;
  flex-direction: column;
}

.field-help {
  font-size: 22rpx;
  color: var(--color-text-tertiary);
}

.picker-pill {
  min-width: 220rpx;
  height: 74rpx;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25rpx;
  font-weight: 700;
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
