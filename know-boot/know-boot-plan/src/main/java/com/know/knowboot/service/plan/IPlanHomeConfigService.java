package com.know.knowboot.service.plan;

import com.know.knowboot.entity.plan.PlanHomeConfig;

import java.util.Map;

/**
 * 首页配置服务接口
 */
public interface IPlanHomeConfigService {

    /**
     * 获取首页配置
     */
    Map<String, PlanHomeConfig> getConfig(Long userId, String roleId);
}
