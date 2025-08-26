<template>
	<div
		class="Countdown"
		:class="{
			warning: state === 'main-countdown' && remainingTime <= 3,
			[state]: true,
		}"
	>
		<div class="time-display">
			{{
				state === 'pre-countdown' ? preCountdownTime : formatTime(remainingTime)
			}}
		</div>
		<template v-if="state === 'practice'">
			<div class="practice-mode-text">練習モード</div>
			<button class="start-button" @click="startPreCountdown">
				本番スタート！
			</button>
		</template>
		<div v-if="state === 'pre-countdown'" class="pre-countdown-text">
			よーい...
		</div>
		<div v-else-if="state === 'main-countdown'" class="progress-bar">
			<div class="progress-fill" :style="{width: `${progressPercentage}%`}" />
		</div>
	</div>
</template>

<script setup lang="ts">
import {useRafFn, type Pausable} from '@vueuse/core'

type State =
	| 'instruction'
	| 'practice'
	| 'pre-countdown'
	| 'main-countdown'
	| 'finished'

const props = defineProps<{
	seconds: number
	autoStart?: boolean
}>()

const emit = defineEmits<{
	complete: []
	preCountdown: []
	start: []
}>()

const remainingTime = ref(props.seconds)
const state = ref<State>('instruction')
const preCountdownTime = ref(3)

let stopRafFn: Pausable | null = null

const progressPercentage = computed(() => {
	return (1 - (props.seconds - remainingTime.value) / props.seconds) * 100
})

const formatTime = (time: number): string => {
	return time.toFixed(0)
}

const startPractice = () => {
	state.value = 'practice'
}

let preCountdownIntervalId: ReturnType<typeof setInterval> | undefined
const startPreCountdown = () => {
	if (preCountdownIntervalId !== undefined) return

	emit('preCountdown')

	state.value = 'pre-countdown'
	preCountdownTime.value = 3

	preCountdownIntervalId = setInterval(() => {
		if (--preCountdownTime.value <= 0) {
			// Pre-countdown finished, start main countdown
			clearInterval(preCountdownIntervalId)
			preCountdownIntervalId = undefined
			startMainCountdown()
		}
	}, 1000)
}

const startMainCountdown = () => {
	emit('start')
	state.value = 'main-countdown'

	stopRafFn = useRafFn(({delta}) => {
		const elapsed = delta / 1000

		remainingTime.value = Math.max(remainingTime.value - elapsed, 0)

		if (remainingTime.value <= 0) {
			state.value = 'finished'
			stopRafFn?.pause()
			emit('complete')
		}
	})
}

const startCountdown = () => {
	startPreCountdown()
}

const stopCountdown = () => {
	clearInterval(preCountdownIntervalId)
	preCountdownIntervalId = undefined
	stopRafFn?.pause()
	state.value = 'instruction'
}

const resetCountdown = () => {
	stopCountdown()
	remainingTime.value = props.seconds
	preCountdownTime.value = 3
	state.value = 'instruction'
}

// Auto start if enabled
onMounted(() => {
	if (props.autoStart ?? true) {
		startCountdown()
	}
})

// Cleanup on unmount
onUnmounted(() => {
	stopCountdown()
})

// Watch for props changes
watch(
	() => props.seconds,
	newSeconds => {
		remainingTime.value = newSeconds
	}
)

// Expose methods for parent components
defineExpose({
	start: startCountdown,
	startPractice: startPractice,
	reset: resetCountdown,
})
</script>

<style lang="stylus" scoped>
@import '../assets/style.styl'

.Countdown
	display flex
	align-items center
	gap 1rem
	background-color var(--color-bg)
	transition all 0.15s ease-in-out
	--color var(--color-text)

	&.warning
		--color var(--color-primary)

	&.practice
		justify-content space-between

	&.pre-countdown
		--color var(--color-primary)
		animation bounce 1s infinite alternate


.time-display
	width 4rem
	height 4rem
	aspect-ratio 1 / 1
	line-height 4rem
	border-radius 50%
	background-color var(--color)
	font-size 2rem
	font-family 'Fira Code', monospace
	color var(--color-bg)
	text-align center
	transition color 0.15s ease-in-out

	.warning &
		animation pulse 0.5s infinite alternate

.practice-mode-text
	font-size 1.5rem
	font-weight bold
	text-align center

.start-button
	font-size 1.5rem
	font-weight bold
	color var(--color-primary)
	border 2px solid var(--color-primary)
	align-self stretch
	border-radius 0.5rem
	line-height 4rem
	padding-inline 1rem
	animation blink .25s infinite alternate

	&:hover
		background-color var(--color-primary) !important
		color var(--color-text) !important

.progress-bar
	width 100%
	height .5rem
	background-color rgba(0, 0, 0, 0.1)
	border-radius 9999px
	margin-right 1rem
	overflow hidden

.progress-fill
	height 100%
	background-color var(--color)

.pre-countdown-text
	font-size 1.5rem
	font-weight bold
	color var(--color-primary)
	text-align center

@keyframes pulse
	0%
		transform scale(1)
	100%
		transform scale(1.5)

@keyframes bounce
	0%, 20%, 50%, 80%, 100%
		transform translateY(0)
	40%
		transform translateY(-10px)
	60%
		transform translateY(-5px)

@keyframes blink
	0%
		background-color with-alpha(var(--color-primary), 0.5)
	100%
		background-color var(--color-bg)
		color var(--color-primary)
</style>
