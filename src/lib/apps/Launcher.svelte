<script lang="ts">
  import { getContext, untrack } from 'svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { desktop } from '$lib/stores/desktop.svelte';
  import { apps } from '$lib/stores/apps.svelte';
  import { widgets } from '$lib/stores/widgets.svelte';
  import { drag } from '$lib/stores/drag.svelte';
  import type { GridItem } from '$lib/components/UiGrid.svelte';
  import type { WindowContext } from '$lib/components/Window.svelte';
  import UiInputSearch from '$lib/components/UiInputSearch.svelte';
  import UiButtonGroup from '$lib/components/UiButtonGroup.svelte';
  import UiGrid from '$lib/components/UiGrid.svelte';
  import UiGridCell from '$lib/components/UiGridCell.svelte';
  import UiShortcut from '$lib/components/UiShortcut.svelte';
  import Widget from '$lib/components/Widget.svelte';

  let { appType = 'apps' }: { appType?: 'apps' | 'widgets' } = $props();

  const { id: winId } = getContext<WindowContext>('window');

  let mode = $state<'apps' | 'widgets'>(untrack(() => appType));
  let search = $state('');

  // Размеры ячейки
  const CELL = 22;
  // Размеры госта при drag-out
  const APP_W = 4 * CELL;
  const APP_H = 3 * CELL;
  const WGT_W = 10 * CELL;
  const WGT_H = 11 * CELL;

  // Константы раскладки — приложения
  const APP_COL_SPAN = 4,
    APP_COL_STEP = 4;
  const APP_ROW_START = 2,
    APP_ROW_SPAN = 3,
    APP_ROW_STEP = 4;
  // Константы раскладки — виджеты
  const WGT_COL_SPAN = 10,
    WGT_COL_STEP = 13;
  const WGT_ROW_START = 2,
    WGT_ROW_SPAN = 9,
    WGT_ROW_STEP = 11;

  let bodyW = $state(0);
  let bodyH = $state(0);

  const gridCols = $derived(Math.floor(bodyW / CELL));
  const gridRows = $derived(Math.floor(bodyH / CELL));

  const appPerRow = $derived(Math.max(1, Math.floor(gridCols / APP_COL_STEP)));
  const appPerCol = $derived(
    Math.max(1, Math.floor((gridRows - APP_ROW_START - APP_ROW_SPAN + 1) / APP_ROW_STEP) + 1)
  );
  const appPerPage = $derived(appPerRow * appPerCol);

  const wgtPerRow = $derived(
    Math.max(1, Math.floor((gridCols - WGT_COL_SPAN + 1) / WGT_COL_STEP) + 1)
  );
  const wgtPerCol = $derived(
    Math.max(1, Math.floor((gridRows - WGT_ROW_START - WGT_ROW_SPAN + 1) / WGT_ROW_STEP) + 1)
  );
  const wgtPerPage = $derived(wgtPerRow * wgtPerCol);

  const appColStart = $derived(
    Math.max(1, Math.floor((gridCols - appPerRow * APP_COL_STEP) / 2) + 1)
  );
  const wgtColStart = $derived(
    Math.max(1, Math.floor((gridCols - ((wgtPerRow - 1) * WGT_COL_STEP + WGT_COL_SPAN)) / 2) + 1)
  );

  const appList = $derived(
    apps
      .list()
      .filter((a) => a.id !== 'launcher')
      .filter((a) => !search || a.label.toLowerCase().includes(search.toLowerCase()))
  );
  const widgetList = $derived(
    widgets.list().filter((w) => !search || w.label.toLowerCase().includes(search.toLowerCase()))
  );

  const appPageCount = $derived(Math.max(1, Math.ceil(appList.length / appPerPage)));
  const wgtPageCount = $derived(Math.max(1, Math.ceil(widgetList.length / wgtPerPage)));
  const pageCount = $derived(mode === 'apps' ? appPageCount : wgtPageCount);

  let page = $state(0);
  let direction = $state(1);

  // Зажим страницы при изменении количества элементов / размера окна
  $effect(() => {
    const max = pageCount - 1;
    if (page > max) untrack(() => { page = max; });
  });

  // Сброс страницы при смене режима или поиска
  $effect(() => {
    void `${mode}${search}`;
    untrack(() => {
      page = 0;
      direction = 1;
    });
  });

  function goToPage(newPage: number) {
    direction = newPage >= page ? 1 : -1;
    page = newPage;
  }

  const appPageItems = $derived.by<GridItem[]>(() => {
    const start = page * appPerPage;
    return appList.slice(start, start + appPerPage).map((_, i) => ({
      id: 200 + start + i,
      col: appColStart + (i % appPerRow) * APP_COL_STEP,
      row: APP_ROW_START + Math.floor(i / appPerRow) * APP_ROW_STEP,
      colSpan: APP_COL_SPAN,
      rowSpan: APP_ROW_SPAN
    }));
  });

  const wgtPageItems = $derived.by<GridItem[]>(() => {
    const start = page * wgtPerPage;
    return widgetList.slice(start, start + wgtPerPage).map((_, i) => ({
      id: 300 + start + i,
      col: wgtColStart + (i % wgtPerRow) * WGT_COL_STEP,
      row: WGT_ROW_START + Math.floor(i / wgtPerRow) * WGT_ROW_STEP,
      colSpan: WGT_COL_SPAN,
      rowSpan: WGT_ROW_SPAN
    }));
  });

  const currentItems = $derived(mode === 'apps' ? appPageItems : wgtPageItems);

  // Карты GridItem.id → элемент для текущей страницы
  const appItemMap = $derived(
    new Map(appPageItems.map((gi, i) => [gi.id, appList[page * appPerPage + i]]))
  );
  const wgtItemMap = $derived(
    new Map(wgtPageItems.map((gi, i) => [gi.id, widgetList[page * wgtPerPage + i]]))
  );

  function handleGhostOut(
    item: GridItem,
    mouseOffsetX: number,
    mouseOffsetY: number,
    _clientX: number,
    _clientY: number,
    adopt: () => HTMLDivElement | null
  ) {
    const isWidget = wgtItemMap.has(item.id);
    const data = isWidget ? wgtItemMap.get(item.id) : appItemMap.get(item.id);
    const itemId = isWidget
      ? (data as { type: string } | undefined)?.type
      : (data as { id: string } | undefined)?.id;
    if (!itemId) return;

    const ghostEl = adopt();
    if (!ghostEl) return;

    ghostEl.style.width = (isWidget ? WGT_W : APP_W) + 'px';
    ghostEl.style.height = (isWidget ? WGT_H : APP_H) + 'px';

    drag.begin({
      id: itemId,
      data: {
        type: 'launcher',
        mode: isWidget ? 'widgets' : 'apps',
        itemId,
        winId
      },
      ghostEl,
      mouseOffX: mouseOffsetX,
      mouseOffY: mouseOffsetY,
      snappedX: null,
      snappedY: null
    });

    desktop.minimizeWindow(winId);
  }
</script>

<div class="launcher">
  <div class="launcher-top">
    <UiInputSearch
      bind:value={search}
      placeholder={mode === 'apps' ? '🔍 Поиск приложений...' : '🔍 Поиск виджетов...'}
      variant="transparent"
    />
  </div>

  <div class="launcher-filter">
    <UiButtonGroup
      items={['Приложения', 'Виджеты']}
      value={mode === 'apps' ? 'Приложения' : 'Виджеты'}
      onchange={(v) => {
        mode = v === 'Приложения' ? 'apps' : 'widgets';
        search = '';
      }}
      variant="transparent"
    />
  </div>

  <div class="launcher-body" bind:clientWidth={bodyW} bind:clientHeight={bodyH}>
    {#key `${mode}-${page}`}
      <div
        class="launcher-page"
        in:fly={{ x: direction * bodyW, duration: 260, easing: cubicOut }}
        out:fly={{ x: -direction * bodyW, duration: 260, easing: cubicOut }}
      >
        <UiGrid
          cellW={22}
          cellH={22}
          items={currentItems}
          onGhostOut={handleGhostOut}
        >
          {#if mode === 'apps'}
            {#each appPageItems as item (item.id)}
              {@const app = appItemMap.get(item.id)}
              {#if app}
                <UiGridCell {item}>
                  <UiShortcut
                    config={{ icon: app.icon, label: app.label, app: app.id }}
                    ondblclick={() => {
                      desktop.openApp(app.id);
                      desktop.closeWindow(winId);
                    }}
                  />
                </UiGridCell>
              {/if}
            {/each}
          {:else}
            {#each wgtPageItems as item (item.id)}
              {@const w = wgtItemMap.get(item.id)}
              {#if w}
                {@const WidgetComp = widgets.getComponent(w.type)}
                <UiGridCell {item}>
                  <Widget config={{ name: w.type, variant: 'transparent' }}>
                    {#if WidgetComp}<WidgetComp />{/if}
                  </Widget>
                </UiGridCell>
              {/if}
            {/each}
          {/if}
        </UiGrid>
      </div>
    {/key}
  </div>

  {#if pageCount > 1}
    <div class="pagination">
      {#each Array.from({ length: pageCount }, (_, i) => i) as i (i)}
        <button
          class="dot"
          class:dot-active={i === page}
          onclick={() => goToPage(i)}
          aria-label="Страница {i + 1}"
        ></button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .launcher {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .launcher-top {
    padding: 12px 16px 8px;
  }

  .launcher-filter {
    padding: 0 16px;
  }

  .launcher-body {
    flex: 1;
    position: relative;
    overflow: hidden;
    min-height: 0;
  }

  .launcher-page {
    position: absolute;
    inset: 0 16px;
  }

  /* Виджеты внутри лаунчера уже внутри размытого окна — свой backdrop-filter не нужен */
  .launcher-page :global(.widget.transparent) {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    padding: 8px 0 10px;
    flex-shrink: 0;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    border: none;
    padding: 0;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.35);
    transition:
      background 0.18s,
      transform 0.18s;
  }

  .dot:hover {
    background: rgba(255, 255, 255, 0.6);
    transform: scale(1.2);
  }

  .dot-active {
    background: rgba(255, 255, 255, 0.9);
    transform: scale(1.15);
  }
</style>
