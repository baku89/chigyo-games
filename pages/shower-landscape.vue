<template>
	<main class="Main">
		<div class="visualization-container">
			<Renderer
				ref="renderer"
				class="three-renderer"
				:antialias="true"
				:alpha="true"
				:resize="true"
				:orbit-ctrl="true"
			>
				<Camera
					:position="{x: 4, y: 4, z: 4}"
					:fov="60"
					:look-at="{x: 1, y: 1, z: 1}"
				/>
				<Scene>
					<AmbientLight :intensity="0.6" />
					<DirectionalLight
						:position="{x: 10, y: 10, z: 10}"
						:intensity="0.8"
					/>

					<!-- Coordinate system axes -->
					<Group>
						<!-- X-axis (Cold) - Red -->
						<Mesh :position="{x: 1, y: 0, z: 0}">
							<CylinderGeometry
								:radiusTop="0.02"
								:radiusBottom="0.02"
								:height="2"
							/>
							<BasicMaterial color="#ff0000" />
						</Mesh>
						<!-- Y-axis (Hot) - Green -->
						<Mesh :position="{x: 0, y: 1, z: 0}">
							<CylinderGeometry
								:radiusTop="0.02"
								:radiusBottom="0.02"
								:height="2"
							/>
							<BasicMaterial color="#00ff00" />
						</Mesh>
						<!-- Z-axis (Goodness) - Blue -->
						<Mesh :position="{x: 0, y: 0, z: 1}">
							<CylinderGeometry
								:radiusTop="0.02"
								:radiusBottom="0.02"
								:height="2"
							/>
							<BasicMaterial color="#0000ff" />
						</Mesh>
					</Group>

					<!-- Grid planes for reference -->
					<Group>
						<!-- XY plane (Cold-Hot plane) -->
						<Mesh :position="{x: 1, y: 1, z: 0}" :rotation="{x: 0, y: 0, z: 0}">
							<PlaneGeometry :width="2" :height="2" />
							<BasicMaterial
								color="#444444"
								:transparent="true"
								:opacity="0.1"
							/>
						</Mesh>
						<!-- XZ plane (Cold-Goodness plane) -->
						<Mesh
							:position="{x: 1, y: 0, z: 1}"
							:rotation="{x: Math.PI / 2, y: 0, z: 0}"
						>
							<PlaneGeometry :width="2" :height="2" />
							<BasicMaterial
								color="#444444"
								:transparent="true"
								:opacity="0.1"
							/>
						</Mesh>
						<!-- YZ plane (Hot-Goodness plane) -->
						<Mesh
							:position="{x: 0, y: 1, z: 1}"
							:rotation="{x: 0, y: Math.PI / 2, z: 0}"
						>
							<PlaneGeometry :width="2" :height="2" />
							<BasicMaterial
								color="#444444"
								:transparent="true"
								:opacity="0.1"
							/>
						</Mesh>
					</Group>

					<!-- Data points -->
					<Group>
						<Mesh
							v-for="(point, index) in currentDataPoints"
							:key="index"
							:position="point.position"
						>
							<SphereGeometry :radius="point.radius" />
							<BasicMaterial
								:color="point.color"
								:transparent="true"
								:opacity="point.opacity"
							/>
						</Mesh>
					</Group>

					<!-- User's current point -->
					<Group v-if="myCurrentData">
						<Mesh :position="myCurrentPosition">
							<SphereGeometry :radius="0.08" />
							<BasicMaterial color="#ffffff" />
						</Mesh>
						<!-- Wireframe sphere around user point -->
						<Mesh :position="myCurrentPosition">
							<SphereGeometry :radius="0.1" />
							<BasicMaterial color="#ffffff" :wireframe="true" />
						</Mesh>
					</Group>
				</Scene>
			</Renderer>
		</div>
	</main>
</template>

<script setup lang="ts">
import {useEventListener, useInterval} from '@vueuse/core'
import {scalar, vec2, vec3} from 'linearly'
import {useGameAPI} from '~/composables/useGameAPI'
import chroma from 'chroma-js'
import {
	Renderer,
	Camera,
	Scene,
	Group,
	Mesh,
	SphereGeometry,
	CylinderGeometry,
	PlaneGeometry,
	BasicMaterial,
	AmbientLight,
	DirectionalLight,
} from 'troisjs'

const {getGameRecords} = useGameAPI()

interface WaterRecord {
	hot: number
	cold: number
	goodness: number
}

interface GameShowerRecord {
	success: true
	count: number
	records: {
		player_type: number
		payload: {
			faucet_type: number
			water_record: WaterRecord[]
		}
	}[]
}

// Fetch server data for each faucet type
const faucetData = ref<{[key: number]: GameShowerRecord['records']}>({})

// Load data for all faucet types
const loadAllFaucetData = async () => {
	for (let faucetType = 1; faucetType <= 3; faucetType++) {
		try {
			const res = await getGameRecords<GameShowerRecord>(
				'shower',
				100,
				faucetType
			)
			faucetData.value[faucetType] = res.records
		} catch (error) {
			console.error(`Failed to load data for faucet type ${faucetType}:`, error)
			faucetData.value[faucetType] = []
		}
	}
}

await loadAllFaucetData()

// Filter controls
const selectedFaucetType = ref<number>(0) // 0 = all, 1-3 = specific types

const filteredRecords = computed(() => {
	if (selectedFaucetType.value === 0) {
		// Return all records from all faucet types
		return Object.values(faucetData.value).flat()
	}
	return faucetData.value[selectedFaucetType.value] || []
})

// Animation setup
const fps = 30
const gameDuration = 15
const stopDuration = 4
const totalFrames = fps * gameDuration

const currentFrame = ref(0)
const currentIndex = computed(() => {
	return Math.min(currentFrame.value, totalFrames - 1)
})

useInterval(1000 / 60, {
	callback() {
		if (currentFrame.value === 0) {
			loadMyData()
		}
		currentFrame.value =
			(currentFrame.value + 1) % (fps * (gameDuration + stopDuration))
	},
})

// Transform functions for 3D coordinate mapping
const transform3D = (waterData: WaterRecord): vec3 => {
	// Map from game coordinates (0-2 range) to 3D space (0-2 range)
	return [
		waterData.cold, // X-axis: Cold
		waterData.hot, // Y-axis: Hot
		waterData.goodness * 2, // Z-axis: Goodness (0-1 -> 0-2)
	]
}

// Faucet type colors
const faucetColors = {
	1: '#ff6b6b', // Red for Faucet 1
	2: '#4ecdc4', // Teal for Faucet 2
	3: '#ffe66d', // Yellow for Faucet 3
}

// Color scale for goodness
const goodnessColorScale = chroma
	.scale(['#ff4422', '#ffaa00', '#22ff44'])
	.mode('lch')

// Current frame data points for 3D visualization
const currentDataPoints = computed(() => {
	const points: Array<{
		position: {x: number; y: number; z: number}
		radius: number
		color: string
		opacity: number
		faucetType: number
	}> = []

	// Process each faucet type separately to maintain color coding
	Object.entries(faucetData.value).forEach(([faucetType, records]) => {
		const typeNum = parseInt(faucetType)

		// Only include this faucet type if it's selected or if "All Types" is selected
		if (
			selectedFaucetType.value !== 0 &&
			selectedFaucetType.value !== typeNum
		) {
			return
		}

		records.forEach(record => {
			const waterData = record.payload.water_record[currentIndex.value]
			if (waterData) {
				const [x, y, z] = transform3D(waterData)

				points.push({
					position: {x, y, z},
					radius: 0.05,
					color: faucetColors[typeNum as keyof typeof faucetColors],
					opacity: 0.7,
					faucetType: typeNum,
				})
			}
		})
	})

	return points
})

// User's data
const myData = ref<{
	faucetType: number
	waterRecord: WaterRecord[]
} | null>(null)

function loadMyData() {
	const stored = localStorage.getItem('game__shower')
	if (stored) {
		try {
			myData.value = JSON.parse(stored)
		} catch (error) {
			console.error('Failed to parse user data:', error)
			myData.value = null
		}
	} else {
		myData.value = null
	}
}

const myCurrentData = computed(() => {
	return myData.value?.waterRecord[currentIndex.value] ?? null
})

const myCurrentPosition = computed(() => {
	if (!myCurrentData.value) return {x: 0, y: 0, z: 0}
	const [x, y, z] = transform3D(myCurrentData.value)
	return {x, y, z}
})

// Listen for localStorage updates
useEventListener('storage', event => {
	if (event.key === 'game__shower') {
		console.log('localStorage updated')
		currentFrame.value = 0
	}
})

// Load initial data
onMounted(() => {
	loadMyData()
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
	background var(--color-bg)

.Main
	main-wrapper()
	display flex
	flex-direction column
	gap 1rem
	max-width 90vw
	max-height 90vh

.visualization-container
	position relative
	width 100%
	max-width 800px
	aspect-ratio 1 / 1

.three-renderer
	width 100%
	height 100%
	border 1px solid var(--color-border)
	background var(--color-bg)
</style>
