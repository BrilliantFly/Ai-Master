<template>
  <view class="plan-form-page">
    <view class="form-hero">
      <text class="hero-kicker">习惯打卡</text>
      <text class="hero-title">新增习惯</text>
      <text class="hero-subtitle">设定一个可以每天坚持的小目标，回到打卡页后会自动刷新。</text>
    </view>

    <view class="form-card premium-card">
      <view class="field-block">
        <text class="field-label">习惯名称 <text class="required">*</text></text>
        <input
          v-model="form.name"
          class="field-input"
          placeholder="例如：早睡、阅读、运动"
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

      <view class="field-row">
        <view class="field-copy">
          <text class="field-label">目标天数</text>
          <text class="field-help">默认 30 天，可按习惯周期调整</text>
        </view>
        <input
          v-model="form.targetDays"
          class="days-input"
          type="number"
        />
      </view>
    </view>

    <view class="form-actions">
      <button class="action-btn cancel" @tap="goBack">取消</button>
      <button class="action-btn submit" :disabled="submitting" @tap="handleSave">
        {{ submitting ? '保存中...' : '保存习惯' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { addHabit } from '@/api/plan/habit'

const submitting = ref(false)
const form = reactive({
  name: '',
  description: '',
  targetDays: 30
})

const goBack = () => {
  uni.navigateBack()
}

const handleSave = async () => {
  if (!form.name) {
    uni.showToast({ title: '请输入习惯名称', icon: 'none' })
    return
  }
  if (submitting.value) return
  submitting.value = true
  try {
    await addHabit({ ...form })
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
.days-input {
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
  padding-top: 26rpx;
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

.days-input {
  width: 170rpx;
  height: 74rpx;
  padding: 0 18rpx;
  text-align: center;
  font-size: 28rpx;
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
