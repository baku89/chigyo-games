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
import Faucet1 from '~/components/Faucet1.vue'
import Faucet2 from '~/components/Faucet2.vue'
import Faucet3 from '~/components/Faucet3.vue'
import ShowerHead from '~/components/ShowerHead.vue'
import {useResizeObserver} from '@vueuse/core'
import type {WaterAmounts} from '~/types/faucet'

const Facets = [Faucet1, Faucet2, Faucet3]

const renderer = ref<InstanceType<typeof Renderer>>()
const canvas = computed(() => renderer.value?.canvas)

const waterAmounts = ref<WaterAmounts>({hot: 0, cold: 0})

const faucetType = ref<1 | 2 | 3>(2)

const faucet = ref<InstanceType<typeof Faucet2 | typeof Faucet1>>()

onMounted(() => {
	if (renderer.value?.three?.scene) {
		const gridHelper = new GridHelper(2, 8)
		gridHelper.rotation.x = Math.PI / 2
		renderer.value.three.scene.add(gridHelper)
	}
})

// Resize Canvas
function onResize() {
	if (!renderer.value?.canvas) return
	const {width, height} = renderer.value?.canvas.getBoundingClientRect()
	console.log(width, height)
	const dpi = window.devicePixelRatio
	renderer.value?.three.setSize(width * dpi, height * dpi)
}

onMounted(onResize)
useResizeObserver(
	computed(() => renderer.value?.canvas),
	onResize
)

watchEffect(() => {
	console.log(toRaw(waterAmounts))
})

useDrag({
	target: canvas,
	onDrag: data => {
		faucet.value?.onDrag(data)
	},
})
</script>

<style lang="stylus">
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
</style>
