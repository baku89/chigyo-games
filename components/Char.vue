<template>
	<div class="char" :class="{'show-border': showBorder}" :style="style">
		<div class="char-inner" :style="{maskImage: `url(${src})`}" />
	</div>
</template>

<script setup lang="ts">
defineProps<{
	src: string
	showBorder: boolean
	style?: Record<string, any>
}>()
</script>

<style lang="stylus" scoped>

.char
	--char-size 20vw
	position relative
	width var(--char-size)
	aspect-ratio 1 / 1
	border 1px solid transparent
	margin -1px
	transition border-color 0.2s ease-in-out
	border-radius 0.5rem

	&.show-border
		border-color var(--color-primary)

.char-inner
	width 100%
	height 100%
	background-color var(--color-text)
	mask-size contain
	mask-repeat no-repeat
	mask-position center
</style>
