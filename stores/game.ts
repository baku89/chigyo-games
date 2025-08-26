import EventEmitter from 'eventemitter3'

type GameState =
	| 'instruction'
	| 'practice'
	| 'preCountdown'
	| 'playing'
	| 'finished'

type Events = {
	startPractice: []
	startPreCountdown: []
	startMainCountdown: []
	finish: []
	reset: []
	tickRecord: [frame: number]
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

	function on<E extends keyof Events>(
		event: E,
		callback: (...args: Events[E]) => void
	) {
		ee.on(event, callback)

		onBeforeUnmount(() => {
			ee.off(event, callback)
		})
	}

	function tickRecord(frame: number) {
		ee.emit('tickRecord', frame)
	}

	return {
		state: readonly(state),
		transition,
		on,
		tickRecord,
	}
})
