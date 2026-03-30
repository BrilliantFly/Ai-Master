<template>
  <view class="bottom-comment">
    <!-- 左边静态输入框 -->
    <view class="disableinput" @click.stop="emit('articleCommentInputFocus', 1)">
      良言一句三冬暖，恶语伤人六月寒。
    </view>
    <!-- 文章总评论 -->
    <view class="bottom-item">
      <text class="item-icon">
		  <u-icon name="chat"></u-icon>
	  </text>
      <text class="item-text">{{ 20 }}</text>
    </view>
    <!-- 文章总点赞 -->
   <view class="bottom-item">
      <text class="item-icon">
		  <u-icon name="thumb-up"></u-icon>
	  </text>
      <text class="item-text">{{ 30 }}</text>
    </view>
    <!-- 文章总收藏 -->
    <view class="bottom-item">
      <text class="item-icon">
		  <u-icon name="star-fill"></u-icon>
	  </text>
      <text class="item-text">{{ 10 }}</text>
    </view>
  </view>
</template>
 
<script setup lang="ts">
 
const emit = defineEmits([
  'articleCommentInputFocus'
])
</script>
 
<style lang="scss">
.bottom-comment {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 80;
  width: 100vw;
  min-height: 8vh;
  background-color: #fff;
  box-shadow: 0 0 8rpx 4rpx #f7f7f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28rpx;
 
  .disableinput {
    width: 54%;
    height: 70rpx;
    background-color: #f6f6f6;
    border-radius: 35rpx;
    margin-right: 30rpx;
    font-size: 20rpx;
    color: #767676;
    padding-left: 16rpx;
    display: flex;
    align-items: center;
  }
 
  .bottom-item {
    flex: 1;
    display: flex;
    margin-right: 10rpx;
    align-items: center;
 
    .item-icon {
      font-size: 38rpx;
      padding-right: 10rpx;
    }
 
    .isUp {
      // color: $uni-color-primary;
	  color: #767676;
    }
 
    .item-text {
      font-size: 30rpx;
    }
  }
}
</style>