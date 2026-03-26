function createDragState() {
	let active = $state(false)
	return {
		get active() { return active },
		start() { active = true },
		end()   { active = false }
	}
}

export const dragState = createDragState()
