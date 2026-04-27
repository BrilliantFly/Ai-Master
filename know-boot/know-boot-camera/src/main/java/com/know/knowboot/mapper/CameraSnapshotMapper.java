package com.know.knowboot.mapper;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.know.knowboot.core.basics.IBaseMapper;
import com.know.knowboot.entity.CameraSnapshot;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 截图记录Mapper
 */
@Mapper
public interface CameraSnapshotMapper extends IBaseMapper<CameraSnapshot> {

    /**
     * 分页查询设备截图
     */
    IPage<CameraSnapshot> selectPageByDeviceId(Page<CameraSnapshot> page, @Param("deviceId") Long deviceId);

    /**
     * 查询最新截图
     */
    CameraSnapshot selectLatestByDeviceId(@Param("deviceId") Long deviceId);
}