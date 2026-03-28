<script lang="ts">
	import { desktop, type WindowOptions } from '$lib/stores/desktop.svelte'
	import { taskbar, type Pinned } from '$lib/stores/taskbar.svelte'

	let activeItem = $state<string>('')
	let pinnedList = taskbar.pinnedList();
	let unpinnedList = $derived(desktop.windows.filter(w => !pinnedList.find(pinned => pinned.app == w.component)));

	// ── Dock ─────────────────────────────────────────────────────────────────────
	function toggleApp(w: (typeof desktop.windows)[number]) {
		if (w.minimized) desktop.restoreWindow(w.id)
		else if (w.focused) desktop.minimizeWindow(w.id)
		else desktop.focusWindow(w.id)
	}

	function togglePunnedApp(pinned: Pinned) {
		const appWinOptions: WindowOptions = {
			width: '50vw',
			height: '50vh'
		}

		if(/^launcher/.test(pinned.id)) {
			Object.assign(appWinOptions, {
				titlebar: false,
				resizable: false,
				overlay: true,
				focusDim: true,
				position: 'center',
				variant: 'transparent'
			});
		}
		
		activeItem = pinned.id;
		desktop.openApp(
			pinned.app,
			pinned.args, 
			appWinOptions
		) 
	}
</script>

<svelte:window onclick={() => activeItem=''} />

<!-- Dock -->
<div class="dock-wrap">
	<div class="dock">

		{#if unpinnedList.length}
			{#each unpinnedList as w (w.id)}
				<button
					class="dock-item"
					class:dock-active={w.focused && !w.minimized}
					class:dock-minimized={w.minimized}
					onclick={(e) => {e.stopPropagation(); toggleApp(w)}}
				>
					<span class="dock-icon">{w.icon}</span>
					<span class="dock-label">{w.title}</span>
					<div class="dock-dot" class:hidden={w.minimized}></div>
				</button>
			{/each}
			<div class="dock-sep"></div>
		{/if}

		{#each taskbar.pinnedList() as pinned (pinned.id)}
			<button
				class="dock-item"
				class:dock-active={activeItem === pinned.id}
				onclick={(e) => {e.stopPropagation(); togglePunnedApp(pinned)}}
			>
				<span class="dock-icon">
					{#if pinned.id == 'launcher-apps'}
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect x="2"  y="2"  width="9" height="9" rx="2.5" fill="white" fill-opacity="0.85"/>
							<rect x="13" y="2"  width="9" height="9" rx="2.5" fill="white" fill-opacity="0.85"/>
							<rect x="2"  y="13" width="9" height="9" rx="2.5" fill="white" fill-opacity="0.85"/>
							<rect x="13" y="13" width="9" height="9" rx="2.5" fill="white" fill-opacity="0.85"/>
						</svg>
					{:else if pinned.id == 'launcher-widgets'}
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect x="2"  y="2"  width="20" height="8" rx="2.5" fill="white" fill-opacity="0.85"/>
							<rect x="2"  y="13" width="9" height="9" rx="2.5" fill="white" fill-opacity="0.85"/>
							<rect x="13" y="13" width="9" height="9" rx="2.5" fill="white" fill-opacity="0.85"/>
						</svg>
					{:else if pinned.icon?.includes('/')}
						<img src={pinned.icon} alt={pinned.label} class="dock-icon-img"/>
					{:else}
						{pinned.icon}
					{/if}
				</span>
				<span class="dock-label">{pinned.label}</span>
				{#if activeItem === pinned.id}<div class="dock-dot"></div>{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	/* ── Dock ────────────────────────────────────────────────────────────────── */
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
	.dock-item .dock-icon { font-size: 22px; }

	.dock-icon-img {
		width: 32px;
		height: 32px;
		object-fit: contain;
		filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
		display: block;
	}

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
</style>
