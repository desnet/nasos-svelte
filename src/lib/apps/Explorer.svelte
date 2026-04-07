<script lang="ts">
  import { getContext } from 'svelte'
  import type { WindowContext } from '$lib/components/Window.svelte'
  import UiInputSearch from '$lib/components/UiInputSearch.svelte'
  import UiButtonGroup from '$lib/components/UiButtonGroup.svelte'
  import UiMenu from '$lib/components/UiMenu.svelte'
  import type { MenuItem } from '$lib/components/UiMenu.js'
  import UiPanels from '$lib/components/UiPanels.svelte'
  import UiSidebar from '$lib/components/UiSidebar.svelte'
  import UiButton from '$lib/components/UiButton.svelte'
  import UiGrid from '$lib/components/UiGrid.svelte'
  import UiGridCell from '$lib/components/UiGridCell.svelte'
  import type { GridItem } from '$lib/components/UiGrid.svelte'
  import UiShortcut from '$lib/components/UiShortcut.svelte'
  import UiTable from '$lib/components/UiTable.svelte'
  import type { UiTableColumn, UiTableRow } from '$lib/components/UiTable.js'

  getContext<WindowContext>('window').setSize(860, 520)

  type FileItem = {
    name: string
    type: 'folder' | 'file'
    icon: string
    size?: string
    modified?: string
    kind?: string
    children?: FileItem[]
  }

  const tree: FileItem[] = [
    {
      name: 'Избранное',
      type: 'folder',
      icon: '⭐',
      children: [
        {
          name: 'Рабочий стол',
          type: 'folder',
          icon: '🖥️',
          children: [
            { name: 'Заметки.txt', type: 'file', icon: '📝', size: '2 КБ', modified: '25.03.2026', kind: 'Текст' },
            {
              name: 'Проекты',
              type: 'folder',
              icon: '📁',
              children: [
                {
                  name: 'nasos-svelte',
                  type: 'folder',
                  icon: '📁',
                  children: [
                    { name: 'src', type: 'folder', icon: '📁', children: [] },
                    { name: 'package.json', type: 'file', icon: '📄', size: '1 КБ', kind: 'JSON' }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: 'Загрузки',
          type: 'folder',
          icon: '📥',
          children: [
            { name: 'setup.exe', type: 'file', icon: '⚙️', size: '55 МБ', modified: '24.03.2026', kind: 'Программа' },
            { name: 'фото.jpg', type: 'file', icon: '🖼️', size: '3 МБ', modified: '22.03.2026', kind: 'Изображение' }
          ]
        },
        {
          name: 'Документы',
          type: 'folder',
          icon: '📂',
          children: [
            { name: 'Отчёт.docx', type: 'file', icon: '📄', size: '45 КБ', modified: '20.03.2026', kind: 'Документ' },
            { name: 'Презентация.pptx', type: 'file', icon: '📊', size: '2 МБ', modified: '18.03.2026', kind: 'Презентация' },
            { name: 'Таблица.xlsx', type: 'file', icon: '📊', size: '120 КБ', modified: '15.03.2026', kind: 'Таблица' }
          ]
        }
      ]
    },
    {
      name: 'Устройства',
      type: 'folder',
      icon: '💻',
      children: [
        { name: 'Музыка', type: 'folder', icon: '🎵', children: [
          { name: 'playlist.mp3', type: 'file', icon: '🎵', size: '8 МБ', modified: '10.03.2026', kind: 'Аудио' }
        ]},
        { name: 'Диск C:', type: 'folder', icon: '💾', children: [] },
        { name: 'Диск D:', type: 'folder', icon: '💾', children: [] }
      ]
    }
  ]

  // Sidebar секции (разделы с заголовками)
  type SidebarSection = {
    title: string
    items: { item: FileItem; itemPath: string[] }[]
  }

  const sidebarSections: SidebarSection[] = [
    {
      title: 'Избранное',
      items: [
        { item: tree[0].children![0], itemPath: ['Избранное', 'Рабочий стол'] },
        { item: tree[0].children![1], itemPath: ['Избранное', 'Загрузки'] },
        { item: tree[0].children![2], itemPath: ['Избранное', 'Документы'] }
      ]
    },
    {
      title: 'Устройства',
      items: [
        { item: tree[1].children![0], itemPath: ['Устройства', 'Музыка'] },
        { item: tree[1].children![1], itemPath: ['Устройства', 'Диск C:'] },
        { item: tree[1].children![2], itemPath: ['Устройства', 'Диск D:'] }
      ]
    }
  ]

  const menuItems: MenuItem[] = sidebarSections.map((section) => ({
    key: section.title,
    label: section.title,
    collapsible: true,
    children: section.items.map(({ item, itemPath }) => ({
      key: sidebarItemKey(itemPath),
      label: item.name,
      icon: item.icon
    }))
  }))

  let selectedKey = $state<string | null>('Избранное/Рабочий стол')
  let currentFolder = $state<FileItem>(tree[0].children![0])
  let path = $state<string[]>(['Рабочий стол'])
  let searchQuery = $state('')
  let viewMode = $state<'icons' | 'list'>('icons')
  let history = $state<{ folder: FileItem; path: string[] }[]>([
    { folder: tree[0].children![0], path: ['Рабочий стол'] }
  ])
  let historyIdx = $state(0)

  function navigateTo(item: FileItem, itemPath: string[]) {
    if (item.type !== 'folder') return
    // обрезаем историю вперёд
    history = history.slice(0, historyIdx + 1)
    history.push({ folder: item, path: [itemPath.at(-1)!] })
    historyIdx = history.length - 1
    currentFolder = item
    path = [itemPath.at(-1)!]
    selectedKey = itemPath.join('/')
    searchQuery = ''
    selectedNames = new Set()
  }

  function goBack() {
    if (historyIdx <= 0) return
    historyIdx--
    currentFolder = history[historyIdx].folder
    path = history[historyIdx].path
    selectedKey = path.join('/')
  }

  function goForward() {
    if (historyIdx >= history.length - 1) return
    historyIdx++
    currentFolder = history[historyIdx].folder
    path = history[historyIdx].path
    selectedKey = path.join('/')
  }

  function navigateBreadcrumb(idx: number) {
    // idx 0 = корень текущего пути
    if (idx === path.length - 1) return
    // Находим папку по части пути
    const newPath = path.slice(0, idx + 1)
    // Ищем в дереве
    function findItem(items: FileItem[], parts: string[]): FileItem | null {
      const [head, ...rest] = parts
      const found = items.find((i) => i.name === head)
      if (!found) return null
      if (rest.length === 0) return found
      return findItem(found.children ?? [], rest)
    }
    // Пробуем найти в дереве через flatten sections
    const flat = sidebarSections.flatMap((s) => s.items)
    const match = flat.find((e) => e.itemPath.at(-1) === newPath[0])
    if (!match) return
    const fullPath = [...match.itemPath, ...newPath.slice(1)]
    const item = findItem(match.item.children ?? [], newPath.slice(1)) ?? match.item
    history = history.slice(0, historyIdx + 1)
    history.push({ folder: item, path: newPath })
    historyIdx = history.length - 1
    currentFolder = item
    path = newPath
    selectedKey = fullPath.join('/')
  }

  const listColumns: UiTableColumn[] = [
    { key: 'name', caption: 'Имя' },
    { key: 'modified', caption: 'Изменён', width: '110px' },
    { key: 'kind', caption: 'Тип', width: '90px' },
    { key: 'size', caption: 'Размер', width: '80px' }
  ]

  let selectedNames = $state<Set<string>>(new Set())

  const displayItems = $derived(
    searchQuery
      ? (currentFolder.children ?? []).filter((f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : (currentFolder.children ?? [])
  )

  // Преобразуем displayItems в GridItem[] для UiGrid
  const CELL_W = 96
  const CELL_H = 72
  let gridContentW = $state(0)

  const iconGridItems = $derived.by<GridItem[]>(() => {
    const cols = Math.max(1, Math.floor(gridContentW / CELL_W))
    return displayItems.map((item, idx) => ({
      id: idx + 1,
      col: (idx % cols) + 1,
      row: Math.floor(idx / cols) + 1,
      colSpan: 1,
      rowSpan: 1
    }))
  })

  const selectedInfo = $derived(
    selectedNames.size === 1
      ? displayItems.find((i) => selectedNames.has(i.name)) ?? null
      : null
  )

  function handleGridSelect(selected: GridItem[]) {
    selectedNames = new Set(selected.map((g) => displayItems[g.id - 1]?.name).filter(Boolean) as string[])
  }

  const listRows = $derived(
    displayItems.map((item) => ({
      name: item.name,
      modified: item.modified ?? '—',
      kind: item.kind ?? (item.type === 'folder' ? 'Папка' : 'Файл'),
      size: item.size ?? '—',
      _icon: item.icon,
      _item: item
    }))
  )

  function handleListSelect(selected: Set<number>) {
    selectedNames = new Set(
      [...selected].map((idx) => displayItems[idx]?.name).filter(Boolean) as string[]
    )
  }

  function handleItemDblclick(item: FileItem) {
    if (item.type === 'folder') {
      navigateTo(item, [...path, item.name])
    }
  }

  function sidebarItemKey(itemPath: string[]) {
    return itemPath.join('/')
  }
</script>

<div class="explorer">
  <UiPanels leftWidth={180}>
    {#snippet left()}
      <UiSidebar>
        <UiMenu
          items={menuItems}
          value={selectedKey}
          onselect={(key) => {
            const flat = sidebarSections.flatMap((s) => s.items)
            const match = flat.find((e) => sidebarItemKey(e.itemPath) === key)
            if (match) navigateTo(match.item, match.itemPath)
          }}
        />
      </UiSidebar>
    {/snippet}

    {#snippet main()}
      <div class="main">
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="nav-btns">
            <UiButton variant="secondary" size="sm" disabled={historyIdx <= 0} onclick={goBack}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </UiButton>
            <UiButton variant="secondary" size="sm" disabled={historyIdx >= history.length - 1} onclick={goForward}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2L10 7L5 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </UiButton>
          </div>

          <!-- Breadcrumb -->
          <div class="breadcrumb">
            {#each path as part, i (i)}
              {#if i > 0}<span class="sep">›</span>{/if}
              <button class="crumb" class:last={i === path.length - 1} onclick={() => navigateBreadcrumb(i)}>
                {part}
              </button>
            {/each}
          </div>

          <!-- View toggle & search -->
          <div class="toolbar-right">
            <UiButtonGroup
              inline
              size='sm'
              items={['⊞', '☰']}
              value={viewMode === 'icons' ? '⊞' : '☰'}
              onchange={(v) => (viewMode = v === '⊞' ? 'icons' : 'list')}
            />
            <div class="search-wrap">
              <UiInputSearch bind:value={searchQuery} size='sm' placeholder="🔍 Поиск" />
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="content">
          {#if displayItems.length === 0}
            <div class="empty">
              <span class="empty-icon">📂</span>
              <span>{searchQuery ? 'Ничего не найдено' : 'Папка пуста'}</span>
            </div>
          {:else if viewMode === 'icons'}
            <div class="icons-grid" bind:clientWidth={gridContentW}>
              <UiGrid
                cellW={CELL_W}
                cellH={CELL_H}
                items={iconGridItems}
                selectable="multi"
                onselect={handleGridSelect}
              >
                {#each iconGridItems as gridItem (gridItem.id)}
                  {@const fileItem = displayItems[gridItem.id - 1]}
                  <UiGridCell item={gridItem}>
                    <UiShortcut
                      variant="primary"
                      config={{ icon: fileItem.icon, label: fileItem.name, app: '' }}
                      ondblclick={() => handleItemDblclick(fileItem)}
                    />
                  </UiGridCell>
                {/each}
              </UiGrid>
            </div>
          {:else}
            <UiTable
              columns={listColumns}
              rows={listRows}
              onselect={handleListSelect}
              onrowdblclick={(row) => handleItemDblclick((row as { _item: FileItem })._item)}
            >
              {#snippet cell_name(row: UiTableRow)}
                <span class="list-name-cell">
                  <span class="list-icon">{(row as { _icon: string })._icon}</span>
                  {row.name as string}
                </span>
              {/snippet}
            </UiTable>
          {/if}
        </div>

        <!-- Status bar -->
        <div class="statusbar">
          <span>{displayItems.length} объект{displayItems.length === 1 ? '' : 'ов'}</span>
          {#if selectedNames.size > 0}
            <span class="status-sep">·</span>
            {#if selectedNames.size > 1}
              <span>Выбрано: {selectedNames.size}</span>
            {:else if selectedInfo}
              <span class="status-name">{selectedInfo.name}</span>
              {#if selectedInfo.size}
                <span class="status-sep">·</span>
                <span>{selectedInfo.size}</span>
              {/if}
            {/if}
          {/if}
        </div>
      </div>
    {/snippet}
  </UiPanels>
</div>

<style>
  .explorer {
    height: 100%;
    font-size: 13px;
    background: #f5f6fa;
    overflow: hidden;
  }

  /* ─── Main ─── */
  .main {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #fafafa;
  }

  /* ─── Toolbar ─── */
  .toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: #f0f1f5;
    border-bottom: 1px solid #dde0ea;
    flex-shrink: 0;
  }

  .nav-btns {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
  }

  .breadcrumb {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 2px;
    height: 22px;
    padding: 0 10px;
    background: white;
    border: 1px solid #c8ccd8;
    border-radius: 7px;
    overflow: hidden;
    min-width: 0;
  }

  .crumb {
    background: none;
    border: none;
    padding: 0 2px;
    font-size: 13px;
    font-family: inherit;
    color: #4a90d9;
    cursor: pointer;
    white-space: nowrap;
    border-radius: 3px;
  }
  .crumb:hover {
    text-decoration: underline;
  }
  .crumb.last {
    color: #222;
    cursor: default;
    font-weight: 500;
  }
  .crumb.last:hover {
    text-decoration: none;
  }

  .sep {
    color: #aaa;
    font-size: 12px;
    user-select: none;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .search-wrap {
    width: 140px;
  }

  /* ─── Content ─── */
  .content {
    flex: 1;
    overflow-y: auto;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 100%;
    color: #aaa;
    font-size: 13px;
  }
  .empty-icon {
    font-size: 40px;
    opacity: 0.4;
  }

  /* Icons view */
  .icons-grid {
    width: 100%;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
  }


  /* List view */
  .list-name-cell {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .list-icon {
    margin-right: 7px;
    font-size: 15px;
    flex-shrink: 0;
  }

  /* ─── Status bar ─── */
  .statusbar {
    padding: 4px 12px;
    background: #f0f1f5;
    border-top: 1px solid #dde0ea;
    font-size: 11px;
    color: #777;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .status-sep {
    color: #bbb;
  }
  .status-name {
    color: #444;
    font-weight: 500;
  }
</style>
