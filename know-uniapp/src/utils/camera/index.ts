/**
 * 摄像头模块工具类导出
 */

export {
    WiFiConfigManager,
    wifiConfigStore,
    type WifiConfigData,
    type ConfigStatus,
    type DiscoveredDevice
} from './wifiConfig'
export {
    CameraDiscovery,
    cameraDiscovery,
    DISCOVERY_PROTOCOLS,
    type DiscoveredCamera,
    type DiscoveryOptions
} from './cameraDiscovery'
export {
    CameraConnector,
    cameraConnector,
    type CameraConnectionConfig,
    type CameraStreamInfo,
    type CameraCapability,
    type PTZCommand,
    type StreamType,
    type VideoCodec,
    type ConnectionStatus
} from './cameraConnector'
