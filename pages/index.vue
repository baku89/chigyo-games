<template>
	<main>
		<h1>Graphic Design Review - Interactive Figures</h1>

		<h2>1. 稚魚シャワー</h2>

		<iframe src="/chigyo-shower" />

		<h2>2. 稚魚シャワーの適応度地形</h2>

		<h2>3. 文字詰め空間</h2>

		<iframe src="/typesetting" />
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
	aspect-ratio 1 / 1
	outline 1px solid white
</style>
