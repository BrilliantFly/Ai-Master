# know-uniapp 动态菜单与导航规划

当前版本: 1.0.0

---

## 一、目标

实现动态可配置的底部导航栏和首页菜单，支持：
- 基于权限的动态控制
- 动态菜单配置
- 固定界面+动态渲染
- 指定固定形式界面渲染

---

## 二、当前状态

### 2.1 已有组件

| 组件 | 位置 | 功能 |
|------|------|------|
| tabbar.vue | src/components/tabbar/ | 包装组件 |
| custom-tab-bar/index.vue | src/components/custom-tab-bar/ | 实际tabbar |
| index.vue | src/pages/index/ | 首页菜单 |

### 2.2 数据来源

| 数据 | 来源 | 状态 |
|------|------|------|
| tabBar配置 | /api/app → config.tabbar | ✅ 已实现动态 |
| 首页菜单 | /plan/home/config | ✅ 已实现动态 |

### 2.3 问题

1. tabBar 配置无权限过滤
2. 首页菜单与 tabBar 无关联
3. 无法指定固定界面渲染

---

## 三、规划方案

### 3.1 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                    用户权限                                   │
│              (sys_permission)                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    菜单配置模块                                │
│  ┌─────────────┬─────────────┬─────────────┬───────────────┐  │
│  │  tabBar配置 │ 首页菜单    │ 权限关联    │ 界面类型配置  │  │
│  └─────────────┴─────────────┴─────────────┴───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    渲染层                                     │
│  ┌─────────────────────┬───────────────────────────────┐       │
│  │ 动态渲染 (Dynamic)   │        固定渲染 (Fixed)     │       │
│  │  - 动态菜单列表      │  - 指定界面模板              │       │
│  │  - 动态图标        │  - 指定布局方式              │       │
│  └─────────────────────┴───────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 菜单配置表设计

```sql
-- 菜单配置表 (sys_menu_config)
CREATE TABLE sys_menu_config (
  id BIGINT PRIMARY KEY COMMENT '主键',
  menu_name VARCHAR(100) NOT NULL COMMENT '菜单名称',
  menu_code VARCHAR(50) NOT NULL COMMENT '菜单编码',
  menu_type TINYINT DEFAULT 1 COMMENT '菜单类型 [1:tabBar, 2:首页, 3:侧边栏]',
  parent_id BIGINT DEFAULT 0 COMMENT '父级ID',
  icon VARCHAR(255) COMMENT '图标',
  selected_icon VARCHAR(255) COMMENT '选中图标',
  path VARCHAR(255) COMMENT '页面路径',
  url VARCHAR(255) COMMENT '外部URL',
  sort INT DEFAULT 0 COMMENT '排序',
  is_show TINYINT DEFAULT 1 COMMENT '是否显示',
  is_big TINYINT DEFAULT 0 COMMENT '是否凸起',
  big_icon VARCHAR(255) COMMENT '凸起图标',
  big_type VARCHAR(50) COMMENT '凸起类型',
  big_list VARCHAR(500) COMMENT '凸起菜单列表',
  render_type TINYINT DEFAULT 1 COMMENT '渲染类型 [1:动态列表, 2:固定表单, 3:指定界面]',
  render_config VARCHAR(500) COMMENT '渲染配置',
  permission_id BIGINT COMMENT '权限ID',
  permission_code VARCHAR(100) COMMENT '权限编码',
  create_by VARCHAR(32) COMMENT '创建人',
  create_time DATETIME COMMENT '创建时间',
  update_by VARCHAR(32) COMMENT '更新人',
  update_time DATETIME COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单配置表';
```

### 3.3 渲染类型

| render_type | 说明 | 渲染方式 |
|-------------|------|----------|
| 1 | 动态列表 | 从 big_list 或 children 渲染菜单列表 |
| 2 | 固定表单 | 使用内置表单模板渲染 |
| 3 | 指定界面 | 使用 render_config 指定的界面渲染 |

### 3.4 固定界面模板

| 模板名称 | 说明 |
|---------|------|
| grid | 九宫格布局 |
| list | 列表布局 |
| tabs | Tab切换布局 |
| swiper | 轮播布局 |

---

## 四、接口设计

### 4.1 后端API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /system/menu/config/list | 获取菜单配置列表 |
| GET | /system/menu/config/tabbar | 获取tabBar菜单 |
| GET | /system/menu/config/home | 获取首页菜单 |
| GET | /system/menu/config/user | 获取用户可用菜单（带权限过滤） |

### 4.2 前端API

```typescript
// src/api/system/menu.ts
import request from '@/utils/request'

// 获取菜单配置列表
export function getMenuConfigList(params) {
  return request.get({ url: '/system/menu/config/list', params })
}

// 获取tabBar菜单（带权限）
export function getTabbarMenu() {
  return request.get({ url: '/system/menu/config/tabbar' }, { isAuth: true })
}

// 获取首页菜单（带权限）
export function getHomeMenu() {
  return request.get({ url: '/system/menu/config/home' }, { isAuth: true })
}

// 获取用户可用菜单
export function getUserMenu() {
  return request.get({ url: '/system/menu/config/user' }, { isAuth: true })
}
```

---

## 五、实施步骤

### 5.1 后端实现

- [ ] 创建 SysMenuConfig 实体
- [ ] 创建 SysMenuConfigMapper
- [ ] 创建 ISysMenuConfigService
- [ ] 实现 SysMenuConfigServiceImpl
- [ ] 实现菜单权限过滤逻辑
- [ ] 创建 SysMenuConfigController

### 5.2 前端实现

- [ ] 新增菜单API (src/api/system/menu.ts)
- [ ] 修改 appStore 添加菜单管理
- [ ] 重构 custom-tab-bar 支持权限过滤
- [ ] 重构 index.vue 支持动态渲染类型
- [ ] 支持固定界面模板渲染

### 5.3 SQL脚本

```sql
-- 创建菜单配置表
source db/xxxx/sys_menu_config.sql

-- 初始化默认tabBar菜单
INSERT INTO sys_menu_config (menu_name, menu_code, menu_type, path, is_show, render_type) VALUES
('首页', 'home', 1, '/pages/index/index', 1, 1),
('文章', 'article', 1, '/pages/news/news', 1, 1),
('我的', 'profile', 1, '/pages/user/user', 1, 1);
```

---

## 六、文件清单

### 6.1 后端新增

| 文件 | 路径 |
|------|------|
| SysMenuConfig.java | know-boot-common/.../entity/tenant/ |
| SysMenuConfigMapper.java | know-boot-common/.../mapper/tenant/ |
| ISysMenuConfigService.java | know-boot-system/.../service/ |
| SysMenuConfigServiceImpl.java | know-boot-system/.../service/impl/ |
| SysMenuConfigController.java | know-boot-system/.../controller/ |

### 6.2 前端修改

| 文件 | 说明 |
|------|------|
| src/api/system/menu.ts | 新增 |
| src/stores/app.ts | 修改 |
| src/components/custom-tab-bar/index.vue | 修改 |
| src/pages/index/index.vue | 修改 |

---

版本: 1.0.0
更新日期: 2026-04-25