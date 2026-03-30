<script lang="ts">
  // Stores
  import { desktop } from '$lib/stores/desktop.svelte';
  import { wallpaperStore } from '$lib/stores/wallpaper.svelte';
  import { launcherDrag } from '$lib/stores/launcherDrag.svelte';
  import { apps } from '$lib/stores/apps.svelte';
  import { widgets } from '$lib/stores/widgets.svelte';
  import type { GridItem } from '$lib/stores/desktopGrid.svelte';
  import type { ShortcutConfig } from '$lib/components/Shortcut.svelte';
  import type { WidgetConfig } from '$lib/components/Widget.svelte';

  // Grid components
  import DesktopGridCell from '$lib/components/DesktopGridCell.svelte';
  import Shortcut from '$lib/components/Shortcut.svelte';
  import Widget from '$lib/components/Widget.svelte';

  // Layout components
  import MenuBar from '$lib/components/MenuBar.svelte';
  import DesktopGrid from '$lib/components/DesktopGrid.svelte';
  import Taskbar from '$lib/components/Taskbar.svelte';

  // Window infrastructure
  import Window from '$lib/components/Window.svelte';

  type DesktopItem = GridItem & { shortcut?: ShortcutConfig; widget?: WidgetConfig };

  const COL = 2;
  const SPAN_W = 4;
  const SPAN_H = 3;
  const ROW_GAP = 1;

  function shortcutRow(index: number) {
    return 2 + index * (SPAN_H + ROW_GAP);
  }

  let desktopAreaEl = $state<HTMLDivElement | undefined>(undefined);
  let nextItemId = $state(100);

  // Обработка дропа из лаунчера на рабочий стол
  $effect(() => {
    const drop = launcherDrag.pendingDrop;
    if (!drop) return;

    const rect = desktopAreaEl?.getBoundingClientRect();
    const gridLeft = rect?.left ?? 0;
    const gridTop = rect?.top ?? 0;
    const CELL = 22;

    const col = Math.max(1, Math.floor((drop.clientX - gridLeft) / CELL) + 1);
    const row = Math.max(1, Math.floor((drop.clientY - gridTop) / CELL) + 1);
    const id = nextItemId++;

    if (drop.mode === 'apps') {
      const app = apps.list().find((a) => a.id === drop.itemId);
      if (app) {
        gridItems = [
          ...gridItems,
          {
            id,
            col,
            row,
            colSpan: 4,
            rowSpan: 3,
            shortcut: { icon: app.icon, label: app.label, app: app.id }
          }
        ];
      }
    } else {
      const widget = widgets.list().find((w) => w.type === drop.itemId);
      if (widget) {
        gridItems = [
          ...gridItems,
          {
            id,
            col,
            row,
            colSpan: 10,
            rowSpan: 11,
            resizable: true,
            widget: { name: widget.type, app: widget.type }
          }
        ];
      }
    }

    // Переоткрываем лаунчер
    desktop.openApp('launcher', drop.reopenArgs, drop.reopenOptions);
    launcherDrag.clearDrop();
  });

  let gridItems = $state<DesktopItem[]>([
    {
      id: 1,
      col: COL,
      row: shortcutRow(0),
      colSpan: SPAN_W,
      rowSpan: SPAN_H,
      shortcut: { icon: '📁', label: 'Проводник', app: 'explorer' }
    },
    {
      id: 2,
      col: COL,
      row: shortcutRow(1),
      colSpan: SPAN_W,
      rowSpan: SPAN_H,
      shortcut: { icon: '📝', label: 'Блокнот', app: 'notepad' }
    },
    {
      id: 3,
      col: COL,
      row: shortcutRow(2),
      colSpan: SPAN_W,
      rowSpan: SPAN_H,
      shortcut: { icon: '💻', label: 'Обо мне', app: 'about' }
    },
    {
      id: 4,
      col: COL,
      row: shortcutRow(3),
      colSpan: SPAN_W,
      rowSpan: SPAN_H,
      shortcut: { icon: '🗑️', label: 'Корзина', app: 'trash' }
    },
    {
      id: 5,
      col: COL,
      row: shortcutRow(4),
      colSpan: SPAN_W,
      rowSpan: SPAN_H,
      shortcut: { icon: '🏪', label: 'Магазин', app: 'appstore' }
    },
    {
      id: 6,
      col: COL,
      row: shortcutRow(5),
      colSpan: SPAN_W,
      rowSpan: SPAN_H,
      shortcut: { icon: '🖼️', label: 'Обои', app: 'wallpapers' }
    },
    {
      id: 7,
      col: 8,
      row: 2,
      colSpan: 10,
      rowSpan: 11,
      resizable: true,
      widget: { name: 'clock', app: 'clock' }
    },
    {
      id: 8,
      col: 8,
      row: 14,
      colSpan: 10,
      rowSpan: 11,
      resizable: true,
      widget: { name: 'calendar', app: 'calendar' }
    }
  ]);
</script>

<div class="desktop" style="background: {wallpaperStore.current.css}">
  <MenuBar />

  <div class="desktop-area" bind:this={desktopAreaEl}>
    <DesktopGrid
      cellW={22}
      cellH={22}
      items={gridItems}
      onItemsChange={(v) => (gridItems = v as DesktopItem[])}
      onItemRemove={(id) => (gridItems = gridItems.filter((item) => item.id !== id))}
    >
      {#each gridItems as item (item.id)}
        <DesktopGridCell {item}>
          {#if item.shortcut}
            <Shortcut
              config={item.shortcut}
              ondblclick={(cfg) => desktop.openApp(cfg.app, cfg.args)}
            />
          {:else if item.widget}
            {@const WidgetSomp = widgets.getComponent(item.widget.name)}
            <Widget
              config={item.widget}
              ondblclick={(cfg) => cfg.app && desktop.openApp(cfg.app, cfg.args)}
            >
              {#if WidgetSomp}<WidgetSomp />{/if}
            </Widget>
          {/if}
        </DesktopGridCell>
      {/each}
    </DesktopGrid>

    <!-- Desktop overlay backdrop (для окон с options.overlay) -->
    {#if desktop.windows.some((w) => w.options?.overlay && !w.minimized)}
      <div
        class="desktop-overlay"
        role="presentation"
        onclick={() =>
          desktop.windows
            .filter((w) => w.options?.overlay && !w.minimized)
            .forEach((w) => desktop.closeWindow(w.id))}
      ></div>
    {/if}

    <!-- Windows -->
    {#each desktop.windows as win (win.id)}
      {@const AppComp = apps.getComponent(win.component)}
      <Window id={win.id}>
        {#if AppComp}<AppComp {...win.componentArgs ?? {}} />{/if}
      </Window>
    {/each}
  </div>

  <Taskbar />
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', sans-serif;
  }

  .desktop {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    transition: background 0.5s ease;
    overflow: hidden;
  }

  .desktop-area {
    flex: 1;
    position: relative;
    overflow: hidden;
    min-height: 0;
  }

  .desktop-overlay {
    position: fixed;
    inset: 0;
    z-index: 9000;
    background: rgba(0, 0, 0, 0.38);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
</style>
