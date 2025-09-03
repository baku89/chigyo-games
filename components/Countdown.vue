<template>
	<div
		class="Countdown"
		:class="{
			warning: game.state === 'playing' && remainingTime <= 5,
			[game.state]: true,
		}"
	>
		<div class="time-display">
			{{
				game.state === 'preCountdown'
					? formatTime(preCountdownTime)
					: formatTime(remainingTime)
			}}
		</div>
		<template v-if="game.state === 'practice'">
			<div class="practice-mode-text">練習モード</div>
			<button class="start-button" @click="startPreCountdown">
				本番スタート！
			</button>
		</template>
		<div v-if="game.state === 'preCountdown'" class="pre-countdown-text">
			よーい...
		</div>
		<div v-else-if="game.state === 'playing'" class="progress-bar">
			<div class="progress-fill" :style="{width: `${progressPercentage}%`}" />
		</div>
	</div>
</template>

<script setup lang="ts">
import {scalar} from 'linearly'

const props = defineProps<{
	gameDuration: number
}>()

const emit = defineEmits<{
	complete: []
	preCountdown: []
	start: []
}>()

const game = useGameStore()
const remainingTime = ref(props.gameDuration)
const preCountdownTime = ref(3)

let gameIntervalId: ReturnType<typeof setInterval> | undefined

const progressPercentage = computed(() => {
	return scalar.fit(remainingTime.value, props.gameDuration, 0, 100, 0)
})

const formatTime = (time: number): string => {
	return time.toFixed(0)
}

let preCountdownIntervalId: ReturnType<typeof setInterval> | undefined
const startPreCountdown = () => {
	if (preCountdownIntervalId !== undefined) return

	emit('preCountdown')

	game.transition('startPreCountdown')
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
	game.transition('startMainCountdown')

	const fps = 30
	const frameInterval = 1000 / fps // ms per frame
	const totalFrames = props.gameDuration * fps
	let currentFrame = 0

	gameIntervalId = setInterval(() => {
		// Emit tick record for current frame
		game.tickRecord(currentFrame)
		currentFrame++

		// Update remaining time for display
		const elapsedTime = currentFrame / fps // seconds
		remainingTime.value = props.gameDuration - elapsedTime

		// Check if game is finished
		if (currentFrame >= totalFrames) {
			clearInterval(gameIntervalId)
			gameIntervalId = undefined
			remainingTime.value = 0
			game.transition('finish')
			emit('complete')
		}
	}, frameInterval)
}

const stopCountdown = () => {
	clearInterval(preCountdownIntervalId)
	preCountdownIntervalId = undefined
	clearInterval(gameIntervalId)
	gameIntervalId = undefined
}

// Cleanup on unmount
onUnmounted(() => {
	stopCountdown()
})

game.on('reset', () => {
	stopCountdown()
	remainingTime.value = props.gameDuration
	preCountdownTime.value = 3
})
</script>

<style lang="stylus" scoped>
@import '../assets/style.styl'

.Countdown
	position relative
	display flex
	align-items center
	gap 1rem
	transition all 0.15s ease-in-out
	--color var(--color-text)
	--amp -1rem

	&.warning
		--color var(--color-primary)

	&.practice
		justify-content space-between

	&.preCountdown
		--color var(--color-primary)
		animation bounce 1s infinite


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
		animation pulse 0.25s infinite alternate

.practice-mode-text
	font-size 2rem
	font-weight bold
	text-align center
	position absolute
	inset 0
	line-height 4rem
	pointer-events none

.start-button
	font-size 1.5rem
	font-weight bold
	color var(--color-primary)
	border 2px solid var(--color-primary)
	align-self stretch
	border-radius 0.5rem
	height 4rem
	line-height calc(4rem - 4px)
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
	font-size 2rem
	font-weight bold
	color var(--color-primary)
	text-align center

@keyframes pulse
	0%
		transform scale(1)
	100%
		transform scale(1.15)

@keyframes bounce
	0%
		transform translateY(0)
		animation-timing-function ease-out
	20%
		transform translateY(calc(var(--amp)))
		animation-timing-function ease-in
	40%
		transform translateY(0)
		animation-timing-function ease-out
	55%
		transform translateY(calc(var(--amp) * .5))
		animation-timing-function ease-in
	70%
		transform translateY(0)
		animation-timing-function ease-out
	80%
		transform translateY(calc(var(--amp) * .25))
		animation-timing-function ease-in
	90%
		transform translateY(0)

@keyframes blink
	0%
		background-color with-alpha(var(--color-primary), 0.5)
	100%
		background-color var(--color-bg)
		color var(--color-primary)
</style>
