-- ----------------------------
-- 菜单配置初始化数据
-- ----------------------------

-- TabBar 菜单（菜单类型 1=tabBar）
INSERT IGNORE INTO `sys_menu_config` (`menu_name`, `menu_code`, `menu_type`, `icon`, `selected_icon`, `path`, `is_show`, `is_big`, `sort`, `render_type`, `create_time`)
VALUES
('首页',   'home',    1, 'static/images/tabbar/home.png', 'static/images/tabbar/home_s.png', '/pages/index/index', 1, 0, 1, 1, NOW()),
('文章',   'article', 1, 'static/images/tabbar/news.png', 'static/images/tabbar/news_s.png', '/pages/news/news',   1, 0, 2, 1, NOW()),
('我的',   'profile', 1, 'static/images/tabbar/user.png', 'static/images/tabbar/user_s.png', '/pages/user/user',   1, 0, 3, 1, NOW());

-- 首页菜单（菜单类型 2=首页/功能菜单）
INSERT IGNORE INTO `sys_menu_config` (`menu_name`, `menu_code`, `menu_type`, `path`, `is_show`, `sort`, `render_type`, `create_time`)
VALUES
('客户管理', 'customer',   2, '/pages/customer/info',               1, 1, 1, NOW()),
('我的收藏', 'collection', 2, '/pages/collection/collection',      1, 2, 1, NOW()),
('联系客服', 'service',    2, '/pages/customer_service/customer_service', 1, 3, 1, NOW());
