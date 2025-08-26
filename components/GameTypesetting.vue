<template>
	<GameContainer :game-duration="15">
		<template #instruction="{gameDuration}">
			<div class="instruction">
				<h1>字詰めゲーム</h1>
				<p>
					3つのスライダーを調整して、<br />
					「<span class="serif">ちぎょ</span>」という文字を<br />
					いい感じに詰めてみよう！
				</p>
				<p>
					制限時間は<strong>{{ gameDuration }}秒</strong>です！
				</p>
			</div>
		</template>

		<template #default="{canEdit}">
			<main class="GameTypesetting" :class="{invalid: !canEdit}">
				<div class="characters">
					<Char src="/typesetting/0_chi.svg" :show-border="showBorders[0]" />
					<Char
						src="/typesetting/1_gi.svg"
						:show-border="showBorders[1]"
						:style="giStyle"
					/>
					<Char src="/typesetting/2_xyo.svg" :show-border="showBorders[2]" />
				</div>
				<div class="controls">
					<NumericSlider
						label="Tracking"
						v-model="tracking"
						:min="-500"
						:max="500"
						:step="0.01"
						v-model:hovering="hoveringTracking"
					/>
					<NumericSlider
						label="ち〜ぎ"
						v-model="kernings[0]"
						:min="-500"
						:max="500"
						:step="0.01"
						v-model:hovering="hoveringKernings[0]"
					/>
					<NumericSlider
						label="ぎ〜ょ"
						v-model="kernings[1]"
						:min="-500"
						:max="500"
						:step="0.01"
						v-model:hovering="hoveringKernings[1]"
					/>
				</div>
			</main>
		</template>

		<template #result>
			<div class="result">
				<p class="result-text">お疲れ様でした！</p>
				<div class="final-result">
					<div class="characters">
						<Char src="/typesetting/0_chi.svg" />
						<Char src="/typesetting/1_gi.svg" :style="giStyle" />
						<Char src="/typesetting/2_xyo.svg" />
					</div>
				</div>
			</div>
		</template>
	</GameContainer>
</template>

<script setup lang="ts">
import type {vec2} from 'linearly'
import {useGameAPI} from '~/composables/useGameAPI'

type KerningRecord = vec2.Mutable

const kernings = ref<KerningRecord>([0, 0])
const tracking = ref(0)

const hoveringKernings = ref<[boolean, boolean]>([false, false])
const hoveringTracking = ref(false)

const showBorders = computed<[boolean, boolean, boolean]>(() => {
	const [k0, k1] = hoveringKernings.value
	const t = hoveringTracking.value

	return [k0 || t, k0 || k1 || t, k1 || t]
})

const actualKernings = computed<KerningRecord>(() => {
	return [
		kernings.value[0] + tracking.value,
		kernings.value[1] + tracking.value,
	]
})

const giStyle = computed(() => {
	const beforeKerning = actualKernings.value[0] / 1000
	const afterKerning = actualKernings.value[1] / 1000

	return {
		marginLeft: `calc(var(--char-size) * ${beforeKerning})`,
		marginRight: `calc(var(--char-size) * ${afterKerning})`,
	}
})

const game = useGameStore()

game.on('startPreCountdown', resetAllValues)
game.on('reset', resetAllValues)

function resetAllValues() {
	kernings.value = [0, 0]
	tracking.value = 0
	kerningsRecord.length = 0
}

// Record the kernings
const kerningsRecord: KerningRecord[] = []

game.on('tickRecord', frame => {
	kerningsRecord.push(toRaw(actualKernings.value))
})

const {submitGameData} = useGameAPI()

game.on('finish', async () => {
	const hasSaved = !!localStorage.getItem('game__typesetting')

	// Save to localStorage for backup
	localStorage.setItem('game__typesetting', JSON.stringify(kerningsRecord))

	// Submit to API if not saved
	if (true) {
		const payload = {
			kernings_record: kerningsRecord,
			final_kernings: actualKernings.value,
			final_tracking: tracking.value,
		}

		try {
			await submitGameData('typesetting', 0, payload)
			console.log('Game data submitted successfully')
		} catch (error) {
			// Error already logged in composable
		}
	}
})
</script>

<style lang="stylus">
@import '../assets/style.styl'

.instruction
	line-height 1.6
	font-size 2rem

	h1
		font-size 4rem
		font-weight bold
		margin-bottom 1rem
		color var(--color-text)

	.serif
		font-family serif
		font-weight bold

	p
		margin 0.5lh 0

.GameTypesetting
	display flex
	flex-direction column
	justify-content space-around

	&.invalid
		pointer-events none

.characters
	display flex
	justify-content center
	position relative
	--char-size 15rem
	height var(--char-size)

.controls
	width 100%
	display grid
	grid-template-columns min-content 1fr
	gap 2.5rem

	> *
		grid-column 1 / -1

.result
	.result-text
		font-size 1.5rem
		margin-bottom 2rem

	.final-result
		.characters
			--char-size 8rem
			margin-bottom 1rem
</style>
