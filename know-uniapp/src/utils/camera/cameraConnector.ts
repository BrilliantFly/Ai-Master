/**
 * 摄像头设备连接类
 * 提供RTSP/HTTP连接、视频流管理等功能
 */

export type StreamType = 'main' | 'sub' | 'auto'
export type VideoCodec = 'h264' | 'h265' | 'jpeg' | 'mpeg4'
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface CameraConnectionConfig {
    ip: string
    port?: number
    username?: string
    password?: string
    protocol?: 'rtsp' | 'http' | 'https'
    streamType?: StreamType
    codec?: VideoCodec
    timeout?: number
}

export interface CameraStreamInfo {
    url: string
    codec: VideoCodec
    resolution?: string
    bitrate?: number
    framerate?: number
}

export interface CameraCapability {
    ptz: boolean // 是否支持云台控制
    audio: boolean // 是否支持音频
    snapshot: boolean // 是否支持截图
    record: boolean // 是否支持录像
    multiStream: boolean // 是否支持多码流
}

export interface PTZCommand {
    command:
        | 'up'
        | 'down'
        | 'left'
        | 'right'
        | 'zoom_in'
        | 'zoom_out'
        | 'focus_near'
        | 'focus_far'
        | 'home'
        | 'preset'
    speed?: number // 速度 1-64
    presetId?: number // 预置点ID (用于preset命令)
    duration?: number // 持续时间ms
}

export class CameraConnector {
    private config: CameraConnectionConfig | null = null
    private status: ConnectionStatus = 'disconnected'
    private streamInfo: CameraStreamInfo | null = null
    private capability: CameraCapability | null = null

    /**
     * 连接摄像头
     */
    async connect(config: CameraConnectionConfig): Promise<CameraStreamInfo> {
        this.config = config
        this.status = 'connecting'

        try {
            // 验证配置
            this.validateConfig(config)

            // 获取能力信息
            await this.fetchCapability()

            // 获取视频流信息
            this.streamInfo = await this.getStreamInfo()

            this.status = 'connected'
            return this.streamInfo
        } catch (error) {
            this.status = 'error'
            throw error
        }
    }

    /**
     * 断开连接
     */
    disconnect(): void {
        this.config = null
        this.status = 'disconnected'
        this.streamInfo = null
    }

    /**
     * 获取连接状态
     */
    getStatus(): ConnectionStatus {
        return this.status
    }

    /**
     * 获取视频流URL
     */
    getStreamUrl(streamType: StreamType = 'main'): string {
        if (!this.config) {
            throw new Error('未连接摄像头')
        }

        const { ip, port = 554, username, password, protocol = 'rtsp' } = this.config

        // 构建认证信息
        const auth =
            username && password
                ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
                : ''

        // 流名称
        const streamName = streamType === 'main' ? 'stream1' : 'stream2'

        // RTSP URL
        if (protocol === 'rtsp') {
            return `rtsp://${auth}${ip}:${port}/${streamName}`
        }

        // HTTP FLV流
        return `http://${auth}${ip}:${port}/live/${streamName}.flv`
    }

    /**
     * 获取截图URL
     */
    getSnapshotUrl(): string {
        if (!this.config) {
            throw new Error('未连接摄像头')
        }

        const { ip, port = 80, username, password } = this.config
        const auth = username && password ? `?user=${username}&pass=${password}` : ''

        return `http://${ip}:${port}/ISAPI/Streaming/Channels/101/picture${auth}`
    }

    /**
     * 获取设备能力
     */
    getCapability(): CameraCapability {
        if (!this.capability) {
            // 返回默认能力
            return {
                ptz: true,
                audio: true,
                snapshot: true,
                record: true,
                multiStream: true
            }
        }
        return this.capability
    }

    /**
     * 云台控制
     */
    async ptzControl(command: PTZCommand): Promise<boolean> {
        if (!this.config || !this.capability?.ptz) {
            return false
        }

        // 实际需要发送HTTP请求到摄像头的云台控制接口
        console.log('PTZ控制:', command)

        return true
    }

    /**
     * 获取设备信息
     */
    async getDeviceInfo(): Promise<{
        manufacturer: string
        model: string
        firmware: string
        serial: string
    }> {
        if (!this.config) {
            throw new Error('未连接摄像头')
        }

        // 模拟设备信息
        return {
            manufacturer: this.config.username ? '海康威视' : '通用设备',
            model: 'DS-2CD3xxx',
            firmware: 'V5.5.800',
            serial: 'DSN1234567890ABCD'
        }
    }

    /**
     * 验证配置
     */
    private validateConfig(config: CameraConnectionConfig): void {
        if (!config.ip) {
            throw new Error('IP地址不能为空')
        }

        if (config.port && (config.port < 1 || config.port > 65535)) {
            throw new Error('端口号无效')
        }
    }

    /**
     * 获取设备能力
     */
    private async fetchCapability(): Promise<void> {
        // 模拟获取能力
        this.capability = {
            ptz: true,
            audio: true,
            snapshot: true,
            record: true,
            multiStream: true
        }
    }

    /**
     * 获取视频流信息
     */
    private async getStreamInfo(): Promise<CameraStreamInfo> {
        const streamType = this.config?.streamType || 'main'

        return {
            url: this.getStreamUrl(streamType),
            codec: 'h264',
            resolution: '1920x1080',
            bitrate: 4096,
            framerate: 25
        }
    }

    /**
     * 生成RTSP URL (静态方法)
     */
    static generateRtspUrl(config: Omit<CameraConnectionConfig, 'protocol'>): string {
        const { ip, port = 554, username, password, streamType = 'main' } = config

        const auth =
            username && password
                ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
                : ''

        const streamName = streamType === 'main' ? 'stream1' : 'stream2'

        return `rtsp://${auth}${ip}:${port}/${streamName}`
    }

    /**
     * 解析RTSP URL
     */
    static parseRtspUrl(url: string): CameraConnectionConfig | null {
        try {
            const match = url.match(/rtsp:\/\/(?:(.+):(.+)@)?([^:]+):(\d+)\/(.+)/)
            if (!match) return null

            const [, username, password, ip, port, streamPath] = match

            return {
                ip,
                port: parseInt(port),
                username,
                password,
                streamType: streamPath.includes('stream1') ? 'main' : 'sub'
            }
        } catch {
            return null
        }
    }
}

/**
 * 单例导出
 */
export const cameraConnector = new CameraConnector()

export default cameraConnector
