<template>
    <view class="add-device-page">
        <view class="form-section">
            <view class="form-item">
                <text class="label">设备名称 <text class="required">*</text></text>
                <input v-model="formData.deviceName" placeholder="请输入设备名称" class="input" />
            </view>

            <view class="form-item">
                <text class="label">设备编号 <text class="required">*</text></text>
                <input v-model="formData.deviceCode" placeholder="请输入设备编号" class="input" />
            </view>

            <view class="form-item">
                <text class="label">IP地址 <text class="required">*</text></text>
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
                <input
                    v-model="formData.password"
                    placeholder="设备登录密码"
                    password
                    class="input"
                />
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

        <view class="form-actions">
            <button class="submit-btn" :disabled="!canSubmit || submitting" @tap="onSubmit">
                {{ submitting ? '添加中...' : '添加设备' }}
            </button>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { addCamera, type CameraDevice } from '@/api/camera'

const formData = ref<Partial<CameraDevice>>({
    deviceName: '',
    deviceCode: '',
    ipAddress: '',
    port: 8080,
    manufacturer: '',
    deviceModel: '',
    username: '',
    password: '',
    position: '',
    remark: ''
})

const manufacturers = ['Hikvision', 'Dahua', 'UniView', 'EZVIZ', '其他']
const manufacturerIndex = ref(-1)
const submitting = ref(false)

onLoad((query: any) => {
    if (query.ip) formData.value.ipAddress = query.ip
    if (query.port) formData.value.port = parseInt(query.port)
    if (query.brand) formData.value.manufacturer = query.brand
})

const canSubmit = computed(() => {
    return formData.value.deviceName && formData.value.deviceCode && formData.value.ipAddress
})

function onManufacturerChange(e: any) {
    manufacturerIndex.value = e.detail.value
    formData.value.manufacturer = manufacturers[e.detail.value]
}

async function onSubmit() {
    if (!canSubmit.value) return

    submitting.value = true
    try {
        await addCamera(formData.value)
        uni.showToast({ title: '添加成功', icon: 'success' })
        setTimeout(() => {
            uni.navigateBack()
        }, 1500)
    } catch (e) {
        uni.showToast({ title: '添加失败', icon: 'none' })
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped lang="scss">
.add-device-page {
    min-height: 100vh;
    background: var(--color-bg);
    padding: 24rpx;
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
        display: flex;
        align-items: center;
        justify-content: center;

        &[disabled] {
            background: var(--color-text-tertiary);
        }
    }
}
</style>
