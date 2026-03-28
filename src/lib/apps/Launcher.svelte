<script lang="ts">
	import { getContext, untrack } from 'svelte'
	import { desktop } from '$lib/stores/desktop.svelte'
	import { apps } from '$lib/stores/apps.svelte'
	import { widgets } from '$lib/stores/widgets.svelte'
	import type { GridItem } from '$lib/stores/desktopGrid.svelte'
	import UiInputSearch from '$lib/components/UiInputSearch.svelte'
	import UiButtonGroup from '$lib/components/UiButtonGroup.svelte'
	import DesktopGrid from '$lib/components/DesktopGrid.svelte'
	import DesktopGridCell from '$lib/components/DesktopGridCell.svelte'
	import Shortcut from '$lib/components/Shortcut.svelte'

	let { appType = 'apps' }: { appType?: 'apps' | 'widgets' } = $props()

	const winId = getContext<number>('windowId')

	let mode = $state<'apps' | 'widgets'>(untrack(() => appType))
	let search = $state('')

	const appList = $derived(
		apps.list()
			.filter(a => a.id !== 'launcher')
			.filter(a => !search || a.label.toLowerCase().includes(search.toLowerCase()))
	)

	const widgetList = $derived(
		widgets.list()
			.filter(w => !search || w.label.toLowerCase().includes(search.toLowerCase()))
	)

	const appItems = $derived<GridItem[]>(
		appList.map((_, i) => ({
			id: 200 + i,
			col: 2 + (i % 3) * 8,
			row: 2 + Math.floor(i / 3) * 9,
			colSpan: 4,
			rowSpan: 3,
		}))
	)

	const widgetItems = $derived<GridItem[]>(
		widgetList.map((_, i) => ({
			id: 300 + i,
			col: 2 + (i % 2) * 13,
			row: 2 + Math.floor(i / 2) * 11,
			colSpan: 10,
			rowSpan: 9,
		}))
	)

	const currentItems = $derived(mode === 'apps' ? appItems : widgetItems)
</script>

<div class="launcher">
	<div class="launcher-top">
		<UiInputSearch
			bind:value={search}
			placeholder={mode === 'apps' ? '🔍 Поиск приложений...' : '🔍 Поиск виджетов...'}
			variant='transparent'
		/>
	</div>

	<UiButtonGroup
		items={['Приложения', 'Виджеты']}
		value={mode === 'apps' ? 'Приложения' : 'Виджеты'}
		onchange={(v) => { mode = v === 'Приложения' ? 'apps' : 'widgets'; search = '' }}
		variant='transparent'
	/>

	<div class="launcher-body">
		<DesktopGrid cellW={22} cellH={22} items={currentItems} onItemsChange={() => {}}>
			{#if mode === 'apps'}
				{#each appItems as item (item.id)}
					{@const app = appList[item.id - 200]}
					{#if app}
						<DesktopGridCell {item}>
							<Shortcut
								config={{ icon: app.icon, label: app.label, app: app.id }}
								ondblclick={() => { desktop.openApp(app.id); desktop.closeWindow(winId) }}
							/>
						</DesktopGridCell>
					{/if}
				{/each}
			{:else}
				{#each widgetItems as item (item.id)}
					{@const w = widgetList[item.id - 300]}
					{#if w}
						<DesktopGridCell {item}>
							<div class="widget-card" role="presentation">
								<span class="wc-icon">{w.icon}</span>
								<span class="wc-label">{w.label}</span>
							</div>
						</DesktopGridCell>
					{/if}
				{/each}
			{/if}
		</DesktopGrid>
	</div>
</div>

<style>
	.launcher {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	.launcher-top {
		padding: 12px 16px 8px;
	}

	.launcher-body {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.widget-card {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		background: rgba(255, 255, 255, 0.72);
		border: 1px solid rgba(0, 0, 0, 0.07);
		border-radius: 12px;
		cursor: pointer;
		transition: background 0.12s, transform 0.1s;
	}
	.widget-card:hover {
		background: rgba(255, 255, 255, 0.96);
		transform: scale(1.04);
	}

	.wc-icon  { font-size: 30px; line-height: 1; }
	.wc-label { font-size: 11px; color: #444; font-weight: 500; text-align: center; }
</style>
