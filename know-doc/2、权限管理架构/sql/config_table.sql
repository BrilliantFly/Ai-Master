-- 系统配置表
CREATE TABLE IF NOT EXISTS `config` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `type` varchar(50) DEFAULT NULL COMMENT '类型',
  `name` varchar(100) DEFAULT NULL COMMENT '键名',
  `value` text COMMENT '值',
  `create_time` bigint(20) DEFAULT NULL COMMENT '创建时间',
  `update_time` bigint(20) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 初始化默认配置数据
INSERT INTO `config` (`type`, `name`, `value`, `create_time`, `update_time`) VALUES
('wechat', 'wechat_mp_app_id', '', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('wechat', 'wechat_mp_app_secret', '', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('wechat', 'wechat_mp_token', '', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('wechat', 'wechat_mp_aes_key', '', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('wechat', 'wechat_official_account_app_id', '', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('wechat', 'wechat_official_account_app_secret', '', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('pay', 'pay_wechat_mch_id', '', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('pay', 'pay_wechat_mch_key', '', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('pay', 'pay_wechat_app_id', '', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('sms', 'sms_aliyun_access_key_id', '', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('sms', 'sms_aliyun_access_key_secret', '', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('sms', 'sms_aliyun_sign_name', '', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('sms', 'sms_aliyun_template_code', '', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('other', 'site_logo', '', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('other', 'site_name', 'KnowBoot系统', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('other', 'site_description', 'KnowBoot管理系统', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000);
