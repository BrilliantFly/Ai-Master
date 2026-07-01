# know-uniapp 功能说明

## 项目定位

`know-uniapp` 是 know 系统的移动端/小程序/H5 前端项目，基于 uni-app 构建，承载首页门户、用户中心、计划管理、摄像头管理、客户管理、文章搜索、钱包充值等功能。

项目实际路径：

```text
E:\Ai-Master\know-uniapp
```

注意：该项目不在 `E:\Ai-Master\know-boot\know-uniapp` 下，而是在工作区根目录。

## 技术栈

- Vue 3
- Vite
- uni-app
- Pinia
- uniapp-router-next
- uView / vk-uview-ui
- z-paging
- Tailwind CSS
- TypeScript

## 运行与构建

常用脚本位于 `package.json`：

```bash
npm run dev
npm run dev:h5
npm run dev:mp-weixin
npm run build
npm run build:h5
npm run build:mp-weixin
```

开发服务配置位于 `vite.config.ts`：

- H5 开发端口：`8991`
- H5 base：`/mobile/`
- `/api/plan` 代理到 `http://localhost:8082`
- `/api/python` 代理到 `http://localhost:5000`
- 默认 `/api` 代理到 `http://localhost:8082`

摄像头接口在 `src/api/camera.ts` 中单独直连：

```text
http://localhost:8085
```

## 后端服务关系

项目通过不同 API 文件对接多个服务：

- Java 后端服务：计划、系统、用户、文章、钱包等，主要走 `/api`
- Python AI 服务：`/python`
- 客户管理服务：`customerBaseUrl`
- 摄像头服务：`http://localhost:8085`
- 本地/平台能力：Wi-Fi 扫描、剪贴板、分享、图片预览等 uni-app 能力

## 核心功能模块

### 1. 首页门户

相关文件：

- `src/pages/index/index.vue`
- `src/pages/index/home-sections.ts`
- `src/api/system/menu.ts`
- `src/api/plan/home.ts`

主要功能：

- 首页轮播推荐
- 搜索入口
- 首页菜单动态渲染
- 热门推荐
- 常用工具
- 动态菜单后端下发
- 入口覆盖摄像头、计划、客户、文章、收藏、客服、数据分析等

### 2. 用户体系

相关文件：

- `src/pages/login/login.vue`
- `src/pages/register/register.vue`
- `src/pages/forget_pwd/forget_pwd.vue`
- `src/pages/user/user.vue`
- `src/pages/user_data/user_data.vue`
- `src/pages/change_password/change_password.vue`
- `src/pages/bind_mobile/bind_mobile.vue`
- `src/stores/user.ts`
- `src/api/auth.ts`
- `src/api/user.ts`

主要功能：

- 登录
- 注册
- 忘记密码
- 获取用户信息
- Token 保存与刷新
- 登录态判断
- 用户中心
- 修改资料
- 修改密码
- 绑定手机号
- 登出

### 3. 计划管理

相关文件：

- `src/pages/plan/home/index.vue`
- `src/pages/plan/schedule/index.vue`
- `src/pages/plan/schedule/form.vue`
- `src/pages/plan/schedule/detail.vue`
- `src/pages/plan/habit/index.vue`
- `src/pages/plan/habit/form.vue`
- `src/pages/plan/focus/index.vue`
- `src/pages/plan/stats/index.vue`
- `src/api/plan/schedule.ts`
- `src/api/plan/habit.ts`
- `src/api/plan/focus.ts`

主要功能：

- 日程计划
- 日历视图
- 四象限任务分类
- 新增、编辑、删除日程
- 标记日程完成
- 今日统计
- 月度统计
- 习惯打卡
- 习惯新增与打卡记录
- 连续打卡里程碑
- 番茄专注计时
- 专注记录上报
- 统计洞察
- 时间审计

完成度判断：计划模块功能比较完整，页面、API 和统计逻辑都已经较成体系。

### 4. 摄像头管理

相关文件：

- `src/pages/camera/index.vue`
- `src/pages/camera/add.vue`
- `src/pages/camera/detail.vue`
- `src/pages/camera/edit.vue`
- `src/pages/camera/player.vue`
- `src/pages/camera/discover.vue`
- `src/pages/camera/wifi-config.vue`
- `src/pages/camera/records.vue`
- `src/pages/camera/snapshots.vue`
- `src/components/camera/LivePlayer.vue`
- `src/components/camera/PlayerControls.vue`
- `src/components/camera/WiFiConfig.vue`
- `src/api/camera.ts`
- `src/utils/camera/*`

主要功能：

- 摄像头设备列表
- 在线/离线状态展示
- 设备搜索
- 收藏过滤
- 添加设备
- 设备详情
- 删除设备
- 直播播放
- RTSP 流地址生成
- 播放控制
- 静音、全屏、画质切换入口
- 截图保存接口
- 开始/停止录像
- 录像记录列表
- 截图记录列表
- Wi-Fi 配网
- 可用 Wi-Fi 扫描

当前待完善点：

- 局域网设备发现页目前使用模拟数据
- 设备详情中的编辑、截图、录像按钮仍是“开发中”提示
- 播放器截图目前是模拟文件路径
- 录像下载逻辑是 TODO
- 画质切换还未真正切换视频流

### 5. 客户管理

相关文件：

- `src/pages/customer/info.vue`
- `src/pages/customer/followup.vue`
- `src/api/customer.ts`

主要功能：

- 客户列表
- 客户搜索
- 字母分组
- 客户统计
- 我的客户
- 客户详情
- 编辑客户资料
- 跟进记录列表
- 新增跟进
- 公司列表

当前待完善点：

- 新增客户入口当前只是提示“新增客户功能待接入”

### 6. 文章、搜索与收藏

相关文件：

- `src/pages/news/news.vue`
- `src/pages/news_detail/news_detail.vue`
- `src/pages/search/search.vue`
- `src/pages/collection/collection.vue`
- `src/api/news.ts`
- `src/api/shop.ts`

主要功能：

- 热门搜索
- 搜索历史
- 文章搜索
- 文章列表接口
- 文章详情接口
- 收藏文章
- 取消收藏
- 评论新增、查询、删除接口

当前状态：

- 搜索页和收藏页已经接真实 API
- `news.vue` 和 `news_detail.vue` 当前还是静态占位版

### 7. Wi-Fi 管理

相关文件：

- `src/pages/wifi/index.vue`
- `src/api/wifi.ts`
- `src/components/camera/WiFiConfig.vue`

主要功能：

- 获取当前连接 Wi-Fi
- 扫描可用 Wi-Fi
- 本地保存 Wi-Fi 凭证
- 删除 Wi-Fi 凭证
- 设置默认 Wi-Fi
- 生成 Wi-Fi 二维码数据
- 复制到剪贴板
- 摄像头 Wi-Fi 配网

当前状态：

- `pages/wifi/index.vue` 是静态占位
- 摄像头配网页已经使用 `api/wifi.ts` 的扫描能力

### 8. 钱包与支付

相关文件：

- `src/packages/pages/user_wallet/user_wallet.vue`
- `src/packages/pages/recharge/recharge.vue`
- `src/packages/pages/recharge_record/recharge_record.vue`
- `src/pages/payment_result/payment_result.vue`
- `src/api/pay.ts`
- `src/api/recharge.ts`

主要功能：

- 钱包页面
- 充值
- 充值记录
- 支付方式
- 预支付
- 查询支付结果

## 路由与权限

路由配置位于：

- `src/pages.json`
- `src/router/index.ts`

权限特点：

- 页面 meta 支持 `auth` 和 `white`
- 未登录访问鉴权页面会跳转登录页
- 登录前会记录返回地址
- H5 微信环境支持公众号授权参数处理

## 状态管理

Pinia store 位于 `src/stores`：

- `app.ts`：应用配置、动态菜单、图片 URL 处理
- `user.ts`：登录状态、用户信息、Token、登出
- `dict.ts`：系统字典
- `theme.ts`：主题配置

## 项目当前整体判断

`know-uniapp` 是一个已经具备完整业务框架的移动端应用，产品方向可以概括为：

```text
AI 智能监控 + 个人/团队计划效率 + 客户关系管理 + 内容与账户体系
```

其中计划模块最完整；摄像头模块页面覆盖面广，但部分核心能力还处于模拟或待接入状态；文章资讯和 Wi-Fi 独立管理页面仍偏占位，但相关接口能力已经存在。

## 建议后续优先级

1. 补齐文章列表和文章详情页面，让内容模块与现有 API 对齐。
2. 将摄像头发现页从模拟数据改为真实局域网扫描或后端发现接口。
3. 打通设备详情中的编辑、截图、录像操作。
4. 修复摄像头截图和录像下载 TODO。
5. 将 `pages/wifi/index.vue` 改造成真实 Wi-Fi 管理页面。
6. 补齐客户新增页面，复用已有 `CustomerForm` 类型和客户接口。
