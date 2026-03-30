import request from "@/utils/request";

export interface CameraDevice {
    id: number;
    name: string;
    ip: string;
    port: number;
    status: number;
    brand?: string;
    username?: string;
    password?: string;
    channel?: number;
    streamType?: string;
    rtspUrl?: string;
    httpPort?: number;
    thumbnail?: string;
    streamUrl?: string;
    lastOnlineTime?: string;
    playCount?: number;
    sort?: number;
    remark?: string;
    manufacturer?: string;
    model?: string;
}

export interface CameraStream {
    id: number;
    streamUrl: string;
    rtspUrl: string;
}

export interface CameraRecord {
    id: number;
    deviceId: number;
    fileName: string;
    filePath: string;
    fileSize: number;
    duration: number;
    startTime: number;
    endTime: number;
    recordType: string;
    status: number;
}

export interface LanDevice {
    ip: string;
    mac?: string;
    port?: number;
    brand?: string;
    deviceType?: string;
    isAdded: boolean;
    online?: boolean;
}

export interface WifiInfo {
    SSID: string;
    BSSID: string;
    secure: boolean;
    signalStrength: number;
}

export function getCameraList() {
    return request.get({ url: "/camera/list" });
}

export function getCameraDetail(id: number) {
    return request.get({ url: `/camera/detail`, data: { id } });
}

export function addCamera(data: Partial<CameraDevice>) {
    return request.post({ url: "/camera/add", data });
}

export function updateCamera(id: number, data: Partial<CameraDevice>) {
    return request.post({ url: "/camera/edit", params: { id }, data });
}

export function deleteCamera(id: number) {
    return request.post({ url: "/camera/delete", data: { id } });
}

export function getCameraStream(id: number) {
    return request.get({ url: `/camera/stream/${id}` });
}

export function getCameraScreenshot(id: number) {
    return request.get({ url: `/camera/screenshot/${id}` });
}

export function scanLanDevices() {
    return request.get({ url: "/camera/scan" });
}

export function checkCameraOnline(id: number) {
    return request.post({ url: `/camera/check/${id}` });
}

export function startRecord(id: number) {
    return request.post({ url: `/camera/record/start/${id}` });
}

export function stopRecord(id: number) {
    return request.post({ url: `/camera/record/stop/${id}` });
}

export function getRecordList(deviceId: number) {
    return request.get({ url: "/camera/record/list", data: { deviceId } });
}

export function deleteRecord(id: number) {
    return request.post({ url: "/camera/record/delete", data: { id } });
}

export function getWifiList(): Promise<WifiInfo[]> {
    return new Promise((resolve, reject) => {
        // #ifdef MP-WEIXIN || APP-PLUS
        uni.startWifi({
            success: () => {
                uni.getWifiList({
                    success: (res: any) => {
                        try {
                            const wifiList = res.wifiList || [];
                            resolve(wifiList.map((wifi: any) => ({
                                SSID: wifi.SSID || "",
                                BSSID: wifi.BSSID || "",
                                secure: wifi.secure || false,
                                signalStrength: wifi.signalStrength || 0
                            })));
                        } catch (e) {
                            reject(new Error("解析WiFi列表失败"));
                        }
                    },
                    fail: (err: any) => reject(new Error(err.errMsg || "获取WiFi列表失败"))
                });
            },
            fail: (err: any) => reject(new Error(err.errMsg || "启动WiFi失败"))
        });
        // #endif
        // #ifndef MP-WEIXIN || APP-PLUS
        reject(new Error("当前平台不支持获取WiFi列表"));
        // #endif
    });
}

export function getConnectedWifi(): Promise<WifiInfo> {
    return new Promise((resolve, reject) => {
        // #ifdef MP-WEIXIN || APP-PLUS
        uni.startWifi({
            success: () => {
                uni.getConnectedWifi({
                    success: (res: any) => {
                        resolve({
                            SSID: res.wifi?.SSID || "",
                            BSSID: res.wifi?.BSSID || "",
                            secure: res.wifi?.secure || false,
                            signalStrength: res.wifi?.signalStrength || 0
                        });
                    },
                    fail: (err: any) => reject(new Error(err.errMsg || "获取已连接WiFi失败"))
                });
            },
            fail: (err: any) => reject(new Error(err.errMsg || "启动WiFi失败"))
        });
        // #endif
        // #ifndef MP-WEIXIN || APP-PLUS
        reject(new Error("当前平台不支持获取WiFi信息"));
        // #endif
    });
}
