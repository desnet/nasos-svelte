<script lang="ts">
	import { desktop } from '$lib/stores/desktop.svelte'
	import { widgets } from '$lib/stores/widgets.svelte'
	import Window from '$lib/components/Window.svelte'
	import Widget from '$lib/components/Widget.svelte'
	import ContextMenu from '$lib/components/ContextMenu.svelte'
	import Taskbar from '$lib/components/Taskbar.svelte'
	import Explorer from '$lib/apps/Explorer.svelte'
	import Notepad from '$lib/apps/Notepad.svelte'
	import About from '$lib/apps/About.svelte'
	import Trash from '$lib/apps/Trash.svelte'
	import AppStore from '$lib/apps/AppStore.svelte'
	import Wallpapers from '$lib/apps/Wallpapers.svelte'
	import { wallpaperStore } from '$lib/stores/wallpaper.svelte'
	import ClockWidget from '$lib/widgets/ClockWidget.svelte'
	import CalendarWidget from '$lib/widgets/CalendarWidget.svelte'
	import NotesWidget from '$lib/widgets/NotesWidget.svelte'
	import SysmonWidget from '$lib/widgets/SysmonWidget.svelte'
	import type { Component } from 'svelte'
	import { SvelteSet } from 'svelte/reactivity'
	import type { WidgetType } from '$lib/stores/widgets.svelte'
	import IframeApp from '$lib/apps/IframeApp.svelte'
	import ShortcutDialog from '$lib/components/ShortcutDialog.svelte'
	import type { DesktopIcon } from '$lib/stores/desktop.svelte'
	import { shortcutDialogState } from '$lib/stores/shortcutDialogState.svelte'

	const APP_COMPONENTS: Record<string, Component> = {
		explorer: Explorer,
		notepad: Notepad,
		about: About,
		trash: Trash,
		appstore: AppStore,
		wallpapers: Wallpapers,
		iframe: IframeApp,
		'shortcut-dialog': ShortcutDialog
	}

	const WIDGET_COMPONENTS: Record<WidgetType, Component> = {
		clock: ClockWidget,
		calendar: CalendarWidget,
		notes: NotesWidget,
		sysmon: SysmonWidget
	}

	const ICON_W = 88
	const ICON_H = 88
	const PAD = 16
	const DRAG_THRESHOLD = 5
	const GRID_W = ICON_W + 8
	const GRID_H = ICON_H + 8

	type IconPos = { x: number; y: number }

	function snapToGrid(x: number, y: number): IconPos {
		return {
			x: Math.round(x / GRID_W) * GRID_W,
			y: Math.round(y / GRID_H) * GRID_H
		}
	}

	let iconPositions = $state<Record<number, IconPos>>(
		Object.fromEntries(
			desktop.desktopIcons.map((icon, i) => [
				icon.id,
				snapToGrid(PAD, PAD + i * GRID_H)
			])
		)
	)

	let selectedIcon = $state<number | null>(null)

	let draggingId = $state<number | null>(null)
	let dragOffsetX = 0
	let dragOffsetY = 0
	let dragStartX = 0
	let dragStartY = 0
	let hasMoved = false

	// Контекстное меню
	let ctxMenu = $state<{ x: number; y: number } | null>(null)
	let iconCtxMenu = $state<{ icon: DesktopIcon; x: number; y: number } | null>(null)

	function openShortcutDialog(icon: DesktopIcon | null) {
		shortcutDialogState.set(icon)
		desktop.openShortcutDialog(icon ? 'Свойства ярлыка' : 'Новый ярлык')
	}

	// Синхронно вычисляет позиции для всех иконок, включая только что добавленные.
	// iconPositions хранит только явно заданные (перетаскивание) позиции.
	const effectivePositions = $derived.by(() => {
		const result: Record<number, IconPos> = {}
		const used = new SvelteSet<string>()

		// Сначала перенести существующие позиции (только для живых иконок)
		for (const icon of desktop.desktopIcons) {
			if (icon.id in iconPositions) {
				const pos = iconPositions[icon.id]
				result[icon.id] = pos
				used.add(`${pos.x},${pos.y}`)
			}
		}

		// Для новых иконок — первый свободный слот в левой колонке
		for (const icon of desktop.desktopIcons) {
			if (icon.id in result) continue
			let placed = false
			for (let i = 0; i < 30 && !placed; i++) {
				const pos = snapToGrid(PAD, PAD + i * GRID_H)
				const key = `${pos.x},${pos.y}`
				if (!used.has(key)) {
					result[icon.id] = pos
					used.add(key)
					placed = true
				}
			}
			if (!placed) result[icon.id] = snapToGrid(PAD, PAD)
		}

		return result
	})

	function onIconMousedown(e: MouseEvent, id: number) {
		if (e.button !== 0) return
		e.stopPropagation()
		selectedIcon = id
		draggingId = id
		hasMoved = false
		const pos = effectivePositions[id]
		dragOffsetX = e.clientX - pos.x
		dragOffsetY = e.clientY - pos.y
		dragStartX = e.clientX
		dragStartY = e.clientY
		window.addEventListener('mousemove', onMousemove)
		window.addEventListener('mouseup', onMouseup)
	}

	function onMousemove(e: MouseEvent) {
		if (draggingId === null) return
		const dx = e.clientX - dragStartX
		const dy = e.clientY - dragStartY
		if (!hasMoved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
		hasMoved = true
		const newX = Math.max(0, Math.min(e.clientX - dragOffsetX, window.innerWidth - ICON_W))
		const newY = Math.max(0, Math.min(e.clientY - dragOffsetY, window.innerHeight - ICON_H - 48))
		iconPositions = { ...iconPositions, [draggingId]: { x: newX, y: newY } }
	}

	function onMouseup(e: MouseEvent) {
		if (draggingId !== null && hasMoved) {
			const rawX = e.clientX - dragOffsetX
			const rawY = e.clientY - dragOffsetY
			const clampedX = Math.max(0, Math.min(rawX, window.innerWidth - ICON_W))
			const clampedY = Math.max(0, Math.min(rawY, window.innerHeight - ICON_H - 48))
			iconPositions = { ...iconPositions, [draggingId]: snapToGrid(clampedX, clampedY) }
		}
		draggingId = null
		window.removeEventListener('mousemove', onMousemove)
		window.removeEventListener('mouseup', onMouseup)
	}

	function openIcon(icon: DesktopIcon) {
		if (icon.type === 'url' && icon.url) {
			desktop.openUrl(icon.url, icon.label, icon.icon)
		} else {
			desktop.openApp(icon.app)
		}
	}

	function onIconDblclick(icon: DesktopIcon) {
		if (!hasMoved) openIcon(icon)
	}

	function onDesktopContextmenu(e: MouseEvent) {
		e.preventDefault()
		ctxMenu = { x: e.clientX, y: e.clientY }
	}
</script>

<!-- Desktop -->
<div
	class="desktop"
	style="background: {wallpaperStore.current.css}"
	onclick={() => { selectedIcon = null; ctxMenu = null }}
	onkeydown={() => (selectedIcon = null)}
	oncontextmenu={onDesktopContextmenu}
	role="presentation"
>
	<!-- Виджеты -->
	{#each widgets.list as w (w.id)}
		{@const WidgetComp = WIDGET_COMPONENTS[w.type]}
		<Widget id={w.id} type={w.type} x={w.x} y={w.y}>
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
			ondblclick={() => onIconDblclick(icon)}
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
		x={cx}
		y={cy}
		onclose={() => (ctxMenu = null)}
		items={[
			{ kind: 'section', text: 'Рабочий стол' },
			{ kind: 'label', text: 'Добавить виджет' },
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
		x={iconCtxMenu.x}
		y={iconCtxMenu.y}
		onclose={() => (iconCtxMenu = null)}
		items={[
			{ kind: 'item', icon: '▶',  label: 'Открыть',       action: () => openIcon(iconCtxMenu!.icon) },
			{ kind: 'divider' },
			{ kind: 'item', icon: '✏️', label: 'Свойства',       action: () => openShortcutDialog(iconCtxMenu!.icon) },
			{ kind: 'item', icon: '🗑', label: 'Удалить ярлык',  action: () => desktop.removeIcon(iconCtxMenu!.icon.id), danger: true }
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
		font-family: 'Segoe UI', 'Arial', sans-serif;
	}

	.desktop {
		width: 100vw;
		height: 100vh;
		background: #0d2137; /* перекрывается inline style из wallpaperStore */
		transition: background 0.5s ease;
		position: relative;
		overflow: hidden;
	}

	.desktop::before {
		content: '';
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 20% 30%, rgba(74, 144, 217, 0.15) 0%, transparent 50%),
			radial-gradient(circle at 80% 70%, rgba(44, 111, 173, 0.12) 0%, transparent 50%);
		pointer-events: none;
	}

	.desktop-icon {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		width: 72px;
		padding: 8px 4px;
		border-radius: 6px;
		cursor: pointer;
		border: 2px solid transparent;
		user-select: none;
		transition: background 0.1s;
		z-index: 10;
	}

	.desktop-icon:hover { background: rgba(255, 255, 255, 0.12); }

	.desktop-icon.selected {
		background: rgba(74, 144, 217, 0.3);
		border-color: rgba(74, 144, 217, 0.7);
	}

	.desktop-icon.dragging {
		opacity: 0.8;
		cursor: grabbing;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
		z-index: 9998;
	}

	.di-icon {
		font-size: 36px;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
		pointer-events: none;
	}

	.di-label {
		font-size: 11px;
		color: white;
		text-align: center;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
		word-break: break-word;
		line-height: 1.3;
		pointer-events: none;
	}
</style>
