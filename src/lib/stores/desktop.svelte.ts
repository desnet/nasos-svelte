export type WindowApp = {
	id: number
	title: string
	icon: string
	x: number
	y: number
	width: number
	height: number
	minimized: boolean
	maximized: boolean
	focused: boolean
	component: string
	args?: Record<string, unknown>
}

export type DesktopIconType = 'app' | 'url'

export type DesktopIcon = {
	id: number
	label: string
	icon: string
	type: DesktopIconType
	app: string
	url?: string
}

export const AVAILABLE_APPS: { id: string; label: string; icon: string }[] = [
	{ id: 'explorer',  label: 'Проводник',           icon: '📁' },
	{ id: 'notepad',   label: 'Блокнот',             icon: '📝' },
	{ id: 'trash',     label: 'Корзина',             icon: '🗑️' },
	{ id: 'about',     label: 'Обо мне',             icon: '💻' },
	{ id: 'appstore',  label: 'Магазин приложений',  icon: '🏪' },
	{ id: 'wallpapers',label: 'Обои рабочего стола', icon: '🖼️' }
]

function createDesktop() {
	let windows = $state<WindowApp[]>([])
	let nextId = $state(1)
	let zOrder = $state<number[]>([])

	// let desktopIcons = $state<DesktopIcon[]>([
	// 	{ id: 1, label: 'Проводник', icon: '📁', type: 'app', app: 'explorer'  },
	// 	{ id: 2, label: 'Блокнот',   icon: '📝', type: 'app', app: 'notepad'   },
	// 	{ id: 3, label: 'Обо мне',   icon: '💻', type: 'app', app: 'about'     },
	// 	{ id: 4, label: 'Магазин',   icon: '🏪', type: 'app', app: 'appstore'  },
	// 	{ id: 5, label: 'Обои',      icon: '🖼️', type: 'app', app: 'wallpapers'}
	// ])
	// let nextIconId = $state(6)

	function openApp(app: string, args?: Record<string, unknown>) {
		const existing = windows.find((w) => w.component === app && !w.minimized)
		if (existing) { focusWindow(existing.id); return }
		const minimized = windows.find((w) => w.component === app && w.minimized)
		if (minimized) { restoreWindow(minimized.id); focusWindow(minimized.id); return }

		const appMeta = AVAILABLE_APPS.find(a => a.id === app)
		const id = nextId++
		const offset = (windows.filter((w) => !w.minimized).length % 6) * 24
		windows.push({
			id,
			title: appMeta?.label ?? app,
			icon: appMeta?.icon ?? '🖥️',
			x: 80 + offset, y: 60 + offset,
			width:  app === 'explorer' ? 680 : app === 'appstore' ? 780 : app === 'wallpapers' ? 720 : 500,
			height: app === 'explorer' ? 460 : app === 'appstore' ? 520 : app === 'wallpapers' ? 480 : 380,
			minimized: false, maximized: false, focused: true,
			component: app,
			args
		})
		zOrder.push(id)
		focusWindow(id)
	}

	function focusWindow(id: number) {
		zOrder = zOrder.filter((z) => z !== id)
		zOrder.push(id)
		windows = windows.map((w) => ({ ...w, focused: w.id === id }))
	}

	function closeWindow(id: number) {
		windows = windows.filter((w) => w.id !== id)
		zOrder = zOrder.filter((z) => z !== id)
	}

	function minimizeWindow(id: number) {
		windows = windows.map((w) => (w.id === id ? { ...w, minimized: true, focused: false } : w))
		const remaining = windows.filter((w) => !w.minimized)
		if (remaining.length > 0) focusWindow(remaining[remaining.length - 1].id)
	}

	function restoreWindow(id: number) {
		windows = windows.map((w) => (w.id === id ? { ...w, minimized: false } : w))
		focusWindow(id)
	}

	function toggleMaximize(id: number) {
		windows = windows.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w))
	}

	function moveWindow(id: number, x: number, y: number) {
		windows = windows.map((w) => (w.id === id ? { ...w, x, y } : w))
	}

	function resizeWindow(id: number, width: number, height: number) {
		windows = windows.map((w) => (w.id === id ? { ...w, width, height } : w))
	}

	function getZIndex(id: number) {
		return 100 + zOrder.indexOf(id)
	}

	// function addIcon(data: Omit<DesktopIcon, 'id'>) {
	// 	desktopIcons.push({ id: nextIconId++, ...data })
	// }

	// function updateIcon(id: number, patch: Partial<Omit<DesktopIcon, 'id'>>) {
	// 	desktopIcons = desktopIcons.map((ic) => (ic.id === id ? { ...ic, ...patch } : ic))
	// }

	// function removeIcon(id: number) {
	// 	desktopIcons = desktopIcons.filter((ic) => ic.id !== id)
	// }

	return {
		get windows() { return windows },
		// get desktopIcons() { return desktopIcons },
		openApp,
		focusWindow,
		closeWindow,
		minimizeWindow,
		restoreWindow,
		toggleMaximize,
		moveWindow,
		resizeWindow,
		getZIndex,
		// addIcon,
		// updateIcon,
		// removeIcon
	}
}

export const desktop = createDesktop()
