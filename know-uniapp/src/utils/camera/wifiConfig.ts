/**
 * WiFi配网类
 * 用于将WiFi凭据发送给摄像头设备
 */

export interface WifiConfigData {
    ssid: string
    password: string
    bssid?: string
}

export interface ConfigStatus {
    step: 'init' | 'broadcasting' | 'waiting' | 'success' | 'failed'
    message: string
    progress: number
}

export interface DiscoveredDevice {
    ip: string
    mac: string
    port: number
    manufacturer?: string
    status: 'online' | 'offline' | 'configuring'
}

export class WiFiConfigManager {
    private static UDP_PORT = 8899
    private static BROADCAST_INTERVAL = 100 // ms
    private static MAX_BROADCAST_COUNT = 50
    private static WAIT_TIMEOUT = 30000 // ms

    private statusCallback?: (status: ConfigStatus) => void
    private discoveredCallback?: (device: DiscoveredDevice) => void

    /**
     * 设置状态回调
     */
    setStatusCallback(callback: (status: ConfigStatus) => void): void {
        this.statusCallback = callback
    }

    /**
     * 设置设备发现回调
     */
    setDiscoveredCallback(callback: (device: DiscoveredDevice) => void): void {
        this.discoveredCallback = callback
    }

    /**
     * 开始配网流程
     */
    async startConfig(wifiData: WifiConfigData): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.updateStatus('broadcasting', '正在发送WiFi配置...', 10)

            // 模拟UDP广播配网过程
            this.simulateBroadcast(wifiData)
                .then(() => {
                    this.updateStatus('waiting', '等待设备连接...', 60)
                    return this.waitForDeviceOnline()
                })
                .then(() => {
                    this.updateStatus('success', '配网成功！', 100)
                    resolve(true)
                })
                .catch((err) => {
                    this.updateStatus('failed', err.message || '配网失败', 0)
                    reject(err)
                })
        })
    }

    /**
     * 模拟UDP广播
     */
    private async simulateBroadcast(wifiData: WifiConfigData): Promise<void> {
        return new Promise((resolve) => {
            let count = 0
            const interval = setInterval(() => {
                count++
                const progress = Math.min(10 + (count / this.MAX_BROADCAST_COUNT) * 50, 60)
                this.updateStatus(
                    'broadcasting',
                    `正在发送配置...(${count}/${this.MAX_BROADCAST_COUNT})`,
                    progress
                )

                if (count >= this.MAX_BROADCAST_COUNT) {
                    clearInterval(interval)
                    resolve()
                }
            }, this.BROADCAST_INTERVAL)
        })
    }

    /**
     * 等待设备上线
     */
    private async waitForDeviceOnline(): Promise<DiscoveredDevice> {
        return new Promise((resolve, reject) => {
            let elapsed = 0
            const checkInterval = 1000

            const timer = setInterval(() => {
                elapsed += checkInterval
                const progress = 60 + Math.min((elapsed / this.WAIT_TIMEOUT) * 30, 30)

                // 模拟设备发现
                if (elapsed >= 5000) {
                    clearInterval(timer)
                    const device: DiscoveredDevice = {
                        ip: '192.168.1.100',
                        mac: 'AA:BB:CC:DD:EE:FF',
                        port: 8080,
                        manufacturer: 'Generic',
                        status: 'online'
                    }
                    this.discoveredCallback?.(device)
                    resolve(device)
                }
            }, checkInterval)

            // 超时处理
            setTimeout(() => {
                clearInterval(timer)
                reject(new Error('等待设备超时，请检查设备是否在配网模式'))
            }, this.WAIT_TIMEOUT)
        })
    }

    /**
     * 更新状态
     */
    private updateStatus(step: ConfigStatus['step'], message: string, progress: number): void {
        this.statusCallback?.({
            step,
            message,
            progress
        })
    }

    /**
     * 停止配网
     */
    stopConfig(): void {
        // 清理资源
        this.updateStatus('init', '已停止', 0)
    }
}

/**
 * WiFi配置状态管理
 */
export const wifiConfigStore = {
    state: {
        configData: null as WifiConfigData | null,
        status: 'init' as ConfigStatus['step'],
        progress: 0,
        message: '',
        discoveredDevice: null as DiscoveredDevice | null
    },

    setConfigData(data: WifiConfigData) {
        this.state.configData = data
    },

    updateStatus(status: ConfigStatus['step'], message: string, progress: number) {
        this.state.status = status
        this.state.message = message
        this.state.progress = progress
    },

    setDiscoveredDevice(device: DiscoveredDevice) {
        this.state.discoveredDevice = device
    },

    reset() {
        this.state = {
            configData: null,
            status: 'init',
            progress: 0,
            message: '',
            discoveredDevice: null
        }
    }
}

export default new WiFiConfigManager()
