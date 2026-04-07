<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    header,
    children,
    footer
  } = $props<{
    header?: Snippet
    children: Snippet
    footer?: Snippet
  }>()
</script>

<div class="sidebar">
  {#if header}
    <div class="sidebar-header">
      {@render header()}
    </div>
  {/if}

  <div class="sidebar-content">
    {@render children()}
  </div>

  {#if footer}
    <div class="sidebar-footer">
      {@render footer()}
    </div>
  {/if}
</div>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #eceef3;
    overflow: hidden;
    color: #666;
  }

  .sidebar-header {
    flex-shrink: 0;
    padding: 10px;
    border-bottom: 1px solid #dde0ea;
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }

  .sidebar-footer {
    flex-shrink: 0;
    padding: 10px;
    border-top: 1px solid #dde0ea;
  }
</style>
