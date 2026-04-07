<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { UiTableColumn } from '$lib/components/UiTable.js'

  type Row = Record<string, unknown>

  let {
    columns,
    rows,
    selected = $bindable<Set<number>>(new Set()),
    onselect,
    onrowdblclick,
    ...cellSnippets
  } = $props<{
    columns: UiTableColumn[]
    rows: Row[]
    selected?: Set<number>
    onselect?: (selected: Set<number>) => void
    onrowdblclick?: (row: Row, idx: number) => void
    [key: string]: unknown
  }>()

  function handleClick(idx: number) {
    const next = new Set([idx])
    selected = next
    onselect?.(next)
  }

  function gridTemplate() {
    return columns.map((c: UiTableColumn) => c.width ?? '1fr').join(' ')
  }
</script>

<div class="ui-table">
  <!-- Header -->
  <div class="table-header" style="grid-template-columns: {gridTemplate()}">
    {#each columns as col (col.key)}
      <span class="header-cell">{col.caption}</span>
    {/each}
  </div>

  <!-- Body -->
  <div class="table-body">
    {#each rows as row, idx (idx)}
      <div
        class="table-row"
        class:selected={selected.has(idx)}
        role="button"
        tabindex="0"
        style="grid-template-columns: {gridTemplate()}"
        onclick={() => handleClick(idx)}
        ondblclick={() => onrowdblclick?.(row, idx)}
        onkeydown={(e) => e.key === 'Enter' && handleClick(idx)}
      >
        {#each columns as col (col.key)}
          <span class="table-cell">
            {#if (cellSnippets as Record<string, Snippet<[Row]>>)[`cell_${col.key}`]}
              {@render (cellSnippets as Record<string, Snippet<[Row]>>)[`cell_${col.key}`](row)}
            {:else}
              {row[col.key] ?? '—'}
            {/if}
          </span>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .ui-table {
    display: flex;
    flex-direction: column;
    width: 100%;
    font-size: 13px;
    font-family: inherit;
  }

  .table-header {
    display: grid;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    color: #888;
    border-bottom: 1px solid #dde0ea;
    background: #f5f6fa;
    position: sticky;
    top: 0;
    user-select: none;
  }

  .header-cell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .table-body {
    display: flex;
    flex-direction: column;
  }

  .table-row {
    display: grid;
    align-items: center;
    padding: 5px 10px;
    border: none;
    background: none;
    font-family: inherit;
    font-size: 13px;
    color: #222;
    cursor: default;
    text-align: left;
    transition: background 0.1s;
  }
  .table-row:hover {
    background: rgba(74, 144, 217, 0.08);
  }
  .table-row.selected {
    background: rgba(74, 144, 217, 0.18);
  }

  .table-cell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
    color: #222;
  }
</style>
