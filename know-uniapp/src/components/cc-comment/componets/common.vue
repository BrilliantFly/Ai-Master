<template>
  <view class="comment_item">
    <view class="top">
      <view class="top_left">
        <img class="user_avatar" :src="props.data.userAvatar" />
        <uni-tag v-if="props.data.author" class="tag" type="primary" :inverted="false" text="作者" size="mini" circle />
        <span class="user_name">{{ props.data.userName }}</span>
        <span class="user_name">{{ cReplyName }}</span>
      </view>
      <!-- <view class="top_right" @tap="likeClick(props.data)">
        <span :class="[props.data.is_like ? 'active' : '', 'like_count']">{{ cLikeCount }}</span>
        <uni-icons v-show="props.data.is_like" type="hand-up-filled" size="24" color="#007aff"></uni-icons>
        <uni-icons v-show="!props.data.is_like" type="hand-up" size="24" color="#999"></uni-icons>
      </view> -->
    </view>
    <view class="content" @tap="replyClick(props.data)">
      {{ c_content }}
      <span class="shrink" v-if="isShrink" @tap.stop="expandContentFun(props.data.userContent)">...展开</span>
      <span
        class="shrink"
        v-if="!isShrink && userContent.length > contentShowLength"
        @tap.stop="shrinkContentFun(props.data.userContent)"
      >
        收起</span
      >
    </view>
    <view class="bottom">
      <span class="create_time">{{ props.data.createTime }}</span>
      <span v-if="props.data.owner" class="delete" @tap="deleteClick(props.data)">删除</span>
      <!-- <span v-else class="reply" @tap="replyClick(props.data)"
        >回复</span
      > -->
    </view>
  </view>
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch, watchEffect } from "vue";

const props = defineProps({
  // 评论数据
  data: {
    type: Object,
    default: () => {},
  },
  // 父级评论数据
  pData: {
    type: Object,
    default: () => {},
  },
});

// 被回复人名称
const cReplyName = computed(() => {
  return props.data?.replyName ? ` ▸ ` + props.data?.replyName : "";
});

// 点赞数显示
const cLikeCount = computed(() => {
  return props.data.likeCount === 0 ? "" : props.data.likeCount > 99 ? `99+` : props.data.likeCount;
});

// 评论过长处理
let contentShowLength = 70; // 默认显示评论字符

let userContent = props.data.userContent;
let isShrink = ref(userContent.length > contentShowLength); // 是否收缩评论
let c_content = ref("");
watch(
  () => isShrink.value,
  (newVal) => {
    c_content.value = newVal ? userContent.slice(0, contentShowLength + 1) : userContent;
  },
  {
    immediate: true,
  }
);
// 删除变更显示定制
watch(
  () => props.data.userContent,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      c_content.value = newVal;
    }
  }
);

// 展开文字
function expandContentFun() {
  isShrink.value = false;
}

// 收起文字
function shrinkContentFun() {
  isShrink.value = true;
}

const emit = defineEmits(["likeClick", "replyClick", "deleteClick"]);

// 点赞
function likeClick(item) {
  emit("likeClick", item);
}

// 回复
function replyClick(item) {
  // 自己不能回复自己
  if (item.owner) return;
  emit("replyClick", item);
}

// 删除
function deleteClick(item) {
  emit("deleteClick", item);
}
</script>

<style lang="scss" scoped>
@import "@/styles/base-style.scss";
////////////////////////
.center {
  display: flex;
  align-items: center;
}
.ellipsis {
  overflow: hidden; //超出文本隐藏
  white-space: nowrap; //溢出不换行
  text-overflow: ellipsis; //溢出省略号显示
}
////////////////////////
.comment_item {
  font-size: 28rpx;
  .top {
    @extend .center;
    justify-content: space-between;
    .top_left {
      display: flex;
      align-items: center;
      overflow: hidden;
      .user_avatar {
        width: 68rpx;
        height: 68rpx;
        border-radius: 50%;
        margin-right: 12rpx;
      }
      .tag {
        margin-right: 6rpx;
      }
      .user_name {
        @extend .ellipsis;
        max-width: 180rpx;
        color: $uni-text-color-grey;
      }
    }
    .top_right {
      @extend .center;
      .like_count {
        color: $uni-text-color-grey;
        &.active {
          color: $uni-color-primary;
        }
      }
    }
  }
  .content {
    padding: 10rpx;
    margin-left: 70rpx;
    color: $uni-text-color;
    &:active {
      background-color: $uni-bg-color-hover;
    }
    .shrink {
      padding: 20rpx 20rpx 20rpx 0rpx;
      color: $uni-color-primary;
    }
  }
  .bottom {
    padding-left: 80rpx;
    font-size: 24rpx;
    .create_time {
      color: $uni-text-color-grey;
    }
    .delete {
      padding: 20rpx 20rpx 0 20rpx;
      color: $uni-border-color;
    }
    .reply {
      color: $uni-color-primary;
    }
  }
}
</style>
