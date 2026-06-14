# 日历页面改版设计文档

## 概述

基于指尖时光设计风格，对日程日历页面进行视觉和交互升级。保持现有 API/后端不变，替换 `uni-calendar` 为自建日历组件，实现格子内事件展示、四象限颜色映射、农历/节假日显示、月完成率等功能。

## 设计目标

1. **视觉升级** — 暖橙色主色调，卡片化设计，马卡龙配色点缀
2. **信息密度** — 格子内展示四象限彩色圆点，一眼看清日程分布
3. **本土化** — 农历 + 法定节假日/调休日显示
4. **空间效率** — 日历可折叠（整月/当前周切换），释放更多事件列表空间
5. **零后端改** — 依赖现有 API，新增逻辑全在前端

## 架构

```
src/pages/plan/schedule/
├── index.vue                 ← 主页面（布局 + 数据协调）
├── components/
│   ├── CalendarGrid.vue      ← 新建：日历网格组件
│   ├── EventList.vue         ← 新建：事件列表组件
│   └── AddScheduleModal.vue  ← 新建：添加日程弹窗
├── composables/
│   └── useSchedule.js        ← 新建：日程业务逻辑组合函数
```

### 组件职责

**CalendarGrid.vue**
- 自建 6×7 日历网格，替换 `uni-calendar`
- 渲染四象限彩色圆点（从父组件传入 events 映射）
- 农历小字显示（复用 `calendar.js` 农历引擎）
- 法定节假日标注（对接 `timor.tech/api/holiday`）
- 折叠/展开切换（整月 ↔ 当前周）
- 月完成率进度条
- Props: `events`, `categories`, `year`, `month`, `selectedDate`, `completedMap`, `collapsed`
- Events: `@dateTap`, `@monthSwitch`, `@toggleCollapse`

**EventList.vue**
- 展示选定日期的事件列表
- 四象限筛选 pills（颜色与日历圆点一致）
- 单个事件卡片（从现有 index.vue 提取）
- 完成/取消完成操作
- Props: `events`, `categories`, `quadrant`
- Events: `@complete`, `@delete`, `@quadrantChange`

**AddScheduleModal.vue**
- 从现有 index.vue 提取添加日程 Modal
- Props/Events 保持与现有一致

**useSchedule.js**
- 获取月度日历数据（`getCalendarMonthly`）
- 获取选定日期事件（`getScheduleByDate`）
- 日历圆点数据构建
- 关闭/展开状态管理
- 节假日数据获取与缓存

## 数据流

### 月度数据加载
```
onMounted / monthSwitch
  → fetchCalendarMonthly(year, month)
  → API: GET /plan/calendar/monthly
  → { events } → 按日期分组 → CalendarGrid 渲染圆点
  → 并行: fetchHolidays(year) (仅首次/跨年)
```

### 日期选择
```
dateTap(dateStr)
  → fetchDayEvents(dateStr)
  → API: GET /plan/event/date?date={ts}
  → 映射 categoryName
  → EventList 渲染
  → 更新今日统计
```

### 圆点颜色映射
```js
event => {
  const colorMap = {
    1: '#FF6B6B',  // 重要紧急 - 红
    2: '#4ECDC4',  // 重要不紧急 - 青
    3: '#FFE66D',  // 紧急不重要 - 黄
    4: '#95A5A6',  // 不紧急不重要 - 灰
  }
  return {
    color: colorMap[event.quadrant],
    done: event.status === 1  // 已完成 → 半透明
  }
}
```

### 节假日数据
```js
// timor.tech API 响应格式
// GET https://timor.tech/api/holiday/year/{year}
{
  "code": 0,
  "holiday": {
    "2026-01-01": { "holiday": true, "name": "元旦", ... },
    "2026-01-04": { "holiday": false, "name": "元旦调休", ... },
    ...
  }
}
```

日历渲染逻辑：
- `holiday === true` → 日期数字标红 + 底部显示节日名称
- `holiday === false`（补班日） → 日期数字标特殊色提示上班
- 缓存到 `localStorage`，跨年自动更新

## 视觉规范

### 颜色系统

| 用途 | 色值 | 说明 |
|------|------|------|
| 主色调 | `#FF8700` | 今天指示器、选中态、按钮 |
| 背景 | `#f9f9f9` | 页面底色 |
| 卡片 | `#FFFFFF` | 日历卡片、事件卡片 |
| 重要紧急 q1 | `#FF6B6B` | 圆点/标签色 |
| 重要不紧急 q2 | `#4ECDC4` | 圆点/标签色 |
| 紧急不重要 q3 | `#FFE66D` | 圆点/标签色 |
| 不紧急不重要 q4 | `#95A5A6` | 圆点/标签色 |
| 农历文字 | `#C7C7CC` | 小字灰色 |
| 节假日红 | `#FF3B30` | 法定假日 |

### 日历布局

```
┌──────────────────────────────────┐
│  ←  2026 / 06  →     [今天] ▲/▼ │  ← 月份导航 + 折叠按钮
│  日  一  二  三  四  五  六      │  ← 星期标题
│        1   2   3   4   5   6     │
│  7   8   9  10  11  12  13      │  ← 日期格：数字 + 农历 + 彩色圆点
│ 14  15  16  17  18  19  20      │     今天 = 橙色圆形背景
│ 21  22  23  24  25  26  27      │     法定假 = 红色数字
│ 28  29  30                      │
│  ████████████████░░  68% 完成   │  ← 月完成率进度条
└──────────────────────────────────┘
```

### 折叠状态

```
┌──────────────────────────────────┐
│  ←  2026 / 06  →     [今天] ▼   │
│ 14(日) 15(一) 16(二) 17(三)...   │  ← 当前周紧凑行
│  今日 · 2项日程                  │  ← 摘要
└──────────────────────────────────┘
```

## 实施计划

### Phase 1：组件提取（Day 1）

1. **提取 EventList.vue** — 从 `index.vue:200-400` 抽出事件列表、筛选 pills、完成逻辑
2. **提取 AddScheduleModal.vue** — 从 `index.vue:400-700` 抽出表单、校验、提交逻辑
3. **创建 useSchedule.js** — 提取数据获取、状态管理逻辑

### Phase 2：日历组件（Day 2）

4. **创建 CalendarGrid.vue** — 6×7 网格布局
5. **日期格渲染** — 公历数字、农历小字、彩色圆点
6. **折叠/展开** — 整月 ↔ 当前周切换
7. **月完成率** — 进度条

### Phase 3：集成（Day 3）

8. **节假日接入** — `timor.tech` API 调用 + 本地缓存
9. **替换 index.vue** — 用新组件替换原有 uni-calendar + 内联列表
10. **联调测试** — 检查所有 API 调用、完成/删除操作、统计计算

### 不在此次实施范围

- 日视图/周视图
- 长按快速添加
- 拖拽调整日期
- 多主题切换

## 参考

- [timor.tech 节假日 API 文档](https://timor.tech/api/holiday)
- `uni_modules/uni-calendar/components/uni-calendar/calendar.js` — 农历引擎可复用
- `src/styles/variables.scss` — 现有设计变量
