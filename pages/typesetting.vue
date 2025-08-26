<template>
	<GameContainer>
		<main class="Typesetting">
			<div class="characters">
				<Char src="/typesetting/0_chi.svg" :show-border="showBorders[0]" />
				<Char
					src="/typesetting/1_gi.svg"
					:show-border="showBorders[1]"
					:style="giStyle"
				/>
				<Char src="/typesetting/2_xyo.svg" :show-border="showBorders[2]" />
			</div>
			<div class="controls">
				<NumericSlider
					label="Tracking"
					v-model="tracking"
					:min="-300"
					:max="300"
					:step="0.01"
					v-model:hovering="hoveringTracking"
				/>
				<NumericSlider
					label="ち〜ぎ"
					v-model="kernings[0]"
					:min="-300"
					:max="300"
					:step="0.01"
					v-model:hovering="hoveringKernings[0]"
				/>
				<NumericSlider
					label="ぎ〜ょ"
					v-model="kernings[1]"
					:min="-300"
					:max="300"
					:step="0.01"
					v-model:hovering="hoveringKernings[1]"
				/>
			</div>
		</main>
	</GameContainer>
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
@import '../assets/style.styl'

.Typesetting
	display flex
	flex-direction column
	justify-content space-around

.characters
	display flex
	justify-content center
	position relative
	--char-size 15rem
	height var(--char-size)

.controls
	width 100%
	display grid
	grid-template-columns min-content 1fr
	gap 2.5rem

	> *
		grid-column 1 / -1
</style>
