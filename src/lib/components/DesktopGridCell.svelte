<script lang="ts">
  import { getContext } from 'svelte';
  import type { GridItem } from '$lib/stores/desktopGrid.svelte';
  import { drag } from '$lib/stores/drag.svelte';
  import type { Snippet } from 'svelte';

  let { item, children } = $props<{
    item: GridItem;
    children?: Snippet;
  }>();

  const grid = getContext<{
    startDrag: (item: GridItem, clientX: number, clientY: number) => void;
    isDragging: (id: number) => boolean;
    applyResize: (item: GridItem, colSpan: number, rowSpan: number) => void;
    isResizeValid: (item: GridItem, colSpan: number, rowSpan: number) => boolean;
    cellW: number;
    cellH: number;
    cols: number;
    rows: number;
  }>('desktopGrid');

  // ── Drag ────────────────────────────────────────────────────────────────────
  const DRAG_THRESHOLD = 2;
  let pending: { startX: number; startY: number } | null = null;

  function onMousedown(e: MouseEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    pending = { startX: e.clientX, startY: e.clientY };
    window.addEventListener('mousemove', onPendingMove);
    window.addEventListener('mouseup', cancelPending);
  }

  function onPendingMove(e: MouseEvent) {
    if (!pending) return;
    if (Math.hypot(e.clientX - pending.startX, e.clientY - pending.startY) >= DRAG_THRESHOLD) {
      grid.startDrag(item, pending.startX, pending.startY);
      cancelPending();
    }
  }

  function cancelPending() {
    pending = null;
    window.removeEventListener('mousemove', onPendingMove);
    window.removeEventListener('mouseup', cancelPending);
  }

  // ── Resize ───────────────────────────────────────────────────────────────────
  type ResizeState = {
    minColSpan: number;
    minRowSpan: number;
    curColSpan: number;
    curRowSpan: number;
    startX: number;
    startY: number;
    valid: boolean;
  };

  let resizing = $state<ResizeState | null>(null);
  let cellEl = $state<HTMLElement | undefined>(undefined);

  function startResize(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!cellEl) return;

    // Temporarily let the cell shrink to its content's natural size to measure minimum
    const s = cellEl.style;
    const [sw, sh, so] = [s.width, s.height, s.overflow];
    s.width = 'max-content';
    s.height = 'max-content';
    s.overflow = 'visible';
    const minW = cellEl.offsetWidth;
    const minH = cellEl.offsetHeight;
    s.width = sw;
    s.height = sh;
    s.overflow = so;

    resizing = {
      minColSpan: Math.max(1, Math.ceil(minW / grid.cellW)),
      minRowSpan: Math.max(1, Math.ceil(minH / grid.cellH)),
      curColSpan: item.colSpan,
      curRowSpan: item.rowSpan,
      startX: e.clientX,
      startY: e.clientY,
      valid: true
    };
    drag.startResize();
    window.addEventListener('mousemove', onResizeMove);
    window.addEventListener('mouseup', onResizeUp);
  }

  function onResizeMove(e: MouseEvent) {
    if (!resizing) return;
    const dCol = Math.round((e.clientX - resizing.startX) / grid.cellW);
    const dRow = Math.round((e.clientY - resizing.startY) / grid.cellH);
    const newColSpan = Math.max(resizing.minColSpan, item.colSpan + dCol);
    const newRowSpan = Math.max(resizing.minRowSpan, item.rowSpan + dRow);
    const valid = grid.isResizeValid(item, newColSpan, newRowSpan);
    resizing = { ...resizing, curColSpan: newColSpan, curRowSpan: newRowSpan, valid };
  }

  function onResizeUp() {
    if (!resizing) return;
    if (resizing.valid) grid.applyResize(item, resizing.curColSpan, resizing.curRowSpan);
    resizing = null;
    drag.endResize();
    window.removeEventListener('mousemove', onResizeMove);
    window.removeEventListener('mouseup', onResizeUp);
  }

  const dispColSpan = $derived(resizing ? resizing.curColSpan : item.colSpan);
  const dispRowSpan = $derived(resizing ? resizing.curRowSpan : item.rowSpan);
</script>

<div
  class="cell"
  class:dragging={grid.isDragging(item.id)}
  class:resize-active={resizing !== null}
  class:resize-invalid={resizing !== null && !resizing.valid}
  style="
		left: {(item.col - 1) * grid.cellW}px;
		top:  {(item.row - 1) * grid.cellH}px;
		width:  {dispColSpan * grid.cellW}px;
		height: {dispRowSpan * grid.cellH}px;
		background: {item.color ?? 'transparent'};
	"
  bind:this={cellEl}
  onmousedown={onMousedown}
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === 'Enter' && grid.startDrag(item, 0, 0)}
>
  {#if children}
    {@render children()}
  {/if}

  {#if item.resizable}
    <div class="resize-handle" onmousedown={startResize} role="presentation"></div>
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
    transition:
      opacity 0.15s,
      background 0.12s;
    overflow: hidden;
  }

  .cell:hover {
    background: rgba(255, 255, 255, 0.1) !important;
  }

  .cell.dragging {
    opacity: 0.4;
  }

  .cell.resize-active {
    outline: 2px solid rgba(255, 255, 255, 0.6);
    outline-offset: -2px;
    transition: none;
  }

  .cell.resize-invalid {
    outline-color: rgba(210, 55, 70, 0.9);
  }

  .resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 18px;
    height: 18px;
    cursor: se-resize;
    opacity: 0;
    transition: opacity 0.15s;
    /* 3 dots in a right-angle triangle pattern */
    background-image:
      radial-gradient(circle, rgba(255, 255, 255, 0.7) 1.5px, transparent 1.5px),
      radial-gradient(circle, rgba(255, 255, 255, 0.7) 1.5px, transparent 1.5px),
      radial-gradient(circle, rgba(255, 255, 255, 0.7) 1.5px, transparent 1.5px);
    background-size:
      5px 5px,
      5px 5px,
      5px 5px;
    background-position:
      11px 11px,
      6px 11px,
      11px 6px;
    background-repeat: no-repeat;
  }

  .cell:hover .resize-handle {
    opacity: 1;
  }
</style>
