package com.know.knowboot.mapper;

import com.know.knowboot.core.basics.IBaseMapper;
import com.know.knowboot.entity.CameraFavorite;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 设备收藏Mapper
 */
@Mapper
public interface CameraFavoriteMapper extends IBaseMapper<CameraFavorite> {

    /**
     * 检查是否已收藏
     */
    CameraFavorite selectByDeviceAndUser(@Param("deviceId") Long deviceId, @Param("userId") Long userId);

    /**
     * 删除收藏
     */
    int deleteByDeviceAndUser(@Param("deviceId") Long deviceId, @Param("userId") Long userId);
}