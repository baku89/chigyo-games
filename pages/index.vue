<template>
	<main>
		<h1>稚魚ゲー</h1>

		<p>
			この2つのミニゲームは、映像作家の<a href="https://baku89.com">橋本 麦</a
			>が執筆している、制作やデザインについての論考に埋め込む予定のものです。
		</p>

		<p>
			プレイに協力いただいたみなさんのデータがどのメディアでどのように用いられるかは、この数週間内のお楽しみにしてもらえたら嬉しいです。公開されたら
			<a href="https://instagram.com/_baku89/">Instagram</a> と
			<a href="https://x.com/baku89">X</a> でお知らせします。
		</p>

		<h2>1. 稚魚シャワー</h2>

		<iframe class="portrait" src="./shower" />

		<h2>2. 稚魚詰め</h2>

		<iframe class="portrait" src="./typesetting" />
	</main>
</template>

<style lang="stylus" scoped>

body
	background var(--color-bg)
	overflow scroll
	overflow-x hidden

p
	line-height 1.8
	font-size 16px

	a:link
		text-decoration underline

main
	padding 2rem
	max-width 850px
	position relative
	padding-bottom 20vh

h1
	font-size 4rem
	font-weight bold

h2
	font-size 2.6rem
	font-weight bold

h1, h2, p
	margin-block 1lh
	margin-inline 0

iframe
	width 100%
	height auto
	aspect-ratio 4 / 3

	&.portrait
		aspect-ratio 4 / 5

	&.square
		aspect-ratio 1 / 1
</style>
