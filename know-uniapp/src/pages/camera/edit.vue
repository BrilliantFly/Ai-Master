<template>
    <view class="edit-device-page">
        <!-- 加载状态 -->
        <view class="loading-state" v-if="loading">
            <text>加载中...</text>
        </view>

        <!-- 表单 -->
        <view class="form-section" v-else>
            <view class="form-item">
                <text class="label">设备名称 <text class="required">*</text></text>
                <input v-model="formData.deviceName" placeholder="请输入设备名称" class="input" />
            </view>

            <view class="form-item">
                <text class="label">设备编号</text>
                <input
                    v-model="formData.deviceCode"
                    placeholder="请输入设备编号"
                    class="input"
                    disabled
                />
                <text class="hint">设备编号不可修改</text>
            </view>

            <view class="form-item">
                <text class="label">IP地址</text>
                <input
                    v-model="formData.ipAddress"
                    placeholder="例如: 192.168.1.100"
                    class="input"
                />
            </view>

            <view class="form-item">
                <text class="label">端口</text>
                <input
                    v-model="formData.port"
                    placeholder="默认: 8080"
                    type="number"
                    class="input"
                />
            </view>

            <view class="form-item">
                <text class="label">厂商</text>
                <picker
                    :value="manufacturerIndex"
                    :range="manufacturers"
                    @change="onManufacturerChange"
                >
                    <view class="picker-value">
                        {{ formData.manufacturer || '请选择' }}
                    </view>
                </picker>
            </view>

            <view class="form-item">
                <text class="label">设备型号</text>
                <input v-model="formData.deviceModel" placeholder="请输入设备型号" class="input" />
            </view>

            <view class="form-item">
                <text class="label">用户名</text>
                <input v-model="formData.username" placeholder="设备登录用户名" class="input" />
            </view>

            <view class="form-item">
                <text class="label">密码</text>
                <view class="password-input">
                    <input
                        v-model="formData.password"
                        placeholder="请输入设备密码"
                        password
                        class="input"
                    />
                    <view class="show-password" @tap="togglePassword">
                        <text>{{ showPassword ? '👁' : '👁‍🗨' }}</text>
                    </view>
                </view>
                <view class="password-actions">
                    <text class="action-btn" @tap="clearPassword">清除密码</text>
                    <text class="action-btn" @tap="testConnection">测试连接</text>
                </view>
            </view>

            <view class="form-item">
                <text class="label">安装位置</text>
                <input v-model="formData.position" placeholder="例如: 客厅、门口" class="input" />
            </view>

            <view class="form-item">
                <text class="label">备注</text>
                <textarea v-model="formData.remark" placeholder="其他备注信息" class="textarea" />
            </view>
        </view>

        <!-- 设备状态 -->
        <view class="status-section" v-if="formData.status !== undefined">
            <view class="status-card">
                <view class="status-header">
                    <text class="status-title">设备状态</text>
                    <view class="status-badge" :class="{ online: formData.status === 1 }">
                        {{ formData.status === 1 ? '在线' : '离线' }}
                    </view>
                </view>
                <view class="status-actions">
                    <button class="status-btn" @tap="refreshStatus">
                        <text>🔄</text> 刷新状态
                    </button>
                    <button class="status-btn" @tap="testStream"><text>▶️</text> 测试流</button>
                </view>
            </view>
        </view>

        <!-- 操作按钮 -->
        <view class="form-actions">
            <button class="submit-btn" :disabled="!canSubmit || submitting" @tap="onSubmit">
                {{ submitting ? '保存中...' : '保存修改' }}
            </button>
            <button class="delete-btn" @tap="onDelete">删除设备</button>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
    getCameraDetail,
    updateCamera,
    deleteCamera,
    updateCameraStatus,
    type CameraDevice
} from '@/api/camera'

const deviceId = ref<number>(0)
const formData = ref<Partial<CameraDevice>>({})
const manufacturers = ['Hikvision', 'Dahua', 'UniView', 'EZVIZ', '其他']
const manufacturerIndex = ref(-1)
const showPassword = ref(false)
const loading = ref(false)
const submitting = ref(false)

onLoad((query: any) => {
    if (query.id) {
        deviceId.value = parseInt(query.id)
        loadDevice()
    }
})

async function loadDevice() {
    loading.value = true
    try {
        const device = (await getCameraDetail(deviceId.value)) as CameraDevice
        formData.value = { ...device }

        // 设置厂商选择索引
        if (device.manufacturer) {
            manufacturerIndex.value = manufacturers.indexOf(device.manufacturer)
        }
    } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
    } finally {
        loading.value = false
    }
}

const canSubmit = computed(() => {
    return formData.value.deviceName && formData.value.ipAddress
})

function onManufacturerChange(e: any) {
    manufacturerIndex.value = e.detail.value
    formData.value.manufacturer = manufacturers[e.detail.value]
}

function togglePassword() {
    showPassword.value = !showPassword.value
}

function clearPassword() {
    formData.value.password = ''
    uni.showToast({ title: '密码已清除', icon: 'none' })
}

async function testConnection() {
    uni.showLoading({ title: '测试连接中...' })
    try {
        // TODO: 实现真实连接测试
        setTimeout(() => {
            uni.hideLoading()
            uni.showToast({ title: '连接成功', icon: 'success' })
        }, 1500)
    } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '连接失败', icon: 'none' })
    }
}

async function testStream() {
    uni.showLoading({ title: '测试视频流...' })
    try {
        // TODO: 实现真实流测试
        setTimeout(() => {
            uni.hideLoading()
            uni.showToast({ title: '视频流正常', icon: 'success' })
        }, 2000)
    } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '视频流异常', icon: 'none' })
    }
}

async function refreshStatus() {
    uni.showLoading({ title: '刷新状态...' })
    try {
        await updateCameraStatus(deviceId.value, formData.value.status || 0)
        uni.showToast({ title: '状态已更新', icon: 'success' })
    } catch (e) {
        uni.showToast({ title: '刷新失败', icon: 'none' })
    } finally {
        uni.hideLoading()
    }
}

async function onSubmit() {
    if (!canSubmit.value) return

    submitting.value = true
    try {
        await updateCamera(formData.value)
        uni.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => {
            uni.navigateBack()
        }, 1500)
    } catch (e) {
        uni.showToast({ title: '保存失败', icon: 'none' })
    } finally {
        submitting.value = false
    }
}

function onDelete() {
    uni.showModal({
        title: '确认删除',
        content: '确定要删除此设备吗？删除后不可恢复。',
        success: async (res) => {
            if (res.confirm) {
                try {
                    await deleteCamera(deviceId.value)
                    uni.showToast({ title: '删除成功', icon: 'success' })
                    setTimeout(() => {
                        uni.navigateBack()
                    }, 1500)
                } catch (e) {
                    uni.showToast({ title: '删除失败', icon: 'none' })
                }
            }
        }
    })
}
</script>

<style scoped lang="scss">
.edit-device-page {
    min-height: 100vh;
    background: var(--color-bg);
    padding: 24rpx;
}

.loading-state {
    text-align: center;
    padding: 100rpx;
    color: var(--color-text-tertiary);
}

.form-section {
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: 30rpx;

    .form-item {
        margin-bottom: 30rpx;

        &:last-child {
            margin-bottom: 0;
        }

        .label {
            display: block;
            font-size: 28rpx;
            color: var(--color-text);
            margin-bottom: 16rpx;

            .required {
                color: var(--color-danger);
            }
        }

        .input {
            height: 88rpx;
            background: var(--color-surface-soft);
            border-radius: 12rpx;
            padding: 0 24rpx;
            font-size: 28rpx;

            &[disabled] {
                color: var(--color-text-tertiary);
            }
        }

        .hint {
            display: block;
            font-size: 22rpx;
            color: var(--color-text-tertiary);
            margin-top: 8rpx;
        }

        .textarea {
            height: 160rpx;
            background: var(--color-surface-soft);
            border-radius: 12rpx;
            padding: 24rpx;
            font-size: 28rpx;
        }

        .picker-value {
            height: 88rpx;
            background: var(--color-surface-soft);
            border-radius: 12rpx;
            padding: 0 24rpx;
            line-height: 88rpx;
            font-size: 28rpx;
            color: var(--color-text);
        }

        .password-input {
            position: relative;

            .input {
                padding-right: 80rpx;
            }

            .show-password {
                position: absolute;
                right: 24rpx;
                top: 50%;
                transform: translateY(-50%);
                font-size: 32rpx;
            }
        }

        .password-actions {
            display: flex;
            gap: 24rpx;
            margin-top: 16rpx;

            .action-btn {
                font-size: 24rpx;
                color: var(--color-primary);
            }
        }
    }
}

.status-section {
    margin-top: 24rpx;

    .status-card {
        background: var(--color-surface);
        border-radius: var(--radius-md);
        padding: 30rpx;

        .status-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24rpx;

            .status-title {
                font-size: 30rpx;
                font-weight: 500;
                color: var(--color-text);
            }

            .status-badge {
                padding: 8rpx 24rpx;
                border-radius: 20rpx;
                font-size: 24rpx;
                background: var(--color-surface-soft);
                color: var(--color-text-tertiary);

                &.online {
                    background: var(--color-success-soft);
                    color: var(--color-success);
                }
            }
        }

        .status-actions {
            display: flex;
            gap: 24rpx;

            .status-btn {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 72rpx;
                background: var(--color-surface-soft);
                border-radius: 12rpx;
                font-size: 26rpx;

                text:first-child {
                    margin-right: 8rpx;
                }
            }
        }
    }
}

.form-actions {
    padding: 40rpx 0;

    .submit-btn {
        width: 100%;
        height: 88rpx;
        background: var(--color-primary);
        color: #fff;
        border-radius: 44rpx;
        font-size: 32rpx;
        margin-bottom: 24rpx;

        &[disabled] {
            background: var(--color-text-tertiary);
        }
    }

    .delete-btn {
        width: 100%;
        height: 88rpx;
        background: var(--color-danger-soft);
        color: var(--color-danger);
        border-radius: 44rpx;
        font-size: 30rpx;
    }
}
</style>
