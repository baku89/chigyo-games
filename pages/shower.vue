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
				<h1>稚魚シャワー</h1>
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
							:intensity="1"
						/>
						<Group :position="{y: -0.5}">
							<Faucet2
								ref="faucet2"
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
import type Faucet2 from '~/components/Faucet2.vue'
import {useResizeObserver} from '@vueuse/core'

const renderer = ref<InstanceType<typeof Renderer>>()
const canvas = computed(() => renderer.value?.canvas)

const waterAmounts = reactive({hot: 0, cold: 0})

const faucet2 = ref<InstanceType<typeof Faucet2>>()

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
		faucet2.value?.onDrag(data)
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
