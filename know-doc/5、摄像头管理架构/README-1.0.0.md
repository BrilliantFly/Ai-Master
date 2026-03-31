# 摄像头管理系统

当前版本： 1.0.0

---

## 一、系统概述

### 1.1 功能定位

通过无线WIFI连接摄像头设备，实现设备发现、实时浏览、截图、录像等功能的移动端管理系统。

### 1.2 核心功能

| 模块 | 说明 |
|------|------|
| WIFI管理 | 获取WIFI列表、连接WIFI |
| 设备发现 | 通过局域网发现摄像头设备 |
| 设备管理 | 绑定、编辑、删除摄像头 |
| 视频监控 | 实时浏览、直播 |
| 录像功能 | 截图、保存视频 |
| 云存储 | 云端录像存储与回放（扩展） |

---

## 二、技术实现方案

### 2.1 技术架构

```
移动端（uniapp）
    ↓
WIFI模块 → 获取WIFI列表/连接WIFI
    ↓
设备发现模块 → 局域网设备扫描（UDP广播）
    ↓
设备控制模块 → ONVIF/私有协议
    ↓
视频播放模块 → RTMP/HLS/WebRTC
    ↓
后端服务（可选）- 云存储、录像回放
```

### 2.2 WIFI连接流程

**方案：用户手动输入WIFI密码（推荐）**

```
1. 用户在APP上手动输入WIFI名称和密码
2. APP将WIFI信息传递给摄像头设备
3. 摄像头连接指定WIFI
4. 设备上线，APP发现设备
```

```javascript
// 手动输入WIFI信息
const wifiConfig = {
  ssid: 'MyWIFI',      // WIFI名称
  password: '123456'  // WIFI密码
}

// 将WIFI信息发送给摄像头（通过UDP/蓝牙/二维码等方式）
// 具体协议根据摄像头厂商而定
```

**备选：系统WIFI列表（部分支持）**

```
1. 获取当前WIFI信息
   uni.getConnectedWifi()
   
2. 获取WIFI列表（需定位权限）
   uni.getWifiList()
   
3. 选择已有WIFI连接
   uni.addWifiDevice({
     SSID: 'xxx',
     password: 'xxx'
   })
```

### 2.3 设备发现流程

连接WIFI后，自动扫描该WIFI下的摄像头设备（与手机当前连接的WIFI无关）

**实现方案：多协议并行发现**

```
1. 用户连接目标WIFI（或手动输入WIFI信息）
2. APP获取当前局域网网段（如 192.168.1.x）
3. 并行发送多种协议发现请求：
   - ONVIF WS-Discovery (UDP 3702)
   - Hikvision SADP (UDP 8000)
   - Dahua协议 (UDP 37777)
   - 通用UDP广播
4. 收集设备响应，解析设备信息
5. 设备列表展示
```

#### 2.3.1 设备发现协议

| 协议 | 端口 | 支持厂商 |
|------|------|----------|
| ONVIF WS-Discovery | UDP 3702 | 所有ONVIF兼容设备 |
| Hikvision SADP | UDP 8000 | 海康威视 |
| Dahua | UDP 37777 | 大华 |
| 通用UDP广播 | 多端口 | 通用 |

#### 2.3.2 代码实现（uni-app）

```javascript
// 设备发现核心逻辑
class CameraDiscovery {
  constructor() {
    this.devices = []
    this.subnet = '' // 获取当前WIFI网段
  }
  
  // 获取当前局域网网段
  async getSubnet() {
    const wifi = await uni.getConnectedWifi()
    // 例如: 192.168.1.100 -> 192.168.1
    this.subnet = wifi.SSID ? wifi.SSID.split('.')[0] + '.' + 
                  wifi.SSID.split('.')[1] + '.' + 
                  wifi.SSID.split('.')[2] : '192.168.1'
    return this.subnet
  }
  
  // 并行发现所有协议
  async discover() {
    await this.getSubnet()
    
    const results = await Promise.all([
      this.onvifDiscovery(),
      this.hikvisionDiscovery(),
      this.dahuaDiscovery(),
      this.portScan()
    ])
    
    // 合并去重
    this.devices = this.deduplicate(results.flat())
    return this.devices
  }
  
  // ONVIF发现
  async onvifDiscovery() {
    // 发送WS-Discovery广播
    return new Promise((resolve) => {
      const message = `<?xml version="1.0"?>
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
          <soap:Header>
            <wsa:Action>http://schemas.xmlsoap.org/ws/2005/04/discovery/Probe</wsa:Action>
          </soap:Header>
          <soap:Body>
            <wsd:Probe xmlns:wsd="http://schemas.xmlsoap.org/ws/2005/04/discovery">
              <wsd:Types>wsd:Device</wsd:Types>
            </wsd:Probe>
          </soap:Body>
        </soap:Envelope>`
      
      // UDP发送
      // 监听3702端口响应
    })
  }
  
  // 海康SADP发现
  async hikvisionDiscovery() {
    // UDP 8000 发送SADP发现包
  }
  
  // 大华发现
  async dahuaDiscovery() {
    // UDP 37777 发送大华发现包
  }
  
  // 端口扫描（备用）
  async portScan() {
    // 扫描常见摄像头端口: 554, 8080, 8554等
  }
  
  // 去重
  deduplicate(devices) {
    const map = new Map()
    devices.forEach(d => map.set(d.ip, d))
    return Array.from(map.values())
  }
}

// 使用
const discovery = new CameraDiscovery()
const cameras = await discovery.discover()
console.log('发现设备:', cameras)
```

#### 2.3.3 设备信息解析

```javascript
// 设备响应解析
function parseDeviceResponse(data, protocol) {
  return {
    ip: data.ip,
    port: data.port || 8080,
    protocol: protocol,
    vendor: getVendor(protocol), // 根据协议判断厂商
    model: data.model || '未知型号',
    mac: data.mac || '',
    capabilities: data.capabilities || [] // 视频能力
  }
}
```

#### 2.3.4 设备连接与查询

发现设备后，连接设备并查询内容

```javascript
// 设备连接核心类
class CameraConnector {
  constructor(config) {
    this.ip = config.ip
    this.port = config.port || 80
    this.username = config.username || 'admin'
    this.password = config.password
    this.protocol = config.protocol || 'onvif' // onvif/rtsp
  }
  
  // 连接设备
  async connect() {
    if (this.protocol === 'onvif') {
      return await this.onvifConnect()
    } else {
      return await this.rtspConnect()
    }
  }
  
  // ONVIF连接
  async onvifConnect() {
    // 使用ONVIF协议获取设备信息
    // 参考Python实现，uni-app可通过native.js调用
  }
  
  // 获取设备信息
  async getDeviceInfo() {
    return {
      manufacturer: '',  // 厂商
      model: '',        // 型号
      serialNumber: '', // 序列号
      firmwareVersion: '' // 固件版本
    }
  }
  
  // 获取视频流地址
  async getStreamUrl() {
    // 返回RTSP/HLS/WebRTC地址
    return 'rtsp://192.168.1.100:554/stream1'
  }
  
  // 获取通道列表
  async getChannels() {
    return [
      { token: 'main', name: '主码流', resolution: '1080P' },
      { token: 'sub', name: '子码流', resolution: '480P' }
    ]
  }
  
  // 获取录像文件列表
  async getRecordings(startTime, endTime) {
    return [
      {
        id: 1,
        startTime: '2024-01-01 10:00:00',
        endTime: '2024-01-01 10:30:00',
        duration: 1800,
        size: 524288000
      }
    ]
  }
}
```

#### 2.3.5 访问限制与注意事项

**1. 网络限制**

| 问题 | 说明 | 解决方案 |
|------|------|----------|
| 防火墙阻断 | 企业/家庭路由防火墙阻止端口 | 开启UPnP或手动端口映射 |
| CGNAT | 运营商级NAT，无法端口映射 | 使用P2P连接或VPN |
| 双NAT | 双重NAT导致连接不稳定 | 启用UPnP或级联路由 |
| 动态IP | 公网IP变化导致访问失效 | 使用DDNS服务 |

**2. 认证要求**

| 认证方式 | 说明 |
|----------|------|
| HTTP Basic | 明文传输，不推荐 |
| Digest | 挑战响应机制，较安全 |
| ONVIF | 行业标准，支持用户名Token |
| RTSP | 支持Basic/Digest认证 |

- ⚠️ 切勿使用默认密码
- ⚠️ 部分设备有限流锁定机制

**3. 远程访问方案**

| 方案 | 优点 | 缺点 |
|------|------|------|
| 端口映射 | 直连访问 | CGNAT不可用 |
| P2P穿透 | 无需端口映射 | 依赖厂商服务器 |
| DDNS | 域名访问 | 依赖公网IP |
| VPN | 安全稳定 | 需要客户端 |

**4. 隐私与法律**

- ⚠️ 禁止在有隐私期待的场所安装（卫生间、卧室）
- ⚠️ 录音需遵守当地法规
- ⚠️ 建议张贴监控提示标识

#### 2.3.6 技术可行性分析

**1. 局域网访问（同一WIFI下）✅ 完全可行**

| 功能 | 可行性 | 说明 |
|------|--------|------|
| 发现设备 | ✅ | UDP广播/ONVIF |
| 连接设备 | ✅ | RTSP/ONVIF协议 |
| 获取视频流 | ✅ | WebRTC/RTMP/HLS |
| 截图/录像 | ✅ | 本地存储 |
| 查询录像文件 | ✅ | ONVIF接口 |

**2. 远程访问（不同网络）⚠️ 有条件可行**

| 方案 | 可行性 | 条件 |
|------|--------|------|
| P2P穿透 | ✅ | 设备厂商支持P2P |
| 端口映射 | ⚠️ | 需要公网IP（非CGNAT） |
| DDNS | ⚠️ | 需要公网IP |
| VPN | ✅ | 需要VPS或服务端 |

**3. 结论**

| 场景 | 推荐方案 |
|------|----------|
| 家庭/办公（局域网） | 直接实现，无需额外配置 |
| 远程查看 | 使用设备厂商P2P（如萤石云/乐橙云）或自建VPN |
| 安全性要求高 | WireGuard VPN |

**总结**：技术上完全可以正常访问，核心是**局域网无限制**，**远程需要P2P或VPN**。

---

### 2.4 视频播放方案

| 方案 | 协议 | 适用场景 | 延迟 |
|------|------|----------|------|
| WebRTC | WebRTC | 实时监控 | <1s |
| HLS | HLS | 录像回放 | 3-10s |
| RTMP | RTMP | 直播推流 | <1s |
| FLV | FLV | 实时监控 | 1-3s |

**推荐：WebRTC（低延迟）**

---

## 三、数据库设计

### 3.1 设备表

```sql
-- 摄像头设备表
CREATE TABLE `camera_device` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `device_name` varchar(100) NOT NULL COMMENT '设备名称',
  `device_code` varchar(100) NOT NULL COMMENT '设备编号',
  `device_model` varchar(50) DEFAULT NULL COMMENT '设备型号',
  `manufacturer` varchar(50) DEFAULT NULL COMMENT '厂商',
  `ip_address` varchar(50) DEFAULT NULL COMMENT '局域网IP',
  `mac_address` varchar(50) DEFAULT NULL COMMENT 'MAC地址',
  `port` int DEFAULT 8080 COMMENT '端口',
  `username` varchar(50) DEFAULT NULL COMMENT '设备用户名',
  `password` varchar(100) DEFAULT NULL COMMENT '设备密码(加密存储)',
  `stream_url` varchar(200) DEFAULT NULL COMMENT '视频流地址',
  `snapshot_url` varchar(200) DEFAULT NULL COMMENT '快照地址',
  `status` tinyint DEFAULT 0 COMMENT '状态: 0-离线, 1-在线',
  `position` varchar(100) DEFAULT NULL COMMENT '安装位置',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `user_id` bigint NOT NULL COMMENT '所属用户',
  `create_by` bigint DEFAULT NULL,
  `create_time` bigint DEFAULT NULL,
  `update_by` bigint DEFAULT NULL,
  `update_time` bigint DEFAULT NULL,
  `delete_time` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_device_code` (`device_code`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
);
```

### 3.2 录像记录表

```sql
-- 录像记录表
CREATE TABLE `camera_record` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `device_id` bigint NOT NULL COMMENT '设备ID',
  `record_type` tinyint DEFAULT 1 COMMENT '录像类型: 1-手动, 2-定时, 3-移动侦测',
  `start_time` bigint NOT NULL COMMENT '录像开始时间',
  `end_time` bigint DEFAULT NULL COMMENT '录像结束时间',
  `duration` int DEFAULT 0 COMMENT '时长(秒)',
  `file_path` varchar(500) DEFAULT NULL COMMENT '文件路径',
  `file_size` bigint DEFAULT NULL COMMENT '文件大小(字节)',
  `cloud_url` varchar(500) DEFAULT NULL COMMENT '云存储地址',
  `status` tinyint DEFAULT 0 COMMENT '状态: 0-录制中, 1-已完成, 2-已上传',
  `create_by` bigint DEFAULT NULL,
  `create_time` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_device_id` (`device_id`),
  KEY `idx_start_time` (`start_time`)
);
```

### 3.3 截图记录表

```sql
-- 截图记录表
CREATE TABLE `camera_snapshot` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `device_id` bigint NOT NULL COMMENT '设备ID',
  `capture_time` bigint NOT NULL COMMENT '截图时间',
  `file_path` varchar(500) DEFAULT NULL COMMENT '本地路径',
  `cloud_url` varchar(500) DEFAULT NULL COMMENT '云存储地址',
  `thumbnail` varchar(500) DEFAULT NULL COMMENT '缩略图路径',
  `create_by` bigint DEFAULT NULL,
  `create_time` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_device_id` (`device_id`),
  KEY `idx_capture_time` (`capture_time`)
);
```

### 3.4 设备收藏表

```sql
-- 设备收藏/常用表
CREATE TABLE `camera_favorite` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `device_id` bigint NOT NULL COMMENT '设备ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `sort` int DEFAULT 0 COMMENT '排序',
  `create_time` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_device_user` (`device_id`, `user_id`)
);
```

---

## 四、移动端实现

### 4.1 WIFI管理

```javascript
// 获取当前连接的WIFI
uni.getConnectedWifi({
  success: (res) => {
    console.log(res.wifi)
    // { SSID, BSSID, secure, signalStrength }
  }
})

// 获取WIFI列表（需用户授权定位）
uni.getWifiList()

// 监听WIFI列表变化
uni.onWifiListChange((res) => {
  console.log(res.wifiList)
})

// 连接指定WIFI（直连模式）
// 需设备支持smartconfig或其他配网协议
```

### 4.2 设备发现

```javascript
// UDP广播发现设备
const dgram = require('dgram')
const socket = dgram.createSocket('udp4')

// 发送设备发现请求
const message = Buffer.from('DISCOVER_DEVICE')
socket.send(message, 8080, '255.255.255.255')

// 监听设备响应
socket.on('message', (msg, rinfo) => {
  // 解析设备信息
  const device = JSON.parse(msg.toString())
  // { ip, mac, deviceId, model }
})
```

### 4.3 视频播放

```vue
<template>
  <view class="container">
    <!-- 视频播放 -->
    <live-player 
      id="player"
      :src="videoUrl"
      mode="RTC"
      autoplay
      @statechange="onStateChange"
      @error="onError"
    />
    
    <!-- 控制栏 -->
    <view class="controls">
      <button @click="capture">截图</button>
      <button @click="startRecord">开始录像</button>
      <button @click="stopRecord">停止录像</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      videoUrl: 'webrtc://192.168.1.x:8080/live/stream'
    }
  },
  methods: {
    // 截图
    capture() {
      const ctx = uni.createLivePusherContext('pusher')
      ctx.snapshot({
        success: (res) => {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempImagePath
          })
        }
      })
    },
    
    // 开始录像
    startRecord() {
      const ctx = uni.createLivePusherContext('pusher')
      ctx.startRecord({
        success: () => {
          console.log('开始录像')
        }
      })
    },
    
    // 停止录像
    stopRecord() {
      const ctx = uni.createLivePusherContext('pusher')
      ctx.stopRecord({
        success: (res) => {
          console.log('录像保存:', res.tempVideoPath)
        }
      })
    }
  }
}
</script>
```

### 4.4 页面结构

```
摄像头管理
├── 首页
│   ├── 我的设备列表
│   ├── 设备发现/添加
│   └── 常用设备快捷入口
├── 设备详情
│   ├── 实时视频
│   ├── 云录像
│   ├── 截图记录
│   └── 设备设置
├── 设备发现
│   ├── WIFI扫描
│   ├── 局域网搜索
│   └── 手动添加
├── 录像回放
│   ├── 时间轴选择
│   ├── 录像列表
│   └── 云录像（扩展）
└── 设置
    ├── 云存储配置
    ├── 视频质量
    └── 推送通知
```

---

## 五、接口设计

### 5.1 设备管理接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/device/page | GET | 分页查询设备 |
| /api/device | POST | 添加设备 |
| /api/device/{id} | PUT | 修改设备 |
| /api/device/{id} | DELETE | 删除设备 |
| /api/device/discover | POST | 触发设备发现 |
| /api/device/{id}/status | GET | 刷新设备状态 |

### 5.2 录像接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/record/page | GET | 分页查询录像 |
| /api/record/device/{deviceId} | GET | 获取设备录像列表 |
| /api/record/{id} | GET | 录像详情 |

### 5.3 截图接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/snapshot/page | GET | 分页查询截图 |
| /api/snapshot/{id} | GET | 截图详情 |
| /api/snapshot/{id}/upload | POST | 上传截图到云端 |

---

## 六、扩展功能

### 6.1 云存储

- 截图/录像自动上传到云端
- 支持阿里云OSS、腾讯云COS
- 录像片段合并

### 6.2 移动侦测

- 设备端AI识别
- 消息推送提醒
- 自动录像

### 6.3 多人共享

- 设备分享给其他用户
- 权限管理（管理员/查看者）

---

## 七、版本历史

| 版本 | 更新内容 |
|------|----------|
| 1.0.0 | 初始版本，包含WIFI管理、设备发现、视频播放、录像截图功能 |
