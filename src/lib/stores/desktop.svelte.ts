import { apps } from '$lib/stores/apps.svelte';

export type WindowOptions = {
  titlebar?: boolean; // показывать titlebar (по умолчанию true)
  resizable?: boolean; // разрешить изменение размера (по умолчанию true)
  overlay?: boolean; // показывать оверлей поверх контента (по умолчанию false)
  focusDim?: boolean; // полупрозрачность при потере фокуса (по умолчанию true)
  position?: 'auto' | 'center' | { x: number; y: number };
  variant?: 'default' | 'transparent';
  width?: number | string;
  height?: number | string;
};

export type WindowApp = {
  id: number;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  isCentered: boolean;
  minimized: boolean;
  maximized: boolean;
  focused: boolean;
  component: string;
  componentArgs?: Record<string, unknown>;
  options?: WindowOptions;
};

function createDesktop() {
  let windows = $state<WindowApp[]>([]);
  let nextId = $state(1);
  let zOrder = $state<number[]>([]);

  function openApp(app: string, args?: Record<string, unknown>, options?: WindowOptions) {
    const existing = windows.find((w) => w.component === app && !w.minimized);
    if (existing) {
      focusWindow(existing.id);
      return;
    }
    const minimized = windows.find((w) => w.component === app && w.minimized);
    if (minimized) {
      restoreWindow(minimized.id);
      focusWindow(minimized.id);
      return;
    }

    const appMeta = apps.list().find((a) => a.id === app);
    const id = nextId++;
    const width: number | string = options?.width ?? 500;
    const height: number | string = options?.height ?? 380;

    const pos = options?.position ?? 'auto';
    const offset = (windows.filter((w) => !w.minimized).length % 8) * 28;
    const numW = typeof width === 'number' ? width : 500;
    const numH = typeof height === 'number' ? height : 380;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const baseX = Math.round(vw * 0.5 - numW * 0.5 - (8 * 28) / 2);
    const baseY = Math.round(vh * 0.5 - numH * 0.5 - (8 * 28) / 2);
    let x = Math.max(0, Math.min(baseX + offset, vw - numW));
    let y = Math.max(0, Math.min(baseY + offset, vh - numH));
    let isCentered = false;

    if (pos === 'center') {
      isCentered = true;
    } else if (typeof pos === 'object') {
      x = pos.x;
      y = pos.y;
    }

    windows.push({
      id,
      title: appMeta?.label ?? app,
      icon: appMeta?.icon ?? '🖥️',
      x,
      y,
      width,
      height,
      isCentered,
      minimized: false,
      maximized: false,
      focused: true,
      component: app,
      componentArgs: args,
      options
    });
    zOrder.push(id);
    focusWindow(id);
  }

  function focusWindow(id: number) {
    zOrder = zOrder.filter((z) => z !== id);
    zOrder.push(id);
    windows = windows.map((w) => ({ ...w, focused: w.id === id }));
  }

  function closeWindow(id: number) {
    windows = windows.filter((w) => w.id !== id);
    zOrder = zOrder.filter((z) => z !== id);
  }

  function minimizeWindow(id: number) {
    windows = windows.map((w) => (w.id === id ? { ...w, minimized: true, focused: false } : w));
    const remaining = windows.filter((w) => !w.minimized);
    if (remaining.length > 0) focusWindow(remaining[remaining.length - 1].id);
  }

  function restoreWindow(id: number) {
    windows = windows.map((w) => (w.id === id ? { ...w, minimized: false } : w));
    focusWindow(id);
  }

  function toggleMaximize(id: number) {
    windows = windows.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w));
  }

  function moveWindow(id: number, x: number, y: number) {
    windows = windows.map((w) => (w.id === id ? { ...w, x, y, isCentered: false } : w));
  }

  function resizeWindow(id: number, width: number, height: number) {
    windows = windows.map((w) => {
      if (w.id !== id) return w;
      if (w.isCentered) return { ...w, width, height };
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const x = Math.max(0, Math.min(w.x, vw - (typeof width === 'number' ? width : w.x)));
      const y = Math.max(0, Math.min(w.y, vh - (typeof height === 'number' ? height : w.y)));
      return { ...w, width, height, x, y };
    });
  }

  function getZIndex(id: number) {
    const win = windows.find((w) => w.id === id);
    if (win?.options?.overlay) return 9001;
    return 100 + zOrder.indexOf(id);
  }

  return {
    get windows() {
      return windows;
    },
    openApp,
    focusWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    toggleMaximize,
    moveWindow,
    resizeWindow,
    getZIndex
  };
}

export const desktop = createDesktop();
