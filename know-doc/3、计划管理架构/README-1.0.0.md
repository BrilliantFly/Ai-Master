# 计划管理及日程管理系统

当前版本： 1.0.0

---

## 一、系统概述

### 1.1 功能定位

集计划管理、日程管理、时间四象限管理于一体的个人效能管理系统，支持计划与日程联动。

### 1.2 核心功能

| 模块 | 说明 |
|------|------|
| 计划管理 | 长期目标、短期计划、任务分解 |
| 日程管理 | 日/周/月视图、日程安排 |
| 时间四象限 | 重要紧急四象限分类 |
| 计划与日程联动 | 计划可转为日程执行 |

---

## 二、时间四象限设计（参考指尖时光）

### 2.1 四象限定义

```
                    紧急
                       │
         ● 第二象限      │       ● 第一象限
         (重要不紧急)    │       (重要且紧急)
         ───────────────┼───────────────────
         (不重要紧急)    │       (不重要不紧急)
         ● 第三象限     │       ● 第四象限
                       │
    ─────────────────────────────
                     不紧急
```

### 2.2 象限详情

| 象限 | 名称 | 特征 | 行动策略 |
|------|------|------|----------|
| 第一象限 | 重要且紧急 | 危机、急迫问题 | 立即执行 |
| 第二象限 | 重要不紧急 | 规划、发展目标 | 制定计划 |
| 第三象限 | 不重要紧急 | 干扰电话、邮件 | 委托他人 |
| 第四象限 | 不重要不紧急 | 琐碎娱乐 | 尽量避免 |

### 2.3 四象限实体设计

```sql
-- 四象限分类表
CREATE TABLE `sys_quadrant` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(20) NOT NULL COMMENT '象限名称',
  `code` varchar(20) NOT NULL COMMENT '象限编码',
  `color` varchar(20) NOT NULL COMMENT '显示颜色',
  `description` varchar(200) DEFAULT NULL COMMENT '描述',
  `sort` int DEFAULT 0 COMMENT '排序',
  `status` tinyint DEFAULT 1 COMMENT '状态',
  `create_time` bigint,
  `update_time` bigint,
  `delete_time` bigint,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
);

-- 初始数据
INSERT INTO `sys_quadrant` VALUES
(1, '重要且紧急', 'Q1', '#FF6B6B', '需要立即处理', 1, 1, NULL, NULL),
(2, '重要不紧急', 'Q2', '#4ECDC4', '需要规划安排', 2, 1, NULL, NULL),
(3, '不重要紧急', 'Q3', '#FFE66D', '可委托他人', 3, 1, NULL, NULL),
(4, '不重要不紧急', 'Q4', '#95A5A6', '尽量避免', 4, 1, NULL, NULL);
```

---

## 三、计划管理设计

### 3.1 计划分类（参考Excel数据）

根据 Excel 分析，计划分为以下类别：

| 分类 | 说明 | 示例 |
|------|------|------|
| 分类1 | 生活习惯类 | 锻炼、戒烟、戒酒、喝茶 |
| 分类2 | 认知提升类 | 提升认知、认知实践、形象塑造 |
| 分类3 | 工作技能类 | 提升业务能力、提升管理能力 |
| 分类4 | 项目类 | 虚拟电商、小程序开发 |

### 3.2 计划表结构

```sql
-- 计划表
CREATE TABLE `sys_plan` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `plan_name` varchar(100) NOT NULL COMMENT '计划名称',
  `plan_type` varchar(50) NOT NULL COMMENT '计划分类',
  `category_id` bigint DEFAULT NULL COMMENT '分类ID',
  `target_effect` varchar(500) DEFAULT NULL COMMENT '目标效果',
  `quadrant_id` bigint DEFAULT 2 COMMENT '所属象限(默认重要不紧急)',
  `priority` int DEFAULT 0 COMMENT '优先级 0-10',
  `status` tinyint DEFAULT 0 COMMENT '状态: 0-待开始, 1-进行中, 2-已完成, 3-已取消',
  `progress` int DEFAULT 0 COMMENT '进度百分比',
  `plan_start_time` bigint DEFAULT NULL COMMENT '计划开始时间',
  `plan_end_time` bigint DEFAULT NULL COMMENT '计划结束时间',
  `actual_start_time` bigint DEFAULT NULL COMMENT '实际开始时间',
  `actual_end_time` bigint DEFAULT NULL COMMENT '实际实际结束时间',
  `leader_id` bigint DEFAULT NULL COMMENT '负责人ID',
  `participant_ids` varchar(500) DEFAULT NULL COMMENT '参与人ID列表',
  `parent_id` bigint DEFAULT NULL COMMENT '父计划ID',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `create_by` bigint,
  `create_time` bigint,
  `update_by` bigint,
  `update_time` bigint,
  `delete_time` bigint,
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_plan_type` (`plan_type`),
  KEY `idx_quadrant_id` (`quadrant_id`)
);
```

### 3.3 计划类型表

```sql
-- 计划类型表
CREATE TABLE `sys_plan_type` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL COMMENT '类型名称',
  `type_code` varchar(50) NOT NULL COMMENT '类型编码',
  `icon` varchar(100) DEFAULT NULL COMMENT '图标',
  `color` varchar(20) DEFAULT NULL COMMENT '颜色',
  `sort` int DEFAULT 0,
  `status` tinyint DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_type_code` (`type_code`)
);

-- 初始数据
INSERT INTO `sys_plan_type` VALUES
(1, '生活习惯', 'life', '🏃', '#67C23A', 1, 1),
(2, '认知提升', 'cognition', '📚', '#409EFF', 2, 1),
(3, '工作技能', 'skill', '💼', '#E6A23C', 3, 1),
(4, '项目', 'project', '📦', '#909399', 4, 1),
(5, '兴趣爱好', 'hobby', '🎨', '#F56C6C', 5, 1),
(6, '学习', 'study', '🎵', '#8E44AD', 6, 1);
```

---

## 四、日程管理设计

### 4.1 日程表结构

```sql
-- 日程表
CREATE TABLE `sys_schedule` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `title` varchar(100) NOT NULL COMMENT '日程标题',
  `content` varchar(500) DEFAULT NULL COMMENT '日程内容',
  `schedule_type` tinyint DEFAULT 1 COMMENT '日程类型: 1-日程, 2-提醒, 3-节日',
  `all_day` tinyint DEFAULT 0 COMMENT '是否全天: 0-否, 1-是',
  `start_time` bigint NOT NULL COMMENT '开始时间',
  `end_time` bigint NOT NULL COMMENT '结束时间',
  `location` varchar(200) DEFAULT NULL COMMENT '地点',
  `quadrant_id` bigint DEFAULT NULL COMMENT '所属象限',
  `plan_id` bigint DEFAULT NULL COMMENT '关联计划ID',
  `status` tinyint DEFAULT 0 COMMENT '状态: 0-待办, 1-进行中, 2-已完成, 3-已取消',
  `repeat_type` tinyint DEFAULT 0 COMMENT '重复类型: 0-不重复, 1-每日, 2-每周, 3-每月, 4-每年',
  `remind_minutes` int DEFAULT 15 COMMENT '提前提醒分钟数',
  `color` varchar(20) DEFAULT NULL COMMENT '自定义颜色',
  `create_by` bigint,
  `create_time` bigint,
  `update_by` bigint,
  `update_time` bigint,
  `delete_time` bigint,
  PRIMARY KEY (`id`),
  KEY `idx_plan_id` (`plan_id`),
  KEY `idx_start_time` (`start_time`)
);
```

### 4.2 日程视图

| 视图 | 说明 |
|------|------|
| 日视图 | 按小时展示当天日程 |
| 周视图 | 周一至周日展示 |
| 月视图 | 月历形式展示 |
| 象限视图 | 按四象限分类展示 |

---

## 五、计划与日程联动

### 5.1 联动逻辑

```
计划执行
    ↓
将计划添加到日程 → 设定具体执行时间
    ↓
完成日程 → 更新计划进度
    ↓
计划完成 → 自动结束相关日程
```

### 5.2 联动接口

```java
// 计划转日程
POST /api/plan/{planId}/to-schedule
Request: {
    "startTime": 1704067200000,
    "endTime": 1704070800000,
    "repeatType": 0
}

// 获取计划关联的日程
GET /api/plan/{planId}/schedules

// 批量将计划添加到日程（根据计划工期自动拆分）
POST /api/plan/{planId}/batch-to-schedule
Request: {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
}
```

### 5.3 自动联动规则

| 规则 | 说明 |
|------|------|
| 创建计划自动生成日程 | 可配置是否开启 |
| 计划延期自动推送提醒 | 计划结束前提醒 |
| 计划完成自动结束日程 | 状态同步 |

---

## 六、前端设计

### 6.1 页面结构

```
计划管理
├── 计划列表
│   ├── 分类筛选
│   ├── 象限筛选
│   └── 状态筛选
├── 计划详情
│   ├── 基本信息
│   ├── 进度跟踪
│   └── 关联日程
├── 计划新增/编辑
└── 时间四象限视图

日程管理
├── 日视图
├── 周视图
├── 月视图
└── 象限视图
```

### 6.2 四象限视图组件

```vue
<template>
  <div class="quadrant-view">
    <div class="quadrant q1">
      <div class="header">重要且紧急</div>
      <div class="schedule-list">
        <!-- 第一象限日程 -->
      </div>
    </div>
    <div class="quadrant q2">
      <div class="header">重要不紧急</div>
    </div>
    <div class="quadrant q3">
      <div class="header">不重要紧急</div>
    </div>
    <div class="quadrant q4">
      <div class="header">不重要不紧急</div>
    </div>
  </div>
</template>
```

---

## 七、API 接口设计

### 7.1 计划接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/plan/page | GET | 分页查询计划 |
| /api/plan | POST | 新增计划 |
| /api/plan/{id} | PUT | 修改计划 |
| /api/plan/{id} | DELETE | 删除计划 |
| /api/plan/{id}/to-schedule | POST | 计划转日程 |
| /api/plan/quadrant/{quadrantId} | GET | 按象限查询计划 |

### 7.2 日程接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/schedule/page | GET | 分页查询日程 |
| /api/schedule/day | GET | 日视图 |
| /api/schedule/week | GET | 周视图 |
| /api/schedule/month | GET | 月视图 |
| /api/schedule/quadrant | GET | 象限视图 |
| /api/schedule | POST | 新增日程 |
| /api/schedule/{id} | PUT | 修改日程 |
| /api/schedule/{id} | DELETE | 删除日程 |

---

## 八、版本历史

| 版本 | 更新内容 |
|------|----------|
| 1.0.0 | 初始版本，包含计划管理、日程管理、四象限管理、联动功能 |
