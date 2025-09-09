import {useEventListener, type MaybeRefOrGetter} from '@vueuse/core'
import {vec2} from 'linearly'

export interface DragData {
	initial: vec2
	delta: vec2
	current: vec2
	prev: vec2
}

interface useDragOptions {
	target: MaybeRefOrGetter<HTMLElement | null | undefined>
	onDrag: (data: DragData) => void
	preventScroll?: boolean
}

export function useDrag(options: useDragOptions) {
	const isDragging = ref(false)
	const data = reactive<DragData>({
		initial: vec2.zero,
		delta: vec2.zero,
		current: vec2.zero,
		prev: vec2.zero,
	})

	// Set touch-action to prevent scroll when preventScroll is enabled
	if (options.preventScroll !== false) {
		watchEffect(() => {
			const target = toValue(options.target)
			if (target) {
				target.style.touchAction = 'none'
			}
		})
	}

	useEventListener(options.target, 'pointerdown', (e: PointerEvent) => {
		;(e.target as HTMLElement).setPointerCapture(e.pointerId)

		isDragging.value = true
		handlePointerMove(e, true)
	})

	useEventListener(options.target, 'pointermove', (e: PointerEvent) => {
		if (!isDragging.value) return
		handlePointerMove(e, false)
	})

	useEventListener(options.target, 'pointerup', handlePointerUp)
	useEventListener(options.target, 'pointercancel', handlePointerUp)
	useEventListener(options.target, 'pointerout', handlePointerUp)
	useEventListener(options.target, 'pointerleave', handlePointerUp)

	function handlePointerUp(e: PointerEvent) {
		isDragging.value = false
	}

	function handlePointerMove(e: PointerEvent, setInitial: boolean) {
		const target = e.target as HTMLElement

		const {left, top, right, bottom} = target.getBoundingClientRect()
		const client: vec2 = [e.clientX, e.clientY]

		data.current = vec2.efit(
			client,
			[left, top],
			[right, bottom],
			[-1, -5 / 4],
			[1, 5 / 4]
		)

		if (setInitial) {
			data.initial = data.prev = data.current
		}

		data.delta = vec2.sub(data.current, data.prev)

		options.onDrag(toRaw(data))

		data.prev = data.current
	}
}
