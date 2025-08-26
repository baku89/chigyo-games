<template>
	<main class="Typesetting">
		<div class="characters">
			<img
				class="char"
				:class="{'show-border': showBorders[0]}"
				src="~/assets/typesetting/0_chi.svg"
			/>
			<img
				class="char"
				:class="{'show-border': showBorders[1]}"
				src="~/assets/typesetting/1_gi.svg"
				:style="giStyle"
			/>
			<img
				class="char"
				:class="{'show-border': showBorders[2]}"
				src="~/assets/typesetting/2_xyo.svg"
			/>
		</div>
		<div class="controls">
			<NumericSlider
				label="ち〜ぎ"
				v-model="kernings[0]"
				:min="-500"
				:max="500"
				:step="0.01"
				v-model:hovering="hoveringKernings[0]"
			/>
			<NumericSlider
				label="ぎ〜ょ"
				v-model="kernings[1]"
				:min="-500"
				:max="500"
				:step="0.01"
				v-model:hovering="hoveringKernings[1]"
			/>
			<NumericSlider
				label="Tracking"
				v-model="tracking"
				:min="-500"
				:max="500"
				:step="0.01"
				v-model:hovering="hoveringTracking"
			/>
		</div>
	</main>
</template>

<script setup lang="ts">
const kernings = ref<[number, number]>([0, 0])
const tracking = ref(0)

const hoveringKernings = ref<[boolean, boolean]>([false, false])
const hoveringTracking = ref(false)

const showBorders = computed<[boolean, boolean, boolean]>(() => {
	const [k0, k1] = hoveringKernings.value
	const t = hoveringTracking.value

	return [k0 || t, k0 || k1 || t, k1 || t]
})

const giStyle = computed(() => {
	const beforeKerning = (kernings.value[0] + tracking.value) / 1000
	const afterKerning = (kernings.value[1] + tracking.value) / 1000

	return {
		marginLeft: `calc(var(--char-size) * ${beforeKerning})`,
		marginRight: `calc(var(--char-size) * ${afterKerning})`,
	}
})
</script>

<style lang="stylus">

html, body
	margin 0
	width 100vw
	height auto
	aspect-ratio 1 / 1
	overflow hidden


.Typesetting
	padding 1rem
	width 100vw
	aspect-ratio 1 / 1
	display flex
	flex-direction column
	justify-content space-around
	overflow hidden
	background rgb(173, 173, 173)

.characters
	display flex
	justify-content center
	position relative

.char
	--char-size 20vw
	position relative
	width var(--char-size)
	aspect-ratio 1 / 1
	border 2px solid transparent
	margin -2px
	transition border-color 0.2s ease-in-out
	border-radius 0.5rem

	&.show-border
		border-color var(--color-primary)

.controls
	width 100%
	display grid
	grid-template-columns min-content 1fr
	gap 1rem

	> *
		grid-column 1 / -1
</style>
