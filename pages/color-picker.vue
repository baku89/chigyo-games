<template>
	<div class="ColorPicker">
		<div class="color-space-select">
			<button
				:class="{active: currentSpace === 'rgb'}"
				@click="currentSpace = 'rgb'"
			>
				RGB
			</button>
			<button
				:class="{active: currentSpace === 'hsv'}"
				@click="currentSpace = 'hsv'"
			>
				HSV
			</button>
			<button
				:class="{active: currentSpace === 'oklch'}"
				@click="currentSpace = 'oklch'"
			>
				OKLCH
			</button>
		</div>
		<div class="pickers">
			<template v-if="currentSpace === 'hsv'">
				<ColorSlider
					v-model="hue"
					:max="360"
					:colors="hueColors"
					:currentColor="currentColor"
					label="Hue"
				/>
				<ColorSlider
					v-model="saturation"
					:min="0"
					:max="1"
					:colors="saturationColors"
					:currentColor="currentColor"
					label="Saturation"
				/>
				<ColorSlider
					v-model="value"
					:min="0"
					:max="1"
					:colors="valueColors"
					:currentColor="currentColor"
					label="Value"
				/>
			</template>
			<template v-else-if="currentSpace === 'rgb'">
				<ColorSlider
					:model-value="rgb[0]"
					@update:model-value="updateRGB($event, rgb[1], rgb[2])"
					:colors="redColors"
					:currentColor="currentColor"
					label="Red"
				/>
				<ColorSlider
					:model-value="rgb[1]"
					@update:model-value="updateRGB(rgb[0], $event, rgb[2])"
					:colors="greenColors"
					:currentColor="currentColor"
					label="Green"
				/>
				<ColorSlider
					:model-value="rgb[2]"
					@update:model-value="updateRGB(rgb[0], rgb[1], $event)"
					:colors="blueColors"
					:currentColor="currentColor"
					label="Blue"
				/>
			</template>
			<template v-else-if="currentSpace === 'oklch'">
				<ColorSlider
					v-model="oklch[2]"
					@update:model-value="updateOkLCh(oklch[0], oklch[1], $event)"
					:min="0"
					:max="360"
					:colors="okhueColors"
					:currentColor="currentColor"
					label="hue"
				/>
				<ColorSlider
					v-model="oklch[1]"
					@update:model-value="updateOkLCh(oklch[0], $event, oklch[2])"
					:min="0"
					:max="0.4"
					:colors="chromaColors"
					:currentColor="currentColor"
					label="Chroma"
				/>
				<ColorSlider
					v-model="oklch[0]"
					@update:model-value="updateOkLCh($event, oklch[1], oklch[2])"
					:min="0"
					:max="1"
					:colors="lightnessColors"
					:currentColor="currentColor"
					label="Lightness"
				/>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import {type RGB, hsv2rgb, rgb2hsv, hsv2oklch, oklch2rgb} from '~/utils/colors'
import {range} from 'lodash-es'
import chroma from 'chroma-js'

type ColorSpace = 'hsv' | 'rgb' | 'oklch'

const currentSpace = ref<ColorSpace>('rgb')

const hue = ref(0)
const saturation = ref(1)
const value = ref(1)

const currentColor = computed(() => {
	return chroma.hsv(hue.value, saturation.value, value.value).hex()
})

const rgb = computed(() => hsv2rgb(hue.value, saturation.value, value.value))

const oklch = ref<OkLCh>(hsv2oklch(hue.value, saturation.value, value.value))

function updateRGB(red: number, green: number, blue: number) {
	const [h, s, v] = rgb2hsv(red, green, blue, hue.value)
	hue.value = h
	saturation.value = s
	value.value = v
}

watch(currentSpace, () => {
	oklch.value = hsv2oklch(hue.value, saturation.value, value.value)
})

function updateOkLCh(lightness: number, chroma: number, okhue: number) {
	const [h, s, v] = oklch2hsv(lightness, chroma, okhue, hue.value)
	hue.value = h
	saturation.value = s
	value.value = v
}

// HSV
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

const redColors = computed<RGB[]>(() => {
	const [, green, blue] = rgb.value
	return range(0, 255, 5).map(red => [red, green, blue])
})

const greenColors = computed<RGB[]>(() => {
	const [red, , blue] = rgb.value
	return range(0, 255, 5).map(green => [red, green, blue])
})

const blueColors = computed<RGB[]>(() => {
	const [red, green] = rgb.value
	return range(0, 255, 5).map(blue => [red, green, blue])
})

const lightnessColors = computed<RGB[]>(() => {
	const [, chroma, hue] = oklch.value
	return range(0, 1, 0.1).map(lightness => oklch2rgb(lightness, chroma, hue))
})

const chromaColors = computed<RGB[]>(() => {
	const [lightness, , hue] = oklch.value
	return range(0, 0.4, 0.1).map(chroma => oklch2rgb(lightness, chroma, hue))
})

const okhueColors = computed<RGB[]>(() => {
	const [lightness, chroma] = oklch.value
	return range(0, 360, 5).map(hue => oklch2rgb(lightness, chroma, hue))
})
</script>

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

.ColorPicker
	main-wrapper()

.color-space-select
	display flex
	gap 1rem
	justify-content center
	align-items center
	margin-bottom 3rem

	button
		padding .6rem 1.4rem .8rem
		font-size 1.2rem
		font-weight bold
		border 2px solid var(--color-text)
		background-color var(--color-bg)
		color var(--color-text)
		border-radius 0.5rem
		transition all 0.1s ease-in-out

		&:hover
			background-color var(--color-primary)
			border-color var(--color-primary)

		&.active
			background-color var(--color-primary)
			color var(--color-text)


.pickers
	display flex
	flex-direction column
	gap 1rem
</style>
