项目架构
===============

当前最新版本： 0.0.1

## 全栈项目架构

```
全栈项目架构
├── 项目文档    
│    └── know-doc        -- 模块功能参考文档（文档+数据库）
├── 后端（服务端）           
│    └── know-boot       -- SpringCloud微服务
│    └── know-python     -- Python接口服务
├── 前端（Web端）
│    └── know-vue        -- Vue前端（管理端/门户端）
└── 前端（移动端）    
    └── know-uniapp     -- 微信小程序（管理端/门户端）

备注：
1、know-vue、know-uniapp同时支持know-boot、konw-python两种接口
2、konw-boot是微服务架构
    2.1、启动方式
    - 可以微服务形式启动
    - 可以system单独启动，可以访问所有模块内容
    2.2、相关配置
    - system模块启动方式可以通过配置自由切换微服务形式启动、单例启动
    - know-vue、know-uniapp通过配置自由切换微服务形式、单例接口访问形式
3、know-doc
   数据库由AI设计生成后，以模块名称+时间为文件名保存
```

## 系统架构

### 技术选型
```
技术选型
├── 后端（Java）                 
│    ├── SpringCloud     -- 版本：2021.0.1
│    ├──Spring Security -- 权限认证框架
│    ├── Springboot      -- 版本：2.6.6
│    ├── Maven           -- 版本：3.8.8
│    └── ...             -- ...
├── 后端（Python）                 
│    └── Python
├── 前端
│    └── Vue             -- 版本：3
│    └── Ant Design Vue、Element Plus（双UI库）
├── 移动端
│    └── uniapp
└── 数据库
    └── MySQL           -- 版本：5.7
```

### 后端（服务器）架构

- 系统目录结构

```
know-boot
├── accumulate      -- 积累模块
├── base            -- 基础模块
│    ├── config      -- 基础配置
│    ├── annotation  -- 自定义注解
│    └── utils       -- 公共工具类
├── common          -- 公共模块
│    ├── constant    -- 公共常量
│    ├── feign       -- 公共远程调用
│    ├── dto         -- 各个业务模块dto，根据业务模块建立子文件夹（feign通用）
│    ├── vo          -- 各个业务模块vo，根据业务模块建立子文件夹（feign通用）
│    └── enum        -- 公共枚举
├── starter         -- 自定义starter模块，封装中间件
├── gateway         -- 网关模块
│    └── security    -- 鉴权模块
├── api             -- 公共api模块（与业务耦合度不高，通用的服务）
└── biz             -- 业务模块，比如system
```

- 微服务

```
微服务
├── nacos            -- 注册中心、分布式配置管理
├── gateway          -- 网关
├── Feign            -- 声明式WebService客户端
├── Ribbon           -- 负载均衡
├── Seata            -- 分布式事务
├── Hystrix          -- 断路器
├── Sentinel         -- 分布式系统的流量防卫兵
├── jetcache         -- 分布式缓存
├── xxx-job          -- 分布式任务调度平台
├── ELK              -- 日志系统
├── GPE              -- 监控系统
├── Skywalking       -- 链路追踪
├── Zipin            -- 链路追踪
├── Pinpoint         -- 链路追踪
└── ...              -- ...
```

- 中间件

```
中间件
├── Easypoi          -- poi处理
├── Elasticsearch    -- 分布式全文检索引擎
├── Flyway           -- 数据库版本管理
├── Rabbitmq         -- 消息队列
├── Redis            -- 非关系型数据库
├── Redission        -- 分布式锁
├── Security         -- 认证授权
├── Swagger          -- 接口文档
├── TokenBucket      -- 令牌桶
├── WebSocket        -- 网络通信
└── ...              -- ...
```

- 自动化部署

```
k8s+Jenkins+GitLab
```

### 前端（Web端）架构

组件

```
组件
├── Ant Design Vue              -- 4.2.5	主要UI库
├── Element Plus                -- 2.4.4	备用UI库
└── src/components/           -- 自定义业务组件

备注：
1、以Ant Design Vue组件为主
       
```

### 前端（移动端）架构

- 组件

```
组件
├── uView UI (vk-uview-ui)    -- 主要 UI 组件库
├── z-paging                  -- 分页列表组件
├── uni_modules               -- UniApp 内置组件
└── src/components/           -- 自定义业务组件
    ├── widgets/              # 业务小部件 (7个)
    │   ├── banner/           # Banner 轮播
    │   ├── nav/              # 导航
    │   ├── search/           # 搜索框
    │   ├── middle-banner/    # 中间 banner
    │   ├── popular/          # 热门推荐
    │   ├── user-banner/     # 用户横幅
    │   ├── user-info/        # 用户信息
    │   └── customer-service/ # 客服
    ├── tabs/                 # 标签切换组件
    ├── tabbar/               # 自定义底部导航
    ├── news-card/            # 新闻卡片
    ├── avatar-upload/        # 头像上传
    ├── price/                # 价格显示
    ├── payment/              # 支付组件
    ├── page-status/          # 页面状态
    ├── l-swiper/             # 轮播组件
    ├── mplogin-popup/        # 小程序登录弹窗
    ├── custom-tab-bar/       # 自定义 TabBar
    ├── bottom-comment/       # 底部评论
    ├── cc-comment/           # 评论组件
    └── textarea-comment/     # 文本域评论
    
备注：
1、z-paging 完整支持
 - ✅ 下拉刷新 (pull-to-refresh)
 - ✅ 上拉加载更多 (load-more)
 - ✅ 自动加载
 - ✅ 自动显示返回顶部按钮
 - ✅ 空数据占位
 - ✅ 自定义下拉刷新、上拉加载样式    
```

- 开发命令

```
npm run dev:h5        # H5 开发
npm run dev:mp-weixin # 微信小程序
npm run dev:app       # App 原生
npm run build:h5      # H5 构建
```


### 系统模块构建规则
```
1、后端
    - 如果是新增微服务模块，需要根据已有模块格式命名，并且添加.gitignore文件，忽略常见内容
    - 开发基本原则：基于已有的结构开发，保持风格一致
2、数据库
    - 如果是新增模块，数据库表名前缀根据模块名称加下划线定义，如：sys_
3、前端、移动端
    - 依据后端微服务模块，前面同一个模块放在同一个文件夹下
    - 基本开发的原则：基于原有项目结构、组件进行开发，保持风格一致；如果组件不满足开发需求，封装新的组件
4、系统构建完成后相关表的SQL语句，放在读取的.md文件夹下，命名：模块+日期
```

## 自动化测试环境
```
该环境用于opencode测试代码使用
1、数据库
    - 数据库连接地址：
2、Redis
    - Redis连接地址：
3、Maven：
    - Maven路径：
    - Maven本地仓库路径：  
```


