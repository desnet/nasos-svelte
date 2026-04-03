<script lang="ts">
  // Stores
  import { desktop } from '$lib/stores/desktop.svelte';
  import { wallpaperStore } from '$lib/stores/wallpaper.svelte';
  import { apps } from '$lib/stores/apps.svelte';
  import { widgets } from '$lib/stores/widgets.svelte';
  import type { DragItem } from '$lib/stores/drag.svelte';
  import type { GridItem } from '$lib/components/Grid.svelte';
  import type { ShortcutConfig } from '$lib/components/Shortcut.svelte';
  import type { WidgetConfig } from '$lib/components/Widget.svelte';

  // Grid components
  import GridCell from '$lib/components/GridCell.svelte';
  import Shortcut from '$lib/components/Shortcut.svelte';
  import Widget from '$lib/components/Widget.svelte';

  // Layout components
  import MenuBar from '$lib/components/MenuBar.svelte';
  import Grid from '$lib/components/Grid.svelte';
  import Dock from '$lib/components/Dock.svelte';

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

  let nextItemId = $state(100);

  function handleDesktopDrop(items: DragItem[], col: number, row: number) {
    for (const item of items) {
      const data = item.data as {
        type: string;
        mode: 'apps' | 'widgets';
        itemId: string;
        winId: number;
      };
      if (data?.type !== 'launcher') continue;

      const id = nextItemId++;

      if (data.mode === 'apps') {
        const app = apps.list().find((a) => a.id === data.itemId);
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
        const widget = widgets.list().find((w) => w.type === data.itemId);
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

      desktop.restoreWindow(data.winId);
    }
  }

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

  <div class="desktop-area">
    <Grid
      cellW={22}
      cellH={22}
      items={gridItems}
      onMove={(id, col, row) => {
        gridItems = gridItems.map((i) => (i.id === id ? { ...i, col, row } : i));
      }}
      onResize={(id, colSpan, rowSpan) => {
        gridItems = gridItems.map((i) => (i.id === id ? { ...i, colSpan, rowSpan } : i));
      }}
      onDrop={handleDesktopDrop}
    >
      {#each gridItems as item (item.id)}
        <GridCell {item}>
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
        </GridCell>
      {/each}
    </Grid>

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

  <Dock
    onDrop={(items, id) => {
      if (id !== 'trash') return;
      for (const item of items) {
        const data = item.data as { type?: string; gridItem?: { id: number } };
        if (data?.type === 'grid' && data.gridItem) {
          gridItems = gridItems.filter((gi) => gi.id !== data.gridItem!.id);
        }
      }
    }}
  />
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
