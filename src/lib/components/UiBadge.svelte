<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    variant = 'default',
    children
  } = $props<{
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'primary';
    children: Snippet;
  }>();
</script>

<span class="badge {variant}">{@render children()}</span>

<style>
  .badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 10px;
    white-space: nowrap;
  }

  .badge.default {
    background: #eef0f8;
    color: #666;
  }

  .badge.primary {
    background: #dbeeff;
    color: #1a6abf;
  }

  .badge.success {
    background: #d6f5e3;
    color: #1a7a3e;
  }

  .badge.error {
    background: #ffe0e0;
    color: #c0392b;
  }

  .badge.warning {
    background: #fff3d6;
    color: #a06000;
  }

  .badge.info {
    background: #e0f0ff;
    color: #2066a8;
  }
</style>
