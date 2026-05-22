package com.know.knowboot.entity.plan;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

/**
 * 习惯实体
 */
@Data
@TableName("plan_habit")
@ApiModel("习惯实体")
public class PlanHabit implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.ASSIGN_ID)
    @ApiModelProperty("主键")
    private Long id;

    @ApiModelProperty("习惯名称")
    private String name;

    @ApiModelProperty("描述")
    private String description;

    @ApiModelProperty("图标")
    private String icon;

    @ApiModelProperty("颜色")
    private String color;

    @ApiModelProperty("目标天数")
    private Integer targetDays;

    @ApiModelProperty("频率类型(1:每天 2:每周 3:自定义)")
    private Integer frequencyType;

    @ApiModelProperty("频率规则")
    private String frequencyRule;

    @ApiModelProperty("开始日期(时间戳)")
    private Long startDate;

    @ApiModelProperty("提醒时间(HH:mm)")
    private String reminderTime;

    @ApiModelProperty("状态(0:进行中 1:已完成 2:已放弃)")
    private Integer status;

    @ApiModelProperty("当前连续天数")
    private Integer currentDays;

    @ApiModelProperty("累计打卡天数")
    private Integer totalDays;

    @ApiModelProperty("关联计划ID")
    private Long planId;

    @ApiModelProperty("用户ID")
    private Long userId;

    @ApiModelProperty("创建人")
    private Long createBy;

    @ApiModelProperty("创建时间")
    private Long createTime;

    @ApiModelProperty("更新人")
    private Long updateBy;

    @ApiModelProperty("更新时间")
    private Long updateTime;

    @TableLogic(value = "0", delval = "1")
    @ApiModelProperty("删除标记")
    private Integer delFlag;

    @ApiModelProperty("删除时间")
    private Long deleteTime;
}
