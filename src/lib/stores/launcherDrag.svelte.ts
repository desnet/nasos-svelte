import type { WindowOptions } from '$lib/stores/desktop.svelte';

export type LauncherDropInfo = {
  mode: 'apps' | 'widgets';
  itemId: string;
  clientX: number;
  clientY: number;
  reopenArgs: Record<string, unknown>;
  reopenOptions: WindowOptions;
};

let pendingDrop = $state<LauncherDropInfo | null>(null);
let active = $state(false);

let _ghostEl: HTMLDivElement | null = null;
let _mouseOffX = 0;
let _mouseOffY = 0;
let _mode: 'apps' | 'widgets' = 'apps';
let _itemId = '';
let _reopenArgs: Record<string, unknown> = {};
let _reopenOptions: WindowOptions = {};
// Снаппнутая позиция от DesktopGrid (left/top угол госта), null = не снаппнуто
let _snappedLeft: number | null = null;
let _snappedTop: number | null = null;

/** Начать глобальное перетаскивание после закрытия лаунчера */
function begin(
  mode: 'apps' | 'widgets',
  itemId: string,
  ghostEl: HTMLDivElement | null,
  mouseOffsetX: number,
  mouseOffsetY: number,
  startClientX: number,
  startClientY: number,
  ghostW: number,
  ghostH: number,
  reopenArgs: Record<string, unknown>,
  reopenOptions: WindowOptions
) {
  _mode = mode;
  _itemId = itemId;
  _mouseOffX = mouseOffsetX;
  _mouseOffY = mouseOffsetY;
  _reopenArgs = reopenArgs;
  _reopenOptions = reopenOptions;

  if (ghostEl) {
    // Переиспользуем уже существующий элемент от DesktopGrid
    _ghostEl = ghostEl;
    _ghostEl.style.width = ghostW + 'px';
    _ghostEl.style.height = ghostH + 'px';
    _ghostEl.style.zIndex = '99999';
    _ghostEl.style.left = startClientX - mouseOffsetX + 'px';
    _ghostEl.style.top = startClientY - mouseOffsetY + 'px';
  } else {
    _ghostEl = document.createElement('div');
    Object.assign(_ghostEl.style, {
      position: 'fixed',
      width: ghostW + 'px',
      height: ghostH + 'px',
      borderRadius: '8px',
      opacity: '0.6',
      background: 'rgba(255,255,255,0.18)',
      outline: '2px dashed rgba(255,255,255,0.6)',
      outlineOffset: '-2px',
      pointerEvents: 'none',
      zIndex: '99999'
    });
    document.body.appendChild(_ghostEl);
    _ghostEl.style.left = startClientX - mouseOffsetX + 'px';
    _ghostEl.style.top = startClientY - mouseOffsetY + 'px';
  }

  _snappedLeft = null;
  _snappedTop = null;
  active = true;
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

function onMove(e: MouseEvent) {
  if (!_ghostEl) return;
  _snappedLeft = null;
  _snappedTop = null;
  _ghostEl.style.left = e.clientX - _mouseOffX + 'px';
  _ghostEl.style.top = e.clientY - _mouseOffY + 'px';
}

/** Вызывается из DesktopGrid чтобы снаппнуть гост к ячейке. snappedLeft/Top — координаты левого верхнего угла госта */
function snapGhost(snappedLeft: number, snappedTop: number) {
  if (!_ghostEl) return;
  _snappedLeft = snappedLeft;
  _snappedTop = snappedTop;
  _ghostEl.style.left = snappedLeft + 'px';
  _ghostEl.style.top = snappedTop + 'px';
}

function onUp(e: MouseEvent) {
  active = false;
  // Если гост был снаппнут к гриду — используем левый-верхний угол снаппнутой ячейки,
  // иначе — реальную позицию курсора
  const clientX = _snappedLeft !== null ? _snappedLeft : e.clientX;
  const clientY = _snappedTop !== null ? _snappedTop : e.clientY;
  pendingDrop = {
    mode: _mode,
    itemId: _itemId,
    clientX,
    clientY,
    reopenArgs: _reopenArgs,
    reopenOptions: _reopenOptions
  };
  _ghostEl?.remove();
  _ghostEl = null;
  window.removeEventListener('mousemove', onMove);
  window.removeEventListener('mouseup', onUp);
}

function clearDrop() {
  pendingDrop = null;
}

export const launcherDrag = {
  get pendingDrop() {
    return pendingDrop;
  },
  get active() {
    return active;
  },
  get mouseOffX() {
    return _mouseOffX;
  },
  get mouseOffY() {
    return _mouseOffY;
  },
  begin,
  snapGhost,
  clearDrop
};
