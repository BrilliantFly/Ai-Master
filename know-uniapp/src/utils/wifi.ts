/**
 * Wi-Fi 工具类
 * 提供Wi-Fi密码检索、二维码生成等功能
 */

export interface WifiNetwork {
    ssid: string;
    bssid: string;
    password?: string;
    securityType: 'WPA' | 'WEP' | 'nopass';
    hidden: boolean;
}

export interface WifiQRCodeData {
    ssid: string;
    password: string;
    securityType: string;
    hidden: boolean;
}

/**
 * Wi-Fi密码工具类
 */
export class WifiUtils {
    
    /**
     * 解析Wi-Fi二维码数据
     * 格式: WIFI:T:WPA;S:<SSID>;P:<PASSWORD>;;  或  WIFI:T:nopass;S:<SSID>;;
     */
    static parseWifiQRCode(qrData: string): WifiQRCodeData | null {
        if (!qrData || !qrData.startsWith('WIFI:')) {
            return null;
        }
        
        try {
            const wifiString = qrData.substring(5);
            const parts = wifiString.split(';');
            
            let securityType = 'nopass';
            let ssid = '';
            let password = '';
            let hidden = false;
            
            for (const part of parts) {
                if (part.startsWith('T:')) {
                    securityType = part.substring(2);
                } else if (part.startsWith('S:')) {
                    ssid = this.unescapeWifiString(part.substring(2));
                } else if (part.startsWith('P:')) {
                    password = this.unescapeWifiString(part.substring(2));
                } else if (part.startsWith('H:')) {
                    hidden = part.substring(2).toLowerCase() === 'true';
                }
            }
            
            if (!ssid) {
                return null;
            }
            
            return { ssid, password, securityType, hidden };
        } catch (e) {
            console.error('解析Wi-Fi二维码失败', e);
            return null;
        }
    }
    
    /**
     * 生成Wi-Fi二维码数据
     */
    static generateWifiQRData(wifi: WifiNetwork): string {
        const escapedSSID = this.escapeWifiString(wifi.ssid);
        const escapedPassword = this.escapeWifiString(wifi.password || '');
        const securityType = wifi.securityType || 'WPA';
        const hidden = wifi.hidden ? 'true' : 'false';
        
        return `WIFI:T:${securityType};S:${escapedSSID};P:${escapedPassword};H:${hidden};;`;
    }
    
    /**
     * 转义Wi-Fi字符串中的特殊字符
     */
    static escapeWifiString(str: string): string {
        if (!str) return '';
        return str.replace(/([\\;,.":])/g, '\\$1');
    }
    
    /**
     * 反转义Wi-Fi字符串
     */
    static unescapeWifiString(str: string): string {
        if (!str) return '';
        return str.replace(/\\(.)/g, '$1');
    }
    
    /**
     * 获取Wi-Fi安全类型显示名称
     */
    static getSecurityTypeName(type: string): string {
        const typeMap: Record<string, string> = {
            'WPA': 'WPA/WPA2',
            'WPA2': 'WPA2',
            'WPA3': 'WPA3',
            'WEP': 'WEP',
            'nopass': '无密码',
            '': '未知'
        };
        return typeMap[type] || type || '未知';
    }
    
    /**
     * 获取信号强度等级 (0-4)
     */
    static getSignalLevel(signal: number): number {
        if (signal >= -50) return 4;
        if (signal >= -60) return 3;
        if (signal >= -70) return 2;
        if (signal >= -80) return 1;
        return 0;
    }
    
    /**
     * 获取信号强度显示文本
     */
    static getSignalText(signal: number): string {
        const level = this.getSignalLevel(signal);
        const texts = ['很弱', '较弱', '中等', '较强', '很强'];
        return texts[level] || '未知';
    }
    
    /**
     * 判断是否为5G频段
     * (通过BSSID或其他方式判断，这里简单返回false)
     */
    static is5GHz(bssid: string): boolean {
        return false;
    }
}

/**
 * Wi-Fi密码管理器
 * 用于本地存储和管理Wi-Fi密码
 */
export class WifiPasswordManager {
    private static STORAGE_KEY = 'wifi_credentials_v2';
    
    /**
     * 获取保存的Wi-Fi列表
     */
    static getList(): WifiNetwork[] {
        try {
            const data = uni.getStorageSync(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('读取Wi-Fi列表失败', e);
            return [];
        }
    }
    
    /**
     * 保存Wi-Fi网络
     */
    static save(wifi: WifiNetwork): void {
        const list = this.getList();
        const index = list.findIndex(item => item.ssid === wifi.ssid);
        
        if (index >= 0) {
            list[index] = { ...list[index], ...wifi };
        } else {
            list.push(wifi);
        }
        
        uni.setStorageSync(this.STORAGE_KEY, JSON.stringify(list));
    }
    
    /**
     * 删除Wi-Fi网络
     */
    static remove(ssid: string): void {
        const list = this.getList();
        const filtered = list.filter(item => item.ssid !== ssid);
        uni.setStorageSync(this.STORAGE_KEY, JSON.stringify(filtered));
    }
    
    /**
     * 清空所有Wi-Fi
     */
    static clear(): void {
        uni.removeStorageSync(this.STORAGE_KEY);
    }
    
    /**
     * 根据SSID查找Wi-Fi
     */
    static findBySSID(ssid: string): WifiNetwork | undefined {
        const list = this.getList();
        return list.find(item => item.ssid === ssid);
    }
    
    /**
     * 检查是否已保存
     */
    static isSaved(ssid: string): boolean {
        return this.findBySSID(ssid) !== undefined;
    }
    
    /**
     * 获取已保存密码
     */
    static getPassword(ssid: string): string | undefined {
        const wifi = this.findBySSID(ssid);
        return wifi?.password;
    }
}

/**
 * Wi-Fi连接管理器
 */
export class WifiConnectionManager {
    /**
     * 连接Wi-Fi
     */
    static connect(ssid: string, password?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // #ifdef MP-WEIXIN || APP-PLUS
            const connectOptions: any = {
                wifiSSID: ssid,
                success: () => {
                    uni.showToast({ title: '连接成功', icon: 'success' });
                    resolve();
                },
                fail: (err: any) => {
                    const errMsg = err.errMsg || '连接失败';
                    uni.showToast({ title: errMsg, icon: 'none' });
                    reject(new Error(errMsg));
                }
            };
            
            if (password) {
                connectOptions.password = password;
            }
            
            uni.connectWifi(connectOptions);
            // #endif
            
            // #ifndef MP-WEIXIN && !APP-PLUS
            uni.showToast({ title: '当前平台不支持', icon: 'none' });
            reject(new Error('当前平台不支持Wi-Fi连接'));
            // #endif
        });
    }
    
    /**
     * 断开Wi-Fi连接
     */
    static disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            // #ifdef APP-PLUS
            plus.networkinfo.disconnectWifi({
                success: () => {
                    uni.showToast({ title: '已断开', icon: 'success' });
                    resolve();
                },
                fail: (err: any) => {
                    reject(new Error(err.message || '断开失败'));
                }
            });
            // #endif
            
            // #ifndef APP-PLUS
            uni.showToast({ title: '当前平台不支持', icon: 'none' });
            reject(new Error('当前平台不支持'));
            // #endif
        });
    }
}

export default {
    WifiUtils,
    WifiPasswordManager,
    WifiConnectionManager
};
