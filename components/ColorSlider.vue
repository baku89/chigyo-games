<template>
	<div class="ColorSlider" ref="rootRef">
		<canvas ref="canvasRef" class="canvas"></canvas>
		<input
			ref="inputRef"
			class="slider"
			type="range"
			:min="min"
			:max="max"
			:step="0.001"
			:value="modelValue"
			@input="onInput"
		/>
	</div>
</template>

<script setup lang="ts">
import {useElementSize} from '@vueuse/core'
import type {RGB} from '../utils/colors'

const props = withDefaults(
	defineProps<{
		modelValue: number
		/** スライダーの背景となるキャンバスのピクセルに入れる色の配列 */
		colors?: RGB[]
		min?: number
		max?: number
	}>(),
	{
		colors: () => [],
		min: 0,
		max: 255,
	}
)

const emit = defineEmits<{
	'update:modelValue': [value: number]
}>()

const min = computed(() => props.min ?? 0)
const max = computed(() => props.max ?? 255)

const rootRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()

const {height} = useElementSize(rootRef)

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
</script>

<style lang="stylus" scoped>
.ColorSlider
	position relative
	width 100%
	height var(--input-height, 40px)

.canvas
	position absolute
	top 0
	left 0
	width 100%
	height 100%
	border-radius 999px
	background red

.slider
	--input-border-width 3px
	position relative
	z-index 10
	width 100%
	height 100%
	-webkit-appearance none
	appearance none
	background transparent
	outline none
	pointer-events auto

	&::-webkit-slider-thumb
		-webkit-appearance none
		appearance none
		height var(--input-height, 40px)
		width var(--input-height, 40px)
		background-color var(--color-bg, white)
		border var(--input-border-width) solid currentColor
		border-radius 50%
		cursor pointer
		position relative
		box-shadow none

	&::-moz-range-thumb
		appearance none
		height var(--input-height, 40px)
		width var(--input-height, 40px)
		background-color var(--color-bg, white)
		border var(--input-border-width) solid currentColor
		border-radius 50%
		cursor pointer
		box-shadow none
</style>
