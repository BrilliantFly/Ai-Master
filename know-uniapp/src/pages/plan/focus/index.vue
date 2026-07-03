<template>
    <view class="plan-focus-page">
        <view class="page-header">
            <view>
                <text class="page-title">番茄专注</text>
                <text class="page-subtitle">25 分钟专注，5 分钟休息，让节奏更可持续</text>
            </view>
        </view>

        <view class="focus-hero premium-card">
            <text class="phase-kicker">{{ phaseMeta.kicker }}</text>
            <text class="phase-title">{{ phaseMeta.title }}</text>
            <text class="phase-desc">{{ phaseMeta.desc }}</text>

            <view class="timer-shell">
                <view class="timer-ring" :style="timerRingStyle">
                    <view class="timer-center">
                        <text class="timer-time">{{ formattedRemaining }}</text>
                        <text class="timer-label">{{ phaseMeta.short }}</text>
                    </view>
                </view>
            </view>

            <view class="timer-progress">
                <view class="progress-track">
                    <view class="progress-fill" :style="{ width: `${progressPercent}%` }"></view>
                </view>
                <text class="progress-text">{{ progressPercent }}%</text>
            </view>
        </view>

        <view class="action-row">
            <button class="action-btn action-btn-primary" type="button" @tap="toggleTimer">
                {{ isRunning ? '暂停' : hasStarted ? '继续' : '开始专注' }}
            </button>
            <button class="action-btn action-btn-secondary" type="button" @tap="skipPhase">
                跳过阶段
            </button>
        </view>

        <view class="action-row compact">
            <button class="chip-btn" type="button" @tap="resetTimer">重置</button>
            <button class="chip-btn" type="button" @tap="switchToFocus">切回专注</button>
            <button class="chip-btn" type="button" @tap="switchToBreak">进入休息</button>
        </view>

        <view class="stats-card premium-card">
            <view class="section-head">
                <text class="section-title">今日专注记录</text>
                <text class="section-badge">{{ completedFocusCount }} 个番茄</text>
            </view>
            <view class="stats-grid">
                <view class="stat-item">
                    <text class="stat-value">{{ completedFocusCount }}</text>
                    <text class="stat-label">完成轮次</text>
                </view>
                <view class="stat-item">
                    <text class="stat-value">{{ totalFocusMinutes }}</text>
                    <text class="stat-label">专注分钟</text>
                </view>
                <view class="stat-item">
                    <text class="stat-value">{{ currentStreak }}</text>
                    <text class="stat-label">连续专注轮</text>
                </view>
            </view>
        </view>

        <view class="timeline-card premium-card">
            <view class="section-head">
                <text class="section-title">专注节奏</text>
                <text class="section-badge secondary">{{ cycleLabel }}</text>
            </view>
            <view class="timeline-list">
                <view
                    v-for="(item, index) in sessionHistory"
                    :key="`${item.phase}-${item.finishedAt}-${index}`"
                    class="timeline-item"
                >
                    <view class="timeline-dot" :class="item.phase"></view>
                    <view class="timeline-copy">
                        <text class="timeline-name">{{
                            item.phase === 'focus' ? '完成专注' : '完成休息'
                        }}</text>
                        <text class="timeline-desc">{{
                            item.phase === 'focus'
                                ? `${FOCUS_MINUTES} 分钟专注完成`
                                : `${item.durationMinutes} 分钟休息完成`
                        }}</text>
                    </view>
                    <text class="timeline-time">{{ formatClock(item.finishedAt) }}</text>
                </view>
                <view v-if="!sessionHistory.length" class="empty-tip">
                    今天还没有专注记录，开始第一轮吧。
                </view>
            </view>
        </view>

        <PremiumBottomNav active="plan" />
    </view>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import PremiumBottomNav from '@/components/PremiumBottomNav.vue'
import { addFocusSession, getTodayFocusStats } from '@/api/plan/focus'
import {
    BREAK_MINUTES,
    FOCUS_MINUTES,
    FOCUS_STORAGE_KEY,
    LONG_BREAK_EVERY,
    LONG_BREAK_MINUTES,
    buildFocusTodayKey,
    normalizeFocusHistory,
    saveFocusState
} from '@/utils/focus'

const phase = ref('focus')
const isRunning = ref(false)
const hasStarted = ref(false)
const remainingSeconds = ref(FOCUS_MINUTES * 60)
const completedFocusCount = ref(0)
const completedBreakCount = ref(0)
const currentStreak = ref(0)
const sessionHistory = ref([])

let timerId = null

const phaseDurations = {
    focus: FOCUS_MINUTES * 60,
    break: BREAK_MINUTES * 60,
    longBreak: LONG_BREAK_MINUTES * 60
}

const currentPhaseDuration = computed(() => {
    return phaseDurations[phase.value] || phaseDurations.focus
})

const progressPercent = computed(() => {
    const elapsed = currentPhaseDuration.value - remainingSeconds.value
    if (!currentPhaseDuration.value) return 0
    return Math.min(100, Math.max(0, Math.round((elapsed / currentPhaseDuration.value) * 100)))
})

const formattedRemaining = computed(() => {
    const minutes = Math.floor(remainingSeconds.value / 60)
    const seconds = remainingSeconds.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const totalFocusMinutes = computed(() => completedFocusCount.value * FOCUS_MINUTES)

const cycleLabel = computed(() => {
    const currentCycle = (completedFocusCount.value % LONG_BREAK_EVERY) + 1
    return `第 ${currentCycle} / ${LONG_BREAK_EVERY} 轮`
})

const phaseMeta = computed(() => {
    if (phase.value === 'focus') {
        return {
            kicker: 'Focus Mode',
            title: '专注进行中',
            short: '专注阶段',
            desc: '屏蔽杂讯，把这一段时间留给最重要的事情。'
        }
    }
    if (phase.value === 'longBreak') {
        return {
            kicker: 'Recovery Mode',
            title: '长休息时间',
            short: '长休息',
            desc: '连续完成多轮后，给自己一段更完整的恢复时间。'
        }
    }
    return {
        kicker: 'Break Mode',
        title: '短休息时间',
        short: '短休息',
        desc: '离开屏幕、活动一下，再回来继续下一轮专注。'
    }
})

const timerRingStyle = computed(() => {
    const activeColor =
        phase.value === 'focus'
            ? 'var(--color-primary)'
            : phase.value === 'longBreak'
            ? 'var(--color-warning)'
            : 'var(--color-success)'
    const trackColor = 'rgba(15, 23, 42, 0.08)'
    return {
        background: `conic-gradient(${activeColor} ${progressPercent.value}%, ${trackColor} 0%)`
    }
})

const persistState = () => {
    const payload = {
        phase: phase.value,
        isRunning: isRunning.value,
        hasStarted: hasStarted.value,
        remainingSeconds: remainingSeconds.value,
        completedFocusCount: completedFocusCount.value,
        completedBreakCount: completedBreakCount.value,
        currentStreak: currentStreak.value,
        sessionHistory: sessionHistory.value,
        savedAt: Date.now(),
        todayKey: buildFocusTodayKey()
    }
    saveFocusState(payload)
}

const restoreState = () => {
    try {
        const raw = uni.getStorageSync(FOCUS_STORAGE_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw)
        const sameDay = parsed.todayKey === buildFocusTodayKey()

        phase.value = parsed.phase || 'focus'
        remainingSeconds.value =
            typeof parsed.remainingSeconds === 'number'
                ? parsed.remainingSeconds
                : phaseDurations[parsed.phase] || phaseDurations.focus
        hasStarted.value = !!parsed.hasStarted

        if (sameDay) {
            completedFocusCount.value = parsed.completedFocusCount || 0
            completedBreakCount.value = parsed.completedBreakCount || 0
            currentStreak.value = parsed.currentStreak || 0
            sessionHistory.value = normalizeFocusHistory(parsed.sessionHistory)
        } else {
            completedFocusCount.value = 0
            completedBreakCount.value = 0
            currentStreak.value = 0
            sessionHistory.value = []
        }

        if (!parsed.isRunning) {
            isRunning.value = false
            return
        }

        const savedAt = Number(parsed.savedAt) || Date.now()
        const elapsedSeconds = Math.max(0, Math.floor((Date.now() - savedAt) / 1000))
        const leftSeconds = remainingSeconds.value - elapsedSeconds

        if (leftSeconds > 0) {
            remainingSeconds.value = leftSeconds
            isRunning.value = true
            startTimer()
            return
        }

        isRunning.value = false
        hasStarted.value = false
        remainingSeconds.value = phaseDurations[phase.value] || phaseDurations.focus
    } catch (error) {
        console.error('恢复番茄钟状态失败', error)
    }
}

const clearTimer = () => {
    if (timerId) {
        clearInterval(timerId)
        timerId = null
    }
}

const resetPhase = (nextPhase) => {
    phase.value = nextPhase
    remainingSeconds.value = phaseDurations[nextPhase]
    hasStarted.value = false
    isRunning.value = false
    clearTimer()
}

const appendHistory = (phaseName, durationMinutes) => {
    sessionHistory.value = [
        {
            phase: phaseName,
            durationMinutes,
            finishedAt: Date.now()
        },
        ...sessionHistory.value
    ].slice(0, 12)
}

const phaseToCode = (phaseName) => {
    if (phaseName === 'focus') return 0
    if (phaseName === 'break') return 1
    return 2
}

const syncTodayFocusStats = async () => {
    try {
        const stats = await getTodayFocusStats()
        completedFocusCount.value = Number(stats?.focusCount || 0)
        completedBreakCount.value = Number((stats?.breakCount || 0) + (stats?.longBreakCount || 0))
        currentStreak.value = completedFocusCount.value % LONG_BREAK_EVERY
        sessionHistory.value = Array.isArray(stats?.sessions)
            ? stats.sessions.slice(0, 12).map((item) => ({
                  phase: item.phase === 0 ? 'focus' : item.phase === 1 ? 'break' : 'longBreak',
                  durationMinutes: Math.round((item.duration || 0) / 60),
                  finishedAt: item.endTime || item.startTime
              }))
            : sessionHistory.value
    } catch (error) {
        console.error('同步专注统计失败', error)
    }
}

const reportSession = async (phaseName, durationMinutes) => {
    const now = Date.now()
    try {
        await addFocusSession({
            phase: phaseToCode(phaseName),
            duration: durationMinutes * 60,
            startTime: now - durationMinutes * 60 * 1000,
            endTime: now
        })
    } catch (error) {
        console.error('上报专注记录失败', error)
    }
}

const completePhase = () => {
    clearTimer()
    isRunning.value = false
    hasStarted.value = false

    if (phase.value === 'focus') {
        completedFocusCount.value += 1
        currentStreak.value += 1
        appendHistory('focus', FOCUS_MINUTES)
        reportSession('focus', FOCUS_MINUTES)
        const useLongBreak = completedFocusCount.value % LONG_BREAK_EVERY === 0
        resetPhase(useLongBreak ? 'longBreak' : 'break')
        uni.showToast({
            title: useLongBreak ? '完成一轮，进入长休息' : '完成一轮，进入短休息',
            icon: 'none'
        })
        return
    }

    completedBreakCount.value += 1
    appendHistory(
        phase.value === 'longBreak' ? 'longBreak' : 'break',
        phase.value === 'longBreak' ? LONG_BREAK_MINUTES : BREAK_MINUTES
    )
    reportSession(
        phase.value === 'longBreak' ? 'longBreak' : 'break',
        phase.value === 'longBreak' ? LONG_BREAK_MINUTES : BREAK_MINUTES
    )
    resetPhase('focus')
    uni.showToast({ title: '休息结束，准备下一轮', icon: 'none' })
}

const startTimer = () => {
    clearTimer()
    isRunning.value = true
    hasStarted.value = true
    persistState()
    timerId = setInterval(() => {
        if (remainingSeconds.value <= 1) {
            remainingSeconds.value = 0
            completePhase()
            return
        }
        remainingSeconds.value -= 1
    }, 1000)
}

const toggleTimer = () => {
    if (isRunning.value) {
        isRunning.value = false
        clearTimer()
        persistState()
        return
    }
    startTimer()
}

const resetTimer = () => {
    resetPhase(phase.value)
}

const switchToFocus = () => {
    currentStreak.value = 0
    resetPhase('focus')
}

const switchToBreak = () => {
    resetPhase('break')
}

const skipPhase = () => {
    completePhase()
}

const formatClock = (timestamp) => {
    if (!timestamp) return '--:--'
    const date = new Date(timestamp)
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(
        2,
        '0'
    )}`
}

watch(
    [
        phase,
        isRunning,
        hasStarted,
        remainingSeconds,
        completedFocusCount,
        completedBreakCount,
        currentStreak,
        sessionHistory
    ],
    () => {
        persistState()
    },
    { deep: true }
)

onMounted(() => {
    restoreState()
    syncTodayFocusStats()
})

onBeforeUnmount(() => {
    clearTimer()
})
</script>

<style scoped lang="scss">
.plan-focus-page {
    min-height: 100vh;
    background: radial-gradient(
            circle at top,
            rgba(var(--color-primary-rgb), 0.12),
            transparent 34%
        ),
        var(--color-bg-app);
    padding: 24rpx 16px 160rpx;
}

.page-header {
    padding: 0 8rpx 18rpx;
}

.page-title {
    display: block;
    font-size: 48rpx;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.2;
}

.page-subtitle {
    display: block;
    margin-top: 8rpx;
    font-size: 26rpx;
    color: var(--color-text-secondary);
}

.focus-hero,
.stats-card,
.timeline-card {
    margin-bottom: 16px;
    padding: 24rpx 24rpx 22rpx;
}

.phase-kicker {
    display: block;
    font-size: 22rpx;
    font-weight: 700;
    color: var(--color-primary);
}

.phase-title {
    display: block;
    margin-top: 10rpx;
    font-size: 40rpx;
    font-weight: 800;
    color: var(--color-text);
}

.phase-desc {
    display: block;
    margin-top: 10rpx;
    font-size: 24rpx;
    line-height: 1.6;
    color: var(--color-text-secondary);
}

.timer-shell {
    display: flex;
    justify-content: center;
    margin-top: 28rpx;
}

.timer-ring {
    width: 360rpx;
    height: 360rpx;
    border-radius: 50%;
    padding: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.timer-center {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.timer-time {
    font-size: 72rpx;
    font-weight: 800;
    color: var(--color-text);
}

.timer-label {
    margin-top: 10rpx;
    font-size: 24rpx;
    color: var(--color-text-secondary);
}

.timer-progress {
    display: flex;
    align-items: center;
    gap: 14rpx;
    margin-top: 24rpx;
}

.progress-track {
    flex: 1;
    height: 14rpx;
    border-radius: 999rpx;
    background: rgba(15, 23, 42, 0.08);
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 999rpx;
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
}

.progress-text {
    font-size: 24rpx;
    font-weight: 700;
    color: var(--color-primary);
}

.action-row {
    display: flex;
    gap: 16rpx;
    margin-bottom: 12rpx;
}

.action-row.compact {
    gap: 12rpx;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

.action-btn {
    flex: 1;
    height: 88rpx;
    border: none;
    border-radius: 999rpx;
    font-size: 28rpx;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-btn-primary {
    background: linear-gradient(135deg, var(--color-primary), #8980f0);
    color: #fff;
    box-shadow: var(--shadow-glow);
}

.action-btn-secondary {
    background: #fff;
    color: var(--color-text);
    border: 2rpx solid var(--color-border-light);
}

.chip-btn {
    height: 68rpx;
    padding: 0 24rpx;
    border: none;
    border-radius: 999rpx;
    background: var(--color-surface-soft);
    color: var(--color-text-secondary);
    font-size: 24rpx;
    font-weight: 600;
}

.section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20rpx;
}

.section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: var(--color-text);
}

.section-badge {
    font-size: 20rpx;
    color: var(--color-primary);
    background: var(--color-primary-soft);
    padding: 4rpx 14rpx;
    border-radius: 999rpx;
}

.section-badge.secondary {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.14);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;
    margin-top: 20rpx;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-soft);
    border-radius: 18rpx;
    padding: 20rpx 10rpx;
}

.stat-value {
    font-size: 34rpx;
    font-weight: 700;
    color: var(--color-text);
}

.stat-label {
    margin-top: 8rpx;
    font-size: 22rpx;
    color: var(--color-text-secondary);
}

.timeline-list {
    margin-top: 18rpx;
}

.timeline-item + .timeline-item {
    margin-top: 16rpx;
}

.timeline-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.timeline-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    flex-shrink: 0;
}

.timeline-dot.focus {
    background: var(--color-primary);
}

.timeline-dot.break,
.timeline-dot.longBreak {
    background: var(--color-success);
}

.timeline-copy {
    flex: 1;
    min-width: 0;
}

.timeline-name {
    display: block;
    font-size: 24rpx;
    font-weight: 600;
    color: var(--color-text);
}

.timeline-desc {
    display: block;
    margin-top: 6rpx;
    font-size: 20rpx;
    color: var(--color-text-secondary);
}

.timeline-time {
    font-size: 22rpx;
    color: var(--color-text-tertiary);
}

.empty-tip {
    font-size: 24rpx;
    color: var(--color-text-secondary);
}
</style>
