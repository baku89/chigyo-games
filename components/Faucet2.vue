<template>
	<FbxModel
		src="/chigyo-games/shower/faucet2_body.fbx"
		@load="setupMetalicMaterial"
	/>
	<FbxModel
		src="/chigyo-games/shower/faucet2_ratio.fbx"
		@load="setupMetalicMaterial"
		:rotation="{x: scalar.rad(scalar.lerp(75, -75, ratio) + 50)}"
	/>
	<FbxModel
		src="/chigyo-games/shower/faucet2_pressure.fbx"
		@load="setupMetalicMaterial"
		:rotation="{x: scalar.rad(scalar.fit(pressure, 0, 2, -75, 75) + 20)}"
	/>
	<FbxModel
		src="/chigyo-games/shower/faucet2_arrow.fbx"
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

const emit = defineEmits<{
	(e: 'update:waterAmounts', value: WaterAmounts): void
}>()

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
