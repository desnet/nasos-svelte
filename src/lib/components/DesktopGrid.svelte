<script lang="ts">
	import { setContext } from 'svelte'
	import { desktopGrid, type GridItem } from '$lib/stores/desktopGrid.svelte'
	import { dragState } from '$lib/stores/dragState.svelte'
	import type { Snippet } from 'svelte'

	let { cellW = 22, cellH = 22, items, onItemsChange, onItemRemove, onItemDragOut, onGhostOut, onGhostIn, allowDragOut = false, children } = $props<{
		cellW?: number
		cellH?: number
		items: GridItem[]
		onItemsChange: (items: GridItem[]) => void
		onItemRemove?: (id: number) => void
		onItemDragOut?: (id: number, clientX: number, clientY: number) => void
		onGhostOut?: (item: GridItem) => void
		onGhostIn?: (item: GridItem) => void
		allowDragOut?: boolean
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
		outsideGrid: boolean
	}

	let drag = $state<DragState | null>(null)

	// ── Body ghost (монтируется в document.body, не зависит от overflow/transform родителей) ──
	let bodyGhostEl: HTMLDivElement | null = null

	function createBodyGhost(item: GridItem) {
		if (bodyGhostEl) return
		bodyGhostEl = document.createElement('div')
		Object.assign(bodyGhostEl.style, {
			position:      'fixed',
			borderRadius:  '8px',
			pointerEvents: 'none',
			opacity:       '0.6',
			outline:       '2px dashed rgba(255,255,255,0.6)',
			outlineOffset: '-2px',
			zIndex:        '99999',
			width:         item.colSpan * cellW + 'px',
			height:        item.rowSpan * cellH + 'px',
			background:    item.color ?? 'transparent',
		})
		document.body.appendChild(bodyGhostEl)
	}

	function moveBodyGhost(clientX: number, clientY: number) {
		if (!bodyGhostEl || !drag) return
		bodyGhostEl.style.left = (clientX - drag.mouseOffsetX) + 'px'
		bodyGhostEl.style.top  = (clientY - drag.mouseOffsetY) + 'px'
	}

	function removeBodyGhost() {
		bodyGhostEl?.remove()
		bodyGhostEl = null
	}

	// Cleanup при уничтожении компонента
	$effect(() => () => removeBodyGhost())

	// ────────────────────────────────────────────────────────────────────────────

	function startDrag(item: GridItem, clientX: number, clientY: number) {
		if (!containerEl) return
		const rect = containerEl.getBoundingClientRect()
		drag = {
			item,
			mouseOffsetX: clientX - rect.left - (item.col - 1) * cellW,
			mouseOffsetY: clientY - rect.top  - (item.row - 1) * cellH,
			ghostCol: item.col,
			ghostRow: item.row,
			valid: true,
			outsideGrid: false,
		}
		dragState.start()
		window.addEventListener('mousemove', onMousemove)
		window.addEventListener('mouseup',   onMouseup)
	}

	function isDragging(id: number) {
		return drag?.item.id === id
	}

	function applyResize(item: GridItem, colSpan: number, rowSpan: number) {
		onItemsChange(desktopGrid.resize(items, item.id, colSpan, rowSpan))
	}

	function isResizeValid(item: GridItem, colSpan: number, rowSpan: number): boolean {
		if (item.col + colSpan - 1 > cols) return false
		if (item.row + rowSpan - 1 > rows) return false
		return !desktopGrid.isOccupied(items, item.col, item.row, colSpan, rowSpan, item.id)
	}

	setContext('desktopGrid', {
		startDrag, isDragging, applyResize, isResizeValid,
		get cellW() { return cellW },
		get cellH() { return cellH },
		get cols()  { return cols  },
		get rows()  { return rows  }
	})

	$effect(() => {
		if (drag) document.body.style.cursor = 'move'
		else if (dragState.resizingActive) document.body.style.cursor = 'se-resize'
		else document.body.style.cursor = ''
	})

	function onMousemove(e: MouseEvent) {
		if (!drag || !containerEl) return
		const rect = containerEl.getBoundingClientRect()

		const isOutside = allowDragOut && (
			e.clientX < rect.left || e.clientX > rect.right ||
			e.clientY < rect.top  || e.clientY > rect.bottom
		)

		if (isOutside) {
			// Создаём body-гост при первом выходе за границу
			if (!drag.outsideGrid) {
				createBodyGhost(drag.item)
				drag = { ...drag, outsideGrid: true, valid: false }
				onGhostOut?.(drag.item)
			}
			// Позицию обновляем напрямую — без Svelte-реактивности
			moveBodyGhost(e.clientX, e.clientY)
			return
		}

		// Вернулись внутрь — убираем body-гост
		if (drag.outsideGrid) {
			removeBodyGhost()
			onGhostIn?.(drag.item)
		}

		const cellLeft = e.clientX - rect.left - drag.mouseOffsetX
		const cellTop  = e.clientY - rect.top  - drag.mouseOffsetY
		const ghostCol = Math.max(1, Math.min(Math.floor(cellLeft / cellW) + 1, cols - drag.item.colSpan + 1))
		const ghostRow = Math.max(1, Math.min(Math.floor(cellTop  / cellH) + 1, rows - drag.item.rowSpan + 1))
		const valid = !desktopGrid.isOccupied(items, ghostCol, ghostRow, drag.item.colSpan, drag.item.rowSpan, drag.item.id)
		drag = { ...drag, ghostCol, ghostRow, valid, outsideGrid: false }
	}

	function onMouseup(e: MouseEvent) {
		if (!drag) return
		const overTrash = (e.target as Element)?.closest('.trash-drop-zone')
		if (overTrash) {
			onItemRemove?.(drag.item.id)
		} else if (drag.outsideGrid) {
			onItemDragOut?.(drag.item.id, e.clientX, e.clientY)
		} else if (drag.valid) {
			onItemsChange(desktopGrid.move(items, drag.item.id, drag.ghostCol, drag.ghostRow))
		}
		removeBodyGhost()
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

	<!-- Гост внутри грида (только пока не вышел за границы) -->
	{#if drag && !drag.outsideGrid}
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
