<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity'
  import type { MenuItem } from './UiMenu'

  let {
    items,
    value = $bindable<string | null>(null),
    onselect
  } = $props<{
    items: MenuItem[]
    value?: string | null
    onselect?: (key: string) => void
  }>()

  function collectCollapsible(list: MenuItem[]): MenuItem[] {
    return list.flatMap((item) => {
      const result: MenuItem[] = []
      if (item.collapsible) result.push(item)
      if (item.children) result.push(...collectCollapsible(item.children))
      return result
    })
  }

  // Инициализируется один раз из начального items
  const expanded = new SvelteSet<string>(
    collectCollapsible(items)
      .filter((item) => item.defaultExpanded !== false)
      .map((item) => item.key)
  )

  function toggle(key: string) {
    if (expanded.has(key)) expanded.delete(key)
    else expanded.add(key)
  }

  function select(item: MenuItem) {
    if (item.groupOnly || item.children) return
    value = item.key
    onselect?.(item.key)
  }

  function handleKey(e: KeyboardEvent, item: MenuItem) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (item.collapsible && item.children) toggle(item.key)
      else select(item)
    }
  }
</script>

<nav class="ui-menu">
  {#each items as item (item.key)}
    {@render node(item, 0)}
  {/each}
</nav>

{#snippet node(item: MenuItem, depth: number)}
  {@const hasChildren = !!item.children?.length}
  {@const isExpanded = expanded.has(item.key)}
  {@const isCollapsible = item.collapsible && hasChildren}
  {@const isActive = value === item.key}

  <div class="menu-node" style="--depth: {depth}">
    {#if isCollapsible || item.groupOnly || hasChildren}
      <!-- Заголовок группы: без горизонтальных отступов, без hover -->
      {#if isCollapsible}
        <div
          class="menu-group"
          role="button"
          tabindex="0"
          aria-expanded={isExpanded}
          onclick={() => toggle(item.key)}
          onkeydown={(e) => handleKey(e, item)}
        >
          {#if item.icon}<span class="menu-icon">{item.icon}</span>{/if}
          <span class="menu-label">{item.label}</span>
          {#if item.badge != null}<span class="menu-badge">{item.badge}</span>{/if}
          <span class="chevron" class:open={isExpanded}>›</span>
        </div>
      {:else}
        <div class="menu-group">
          {#if item.icon}<span class="menu-icon">{item.icon}</span>{/if}
          <span class="menu-label">{item.label}</span>
          {#if item.badge != null}<span class="menu-badge">{item.badge}</span>{/if}
        </div>
      {/if}
    {:else}
      <!-- Обычный пункт -->
      <button
        class="menu-item"
        class:active={isActive}
        onclick={() => select(item)}
        onkeydown={(e) => handleKey(e, item)}
      >
        {#if item.icon}<span class="menu-icon">{item.icon}</span>{/if}
        <span class="menu-label">{item.label}</span>
        {#if item.badge != null}<span class="menu-badge">{item.badge}</span>{/if}
      </button>
    {/if}

    {#if hasChildren && (!isCollapsible || isExpanded)}
      <div class="menu-children">
        {#each item.children! as child (child.key)}
          {@render node(child, depth + 1)}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<style>
  .ui-menu {
    display: flex;
    flex-direction: column;
    gap: 1px;
    font-size: 13px;
    font-family: inherit;
  }

  .menu-node {
    display: flex;
    flex-direction: column;
  }

  /* Заголовок группы */
  .menu-group {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px 2px;
    font-size: 11px;
    font-weight: 700;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    user-select: none;
  }
  .menu-group[role='button'] {
    cursor: pointer;
  }

  /* Пункт меню — те же горизонтальные отступы что у группы */
  .menu-item {
    display: flex;
    align-items: center;
    gap: 7px;
    width: 100%;
    padding: 5px 10px;
    border: none;
    background: none;
    color: #2d2d2d;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    border-radius: 6px;
    text-align: left;
    transition: background 0.1s;
  }
  .menu-item:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  .menu-item.active {
    background: #4a90d9;
    color: white;
  }
  .menu-item.active .menu-badge {
    background: rgba(255, 255, 255, 0.25);
    color: white;
  }

  .chevron {
    margin-left: auto;
    font-size: 14px;
    color: #aaa;
    transition: transform 0.18s;
    display: inline-block;
    transform: rotate(0deg);
    line-height: 1;
  }
  .chevron.open {
    transform: rotate(90deg);
  }

  /* Иконка */
  .menu-icon {
    font-size: 15px;
    flex-shrink: 0;
    line-height: 1;
  }

  /* Лейбл */
  .menu-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Бейдж */
  .menu-badge {
    flex-shrink: 0;
    font-size: 10px;
    background: #e8eaf2;
    color: #888;
    padding: 1px 6px;
    border-radius: 10px;
    font-weight: 600;
  }

  /* Дочерние пункты */
  .menu-children {
    display: flex;
    flex-direction: column;
    padding-bottom: 10px;
  }
</style>
