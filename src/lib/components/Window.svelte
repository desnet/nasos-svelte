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
		let newW = rsStartW, newH = rsStartH, newX = rsStartWinX, newY = rsStartWinY

		if (resizeDir.includes('e')) newW = Math.max(MIN_W, rsStartW + dx)
		if (resizeDir.includes('s')) newH = Math.max(MIN_H, rsStartH + dy)
		if (resizeDir.includes('w')) { newW = Math.max(MIN_W, rsStartW - dx); newX = rsStartWinX + rsStartW - newW }
		if (resizeDir.includes('n')) { newH = Math.max(MIN_H, rsStartH - dy); newY = rsStartWinY + rsStartH - newH }

		desktop.moveWindow(id, newX, newY)
		desktop.resizeWindow(id, newW, newH)
	}

	function onMouseup() {
		dragging = false
		resizing = false
		window.removeEventListener('mousemove', onMousemove)
		window.removeEventListener('mouseup', onMouseup)
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
		onmousedown={() => desktop.focusWindow(id)}
		role="dialog"
		tabindex="0"
		aria-label={win.title}
	>
		<!-- Title bar -->
		<div class="titlebar" onmousedown={onTitleMousedown} ondblclick={() => desktop.toggleMaximize(id)} role="presentation">
			<div class="win-controls">
				<button class="ctrl-btn close"    onclick={() => desktop.closeWindow(id)}    title="Закрыть">
					<svg viewBox="0 0 10 10"><path d="M2.5 2.5l5 5M7.5 2.5l-5 5"/></svg>
				</button>
				<button class="ctrl-btn minimize" onclick={() => desktop.minimizeWindow(id)} title="Свернуть">
					<svg viewBox="0 0 10 10"><path d="M2 5h6"/></svg>
				</button>
				<button class="ctrl-btn maximize" onclick={() => desktop.toggleMaximize(id)} title="Развернуть">
					<svg viewBox="0 0 10 10"><path d="M2 6.5V8h1.5M8 3.5V2H6.5M2 3.5V2H3.5M8 6.5V8H6.5"/></svg>
				</button>
			</div>
			<span class="win-title">
				<span class="win-title-icon">{win.icon}</span>
				{win.title}
			</span>
		</div>

		<!-- Content -->
		<div class="win-content">
			{@render children()}
		</div>

		<!-- Resize handles -->
		{#if !win.maximized}
			<div class="rh n"  onmousedown={(e) => onResizeMousedown(e, 'n')}  role="presentation"></div>
			<div class="rh ne" onmousedown={(e) => onResizeMousedown(e, 'ne')} role="presentation"></div>
			<div class="rh e"  onmousedown={(e) => onResizeMousedown(e, 'e')}  role="presentation"></div>
			<div class="rh se" onmousedown={(e) => onResizeMousedown(e, 'se')} role="presentation"></div>
			<div class="rh s"  onmousedown={(e) => onResizeMousedown(e, 's')}  role="presentation"></div>
			<div class="rh sw" onmousedown={(e) => onResizeMousedown(e, 'sw')} role="presentation"></div>
			<div class="rh w"  onmousedown={(e) => onResizeMousedown(e, 'w')}  role="presentation"></div>
			<div class="rh nw" onmousedown={(e) => onResizeMousedown(e, 'nw')} role="presentation"></div>
		{/if}
	</div>
{/if}

<style>
	.window {
		position: fixed;
		display: flex;
		flex-direction: column;
		border-radius: 12px;
		overflow: hidden;
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.18),
			0 4px 8px rgba(0, 0, 0, 0.12),
			0 20px 60px rgba(0, 0, 0, 0.28);
		min-width: 200px;
		min-height: 120px;
		transition: box-shadow 0.15s;
	}

	.window.focused {
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.22),
			0 8px 16px rgba(0, 0, 0, 0.18),
			0 30px 80px rgba(0, 0, 0, 0.38);
	}

	.window.maximized {
		left: 0 !important;
		top: 28px !important;
		width: 100vw !important;
		height: calc(100vh - 28px - 88px) !important;
		border-radius: 0;
	}

	.titlebar {
		display: flex;
		align-items: center;
		height: 32px;
		padding: 0 12px;
		background: rgba(235, 235, 240, 0.92);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		cursor: grab;
		user-select: none;
		flex-shrink: 0;
		position: relative;
	}

	.window:not(.focused) .titlebar {
		background: rgba(215, 215, 220, 0.88);
	}

	.titlebar:active { cursor: grabbing; }

	.win-controls {
		display: flex;
		gap: 5px;
		flex-shrink: 0;
	}

	.ctrl-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 16px;
		border-radius: 8px;
		border: none;
		cursor: pointer;
		padding: 0;
		transition: filter 0.12s, opacity 0.12s;
	}
	.ctrl-btn svg {
		width: 9px;
		height: 9px;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
		opacity: 0.75;
		transition: opacity 0.12s;
	}
	.ctrl-btn:hover svg { opacity: 1; }

	.ctrl-btn.close    { background: rgba(210, 55,  70,  0.75); }
	.ctrl-btn.minimize { background: rgba(70,  100, 210, 0.75); }
	.ctrl-btn.maximize { background: rgba(40,  170, 130, 0.75); }

	.ctrl-btn.close    svg { stroke: rgba(255,180,180,0.9); }
	.ctrl-btn.minimize svg { stroke: rgba(180,200,255,0.9); }
	.ctrl-btn.maximize svg { stroke: rgba(160,240,210,0.9); }

	.ctrl-btn:hover { filter: brightness(1.2); }

	.window:not(.focused) .ctrl-btn {
		background: rgba(0, 0, 0, 0.12) !important;
		filter: none;
	}
	.window:not(.focused) .ctrl-btn svg { opacity: 0.3; }

	.win-title {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		font-size: 12px;
		font-weight: 600;
		color: #2a2a2a;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 60%;
		display: flex;
		align-items: center;
		gap: 5px;
		pointer-events: none;
	}

	.window:not(.focused) .win-title { color: #888; }

	.win-title-icon { font-size: 13px; }

	.win-content {
		flex: 1;
		overflow: auto;
		background: #ffffff;
	}

	/* Resize handles */
	.rh { position: absolute; z-index: 10; }
	.rh.n, .rh.s  { left: 6px; right: 6px; height: 5px; }
	.rh.e, .rh.w  { top: 6px; bottom: 6px; width: 5px; }
	.rh.ne, .rh.nw, .rh.se, .rh.sw { width: 10px; height: 10px; }

	.rh.n  { top: 0;    cursor: n-resize; }
	.rh.s  { bottom: 0; cursor: s-resize; }
	.rh.e  { right: 0;  cursor: e-resize; }
	.rh.w  { left: 0;   cursor: w-resize; }
	.rh.ne { top: 0;    right: 0;  cursor: ne-resize; }
	.rh.nw { top: 0;    left: 0;   cursor: nw-resize; }
	.rh.se { bottom: 0; right: 0;  cursor: se-resize; }
	.rh.sw { bottom: 0; left: 0;   cursor: sw-resize; }
</style>
