<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import { desktop } from '$lib/stores/desktop.svelte';

  export type WindowContext = {
    id: number;
    setSize: (width: number, height: number) => void;
  };

  let { id, children } = $props<{ id: number; children: Snippet }>();

  setContext<WindowContext>('window', {
    get id() { return id; },
    setSize(width, height) {
      desktop.resizeWindow(id, width, height);
    }
  });

  const win = $derived(desktop.windows.find((w) => w.id === id)!);
  const zIndex = $derived(desktop.getZIndex(id));
  const opts = $derived(win?.options ?? {});

  const showTitlebar = $derived(opts.titlebar !== false);
  const resizable = $derived(opts.resizable !== false);
  const dimOnBlur = $derived(opts.focusDim !== false);
  const transparent = $derived(opts.variant === 'transparent');

  const MIN_W = 200;
  const MIN_H = 120;

  const toSize = (v: number | string) => (typeof v === 'number' ? `${v}px` : v);

  // --- Drag ---
  let dragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let winEl = $state<HTMLDivElement | undefined>(undefined);

  function onTitleMousedown(e: MouseEvent) {
    if ((e.target as HTMLElement).closest('.win-controls')) return;
    desktop.focusWindow(id);

    // Если окно позиционировано через CSS (isCentered), захватываем реальные координаты
    let startX = win.x;
    let startY = win.y;
    if (win.isCentered && winEl) {
      const rect = winEl.getBoundingClientRect();
      startX = rect.left;
      startY = rect.top;
      desktop.moveWindow(id, startX, startY);
    }

    dragging = true;
    dragOffsetX = e.clientX - startX;
    dragOffsetY = e.clientY - startY;
    window.addEventListener('mousemove', onMousemove);
    window.addEventListener('mouseup', onMouseup);
  }

  // --- Resize (bottom-right only) ---
  let resizing = false;
  let rsStartX = 0;
  let rsStartY = 0;
  let rsStartW = 0;
  let rsStartH = 0;

  function onResizeMousedown(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    desktop.focusWindow(id);
    resizing = true;
    rsStartX = e.clientX;
    rsStartY = e.clientY;
    rsStartW = winEl ? winEl.offsetWidth : typeof win.width === 'number' ? win.width : MIN_W;
    rsStartH = winEl ? winEl.offsetHeight : typeof win.height === 'number' ? win.height : MIN_H;
    window.addEventListener('mousemove', onMousemove);
    window.addEventListener('mouseup', onMouseup);
  }

  function onMousemove(e: MouseEvent) {
    if (dragging && !win.maximized) {
      const newX = Math.max(0, e.clientX - dragOffsetX);
      const newY = Math.max(0, e.clientY - dragOffsetY);
      desktop.moveWindow(id, newX, newY);
      return;
    }
    if (!resizing || win.maximized) return;

    const newW = Math.max(MIN_W, rsStartW + (e.clientX - rsStartX));
    const newH = Math.max(MIN_H, rsStartH + (e.clientY - rsStartY));
    desktop.resizeWindow(id, newW, newH);
  }

  function onMouseup() {
    dragging = false;
    resizing = false;
    window.removeEventListener('mousemove', onMousemove);
    window.removeEventListener('mouseup', onMouseup);
  }
</script>

{#if win && !win.minimized}
  <div
    class="window"
    class:maximized={win.maximized}
    class:focused={win.focused}
    class:no-titlebar={!showTitlebar}
    class:dim-on-blur={dimOnBlur}
    class:transparent
    bind:this={winEl}
    style={win.maximized
      ? `z-index: ${zIndex}`
      : win.isCentered
        ? `left: 50%; top: 50%; translate: -50% -50%; width: ${toSize(win.width)}; height: ${toSize(win.height)}; z-index: ${zIndex}`
        : `left: ${win.x}px; top: ${win.y}px; width: ${toSize(win.width)}; height: ${toSize(win.height)}; z-index: ${zIndex}`}
    onmousedown={() => desktop.focusWindow(id)}
    role="dialog"
    tabindex="0"
    aria-label={win.title}
  >
    <!-- Title bar -->
    {#if showTitlebar}
      <div
        class="titlebar"
        onmousedown={onTitleMousedown}
        ondblclick={() => desktop.toggleMaximize(id)}
        role="presentation"
      >
        <div class="win-controls">
          <button class="ctrl-btn close" onclick={() => desktop.closeWindow(id)} title="Закрыть">
            <svg viewBox="0 0 10 10"><path d="M2.5 2.5l5 5M7.5 2.5l-5 5" /></svg>
          </button>
          <button
            class="ctrl-btn minimize"
            onclick={() => desktop.minimizeWindow(id)}
            title="Свернуть"
          >
            <svg viewBox="0 0 10 10"><path d="M2 5h6" /></svg>
          </button>
          <button
            class="ctrl-btn maximize"
            onclick={() => desktop.toggleMaximize(id)}
            title="Развернуть"
          >
            <svg viewBox="0 0 10 10"
              ><path d="M2 6.5V8h1.5M8 3.5V2H6.5M2 3.5V2H3.5M8 6.5V8H6.5" /></svg
            >
          </button>
        </div>
        <span class="win-title">
          <span class="win-title-icon">{win.icon}</span>
          {win.title}
        </span>
      </div>
    {/if}

    <!-- Content -->
    <div class="win-content">
      {@render children()}
    </div>

    <!-- Resize handle: bottom-right only -->
    {#if resizable && !win.maximized}
      <div class="rh se" onmousedown={onResizeMousedown} role="presentation"></div>
    {/if}
  </div>
{/if}

<style>
  .window {
    position: fixed;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.18),
      0 4px 8px rgba(0, 0, 0, 0.12),
      0 20px 60px rgba(0, 0, 0, 0.28);
    min-width: 200px;
    min-height: 120px;
    transition: box-shadow 0.15s;
  }

  .window.focused {
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.22),
      0 8px 16px rgba(0, 0, 0, 0.18),
      0 30px 80px rgba(0, 0, 0, 0.38);
  }

  .window.maximized {
    left: 0 !important;
    top: 28px !important;
    width: 100vw !important;
    height: calc(100vh - 28px - 88px) !important;
    border-radius: 0;
  }

  /* ── Titlebar ─────────────────────────────────────────────────────────────── */
  .titlebar {
    display: flex;
    align-items: center;
    height: 32px;
    padding: 0 12px;
    background: rgba(235, 235, 240, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    cursor: grab;
    user-select: none;
    flex-shrink: 0;
    position: relative;
  }

  .titlebar:active {
    cursor: grabbing;
  }

  .win-controls {
    display: flex;
    gap: 5px;
    flex-shrink: 0;
  }

  .ctrl-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    padding: 0;
    transition:
      filter 0.12s,
      opacity 0.12s;
  }
  .ctrl-btn svg {
    width: 9px;
    height: 9px;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    opacity: 0.75;
    transition: opacity 0.12s;
  }
  .ctrl-btn:hover svg {
    opacity: 1;
  }

  .ctrl-btn.close {
    background: rgba(210, 55, 70, 0.75);
  }
  .ctrl-btn.minimize {
    background: rgba(70, 100, 210, 0.75);
  }
  .ctrl-btn.maximize {
    background: rgba(40, 170, 130, 0.75);
  }

  .ctrl-btn.close svg {
    stroke: rgba(255, 180, 180, 0.9);
  }
  .ctrl-btn.minimize svg {
    stroke: rgba(180, 200, 255, 0.9);
  }
  .ctrl-btn.maximize svg {
    stroke: rgba(160, 240, 210, 0.9);
  }

  .ctrl-btn:hover {
    filter: brightness(1.2);
  }

  /* dim-on-blur: эффект полупрозрачности при потере фокуса */
  .dim-on-blur:not(.focused) .titlebar {
    background: rgba(215, 215, 220, 0.88);
  }
  .dim-on-blur:not(.focused) .ctrl-btn {
    background: rgba(0, 0, 0, 0.12) !important;
    filter: none;
  }
  .dim-on-blur:not(.focused) .ctrl-btn svg {
    opacity: 0.3;
  }
  .dim-on-blur:not(.focused) .win-title {
    color: #888;
  }

  .win-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    font-weight: 600;
    color: #2a2a2a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 60%;
    display: flex;
    align-items: center;
    gap: 5px;
    pointer-events: none;
  }

  .win-title-icon {
    font-size: 13px;
  }

  /* ── Content ──────────────────────────────────────────────────────────────── */
  .win-content {
    flex: 1;
    overflow: auto;
    background: #ffffff;
    position: relative;
  }

  /* ── Variant: transparent (стиль dock из Taskbar) ────────────────────────── */
  .window.transparent {
    background: rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    border: 1px solid rgba(255, 255, 255, 0.22);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 1px 0 rgba(255, 255, 255, 0.12) inset;
  }
  .window.transparent.focused {
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 1px 0 rgba(255, 255, 255, 0.12) inset;
  }
  .window.transparent .win-content {
    background: transparent;
  }
  .window.transparent .titlebar {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border-bottom-color: rgba(255, 255, 255, 0.18);
  }
  .window.transparent.dim-on-blur:not(.focused) .titlebar {
    background: rgba(255, 255, 255, 0.06);
  }

  /* ── Resize handle ────────────────────────────────────────────────────────── */
  .rh.se {
    position: absolute;
    z-index: 10;
    bottom: 0;
    right: 0;
    width: 16px;
    height: 16px;
    cursor: se-resize;
    background: radial-gradient(circle at 100% 100%, rgba(0, 0, 0, 0.12) 0%, transparent 70%);
    border-radius: 0 0 12px 0;
  }
</style>
