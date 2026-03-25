<script lang="ts">
	import { getContext } from 'svelte'
	import { desktop } from '$lib/stores/desktop.svelte'

	const winId = getContext<number>('windowId')
	const win = $derived(desktop.windows.find((w) => w.id === winId))
</script>

{#if win?.url}
	<iframe src={win.url} title={win.title} sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
{:else}
	<div class="empty">Нет URL</div>
{/if}

<style>
	iframe {
		width: 100%;
		height: 100%;
		border: none;
		display: block;
	}
	.empty {
		padding: 24px;
		color: #888;
		font-size: 13px;
	}
</style>
