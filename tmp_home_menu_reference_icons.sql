-- 首页快捷功能：完全按参考界面图标与分区配置
-- 适用表：sys_menu_config
-- 菜单类型：menu_type = 2

-- 1. 已有菜单：统一图标、文案、分区与缩略图背景
UPDATE sys_menu_config
SET icon = 'static/images/home/customer.svg',
    render_config = JSON_OBJECT(
        'sections', JSON_ARRAY('quick', 'tool'),
        'title', '客户管理',
        'desc', '智能跟进提醒，高效维护客户关系',
        'tag', '客户',
        'thumbBg', 'linear-gradient(135deg,#ede9fe,#ddd6fe)',
        'thumbImage', '/static/images/home/customer.svg'
    )
WHERE menu_code = 'customer' AND menu_type = 2;

UPDATE sys_menu_config
SET icon = 'static/images/home/collection.svg',
    render_config = JSON_OBJECT(
        'sections', JSON_ARRAY('quick', 'tool'),
        'title', '我的收藏',
        'desc', '快速回到你保存过的内容与入口',
        'tag', '收藏',
        'thumbBg', 'linear-gradient(135deg,#fff7ed,#fde68a)',
        'thumbImage', '/static/images/home/collection.svg'
    )
WHERE menu_code = 'collection' AND menu_type = 2;

UPDATE sys_menu_config
SET icon = 'static/images/home/service.svg',
    render_config = JSON_OBJECT(
        'sections', JSON_ARRAY('quick', 'tool'),
        'title', '在线客服支持',
        'desc', '快速联系平台客服获取帮助',
        'tag', '服务',
        'thumbBg', 'linear-gradient(135deg,#d1fae5,#99f6e4)',
        'thumbImage', '/static/images/home/service.svg'
    )
WHERE menu_code IN ('service', 'support') AND menu_type = 2;

UPDATE sys_menu_config
SET icon = 'static/images/home/camera.svg',
    render_config = JSON_OBJECT(
        'sections', JSON_ARRAY('quick', 'recommend'),
        'title', '智能摄像头接入指引',
        'desc', '快速了解如何配置和接入你的设备',
        'tag', '设备',
        'thumbBg', 'linear-gradient(135deg,#e0e7ff,#c7d2fe)',
        'thumbImage', '/static/images/home/camera.svg'
    )
WHERE menu_code IN ('camera', 'device', 'monitor') AND menu_type = 2;

UPDATE sys_menu_config
SET icon = 'static/images/home/habit.svg',
    render_config = JSON_OBJECT(
        'sections', JSON_ARRAY('quick', 'recommend'),
        'title', '21 天习惯养成计划',
        'desc', '用科学方法培养持续力',
        'tag', '习惯',
        'thumbBg', 'linear-gradient(135deg,#fce7f3,#fbcfe8)',
        'thumbImage', '/static/images/home/habit.svg'
    )
WHERE menu_code IN ('habit', 'checkin') AND menu_type = 2;

UPDATE sys_menu_config
SET icon = 'static/images/home/schedule.svg',
    render_config = JSON_OBJECT(
        'sections', JSON_ARRAY('quick', 'recommend', 'tool'),
        'title', '四象限工作法',
        'desc', '高效管理你的每日任务',
        'tag', '效率',
        'thumbBg', 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
        'thumbImage', '/static/images/home/schedule.svg'
    )
WHERE menu_code IN ('schedule', 'plan', 'calendar') AND menu_type = 2;

UPDATE sys_menu_config
SET icon = 'static/images/home/data.svg',
    render_config = JSON_OBJECT(
        'sections', JSON_ARRAY('quick', 'tool'),
        'title', '数据分析',
        'desc', '设备与业务数据洞察',
        'tag', '数据',
        'thumbBg', 'linear-gradient(135deg,#e0f2fe,#bae6fd)',
        'thumbImage', '/static/images/home/data.svg'
    )
WHERE menu_code IN ('data', 'analysis') AND menu_type = 2;

UPDATE sys_menu_config
SET icon = 'static/images/home/alert.svg',
    render_config = JSON_OBJECT(
        'sections', JSON_ARRAY('quick', 'tool'),
        'title', '告警中心',
        'desc', '异常事件统一追踪与处理',
        'tag', '工具',
        'thumbBg', 'linear-gradient(135deg,#fee2e2,#fecaca)',
        'thumbImage', '/static/images/home/alert.svg'
    )
WHERE menu_code IN ('alert', 'warning', 'alarm') AND menu_type = 2;

UPDATE sys_menu_config
SET icon = 'static/images/home/export.svg',
    render_config = JSON_OBJECT(
        'sections', JSON_ARRAY('quick', 'tool'),
        'title', '财务管理',
        'desc', '查看财务信息与收支概况',
        'tag', '财务',
        'thumbBg', 'linear-gradient(135deg,#ede9fe,#ddd6fe)',
        'thumbImage', '/static/images/home/export.svg'
    )
WHERE menu_code IN ('finance', 'wallet') AND menu_type = 2;

UPDATE sys_menu_config
SET icon = 'static/images/home/gantt.svg',
    render_config = JSON_OBJECT(
        'sections', JSON_ARRAY('tool'),
        'title', '甘特图',
        'desc', '项目计划与进度追踪',
        'tag', '工具',
        'thumbBg', 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
        'thumbImage', '/static/images/home/gantt.svg'
    )
WHERE menu_code = 'gantt' AND menu_type = 2;

UPDATE sys_menu_config
SET icon = 'static/images/home/export.svg',
    render_config = JSON_OBJECT(
        'sections', JSON_ARRAY('tool'),
        'title', '报表导出',
        'desc', '一键生成运营报告',
        'tag', '工具',
        'thumbBg', 'linear-gradient(135deg,#ede9fe,#ddd6fe)',
        'thumbImage', '/static/images/home/export.svg'
    )
WHERE menu_code IN ('report', 'export') AND menu_type = 2;

UPDATE sys_menu_config
SET icon = 'static/images/home/data.svg',
    render_config = JSON_OBJECT(
        'sections', JSON_ARRAY('quick', 'recommend'),
        'title', '热门资讯',
        'desc', '及时了解平台资讯与行业动态',
        'tag', '资讯',
        'thumbBg', 'linear-gradient(135deg,#dbeafe,#bfdbfe)',
        'thumbImage', '/static/images/home/data.svg'
    )
WHERE menu_code IN ('news', 'article', 'content') AND menu_type = 2;

-- 2. 番茄专注：如果存在，则统一图标为参考资源风格
UPDATE sys_menu_config
SET icon = 'static/images/home/schedule.svg',
    render_config = JSON_OBJECT(
        'sections', JSON_ARRAY('quick'),
        'title', '番茄专注',
        'desc', '开启一轮 25 分钟专注与休息',
        'tag', '专注',
        'thumbBg', 'linear-gradient(135deg,#fca5a5,#f97316)',
        'thumbImage', '/static/images/home/schedule.svg'
    )
WHERE menu_code = 'focus' AND menu_type = 2;

-- 3. 如果某些菜单不存在，则补充创建（可按需执行）
INSERT IGNORE INTO sys_menu_config
    (menu_name, menu_code, menu_type, icon, path, is_show, sort, render_type, render_config, create_time)
VALUES
    (
        '智能监控',
        'camera',
        2,
        'static/images/home/camera.svg',
        '/pages/camera/index',
        1,
        4,
        1,
        JSON_OBJECT(
            'sections', JSON_ARRAY('quick', 'recommend'),
            'title', '智能摄像头接入指引',
            'desc', '快速了解如何配置和接入你的设备',
            'tag', '设备',
            'thumbBg', 'linear-gradient(135deg,#e0e7ff,#c7d2fe)',
            'thumbImage', '/static/images/home/camera.svg'
        ),
        NOW()
    ),
    (
        '数据分析',
        'data',
        2,
        'static/images/home/data.svg',
        '/pages/news/news',
        1,
        8,
        1,
        JSON_OBJECT(
            'sections', JSON_ARRAY('quick', 'tool'),
            'title', '数据分析',
            'desc', '设备与业务数据洞察',
            'tag', '数据',
            'thumbBg', 'linear-gradient(135deg,#e0f2fe,#bae6fd)',
            'thumbImage', '/static/images/home/data.svg'
        ),
        NOW()
    ),
    (
        '告警中心',
        'alert',
        2,
        'static/images/home/alert.svg',
        '/pages/camera/index',
        1,
        9,
        1,
        JSON_OBJECT(
            'sections', JSON_ARRAY('quick', 'tool'),
            'title', '告警中心',
            'desc', '异常事件统一追踪与处理',
            'tag', '工具',
            'thumbBg', 'linear-gradient(135deg,#fee2e2,#fecaca)',
            'thumbImage', '/static/images/home/alert.svg'
        ),
        NOW()
    );

-- 4. 核对首页菜单数据
SELECT id, menu_name, menu_code, icon, path, sort, render_config
FROM sys_menu_config
WHERE menu_type = 2
  AND (del_flag = 0 OR del_flag IS NULL)
ORDER BY sort ASC, id ASC;
