-- ----------------------------
-- 摄像头模块菜单配置
-- ----------------------------

-- 首页菜单：摄像头管理（菜单类型 2=首页/功能菜单）
INSERT IGNORE INTO `sys_menu_config` (`menu_name`, `menu_code`, `menu_type`, `path`, `is_show`, `sort`, `render_type`, `create_time`)
VALUES
('摄像头', 'camera', 2, '/pages/camera/index', 1, 4, 1, NOW());

-- TabBar 菜单：摄像头（需要 static/images/tabbar/camera*.png 图标文件）
-- 如需要取消注释，需先准备好图标文件
-- INSERT IGNORE INTO `sys_menu_config` (`menu_name`, `menu_code`, `menu_type`, `icon`, `selected_icon`, `path`, `is_show`, `is_big`, `sort`, `render_type`, `create_time`)
-- VALUES
-- ('摄像头', 'camera', 1, 'static/images/tabbar/camera.png', 'static/images/tabbar/camera_s.png', '/pages/camera/index', 1, 0, 4, 1, NOW());
