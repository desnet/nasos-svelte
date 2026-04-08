<script lang="ts">
  import { tick } from 'svelte'

  import type { UiSelectOption } from '$lib/components/UiSelect.js'

  let {
    value = $bindable(''),
    options = [],
    placeholder = 'Выберите...',
    size = 'md'
  }: {
    value?: string
    options: UiSelectOption[]
    placeholder?: string
    size?: 'sm' | 'md' | 'lg'
  } = $props()

  let open = $state(false)
  let search = $state('')
  let searchInput = $state<HTMLInputElement | null>(null)
  let container = $state<HTMLDivElement | null>(null)
  let activeIdx = $state(-1)

  const selectedLabel = $derived(
    options.find((o) => o.value === value)?.label ?? placeholder
  )

  const filtered = $derived(
    search.trim() === ''
      ? options
      : options.filter((o) =>
          o.label.toLowerCase().startsWith(search.toLowerCase())
        )
  )

  async function openDropdown() {
    open = true
    search = ''
    activeIdx = filtered.findIndex((o) => o.value === value)
    await tick()
    searchInput?.focus()
  }

  function close() {
    open = false
    search = ''
    activeIdx = -1
  }

  function select(opt: UiSelectOption) {
    value = opt.value
    close()
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        openDropdown()
      }
      return
    }
    if (e.key === 'Escape') { close(); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      activeIdx = Math.min(activeIdx + 1, filtered.length - 1)
      scrollActiveIntoView()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      activeIdx = Math.max(activeIdx - 1, 0)
      scrollActiveIntoView()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0 && filtered[activeIdx]) select(filtered[activeIdx])
    }
  }

  function handleSearchInput() {
    activeIdx = filtered.length > 0 ? 0 : -1
  }

  function scrollActiveIntoView() {
    tick().then(() => {
      const el = container?.querySelector<HTMLElement>('.opt.active')
      el?.scrollIntoView({ block: 'nearest' })
    })
  }

  function handleOutsideClick(e: MouseEvent) {
    if (container && !container.contains(e.target as Node)) {
      close()
    }
  }
</script>

<svelte:document onclick={handleOutsideClick} />

<div class="ui-select {size}" bind:this={container}>
  <!-- Trigger -->
  <button
    class="trigger"
    class:open
    type="button"
    onclick={openDropdown}
    onkeydown={handleKeydown}
  >
    <span class="trigger-label" class:placeholder={!value}>{selectedLabel}</span>
    <span class="chevron" class:open>▾</span>
  </button>

  <!-- Dropdown -->
  {#if open}
    <div class="dropdown">
      <div class="search-wrap">
        <input
          bind:this={searchInput}
          class="search"
          type="text"
          placeholder="Поиск..."
          bind:value={search}
          oninput={handleSearchInput}
          onkeydown={handleKeydown}
        />
      </div>
      <div class="options" bind:this={container} role="listbox">
        {#if filtered.length === 0}
          <div class="no-results">Ничего не найдено</div>
        {:else}
          {#each filtered as opt, i (opt.value)}
            <button
              class="opt"
              class:selected={opt.value === value}
              class:active={i === activeIdx}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              onclick={() => select(opt)}
              onmouseenter={() => (activeIdx = i)}
            >{opt.label}</button>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .ui-select {
    position: relative;
    width: 100%;
    font-family: inherit;
  }

  /* ─── Trigger ─── */
  .trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    border: 1px solid #c8ccd8;
    border-radius: 6px;
    background: white;
    color: #222;
    font-family: inherit;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.15s, box-shadow 0.15s;
    outline: none;
  }

  .ui-select.sm .trigger { height: 22px; font-size: 11px; }
  .ui-select.md .trigger { height: 30px; font-size: 13px; }
  .ui-select.lg .trigger { height: 36px; font-size: 14px; }

  .trigger:hover { border-color: #4a90d9; }
  .trigger.open {
    border-color: #4a90d9;
    box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.15);
  }

  .trigger-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .trigger-label.placeholder { color: #aaa; }

  .chevron {
    font-size: 11px;
    color: #aaa;
    margin-left: 6px;
    flex-shrink: 0;
    transition: transform 0.15s;
    display: inline-block;
  }
  .chevron.open { transform: rotate(180deg); }

  /* ─── Dropdown ─── */
  .dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #dde0ea;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    z-index: 1000;
    overflow: hidden;
  }

  /* ─── Search ─── */
  .search-wrap {
    padding: 6px 8px;
    border-bottom: 1px solid #eef0f8;
  }

  .search {
    width: 100%;
    height: 26px;
    padding: 0 8px;
    box-sizing: border-box;
    border: 1px solid #dde0ea;
    border-radius: 5px;
    font-size: 12px;
    font-family: inherit;
    color: #333;
    background: #f5f6fa;
    outline: none;
    transition: border-color 0.15s;
  }
  .search:focus { border-color: #4a90d9; background: white; }

  /* ─── Options ─── */
  .options {
    max-height: 220px;
    overflow-y: auto;
    padding: 4px 0;
  }

  .opt {
    display: block;
    width: 100%;
    padding: 6px 12px;
    text-align: left;
    background: none;
    border: none;
    font-size: 13px;
    font-family: inherit;
    color: #222;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: background 0.08s;
  }

  .opt:hover,
  .opt.active { background: #f0f5ff; }

  .opt.selected {
    color: #4a90d9;
    font-weight: 600;
  }
  .opt.selected.active { background: #e8f0ff; }

  .no-results {
    padding: 10px 12px;
    font-size: 12px;
    color: #bbb;
    text-align: center;
  }
</style>
