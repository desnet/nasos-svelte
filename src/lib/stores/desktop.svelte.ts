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

import { apps } from '$lib/stores/apps.svelte';

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
    const width: number | string =
      options?.width ??
      (app === 'explorer' ? 680 : app === 'appstore' ? 780 : app === 'wallpapers' ? 720 : 500);
    const height: number | string =
      options?.height ??
      (app === 'explorer' ? 460 : app === 'appstore' ? 520 : app === 'wallpapers' ? 480 : 380);

    const pos = options?.position ?? 'auto';
    const offset = (windows.filter((w) => !w.minimized).length % 6) * 24;
    let x = 80 + offset;
    let y = 60 + offset;
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
    windows = windows.map((w) => (w.id === id ? { ...w, width, height } : w));
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
