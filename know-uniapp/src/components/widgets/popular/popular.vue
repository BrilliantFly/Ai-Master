<template>
	<view>
		<view class="data-box">
			<view class="cu-bar bg-white">
				<view class="action data-box-title">
					<text class="cuIcon-titles text-rule"></text> 热门专题
				</view>
				<view class="action more" @tap="toMetas">
					<text>查看全部</text><text class="cuIcon-right"></text>
				</view>
			</view>
			<view class="topic grid col-2">
				<view class="topic-box" v-for="(item,index) in Topic" @tap="toCategoryContents(item.name,item.mid)"
					:key="index">
					<view class="topic-main">
						<image :src="item.imgurl" mode="aspectFill"></image>
						<view class="topic-text" v-if="item.type=='tag'">#{{replaceSpecialChar(item.name)}}#</view>
						<view class="topic-text" v-else>{{replaceSpecialChar(item.name)}}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	const Topic = [
		{
			name: '文学写作',
			type: 'tag',
			imgurl: '1'
		},
		{
			name: '文学写作',
			type: 'tag',
			imgurl: '1'
		},
		{
			name: '文学写作',
			type: 'tag',
			imgurl: '1'
		},
		{
			name: '文学写作',
			type: '',
			imgurl: 'https://ww2.sinaimg.cn/mw690/007ut4Uhly1hx4v375r00j30u017cdla.jpg'
		}
	]

	const toMetas = () => {
		var that = this;

		uni.navigateTo({
			url: '/pages/contents/metas'
		});
	}

	const replaceSpecialChar = (text) => {
		text = text.replace(/&quot;/g, '"');
		text = text.replace(/&amp;/g, '&');
		text = text.replace(/&lt;/g, '<');
		text = text.replace(/&gt;/g, '>');
		text = text.replace(/&nbsp;/g, ' ');
		return text;
	}
	
	const toCategoryContents = (title,id) =>{
		var that = this;
		var type="meta";
		uni.navigateTo({
		    url: '/pages/contents/contentlist?title='+title+"&type="+type+"&id="+id
		});
	}
</script>

<style lang="scss" scoped>

	@import "@/styles/icon.css";
	
	.data-box{
		margin-top: 12upx;
		background-color: #ffffff;
		/* box-shadow: 0px 0px 5px rgba(0,0,0,.1); */
		padding: 0upx;
	}
	
	.data-box-title{
		color: #333;
		font-size: 30upx !important;
		font-weight: bold;
		
		text-overflow: -o-ellipsis-lastline;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	
	.topic{
		padding: 0upx 15upx;
		width: 100%;
	}
	.topic-box{
		padding:10upx;
	}
	.topic-main{
		border-radius: 15upx;
		overflow: hidden;
		
		height: 160upx;
		position: relative;
	}
	.topic-main image{
		width: 100%;
		height: 160upx;
		transition:0.3s all;
	}
	.topic-main:hover image{
		-webkit-transform:scale(1.3);
		-ms-transform:scale(1.3);
		transform:scale(1.3);
	}
	.topic-text{
		position: absolute;
		width: 100%;
		height: 160upx;
		text-align: center;
		line-height: 160upx;
		top: 0px;
		font-size: 30upx;
		left: 0px;
		font-weight: bold;
		z-index: 10;
		background-color: rgba(0,0,0,0.25);
		color: #fff;
	}
	
	// .text-rule{
	// 	color: #0081FF;
	// 	display: none;
	// }
	.cuIcon-titles{
		color: coral;
	}
	
	/* ==================
	          操作条
	 ==================== */
	
	.cu-bar {
		display: flex;
		position: relative;
		align-items: center;
		min-height: 100upx;
		justify-content: space-between;
	}
	
	// .cu-bar .action {
	// 	display: flex;
	// 	align-items: center;
	// 	height: 100%;
	// 	justify-content: center;
	// 	max-width: 100%;
	// }
	
	// .cu-bar .action.border-title {
	// 	position: relative;
	// 	top: -10upx;
	// }
	
	// .cu-bar .action.border-title text[class*="bg-"]:last-child {
	// 	position: absolute;
	// 	bottom: -0.5rem;
	// 	min-width: 2rem;
	// 	height: 6upx;
	// 	left: 0;
	// }
	
	// .cu-bar .action.sub-title {
	// 	position: relative;
	// 	top: -0.2rem;
	// }
	
	// .cu-bar .action.sub-title text {
	// 	position: relative;
	// 	z-index: 1;
	// }
	
	// .cu-bar .action.sub-title text[class*="bg-"]:last-child {
	// 	position: absolute;
	// 	display: inline-block;
	// 	bottom: -0.2rem;
	// 	border-radius: 6upx;
	// 	width: 100%;
	// 	height: 0.6rem;
	// 	left: 0.6rem;
	// 	opacity: 0.3;
	// 	z-index: 0;
	// }
	
	// .cu-bar .action.sub-title text[class*="text-"]:last-child {
	// 	position: absolute;
	// 	display: inline-block;
	// 	bottom: -0.7rem;
	// 	left: 0.5rem;
	// 	opacity: 0.2;
	// 	z-index: 0;
	// 	text-align: right;
	// 	font-weight: 900;
	// 	font-size: 36upx;
	// }
	
	// .cu-bar.justify-center .action.border-title text:last-child,
	// .cu-bar.justify-center .action.sub-title text:last-child {
	// 	left: 0;
	// 	right: 0;
	// 	margin: auto;
	// 	text-align: center;
	// }
	
	.cu-bar .action:first-child {
		margin-left: 30upx;
		font-size: 30upx;
	}
	
	.cu-bar .action text.text-cut {
		text-align: left;
		width: 100%;
	}
	
	.cu-bar .cu-avatar:first-child {
		margin-left: 20upx;
	}
	
	.cu-bar .action:first-child>text[class*="cuIcon-"] {
		margin-left: -0.3em;
		margin-right: 0.3em;
	}
	
	.cu-bar .action:last-child {
		margin-right: 30upx;
	}
	
	// .cu-bar .action>text[class*="cuIcon-"],
	// .cu-bar .action>view[class*="cuIcon-"] {
	// 	font-size: 36upx;
	// }
	
	// .cu-bar .action>text[class*="cuIcon-"]+text[class*="cuIcon-"] {
	// 	margin-left: 0.5em;
	// }
	
	// .cu-bar .content {
	// 	position: absolute;
	// 	text-align: center;
	// 	width: calc(100% - 340upx);
	// 	left: 0;
	// 	right: 0;
	// 	bottom: 0;
	// 	top: 0;
	// 	margin: auto;
	// 	height: 60upx;
	// 	font-size: 32upx;
	// 	line-height: 60upx;
	// 	cursor: none;
	// 	pointer-events: none;
	// 	text-overflow: ellipsis;
	// 	white-space: nowrap;
	// 	overflow: hidden;
	// }
	
	// .cu-bar.ios .content {
	// 	bottom: 7px;
	// 	height: 30px;
	// 	font-size: 32upx;
	// 	line-height: 30px;
	// }
	
	// .cu-bar.btn-group {
	// 	justify-content: space-around;
	// }
	
	// .cu-bar.btn-group button {
	// 	padding: 20upx 32upx;
	// }
	
	// .cu-bar.btn-group button {
	// 	flex: 1;
	// 	margin: 0 20upx;
	// 	max-width: 50%;
	// }
	
	// .cu-bar .search-form {
	// 	background-color: #f5f5f5;
	// 	line-height: 64upx;
	// 	height: 64upx;
	// 	font-size: 24upx;
	// 	color: #333333;
	// 	flex: 1;
	// 	display: flex;
	// 	align-items: center;
	// 	margin: 0 30upx;
	// }
	
	// .cu-bar .search-form+.action {
	// 	margin-right: 30upx;
	// }
	
	// .cu-bar .search-form input {
	// 	flex: 1;
	// 	padding-right: 30upx;
	// 	height: 64upx;
	// 	line-height: 64upx;
	// 	font-size: 26upx;
	// 	background-color: transparent;
	// }
	
	// .cu-bar .search-form [class*="cuIcon-"] {
	// 	margin: 0 0.5em 0 0.8em;
	// }
	
	// .cu-bar .search-form [class*="cuIcon-"]::before {
	// 	top: 0upx;
	// }
	
	// .cu-bar.fixed,
	// .nav.fixed {
	// 	position: fixed;
	// 	width: 100%;
	// 	top: 0;
	// 	z-index: 1024;
	// 	box-shadow: 0 1upx 6upx rgba(0, 0, 0, 0.1);
	// }
	
	// .cu-bar.foot {
	// 	position: fixed;
	// 	width: 100%;
	// 	bottom: 0;
	// 	z-index: 1024;
	// 	box-shadow: 0 -1upx 6upx rgba(0, 0, 0, 0.1);
	// }
	
	// .cu-bar.tabbar {
	// 	padding: 0;
	// 	height: calc(100upx + env(safe-area-inset-bottom) / 2);
	// 	padding-bottom: calc(env(safe-area-inset-bottom) / 2);
	// }
	
	// .cu-tabbar-height {
	// 	min-height: 100upx;
	// 	height: calc(100upx + env(safe-area-inset-bottom) / 2);
	// }
	
	// .cu-bar.tabbar.shadow {
	// 	box-shadow: 0 -1upx 6upx rgba(0, 0, 0, 0.1);
	// }
	
	// .cu-bar.tabbar .action {
	// 	font-size: 22upx;
	// 	position: relative;
	// 	flex: 1;
	// 	text-align: center;
	// 	padding: 0;
	// 	display: block;
	// 	height: auto;
	// 	line-height: 1;
	// 	margin: 0;
	// 	background-color: inherit;
	// 	overflow: initial;
	// }
	
	// .cu-bar.tabbar.shop .action {
	// 	width: 140upx;
	// 	flex: initial;
	// }
	
	// .cu-bar.tabbar .action.add-action {
	// 	position: relative;
	// 	z-index: 2;
	// 	padding-top: 50upx;
	// }
	
	// .cu-bar.tabbar .action.add-action [class*="cuIcon-"] {
	// 	position: absolute;
	// 	width: 70upx;
	// 	z-index: 2;
	// 	height: 70upx;
	// 	border-radius: 50%;
	// 	line-height: 70upx;
	// 	font-size: 50upx;
	// 	top: -35upx;
	// 	left: 0;
	// 	right: 0;
	// 	margin: auto;
	// 	padding: 0;
	// }
	
	// .cu-bar.tabbar .action.add-action::after {
	// 	content: "";
	// 	position: absolute;
	// 	width: 100upx;
	// 	height: 100upx;
	// 	top: -50upx;
	// 	left: 0;
	// 	right: 0;
	// 	margin: auto;
	// 	box-shadow: 0 -3upx 8upx rgba(0, 0, 0, 0.08);
	// 	border-radius: 50upx;
	// 	background-color: inherit;
	// 	z-index: 0;
	// }
	
	// .cu-bar.tabbar .action.add-action::before {
	// 	content: "";
	// 	position: absolute;
	// 	width: 100upx;
	// 	height: 30upx;
	// 	bottom: 30upx;
	// 	left: 0;
	// 	right: 0;
	// 	margin: auto;
	// 	background-color: inherit;
	// 	z-index: 1;
	// }
	
	// .cu-bar.tabbar .btn-group {
	// 	flex: 1;
	// 	display: flex;
	// 	justify-content: space-around;
	// 	align-items: center;
	// 	padding: 0 10upx;
	// }
	
	// .cu-bar.tabbar button.action::after {
	// 	border: 0;
	// }
	
	// .cu-bar.tabbar .action [class*="cuIcon-"] {
	// 	width: 100upx;
	// 	position: relative;
	// 	display: block;
	// 	height: auto;
	// 	margin: 0 auto 10upx;
	// 	text-align: center;
	// 	font-size: 40upx;
	// }
	
	// .cu-bar.tabbar .action .cuIcon-cu-image {
	// 	margin: 0 auto;
	// }
	
	// .cu-bar.tabbar .action .cuIcon-cu-image image {
	// 	width: 50upx;
	// 	height: 50upx;
	// 	display: inline-block;
	// }
	
	// .cu-bar.tabbar .submit {
	// 	align-items: center;
	// 	display: flex;
	// 	justify-content: center;
	// 	text-align: center;
	// 	position: relative;
	// 	flex: 2;
	// 	align-self: stretch;
	// }
	
	// .cu-bar.tabbar .submit:last-child {
	// 	flex: 2.6;
	// }
	
	// .cu-bar.tabbar .submit+.submit {
	// 	flex: 2;
	// }
	
	// .cu-bar.tabbar.border .action::before {
	// 	content: " ";
	// 	width: 200%;
	// 	height: 200%;
	// 	position: absolute;
	// 	top: 0;
	// 	left: 0;
	// 	transform: scale(0.5);
	// 	transform-origin: 0 0;
	// 	border-right: 1upx solid rgba(0, 0, 0, 0.1);
	// 	z-index: 3;
	// }
	
	// .cu-bar.tabbar.border .action:last-child:before {
	// 	display: none;
	// }
	
	// .cu-bar.input {
	// 	padding-right: 20upx;
	// 	background-color: #ffffff;
	// }
	
	// .cu-bar.input input {
	// 	overflow: initial;
	// 	line-height: 64upx;
	// 	height: 64upx;
	// 	min-height: 64upx;
	// 	flex: 1;
	// 	font-size: 30upx;
	// 	margin: 0 20upx;
	// }
	
	// .cu-bar.input .action {
	// 	margin-left: 20upx;
	// }
	
	// .cu-bar.input .action [class*="cuIcon-"] {
	// 	font-size: 48upx;
	// }
	
	// .cu-bar.input input+.action {
	// 	margin-right: 20upx;
	// 	margin-left: 0upx;
	// }
	
	// .cu-bar.input .action:first-child [class*="cuIcon-"] {
	// 	margin-left: 0upx;
	// }
	
	// .cu-custom {
	// 	display: block;
	// 	position: relative;
	// }
	
	// .cu-custom .cu-bar .content {
	// 	width: calc(100% - 440upx);
	// }
	
	// /* #ifdef MP-ALIPAY */
	// .cu-custom .cu-bar .action .cuIcon-back {
	// 	opacity: 0;
	// }
	
	/* #endif */
	
	/* grid布局 */
	
	.grid {
		display: flex;
		flex-wrap: wrap;
	}
	
	.grid.grid-square {
		overflow: hidden;
	}
	
	.grid.grid-square .cu-tag {
		position: absolute;
		right: 0;
		top: 0;
		border-bottom-left-radius: 6upx;
		padding: 6upx 12upx;
		height: auto;
		background-color: rgba(0, 0, 0, 0.5);
	}
	
	.grid.grid-square>view>text[class*="cuIcon-"] {
		font-size: 52upx;
		position: absolute;
		color: #8799a3;
		margin: auto;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	
	.grid.grid-square>view {
		margin-right: 20upx;
		margin-bottom: 20upx;
		border-radius: 6upx;
		position: relative;
		overflow: hidden;
	}
	.grid.grid-square>view.bg-img image {
		width: 100%;
		height: 100%;
		position: absolute;
	}
	.grid.col-1.grid-square>view {
		padding-bottom: 100%;
		height: 0;
		margin-right: 0;
	}
	
	.grid.col-2.grid-square>view {
		padding-bottom: calc((100% - 20upx)/2);
		height: 0;
		width: calc((100% - 20upx)/2);
	}
	
	.grid.col-3.grid-square>view {
		padding-bottom: calc((100% - 40upx)/3);
		height: 0;
		width: calc((100% - 40upx)/3);
	}
	
	.grid.col-4.grid-square>view {
		padding-bottom: calc((100% - 60upx)/4);
		height: 0;
		width: calc((100% - 60upx)/4);
	}
	
	.grid.col-5.grid-square>view {
		padding-bottom: calc((100% - 80upx)/5);
		height: 0;
		width: calc((100% - 80upx)/5);
	}
	
	.grid.col-2.grid-square>view:nth-child(2n),
	.grid.col-3.grid-square>view:nth-child(3n),
	.grid.col-4.grid-square>view:nth-child(4n),
	.grid.col-5.grid-square>view:nth-child(5n) {
		margin-right: 0;
	}
	
	.grid.col-1>view {
		width: 100%;
	}
	
	.grid.col-2>view {
		width: 50%;
	}
	
	.grid.col-3>view {
		width: 33.33%;
	}
	
	.grid.col-4>view {
		width: 25%;
	}
	
	.grid.col-5>view {
		width: 20%;
	}
	
</style>