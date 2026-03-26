<script lang="ts">
	import type { Snippet } from 'svelte'
	import { widgets, type WidgetType } from '$lib/stores/widgets.svelte'
	import { dragState } from '$lib/stores/dragState.svelte'

	let { id, type, x, y, width = undefined, children } = $props<{
		id: number
		type: WidgetType
		x: number
		y: number
		width?: number
		children: Snippet
	}>()

	const DRAG_THRESHOLD = 4

	let dragging = $state(false)
	let hasMoved = false
	let dragX = $state(0)
	let dragY = $state(0)
	let dragOffsetX = 0
	let dragOffsetY = 0
	let dragStartX = 0
	let dragStartY = 0

	function onWidgetMousedown(e: MouseEvent) {
		if (e.button !== 0) return
		dragging = true
		hasMoved = false
		dragX = x
		dragY = y
		dragOffsetX = e.clientX - x
		dragOffsetY = e.clientY - y
		dragStartX = e.clientX
		dragStartY = e.clientY
		dragState.start()
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
		dragState.end()
		if (hasMoved) {
			const overTrash = (e.target as Element)?.closest('.trash-drop-zone')
			if (overTrash) {
				widgets.remove(id)
			} else {
				widgets.move(id, e.clientX - dragOffsetX, e.clientY - dragOffsetY)
			}
		}
		dragging = false
		window.removeEventListener('mousemove', onMousemove)
		window.removeEventListener('mouseup', onMouseup)
	}
</script>

<div class="widget" style="left: {dragging ? dragX : x}px; top: {dragging ? dragY : y}px; {width ? `width: ${width}px` : ''}" class:dragging onmousedown={onWidgetMousedown} role="presentation">
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
		cursor: grab;
	}

	.widget.dragging {
		opacity: 0.9;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
		cursor: grabbing;
	}

	.widget-body {
		padding: 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
