<template>
	<div class="GameContainer">
		<!-- Main Game Screen (Always rendered) -->
		<div class="game-screen">
			<Countdown
				:seconds="gameDuration"
				@preCountdown="startPreCountdown"
				@start="startGame"
				@complete="finishGame"
				ref="countdown"
			/>
			<div class="game-content">
				<slot
					:canEdit="gameState === 'practice' || gameState === 'playing'"
					:finish="finishGame"
				/>
			</div>
		</div>

		<!-- Instruction Overlay -->
		<div v-if="gameState === 'instruction'" class="instruction-overlay">
			<div class="instruction-content">
				<slot name="instruction" :game-duration="gameDuration" />
				<div class="instruction-actions">
					<button class="start-practice-button" @click="startPractice">
						練習をはじめる
					</button>
				</div>
			</div>
		</div>

		<!-- Result Overlay -->
		<div v-if="gameState === 'finished'" class="result-overlay">
			<div class="result-content">
				<h2>ゲーム終了！</h2>
				<slot name="result" />
				<div class="result-actions">
					<button class="restart-button" @click="restartGame">
						もう一度プレイ
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import Countdown from './Countdown.vue'

type GameState =
	| 'instruction'
	| 'practice'
	| 'pre-countdown'
	| 'playing'
	| 'finished'

defineProps<{
	gameDuration: number
}>()

const emit = defineEmits<{
	preCountdown: []
	reset: []
}>()

const gameState = ref<GameState>('instruction')
const countdown = ref<InstanceType<typeof Countdown>>()

const startPractice = () => {
	gameState.value = 'practice'
	countdown.value?.startPractice()
}

const startPreCountdown = () => {
	gameState.value = 'pre-countdown'
	emit('preCountdown')
}

const startGame = () => {
	gameState.value = 'playing'
}

const finishGame = () => {
	gameState.value = 'finished'
}

const restartGame = () => {
	emit('reset')
	gameState.value = 'instruction'
	countdown.value?.reset()
}
</script>

<style lang="stylus">
@import '../assets/style.styl'

html, body
	margin 0
	width 100vw
	height 100vh
	overflow hidden

body
	display flex
	justify-content center
	align-items center
	background white

.GameContainer
	padding 1rem
	width calc(min(100vw, var(--max-width)))
	aspect-ratio 4 / 5
	overflow hidden
	position relative
	background var(--color-bg)

.game-screen
	width 100%
	height 100%
	display flex
	flex-direction column

.game-content
	flex-grow 1
	flex 1
	display flex
	flex-direction column

	& > *
		width 100%
		height 100%

.instruction-overlay,
.result-overlay
	position absolute
	inset 0
	display flex
	justify-content center
	align-items center
	text-align center
	z-index 1000
	background-color with-alpha(var(--color-bg), 0.9)

.instruction-content,
.result-content
	max-width 80%
	padding 2rem
	background-color var(--color-bg)
	border 2px solid var(--color-text)
	border-radius 1rem
	box-shadow 0 10px 30px red

.instruction-content
	background-color with-alpha(var(--color-bg), .8)
	backdrop-filter blur(10px)

.instruction-actions,
.result-actions
	margin-top 2rem

.start-practice-button,
.restart-button
	padding 1rem 2rem
	font-size 2rem
	font-weight bold
	border 2px solid var(--color-text)
	background-color var(--color-bg)
	color var(--color-text)
	border-radius 0.5rem
	transition all 0.2s ease-in-out

	&:hover
		background-color var(--color-primary)
		border-color var(--color-primary)

.result-content h2
	font-size 2rem
	margin-bottom 1rem
</style>
