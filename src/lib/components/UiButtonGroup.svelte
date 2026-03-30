<script lang="ts">
  let {
    items,
    value,
    onchange,
    variant = 'default'
  }: {
    items: string[];
    value: string;
    onchange?: (value: string) => void;
    variant?: 'default' | 'transparent';
  } = $props();
</script>

<div class="btn-group" class:transparent={variant === 'transparent'}>
  {#each items as item (item)}
    <button class="btn" class:active={value === item} onclick={() => onchange?.(item)}
      >{item}</button
    >
  {/each}
</div>

<style>
  .btn-group {
    display: flex;
    justify-content: center;
    gap: 6px;
    padding: 10px 14px;
    border-bottom: 1px solid #dde0ea;
    background: white;
    flex-wrap: wrap;
  }

  .btn {
    padding: 4px 12px;
    border-radius: 20px;
    border: 1px solid #dde0ea;
    background: white;
    color: #555;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
  }
  .btn:hover {
    border-color: #4a90d9;
    color: #4a90d9;
  }
  .btn.active {
    background: #4a90d9;
    border-color: #4a90d9;
    color: white;
    font-weight: 600;
  }

  /* transparent */
  .btn-group.transparent {
    background: transparent;
    border-top: none;
    border-bottom: none;
  }
  .btn-group.transparent .btn {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.22);
    color: rgba(255, 255, 255, 0.8);
  }
  .btn-group.transparent .btn:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.4);
    color: white;
  }
  .btn-group.transparent .btn.active {
    background: rgba(255, 255, 255, 0.33);
    border-color: rgba(255, 255, 255, 0.55);
    color: white;
    font-weight: 600;
  }
</style>
