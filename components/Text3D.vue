<template>
	<Group>
		<Mesh ref="meshRef" :position="position">
			<PlaneGeometry :width="textWidth" :height="textHeight" />
			<BasicMaterial ref="materialRef" color="red" />
		</Mesh>
	</Group>
</template>

<script setup lang="ts">
import {Group, Mesh, PlaneGeometry, BasicMaterial} from 'troisjs'
import * as THREE from 'three'

interface Props {
	text: string
	position: {x: number; y: number; z: number}
}

const props = defineProps<Props>()

const materialRef = ref<InstanceType<typeof BasicMaterial> | null>(null)
const meshRef = ref()

// Inject camera position from parent
const cameraPosition = inject('cameraPosition', ref({x: 0, y: 0, z: 5}))

// Update mesh rotation to look at camera
const updateMeshLookAt = () => {
	if (meshRef.value?.mesh && cameraPosition.value) {
		const camera = new THREE.Vector3(
			cameraPosition.value.x,
			cameraPosition.value.y,
			cameraPosition.value.z
		)
		meshRef.value.mesh.lookAt(camera)
	}
}

// Override material properties after mount
onMounted(() => {
	if (materialRef.value?.material) {
		const material = materialRef.value.material as THREE.MeshBasicMaterial
		material.side = THREE.DoubleSide
		material.map = textTexture.value
		material.transparent = true
		material.needsUpdate = true
	}

	// Set up animation loop for billboard behavior
	const animate = () => {
		updateMeshLookAt()
		requestAnimationFrame(animate)
	}
	animate()
})

// Create canvas texture with text
const textTexture = computed(() => {
	// Create canvas
	const canvas = document.createElement('canvas')
	const context = canvas.getContext('2d')

	if (!context) return null

	const fontSize = 96
	const fontFamily = "'Zen Kaku Gothic New', sans-serif"

	// Set font
	context.font = `${fontSize}px ${fontFamily}`

	// Measure text
	const metrics = context.measureText(props.text)
	const textWidth = metrics.width
	const textHeight = fontSize * 1.2 // Add some padding

	// Set canvas size (power of 2 for better performance)
	canvas.width = Math.max(64, Math.pow(2, Math.ceil(Math.log2(textWidth + 20))))
	canvas.height = Math.max(
		64,
		Math.pow(2, Math.ceil(Math.log2(textHeight + 10)))
	)

	// Clear and set background
	context.clearRect(0, 0, canvas.width, canvas.height)

	// Set text properties
	context.font = `${fontSize}px ${fontFamily}`
	context.fillStyle = '#000000'
	context.textAlign = 'center'
	context.textBaseline = 'middle'

	// Draw text
	context.fillText(props.text, canvas.width / 2, canvas.height / 2)

	// Create texture
	const texture = new THREE.CanvasTexture(canvas)
	texture.needsUpdate = true

	return texture
})

// Watch for texture changes and update material
watch(
	() =>
		[
			textTexture.value,
			materialRef.value?.material as THREE.MeshBasicMaterial,
		] as const,
	([newTexture, material]) => {
		if (material && newTexture) {
			material.map = newTexture
			material.needsUpdate = true
		}
	}
)

// Calculate text dimensions based on canvas aspect ratio
const textAspectRatio = computed(() => {
	if (!textTexture.value) return 1

	const canvas = textTexture.value.image as HTMLCanvasElement
	return canvas.width / canvas.height
})

const textWidth = computed(() => {
	return 0.2 * textAspectRatio.value
})

const textHeight = computed(() => {
	return 0.2
})

// Clean up texture when component unmounts
onUnmounted(() => {
	if (textTexture.value) {
		textTexture.value.dispose()
	}
})
</script>
