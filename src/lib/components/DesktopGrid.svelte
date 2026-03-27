<script lang="ts">
	import { setContext } from 'svelte'
	import { desktopGrid, type GridItem } from '$lib/stores/desktopGrid.svelte'
	import { dragState } from '$lib/stores/dragState.svelte'
	import type { Snippet } from 'svelte'

	let { cellW = 22, cellH = 22, items, onItemsChange, onItemRemove, children } = $props<{
		cellW?: number
		cellH?: number
		items: GridItem[]
		onItemsChange: (items: GridItem[]) => void
		onItemRemove?: (id: number) => void
		children: Snippet
	}>()

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
		dragState.start()
		window.addEventListener('mousemove', onMousemove)
		window.addEventListener('mouseup',   onMouseup)
	}

	function isDragging(id: number) {
		return drag?.item.id === id
	}

	setContext('desktopGrid', { startDrag, isDragging, get cellW() { return cellW }, get cellH() { return cellH } })

	$effect(() => {
		document.body.style.cursor = drag ? 'move' : ''
	})

	function onMousemove(e: MouseEvent) {
		if (!drag || !containerEl) return
		const rect = containerEl.getBoundingClientRect()
		const cellLeft = e.clientX - rect.left - drag.mouseOffsetX
		const cellTop  = e.clientY - rect.top  - drag.mouseOffsetY
		const ghostCol = Math.max(1, Math.min(Math.floor(cellLeft / cellW) + 1, cols - drag.item.colSpan + 1))
		const ghostRow = Math.max(1, Math.min(Math.floor(cellTop  / cellH) + 1, rows - drag.item.rowSpan + 1))
		const valid = !desktopGrid.isOccupied(items, ghostCol, ghostRow, drag.item.colSpan, drag.item.rowSpan, drag.item.id)
		drag = { ...drag, ghostCol, ghostRow, valid }
	}

	function onMouseup(e: MouseEvent) {
		if (!drag) return
		const overTrash = (e.target as Element)?.closest('.trash-drop-zone')
		if (overTrash) {
			onItemRemove?.(drag.item.id)
		} else if (drag.valid) {
			onItemsChange(desktopGrid.move(items, drag.item.id, drag.ghostCol, drag.ghostRow))
		}
		drag = null
		dragState.end()
		window.removeEventListener('mousemove', onMousemove)
		window.removeEventListener('mouseup',   onMouseup)
	}
</script>

<div
	class="grid"
	class:grid-dragging={drag !== null}
	style="--cell-w: {cellW}px; --cell-h: {cellH}px;"
	bind:this={containerEl}
	bind:clientWidth={containerW}
	bind:clientHeight={containerH}
	role="presentation"
>
	{@render children()}

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
				background: {drag.item.color ?? 'transparent'};
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
	}

	.grid-dragging {
		background-image:
			linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px),
			linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px);
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
