/**
 * Wi-Fi 相关API
 */

export interface WifiInfo {
    SSID: string;
    BSSID: string;
    secure: boolean;
    signalStrength: number;
}

export interface WifiCredential {
    id?: string;
    ssid: string;
    password?: string;
    bssid?: string;
    securityType: string;
    isDefault?: boolean;
    lastConnected?: number;
    createTime?: number;
}

export interface WifiScanResult {
    SSID: string;
    BSSID: string;
    secure: boolean;
    signalStrength: number;
}

/**
 * 获取当前连接的Wi-Fi信息
 */
export function getConnectedWifi(): Promise<WifiInfo | null> {
    return new Promise((resolve, reject) => {
        // #ifdef APP-PLUS || MP-WEIXIN
        uni.getConnectedWifi({
            success: (res: any) => {
                if (res.wifi) {
                    resolve({
                        SSID: res.wifi.SSID || '',
                        BSSID: res.wifi.BSSID || '',
                        secure: res.wifi.secure !== false,
                        signalStrength: res.wifi.signalStrength || 0
                    });
                } else {
                    resolve(null);
                }
            },
            fail: (err: any) => {
                console.error('获取Wi-Fi信息失败', err);
                resolve(null);
            }
        });
        // #endif
        
        // #ifndef APP-PLUS || MP-WEIXIN
        uni.showToast({ title: '当前环境不支持', icon: 'none' });
        resolve(null);
        // #endif
    });
}

/**
 * 扫描可用Wi-Fi列表
 */
export function scanWifiList(): Promise<WifiScanResult[]> {
    return new Promise((resolve, reject) => {
        // #ifdef MP-WEIXIN || APP-PLUS
        uni.startWifi({
            success: () => {
                uni.getWifiList({
                    success: (res: any) => {
                        try {
                            const wifiList: WifiScanResult[] = (res.wifiList || []).map((wifi: any) => ({
                                SSID: wifi.SSID || '',
                                BSSID: wifi.BSSID || '',
                                secure: wifi.secure !== false,
                                signalStrength: wifi.signalStrength || 0
                            }));
                            resolve(wifiList);
                        } catch (e) {
                            reject(new Error('解析Wi-Fi列表失败'));
                        }
                    },
                    fail: (err: any) => {
                        reject(new Error(err.errMsg || '扫描Wi-Fi失败'));
                    }
                });
            },
            fail: (err: any) => {
                reject(new Error(err.errMsg || '启动Wi-Fi模块失败'));
            }
        });
        // #endif
        
        // #ifndef MP-WEIXIN || APP-PLUS
        uni.showToast({ title: '当前环境不支持', icon: 'none' });
        reject(new Error('当前平台不支持Wi-Fi扫描'));
        // #endif
    });
}

/**
 * 获取本地保存的Wi-Fi凭证列表
 */
export function getSavedWifiList(): WifiCredential[] {
    try {
        const data = uni.getStorageSync('wifi_credentials');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('读取Wi-Fi凭证失败', e);
        return [];
    }
}

/**
 * 保存Wi-Fi凭证
 */
export function saveWifiCredential(credential: WifiCredential): void {
    const list = getSavedWifiList();
    const existingIndex = list.findIndex(item => item.ssid === credential.ssid);
    
    if (existingIndex >= 0) {
        list[existingIndex] = {
            ...list[existingIndex],
            ...credential,
            lastConnected: Date.now()
        };
    } else {
        list.push({
            ...credential,
            id: Date.now().toString(),
            createTime: Date.now(),
            lastConnected: Date.now()
        });
    }
    
    uni.setStorageSync('wifi_credentials', JSON.stringify(list));
}

/**
 * 删除Wi-Fi凭证
 */
export function deleteWifiCredential(ssid: string): void {
    const list = getSavedWifiList();
    const filteredList = list.filter(item => item.ssid !== ssid);
    uni.setStorageSync('wifi_credentials', JSON.stringify(filteredList));
}

/**
 * 清空所有Wi-Fi凭证
 */
export function clearAllWifiCredentials(): void {
    uni.removeStorageSync('wifi_credentials');
}

/**
 * 设置默认Wi-Fi
 */
export function setDefaultWifi(ssid: string): void {
    const list = getSavedWifiList();
    list.forEach(item => {
        item.isDefault = item.ssid === ssid;
    });
    uni.setStorageSync('wifi_credentials', JSON.stringify(list));
}

/**
 * 获取默认Wi-Fi
 */
export function getDefaultWifi(): WifiCredential | null {
    const list = getSavedWifiList();
    return list.find(item => item.isDefault) || null;
}

/**
 * 生成Wi-Fi连接二维码数据
 * 格式: WIFI:T:WPA;S:<SSID>;P:<PASSWORD>;;
 */
export function generateWifiQRData(ssid: string, password: string, securityType: string = 'WPA'): string {
    const escapedSSID = escapeWifiString(ssid);
    const escapedPassword = escapeWifiString(password);
    return `WIFI:T:${securityType};S:${escapedSSID};P:${escapedPassword};;`;
}

/**
 * 转义Wi-Fi字符串中的特殊字符
 */
function escapeWifiString(str: string): string {
    if (!str) return '';
    return str.replace(/([\\;,.":])/g, '\\$1');
}

/**
 * 复制文本到剪贴板
 */
export function copyToClipboard(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // #ifdef MP-WEIXIN
        wx.setClipboardData({
            data: text,
            success: () => {
                uni.showToast({ title: '已复制', icon: 'success' });
                resolve();
            },
            fail: (err) => {
                reject(err);
            }
        });
        // #endif
        
        // #ifdef APP-PLUS
        uni.setClipboardData({
            data: text,
            success: () => {
                uni.showToast({ title: '已复制', icon: 'success' });
                resolve();
            },
            fail: (err) => {
                reject(err);
            }
        });
        // #endif
        
        // #ifndef APP-PLUS && !MP-WEIXIN
        uni.showToast({ title: '当前环境不支持', icon: 'none' });
        reject(new Error('不支持'));
        // #endif
    });
}
