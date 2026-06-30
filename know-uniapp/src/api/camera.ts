import request, { createRequest } from '@/utils/request'

/**
 * 摄像头服务专用请求实例
 * 摄像头后端运行在 8085 端口，无 /api 前缀
 */
const cameraRequest = createRequest({
    baseUrl: 'http://localhost:8085',
    urlPrefix: '',
    withToken: false
})

/**
 * 摄像头设备相关接口
 */

// 设备状态枚举
export enum CameraStatus {
    Offline = 0,
    Online = 1
}

// 录像类型枚举
export enum RecordType {
    Manual = 1, // 手动录制
    Timed = 2, // 定时录制
    Motion = 3 // 移动侦测
}

// 录像状态枚举
export enum RecordStatus {
    Recording = 0, // 录制中
    Completed = 1, // 已完成
    Uploaded = 2 // 已上传
}

// 设备接口
export interface CameraDevice {
    id?: number
    deviceName: string
    deviceCode: string
    deviceModel?: string
    manufacturer?: string
    ipAddress?: string
    macAddress?: string
    port?: number
    username?: string
    password?: string
    streamUrl?: string
    snapshotUrl?: string
    status?: CameraStatus
    position?: string
    remark?: string
    userId?: number
    createBy?: number
    createTime?: number
    updateBy?: number
    updateTime?: number
}

// 录像记录接口
export interface CameraRecord {
    id?: number
    deviceId: number
    recordType?: RecordType
    startTime?: number
    endTime?: number
    duration?: number
    filePath?: string
    fileSize?: number
    cloudUrl?: string
    status?: RecordStatus
    createBy?: number
    createTime?: number
}

// 截图记录接口
export interface CameraSnapshot {
    id?: number
    deviceId: number
    captureTime?: number
    filePath?: string
    cloudUrl?: string
    thumbnail?: string
    createBy?: number
    createTime?: number
}

// 分页参数
export interface PageParams {
    pageNum?: number
    pageSize?: number
    [key: string]: any
}

// 分页结果
export interface PageResult<T> {
    records: T[]
    total: number
    size: number
    current: number
    pages: number
}

// ==================== 设备管理接口 ====================

/**
 * 分页查询设备列表
 */
export function getCameraPage(params: PageParams): Promise<PageResult<CameraDevice>> {
    return cameraRequest.get({
        url: '/camera/device/page',
        data: params
    })
}

/**
 * 获取设备列表
 */
export function getCameraList(): Promise<CameraDevice[]> {
    return cameraRequest.get({
        url: '/camera/device/list'
    })
}

/**
 * 获取收藏设备
 */
export function getCameraFavorites(): Promise<CameraDevice[]> {
    return cameraRequest.get({
        url: '/camera/device/favorites'
    })
}

/**
 * 获取设备详情
 */
export function getCameraDetail(id: number): Promise<CameraDevice> {
    return cameraRequest.get({
        url: `/camera/device/${id}`
    })
}

/**
 * 新增设备
 */
export function addCamera(data: Partial<CameraDevice>): Promise<boolean> {
    return cameraRequest.post({
        url: '/camera/device',
        data
    })
}

/**
 * 修改设备
 */
export function updateCamera(data: Partial<CameraDevice>): Promise<boolean> {
    return cameraRequest.put({
        url: '/camera/device',
        data
    })
}

/**
 * 删除设备
 */
export function deleteCamera(id: number): Promise<boolean> {
    return cameraRequest.delete({
        url: `/camera/device/${id}`
    })
}

/**
 * 检查设备编号是否存在
 */
export function checkDeviceCode(deviceCode: string, excludeId?: number): Promise<boolean> {
    return cameraRequest.get({
        url: '/camera/device/check',
        data: { deviceCode, excludeId }
    })
}

/**
 * 更新设备状态
 */
export function updateCameraStatus(id: number, status: CameraStatus): Promise<boolean> {
    return cameraRequest.put({
        url: `/camera/device/status/${id}`,
        data: { status }
    })
}

// ==================== 录像管理接口 ====================

/**
 * 分页查询录像列表
 */
export function getRecordPage(
    params: { deviceId?: number } & PageParams
): Promise<PageResult<CameraRecord>> {
    return cameraRequest.get({
        url: '/camera/record/page',
        data: params
    })
}

/**
 * 获取录像详情
 */
export function getRecordDetail(id: number): Promise<CameraRecord> {
    return cameraRequest.get({
        url: `/camera/record/${id}`
    })
}

/**
 * 开始录制
 */
export function startRecord(deviceId: number, recordType?: RecordType): Promise<CameraRecord> {
    return cameraRequest.post({
        url: '/camera/record/start',
        data: { deviceId, recordType: recordType || RecordType.Manual }
    })
}

/**
 * 停止录制
 */
export function stopRecord(id: number): Promise<boolean> {
    return cameraRequest.post({
        url: `/camera/record/stop/${id}`
    })
}

/**
 * 删除录像
 */
export function deleteRecord(id: number): Promise<boolean> {
    return cameraRequest.delete({
        url: `/camera/record/${id}`
    })
}

/**
 * 批量删除录像
 */
export function deleteRecordBatch(ids: number[]): Promise<boolean> {
    return cameraRequest.delete({
        url: '/camera/record/batch',
        data: ids
    })
}

/**
 * 获取正在录制的录像
 */
export function getRecordingByDevice(deviceId: number): Promise<CameraRecord | null> {
    return cameraRequest.get({
        url: '/camera/record/recording',
        data: { deviceId }
    })
}

// ==================== 截图管理接口 ====================

/**
 * 分页查询截图列表
 */
export function getSnapshotPage(
    params: { deviceId?: number } & PageParams
): Promise<PageResult<CameraSnapshot>> {
    return cameraRequest.get({
        url: '/camera/snapshot/page',
        data: params
    })
}

/**
 * 获取截图详情
 */
export function getSnapshotDetail(id: number): Promise<CameraSnapshot> {
    return cameraRequest.get({
        url: `/camera/snapshot/${id}`
    })
}

/**
 * 获取最新截图
 */
export function getLatestSnapshot(deviceId: number): Promise<CameraSnapshot | null> {
    return cameraRequest.get({
        url: '/camera/snapshot/latest',
        data: { deviceId }
    })
}

/**
 * 保存截图
 */
export function saveSnapshot(
    deviceId: number,
    filePath: string,
    thumbnail?: string
): Promise<CameraSnapshot> {
    return cameraRequest.post({
        url: '/camera/snapshot',
        data: { deviceId, filePath, thumbnail }
    })
}

/**
 * 删除截图
 */
export function deleteSnapshot(id: number): Promise<boolean> {
    return cameraRequest.delete({
        url: `/camera/snapshot/${id}`
    })
}

/**
 * 批量删除截图
 */
export function deleteSnapshotBatch(ids: number[]): Promise<boolean> {
    return cameraRequest.delete({
        url: '/camera/snapshot/batch',
        data: ids
    })
}

export interface WifiInfo {
    SSID: string
    BSSID: string
    secure: boolean
    signalStrength: number
}

export function getWifiList(): Promise<WifiInfo[]> {
    return new Promise((resolve, reject) => {
        // #ifdef MP-WEIXIN || APP-PLUS
        uni.startWifi({
            success: () => {
                uni.getWifiList({
                    success: (res: any) => {
                        try {
                            const wifiList = res.wifiList || []
                            resolve(
                                wifiList.map((wifi: any) => ({
                                    SSID: wifi.SSID || '',
                                    BSSID: wifi.BSSID || '',
                                    secure: wifi.secure || false,
                                    signalStrength: wifi.signalStrength || 0
                                }))
                            )
                        } catch (e) {
                            reject(new Error('解析WiFi列表失败'))
                        }
                    },
                    fail: (err: any) => reject(new Error(err.errMsg || '获取WiFi列表失败'))
                })
            },
            fail: (err: any) => reject(new Error(err.errMsg || '启动WiFi失败'))
        })
        // #endif
        // #ifndef MP-WEIXIN || APP-PLUS
        reject(new Error('当前平台不支持获取WiFi列表'))
        // #endif
    })
}

export function getConnectedWifi(): Promise<WifiInfo> {
    return new Promise((resolve, reject) => {
        // #ifdef MP-WEIXIN || APP-PLUS
        uni.startWifi({
            success: () => {
                uni.getConnectedWifi({
                    success: (res: any) => {
                        resolve({
                            SSID: res.wifi?.SSID || '',
                            BSSID: res.wifi?.BSSID || '',
                            secure: res.wifi?.secure || false,
                            signalStrength: res.wifi?.signalStrength || 0
                        })
                    },
                    fail: (err: any) => reject(new Error(err.errMsg || '获取已连接WiFi失败'))
                })
            },
            fail: (err: any) => reject(new Error(err.errMsg || '启动WiFi失败'))
        })
        // #endif
        // #ifndef MP-WEIXIN || APP-PLUS
        reject(new Error('当前平台不支持获取WiFi信息'))
        // #endif
    })
}
