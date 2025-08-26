<template>
	<div
		class="NumericSlider"
		:class="{hovering: hovering}"
		@pointerover="hovering = true"
		@pointerleave="hovering = false"
	>
		<label class="label">{{ label }}</label>
		<input
			class="slider"
			type="range"
			:min="min"
			:max="max"
			:step="step"
			:value="modelValue"
			@input="onInput"
		/>
	</div>
</template>

<script setup lang="ts">
const modelValue = defineModel<number>()
const hovering = defineModel<boolean>('hovering', {default: false})

defineProps<{
	label: string
	min: number
	max: number
	step: number
}>()

const onInput = (event: Event) => {
	modelValue.value = Number((event.target as HTMLInputElement).value)
}
</script>

<style lang="stylus" scoped>

.NumericSlider
	display grid
	grid-template-columns subgrid
	gap 1rem
	align-items center

.label
	text-wrap nowrap
	font-size calc(max(1rem, 14px))

.slider
	--input-height 6rem
	--input-border-width 3px
	display block
	width 100%
	height var(--input-height)
	position relative
	-webkit-appearance none
	appearance none
	outline none
	cursor pointer

	&:before
		position absolute
		content ''
		top 50%
		left 0
		width 100%
		border-radius 999px
		height var(--input-border-width)
		background currentColor
		transform translateY(-50%)

	&::-webkit-slider-thumb
		-webkit-appearance none
		appearance none
		height var(--input-height)
		width var(--input-height)
		background-color var(--color-bg)
		border var(--input-border-width) solid currentColor
		border-radius 50%
		cursor pointer
		position relative
		z-index 100
		outline calc( 2 * var(--input-border-width)) solid var(--color-bg)
		box-shadow none

		transition all 0.2s ease-in-out

		.hovering &
			background-color var(--color-primary)
			border-color var(--color-primary)
</style>
