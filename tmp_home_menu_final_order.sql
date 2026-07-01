-- 首页快捷功能最终菜单集合与排序（参考界面）
-- 目标顺序：
-- 1 客户管理
-- 2 我的收藏
-- 3 联系客服
-- 4 智能监控
-- 5 日程计划
-- 6 习惯打卡
-- 7 数据分析
-- 8 番茄专注
-- 9 告警中心

-- 1. 确保已有菜单顺序正确
UPDATE sys_menu_config SET sort = 1 WHERE menu_code = 'customer' AND menu_type = 2;
UPDATE sys_menu_config SET sort = 2 WHERE menu_code = 'collection' AND menu_type = 2;
UPDATE sys_menu_config SET sort = 3 WHERE menu_code IN ('service', 'support') AND menu_type = 2;
UPDATE sys_menu_config SET sort = 4 WHERE menu_code IN ('camera', 'device', 'monitor') AND menu_type = 2;
UPDATE sys_menu_config SET sort = 5 WHERE menu_code IN ('schedule', 'plan', 'calendar') AND menu_type = 2;
UPDATE sys_menu_config SET sort = 6 WHERE menu_code IN ('habit', 'checkin') AND menu_type = 2;
UPDATE sys_menu_config SET sort = 7 WHERE menu_code IN ('data', 'analysis') AND menu_type = 2;
UPDATE sys_menu_config SET sort = 8 WHERE menu_code = 'focus' AND menu_type = 2;
UPDATE sys_menu_config SET sort = 9 WHERE menu_code IN ('alert', 'warning', 'alarm') AND menu_type = 2;

-- 2. 如果缺失则补齐菜单项（接口动态菜单会直接读取这些）
INSERT IGNORE INTO sys_menu_config
    (menu_name, menu_code, menu_type, icon, path, is_show, sort, render_type, render_config, create_time)
VALUES
    (
        '数据分析',
        'data',
        2,
        'static/images/home/data.svg',
        '/pages/news/news',
        1,
        7,
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
        '番茄专注',
        'focus',
        2,
        'static/images/home/schedule.svg',
        '/pages/plan/focus/index',
        1,
        8,
        1,
        JSON_OBJECT(
            'sections', JSON_ARRAY('quick'),
            'title', '番茄专注',
            'desc', '开启一轮 25 分钟专注与休息',
            'tag', '专注',
            'thumbBg', 'linear-gradient(135deg,#fca5a5,#f97316)',
            'thumbImage', '/static/images/home/schedule.svg'
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

-- 3. 查询最终首页菜单，核对接口返回是否完整
SELECT id, menu_name, menu_code, icon, path, is_show, sort, render_config
FROM sys_menu_config
WHERE menu_type = 2
  AND is_show = 1
  AND (del_flag = 0 OR del_flag IS NULL)
ORDER BY sort ASC, id ASC;
