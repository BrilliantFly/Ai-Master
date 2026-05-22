package com.know.knowboot.service.plan.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.know.knowboot.entity.plan.PlanHomeConfig;
import com.know.knowboot.mapper.plan.PlanHomeConfigMapper;
import com.know.knowboot.service.plan.IPlanHomeConfigService;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 首页配置服务实现
 */
@Service
public class PlanHomeConfigServiceImpl extends ServiceImpl<PlanHomeConfigMapper, PlanHomeConfig> implements IPlanHomeConfigService {

    @Override
    public Map<String, PlanHomeConfig> getConfig(Long userId, String roleId) {
        LambdaQueryWrapper<PlanHomeConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PlanHomeConfig::getStatus, 1)
                .and(roleId != null && !roleId.isEmpty(), w -> w.isNull(PlanHomeConfig::getRoleId).or().eq(PlanHomeConfig::getRoleId, roleId))
                .orderByAsc(PlanHomeConfig::getSort)
                .orderByDesc(PlanHomeConfig::getUpdateTime);

        List<PlanHomeConfig> configs = list(wrapper);
        Map<String, PlanHomeConfig> result = new LinkedHashMap<>();
        for (PlanHomeConfig config : configs) {
            result.putIfAbsent(config.getConfigType(), config);
        }
        return result;
    }
}
