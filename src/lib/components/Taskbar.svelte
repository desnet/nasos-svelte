<script lang="ts">
	import { desktop, type WindowOptions } from '$lib/stores/desktop.svelte'
	import { taskbar, type Pinned } from '$lib/stores/taskbar.svelte'
	import DockItem from '$lib/components/DockItem.svelte'

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
				<DockItem
					label={w.title}
					active={w.focused && !w.minimized}
					minimized={w.minimized}
					showDot
					onclick={(e) => { e.stopPropagation(); toggleApp(w) }}
				>
					{w.icon}
				</DockItem>
			{/each}
			<div class="dock-sep"></div>
		{/if}

		{#each pinnedList as pinned (pinned.id)}
			<DockItem
				label={pinned.label ?? ''}
				active={activeItem === pinned.id}
				showDot={activeItem === pinned.id}
				dropClass={pinned.app === 'trash' ? 'trash-drop-zone' : ''}
				onclick={(e) => { e.stopPropagation(); togglePunnedApp(pinned) }}
				onDrop={(el) => console.log(el)}
			>
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
					<img src={pinned.icon ?? ''} alt={pinned.label} class="dock-icon-img"/>
				{:else}
					{pinned.icon}
				{/if}
			</DockItem>
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

	.dock-icon-img {
		width: 32px;
		height: 32px;
		object-fit: contain;
		filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
		display: block;
	}
</style>
