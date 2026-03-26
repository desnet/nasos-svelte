<script lang="ts">
	import type { GridItem } from '$lib/stores/desktopGrid.svelte'
	import type { Snippet } from 'svelte'

	let {
		item,
		cellW,
		cellH,
		isDragging = false,
		onDragStart,
		children
	} = $props<{
		item: GridItem
		cellW: number
		cellH: number
		isDragging?: boolean
		onDragStart: (item: GridItem, clientX: number, clientY: number) => void
		children?: Snippet
	}>()

	function onMousedown(e: MouseEvent) {
		if (e.button !== 0) return
		e.preventDefault()
		onDragStart(item, e.clientX, e.clientY)
	}
</script>

<div
	class="cell"
	class:dragging={isDragging}
	style="
		left: {(item.col - 1) * cellW}px;
		top:  {(item.row - 1) * cellH}px;
		width:  {item.colSpan * cellW}px;
		height: {item.rowSpan * cellH}px;
		background: {item.color};
	"
	onmousedown={onMousedown}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && onDragStart(item, 0, 0)}
>
	{#if children}
		{@render children()}
	{:else}
		<span class="cell-label">{item.label}</span>
	{/if}
</div>

<style>
	.cell {
		position: absolute;
		border-radius: 8px;
		cursor: grab;
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;
		transition: opacity 0.15s, box-shadow 0.15s;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
		overflow: hidden;
	}

	.cell:hover {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
	}

	.cell.dragging {
		opacity: 0.4;
		cursor: grabbing;
	}

	.cell-label {
		font-size: 12px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
		pointer-events: none;
	}
</style>
