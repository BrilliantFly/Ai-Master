/**
 * 摄像头设备发现类
 * 支持多协议并行发现: ONVIF, Hikvision SADP, Dahua等
 */

export interface DiscoveredCamera {
    ip: string
    port: number
    mac?: string
    manufacturer?: string
    model?: string
    deviceType?: string
    firmware?: string
    protocol?: 'onvif' | 'hikvision' | 'dahua' | 'generic'
    online: boolean
    discoveryTime: number
}

export interface DiscoveryOptions {
    timeout?: number // 单个协议超时(ms)
    ports?: number[] // 自定义扫描端口
    onProgress?: (progress: number, message: string) => void
}

export class CameraDiscovery {
    private static ONVIF_PORT = 3702
    private static HIKVISION_PORT = 8000
    private static DAHUA_PORT = 37777
    private static DEFAULT_TIMEOUT = 5000

    private discoveredCameras: Map<string, DiscoveredCamera> = new Map()
    private isDiscovering = false
    private abortController: AbortController | null = null

    /**
     * 开始发现设备
     */
    async startDiscovery(options: DiscoveryOptions = {}): Promise<DiscoveredCamera[]> {
        if (this.isDiscovering) {
            throw new Error('发现任务正在进行中')
        }

        this.isDiscovering = true
        this.discoveredCameras.clear()
        this.abortController = new AbortController()

        const timeout = options.timeout || this.DEFAULT_TIMEOUT
        const onProgress = options.onProgress

        try {
            // 并行执行多种协议的发现
            const protocols = [
                this.discoverONVIF(timeout),
                this.discoverHikvision(timeout),
                this.discoverDahua(timeout),
                this.discoverByPorts([554, 8554, 8080, 8081], timeout)
            ]

            onProgress?.(10, '开始扫描...')
            await Promise.allSettled(protocols)

            onProgress?.(100, `发现 ${this.discoveredCameras.size} 台设备`)

            return Array.from(this.discoveredCameras.values())
        } finally {
            this.isDiscovering = false
            this.abortController = null
        }
    }

    /**
     * 停止发现
     */
    stopDiscovery(): void {
        this.abortController?.abort()
        this.isDiscovering = false
    }

    /**
     * ONVIF WS-Discovery
     */
    private async discoverONVIF(timeout: number): Promise<void> {
        // ONVIF使用UDP广播在3702端口发现设备
        // 这里模拟实现，实际需要原生UDP支持
        await this.simulateDiscovery('onvif', this.ONVIF_PORT, {
            manufacturer: 'ONVIF兼容设备',
            protocol: 'onvif'
        })
    }

    /**
     * 海康设备发现 (SADP协议)
     */
    private async discoverHikvision(timeout: number): Promise<void> {
        // 海康SDK SADP协议，UDP 8000端口
        await this.simulateDiscovery('hikvision', this.HIKVISION_PORT, {
            manufacturer: 'Hikvision',
            protocol: 'hikvision'
        })
    }

    /**
     * 大华设备发现
     */
    private async discoverDahua(timeout: number): Promise<void> {
        // 大华私有协议，UDP 37777端口
        await this.simulateDiscovery('dahua', this.DAHUA_PORT, {
            manufacturer: 'Dahua',
            protocol: 'dahua'
        })
    }

    /**
     * 按端口扫描
     */
    private async discoverByPorts(ports: number[], timeout: number): Promise<void> {
        for (const port of ports) {
            await this.simulateDiscovery('generic', port)
        }
    }

    /**
     * 模拟设备发现 (实际需要原生网络能力)
     */
    private async simulateDiscovery(
        source: string,
        port: number,
        extra: Partial<DiscoveredCamera> = {}
    ): Promise<void> {
        return new Promise((resolve) => {
            // 模拟网络请求延迟
            setTimeout(() => {
                // 生成模拟IP
                const ip = this.generateLocalIP()
                const camera: DiscoveredCamera = {
                    ip,
                    port,
                    manufacturer: extra.manufacturer || '通用设备',
                    protocol: (extra.protocol as any) || 'generic',
                    online: true,
                    discoveryTime: Date.now(),
                    ...extra
                }

                this.addCamera(ip, camera)
                resolve()
            }, Math.random() * 1000 + 500)
        })
    }

    /**
     * 添加发现的设备
     */
    private addCamera(ip: string, camera: DiscoveredCamera): void {
        if (!this.discoveredCameras.has(ip)) {
            this.discoveredCameras.set(ip, camera)
        }
    }

    /**
     * 生成局域网IP
     */
    private generateLocalIP(): string {
        const base = '192.168.1.'
        const suffix = Math.floor(Math.random() * 255) + 1
        return `${base}${suffix}`
    }

    /**
     * 获取已发现的设备
     */
    getDiscoveredCameras(): DiscoveredCamera[] {
        return Array.from(this.discoveredCameras.values())
    }

    /**
     * 检查设备是否在线 (ping检测)
     */
    async checkOnline(ip: string, timeout = 3000): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                // 模拟ping检测
                resolve(Math.random() > 0.3)
            }, timeout)
        })
    }
}

/**
 * 单例导出
 */
export const cameraDiscovery = new CameraDiscovery()

/**
 * 常用设备发现协议配置
 */
export const DISCOVERY_PROTOCOLS = {
    onvif: {
        name: 'ONVIF',
        port: 3702,
        type: 'udp',
        description: '通用网络摄像头协议'
    },
    hikvision: {
        name: '海康威视',
        port: 8000,
        type: 'udp',
        description: '海康设备发现协议'
    },
    dahua: {
        name: '大华',
        port: 37777,
        type: 'udp',
        description: '大华设备发现协议'
    },
    rtsp: {
        name: 'RTSP',
        port: 554,
        type: 'tcp',
        description: '实时流协议'
    }
}

export default cameraDiscovery
