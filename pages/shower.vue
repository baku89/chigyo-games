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

		<template #default>
			<main class="Shower">
				<div class="practice-message" v-if="game.state === 'practice'">
					<template v-if="faucetType === 1">
						お湯と水の蛇口をドラッグで回して<br />お湯を出してみよう
					</template>
					<template v-else-if="faucetType === 2">
						温度と水勢のレバーを上下にドラッグして<br />お湯を出してみよう
					</template>
					<template v-else-if="faucetType === 3">
						レバーを上下左右にドラッグして<br />お湯を出してみよう
					</template>
				</div>
				<Renderer
					ref="renderer"
					class="shower-renderer"
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
						<Group :position="{y: 0.15}">
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

const faucetType = ref<1 | 2 | 3>(2)

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

onMounted(async () => {
	if (renderer.value?.three?.scene) {
		const gridHelper = new GridHelper(2, 8)
		gridHelper.rotation.x = Math.PI / 2
		renderer.value.three.scene.add(gridHelper)
	}

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
}
</script>

<style lang="stylus">
@import '../assets/style.styl'

body
	background white !important

.Shower
	padding 1rem
	aspect-ratio 1 / 1

.shower-renderer
	position absolute
	top 0
	left 0
	width 100%
	height 100%
	background transparent


.practice-message
	position absolute
	z-index 1
	font-weight bold
	font-size 1.2rem
	text-align center
	width fit-content
	top 60%
	background-color with-alpha(var(--color-bg), 0.5)
	padding .5em
	border-radius .5em
	border 1px solid var(--color-text)
	left 50%
	transform translate(-50%, -50%)
</style>
