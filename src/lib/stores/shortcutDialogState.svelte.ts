import type { DesktopIcon } from './desktop.svelte'

type SaveData = Omit<DesktopIcon, 'id'>

function createShortcutDialogState() {
	let target = $state<DesktopIcon | null>(null)
	let onSave = $state<((data: SaveData) => void) | null>(null)
	return {
		get target() { return target },
		get onSave() { return onSave },
		open(icon: DesktopIcon | null, save: (data: SaveData) => void) {
			target = icon
			onSave = save
		}
	}
}

export const shortcutDialogState = createShortcutDialogState()
