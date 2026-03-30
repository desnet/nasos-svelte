<script lang="ts">
  let {
    value = $bindable(''),
    placeholder = '🔍 Поиск...',
    variant = 'default'
  }: {
    value?: string;
    placeholder?: string;
    variant?: 'default' | 'transparent';
  } = $props();
</script>

<input
  class="search"
  class:transparent={variant === 'transparent'}
  type="text"
  {placeholder}
  bind:value
/>

<style>
  .search {
    padding: 6px 10px;
    border-radius: 20px;
    border: 1px solid #dde0ea;
    background: #f5f6fa;
    color: #333;
    font-size: 12px;
    outline: none;
    font-family: inherit;
    margin-bottom: 4px;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
  }
  .search:focus {
    border-color: #4a90d9;
    background: white;
  }

  /* transparent — стиль под окно с вариантом transparent */
  .search.transparent {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.22);
    color: white;
  }
  .search.transparent::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  .search.transparent:focus {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.55);
  }
</style>
