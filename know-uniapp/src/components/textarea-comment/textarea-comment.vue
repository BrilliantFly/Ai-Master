<template>
<!-- 蒙层 -->
 <view clas="c-mask" v-if="showInputPop" class="c-mask" @click.stop="emit('closeInputPop')"
    @touchmove.stop.prevent="emit('disableScroll')">
 </view>
   <view class="popup-comment" v-if="showInputPop">
    <view class="comment-input-wrap">
      <view class="comment-textarea-box" @touchmove.stop.prevent="emit('disableScroll')">
        <textarea v-model="commentParams.content" class="comment-textarea" :maxlength="600" :focus="replyFocus"
          :placeholder="customPlaceholder" :show-confirm-bar="false" @focus="commentInputFocus" @blur="commentInputBlur"
          :adjust-position="true" :cursor-spacing="400" :cursor="cursorIndex" @input="inputFocusChange" :fixed="true" />
        <view class="limit">{{ commentParams.content?.length || 0 }} / 600</view>
      </view>
      <view class="image-list">
        <view class="image-item" v-for="(item, index) in commentImages" :key="index">
          <image class="image" :src="item" mode="aspectFill" @click.stop="previewCommentImage(item)"></image>
          <uni-icons class="icon-close" @click.stop="deleteOneCommentImage(index)" type="clear" size="20"
            color="#red"></uni-icons>
        </view>
      </view>
      <view class="relase-btn">
        <!-- 表情 和 图片 -->
        <view class="emoji-image">
          <!-- 选择上传图片 -->
         <!-- <view class="as-image icon-a-44tubiao-81" hover-class="checkActive" :hover-stay-time="100"
            @click="selectMediaImage"></view> -->
          <!-- 表情 -->
          <view class="emoji icon-biaoqing-xue" hover-class="checkActive" :hover-stay-time="100" @click="openEmoji"
            v-if="!showEmoji">
			😄
		  </view>
          <!-- 键盘 -->
          <view v-else class="keyboard icon-a-44tubiao-155" hover-class="checkActive" :hover-stay-time="100"
            @click="openKeyboard">
          </view>
        </view>
        <!-- 发布 -->
        <view class="relase" @click.stop="commentCommit" hover-class="button-hover" :hover-stay-time="100">发布</view>
      </view>
      <list class="emoji-data" :show-scrollbar="false" v-if="showEmoji">
        <view v-for="(item, index) in emojiDataList" :key="index" class="emoji-item" hover-class="checkActive"
          :hover-stay-time="100" @click.stop="tuchCurrentEmoji(item)">
          <text class="emoj_conn">{{ item }}</text>
        </view>
      </list>
    </view>
  </view>
</template>
 
<script setup lang="ts">
import { ref, nextTick } from 'vue'
 
const props = defineProps({
  showInputPop: {
    type: Boolean,
    default: false,
  },
})
 
const emit = defineEmits([
  'closeInputPop',
  'disableScroll',
  'update:showInputPop',
])
 
// 新增评论入参
const commentParams = ref({ content: '' } as any)
 
// 评论上传的图片
const commentImages = ref<string[]>([])
 
// 点击回复控制textarea的聚焦
const replyFocus = ref(false)
// 默认的提示内容
const customPlaceholder = ref<string>('输入评论')
// 是否显示表情包
const showEmoji = ref(false)
// 表情包列表
const emojiDataList = ref([
  '🤞',
  '👍',
  '👏',
  '❤',
  '😁',
  '🖐',
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '😂',
  '🤣',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😉',
  '😌',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😝',
  '😜',
  '🤪',
  '🤨',
  '🧐',
  '🤓',
  '😎',
  '🤩',
  '🥳',
  '😏',
  '😒',
  '😞',
  '😔',
  '😟',
  '😕',
  '🙁',
  '😣',
  '😖',
  '😫',
  '😩',
  '🥺',
  '😢',
  '😭',
  '😤',
  '😠',
  '😡',
  '🤬',
  '🤯',
  '😳',
  '🥵',
  '🥶',
  '😱',
  '😨',
  '😰',
  '😥',
  '😓',
  '🤗',
  '🤔',
  '🤭',
  '🤫',
  '🤥',
  '😶',
  '😐',
  '😑',
  '😬',
  '🙄',
  '😯',
  '😦',
  '😧',
  '😮',
  '😲',
  '😴',
  '🤤',
  '😪',
  '😵',
  '🤐',
  '🥴',
  '🤢',
  '🤮',
  '🤧',
  '😷',
  '🤒',
  '🤕',
  '🤑',
  '🤠',
  '👻',
  '🐧',
])
// 记录当前光标位置
const cursorIndex = ref(0)
// 评论时鼠标光标 的位置
const cursorInputIndex = ref(-1)
// 评论框打开
const inputFocus = (type: number, e?: CommentRootList) => {
  nextTick(() => {
    replyFocus.value = true
    cursorIndex.value = cursorInputIndex.value
    // 如果是根评论（当前文章直接评论而不是回复别人的评论）
    if (type === 1) {
      customPlaceholder.value = '输入评论'
      commentParams.value.pCode = ''
    } else {
      // 如果是回复评论
      if (e) {
        commentParams.value.pCode = e.code
        customPlaceholder.value = `回复${e.nickname}`
      }
    }
  })
}
 
// 评论框聚焦
const commentInputFocus = (event: any) => {
  replyFocus.value = true
  showEmoji.value = false
}
// 评论失焦
const commentInputBlur = (event: any) => {
  cursorInputIndex.value = event.detail.cursor
  replyFocus.value = false
}
// 选中表情
const tuchCurrentEmoji = (item: string) => {
  if (cursorInputIndex.value > 0) {
    const start = commentParams.value.content?.substring(0, cursorInputIndex.value)
    const end = commentParams.value.content?.substring(
      cursorInputIndex.value,
      commentParams.value.content?.length,
    )
    commentParams.value.content = start + item + end
  } else {
    commentParams.value.content += item
  }
  cursorInputIndex.value += item?.length
}
// 输入时光标的位置
const inputFocusChange = (event: any) => {
  cursorInputIndex.value = event.detail.cursor
}
 
// 预览评论的图片
const previewCommentImage = (image: string) => {
  uni.previewImage({
    current: image,
    urls: commentImages.value,
  })
}
 
// 删除某一张评论图片
const deleteOneCommentImage = (index: number) => {
  commentImages.value.splice(index, 1)
}
 
// 选择上传媒体相册中的图片 uniapp的方法
// const selectMediaImage = async () => {
//   const res: any = await uni.chooseMedia({
//     count: 1,
//     mediaType: ['image'],
//     sourceType: ['album'],
//     camera: 'back',
//   })
//   const tempFilePaths = res.tempFiles?.map((item: any) => item.tempFilePath)
//   tempFilePaths.forEach(async (tempFilePath: string) => {
//     // 封装的的上传文件方法，可以改为自己的方法，也可以查看前面发布的文章里有这个方法
//     await uploadImages(tempFilePath, commentImages.value, 1)
//   })
// }
 
// 打开表情包
const openEmoji = () => {
  replyFocus.value = false
  showEmoji.value = true
}
 
// 打开键盘
const openKeyboard = () => {
  showEmoji.value = false
  replyFocus.value = true
}
 
const closeInputPop = () => {
  replyFocus.value = false
  emit('update:showInputPop', false)
  commentParams.value.pCode = ''
}
 
// 提交评论
const commentCommit = async () => {
  commentParams.value.content = commentParams.value.content?.trim()
  // 提交评论的具体实现可根据自己的需求来改，如有需要私我即可
  closeInputPop()
  // } else {
  //   uni.showToast({
  //     title: '评论内容不能为空',
  //     icon: 'none',
  //   })
  // }
}
defineExpose({
  inputFocus,
})
</script>
 
<style lang="scss">	
	
.c-mask {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 999;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
}
 
.popup-comment {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 1000;
  width: 100vw;
  background-color: #fff;
 
  .comment-input-wrap {
    padding: 20rpx 30rpx;
    display: flex;
    flex-direction: column;
 
    .comment-textarea-box {
      position: relative;
 
      .comment-textarea {
        border-radius: 20rpx;
        height: 160rpx;
        width: auto;
        background-color: #f6f6f6;
        font-size: 26rpx;
        padding: 20rpx;
      }
 
      .limit {
        // 定位到textarea 的 右下角
        position: absolute;
        right: 20rpx;
        bottom: 20rpx;
        font-size: 20rpx;
        color: #767676;
      }
    }
 
    .image-list {
      display: flex;
      flex-wrap: wrap;
      margin: 10rpx 0;
 
      .image-item {
        position: relative;
        width: 90rpx;
        height: 90rpx;
        margin-right: 10rpx;
        background-color: #fff;
 
        .image {
          border-radius: 20rpx;
          width: 100%;
          height: 100%;
        }
 
        .icon-close {
          position: absolute;
          top: -10rpx;
          right: -10rpx;
        }
      }
    }
 
    .relase-btn {
      display: flex;
      justify-content: space-between;
      // align-items: center;
      margin-top: 10rpx;
 
      // padding: 0 20rpx;
      .emoji-image {
        display: flex;
        align-items: center;
        font-size: 48rpx;
        color: #3d3d3d;
 
        .as-image,
        .emoji {
          margin-right: 20rpx;
        }
      }
 
      .limit {
        font-size: 24rpx;
        color: #767676;
      }
 
      .relase {
        // background-color: $uni-color-primary;
		background-color: #3d3d3d;
        border-radius: 10rpx;
        font-size: 26rpx;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10rpx 20rpx;
      }
    }
 
    .emoji-data {
      display: flex;
      flex-wrap: wrap;
      height: 300rpx;
      overflow: scroll;
      margin-top: 16rpx;
 
      .emoji-item {
        padding: 10rpx;
      }
 
      .emoj_conn {
        font-size: 40rpx;
      }
    }
  }
}
</style>