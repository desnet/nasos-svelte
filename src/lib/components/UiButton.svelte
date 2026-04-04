<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    variant = 'primary',
    size = 'md',
    iconPosition = 'left',
    disabled = false,
    onclick,
    icon,
    children
  } = $props<{
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'md' | 'sm';
    iconPosition?: 'left' | 'right';
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
    icon?: Snippet;
    children: Snippet;
  }>();
</script>

<button class="btn {variant} {size}" {disabled} {onclick}>
  {#if icon && iconPosition === 'left'}
    <span class="icon">{@render icon()}</span>
  {/if}
  {@render children()}
  {#if icon && iconPosition === 'right'}
    <span class="icon">{@render icon()}</span>
  {/if}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
    white-space: nowrap;
    transition: background 0.12s, filter 0.12s;
  }

  .btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  /* Sizes */
  .btn.md {
    padding: 6px 14px;
    font-size: 12px;
  }
  .btn.sm {
    padding: 4px 10px;
    font-size: 11px;
  }

  /* Variants */
  .btn.primary {
    background: #4a90d9;
    color: white;
  }
  .btn.primary:hover:not(:disabled) {
    background: #357abd;
  }

  .btn.secondary {
    background: white;
    color: #333;
    border: 1px solid #bbb;
  }
  .btn.secondary:hover:not(:disabled) {
    background: #e8e8e8;
  }

  .btn.danger {
    background: white;
    color: #333;
    border: 1px solid #bbb;
  }
  .btn.danger:hover:not(:disabled) {
    background: #ffe0e0;
  }

  .icon {
    display: inline-flex;
    align-items: center;
  }
</style>
