<template>
	<GltfModel src="/chigyo-games/shower/chigyo_body.gltf" @load="onLoadBody" />
	<GltfModel src="/chigyo-games/shower/chigyo_eye.gltf" @load="onLoadEye" />
</template>

<script setup lang="ts">
import {GltfModel} from 'troisjs'
import {AnimationMixer, Clock, type AnimationAction} from 'three'
import {scalar} from 'linearly'
import {watch} from 'vue'
import {setupConstantMaterial} from '~/utils/faucetsMaterial'

const props = defineProps<{
	goodness: number
}>()

let bodyAnimationMixer: AnimationMixer | null = null
let bodyAnimationAction: AnimationAction | null = null
let eyeAnimationMixer: AnimationMixer | null = null
let eyeAnimationAction: AnimationAction | null = null
const clock = new Clock()

function setupAnimation(gltf: any, isLoop: boolean) {
	const mixer = new AnimationMixer(gltf.scene)
	const action = mixer.clipAction(gltf.animations[0])

	action.enabled = true

	if (isLoop) {
		action.setLoop(2201, Infinity)
		action.clampWhenFinished = false
		action.fadeIn(1)
	} else {
		action.setLoop(2200, 1)
		action.clampWhenFinished = true
		action.paused = true
	}

	action.play()
	return {mixer, action}
}

function onLoadEye(gltf: any) {
	setupConstantMaterial(gltf.scene)
	const result = setupAnimation(gltf, false)
	eyeAnimationMixer = result.mixer
	eyeAnimationAction = result.action
	updateEyeAnimation()
}

function onLoadBody(gltf: any) {
	setupConstantMaterial(gltf.scene)
	const result = setupAnimation(gltf, true)
	bodyAnimationMixer = result.mixer
	bodyAnimationAction = result.action
	updateAnimationSpeed()
	startAnimationLoop()
}

function updateAnimationSpeed() {
	if (bodyAnimationAction) {
		bodyAnimationAction.timeScale = scalar.lerp(0.2, 2, props.goodness)
	}
}

function updateEyeAnimation() {
	if (eyeAnimationAction && eyeAnimationMixer) {
		const duration = eyeAnimationAction.getClip().duration
		const targetTime = scalar.lerp(0, duration, props.goodness)
		eyeAnimationAction.time = targetTime
		eyeAnimationMixer.update(0)
	}
}

watch(
	() => props.goodness,
	() => {
		updateAnimationSpeed()
		updateEyeAnimation()
	}
)

function startAnimationLoop() {
	function animate() {
		if (bodyAnimationMixer) {
			bodyAnimationMixer.update(clock.getDelta())
		}
		requestAnimationFrame(animate)
	}
	animate()
}
</script>
