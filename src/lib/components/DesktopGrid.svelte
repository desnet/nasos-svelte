<script lang="ts">
  import { setContext } from 'svelte';
  import { drag, type DragItem } from '$lib/stores/drag.svelte';
  import type { Snippet } from 'svelte';

  export type GridItem = {
    id: number;
    col: number;
    row: number;
    colSpan: number;
    rowSpan: number;
    color?: string;
    resizable?: boolean;
  };

  function isOccupied(
    items: GridItem[],
    col: number,
    row: number,
    colSpan: number,
    rowSpan: number,
    excludeId?: number
  ): boolean {
    return items.some((item) => {
      if (item.id === excludeId) return false;
      return (
        col < item.col + item.colSpan &&
        col + colSpan > item.col &&
        row < item.row + item.rowSpan &&
        row + rowSpan > item.row
      );
    });
  }

  let {
    cellW = 22,
    cellH = 22,
    items,
    onMove,
    onResize,
    onDrop,
    onItemDragOut,
    onGhostOut,
    onGhostIn,
    children
  } = $props<{
    cellW?: number;
    cellH?: number;
    items: GridItem[];
    onMove?: (id: number, col: number, row: number) => void;
    onResize?: (id: number, colSpan: number, rowSpan: number) => void;
    onDrop?: (items: DragItem[], col: number, row: number) => void;
    onItemDragOut?: (id: number, clientX: number, clientY: number) => void;
    onGhostOut?: (
      item: GridItem,
      mouseOffsetX: number,
      mouseOffsetY: number,
      clientX: number,
      clientY: number,
      adopt: () => HTMLDivElement | null
    ) => void;
    onGhostIn?: (item: GridItem) => void;
    children: Snippet;
  }>();

  let containerEl = $state<HTMLDivElement | undefined>(undefined);
  let containerW = $state(0);
  let containerH = $state(0);

  const cols = $derived(Math.floor(containerW / cellW));
  const rows = $derived(Math.floor(containerH / cellH));

  // ghostCol === -1 означает «курсор за пределами грида»
  type DragState = {
    item: GridItem;
    mouseOffsetX: number;
    mouseOffsetY: number;
    ghostCol: number;
    ghostRow: number;
    valid: boolean;
  };

  let gridDrag = $state<DragState | null>(null);

  // ── onDrop: внешний элемент приземлился на этот грид ────────────────────────
  $effect(() => {
    if (!onDrop) return;
    const externalDrop = drag.pendingDrops.find(
      (d) => (d.item.data as { type?: string })?.type !== 'grid'
    );
    if (!externalDrop || !containerEl) return;

    const rect = containerEl.getBoundingClientRect();
    const inside =
      externalDrop.clientX >= rect.left &&
      externalDrop.clientX <= rect.right &&
      externalDrop.clientY >= rect.top &&
      externalDrop.clientY <= rect.bottom;

    if (!inside) return;

    const col = Math.max(
      1,
      Math.min(Math.floor((externalDrop.clientX - rect.left) / cellW) + 1, cols)
    );
    const row = Math.max(
      1,
      Math.min(Math.floor((externalDrop.clientY - rect.top) / cellH) + 1, rows)
    );

    onDrop?.([externalDrop.item], col, row);
    drag.clearDrop(externalDrop.item.id);
  });

  // ── External drag snap-to-grid ───────────────────────────────────────────────
  let externalDragOver = $state(false);

  $effect(() => {
    const externalItem = drag.items.find(
      (i) => (i.data as { type?: string })?.type !== 'grid'
    );
    if (!externalItem) {
      externalDragOver = false;
      return;
    }

    function onExternalMove(e: MouseEvent) {
      if (!containerEl || !externalItem) return;
      const rect = containerEl.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      externalDragOver = inside;

      if (!inside) return;

      const col = Math.max(
        1,
        Math.min(Math.floor((e.clientX - rect.left - externalItem.mouseOffX) / cellW) + 1, cols)
      );
      const row = Math.max(
        1,
        Math.min(Math.floor((e.clientY - rect.top - externalItem.mouseOffY) / cellH) + 1, rows)
      );
      const snappedX = rect.left + (col - 1) * cellW;
      const snappedY = rect.top + (row - 1) * cellH;
      drag.snapGhost(externalItem.id, snappedX, snappedY);
    }

    window.addEventListener('mousemove', onExternalMove);
    return () => {
      window.removeEventListener('mousemove', onExternalMove);
      externalDragOver = false;
    };
  });

  // ── Grid drag ────────────────────────────────────────────────────────────────

  function startDrag(item: GridItem, clientX: number, clientY: number) {
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const mouseOffsetX = clientX - rect.left - (item.col - 1) * cellW;
    const mouseOffsetY = clientY - rect.top - (item.row - 1) * cellH;

    // Создаём глобальный ghost сразу
    const ghost = document.createElement('div');
    Object.assign(ghost.style, {
      position: 'fixed',
      width: item.colSpan * cellW + 'px',
      height: item.rowSpan * cellH + 'px',
      borderRadius: '8px',
      pointerEvents: 'none',
      opacity: '0.75',
      outline: '2px solid rgba(255,255,255,0.8)',
      outlineOffset: '-2px',
      zIndex: '99999',
      background: item.color ?? 'transparent'
    });
    document.body.appendChild(ghost);

    gridDrag = {
      item,
      mouseOffsetX,
      mouseOffsetY,
      ghostCol: item.col,
      ghostRow: item.row,
      valid: true
    };

    drag.begin({
      id: item.id,
      data: { type: 'grid', gridItem: item },
      ghostEl: ghost,
      mouseOffX: mouseOffsetX,
      mouseOffY: mouseOffsetY,
      snappedX: null,
      snappedY: null,
      onMove: (e) => onMousemove(e),
      onUp: (e) => onMouseup(e)
    });
  }

  // Передаёт владение ghost-элементом внешнему обработчику (Launcher)
  function adoptGhost(): HTMLDivElement | null {
    const dragItem = drag.items.find((i) => i.id === gridDrag?.item.id);
    if (!dragItem?.ghostEl) return null;
    const el = dragItem.ghostEl as HTMLDivElement;
    dragItem.ghostEl = null; // Предотвращаем авто-удаление в drag.end()
    gridDrag = null;
    return el;
  }

  function isDragging(id: number) {
    return gridDrag?.item.id === id;
  }

  function applyResize(item: GridItem, colSpan: number, rowSpan: number) {
    onResize?.(item.id, colSpan, rowSpan);
  }

  function isResizeValid(item: GridItem, colSpan: number, rowSpan: number): boolean {
    if (item.col + colSpan - 1 > cols) return false;
    if (item.row + rowSpan - 1 > rows) return false;
    return !isOccupied(items, item.col, item.row, colSpan, rowSpan, item.id);
  }

  setContext('desktopGrid', {
    startDrag,
    isDragging,
    applyResize,
    isResizeValid,
    get cellW() {
      return cellW;
    },
    get cellH() {
      return cellH;
    },
    get cols() {
      return cols;
    },
    get rows() {
      return rows;
    }
  });

  $effect(() => {
    if (gridDrag) document.body.style.cursor = 'move';
    else if (drag.resizing) document.body.style.cursor = 'se-resize';
    else document.body.style.cursor = '';
  });

  function onMousemove(e: MouseEvent) {
    if (!gridDrag || !containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const dragItem = drag.items.find((i) => i.id === gridDrag!.item.id);

    const isInside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!isInside && onGhostOut) {
      // Сигнал только при первом выходе за границу
      if (gridDrag.ghostCol !== -1) {
        const { item, mouseOffsetX, mouseOffsetY } = gridDrag;
        gridDrag = { ...gridDrag, ghostCol: -1, valid: false };
        // Применяем стили до adoptGhost — после него ghostEl будет null
        if (dragItem?.ghostEl) {
          dragItem.ghostEl.style.transition = '';
          dragItem.ghostEl.style.outline = '2px dashed rgba(255,255,255,0.6)';
          dragItem.ghostEl.style.opacity = '0.6';
          dragItem.ghostEl.style.filter = '';
        }
        onGhostOut(item, mouseOffsetX, mouseOffsetY, e.clientX, e.clientY, adoptGhost);
      }
      return;
    }

    // Вернулись внутрь грида
    if (gridDrag.ghostCol === -1) onGhostIn?.(gridDrag.item);

    const cellLeft = e.clientX - rect.left - gridDrag.mouseOffsetX;
    const cellTop = e.clientY - rect.top - gridDrag.mouseOffsetY;
    const ghostCol = Math.max(
      1,
      Math.min(Math.floor(cellLeft / cellW) + 1, cols - gridDrag.item.colSpan + 1)
    );
    const ghostRow = Math.max(
      1,
      Math.min(Math.floor(cellTop / cellH) + 1, rows - gridDrag.item.rowSpan + 1)
    );
    const valid = !isOccupied(
      items,
      ghostCol,
      ghostRow,
      gridDrag.item.colSpan,
      gridDrag.item.rowSpan,
      gridDrag.item.id
    );
    gridDrag = { ...gridDrag, ghostCol, ghostRow, valid };

    if (dragItem?.ghostEl) {
      // Позиционируем напрямую без transition (snapGhost вызывал бы лаг)
      dragItem.ghostEl.style.transition = '';
      dragItem.ghostEl.style.left = rect.left + (ghostCol - 1) * cellW + 'px';
      dragItem.ghostEl.style.top = rect.top + (ghostRow - 1) * cellH + 'px';
      dragItem.ghostEl.style.outline = valid
        ? '2px solid rgba(255,255,255,0.8)'
        : '2px solid rgba(210,55,70,0.9)';
      dragItem.ghostEl.style.opacity = valid ? '0.75' : '0.35';
      dragItem.ghostEl.style.filter = valid ? '' : 'grayscale(0.4)';
    }
  }

  function onMouseup(e: MouseEvent) {
    if (!gridDrag) return;
    if (gridDrag.ghostCol === -1) {
      onItemDragOut?.(gridDrag.item.id, e.clientX, e.clientY);
    } else if (gridDrag.valid) {
      onMove?.(gridDrag.item.id, gridDrag.ghostCol, gridDrag.ghostRow);
    }
    // Ghost удаляется автоматически через drag.end() в onWindowUp
    gridDrag = null;
  }
</script>

<div
  class="grid"
  class:grid-dragging={gridDrag !== null || externalDragOver}
  style="--cell-w: {cellW}px; --cell-h: {cellH}px;"
  bind:this={containerEl}
  bind:clientWidth={containerW}
  bind:clientHeight={containerH}
  role="presentation"
>
  {@render children()}
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
      linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
    background-size: var(--cell-w) var(--cell-h);
  }
</style>
