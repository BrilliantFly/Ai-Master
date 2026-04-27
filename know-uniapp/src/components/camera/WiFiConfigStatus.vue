<template>
  <view class="wifi-config-status-container">
    <!-- 状态指示器 -->
    <view class="status-indicator">
      <view class="status-circle" :class="statusClass">
        <view class="pulse-ring" v-if="status === 'waiting' || status === 'broadcasting'"></view>
        <text class="status-icon">{{ statusIcon }}</text>
      </view>
    </view>

    <!-- 状态信息 -->
    <view class="status-info">
      <text class="status-title">{{ statusTitle }}</text>
      <text class="status-message">{{ statusMessage }}</text>
    </view>

    <!-- 进度条 -->
    <view class="progress-container" v-if="showProgress">
      <view class="progress-track">
        <view class="progress-fill" :style="{ width: progress + '%' }"></view>
      </view>
      <view class="progress-steps">
        <view 
          class="step" 
          v-for="(step, index) in steps" 
          :key="index"
          :class="{ active: currentStep >= index, completed: currentStep > index }"
        >
          <view class="step-dot">
            <text v-if="currentStep > index">✓</text>
          </view>
          <text class="step-label">{{ step.label }}</text>
        </view>
      </view>
    </view>

    <!-- 发现的设备信息 -->
    <view class="discovered-device" v-if="discoveredDevice">
      <view class="device-card">
        <view class="device-header">
          <text class="device-title">发现设备</text>
          <text class="device-badge online">在线</text>
        </view>
        <view class="device-info">
          <view class="info-row">
            <text class="info-label">IP地址</text>
            <text class="info-value">{{ discoveredDevice.ip }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">MAC地址</text>
            <text class="info-value">{{ discoveredDevice.mac }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">端口</text>
            <text class="info-value">{{ discoveredDevice.port }}</text>
          </view>
          <view class="info-row" v-if="discoveredDevice.manufacturer">
            <text class="info-label">厂商</text>
            <text class="info-value">{{ discoveredDevice.manufacturer }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 注意事项 -->
    <view class="tips-section" v-if="status === 'waiting'">
      <view class="tips-header">
        <text class="tips-title">⚠️ 配网提示</text>
      </view>
      <view class="tips-list">
        <text class="tip-item">1. 请确保摄像头已进入配网模式</text>
        <text class="tip-item">2. 摄像头与手机需连接同一WiFi</text>
        <text class="tip-item">3. 若配网失败，请重试或选择手动添加</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="btn btn-secondary" @tap="onCancel" v-if="canCancel">
        取消
      </button>
      <button class="btn btn-primary" @tap="onManualAdd" v-if="showManualAdd">
        手动添加设备
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ConfigStatus, DiscoveredDevice } from '@/utils/camera/wifiConfig';

interface Props {
  status: ConfigStatus['step'];
  message: string;
  progress: number;
  discoveredDevice?: DiscoveredDevice | null;
}

const props = withDefaults(defineProps<Props>(), {
  status: 'init',
  message: '',
  progress: 0,
  discoveredDevice: null
});

const emit = defineEmits(['cancel', 'manualAdd']);

const steps = [
  { label: '准备' },
  { label: '发送配置' },
  { label: '等待连接' },
  { label: '完成' }
];

const currentStep = computed(() => {
  switch (props.status) {
    case 'init': return 0;
    case 'broadcasting': return 1;
    case 'waiting': return 2;
    case 'success': return 3;
    case 'failed': return -1;
    default: return 0;
  }
});

const statusClass = computed(() => {
  switch (props.status) {
    case 'init': return 'init';
    case 'broadcasting': return 'broadcasting';
    case 'waiting': return 'waiting';
    case 'success': return 'success';
    case 'failed': return 'failed';
    default: return 'init';
  }
});

const statusIcon = computed(() => {
  switch (props.status) {
    case 'init': return '📡';
    case 'broadcasting': return '📶';
    case 'waiting': return '⏳';
    case 'success': return '✅';
    case 'failed': return '❌';
    default: return '📡';
  }
});

const statusTitle = computed(() => {
  switch (props.status) {
    case 'init': return '准备配网';
    case 'broadcasting': return '发送配置中';
    case 'waiting': return '等待设备连接';
    case 'success': return '配网成功';
    case 'failed': return '配网失败';
    default: return '准备配网';
  }
});

const statusMessage = computed(() => props.message || '');

const showProgress = computed(() => {
  return props.status !== 'init' && props.status !== 'failed';
});

const canCancel = computed(() => {
  return props.status === 'broadcasting' || props.status === 'waiting';
});

const showManualAdd = computed(() => {
  return props.status === 'failed';
});

function onCancel() {
  emit('cancel');
}

function onManualAdd() {
  emit('manualAdd');
}
</script>

<style scoped lang="scss">
.wifi-config-status-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 60rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-indicator {
  margin-bottom: 60rpx;
  
  .status-circle {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.3s ease;
    
    &.init {
      background: #f5f5f5;
      border: 4rpx solid #ddd;
      
      .status-icon { font-size: 60rpx; }
    }
    
    &.broadcasting {
      background: #e6f7ff;
      border: 4rpx solid #1890ff;
      
      .status-icon { font-size: 60rpx; animation: pulse 1s infinite; }
    }
    
    &.waiting {
      background: #fff7e6;
      border: 4rpx solid #faad14;
      
      .status-icon { font-size: 60rpx; }
    }
    
    &.success {
      background: #f6ffed;
      border: 4rpx solid #52c41a;
      
      .status-icon { font-size: 60rpx; }
    }
    
    &.failed {
      background: #fff1f0;
      border: 4rpx solid #ff4d4f;
      
      .status-icon { font-size: 60rpx; }
    }
    
    .pulse-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 4rpx solid #1890ff;
      animation: pulse-ring 1.5s infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.status-info {
  text-align: center;
  margin-bottom: 60rpx;
  
  .status-title {
    display: block;
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .status-message {
    display: block;
    font-size: 28rpx;
    color: #666;
  }
}

.progress-container {
  width: 100%;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  
  .progress-track {
    height: 8rpx;
    background: #f0f0f0;
    border-radius: 4rpx;
    overflow: hidden;
    margin-bottom: 40rpx;
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #1890ff, #52c41a);
      border-radius: 4rpx;
      transition: width 0.3s ease;
    }
  }
  
  .progress-steps {
    display: flex;
    justify-content: space-between;
    
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      position: relative;
      
      &:not(:last-child)::after {
        content: '';
        position: absolute;
        top: 16rpx;
        left: calc(50% + 20rpx);
        width: calc(100% - 40rpx);
        height: 2rpx;
        background: #ddd;
      }
      
      &.active:not(.completed)::after {
        background: #1890ff;
      }
      
      &.completed::after {
        background: #52c41a;
      }
      
      .step-dot {
        width: 32rpx;
        height: 32rpx;
        border-radius: 50%;
        background: #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12rpx;
        z-index: 1;
        
        text {
          font-size: 20rpx;
          color: #fff;
        }
      }
      
      &.active .step-dot {
        background: #1890ff;
      }
      
      &.completed .step-dot {
        background: #52c41a;
      }
      
      .step-label {
        font-size: 24rpx;
        color: #999;
      }
      
      &.active .step-label {
        color: #1890ff;
        font-weight: 500;
      }
      
      &.completed .step-label {
        color: #52c41a;
      }
    }
  }
}

.discovered-device {
  width: 100%;
  
  .device-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    
    .device-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;
      
      .device-title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
      }
      
      .device-badge {
        padding: 6rpx 16rpx;
        border-radius: 20rpx;
        font-size: 22rpx;
        
        &.online {
          background: #f6ffed;
          color: #52c41a;
        }
      }
    }
    
    .device-info {
      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 16rpx 0;
        border-bottom: 1rpx solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-size: 26rpx;
          color: #999;
        }
        
        .info-value {
          font-size: 26rpx;
          color: #333;
        }
      }
    }
  }
}

.tips-section {
  width: 100%;
  background: #fffbe6;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-top: 30rpx;
  
  .tips-header {
    margin-bottom: 20rpx;
    
    .tips-title {
      font-size: 28rpx;
      font-weight: 500;
      color: #d48806;
    }
  }
  
  .tips-list {
    .tip-item {
      display: block;
      font-size: 24rpx;
      color: #8c6d1f;
      line-height: 1.8;
    }
  }
}

.action-buttons {
  width: 100%;
  display: flex;
  gap: 24rpx;
  margin-top: 60rpx;
  
  .btn {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    
    &.btn-secondary {
      background: #fff;
      color: #666;
      border: 2rpx solid #ddd;
    }
    
    &.btn-primary {
      background: linear-gradient(135deg, #1890ff, #096dd9);
      color: #fff;
    }
  }
}
</style>