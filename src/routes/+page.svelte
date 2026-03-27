<script lang="ts">
	// Stores
	import { desktop } from '$lib/stores/desktop.svelte'
	import { wallpaperStore } from '$lib/stores/wallpaper.svelte'
	import type { GridItem } from '$lib/stores/desktopGrid.svelte'
	import type { ShortcutConfig } from '$lib/components/Shortcut.svelte'
	import type { WidgetConfig } from '$lib/components/Widget.svelte'

	// Grid components
	import DesktopGridCell from '$lib/components/DesktopGridCell.svelte'
	import Shortcut from '$lib/components/Shortcut.svelte'
	import Widget from '$lib/components/Widget.svelte'

	// Apps
	import Explorer from '$lib/apps/Explorer.svelte'
	import Notepad from '$lib/apps/Notepad.svelte'
	import About from '$lib/apps/About.svelte'
	import Trash from '$lib/apps/Trash.svelte'
	import AppStore from '$lib/apps/AppStore.svelte'
	import Wallpapers from '$lib/apps/Wallpapers.svelte'
	import IframeApp from '$lib/apps/IframeApp.svelte'
	import ShortcutDialog from '$lib/components/ShortcutDialog.svelte'

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

	// Widgets
	import ClockWidget from '$lib/widgets/ClockWidget.svelte'
	import CalendarWidget from '$lib/widgets/CalendarWidget.svelte'

	const WIDGET_COMPONENTS: Record<string, Component> = {
		clock:    ClockWidget,
		calendar: CalendarWidget,
	}

	// Layout components
	import MenuBar from '$lib/components/MenuBar.svelte'
	import DesktopGrid from '$lib/components/DesktopGrid.svelte'
	import Taskbar from '$lib/components/Taskbar.svelte'

	// Window infrastructure
	import Window from '$lib/components/Window.svelte'
	import type { Component } from 'svelte'

	type DesktopItem = GridItem & { shortcut?: ShortcutConfig; widget?: WidgetConfig }

	const COL = 2
	const SPAN_W = 4
	const SPAN_H = 3
	const ROW_GAP = 1

	function shortcutRow(index: number) {
		return 2 + index * (SPAN_H + ROW_GAP)
	}

	let gridItems = $state<DesktopItem[]>([
		{ id: 1, col: COL, row: shortcutRow(0), colSpan: SPAN_W, rowSpan: SPAN_H, shortcut: { icon: '📁', label: 'Проводник', app: 'explorer'   } },
		{ id: 2, col: COL, row: shortcutRow(1), colSpan: SPAN_W, rowSpan: SPAN_H, shortcut: { icon: '📝', label: 'Блокнот',   app: 'notepad'    } },
		{ id: 3, col: COL, row: shortcutRow(2), colSpan: SPAN_W, rowSpan: SPAN_H, shortcut: { icon: '💻', label: 'Обо мне',   app: 'about'      } },
		{ id: 4, col: COL, row: shortcutRow(3), colSpan: SPAN_W, rowSpan: SPAN_H, shortcut: { icon: '🗑️', label: 'Корзина',   app: 'trash'      } },
		{ id: 5, col: COL, row: shortcutRow(4), colSpan: SPAN_W, rowSpan: SPAN_H, shortcut: { icon: '🏪', label: 'Магазин',   app: 'appstore'   } },
		{ id: 6, col: COL, row: shortcutRow(5), colSpan: SPAN_W, rowSpan: SPAN_H, shortcut: { icon: '🖼️', label: 'Обои',      app: 'wallpapers' } },
		{ id: 7, col: 8,   row: 2,              colSpan: 10,      rowSpan: 11,      widget: { name: 'clock',    app: 'clock'    } },
		{ id: 8, col: 8,   row: 14,             colSpan: 10,      rowSpan: 12,      widget: { name: 'calendar', app: 'calendar' } },
	])

</script>

<div class="desktop" style="background: {wallpaperStore.current.css}">
	<MenuBar />

	<div class="desktop-area">
		<DesktopGrid cellW={22} cellH={22} items={gridItems} onItemsChange={(v) => (gridItems = v as DesktopItem[])} onItemRemove={(id) => (gridItems = gridItems.filter(item => item.id !== id))}>
			{#each gridItems as item (item.id)}
				<DesktopGridCell {item}>
					{#if item.shortcut}
						<Shortcut config={item.shortcut} ondblclick={(cfg) => desktop.openApp(cfg.app, cfg.args)} />
					{:else if item.widget}
						{@const WidgetSomp = WIDGET_COMPONENTS[item.widget.name]}
						<Widget config={item.widget} ondblclick={(cfg) => cfg.app && desktop.openApp(cfg.app, cfg.args)}>
							{#if WidgetSomp}<WidgetSomp />{/if}
						</Widget>
					{/if}
				</DesktopGridCell>
			{/each}
		</DesktopGrid>

		<!-- Windows overlay -->
		{#each desktop.windows as win (win.id)}
			{@const AppComp = APP_COMPONENTS[win.component]}
			<Window id={win.id}>
				{#if AppComp}<AppComp />{/if}
			</Window>
		{/each}
	</div>

	<Taskbar />
</div>

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
		display: flex;
		flex-direction: column;
		transition: background 0.5s ease;
		overflow: hidden;
	}

	.desktop-area {
		flex: 1;
		position: relative;
		overflow: hidden;
		min-height: 0;
	}
</style>
