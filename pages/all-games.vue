<template>
	<main>
		<h1>稚魚ゲー</h1>

		<h2>1. 稚魚シャワー</h2>

		<iframe class="portrait" src="./shower" />

		<h2>2. 稚魚シャワーの適応度地形</h2>

		<iframe src="./shower-landscape" />

		<h2>3. 文字詰めゲーム</h2>

		<iframe class="portrait" src="./typesetting" />

		<h2>4. 文字詰めゲームのビジュアライズ</h2>

		<iframe class="square" src="./typesetting-visualize" />

		<h2>5. カラーピッカー</h2>

		<iframe class="portrait" src="./color-picker" />
	</main>
</template>

<style lang="stylus">

body
	background var(--color-bg)
	overflow scroll
	overflow-x hidden
	padding-bottom 50vh

main
	padding 2rem
	max-width 850px
	position relative

h1
	font-size 2rem

h2
	font-size 1.5rem
	font-weight bold

h1, h2, p
	margin-block 1lh
	margin-inline 0

iframe
	width 100%
	height auto
	outline 1px solid white
	aspect-ratio 4 / 3

	&.portrait
		aspect-ratio 4 / 5

	&.square
		aspect-ratio 1 / 1
</style>
