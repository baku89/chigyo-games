<template>
	<GameContainer :game-duration="15">
		<template #instruction="{gameDuration}">
			<div class="instruction">
				<h1>稚魚シャワー</h1>
				<p>
					シャワーの湯加減と勢いを調整して<br />
					稚魚を喜ばせよう
				</p>
				<p>
					制限時間は<strong>{{ gameDuration }}秒</strong>
				</p>
				<p class="small">
					※ 本ゲームでは、操作データが一度だけサーバーに送信・記録されます。<br />
					プレイ開始をもって、データの収集・利用に同意したものとみなされます。
				</p>
			</div>
		</template>

		<template #default="{canEdit}">
			<main class="Shower">
				<div class="practice-message" v-if="game.state === 'practice'">
					<template v-if="faucetType === 1">
						お湯と水の蛇口をドラッグで回して<br />シャワーを出してみよう
					</template>
					<template v-else-if="faucetType === 2">
						温度と水勢のレバーを上下にドラッグして<br />シャワーを出してみよう
					</template>
					<template v-else-if="faucetType === 3">
						レバーを上下左右にドラッグして<br />シャワーを出してみよう
					</template>
				</div>
				<div class="touchable" />
				<Renderer
					ref="renderer"
					class="shower-renderer"
					:class="{invalid: !canEdit}"
					:antialias="true"
					:alpha="true"
					:resize="true"
				>
					<Camera :position="{z: 5}" :fov="26.5" />
					<Scene>
						<AmbientLight :intensity="1" />
						<DirectionalLight
							:position="{x: -10, y: 10, z: 5}"
							:intensity="2"
						/>
						<ShowerHead :water-amounts="waterAmounts" />
						<Group :position="{y: 0.2}" :scale="{x: 0.75, y: 0.75, z: 0.75}">
							<Chigyo :goodness="goodness" />
						</Group>
						<Group :position="{y: -0.67}">
							<component
								:is="Facets[faucetType - 1]"
								ref="faucet"
								@update:waterAmounts="waterAmounts = $event"
							/>
						</Group>
					</Scene>
				</Renderer>
			</main>
		</template>
		<template #result>
			<p class="result-text">お疲れ様です！</p>
			<div class="result">
				<p class="comment" v-html="comment" />
				<img class="chigyo" src="/shower/chigyo.gif" />
			</div>
		</template>
	</GameContainer>
</template>

<script setup lang="ts">
import {
	AmbientLight,
	Camera,
	DirectionalLight,
	Renderer,
	Scene,
	Group,
} from 'troisjs'

// Grid Helper for Three.js
import {GridHelper} from 'three'

import {useDrag} from '~/composables/useDrag'
import {useImageSampler} from '~/composables/useImageSampler'
import {useGameAPI} from '~/composables/useGameAPI'
import Faucet1 from '~/components/Faucet1.vue'
import Faucet2 from '~/components/Faucet2.vue'
import Faucet3 from '~/components/Faucet3.vue'
import ShowerHead from '~/components/ShowerHead.vue'
import {useResizeObserver} from '@vueuse/core'
import type {WaterAmounts} from '~/types/faucet'
import type {vec2} from 'linearly'

const Facets = [Faucet1, Faucet2, Faucet3]

const game = useGameStore()

const renderer = ref<InstanceType<typeof Renderer>>()
const canvas = computed(() => renderer.value?.canvas)

const waterAmounts = ref<WaterAmounts>({hot: 0, cold: 0})

// Randomly select faucet type (1, 2, or 3)
const faucetType = ref(Math.floor(Math.random() * 3) + 1)

const faucet = ref<InstanceType<typeof Faucet2 | typeof Faucet1>>()

// Use image sampler composable for goodness map
const goodnessMapSampler = useImageSampler({
	imageUrl: '/chigyo-games/shower/goodness_map.png',
	interpolate: true,
})

const goodness = computed(() => {
	const {hot, cold} = waterAmounts.value

	if (!goodnessMapSampler.isLoaded.value) {
		return 0
	}

	const uv: vec2 = [cold / 2, 1 - hot / 2]

	return goodnessMapSampler.sampleRGB(uv)[0]
})

const goodWaterAmounts: WaterAmounts = {hot: 0.61328125, cold: 0.40625}

const comment = computed(() => {
	const goodTemperature =
		goodWaterAmounts.hot / (goodWaterAmounts.hot + goodWaterAmounts.cold)
	const goodPressure = goodWaterAmounts.hot + goodWaterAmounts.cold

	if (goodness.value > 0.98) {
		return 'かなり良かったです。'
	} else if (goodness.value > 0.95) {
		return 'だいぶ良かったです。'
	}

	const temperature =
		waterAmounts.value.hot / (waterAmounts.value.hot + waterAmounts.value.cold)

	const pressure = waterAmounts.value.hot + waterAmounts.value.cold

	const tempComment = temperature > goodTemperature ? '熱すぎ' : '冷たすぎ'
	const pressureComment = pressure > goodPressure ? '強すぎ' : '弱すぎ'

	return `${tempComment}だし、<br />シャワー${pressureComment}でした。`
})

// Game data recording
interface WaterRecord {
	hot: number
	cold: number
	goodness: number
}

const waterRecord: WaterRecord[] = []
const {submitGameData} = useGameAPI()

// Record water parameters every frame during gameplay
game.on('tickRecord', frame => {
	waterRecord.push({
		hot: Math.round(waterAmounts.value.hot * 10000),
		cold: Math.round(waterAmounts.value.cold * 10000),
		goodness: Math.round(goodness.value * 10000),
	})
})

// Submit game data when finished
game.on('finish', async () => {
	const hasSaved = !!localStorage.getItem('game__shower')

	// Save to localStorage for backup
	localStorage.setItem(
		'game__shower',
		JSON.stringify({
			faucetType: faucetType.value,
			waterRecord,
		})
	)

	// Submit to API if not saved
	if (!hasSaved) {
		const payload = {
			faucet_type: faucetType.value,
			water_record: waterRecord,
		}

		try {
			await submitGameData('shower', faucetType.value, payload)
			console.log('Shower game data submitted successfully')
		} catch (error) {
			// Error already logged in composable
		}
	}
})

onMounted(async () => {
	// if (renderer.value?.three?.scene) {
	// 	const gridHelper = new GridHelper(2, 8)
	// 	gridHelper.rotation.x = Math.PI / 2
	// 	renderer.value.three.scene.add(gridHelper)
	// }

	// Load the goodness map for fitness calculation
	await goodnessMapSampler.loadImage()
})

// Resize Canvas
function onResize() {
	if (!renderer.value?.canvas) return
	const {width, height} = renderer.value?.canvas.getBoundingClientRect()
	const dpi = window.devicePixelRatio
	renderer.value?.three.setSize(width * dpi, height * dpi)
}

onMounted(onResize)
useResizeObserver(
	computed(() => renderer.value?.canvas),
	onResize
)

useDrag({
	target: canvas,
	onDrag: data => {
		faucet.value?.onDrag(data)
	},
})

game.on('startPreCountdown', resetAllValues)
game.on('reset', resetAllValues)

function resetAllValues() {
	waterAmounts.value = {hot: 0, cold: 0}
	waterRecord.length = 0
	// Reset faucet internal state
	faucet.value?.reset?.()
}

game.on('reset', () => {
	faucetType.value = ((faucetType.value + 1) % 3) + 1
})
</script>

<style lang="stylus">
@import '../assets/style.styl'

body
	background white !important

.Shower
	padding 1rem
	aspect-ratio 1 / 1
	position relative

.shower-renderer
	position absolute
	top 0
	left 0
	width 100%
	height 100%
	background transparent

	&.invalid
		pointer-events none

.touchable
	position absolute
	top 0
	left 0
	width 100%
	height 50%
	z-index 1

.practice-message
	position absolute
	z-index 1
	font-weight bold
	font-size 1.5rem
	pointer-events none
	text-align center
	width max-content
	top 56%
	background-color with-alpha(var(--color-bg), 0.5)
	padding .5em
	border-radius .5em
	border 1px solid var(--color-text)
	left 50%
	transform translate(-50%, -50%)

.result-text
	font-size 1.5rem
	margin-bottom 2rem

.result
	display flex
	flex-direction row
	align-items center
	justify-content center
	position relative
	gap 1rem

	.comment
		font-size 1.4rem
		font-weight bold
		background var(--color-text)
		color var(--color-bg)
		padding .5em
		border-radius .5em
		border 1px solid var(--color-text)
		position relative

		&:after
			content ''
			position absolute
			top 50%
			left 100%
			transform translate(0, -90%)
			border-width 0.5rem
			border-style solid
			border-color transparent transparent transparent var(--color-text)


	.chigyo
		image-rendering pixelated
		width 40%
		align-self end
</style>
