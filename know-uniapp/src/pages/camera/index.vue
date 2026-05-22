<template>
  <view class="camera-list-page">
    <!-- 顶部搜索和操作栏 -->
    <view class="header-bar">
      <view class="search-wrapper">
        <input 
          type="text" 
          v-model="searchKey" 
          placeholder="搜索设备名称" 
          class="search-input"
          @confirm="onSearch"
        />
        <view class="search-btn" @tap="onSearch">
          <text>搜索</text>
        </view>
      </view>
      <view class="action-btns">
        <view class="action-btn add" @tap="goToAdd">
          <text class="icon">+</text>
          <text>添加设备</text>
        </view>
        <view class="action-btn discover" @tap="goToDiscover">
          <text class="icon">🔍</text>
          <text>发现设备</text>
        </view>
      </view>
    </view>

    <!-- 设备列表 -->
    <view class="device-list" v-if="deviceList.length > 0">
      <view 
        class="device-card" 
        v-for="device in deviceList" 
        :key="device.id"
        @tap="goToDetail(device)"
      >
        <view class="device-thumbnail">
          <image 
            v-if="device.thumbnail || device.snapshotUrl" 
            :src="device.thumbnail || device.snapshotUrl" 
            mode="aspectFill"
          />
          <view class="thumbnail-placeholder" v-else>
            <text>📹</text>
          </view>
          <view class="device-status" :class="{ online: device.status === 1 }">
            {{ device.status === 1 ? '在线' : '离线' }}
          </view>
        </view>
        <view class="device-info">
          <view class="device-name">{{ device.deviceName || device.name || '未命名设备' }}</view>
          <view class="device-detail">
            <text class="ip">{{ device.ipAddress || device.ip || '-' }}</text>
            <text class="separator">|</text>
            <text class="port">{{ device.port || 8080 }}</text>
          </view>
          <view class="device-meta" v-if="device.manufacturer">
            <text class="manufacturer">{{ device.manufacturer }}</text>
            <text class="model" v-if="device.deviceModel">{{ device.deviceModel }}</text>
          </view>
        </view>
        <view class="device-actions">
          <view class="quick-action" @tap.stop="toggleFavorite(device)">
            <text>{{ isFavorite(device.id) ? '⭐' : '☆' }}</text>
          </view>
          <view class="quick-action" @tap.stop="goToPlay(device)">
            <text>▶️</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!loading">
      <view class="empty-icon">📹</view>
      <text class="empty-title">暂无设备</text>
      <text class="empty-desc">点击下方按钮添加或发现设备</text>
      <view class="empty-actions">
        <button class="btn btn-primary" @tap="goToAdd">添加设备</button>
        <button class="btn btn-outline" @tap="goToDiscover">发现设备</button>
      </view>
    </view>

    <!-- 加载状态 -->
    <page-status 
      :status="loading ? 'loading' : 'normal'"
    />

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bar-item" @tap="goToWifiConfig">
        <text class="bar-icon">📶</text>
        <text class="bar-text">WiFi配网</text>
      </view>
      <view class="bar-item" @tap="goToSnapshots">
        <text class="bar-icon">📷</text>
        <text class="bar-text">我的截图</text>
      </view>
      <view class="bar-item" @tap="goToRecords">
        <text class="bar-icon">🎬</text>
        <text class="bar-text">录像记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { onLoad, onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import { 
  getCameraList, 
  getCameraFavorites, 
  type CameraDevice 
} from '@/api/camera';

const deviceList = ref<CameraDevice[]>([]);
const favoriteIds = ref<number[]>([]);
const searchKey = ref('');
const loading = ref(false);

onMounted(async () => {
  await loadDevices();
});

onShow(() => {
  loadDevices();
});

onPullDownRefresh(async () => {
  await loadDevices();
  uni.stopPullDownRefresh();
});

async function loadDevices() {
  loading.value = true;
  try {
    const [devices, favorites] = await Promise.all([
      getCameraList() as Promise<CameraDevice[]>,
      getCameraFavorites() as Promise<CameraDevice[]>
    ]);
    
    deviceList.value = devices;
    favoriteIds.value = favorites.map(f => f.id!).filter(Boolean);
  } catch (e) {
    console.error('加载设备失败', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  // TODO: 实现搜索
  console.log('搜索:', searchKey.value);
}

function isFavorite(id?: number): boolean {
  return id ? favoriteIds.value.includes(id) : false;
}

function toggleFavorite(device: CameraDevice) {
  const id = device.id;
  if (!id) return;
  
  if (isFavorite(id)) {
    favoriteIds.value = favoriteIds.value.filter(i => i !== id);
  } else {
    favoriteIds.value.push(id);
  }
}

function goToAdd() {
  uni.navigateTo({ url: '/pages/camera/add' });
}

function goToDiscover() {
  uni.navigateTo({ url: '/pages/camera/discover' });
}

function goToDetail(device: CameraDevice) {
  if (!device.id) return;
  uni.navigateTo({ url: `/pages/camera/detail?id=${device.id}` });
}

function goToPlay(device: CameraDevice) {
  if (!device.id) return;
  uni.navigateTo({ url: `/pages/camera/player?id=${device.id}` });
}

function goToWifiConfig() {
  uni.navigateTo({ url: '/pages/camera/wifi-config' });
}

function goToSnapshots() {
  uni.navigateTo({ url: '/pages/camera/snapshots' });
}

function goToRecords() {
  uni.navigateTo({ url: '/pages/camera/records' });
}
</script>

<style scoped lang="scss">
.camera-list-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header-bar {
  background: #fff;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #eee;
  
  .search-wrapper {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 40rpx;
    padding: 0 24rpx;
    
    .search-input {
      flex: 1;
      height: 72rpx;
      font-size: 28rpx;
    }
    
    .search-btn {
      padding: 16rpx 24rpx;
      color: #1890ff;
      font-size: 28rpx;
    }
  }
  
  .action-btns {
    display: flex;
    gap: 24rpx;
    margin-top: 24rpx;
    
    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20rpx;
      border-radius: 12rpx;
      font-size: 28rpx;
      
      .icon {
        margin-right: 8rpx;
      }
      
      &.add {
        background: #e6f7ff;
        color: #1890ff;
      }
      
      &.discover {
        background: #f6ffed;
        color: #52c41a;
      }
    }
  }
}

.device-list {
  padding: 24rpx 30rpx;
  
  .device-card {
    display: flex;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    
    .device-thumbnail {
      width: 160rpx;
      height: 120rpx;
      border-radius: 12rpx;
      overflow: hidden;
      margin-right: 24rpx;
      position: relative;
      
      image {
        width: 100%;
        height: 100%;
      }
      
      .thumbnail-placeholder {
        width: 100%;
        height: 100%;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48rpx;
      }
      
      .device-status {
        position: absolute;
        bottom: 8rpx;
        left: 8rpx;
        padding: 4rpx 12rpx;
        border-radius: 12rpx;
        font-size: 20rpx;
        background: #999;
        color: #fff;
        
        &.online {
          background: #52c41a;
        }
      }
    }
    
    .device-info {
      flex: 1;
      
      .device-name {
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 12rpx;
      }
      
      .device-detail {
        font-size: 24rpx;
        color: #999;
        margin-bottom: 8rpx;
        
        .separator {
          margin: 0 12rpx;
        }
      }
      
      .device-meta {
        font-size: 22rpx;
        color: #ccc;
        
        .manufacturer {
          margin-right: 12rpx;
        }
      }
    }
    
    .device-actions {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 16rpx;
      
      .quick-action {
        width: 64rpx;
        height: 64rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #f5f5f5;
        font-size: 28rpx;
      }
    }
  }
}

.empty-state {
  padding: 120rpx 0;
  text-align: center;
  
  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
  }
  
  .empty-title {
    display: block;
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .empty-desc {
    display: block;
    font-size: 26rpx;
    color: #999;
    margin-bottom: 60rpx;
  }
  
  .empty-actions {
    display: flex;
    gap: 24rpx;
    justify-content: center;
    
    .btn {
      padding: 20rpx 48rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      
      &.btn-primary {
        background: #1890ff;
        color: #fff;
      }
      
      &.btn-outline {
        border: 2rpx solid #1890ff;
        color: #1890ff;
        background: transparent;
      }
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);
  
  .bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .bar-icon {
      font-size: 32rpx;
      margin-bottom: 4rpx;
    }
    
    .bar-text {
      font-size: 22rpx;
      color: #666;
    }
  }
}
</style>