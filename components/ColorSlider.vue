<template>
	<div
		class="ColorSlider"
		:class="{hovering: hovering}"
		@pointerover="hovering = true"
		@pointerdown="onPointerDown"
		@pointerleave="hovering = false"
		@pointerup="onPointerUp"
		@pointercancel="onPointerUp"
		@pointerout="onPointerUp"
		@mouseleave="onPointerUp"
	>
		<label class="label">{{ label }}</label>
		<div class="slider">
			<canvas ref="canvasRef" class="canvas"></canvas>
			<input
				ref="inputRef"
				class="input"
				type="range"
				:min="min"
				:max="max"
				:step="0.001"
				:value="modelValue"
				@input="onInput"
				:style="{color: currentColor}"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import {useElementSize, useEventListener, useScrollLock} from '@vueuse/core'
import type {RGB} from '../utils/colors'
import {scalar} from 'linearly'

const props = withDefaults(
	defineProps<{
		label: string
		modelValue: number
		/** スライダーの背景となるキャンバスのピクセルに入れる色の配列 */
		colors?: RGB[]
		min?: number
		max?: number
		currentColor?: string
	}>(),
	{
		label: '',
		colors: () => [],
		min: 0,
		max: 255,
	}
)

const emit = defineEmits<{
	'update:modelValue': [value: number]
}>()

const canvasRef = ref<HTMLCanvasElement>()
const {width: sliderWidth, height: sliderHeight} = useElementSize(canvasRef)

const hovering = ref(false)

// Draw colors to canvas
function drawCanvas() {
	const canvas = canvasRef.value
	if (!canvas || props.colors.length === 0) return

	const ctx = canvas.getContext('2d')
	if (!ctx) return

	// Set canvas size - width based on colors array length
	canvas.width = props.colors.length
	canvas.height = 1

	const imageData = ctx.createImageData(canvas.width, canvas.height)
	const data = imageData.data

	// Fill each pixel with the corresponding color from the colors array
	for (let x = 0; x < canvas.width; x++) {
		const colorIndex = Math.floor(
			(x / canvas.width) * (props.colors.length - 1)
		)
		const color = props.colors[colorIndex]
		if (!color) continue

		const [r, g, b] = color

		const index = x * 4
		data[index] = r
		data[index + 1] = g
		data[index + 2] = b
		data[index + 3] = 255
	}

	ctx.putImageData(imageData, 0, 0)
}

// Watch for changes and redraw
watch([() => props.colors], () => {
	drawCanvas()
})

onMounted(() => {
	drawCanvas()
})

const onInput = (event: Event) => {
	const value = Number((event.target as HTMLInputElement).value)
	emit('update:modelValue', value)
}

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

	emit(
		'update:modelValue',
		scalar.clamp(props.modelValue + delta, props.min, props.max)
	)
}

const isScrollLocked = useScrollLock(window)

watchEffect(() => {
	isScrollLocked.value = isDragging.value
})
</script>

<style lang="stylus" scoped>
.ColorSlider
	position relative
	width 100%
	height var(--input-height, 40px)
	display flex

.canvas
	position absolute
	top 0
	left 0
	width 100%
	height 100%
	border-radius 999px

.label
	width 5.5em
	font-size 1.2rem
	line-height var(--input-height)

	&::first-letter
		font-weight bold
		font-size 1.2em

.slider
	position relative
	flex-grow 1

.input
	--input-border-width 3px
	position relative
	z-index 10
	width 100%
	height 100%
	-webkit-appearance none
	appearance none
	background transparent
	outline none
	pointer-events none

	&::-webkit-slider-thumb
		-webkit-appearance none
		appearance none
		height var(--input-height)
		width var(--input-height)
		background-color currentColor
		border var(--input-border-width) solid var(--color-text)
		outline var(--input-border-width) solid var(--color-bg)
		border-radius 50%
		cursor pointer
		position relative
		box-shadow none
		transition all 0.1s ease-in-out

		.hovering &
			scale 1.2
</style>
