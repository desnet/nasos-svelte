<script lang="ts">
	import { desktop } from '$lib/stores/desktop.svelte'
	import { dragState } from '$lib/stores/dragState.svelte'

	let showLauncher = $state(false)

	const launcherApps = [
		{ label: 'Проводник', icon: '📁', app: 'explorer'   },
		{ label: 'Блокнот',   icon: '📝', app: 'notepad'    },
		{ label: 'Магазин',   icon: '🏪', app: 'appstore'   },
		{ label: 'Обо мне',   icon: '💻', app: 'about'      },
		{ label: 'Обои',      icon: '🖼️', app: 'wallpapers' }
	]

	function openApp(app: string) {
		desktop.openApp(app)
		showLauncher = false
	}

	function dockClick(w: (typeof desktop.windows)[number]) {
		if (w.minimized) desktop.restoreWindow(w.id)
		else if (w.focused) desktop.minimizeWindow(w.id)
		else desktop.focusWindow(w.id)
	}
</script>

<svelte:window onclick={() => (showLauncher = false)} />

<!-- Launcher overlay -->
{#if showLauncher}
	<div
		class="launcher-overlay"
		onclick={() => (showLauncher = false)}
		onkeydown={(e) => e.key === 'Escape' && (showLauncher = false)}
		role="presentation"
	>
		<div
			class="launcher"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="menu"
			tabindex="0"
		>
			<div class="launcher-title">Приложения</div>
			<div class="launcher-grid">
				{#each launcherApps as a (a.app)}
					<button class="launcher-app" onclick={() => openApp(a.app)}>
						<span class="la-icon">{a.icon}</span>
						<span class="la-label">{a.label}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

<!-- Dock -->
<div class="dock-wrap">
	<div class="dock">

		{#if desktop.windows.some(w => w.component !== 'trash')}
			{#each desktop.windows.filter(w => w.component !== 'trash') as w (w.id)}
				<button
					class="dock-item"
					class:dock-active={w.focused && !w.minimized}
					class:dock-minimized={w.minimized}
					onclick={() => dockClick(w)}
				>
					<span class="dock-icon">{w.icon}</span>
					<span class="dock-label">{w.title}</span>
					<div class="dock-dot" class:hidden={w.minimized}></div>
				</button>
			{/each}
			<div class="dock-sep"></div>
		{/if}

		<button
			class="dock-item launcher-btn"
			class:dock-active={showLauncher}
			onclick={(e) => { e.stopPropagation(); showLauncher = !showLauncher }}
		>
			<span class="dock-icon launchpad-icon">
				<span></span><span></span>
				<span></span><span></span>
			</span>
			<span class="dock-label">Приложения</span>
			{#if showLauncher}<div class="dock-dot"></div>{/if}
		</button>

		<button class="dock-item launcher-btn">
			<span class="dock-icon widget-icon">
				<span class="wi-wide"></span>
				<span></span><span></span>
			</span>
			<span class="dock-label">Виджеты</span>
		</button>
		
		<button class="trash-drop-zone dock-item" class:trash-ready={dragState.active} class:dock-active={desktop.windows.some(w => w.component === 'trash' && w.focused && !w.minimized)} onclick={() => { const w = desktop.windows.find(w => w.component === 'trash'); if (w) dockClick(w); else desktop.openApp('trash') }}>
			<span class="dock-icon">🗑️</span>
			<span class="dock-label">Корзина</span>
		</button>
	</div>
</div>

<style>
	.launcher-overlay {
		position: fixed;
		inset: 0;
		z-index: 9500;
		background: rgba(0, 0, 0, 0.25);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.launcher {
		background: rgba(28, 28, 42, 0.94);
		backdrop-filter: blur(40px);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
		min-width: 320px;
	}

	.launcher-title {
		font-size: 12px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.4);
		text-transform: uppercase;
		letter-spacing: 1px;
		margin-bottom: 16px;
	}

	.launcher-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}

	.launcher-app {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 14px 8px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		color: white;
		cursor: pointer;
		transition: background 0.15s, transform 0.1s;
		font-family: inherit;
	}
	.launcher-app:hover { background: rgba(255, 255, 255, 0.14); transform: scale(1.04); }

	.la-icon  { font-size: 28px; }
	.la-label { font-size: 11px; color: rgba(255,255,255,0.8); }

	.dock-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 8px 0;
		flex-shrink: 0;
	}

	.dock {
		display: flex;
		align-items: flex-end;
		gap: 4px;
		padding: 8px 14px;
		background: rgba(255, 255, 255, 0.14);
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(40px);
		border: 1px solid rgba(255, 255, 255, 0.22);
		border-radius: 18px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255,255,255,0.12) inset;
	}

	.dock-sep {
		width: 1px;
		height: 36px;
		background: rgba(255, 255, 255, 0.2);
		margin: 0 4px;
		align-self: center;
	}

	.dock-item {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		flex-shrink: 0;
		background: none;
		border: none;
		cursor: pointer;
		border-radius: 10px;
		transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.1s;
	}

	.dock-item:hover        { transform: translateY(-8px) scale(1.18); background: rgba(255,255,255,0.12); }
	.dock-item.dock-active  { background: rgba(255, 255, 255, 0.1); }
	.dock-item.dock-minimized { opacity: 0.55; }

	.dock-icon {
		font-size: 28px;
		filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
		display: block;
	}
	.launcher-btn .dock-icon { font-size: 22px; }

	.launchpad-icon {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px;
		width: 24px;
		height: 24px;
		padding: 1px;
	}

	.launchpad-icon span {
		background: rgba(255, 255, 255, 0.85);
		border-radius: 4px;
		transition: background 0.15s;
	}
	.dock-item:hover .launchpad-icon span,
	.dock-active .launchpad-icon span { background: white; }

	.widget-icon {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: 4px;
		width: 24px;
		height: 24px;
		padding: 1px;
	}

	.widget-icon span {
		background: rgba(255, 255, 255, 0.85);
		border-radius: 3px;
		transition: background 0.15s;
	}

	.widget-icon .wi-wide {
		grid-column: 1 / 3;
		border-radius: 4px;
	}

	.dock-item:hover .widget-icon span { background: white; }

	.dock-label {
		position: absolute;
		bottom: calc(100% + 6px);
		left: 50%;
		transform: translateX(-50%);
		font-size: 11px;
		font-weight: 500;
		color: white;
		background: rgba(20, 20, 32, 0.88);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 6px;
		padding: 3px 8px;
		white-space: nowrap;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.15s;
		z-index: 1;
	}
	.dock-item:hover .dock-label { opacity: 1; }

	.dock-dot {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.8);
		position: absolute;
		bottom: 1px;
		left: 50%;
		transform: translateX(-50%);
	}
	.dock-dot.hidden { display: none; }

	.trash-drop-zone {
		transition: background 0.15s, transform 0.15s;
	}
	.trash-ready:hover {
		background: rgba(220, 60, 60, 0.35) !important;
		transform: translateY(-8px) scale(1.18);
	}
</style>
