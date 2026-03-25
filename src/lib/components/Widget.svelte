<script lang="ts">
	import type { Snippet } from 'svelte'
	import { widgets, type WidgetType } from '$lib/stores/widgets.svelte'

	let { id, type, x, y, children } = $props<{
		id: number
		type: WidgetType
		x: number
		y: number
		children: Snippet
	}>()

	const meta = $derived(widgets.meta(type))

	const DRAG_THRESHOLD = 4

	let dragging = $state(false)
	let hasMoved = false
	let dragX = $state(0)
	let dragY = $state(0)
	let dragOffsetX = 0
	let dragOffsetY = 0
	let dragStartX = 0
	let dragStartY = 0

	function onHeaderMousedown(e: MouseEvent) {
		if (e.button !== 0) return
		dragging = true
		hasMoved = false
		dragX = x
		dragY = y
		dragOffsetX = e.clientX - x
		dragOffsetY = e.clientY - y
		dragStartX = e.clientX
		dragStartY = e.clientY
		window.addEventListener('mousemove', onMousemove)
		window.addEventListener('mouseup', onMouseup)
	}

	function onMousemove(e: MouseEvent) {
		if (!dragging) return
		const dx = e.clientX - dragStartX
		const dy = e.clientY - dragStartY
		if (!hasMoved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
		hasMoved = true
		dragX = Math.max(0,  Math.min(e.clientX - dragOffsetX, window.innerWidth - 200))
		dragY = Math.max(44, Math.min(e.clientY - dragOffsetY, window.innerHeight - 80))
	}

	function onMouseup(e: MouseEvent) {
		if (hasMoved) {
			widgets.move(id, e.clientX - dragOffsetX, e.clientY - dragOffsetY)
		}
		dragging = false
		window.removeEventListener('mousemove', onMousemove)
		window.removeEventListener('mouseup', onMouseup)
	}
</script>

<div class="widget" style="left: {dragging ? dragX : x}px; top: {dragging ? dragY : y}px" class:dragging>
	<div class="widget-header" onmousedown={onHeaderMousedown} role="presentation">
		<span class="widget-icon">{meta.icon}</span>
		<span class="widget-title">{meta.title}</span>
		<button class="widget-close" onclick={() => widgets.remove(id)} title="Закрыть">✕</button>
	</div>
	<div class="widget-body">
		{@render children()}
	</div>
</div>

<style>
	.widget {
		position: absolute;
		min-width: 180px;
		background: rgba(15, 25, 45, 0.82);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 10px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
		color: white;
		z-index: 50;
		overflow: hidden;
		user-select: none;
	}

	.widget.dragging {
		opacity: 0.9;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
		cursor: grabbing;
	}

	.widget-header {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		background: rgba(255, 255, 255, 0.06);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		cursor: grab;
	}

	.widget.dragging .widget-header {
		cursor: grabbing;
	}

	.widget-icon { font-size: 13px; }

	.widget-title {
		flex: 1;
		font-size: 11px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
		letter-spacing: 0.3px;
		text-transform: uppercase;
	}

	.widget-close {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.4);
		cursor: pointer;
		font-size: 11px;
		padding: 0 2px;
		line-height: 1;
	}
	.widget-close:hover { color: white; }

	.widget-body {
		padding: 12px;
	}
</style>
