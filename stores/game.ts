import EventEmitter from 'eventemitter3'

type GameState =
	| 'instruction'
	| 'practice'
	| 'preCountdown'
	| 'playing'
	| 'finished'

type Events = {
	startPractice: void
	startPreCountdown: void
	startMainCountdown: void
	finish: void
	reset: void
}

export const useGameStore = defineStore('game', () => {
	const state = ref<GameState>('instruction')

	const ee = new EventEmitter<Events>()

	const transition = (event: keyof Events) => {
		let nextState: GameState | null = null
		if (event === 'startPractice') {
			if (state.value === 'instruction') {
				nextState = 'practice'
			}
		}

		if (event === 'startPreCountdown') {
			if (state.value === 'practice') {
				nextState = 'preCountdown'
			}
		}

		if (event === 'startMainCountdown') {
			if (state.value === 'preCountdown') {
				nextState = 'playing'
			}
		}

		if (event === 'finish') {
			if (state.value === 'playing') {
				nextState = 'finished'
			}
		}

		if (event === 'reset') {
			nextState = 'instruction'
		}

		if (!nextState) {
			throw new Error(
				`Invalid transition from ${state.value} with event ${event}`
			)
		}

		state.value = nextState
		ee.emit(event)
	}

	function on(event: keyof Events, callback: () => void) {
		ee.on(event, callback)

		onBeforeUnmount(() => {
			ee.off(event, callback)
		})
	}

	return {
		state: readonly(state),
		transition,
		on,
	}
})
