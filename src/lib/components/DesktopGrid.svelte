<script lang="ts">
	import { desktopGrid, type GridItem } from '$lib/stores/desktopGrid.svelte'
	import DesktopGridCell from '$lib/components/DesktopGridCell.svelte'

	let { cellW = 22, cellH = 22 } = $props<{ cellW?: number; cellH?: number }>()

	let containerEl = $state<HTMLDivElement | undefined>(undefined)
	let containerW = $state(0)
	let containerH = $state(0)

	const cols = $derived(Math.floor(containerW / cellW))
	const rows = $derived(Math.floor(containerH / cellH))

	type DragState = {
		item: GridItem
		mouseOffsetX: number
		mouseOffsetY: number
		ghostCol: number
		ghostRow: number
		valid: boolean
	}

	let drag = $state<DragState | null>(null)

	function startDrag(item: GridItem, clientX: number, clientY: number) {
		if (!containerEl) return
		const rect = containerEl.getBoundingClientRect()
		drag = {
			item,
			mouseOffsetX: clientX - rect.left - (item.col - 1) * cellW,
			mouseOffsetY: clientY - rect.top  - (item.row - 1) * cellH,
			ghostCol: item.col,
			ghostRow: item.row,
			valid: true
		}
		window.addEventListener('mousemove', onMousemove)
		window.addEventListener('mouseup',   onMouseup)
	}

	function onMousemove(e: MouseEvent) {
		if (!drag || !containerEl) return
		const rect = containerEl.getBoundingClientRect()
		const cellLeft = e.clientX - rect.left - drag.mouseOffsetX
		const cellTop  = e.clientY - rect.top  - drag.mouseOffsetY
		const ghostCol = Math.max(1, Math.min(Math.floor(cellLeft / cellW) + 1, cols - drag.item.colSpan + 1))
		const ghostRow = Math.max(1, Math.min(Math.floor(cellTop  / cellH) + 1, rows - drag.item.rowSpan + 1))
		const valid = !desktopGrid.isOccupied(ghostCol, ghostRow, drag.item.colSpan, drag.item.rowSpan, drag.item.id)
		drag = { ...drag, ghostCol, ghostRow, valid }
	}

	function onMouseup() {
		if (!drag) return
		if (drag.valid) {
			desktopGrid.move(drag.item.id, drag.ghostCol, drag.ghostRow)
		}
		drag = null
		window.removeEventListener('mousemove', onMousemove)
		window.removeEventListener('mouseup',   onMouseup)
	}
</script>

<div
	class="grid"
	style="--cell-w: {cellW}px; --cell-h: {cellH}px;"
	bind:this={containerEl}
	bind:clientWidth={containerW}
	bind:clientHeight={containerH}
	role="presentation"
>
	{#each desktopGrid.items as item (item.id)}
		<DesktopGridCell
			{item}
			{cellW}
			{cellH}
			isDragging={drag?.item.id === item.id}
			onDragStart={startDrag}
		/>
	{/each}

	<!-- Ghost during drag -->
	{#if drag}
		<div
			class="ghost"
			class:ghost-valid={drag.valid}
			class:ghost-invalid={!drag.valid}
			style="
				left:   {(drag.ghostCol - 1) * cellW}px;
				top:    {(drag.ghostRow - 1) * cellH}px;
				width:  {drag.item.colSpan * cellW}px;
				height: {drag.item.rowSpan * cellH}px;
				background: {drag.item.color};
			"
		></div>
	{/if}
</div>

<style>
	.grid {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background-image:
			linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
			linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
		background-size: var(--cell-w) var(--cell-h);
	}

	.ghost {
		position: absolute;
		border-radius: 8px;
		pointer-events: none;
		transition: left 0.06s, top 0.06s;
	}

	.ghost-valid {
		opacity: 0.75;
		outline: 2px solid rgba(255, 255, 255, 0.8);
		outline-offset: -2px;
	}

	.ghost-invalid {
		opacity: 0.35;
		outline: 2px solid rgba(210, 55, 70, 0.9);
		outline-offset: -2px;
		filter: grayscale(0.4);
	}
</style>
