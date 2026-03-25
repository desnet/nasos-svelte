<script lang="ts">
	import { setContext, untrack } from 'svelte'
	import type { Snippet } from 'svelte'
	import { desktop } from '$lib/stores/desktop.svelte'

	let { id, children } = $props<{ id: number; children: Snippet }>()
	setContext('windowId', untrack(() => id))

	const win = $derived(desktop.windows.find((w) => w.id === id)!)
	const zIndex = $derived(desktop.getZIndex(id))

	const MIN_W = 200
	const MIN_H = 120

	// --- Drag ---
	let dragging = false
	let dragOffsetX = 0
	let dragOffsetY = 0

	function onTitleMousedown(e: MouseEvent) {
		if ((e.target as HTMLElement).closest('.win-controls')) return
		desktop.focusWindow(id)
		dragging = true
		dragOffsetX = e.clientX - win.x
		dragOffsetY = e.clientY - win.y
		window.addEventListener('mousemove', onMousemove)
		window.addEventListener('mouseup', onMouseup)
	}

	// --- Resize ---
	type ResizeDir = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'
	let resizing = false
	let resizeDir: ResizeDir = 'se'
	let rsStartX = 0
	let rsStartY = 0
	let rsStartW = 0
	let rsStartH = 0
	let rsStartWinX = 0
	let rsStartWinY = 0

	function onResizeMousedown(e: MouseEvent, dir: ResizeDir) {
		e.preventDefault()
		e.stopPropagation()
		desktop.focusWindow(id)
		resizing = true
		resizeDir = dir
		rsStartX = e.clientX
		rsStartY = e.clientY
		rsStartW = win.width
		rsStartH = win.height
		rsStartWinX = win.x
		rsStartWinY = win.y
		window.addEventListener('mousemove', onMousemove)
		window.addEventListener('mouseup', onMouseup)
	}

	function onMousemove(e: MouseEvent) {
		if (dragging && !win.maximized) {
			const newX = Math.max(0, e.clientX - dragOffsetX)
			const newY = Math.max(0, e.clientY - dragOffsetY)
			desktop.moveWindow(id, newX, newY)
			return
		}

		if (!resizing || win.maximized) return

		const dx = e.clientX - rsStartX
		const dy = e.clientY - rsStartY

		let newW = rsStartW
		let newH = rsStartH
		let newX = rsStartWinX
		let newY = rsStartWinY

		if (resizeDir.includes('e')) newW = Math.max(MIN_W, rsStartW + dx)
		if (resizeDir.includes('s')) newH = Math.max(MIN_H, rsStartH + dy)
		if (resizeDir.includes('w')) {
			newW = Math.max(MIN_W, rsStartW - dx)
			newX = rsStartWinX + rsStartW - newW
		}
		if (resizeDir.includes('n')) {
			newH = Math.max(MIN_H, rsStartH - dy)
			newY = rsStartWinY + rsStartH - newH
		}

		desktop.moveWindow(id, newX, newY)
		desktop.resizeWindow(id, newW, newH)
	}

	function onMouseup() {
		dragging = false
		resizing = false
		window.removeEventListener('mousemove', onMousemove)
		window.removeEventListener('mouseup', onMouseup)
	}

	function onWindowClick() {
		desktop.focusWindow(id)
	}
</script>

{#if win && !win.minimized}
	<div
		class="window"
		class:maximized={win.maximized}
		class:focused={win.focused}
		style={win.maximized
			? `z-index: ${zIndex}`
			: `left: ${win.x}px; top: ${win.y}px; width: ${win.width}px; height: ${win.height}px; z-index: ${zIndex}`}
		onmousedown={onWindowClick}
		role="dialog"
		tabindex="0"
		aria-label={win.title}
	>
		<!-- Title bar -->
		<div class="titlebar" onmousedown={onTitleMousedown} ondblclick={() => desktop.toggleMaximize(id)} role="presentation">
			<span class="win-icon">{win.icon}</span>
			<span class="win-title">{win.title}</span>
			<div class="win-controls">
				<button class="ctrl-btn minimize" onclick={() => desktop.minimizeWindow(id)} title="Свернуть">─</button>
				<button class="ctrl-btn maximize" onclick={() => desktop.toggleMaximize(id)} title="Развернуть">
					{win.maximized ? '❐' : '□'}
				</button>
				<button class="ctrl-btn close" onclick={() => desktop.closeWindow(id)} title="Закрыть">✕</button>
			</div>
		</div>

		<!-- Content -->
		<div class="win-content">
			{@render children()}
		</div>

		<!-- Resize handles (hidden when maximized) -->
		{#if !win.maximized}
			<div class="resize-handle n"  onmousedown={(e) => onResizeMousedown(e, 'n')}  role="presentation"></div>
			<div class="resize-handle ne" onmousedown={(e) => onResizeMousedown(e, 'ne')} role="presentation"></div>
			<div class="resize-handle e"  onmousedown={(e) => onResizeMousedown(e, 'e')}  role="presentation"></div>
			<div class="resize-handle se" onmousedown={(e) => onResizeMousedown(e, 'se')} role="presentation"></div>
			<div class="resize-handle s"  onmousedown={(e) => onResizeMousedown(e, 's')}  role="presentation"></div>
			<div class="resize-handle sw" onmousedown={(e) => onResizeMousedown(e, 'sw')} role="presentation"></div>
			<div class="resize-handle w"  onmousedown={(e) => onResizeMousedown(e, 'w')}  role="presentation"></div>
			<div class="resize-handle nw" onmousedown={(e) => onResizeMousedown(e, 'nw')} role="presentation"></div>
		{/if}
	</div>
{/if}

<style>
	.window {
		position: fixed;
		display: flex;
		flex-direction: column;
		background: #f0f0f0;
		border: 1px solid #999;
		border-radius: 8px 8px 4px 4px;
		box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.3);
		overflow: hidden;
		min-width: 200px;
		min-height: 120px;
		transition: box-shadow 0.1s;
	}

	.window.maximized {
		left: 0 !important;
		top: 0 !important;
		width: 100vw !important;
		height: calc(100vh - 48px) !important;
		border-radius: 0;
	}

	.window.focused {
		box-shadow: 2px 2px 20px rgba(0, 0, 0, 0.5);
	}

	.titlebar {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0 8px;
		height: 32px;
		background: linear-gradient(to bottom, #4a90d9, #2c6fad);
		color: white;
		cursor: grab;
		user-select: none;
		flex-shrink: 0;
	}

	.window:not(.focused) .titlebar {
		background: linear-gradient(to bottom, #888, #666);
	}

	.titlebar:active {
		cursor: grabbing;
	}

	.win-icon {
		font-size: 14px;
	}

	.win-title {
		flex: 1;
		font-size: 13px;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.win-controls {
		display: flex;
		gap: 4px;
	}

	.ctrl-btn {
		width: 24px;
		height: 20px;
		border: none;
		border-radius: 3px;
		font-size: 11px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		padding: 0;
	}

	.minimize { background: #f0a000; }
	.maximize { background: #00a020; }
	.close    { background: #d03020; }

	.ctrl-btn:hover {
		filter: brightness(1.2);
	}

	.win-content {
		flex: 1;
		overflow: auto;
		background: white;
	}

	/* Resize handles */
	.resize-handle {
		position: absolute;
		z-index: 10;
	}

	.resize-handle.n,  .resize-handle.s  { left: 6px; right: 6px; height: 5px; }
	.resize-handle.e,  .resize-handle.w  { top: 6px; bottom: 6px; width: 5px; }
	.resize-handle.ne, .resize-handle.nw,
	.resize-handle.se, .resize-handle.sw { width: 10px; height: 10px; }

	.resize-handle.n  { top: 0;    cursor: n-resize; }
	.resize-handle.s  { bottom: 0; cursor: s-resize; }
	.resize-handle.e  { right: 0;  cursor: e-resize; }
	.resize-handle.w  { left: 0;   cursor: w-resize; }
	.resize-handle.ne { top: 0;    right: 0;  cursor: ne-resize; }
	.resize-handle.nw { top: 0;    left: 0;   cursor: nw-resize; }
	.resize-handle.se { bottom: 0; right: 0;  cursor: se-resize; }
	.resize-handle.sw { bottom: 0; left: 0;   cursor: sw-resize; }
</style>
