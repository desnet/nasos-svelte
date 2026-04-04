<script lang="ts">
  import UiButton from '$lib/components/UiButton.svelte';

  let items = $state([
    { name: 'old_report.docx', icon: '📄', deleted: '20.03.2026' },
    { name: 'temp_file.tmp', icon: '📄', deleted: '22.03.2026' },
    { name: 'backup_2025', icon: '📁', deleted: '15.03.2026' }
  ]);

  function restore(name: string) {
    items = items.filter((i) => i.name !== name);
  }

  function clear() {
    items = [];
  }
</script>

<div class="trash">
  <div class="toolbar">
    <UiButton variant="danger" size="sm" disabled={items.length === 0} onclick={clear}>🗑️ Очистить корзину</UiButton>
    <span class="count">{items.length} объект(ов)</span>
  </div>

  {#if items.length === 0}
    <div class="empty">
      <span class="empty-icon">🗑️</span>
      <p>Корзина пуста</p>
    </div>
  {:else}
    <div class="list">
      {#each items as item (item.name)}
        <div class="item">
          <span class="icon">{item.icon}</span>
          <span class="name">{item.name}</span>
          <span class="date">{item.deleted}</span>
          <UiButton variant="secondary" size="sm" onclick={() => restore(item.name)}>↩ Восстановить</UiButton>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .trash {
    display: flex;
    flex-direction: column;
    height: 100%;
    font-size: 13px;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px;
    background: #f0f0f0;
    border-bottom: 1px solid #ddd;
  }


  .count {
    font-size: 11px;
    color: #666;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: #aaa;
    gap: 8px;
  }
  .empty-icon {
    font-size: 48px;
  }
  .empty p {
    margin: 0;
  }

  .list {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px;
    border-radius: 4px;
  }
  .item:hover {
    background: #f5f5f5;
  }

  .icon {
    font-size: 18px;
  }
  .name {
    flex: 1;
  }
  .date {
    color: #999;
    font-size: 11px;
  }

</style>
