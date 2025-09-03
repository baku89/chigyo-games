<template>
	<FbxModel
		src="/chigyo-games/shower/faucet1_body.fbx"
		@load="setupMetalicMaterial"
	/>
	<FbxModel
		src="/chigyo-games/shower/faucet1_cold.fbx"
		:position="{x: -HandleX}"
		:rotation="{z: scalar.rad(waterAmounts.cold * -360)}"
		@load="setupMetalicMaterial"
	/>
	<FbxModel
		src="/chigyo-games/shower/faucet1_hot.fbx"
		:position="{x: HandleX}"
		:rotation="{z: scalar.rad(waterAmounts.hot * -360)}"
		@load="setupMetalicMaterial"
	/>
	<FbxModel
		src="/chigyo-games/shower/faucet1_arrow.fbx"
		@load="setupConstantMaterial"
	/>
</template>

<script setup lang="ts">
import {scalar, vec2} from 'linearly'
import {FbxModel} from 'troisjs'

import type {DragData} from '~/composables/useDrag'
import type {WaterAmounts} from '~/types/faucet'
import {
	setupMetalicMaterial,
	setupConstantMaterial,
} from '~/utils/faucetsMaterial'

const emit = defineEmits<{
	(e: 'update:waterAmounts', value: WaterAmounts): void
}>()

const HandleX = 0.436344

const waterAmounts = reactive<WaterAmounts>({hot: 0, cold: 0})

function onDrag(data: DragData) {
	const type: keyof WaterAmounts = data.initial[0] > 0 ? 'hot' : 'cold'

	const handlePosition: vec2 = [type === 'hot' ? HandleX : -HandleX, 0.5]

	const prev = vec2.sub(data.prev, handlePosition)
	const current = vec2.sub(data.current, handlePosition)

	const angle = vec2.angle(prev, current)

	console.log(angle)

	waterAmounts[type] = scalar.clamp(
		waterAmounts[type] + scalar.efit(angle, 0, 360, 0, 1),
		0,
		1
	)
}

watch(
	() => waterAmounts,
	() => {
		emit('update:waterAmounts', waterAmounts)
		console.log(waterAmounts)
	},
	{deep: true}
)

defineExpose({
	reset() {
		waterAmounts.hot = 0
		waterAmounts.cold = 0
	},
	onDrag,
})
</script>
