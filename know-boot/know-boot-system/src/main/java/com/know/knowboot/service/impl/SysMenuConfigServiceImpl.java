package com.know.knowboot.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.know.knowboot.entity.tenant.SysMenuConfig;
import com.know.knowboot.entity.tenant.SysUser;
import com.know.knowboot.mapper.tenant.SysMenuConfigMapper;
import com.know.knowboot.service.ISysMenuConfigService;
import com.know.knowboot.service.ISysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 菜单配置服务实现
 */
@Service
public class SysMenuConfigServiceImpl extends ServiceImpl<SysMenuConfigMapper, SysMenuConfig> implements ISysMenuConfigService {

    @Autowired
    private SysMenuConfigMapper sysMenuConfigMapper;

    @Autowired
    private ISysUserService sysUserService;

    /**
     * 菜单类型常量
     */
    public static final Integer MENU_TYPE_TABBAR = 1;
    public static final Integer MENU_TYPE_HOME = 2;
    public static final Integer MENU_TYPE_SIDEBAR = 3;

    @Override
    public List<SysMenuConfig> listConfig(SysMenuConfig query, Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<SysMenuConfig> wrapper = buildQueryWrapper(query);
        return page(new Page<>(pageNum, pageSize), wrapper).getRecords();
    }

    @Override
    public List<SysMenuConfig> listConfig(SysMenuConfig query) {
        return list(buildQueryWrapper(query));
    }

    @Override
    public List<SysMenuConfig> listByMenuType(Integer menuType) {
        return sysMenuConfigMapper.selectByMenuType(menuType);
    }

    @Override
    public List<SysMenuConfig> listByUserIdAndMenuType(Long userId, Integer menuType) {
        // 获取用户信息判断是否是超级管理员
        SysUser user = sysUserService.getById(userId);
        if (user != null && user.getId() == 1L) {
            // 超级管理员，返回所有可见菜单
            return sysMenuConfigMapper.selectVisibleByMenuType(menuType);
        }
        // 普通用户，返回所有可见菜单（权限过滤在后续实现）
        return sysMenuConfigMapper.selectVisibleByMenuType(menuType);
    }

    @Override
    public List<SysMenuConfig> listTabBar() {
        return listByMenuType(MENU_TYPE_TABBAR);
    }

    @Override
    public List<SysMenuConfig> listTabBarByUserId(Long userId) {
        return listByUserIdAndMenuType(userId, MENU_TYPE_TABBAR);
    }

    @Override
    public List<SysMenuConfig> listHomeMenu() {
        return listByMenuType(MENU_TYPE_HOME);
    }

    @Override
    public List<SysMenuConfig> listHomeMenuByUserId(Long userId) {
        return listByUserIdAndMenuType(userId, MENU_TYPE_HOME);
    }

    @Override
    public List<SysMenuConfig> listByUserId(Long userId) {
        // 返回用户所有可见菜单（tabBar + 首页）
        List<SysMenuConfig> tabBarList = listTabBarByUserId(userId);
        List<SysMenuConfig> homeList = listHomeMenuByUserId(userId);
        tabBarList.addAll(homeList);
        return tabBarList;
    }

    @Override
    public SysMenuConfig getConfigById(Long id) {
        return getById(id);
    }

    @Override
    public boolean addConfig(SysMenuConfig config) {
        config.setCreateBy(getCurrentUsername());
        config.setCreateTime(new Date());
        return save(config);
    }

    @Override
    public boolean updateConfig(SysMenuConfig config) {
        config.setUpdateBy(getCurrentUsername());
        config.setUpdateTime(new Date());
        return updateById(config);
    }

    @Override
    public boolean deleteConfig(Long id) {
        // 逻辑删除
        SysMenuConfig config = new SysMenuConfig();
        config.setId(id);
        config.setDelFlag(1);
        return updateById(config);
    }

    /**
     * 构建查询条件
     */
    private LambdaQueryWrapper<SysMenuConfig> buildQueryWrapper(SysMenuConfig query) {
        LambdaQueryWrapper<SysMenuConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(query.getMenuName() != null, SysMenuConfig::getMenuName, query.getMenuName())
                .like(query.getMenuCode() != null, SysMenuConfig::getMenuCode, query.getMenuCode())
                .eq(query.getMenuType() != null, SysMenuConfig::getMenuType, query.getMenuType())
                .eq(query.getIsShow() != null, SysMenuConfig::getIsShow, query.getIsShow())
                .orderByAsc(SysMenuConfig::getSort);
        return wrapper;
    }

    /**
     * 获取当前用户名
     */
    private String getCurrentUsername() {
        try {
            Object loginId = StpUtil.getLoginId();
            return loginId != null ? loginId.toString() : "system";
        } catch (Exception e) {
            return "system";
        }
    }
}