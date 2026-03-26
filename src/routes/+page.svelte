<script lang="ts">
	// Stores
	import { desktop } from '$lib/stores/desktop.svelte'
	import { wallpaperStore } from '$lib/stores/wallpaper.svelte'

	// Layout components
	import MenuBar from '$lib/components/MenuBar.svelte'
	import DesktopGrid from '$lib/components/DesktopGrid.svelte'
	import Taskbar from '$lib/components/Taskbar.svelte'

	// Window infrastructure
	import Window from '$lib/components/Window.svelte'
	import type { Component } from 'svelte'

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
</script>

<div class="desktop" style="background: {wallpaperStore.current.css}">
	<MenuBar />

	<div class="desktop-area">
		<DesktopGrid cellW={22} cellH={22} />

		<!-- Windows overlay -->
		{#each desktop.windows as win (win.id)}
			{@const AppComp = APP_COMPONENTS[win.component]}
			<Window id={win.id}>
				<AppComp />
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
