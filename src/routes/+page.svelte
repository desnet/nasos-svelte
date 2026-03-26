<script lang="ts">
	// Stores
	import { desktop } from '$lib/stores/desktop.svelte'
	import { widgets } from '$lib/stores/widgets.svelte'
	import { wallpaperStore } from '$lib/stores/wallpaper.svelte'
	import { shortcutDialogState } from '$lib/stores/shortcutDialogState.svelte'
	import { dragState } from '$lib/stores/dragState.svelte'

	// Components
	import Window from '$lib/components/Window.svelte'
	import Widget from '$lib/components/Widget.svelte'
	import ContextMenu from '$lib/components/ContextMenu.svelte'
	import Taskbar from '$lib/components/Taskbar.svelte'

	// Apps
	import Explorer from '$lib/apps/Explorer.svelte'
	import Notepad from '$lib/apps/Notepad.svelte'
	import About from '$lib/apps/About.svelte'
	import Trash from '$lib/apps/Trash.svelte'
	import AppStore from '$lib/apps/AppStore.svelte'
	import Wallpapers from '$lib/apps/Wallpapers.svelte'
	import IframeApp from '$lib/apps/IframeApp.svelte'
	import ShortcutDialog from '$lib/components/ShortcutDialog.svelte'

	// Widgets
	import ClockWidget from '$lib/widgets/ClockWidget.svelte'
	import CalendarWidget from '$lib/widgets/CalendarWidget.svelte'
	import NotesWidget from '$lib/widgets/NotesWidget.svelte'
	import SysmonWidget from '$lib/widgets/SysmonWidget.svelte'

	import type { Component } from 'svelte'
	import { SvelteSet } from 'svelte/reactivity'
	import type { WidgetType } from '$lib/stores/widgets.svelte'
	import type { DesktopIcon } from '$lib/stores/desktop.svelte'

	// --- Component maps ---

	const APP_COMPONENTS: Record<string, Component> = {
		explorer:          Explorer,
		notepad:           Notepad,
		about:             About,
		trash:             Trash,
		appstore:          AppStore,
		wallpapers:        Wallpapers,
		iframe:            IframeApp,
		'shortcut-dialog': ShortcutDialog
	}

	const WIDGET_COMPONENTS: Record<WidgetType, Component> = {
		clock:    ClockWidget,
		calendar: CalendarWidget,
		notes:    NotesWidget,
		sysmon:   SysmonWidget
	}

	// --- Desktop icon grid ---

	const ICON_W  = 88
	const ICON_H  = 88
	const PAD_X   = 16
	const PAD_Y   = 44   // menu bar (28px) + padding (16px)
	const DOCK_H  = 88
	const GRID_W  = ICON_W + 8
	const GRID_H  = ICON_H + 8
	const DRAG_THRESHOLD = 5

	type IconPos = { x: number; y: number }

	function snapToGrid(x: number, y: number): IconPos {
		return {
			x: Math.round(x / GRID_W) * GRID_W,
			y: PAD_Y + Math.round(Math.max(0, y - PAD_Y) / GRID_H) * GRID_H
		}
	}

	// Явно заданные позиции (после перетаскивания)
	let iconPositions = $state<Record<number, IconPos>>(
		Object.fromEntries(
			desktop.desktopIcons.map((icon, i) => [
				icon.id,
				snapToGrid(PAD_X, PAD_Y + i * GRID_H)
			])
		)
	)

	// Вычисляет позиции всех иконок, авто-размещая новые в первый свободный слот
	const effectivePositions = $derived.by(() => {
		const result: Record<number, IconPos> = {}
		const used = new SvelteSet<string>()

		for (const icon of desktop.desktopIcons) {
			if (icon.id in iconPositions) {
				const pos = iconPositions[icon.id]
				result[icon.id] = pos
				used.add(`${pos.x},${pos.y}`)
			}
		}

		for (const icon of desktop.desktopIcons) {
			if (icon.id in result) continue
			let placed = false
			for (let i = 0; i < 30 && !placed; i++) {
				const pos = snapToGrid(PAD_X, PAD_Y + i * GRID_H)
				const key = `${pos.x},${pos.y}`
				if (!used.has(key)) {
					result[icon.id] = pos
					used.add(key)
					placed = true
				}
			}
			if (!placed) result[icon.id] = snapToGrid(PAD_X, PAD_Y)
		}

		return result
	})

	// --- Icon selection & drag ---

	let selectedIcon  = $state<number | null>(null)
	let draggingId    = $state<number | null>(null)
	let dragOffsetX   = 0
	let dragOffsetY   = 0
	let dragStartX    = 0
	let dragStartY    = 0
	let hasMoved      = false

	function onIconMousedown(e: MouseEvent, id: number) {
		if (e.button !== 0) return
		e.stopPropagation()
		selectedIcon = id
		draggingId   = id
		hasMoved     = false
		const pos    = effectivePositions[id]
		dragOffsetX  = e.clientX - pos.x
		dragOffsetY  = e.clientY - pos.y
		dragStartX   = e.clientX
		dragStartY   = e.clientY
		dragState.start()
		window.addEventListener('mousemove', onIconMousemove)
		window.addEventListener('mouseup',   onIconMouseup)
	}

	function onIconMousemove(e: MouseEvent) {
		if (draggingId === null) return
		if (!hasMoved && Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) < DRAG_THRESHOLD) return
		hasMoved = true
		iconPositions = {
			...iconPositions,
			[draggingId]: {
				x: Math.max(0,     Math.min(e.clientX - dragOffsetX, window.innerWidth  - ICON_W)),
				y: Math.max(PAD_Y, Math.min(e.clientY - dragOffsetY, window.innerHeight - ICON_H - DOCK_H))
			}
		}
	}

	function onIconMouseup(e: MouseEvent) {
		dragState.end()
		if (draggingId !== null && hasMoved) {
			if ((e.target as Element)?.closest('.trash-drop-zone')) {
				const rest = { ...iconPositions }
				delete rest[draggingId]
				iconPositions = rest
				desktop.removeIcon(draggingId)
			} else {
				const x = Math.max(0,     Math.min(e.clientX - dragOffsetX, window.innerWidth  - ICON_W))
				const y = Math.max(PAD_Y, Math.min(e.clientY - dragOffsetY, window.innerHeight - ICON_H - DOCK_H))
				iconPositions = { ...iconPositions, [draggingId]: snapToGrid(x, y) }
			}
		}
		draggingId = null
		window.removeEventListener('mousemove', onIconMousemove)
		window.removeEventListener('mouseup',   onIconMouseup)
	}

	function openIcon(icon: DesktopIcon) {
		if (icon.type === 'url' && icon.url) desktop.openUrl(icon.url, icon.label, icon.icon)
		else desktop.openApp(icon.app)
	}

	// --- Context menus ---

	let ctxMenu     = $state<{ x: number; y: number } | null>(null)
	let iconCtxMenu = $state<{ icon: DesktopIcon; x: number; y: number } | null>(null)

	function openShortcutDialog(icon: DesktopIcon | null) {
		shortcutDialogState.set(icon)
		desktop.openShortcutDialog(icon ? 'Свойства ярлыка' : 'Новый ярлык')
	}
</script>

<!-- Desktop -->
<div
	class="desktop"
	style="background: {wallpaperStore.current.css}"
	onclick={() => { selectedIcon = null; ctxMenu = null }}
	onkeydown={() => (selectedIcon = null)}
	oncontextmenu={(e) => { e.preventDefault(); ctxMenu = { x: e.clientX, y: e.clientY } }}
	role="presentation"
>
	<!-- Виджеты -->
	{#each widgets.list as w (w.id)}
		{@const WidgetComp = WIDGET_COMPONENTS[w.type]}
		<Widget id={w.id} type={w.type} x={w.x} y={w.y} width={widgets.widths[w.id]}>
			<WidgetComp />
		</Widget>
	{/each}

	<!-- Иконки -->
	{#each desktop.desktopIcons as icon (icon.id)}
		<div
			class="desktop-icon"
			class:selected={selectedIcon === icon.id}
			class:dragging={draggingId === icon.id}
			style="left: {effectivePositions[icon.id].x}px; top: {effectivePositions[icon.id].y}px"
			onmousedown={(e) => onIconMousedown(e, icon.id)}
			ondblclick={() => { if (!hasMoved) openIcon(icon) }}
			onclick={(e) => e.stopPropagation()}
			oncontextmenu={(e) => { e.preventDefault(); e.stopPropagation(); iconCtxMenu = { icon, x: e.clientX, y: e.clientY } }}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Enter' && openIcon(icon)}
		>
			<span class="di-icon">{icon.icon}</span>
			<span class="di-label">{icon.label}</span>
		</div>
	{/each}

	<!-- Окна -->
	{#each desktop.windows as win (win.id)}
		{@const AppComp = APP_COMPONENTS[win.component]}
		<Window id={win.id}>
			<AppComp />
		</Window>
	{/each}
</div>

<!-- Контекстное меню рабочего стола -->
{#if ctxMenu}
	{@const cx = ctxMenu.x}
	{@const cy = ctxMenu.y}
	<ContextMenu
		x={cx} y={cy}
		onclose={() => (ctxMenu = null)}
		items={[
			{ kind: 'section', text: 'Рабочий стол' },
			{ kind: 'label',   text: 'Добавить виджет' },
			{ kind: 'item', icon: '🕐', label: 'Часы',            action: () => widgets.add('clock',    cx, cy) },
			{ kind: 'item', icon: '📅', label: 'Календарь',       action: () => widgets.add('calendar', cx, cy) },
			{ kind: 'item', icon: '🗒️', label: 'Заметка',         action: () => widgets.add('notes',    cx, cy) },
			{ kind: 'item', icon: '📊', label: 'Монитор системы', action: () => widgets.add('sysmon',   cx, cy) },
			{ kind: 'divider' },
			{ kind: 'label', text: 'Ярлыки' },
			{ kind: 'item', icon: '🔗', label: 'Добавить ярлык',       action: () => openShortcutDialog(null) },
			{ kind: 'divider' },
			{ kind: 'item', icon: '🔄', label: 'Обновить рабочий стол', action: () => {} }
		]}
	/>
{/if}

<!-- Контекстное меню иконки -->
{#if iconCtxMenu}
	<ContextMenu
		x={iconCtxMenu.x} y={iconCtxMenu.y}
		onclose={() => (iconCtxMenu = null)}
		items={[
			{ kind: 'item', icon: '▶',  label: 'Открыть',      action: () => openIcon(iconCtxMenu!.icon) },
			{ kind: 'divider' },
			{ kind: 'item', icon: '✏️', label: 'Свойства',      action: () => openShortcutDialog(iconCtxMenu!.icon) },
			{ kind: 'item', icon: '🗑', label: 'Удалить ярлык', action: () => desktop.removeIcon(iconCtxMenu!.icon.id), danger: true }
		]}
	/>
{/if}

<!-- Панель задач -->
<Taskbar />

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', sans-serif;
	}

	.desktop {
		width: 100vw;
		height: 100vh;
		background: #0d2137;
		transition: background 0.5s ease;
		position: relative;
		overflow: hidden;
		padding-top: 28px;
		box-sizing: border-box;
	}

	.desktop-icon {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		width: 76px;
		padding: 8px 4px 6px;
		border-radius: 10px;
		cursor: pointer;
		border: 1.5px solid transparent;
		user-select: none;
		transition: background 0.12s;
		z-index: 10;
	}

	.desktop-icon:hover          { background: rgba(255, 255, 255, 0.14); }
	.desktop-icon.selected       { background: rgba(255, 255, 255, 0.18); border-color: rgba(255, 255, 255, 0.45); }
	.desktop-icon.dragging       { opacity: 0.85; cursor: grabbing; box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45); z-index: 9998; }

	.di-icon {
		font-size: 40px;
		filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.55));
		pointer-events: none;
	}

	.di-label {
		font-size: 11px;
		color: white;
		text-align: center;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
		word-break: break-word;
		line-height: 1.3;
		pointer-events: none;
		padding: 1px 4px;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.22);
	}
</style>
