export type DragItem = {
  id: string | number;
  data: unknown;
  ghostEl: HTMLElement | null;
  mouseOffX: number;
  mouseOffY: number;
  snappedX: number | null;
  snappedY: number | null;
  consumed?: boolean;
  onMove?: (e: MouseEvent) => void;
  onUp?: (e: MouseEvent) => void;
};

export type DropResult = {
  item: DragItem;
  clientX: number;
  clientY: number;
};

let _items = $state<DragItem[]>([]);
let _pendingDrops = $state<DropResult[]>([]);
let _resizing = $state(false);

function onWindowMove(e: MouseEvent) {
  for (const item of _items) {
    clearSnap(item.id);
    moveGhost(item.id, e.clientX, e.clientY);
    item.onMove?.(e);
  }
}

function onWindowUp(e: MouseEvent) {
  // snapshot to avoid mutation during iteration
  const snapshot = [..._items];
  for (const item of snapshot) {
    if (!item.consumed) item.onUp?.(e);
    end(item.id, e);
  }
}

function addListeners() {
  window.addEventListener('mousemove', onWindowMove);
  window.addEventListener('mouseup', onWindowUp);
}

function removeListeners() {
  window.removeEventListener('mousemove', onWindowMove);
  window.removeEventListener('mouseup', onWindowUp);
}

function begin(item: DragItem): void {
  const wasEmpty = _items.length === 0;
  _items = [..._items, item];
  if (wasEmpty) addListeners();
}

function end(id: string | number, e: MouseEvent): void {
  const item = _items.find((i) => i.id === id);
  if (!item) return;

  const clientX = item.snappedX !== null ? item.snappedX : e.clientX;
  const clientY = item.snappedY !== null ? item.snappedY : e.clientY;

  _pendingDrops = [..._pendingDrops, { item, clientX, clientY }];
  _items = _items.filter((i) => i.id !== id);

  item.ghostEl?.remove();

  if (_items.length === 0) removeListeners();
}

function moveGhost(id: string | number, clientX: number, clientY: number): void {
  const item = _items.find((i) => i.id === id);
  if (!item?.ghostEl) return;
  item.ghostEl.style.left = clientX - item.mouseOffX + 'px';
  item.ghostEl.style.top = clientY - item.mouseOffY + 'px';
}

function snapGhost(id: string | number, x: number, y: number): void {
  const item = _items.find((i) => i.id === id);
  if (!item) return;
  item.snappedX = x;
  item.snappedY = y;
  if (item.ghostEl) {
    item.ghostEl.style.left = x + 'px';
    item.ghostEl.style.top = y + 'px';
  }
}

function clearSnap(id: string | number): void {
  const item = _items.find((i) => i.id === id);
  if (!item) return;
  item.snappedX = null;
  item.snappedY = null;
}

function clearDrop(id: string | number): void {
  _pendingDrops = _pendingDrops.filter((d) => d.item.id !== id);
}

function consume(id: string | number): void {
  const item = _items.find((i) => i.id === id);
  if (item) item.consumed = true;
}

function startResize(): void {
  _resizing = true;
}

function endResize(): void {
  _resizing = false;
}

export const drag = {
  get items() {
    return _items;
  },
  get active() {
    return _items.length > 0;
  },
  get resizing() {
    return _resizing;
  },
  get pendingDrops() {
    return _pendingDrops;
  },
  begin,
  end,
  moveGhost,
  snapGhost,
  clearSnap,
  clearDrop,
  consume,
  startResize,
  endResize
};
