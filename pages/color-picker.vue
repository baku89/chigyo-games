<template>
	<div class="ColorPicker">
		<div class="pickers">
			<ColorSlider v-model="hue" :max="360" :colors="hueColors" label="Hue" />
			<ColorSlider
				v-model="saturation"
				:min="0"
				:max="1"
				:colors="saturationColors"
				label="Saturation"
			/>
			<ColorSlider
				v-model="value"
				:min="0"
				:max="1"
				:colors="valueColors"
				label="Value"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import type {RGB} from '~/utils/colors'
import {range} from 'lodash-es'

const hue = ref(0)
const saturation = ref(0)
const value = ref(0)

const hueColors = computed<RGB[]>(() => {
	return range(0, 360, 5).map(hue => {
		return hsv2rgb(hue, saturation.value, value.value)
	})
})

const saturationColors = computed<RGB[]>(() => {
	return range(0, 1, 0.1).map(saturation => {
		return hsv2rgb(hue.value, saturation, value.value)
	})
})

const valueColors = computed<RGB[]>(() => {
	return range(0, 1, 0.1).map(value => {
		return hsv2rgb(hue.value, saturation.value, value)
	})
})
</script>

<style lang="stylus" scoped>

html, body
	margin 0
	width 100vw
	height 100vh
	overflow hidden

body
	display flex
	justify-content center
	align-items center

.ColorPicker
	main-wrapper()
	aspect-ratio 4 / 5

.pickers
	display flex
	flex-direction column
	gap 1rem
</style>
