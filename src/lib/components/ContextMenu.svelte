<script lang="ts">
  import type { MenuItem } from './contextMenu.types';

  let { x, y, items, onclose } = $props<{
    x: number;
    y: number;
    items: MenuItem[];
    onclose: () => void;
  }>();

  let menuW = $state(190);
  let menuH = $state(200);

  const menuX = $derived(Math.min(x, window.innerWidth - menuW - 4));
  const menuY = $derived(Math.min(y, window.innerHeight - menuH - 4));

  function handleAction(action: () => void) {
    action();
    onclose();
  }
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onclose()} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="ctx-overlay"
  onclick={onclose}
  oncontextmenu={(e) => {
    e.preventDefault();
    onclose();
  }}
></div>

<div
  class="ctx-menu"
  style="left: {menuX}px; top: {menuY}px"
  bind:clientWidth={menuW}
  bind:clientHeight={menuH}
>
  {#each items as item, i (i)}
    {#if item.kind === 'section'}
      <div class="ctx-section">{item.text}</div>
    {:else if item.kind === 'label'}
      <div class="ctx-label">{item.text}</div>
    {:else if item.kind === 'divider'}
      <div class="ctx-divider"></div>
    {:else if item.kind === 'item'}
      <button class="ctx-item" class:danger={item.danger} onclick={() => handleAction(item.action)}>
        <span class="ctx-icon">{item.icon}</span>
        {item.label}
      </button>
    {/if}
  {/each}
</div>

<style>
  .ctx-overlay {
    position: fixed;
    inset: 0;
    z-index: 10001;
  }

  .ctx-menu {
    position: fixed;
    z-index: 10002;
    background: rgba(20, 30, 50, 0.95);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    padding: 4px;
    min-width: 190px;
    color: white;
    font-size: 13px;
  }

  .ctx-section {
    padding: 6px 12px 4px;
    font-size: 11px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .ctx-label {
    padding: 4px 12px 2px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.35);
  }

  .ctx-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 7px 12px;
    background: none;
    border: none;
    color: white;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    border-radius: 5px;
    text-align: left;
  }
  .ctx-item:hover {
    background: rgba(74, 144, 217, 0.3);
  }
  .ctx-item.danger:hover {
    background: rgba(220, 50, 50, 0.35);
  }

  .ctx-icon {
    font-size: 15px;
    width: 20px;
    text-align: center;
  }

  .ctx-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 4px 8px;
  }
</style>
