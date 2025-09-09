<template>
	<Group>
		<!-- Arrow shaft -->
		<Mesh :position="shaftPosition" :rotation="shaftRotation">
			<CylinderGeometry
				:radiusTop="0.01"
				:radiusBottom="0.01"
				:height="arrowLength"
			/>
			<BasicMaterial color="#000000" />
		</Mesh>

		<!-- Arrow head -->
		<Mesh :position="headPosition" :rotation="headRotation">
			<ConeGeometry :radius="0.04" :height="0.1" />
			<BasicMaterial color="#000000" />
		</Mesh>

		<!-- Text label -->
		<Text3D v-if="label" :text="label" :position="labelPosition" />
	</Group>
</template>

<script setup lang="ts">
import {
	Group,
	Mesh,
	CylinderGeometry,
	ConeGeometry,
	BasicMaterial,
} from 'troisjs'
import {vec3} from 'linearly'
import Text3D from '~/components/Text3D.vue'

interface Props {
	from: {x: number; y: number; z: number}
	to: {x: number; y: number; z: number}
	label?: string
}

const props = defineProps<Props>()

// Calculate arrow vector and properties
const arrowVector = computed(() => {
	return vec3.subtract(
		[props.to.x, props.to.y, props.to.z],
		[props.from.x, props.from.y, props.from.z]
	)
})

const arrowLength = computed(() => {
	return vec3.length(arrowVector.value) - 0.1
})

const arrowDirection = computed(() => {
	return vec3.normalize(arrowVector.value)
})

// Calculate shaft position (center of cylinder)
const shaftPosition = computed(() => {
	const shaftCenter = vec3.add(
		[props.from.x, props.from.y, props.from.z],
		vec3.scale(arrowDirection.value, arrowLength.value / 2)
	)
	return {
		x: shaftCenter[0],
		y: shaftCenter[1],
		z: shaftCenter[2],
	}
})

// Calculate shaft rotation to align with arrow direction
const shaftRotation = computed(() => {
	const direction = arrowDirection.value

	// Calculate rotation to align Y-axis (cylinder default) with arrow direction
	const yAxis = [0, 1, 0] as vec3

	// Handle special cases for axis-aligned arrows
	if (Math.abs(direction[0]) > 0.999) {
		// X-axis arrow
		return direction[0] > 0
			? {x: 0, y: 0, z: -Math.PI / 2}
			: {x: 0, y: 0, z: Math.PI / 2}
	} else if (Math.abs(direction[1]) > 0.999) {
		// Y-axis arrow
		return direction[1] > 0 ? {x: 0, y: 0, z: 0} : {x: Math.PI, y: 0, z: 0}
	} else if (Math.abs(direction[2]) > 0.999) {
		// Z-axis arrow
		return direction[2] > 0
			? {x: Math.PI / 2, y: 0, z: 0}
			: {x: -Math.PI / 2, y: 0, z: 0}
	}

	// For arbitrary directions, use more robust rotation calculation
	const angle = Math.acos(Math.min(1, Math.max(-1, vec3.dot(yAxis, direction))))

	if (angle < 0.001) {
		return {x: 0, y: 0, z: 0}
	} else if (angle > Math.PI - 0.001) {
		return {x: Math.PI, y: 0, z: 0}
	}

	// Use cross product to find rotation axis
	const axis = vec3.normalize(vec3.cross(yAxis, direction))

	// Convert to Euler angles (simplified)
	return {
		x: axis[0] * angle,
		y: 0,
		z: axis[2] * angle,
	}
})

// Calculate head position
const headPosition = computed(() => {
	const headCenter = vec3.add(
		[props.from.x, props.from.y, props.from.z],
		vec3.scale(arrowDirection.value, arrowLength.value + 0.1 / 2)
	)
	return {
		x: headCenter[0],
		y: headCenter[1],
		z: headCenter[2],
	}
})

// Head uses same rotation as shaft
const headRotation = computed(() => shaftRotation.value)

// Calculate label position (slightly beyond arrow tip)
const labelPosition = computed(() => {
	if (!props.label) return {x: 0, y: 0, z: 0}

	const labelPos = vec3.add(
		[props.to.x, props.to.y, props.to.z],
		vec3.scale(arrowDirection.value, 0.2)
	)
	return {
		x: labelPos[0],
		y: labelPos[1],
		z: labelPos[2],
	}
})
</script>
