<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    left,
    main,
    right,
    leftWidth = 180,
    rightWidth = 200,
    minColumnWidth = 80
  } = $props<{
    left?: Snippet
    main?: Snippet
    right?: Snippet
    leftWidth?: number
    rightWidth?: number
    minColumnWidth?: number
  }>()

  let leftW = $state(leftWidth)
  let rightW = $state(rightWidth)

  function startDrag(side: 'left' | 'right', e: PointerEvent) {
    e.preventDefault()
    const startX = e.clientX
    const startW = side === 'left' ? leftW : rightW

    function onMove(ev: PointerEvent) {
      const delta = ev.clientX - startX
      if (side === 'left') {
        leftW = Math.max(minColumnWidth, startW + delta)
      } else {
        rightW = Math.max(minColumnWidth, startW - delta)
      }
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }
</script>

<div class="ui-panels">
  {#if left}
    <div class="panel panel-left" style="width: {leftW}px">
      {@render left()}
    </div>
    <div
      class="divider"
      role="separator"
      aria-orientation="vertical"
      onpointerdown={(e) => startDrag('left', e)}
    ></div>
  {/if}

  <div class="panel panel-main">
    {#if main}
      {@render main()}
    {/if}
  </div>

  {#if right}
    <div
      class="divider"
      role="separator"
      aria-orientation="vertical"
      onpointerdown={(e) => startDrag('right', e)}
    ></div>
    <div class="panel panel-right" style="width: {rightW}px">
      {@render right()}
    </div>
  {/if}
</div>

<style>
  .ui-panels {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    background: transparent;
    overflow: hidden;
  }

  .panel {
    overflow: hidden;
    height: 100%;
    min-width: 0;
  }

  .panel-main {
    flex: 1;
  }

  .panel-left,
  .panel-right {
    flex-shrink: 0;
  }

  .divider {
    flex-shrink: 0;
    width: 1px;
    background: #dde0ea;
    cursor: col-resize;
    position: relative;
    transition: background 0.15s;
  }

  /* Расширяем зону захвата не меняя внешний вид */
  .divider::after {
    content: '';
    position: absolute;
    inset: 0 -3px;
    cursor: col-resize;
  }

  .divider:hover {
    background: #4a90d9;
  }
</style>
