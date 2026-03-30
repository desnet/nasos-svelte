<script lang="ts">
  import { setContext } from 'svelte';
  import { desktopGrid, type GridItem } from '$lib/stores/desktopGrid.svelte';
  import { drag } from '$lib/stores/drag.svelte';
  import type { Snippet } from 'svelte';

  let {
    cellW = 22,
    cellH = 22,
    items,
    onItemsChange,
    onItemDragOut,
    onGhostOut,
    onGhostIn,
    allowDragOut = false,
    children
  } = $props<{
    cellW?: number;
    cellH?: number;
    items: GridItem[];
    onItemsChange: (items: GridItem[]) => void;
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
    allowDragOut?: boolean;
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

  // ── External drag (launcher) snap-to-grid ────────────────────────────────────
  let externalDragOver = $state(false);

  $effect(() => {
    const launcherItem = drag.items.find((i) => (i.data as { type?: string })?.type === 'launcher');
    if (!launcherItem) {
      externalDragOver = false;
      return;
    }

    function onExternalMove(e: MouseEvent) {
      if (!containerEl || !launcherItem) return;
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
        Math.min(Math.floor((e.clientX - rect.left - launcherItem.mouseOffX) / cellW) + 1, cols)
      );
      const row = Math.max(
        1,
        Math.min(Math.floor((e.clientY - rect.top - launcherItem.mouseOffY) / cellH) + 1, rows)
      );
      const snappedX = rect.left + (col - 1) * cellW;
      const snappedY = rect.top + (row - 1) * cellH;
      drag.snapGhost(launcherItem.id, snappedX, snappedY);
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
    onItemsChange(desktopGrid.resize(items, item.id, colSpan, rowSpan));
  }

  function isResizeValid(item: GridItem, colSpan: number, rowSpan: number): boolean {
    if (item.col + colSpan - 1 > cols) return false;
    if (item.row + rowSpan - 1 > rows) return false;
    return !desktopGrid.isOccupied(items, item.col, item.row, colSpan, rowSpan, item.id);
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

    if (!isInside && allowDragOut) {
      // Сигнал только при первом выходе за границу
      if (gridDrag.ghostCol !== -1) {
        const { item, mouseOffsetX, mouseOffsetY } = gridDrag;
        gridDrag = { ...gridDrag, ghostCol: -1, valid: false };
        onGhostOut?.(item, mouseOffsetX, mouseOffsetY, e.clientX, e.clientY, adoptGhost);
      }
      // Ghost свободно следует за курсором (drag.store.onWindowMove → moveGhost)
      if (dragItem?.ghostEl) {
        dragItem.ghostEl.style.transition = '';
        dragItem.ghostEl.style.outline = '2px dashed rgba(255,255,255,0.6)';
        dragItem.ghostEl.style.opacity = '0.6';
        dragItem.ghostEl.style.filter = '';
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
    const valid = !desktopGrid.isOccupied(
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
      onItemsChange(
        desktopGrid.move(items, gridDrag.item.id, gridDrag.ghostCol, gridDrag.ghostRow)
      );
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
