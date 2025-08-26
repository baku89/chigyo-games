<template>
	<div
		class="Countdown"
		:class="{
			warning: !isPreCountdown && remainingTime <= 10,
			finished: !isPreCountdown && remainingTime <= 0,
			'pre-countdown': isPreCountdown,
		}"
	>
		<div class="time-display">
			{{ isPreCountdown ? preCountdownTime : formatTime(remainingTime) }}
		</div>
		<div v-if="!isPreCountdown" class="progress-bar">
			<div class="progress-fill" :style="{width: `${progressPercentage}%`}" />
		</div>
		<div v-if="isPreCountdown" class="pre-countdown-text">
			{{ preCountdownTime === 0 ? 'START!' : 'Ready...' }}
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	seconds: number
	autoStart?: boolean
}>()

const emit = defineEmits<{
	complete: []
	start: []
}>()

const remainingTime = ref(props.seconds)
const intervalId = ref<number | null>(null)
const isPreCountdown = ref(false)
const preCountdownTime = ref(3)

const progressPercentage = computed(() => {
	return ((props.seconds - remainingTime.value) / props.seconds) * 100
})

const formatTime = (time: number): string => {
	return time.toString()
}

const startPreCountdown = () => {
	if (intervalId.value) return

	isPreCountdown.value = true
	preCountdownTime.value = 3

	intervalId.value = window.setInterval(() => {
		if (preCountdownTime.value > 0) {
			preCountdownTime.value--
		} else {
			// Pre-countdown finished, start main countdown
			clearInterval(intervalId.value!)
			intervalId.value = null
			isPreCountdown.value = false
			startMainCountdown()
		}
	}, 1000)
}

const startMainCountdown = () => {
	emit('start')

	intervalId.value = window.setInterval(() => {
		if (remainingTime.value > 0) {
			remainingTime.value--
		} else {
			clearInterval(intervalId.value!)
			intervalId.value = null
			emit('complete')
		}
	}, 1000)
}

const startCountdown = () => {
	startPreCountdown()
}

const stopCountdown = () => {
	if (intervalId.value) {
		clearInterval(intervalId.value)
		intervalId.value = null
	}
	isPreCountdown.value = false
}

const resetCountdown = () => {
	stopCountdown()
	remainingTime.value = props.seconds
	preCountdownTime.value = 3
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
	stop: stopCountdown,
	reset: resetCountdown,
	remainingTime: readonly(remainingTime),
})
</script>

<style lang="stylus" scoped>

.Countdown
	display flex
	flex-direction column
	align-items center
	gap 1rem
	padding 1rem
	border-radius 0.5rem
	background-color var(--color-bg)
	border 2px solid var(--color-text)
	transition all 0.3s ease-in-out

	&.warning
		border-color var(--color-primary)
		animation pulse 1s infinite

	&.finished
		border-color #ff4444
		background-color rgba(255, 68, 68, 0.1)

	&.pre-countdown
		border-color var(--color-primary)
		background-color rgba(255, 165, 0, 0.1)
		animation bounce 1s infinite

.time-display
	font-size 3rem
	font-weight bold
	font-family 'Fira Code', monospace
	color var(--color-text)
	text-align center
	min-width 4ch
	transition color 0.3s ease-in-out

	.warning &
		color var(--color-primary)

	.finished &
		color #ff4444

	.pre-countdown &
		color var(--color-primary)
		font-size 4rem

.progress-bar
	width 100%
	height 8px
	background-color rgba(0, 0, 0, 0.1)
	border-radius 4px
	overflow hidden

.progress-fill
	height 100%
	background-color var(--color-text)
	transition width 1s linear, background-color 0.3s ease-in-out

	.warning &
		background-color var(--color-primary)

	.finished &
		background-color #ff4444

.pre-countdown-text
	font-size 1.5rem
	font-weight bold
	color var(--color-primary)
	text-align center

@keyframes pulse
	0%
		transform scale(1)
		opacity 1
	50%
		transform scale(1.05)
		opacity 0.8
	100%
		transform scale(1)
		opacity 1

@keyframes bounce
	0%, 20%, 50%, 80%, 100%
		transform translateY(0)
	40%
		transform translateY(-10px)
	60%
		transform translateY(-5px)
</style>
