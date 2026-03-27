<script lang="ts">
	import { getContext } from 'svelte'
	import type { GridItem } from '$lib/stores/desktopGrid.svelte'
	import type { Snippet } from 'svelte'

	let { item, children } = $props<{
		item: GridItem
		children?: Snippet
	}>()

	const grid = getContext<{
		startDrag: (item: GridItem, clientX: number, clientY: number) => void
		isDragging: (id: number) => boolean
		cellW: number
		cellH: number
	}>('desktopGrid')

	const DRAG_THRESHOLD = 4
	let pending: { startX: number; startY: number } | null = null

	function onMousedown(e: MouseEvent) {
		if (e.button !== 0) return
		e.preventDefault()
		pending = { startX: e.clientX, startY: e.clientY }
		window.addEventListener('mousemove', onPendingMove)
		window.addEventListener('mouseup', cancelPending)
	}

	function onPendingMove(e: MouseEvent) {
		if (!pending) return
		if (Math.hypot(e.clientX - pending.startX, e.clientY - pending.startY) >= DRAG_THRESHOLD) {
			grid.startDrag(item, pending.startX, pending.startY)
			cancelPending()
		}
	}

	function cancelPending() {
		pending = null
		window.removeEventListener('mousemove', onPendingMove)
		window.removeEventListener('mouseup', cancelPending)
	}
</script>

<div
	class="cell"
	class:dragging={grid.isDragging(item.id)}
	style="
		left: {(item.col - 1) * grid.cellW}px;
		top:  {(item.row - 1) * grid.cellH}px;
		width:  {item.colSpan * grid.cellW}px;
		height: {item.rowSpan * grid.cellH}px;
		background: {item.color ?? 'transparent'};
	"
	onmousedown={onMousedown}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && grid.startDrag(item, 0, 0)}
>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.cell {
		position: absolute;
		border-radius: 8px;
		cursor: default;
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;
		transition: opacity 0.15s, background 0.12s;
		overflow: hidden;
	}

	.cell:hover {
		background: rgba(255, 255, 255, 0.1) !important;
	}

	.cell.dragging {
		opacity: 0.4;
	}

</style>
