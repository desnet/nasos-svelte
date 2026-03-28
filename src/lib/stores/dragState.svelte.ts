function createDragState(): {
	readonly active: boolean
	readonly resizingActive: boolean
	start(): void
	end(): void
	startResize(): void
	endResize(): void
} {
	let active = $state(false)
	let resizingActive = $state(false)
	return {
		get active() { return active },
		get resizingActive() { return resizingActive },
		start() { active = true },
		end()   { active = false },
		startResize() { resizingActive = true },
		endResize()   { resizingActive = false }
	}
}

export const dragState = createDragState()
