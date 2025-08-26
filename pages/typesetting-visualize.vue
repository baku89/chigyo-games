<template>
	<main class="Main">
		<svg
			class="graph"
			:viewBox="`${minValue} ${-maxValue} ${maxValue - minValue} ${maxValue - minValue}`"
		>
			<defs>
				<marker
					id="arrowhead"
					markerWidth="10"
					markerHeight="7"
					refX="9"
					refY="3.5"
					orient="auto"
				>
					<polygon points="0 0, 10 3.5, 0 7" fill="var(--color-text)" />
				</marker>
			</defs>
			<!-- Axes -->
			<path
				class="axis"
				:d="`M ${minValue} 0 L ${maxValue} 0`"
				marker-end="url(#arrowhead)"
			/>
			<path
				class="axis"
				:d="`M 0 ${-minValue} L 0 ${-maxValue}`"
				marker-end="url(#arrowhead)"
			/>
			<path
				class="reflection"
				:d="`M ${minValue} ${-minValue} L ${maxValue} ${-maxValue}`"
			/>
			<!-- X axis label -->
			<text :x="minValue + 10" y="40" class="axis-label" text-anchor="start">
				ち〜ぎ
			</text>
			<!-- Y axis label -->
			<text
				:x="minValue + 10"
				y="-10"
				class="axis-label"
				text-anchor="start"
				transform="rotate(-90)"
			>
				ぎ〜よ
			</text>
			<!-- Data -->
			<path class="point-cloud" :d="pointCloudPath" />
			<g
				v-if="myCurrentKernings"
				class="my-point"
				:transform="`translate(${myCurrentKernings[0]}, ${-myCurrentKernings[1]})`"
			>
				<circle class="my-point-circle" cx="0" cy="0" r="10" />
				<text class="my-point-label" x="12" y="0">自分</text>
			</g>
		</svg>
	</main>
</template>

<script setup lang="ts">
import {useInterval} from '@vueuse/core'
import {useGameAPI} from '~/composables/useGameAPI'

const {getGameRecords} = useGameAPI()

interface GameTypesettingRecord {
	success: true
	count: number
	records: {
		payload: {
			kernings_record: [number, number][]
		}
	}[]
}

const res = await getGameRecords<GameTypesettingRecord>('typesetting', 50)

const valueRange = computed<[number, number]>(() => {
	return res.records.reduce(
		(range, rec) => {
			return rec.payload.kernings_record.reduce((range, kerning) => {
				const [currentMin, currentMax] = range
				const minValue = Math.min(currentMin, kerning[0], kerning[1])
				const maxValue = Math.max(currentMax, kerning[0], kerning[1])
				return [minValue, maxValue] as [number, number]
			}, range)
		},
		[-100, 100] as [number, number]
	)
})

const minValue = computed(() => valueRange.value[0])
const maxValue = computed(() => valueRange.value[1])

// 秒数をループ
const fps = 30
const gameDuration = 15
const stopDuration = 4

const currentFrame = ref(0)
const currentIndex = computed(() => {
	return Math.min(currentFrame.value, fps * gameDuration - 1)
})

useInterval(1000 / 60, {
	callback() {
		if (currentFrame.value === 0) {
			loadMyKernings()
		}
		currentFrame.value =
			(currentFrame.value + 1) % (fps * (gameDuration + stopDuration))
	},
})

// そのフレームのデータを取得
const currentKernings = computed(() => {
	return res.records
		.map(rec => {
			return rec.payload.kernings_record[currentIndex.value] ?? null
		})
		.filter(kerning => kerning !== null)
})

// 自分自身のデータを取得
const myKernings = ref<[number, number][] | null>(null)

function loadMyKernings() {
	console.log('loadMyKernings')
	myKernings.value = JSON.parse(
		localStorage.getItem('game__typesetting') ?? 'null'
	)
}

const myCurrentKernings = computed(() => {
	return myKernings.value?.[currentIndex.value] ?? null
})

// 点のパスに変更。つまり M 1 2 L 1 2 みたいなの。
const pointCloudPath = computed(() => {
	return currentKernings.value
		.map(([x, y]) => {
			return `M ${x} ${-y} L ${x} ${-y}`
		})
		.join('')
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
	background white

.Main
	main-wrapper()
	aspect-ratio 1 / 1

.graph
	width 100%
	height 100%
	overflow visible

.axis
	stroke var(--color-text)
	stroke-width 2
	vector-effect non-scaling-stroke

.reflection
	stroke white
	stroke-dasharray 1 10
	stroke-width 2
	stroke-linecap round
	vector-effect non-scaling-stroke

text
	font-size 2rem
	fill var(--color-text)

.point-cloud
	fill none
	stroke var(--color-primary)
	stroke-width 10
	stroke-linecap round
	vector-effect non-scaling-stroke

.my-point-circle
	fill var(--color-text)

.my-point-label
	font-weight bold
	fill var(--color-text)
</style>
