<template>
	<div class="GameContainer">
		<slot />
	</div>
</template>

<style lang="stylus">
@import '../assets/style.styl'

html, body
	margin 0
	width 100vw
	height 100vh
	overflow hidden

body
	display flex
	justify-content center
	align-items center

.GameContainer
	padding 1rem
	width calc(min(100vw, var(--max-width)))
	aspect-ratio 4 / 5
	overflow hidden
	position relative

	> *
		width 100%
		height 100%
</style>
