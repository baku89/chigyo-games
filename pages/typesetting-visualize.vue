<template>
	<main class="Main">
		<svg class="graph" viewBox="0 0 1000 1000">
			<defs>
				<marker
					id="arrowhead"
					markerWidth="40"
					markerHeight="28"
					markerUnits="userSpaceOnUse"
					refX="36"
					refY="14"
					orient="auto"
				>
					<polygon points="0 0, 40 14, 0 28" fill="var(--color-text)" />
				</marker>
			</defs>
			<!-- Axes -->
			<path class="x-equals-y" :d="xEqualsY" />
			<path class="axis" :d="axisX" />
			<path class="axis" :d="axisY" />
			<!-- X axis label -->
			<text x="0" y="500" class="axis-label" text-anchor="start">ち〜ぎ</text>
			<!-- Y axis label -->
			<text
				x="0"
				y="500"
				class="axis-label"
				text-anchor="start"
				:transform-origin="transform([0, 0])"
				transform="rotate(-90)"
			>
				ぎ〜よ
			</text>
			<!-- Data -->
			<path class="point-cloud" :d="pointCloudPath" />
			<g
				v-if="myCurrentKernings"
				class="my-point"
				:transform="myPointTransform"
			>
				<circle class="my-point-circle" cx="0" cy="0" r="10" />
				<text class="my-point-label" x="12" y="0">自分</text>
			</g>
		</svg>
	</main>
</template>

<script setup lang="ts">
import {useEventListener, useInterval} from '@vueuse/core'
import {scalar, vec2} from 'linearly'
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

const res = await getGameRecords<GameTypesettingRecord>('typesetting', 100)

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

const transform = computed<(pos: vec2) => string>(() => {
	const [minValue, maxValue] = valueRange.value
	return (pos: vec2) =>
		vec2
			.efit(
				pos,
				[minValue, minValue],
				[maxValue, maxValue],
				[0, 1000],
				[1000, 0]
			)
			.join(' ')
})

const axisX = computed(() => {
	const [min, max] = valueRange.value
	const xform = transform.value
	return `M ${xform([min, 0])} L ${xform([max, 0])}`
})

const axisY = computed(() => {
	const [min, max] = valueRange.value
	const yform = transform.value
	return `M ${yform([0, min])} L ${yform([0, max])}`
})

const xEqualsY = computed(() => {
	const [min, max] = valueRange.value
	const xform = transform.value
	return `M ${xform([min, min])} L ${xform([max, max])}`
})

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
	myKernings.value = JSON.parse(
		localStorage.getItem('game__typesetting') ?? 'null'
	)
}

const myCurrentKernings = computed(() => {
	return myKernings.value?.[currentIndex.value] ?? null
})

// 点のパスに変更。つまり M 1 2 L 1 2 みたいなの。
const pointCloudPath = computed(() => {
	const xform = transform.value
	return currentKernings.value
		.map(pos => {
			const transformed = xform(pos)
			return `M ${transformed} L ${transformed}`
		})
		.join('')
})

const myPointTransform = computed(() => {
	if (!myCurrentKernings.value) return ''
	const xform = transform.value
	const transformed = xform(myCurrentKernings.value)
	return `translate(${transformed})`
})

useEventListener('storage', event => {
	if (event.key === 'game__typesetting') {
		console.log('localstorage updated')
		currentFrame.value = 0
	}
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

.Main
	main-wrapper()
	aspect-ratio 1 / 1

.graph
	width 100%
	aspect-ratio 1 / 1
	overflow visible

path
	stroke-linecap round
	vector-effect non-scaling-stroke

.axis
	stroke var(--color-text)
	stroke-width 2
	marker-end url(#arrowhead)

.x-equals-y
	stroke white
	stroke-dasharray 5 5
	stroke-width 2

text
	font-size 24px
	font-weight bold
	fill var(--color-text)

.point-cloud
	fill none
	stroke var(--color-primary)
	stroke-width 10

.my-point-circle
	fill var(--color-text)

.my-point-label
	fill var(--color-text)
</style>
