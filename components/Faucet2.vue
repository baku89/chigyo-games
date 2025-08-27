<template>
	<FbxModel src="/chigyo-games/shower/faucet2_body.fbx" @load="setupMaterial" />
	<FbxModel
		src="/chigyo-games/shower/faucet2_ratio.fbx"
		@load="setupMaterial"
		:rotation="{x: scalar.rad(scalar.lerp(90, -90, ratio))}"
	/>
	<FbxModel
		src="/chigyo-games/shower/faucet2_pressure.fbx"
		@load="setupMaterial"
		:rotation="{x: scalar.rad(scalar.fit(pressure, 0, 2, -90, 90))}"
	/>
</template>

<script setup lang="ts">
import {scalar} from 'linearly'
import type {Group as ThreeGroup, Mesh} from 'three'
import {
	MeshStandardMaterial,
	TextureLoader,
	EquirectangularReflectionMapping,
} from 'three'
import {FbxModel} from 'troisjs'

import type {DragData} from '~/composables/useDrag'
import type {WaterAmounts} from '~/types/faucet'

const emit = defineEmits<{
	(e: 'update:waterAmounts', value: WaterAmounts): void
}>()

const material = new MeshStandardMaterial({
	color: 0xffffff,
	metalness: 0.8, // 金属感を強化
	roughness: 0.2, // 滑らかにして反射を強化
})

function setupMaterial(group: ThreeGroup) {
	// Load 2:1 equirectangular image as environment map
	const loader = new TextureLoader()
	loader.load('/chigyo-games/shower/studio023.jpg', texture => {
		texture.mapping = EquirectangularReflectionMapping

		// Apply to all meshes once loaded
		group.traverse((obj: any) => {
			if (obj?.isMesh) {
				const mesh = obj as Mesh
				if (mesh.material instanceof MeshStandardMaterial) {
					mesh.material.envMap = texture
					mesh.material.needsUpdate = true
				}
			}
		})
	})

	group.traverse((obj: any) => {
		if (obj?.isMesh) {
			const mesh = obj as Mesh
			mesh.material = material
		}
	})
}

const ratio = ref(0) // 0: cold, 1: hot
const pressure = ref(0) // 0: none, 1: max

function onDrag(data: DragData) {
	if (data.initial[0] < 0) {
		ratio.value = scalar.clamp(ratio.value - data.delta[1], 0, 1)
	} else {
		pressure.value = scalar.clamp(pressure.value + data.delta[1], 0, 2)
	}
}

const waterAmounts = computed<WaterAmounts>(() => {
	return {
		hot: Math.min(ratio.value * pressure.value, 1),
		cold: Math.min((1 - ratio.value) * pressure.value, 1),
	}
})

watchEffect(() => {
	emit('update:waterAmounts', waterAmounts.value)
})

defineExpose({
	reset() {
		ratio.value = 0
		pressure.value = 0
	},
	onDrag,
})
</script>
