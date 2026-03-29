<script lang="ts">
	import type { Snippet } from 'svelte'
	import { launcherDrag } from '$lib/stores/launcherDrag.svelte'
	import { dragState } from '$lib/stores/dragState.svelte'

	let {
		label,
		active    = false,
		minimized = false,
		showDot   = false,
		dropClass = '',
		onclick,
		onDrop,
		children,
	}: {
		label:       string
		active?:     boolean
		minimized?:  boolean
		showDot?:    boolean
		dropClass?:  string
		onclick?:    (e: MouseEvent) => void
		onDrop?:     (e: MouseEvent) => void
		children:    Snippet
	} = $props()

	function handleMouseup(e: MouseEvent) {
		if (launcherDrag.active || dragState.active) {
			onDrop?.(e)
		}
	}
</script>

<button
	class="dock-item {dropClass}"
	class:dock-active={active}
	class:dock-minimized={minimized}
	onclick={onclick}
	onmouseup={handleMouseup}
>
	<span class="dock-icon">
		{@render children()}
	</span>
	<span class="dock-label">{label}</span>
	{#if showDot}
		<div class="dock-dot" class:hidden={minimized}></div>
	{/if}
</button>

<style>
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
		font-size: 22px;
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
