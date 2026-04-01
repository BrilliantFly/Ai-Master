# 行业与市场管理系统

当前版本： 1.0.0

---

## 一、系统概述

### 1.1 功能定位

整合客户信息调研与市场行业调研的系统化管理，支持客户信息多维度分析、市场行业数据采集、企业关联管理。

### 1.2 核心功能

| 模块 | 说明 |
|------|------|
| 客户信息管理 | 多维度客户画像，基础信息+深入分析 |
| 市场行业调研 | 市场与行业数据采集与分析 |
| 企业管理 | 客户关联企业（现任职/曾任职） |
| 价值分析 | 客户需求挖掘、应对策略 |

### 1.3 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        表现层                                 │
│    Web端 (know-vue)          移动端 (know-uniapp)            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        服务层 (know-boot)                   │
│  ┌──────────────┬──────────────┬──────────────┬───────────┐  │
│  │ 客户管理模块  │ 行业管理模块 │ 企业管理模块  │ 分析模块   │  │
│  │ customer     │ industry    │ enterprise   │ analysis  │  │
│  └──────────────┴──────────────┴──────────────┴───────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        数据层                                 │
│    MySQL 8.0              Redis (缓存)                      │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 模块划分

| 模块 | 前缀 | 说明 |
|------|------|------|
| 客户管理 | customer | 客户信息、家庭、成长、价值分析 |
| 行业管理 | industry | 行业、产品、企业数据 |
| 企业管理 | enterprise | 企业信息、竞争分析 |
| 调研管理 | research | 调研问卷、数据采集 |

---

## 二、客户信息调研设计

### 2.1 基础信息模块

#### 2.1.1 客户个人资料

```sql
-- 客户基础信息表
CREATE TABLE `customer_info` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) DEFAULT NULL COMMENT '姓名',
  `gender` tinyint DEFAULT NULL COMMENT '性别: 0-女, 1-男',
  `age` int DEFAULT NULL COMMENT '年龄',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `address` varchar(200) DEFAULT NULL COMMENT '地址',
  `education` varchar(50) DEFAULT NULL COMMENT '教育背景',
  `personality` varchar(200) DEFAULT NULL COMMENT '性格',
  `occupation` varchar(100) DEFAULT NULL COMMENT '职业',
  `hobbies` varchar(500) DEFAULT NULL COMMENT '兴趣爱好',
  `values` varchar(500) DEFAULT NULL COMMENT '价值观',
  `lifestyle` varchar(500) DEFAULT NULL COMMENT '衣食住行',
  `appearance` varchar(200) DEFAULT NULL COMMENT '外貌特征',
  `social_class` varchar(50) DEFAULT NULL COMMENT '社会阶层',
  `income_source` varchar(200) DEFAULT NULL COMMENT '赚钱方式',
  `social_circle` varchar(500) DEFAULT NULL COMMENT '社交圈',
  `status` tinyint DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常',
  `create_by` bigint DEFAULT NULL,
  `create_time` bigint DEFAULT NULL,
  `update_by` bigint DEFAULT NULL,
  `update_time` bigint DEFAULT NULL,
  `delete_time` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
);
```

| 字段 | 说明 | 来源 |
|------|------|------|
| 外貌特征 | 身高、体型、穿着风格 | 1.1 |
| 性格 | 内向/外向、情绪稳定性 | 1.1 |
| 衣食住行 | 消费习惯、居住环境、出行方式 | 1.1 |
| 赚钱方式 | 职业、收入来源、投资 | 1.1 |
| 社会阶层 | 精英/中产/基层 | 1.1 |
| 社交圈 | 朋友圈层、社团 | 1.1 |

#### 2.1.2 家庭信息

```sql
-- 客户家庭信息表
CREATE TABLE `customer_family` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL COMMENT '客户ID',
  `family_type` tinyint DEFAULT 1 COMMENT '家庭类型: 1-配偶, 2-父母, 3-子女, 4-兄弟姐妹',
  `name` varchar(50) DEFAULT NULL COMMENT '姓名',
  `age` int DEFAULT NULL COMMENT '年龄',
  `occupation` varchar(100) DEFAULT NULL COMMENT '职业',
  `create_time` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`)
);
```

| 字段 | 说明 | 来源 |
|------|------|------|
| 家庭成员 | 配偶、父母、子女信息 | 2.1 |
| 家庭住址 | 居住地址、地域 | 2.1 |
| 地域文化 | 籍贯、区域特性 | 2.1 |

### 2.2 深入分析模块

#### 2.2.1 成长与经历

```sql
-- 客户成长经历表
CREATE TABLE `customer_growth` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL COMMENT '客户ID',
  `stage` varchar(50) DEFAULT NULL COMMENT '成长阶段: 童年/学生/初入职场/职业发展',
  `event` varchar(500) DEFAULT NULL COMMENT '关键事件',
  `description` varchar(1000) DEFAULT NULL COMMENT '描述',
  `create_time` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`)
);
```

| 字段 | 说明 | 来源 |
|------|------|------|
| 成长阶段 | 童年、学生、初入职场、事业期 | 2.2 |
| 人生经历 | 重大事件、转折点 | 2.2 |
| 生活技能 | 专业能力、才艺、软技能 | 2.2 |

#### 2.2.2 动态与价值分析

```sql
-- 客户价值分析表
CREATE TABLE `customer_value_analysis` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL COMMENT '客户ID',
  `need_level` varchar(50) DEFAULT NULL COMMENT '需求层次: 生理/安全/社交/尊重/自我实现',
  `expectation` varchar(500) DEFAULT NULL COMMENT '期望',
  `interest` varchar(500) DEFAULT NULL COMMENT '利益点',
  `psychology` varchar(500) DEFAULT NULL COMMENT '心理特征',
  `strategy` varchar(500) DEFAULT NULL COMMENT '应对策略',
  `script` varchar(1000) DEFAULT NULL COMMENT '话术设计',
  `create_time` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`)
);
```

| 分析维度 | 说明 |
|----------|------|
| 人性分析 | 性格、价值观、心理特征 |
| 需求分析 | 马斯洛需求层次理论 |
| 期望与利益 | 核心诉求、利益点 |
| 应对策略 | 针对性策略、话术 |

---

## 三、市场与行业调研设计

### 3.1 行业信息表

```sql
-- 行业信息表
CREATE TABLE `industry_info` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `industry_name` varchar(100) NOT NULL COMMENT '行业名称',
  `category` varchar(50) DEFAULT NULL COMMENT '行业分类',
  `definition` varchar(1000) DEFAULT NULL COMMENT '行业定义',
  `technology` varchar(500) DEFAULT NULL COMMENT '技术特点',
  `market_size` varchar(100) DEFAULT NULL COMMENT '市场规模',
  `growth_potential` varchar(100) DEFAULT NULL COMMENT '增长潜力',
  `upstream` varchar(500) DEFAULT NULL COMMENT '上游产业链',
  `midstream` varchar(500) DEFAULT NULL COMMENT '中游产业链',
  `downstream` varchar(500) DEFAULT NULL COMMENT '下游产业链',
  `channel` varchar(500) DEFAULT NULL COMMENT '销售渠道',
  `marketing` varchar(500) DEFAULT NULL COMMENT '营销方式',
  `dynamic_info` varchar(1000) DEFAULT NULL COMMENT '动态信息',
  `value_info` varchar(1000) DEFAULT NULL COMMENT '价值信息',
  `resource` varchar(500) DEFAULT NULL COMMENT '行业资源',
  `strategy` varchar(1000) DEFAULT NULL COMMENT '应对策略',
  `status` tinyint DEFAULT 1 COMMENT '状态',
  `create_time` bigint DEFAULT NULL,
  `update_time` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
);
```

### 3.2 产品信息表

```sql
-- 产品信息表
CREATE TABLE `industry_product` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `industry_id` bigint NOT NULL COMMENT '行业ID',
  `product_name` varchar(100) NOT NULL COMMENT '产品名称',
  `category` varchar(50) DEFAULT NULL COMMENT '产品分类',
  `concept` varchar(500) DEFAULT NULL COMMENT '产品概念',
  `细分` varchar(100) DEFAULT NULL COMMENT '产品细分',
  `附加价值` varchar(500) DEFAULT NULL COMMENT '产品附加值',
  `lifecycle` varchar(50) DEFAULT NULL COMMENT '产品生命周期',
  `consumer_insight` varchar(1000) DEFAULT NULL COMMENT '消费者洞察',
  `core_product` varchar(500) DEFAULT NULL COMMENT '核心产品',
  `basic_product` varchar(500) DEFAULT NULL COMMENT '基础产品',
  `additional_product` varchar(500) DEFAULT NULL COMMENT '附加产品',
  `potential_product` varchar(500) DEFAULT NULL COMMENT '潜在产品',
  PRIMARY KEY (`id`),
  KEY `idx_industry_id` (`industry_id`)
);
```

### 3.3 企业信息表

```sql
-- 企业信息表
CREATE TABLE `industry_enterprise` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `industry_id` bigint DEFAULT NULL COMMENT '行业ID',
  `enterprise_name` varchar(100) NOT NULL COMMENT '企业名称',
  `enterprise_type` varchar(50) DEFAULT NULL COMMENT '企业/平台类型',
  `established_date` date DEFAULT NULL COMMENT '成立时间',
  `registered_capital` decimal(15,2) DEFAULT NULL COMMENT '注册资本',
  `paid_capital` decimal(15,2) DEFAULT NULL COMMENT '实缴资本',
  `scale` varchar(50) DEFAULT NULL COMMENT '企业规模',
  `insured_count` int DEFAULT NULL COMMENT '参保人数',
  `is_listed` tinyint DEFAULT 0 COMMENT '是否上市: 0-否, 1-是',
  `main_business` varchar(500) DEFAULT NULL COMMENT '主要业务',
  `core_technology` varchar(500) DEFAULT NULL COMMENT '核心技术',
  `products` varchar(500) DEFAULT NULL COMMENT '产品',
  `market_performance` varchar(500) DEFAULT NULL COMMENT '市场表现',
  `competitor` varchar(500) DEFAULT NULL COMMENT '竞争对手',
  `advantage` varchar(500) DEFAULT NULL COMMENT '竞争优势',
  `disadvantage` varchar(500) DEFAULT NULL COMMENT '不足',
  PRIMARY KEY (`id`),
  KEY `idx_industry_id` (`industry_id`)
);
```

---

## 四、客户与企业关联设计

### 4.1 客户任职企业表

一个客户可以管理多个企业（当前任职或曾经任职）

```sql
-- 客户任职企业表
CREATE TABLE `customer_enterprise` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL COMMENT '客户ID',
  `enterprise_id` bigint DEFAULT NULL COMMENT '企业ID',
  `enterprise_name` varchar(100) DEFAULT NULL COMMENT '企业名称',
  `industry` varchar(50) DEFAULT NULL COMMENT '行业',
  `position` varchar(50) DEFAULT NULL COMMENT '职务',
  `entry_date` date DEFAULT NULL COMMENT '入职时间',
  `leave_date` date DEFAULT NULL COMMENT '离职时间',
  `employment_type` tinyint DEFAULT 1 COMMENT '任职类型: 1-现任职, 2-曾任职',
  `status` tinyint DEFAULT 1 COMMENT '状态: 0-离职, 1-在职',
  `create_time` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_enterprise_id` (`enterprise_id`)
);
```

### 4.2 数据关联关系

```
客户 (customer_info)
    ↓
    ├── 家庭 (customer_family)
    ├── 成长经历 (customer_growth)
    ├── 价值分析 (customer_value_analysis)
    └── 任职企业 (customer_enterprise)
              ↓
              └── 企业 (industry_enterprise)
                    ↓
                    └── 行业 (industry_info)
                          ↓
                          └── 产品 (industry_product)
```

---

## 五、字段对照表

### 5.1 客户信息调研字段映射

| Excel分类 | 文档分类 | 字段 |
|-----------|----------|------|
| 基础信息-客户个人资料 | 外貌 | appearance |
| 基础信息-客户个人资料 | 性格 | personality |
| 基础信息-客户个人资料 | 衣食住行 | lifestyle |
| 基础信息-客户个人资料 | 赚钱方式 | income_source |
| 基础信息-客户个人资料 | 社会阶层 | social_class |
| 基础信息-客户个人资料 | 社交圈 | social_circle |
| 家庭情况 | 家庭 | customer_family表 |
| 家庭住址 | 地域文化 | address, 籍贯字段 |
| 成长阶段 | 成长阶段 | customer_growth表 |
| 人生经历 | 人生经历 | customer_growth表 |
| 生活技能 | 生活技能 | occupation, hobbies |
| 动态信息 | 动态分析 | value_analysis表 |
| 价值信息 | 价值分析 | value_analysis表 |

### 5.2 市场行业调研字段映射

| Excel分类 | 表 | 字段 |
|-----------|-----|------|
| 行业-定义 | industry_info | definition |
| 行业-技术 | industry_info | technology |
| 行业-产品 | industry_product | product相关字段 |
| 行业-上下游产业链 | industry_info | upstream/midstream/downstream |
| 行业-渠道 | industry_info | channel |
| 行业-营销 | industry_info | marketing |
| 企业-企业情况 | industry_enterprise | enterprise相关字段 |
| 行业与市场-商业模式 | industry_info | 商业模式画布字段 |

---

## 六、接口设计

### 6.1 客户管理接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/customer/page | GET | 分页查询客户 |
| /api/customer | POST | 新增客户 |
| /api/customer/{id} | GET | 客户详情 |
| /api/customer/{id} | PUT | 修改客户 |
| /api/customer/{id} | DELETE | 删除客户 |
| /api/customer/{id}/family | GET | 家庭信息 |
| /api/customer/{id}/growth | GET | 成长经历 |
| /api/customer/{id}/analysis | GET | 价值分析 |
| /api/customer/{id}/enterprise | GET | 关联企业 |

### 6.2 行业管理接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/industry/page | GET | 分页查询行业 |
| /api/industry | POST | 新增行业 |
| /api/industry/{id} | GET | 行业详情 |
| /api/industry/{id}/products | GET | 行业产品列表 |
| /api/industry/{id}/enterprises | GET | 行业企业列表 |

### 6.3 企业管理接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/enterprise/page | GET | 分页查询企业 |
| /api/enterprise | POST | 新增企业 |
| /api/enterprise/{id} | GET | 企业详情 |
| /api/enterprise/analysis | GET | 竞争分析 |

### 6.4 客户企业关联接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/customer/enterprise | POST | 添加客户任职企业 |
| /api/customer/enterprise/{id} | PUT | 修改任职信息 |
| /api/customer/enterprise/{id} | DELETE | 删除任职记录 |
| /api/customer/{id}/career | GET | 职业履历（所有任职） |

---

## 七、前端页面设计

### 7.1 页面结构

```
客户管理
├── 客户列表
│   ├── 搜索/筛选
│   └── 客户卡片展示
├── 客户详情
│   ├── 基本信息（外貌、性格、衣食住行）
│   ├── 家庭信息
│   ├── 成长经历
│   ├── 价值分析（需求层次、应对策略）
│   └── 职业履历（任职企业）
├── 客户新增/编辑
└── 客户分析报表

行业管理
├── 行业列表
├── 行业详情
│   ├── 基础信息（定义、技术、产业链）
│   ├── 产品分析
│   └── 企业列表
└── 行业新增/编辑

企业管理
├── 企业列表
├── 企业详情
│   ├── 基本信息
│   ├── 竞争分析
│   └── 上下游关系
└── 企业新增/编辑

市场调研
├── 调研问卷
├── 数据采集
└── 分析报告
```

### 7.2 客户画像页面

```
┌─────────────────────────────────────────────────────────────┐
│  客户画像                                                        │
├─────────────────────────────────────────────────────────────┤
│  基础信息                                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 姓名: 张三    性别: 男    年龄: 35    教育: 硕士       │  │
│  │ 手机: 138xxxx   邮箱: xxx@xx.com                      │  │
│  │ 地址: 上海市浦东新区                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  外貌特征: 高个子, 穿着得体, 仪表整洁                         │
│  性格: 外向, 健谈, 决策果断                                  │
│  衣食住行: 高端消费, 住市区商品房, 开BBA                      │
│  赚钱方式: 企业高管, 股权投资                                  │
│  社会阶层: 中产精英                                          │
│  社交圈: 企业家协会, 高尔夫球友                              │
│                                                              │
│  家庭情况                                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 配偶: 企业家, 子女: 2个, 父母: 退休干部                 │  │
│  │ 住址: 别墅区, 地域: 海派文化                             │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  价值分析                                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 需求层次: 尊重需求 + 自我实现                            │  │
│  │ 期望: 事业扩展, 社会认可                                 │  │
│  │ 利益点: 资源整合, 商业机会                              │  │
│  │ 策略: 价值共鸣, 长期维护                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  职业履历                                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 现职: XX科技CEO (2020-至今)                            │  │
│  │ 曾职: YY集团总监 (2015-2020)                            │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 八、版本历史

| 版本 | 更新内容 |
|------|----------|
| 1.0.0 | 初始版本，包含客户信息调研、市场行业调研、企业关联管理 |