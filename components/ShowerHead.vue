<template>
	<Group>
		<FbxModel
			src="/chigyo-games/shower/shower_head.fbx"
			:position="{x: -0.1, y: 0.7}"
			@load="setupMetalicMaterial"
		/>
		<!-- Water Particles using simple Mesh instances -->
		<Group v-if="waterParticles.length > 0" :position="{x: -0.1, y: 0.5}">
			<Mesh
				v-for="(particle, index) in waterParticles"
				:key="index"
				:position="{
					x: particle.position[0],
					y: particle.position[1],
					z: particle.position[2],
				}"
			>
				<SphereGeometry :radius="0.01" />
				<BasicMaterial :color="particle.color" />
			</Mesh>
		</Group>
	</Group>
</template>

<script setup lang="ts">
import {FbxModel, Group, Mesh, SphereGeometry, BasicMaterial} from 'troisjs'
import {setupMetalicMaterial} from '~/utils/faucetsMaterial'
import type {WaterAmounts} from '~/types/faucet'
import {scalar, vec2, vec3} from 'linearly'
import chroma from 'chroma-js'

// Props
interface Props {
	waterAmounts: WaterAmounts
}

const props = defineProps<Props>()

// Water calculations
const totalWater = computed(
	() => props.waterAmounts.hot + props.waterAmounts.cold
)

const hotRatio = computed(() =>
	totalWater.value > 0 ? props.waterAmounts.hot / totalWater.value : 0
)

// Particle spawn rate based on water pressure/amount
const particleSpawnRate = computed(() => {
	// particles per second based on total water
	return totalWater.value * 500 // e.g., pressure 2 = 200 particles/sec
})

// Particle data structure using linearly vec format
interface WaterParticle {
	position: vec3
	velocity: vec3
	color: string
}

// Create reactive particles array
const waterParticles = ref<WaterParticle[]>([])

// Color interpolation function using chroma.js
function interpolateColor(ratio: number): string {
	// Clamp ratio between 0 and 1
	const t = Math.max(0, Math.min(1, ratio))

	// Cold color (blue): #4ecdc4, Hot color (red): #ff6b6b
	const coldColor = '#4ecdc4'
	const hotColor = '#ff6b6b'

	// Create color scale using chroma.js with better interpolation
	const colorScale = chroma.scale([coldColor, hotColor]).mode('lch')

	return colorScale(t).hex()
}

// Create a new particle with realistic physics
function createParticle(): WaterParticle {
	// Generate position on a disk (shower head outlet)
	const diskRadius = 0.25 // Shower head outlet radius
	const diskAngle = Math.random() * 360 // 0-360 degrees
	const diskDistance = Math.sqrt(Math.random()) * diskRadius // Uniform distribution on disk

	// Position on disk using linearly (degrees)
	const diskPosition = vec2.dir(diskAngle, diskDistance)
	const [diskX, diskZ] = diskPosition

	// Disk normal direction (downward with some spread)
	const spreadAngleDeg = 20 // ~0.3 radians in degrees
	const normalAngleX = (Math.random() - 0.5) * spreadAngleDeg
	const normalAngleZ = (Math.random() - 0.5) * spreadAngleDeg

	// Initial velocity in normal direction with some randomness
	const initialSpeed = 0.02 + Math.random() * 0.01 // Base speed + variation

	// Convert spread angles to radians for velocity calculation
	const normalAngleXRad = scalar.rad(normalAngleX)
	const normalAngleZRad = scalar.rad(normalAngleZ)

	const velocity: vec3 = [
		Math.sin(normalAngleXRad),
		-Math.cos(Math.sqrt(normalAngleXRad ** 2 + normalAngleZRad ** 2)),
		Math.sin(normalAngleZRad),
	]

	return {
		position: [diskX, 0.2, diskZ], // Start at shower head level
		velocity: vec3.scale(velocity, initialSpeed),
		color: interpolateColor(hotRatio.value), // Interpolated color based on hot ratio
	}
}

// Particle spawning variables
let lastSpawnTime = 0
let particleAccumulator = 0

// Spawn particles based on spawn rate
function spawnParticles(currentTime: number) {
	if (particleSpawnRate.value <= 0) return

	const deltaTime = (currentTime - lastSpawnTime) / 1000 // Convert to seconds
	lastSpawnTime = currentTime

	// Accumulate particles to spawn
	particleAccumulator += particleSpawnRate.value * deltaTime

	// Spawn whole particles
	const particlesToSpawn = Math.floor(particleAccumulator)
	particleAccumulator -= particlesToSpawn

	for (let i = 0; i < particlesToSpawn; i++) {
		waterParticles.value.push(createParticle())
	}
}

// Animation loop using requestAnimationFrame
let animationId: number | null = null

function animate(currentTime: number) {
	// Spawn new particles based on spawn rate
	spawnParticles(currentTime)

	// Update particle positions and apply physics using linearly
	waterParticles.value.forEach(particle => {
		// Apply gravity (gravity vector: [0, -0.0005, 0])
		const gravity: [number, number, number] = [0, -0.0005, 0]
		const newVelocity = vec3.add(particle.velocity, gravity)
		particle.velocity = [newVelocity[0], newVelocity[1], newVelocity[2]]

		// Update position based on velocity
		const newPosition = vec3.add(particle.position, particle.velocity)
		particle.position = [newPosition[0], newPosition[1], newPosition[2]]
	})

	// Remove particles that have fallen below y = -1
	waterParticles.value = waterParticles.value.filter(
		particle => particle.position[1] > -1.0 // y is index 1
	)

	animationId = requestAnimationFrame(animate)
}

// Start animation when component is mounted
onMounted(() => {
	lastSpawnTime = performance.now()
	animate(lastSpawnTime)
})

onUnmounted(() => {
	if (animationId) {
		cancelAnimationFrame(animationId)
	}
})
</script>
