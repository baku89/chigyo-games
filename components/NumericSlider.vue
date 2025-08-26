<template>
	<div
		class="NumericSlider"
		:class="{hovering: hovering}"
		@pointerover="hovering = true"
		@pointerdown="onPointerDown"
		@pointerleave="hovering = false"
		@pointerup="onPointerUp"
		@pointercancel="onPointerUp"
		@pointerout="onPointerUp"
		@mouseleave="onPointerUp"
		ref="$root"
	>
		<label class="label">{{ label }}</label>
		<input
			ref="$input"
			class="slider"
			type="range"
			:min="min"
			:max="max"
			:value="modelValue"
			@input="onInput"
		/>
	</div>
</template>

<script setup lang="ts">
import {useElementSize, useEventListener, useScrollLock} from '@vueuse/core'
import {scalar} from 'linearly'

const modelValue = defineModel<number>({default: 0})
const hovering = defineModel<boolean>('hovering', {default: false})

const props = defineProps<{
	label: string
	min: number
	max: number
}>()

const onInput = (event: Event) => {
	modelValue.value = Number((event.target as HTMLInputElement).value)
}

const $root = ref<HTMLDivElement>()
const $input = ref<HTMLInputElement>()

const {width: sliderWidth, height: sliderHeight} = useElementSize($input)

let stopWatchDragging: () => void = () => undefined
let isDragging = ref(false)

function onPointerDown(event: PointerEvent) {
	const target = event.target as HTMLInputElement

	target.setPointerCapture(event.pointerId)

	isDragging.value = true

	stopWatchDragging = useEventListener(target, 'pointermove', onPointerDrag)
}

function onPointerUp() {
	if (!isDragging.value) return

	isDragging.value = false

	stopWatchDragging()
}

// Cleanup on unmount
onUnmounted(() => {
	stopWatchDragging()
})

function onPointerDrag(event: PointerEvent) {
	if (!isDragging.value) return

	// Prevent default scrolling behavior
	event.preventDefault()

	const width = sliderWidth.value - sliderHeight.value
	const delta = (event.movementX / width) * (props.max - props.min)

	modelValue.value = scalar.clamp(
		modelValue.value + delta,
		props.min,
		props.max
	)
}

const isScrollLocked = useScrollLock(window)

watchEffect(() => {
	isScrollLocked.value = isDragging.value
})
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
	--input-height calc(max(4rem, 48px))
	--input-border-width 3px
	display block
	width 100%
	height var(--input-height)
	position relative
	-webkit-appearance none
	appearance none
	outline none
	pointer-events none


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

		transition all 0.1s ease-in-out

		.hovering &
			scale 1.5
			background-color var(--color-primary)
			border-width 0
</style>
