<template>
	<FbxModel
		src="/chigyo-games/shower/faucet3_body.fbx"
		@load="setupMetalicMaterial"
	/>
	<FbxModel
		src="/chigyo-games/shower/faucet3_lever.fbx"
		@load="setupMetalicMaterial"
		:position="{y: 0.116919}"
		:rotation="rotation"
	/>
	<FbxModel
		src="/chigyo-games/shower/faucet3_arrow.fbx"
		@load="setupConstantMaterial"
	/>
</template>

<script setup lang="ts">
import {scalar} from 'linearly'
import {
	setupMetalicMaterial,
	setupConstantMaterial,
} from '~/utils/faucetsMaterial'
import {FbxModel} from 'troisjs'

import type {DragData} from '~/composables/useDrag'
import type {WaterAmounts} from '~/types/faucet'
import {Euler} from 'three'

const emit = defineEmits<{
	(e: 'update:waterAmounts', value: WaterAmounts): void
}>()

const ratio = ref(0) // 0: cold, 1: hot
const pressure = ref(0) // 0: none, 1: max (0-2)

const rotation = computed(() => {
	const [x, y, z, order] = new Euler(
		scalar.rad(scalar.fit(pressure.value, 0, 2, -15, 30)),
		scalar.rad(scalar.lerp(70, -70, ratio.value)),
		0,
		'YXZ'
	)
		.reorder('XYZ')
		.toArray()

	return {x, y, z}
})

function onDrag(data: DragData) {
	ratio.value = scalar.clamp(ratio.value - data.delta[0] * 0.7, 0, 1)
	pressure.value = scalar.clamp(pressure.value + data.delta[1], 0, 2)
}

const waterAmounts = computed<WaterAmounts>(() => {
	return {
		hot: ratio.value * pressure.value,
		cold: (1 - ratio.value) * pressure.value,
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
