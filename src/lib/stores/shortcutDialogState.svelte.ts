import type { DesktopIcon } from './desktop.svelte'

function createShortcutDialogState() {
	let target = $state<DesktopIcon | null>(null)
	return {
		get target() { return target },
		set(icon: DesktopIcon | null) { target = icon }
	}
}

export const shortcutDialogState = createShortcutDialogState()
