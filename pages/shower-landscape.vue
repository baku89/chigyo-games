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
					ref="cameraRef"
					:position="{x: -6, y: 3, z: 4}"
					:fov="30"
					:look-at="{x: 0, y: 0, z: 0}"
				/>
				<Scene>
					<AmbientLight :intensity="0.6" />
					<DirectionalLight
						:position="{x: 10, y: 10, z: 10}"
						:intensity="0.8"
					/>

					<Group :position="{x: -1, z: -1}">
						<AxisArrow
							:from="{x: 0, y: 0, z: 0}"
							:to="{x: 2, y: 0, z: 0}"
							label="お湯"
						/>
						<AxisArrow
							:from="{x: 0, y: 0, z: 0}"
							:to="{x: 0, y: 1, z: 0}"
							label="よさ"
						/>
						<AxisArrow
							:from="{x: 0, y: 0, z: 0}"
							:to="{x: 0, y: 0, z: 2}"
							label="水"
						/>

						<!-- Data points -->
						<Group>
							<Mesh
								v-for="(point, index) in currentDataPoints"
								:key="index"
								:position="point.position"
							>
								<SphereGeometry :radius="0.02" />
								<BasicMaterial :color="point.color" />
							</Mesh>
						</Group>

						<!-- User's current point -->
						<Group v-if="myData && myCurrentData">
							<Mesh :position="myCurrentPosition">
								<SphereGeometry :radius="0.06" />
								<BasicMaterial :color="faucetColors[myData.faucetType ?? 2]" />
							</Mesh>
						</Group>

						<!-- Terrain wireframe -->
						<Mesh
							ref="terrainMeshRef"
							:position="{x: 1, z: 1}"
							:rotation="{x: -Math.PI / 2, y: 0, z: 0}"
						/>
					</Group>
				</Scene>
			</Renderer>
		</div>
	</main>
</template>

<script setup lang="ts">
import {useCssVar, useEventListener, useInterval} from '@vueuse/core'
import {vec2, vec3} from 'linearly'
import {useGameAPI} from '~/composables/useGameAPI'
import {useImageSampler} from '~/composables/useImageSampler'
import {
	Renderer,
	Camera,
	Scene,
	Group,
	Mesh,
	SphereGeometry,
	BasicMaterial,
	AmbientLight,
	DirectionalLight,
} from 'troisjs'
import * as THREE from 'three'
import AxisArrow from '~/components/AxisArrow.vue'

const {getGameRecords} = useGameAPI()

// Camera ref and position provider for child components
const cameraRef = ref()
const cameraPosition = ref({x: -6, y: 3, z: 4})
provide('cameraPosition', cameraPosition)

// Update camera position for child components
onMounted(() => {
	const updateCameraPosition = () => {
		if (cameraRef.value?.camera) {
			cameraPosition.value = {
				x: cameraRef.value.camera.position.x,
				y: cameraRef.value.camera.position.y,
				z: cameraRef.value.camera.position.z,
			}
		}
		requestAnimationFrame(updateCameraPosition)
	}
	updateCameraPosition()
})

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
	// Data is scaled by 10000, so divide to get original values
	// Map from game coordinates (0-2 range) to 3D space (0-2 range)
	const hot = waterData.hot / 10000
	const cold = waterData.cold / 10000
	const goodness = waterData.goodness / 10000 / 2

	return [
		hot, // X-axis: Hot
		goodness * 1, // Y-axis: Goodness (0-1 -> 0-2)
		cold, // Z-axis: Cold
	]
}

// Faucet type colors
const faucetColors: Record<number, string> = {
	1: '#ff6b6b', // Red for Faucet 1
	2: '#4ecdc4', // Teal for Faucet 2
	3: '#ffe66d', // Yellow for Faucet 3
}

// Current frame data points for 3D visualization
const currentDataPoints = computed(() => {
	const points: Array<{
		position: {x: number; y: number; z: number}
		color: string
	}> = []

	// Process each faucet type separately to maintain color coding
	Object.entries(faucetData.value).forEach(([faucetType, records]) => {
		const typeNum = parseInt(faucetType)

		records.forEach(record => {
			const waterData = record.payload.water_record[currentIndex.value]
			if (waterData) {
				const [x, y, z] = transform3D(waterData)

				points.push({
					position: {x, y, z},
					color: faucetColors[typeNum]!,
				})
			}
		})
	})

	return points
})

// Initialize image sampler for terrain
const goodnessMapSampler = useImageSampler({
	imageUrl: '/chigyo-games/shower/goodness_map.png',
	interpolate: true,
})

onMounted(async () => {
	await goodnessMapSampler.loadImage()

	createTerrain()
})

// Terrain geometry
const terrainMeshRef = ref<InstanceType<typeof Mesh> | null>(null)

// Create terrain from goodness map
async function createTerrain() {
	// Create plane geometry with subdivisions
	const segments = 80
	const geometry = new THREE.PlaneGeometry(2, 2, segments - 1, segments - 1)

	// Modify vertices based on height map
	const vertices = geometry.attributes.position!.array as Float32Array
	console.log(vertices.length)
	for (let i = 0; i < vertices.length; i += 3) {
		const hot = vertices[i]!
		const cold = vertices[i + 1]!
		// Convert from geometry space (-1 to 1) to image space (0 to 1)
		const uv = vec2.fit([cold, hot], [-1, -1], [1, 1], [1, 1], [0, 0])
		const u = (cold + 1) / 2
		// const v = 1 - (z + 1) / 2 // Flip V coordinate
		// // Sample height using useImageSampler
		const rgb = goodnessMapSampler.sampleRGB(uv)
		const height = rgb[0] // Use red channel as height
		// Set Y coordinate (height) with some scale
		vertices[i + 2] = height / 2 // Scale height
	}

	geometry.attributes.position!.needsUpdate = true
	geometry.computeVertexNormals()

	// Create wireframe material
	const material = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		wireframe: true,
		transparent: true,
		opacity: 0.1,
	})

	// Set geometry and material to mesh
	if (terrainMeshRef.value?.mesh) {
		terrainMeshRef.value.mesh.geometry = geometry
		terrainMeshRef.value.mesh.material = material
	}
}

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

const borderColor = useCssVar('--color-border')

const renderer = ref<InstanceType<typeof Renderer> | null>(null)
onMounted(() => {
	if (renderer.value?.three?.scene) {
		const gridHelper = new THREE.GridHelper(
			2,
			10,
			borderColor.value,
			borderColor.value
		)
		renderer.value.three.scene.add(gridHelper)
	}
})

// Load initial data
onMounted(async () => {
	loadMyData()

	await loadAllFaucetData()
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
