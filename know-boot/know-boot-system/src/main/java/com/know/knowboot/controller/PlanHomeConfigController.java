package com.know.knowboot.controller;

import com.alibaba.fastjson.JSON;
import com.know.knowboot.core.AjaxResult;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 首页配置控制器
 */
@Api(tags = "首页配置")
@RestController
@RequestMapping("/api/plan/home")
public class PlanHomeConfigController {

    @ApiOperation("获取首页配置")
    @GetMapping("/config")
    public AjaxResult getHomeConfig(@RequestParam(required = false) String userId,
                                    @RequestParam(required = false) String roleId) {
        Map<String, Object> config = new HashMap<>();

        // 轮播图配置
        Map<String, Object> banner = new HashMap<>();
        // 尝试从数据库取，暂无则返回默认轮播图
        String bannerContent = "{\"banners\":[" +
            "{\"image\":\"https://picsum.photos/seed/camera1/750/300\",\"title\":\"智能摄像头管理系统\",\"link\":\"\"}," +
            "{\"image\":\"https://picsum.photos/seed/camera2/750/300\",\"title\":\"实时监控 · 安全无忧\",\"link\":\"\"}," +
            "{\"image\":\"https://picsum.photos/seed/camera3/750/300\",\"title\":\"远程查看 · 云端存储\",\"link\":\"\"}" +
        "]}";
        banner.put("content", bannerContent);
        config.put("banner", banner);

        // 通知配置
        Map<String, Object> notice = new HashMap<>();
        String noticeContent = "{\"notices\":[" +
            "{\"title\":\"欢迎使用智能摄像头管理系统\",\"createTime\":\"2026-05-15\"}," +
            "{\"title\":\"系统支持远程实时监控与云端存储\",\"createTime\":\"2026-05-15\"}," +
            "{\"title\":\"请确保设备已连接网络以正常使用\",\"createTime\":\"2026-05-15\"}" +
        "]}";
        notice.put("content", noticeContent);
        config.put("notice", notice);

        // 其他配置
        config.put("menus", "[]");
        config.put("articles", "[]");

        return AjaxResult.success(config);
    }
}
