<script lang="ts">
  import { getContext } from 'svelte';
  import { wallpaperStore, WALLPAPERS, type Wallpaper } from '$lib/stores/wallpaper.svelte';
  import UiButtonGroup from '$lib/components/UiButtonGroup.svelte';
  import UiButton from '$lib/components/UiButton.svelte';
  import UiBadge from '$lib/components/UiBadge.svelte';
  import UiPanels from '$lib/components/UiPanels.svelte';
  import type { WindowContext } from '$lib/components/Window.svelte';

  getContext<WindowContext>('window').setSize(720, 480);

  const categories = ['Все', ...new Set(WALLPAPERS.map((w) => w.category))];

  let selectedCat = $state('Все');
  let preview = $state<Wallpaper | null>(null);

  const filtered = $derived(
    selectedCat === 'Все' ? WALLPAPERS : WALLPAPERS.filter((w) => w.category === selectedCat)
  );

  const activePreview = $derived(preview ?? wallpaperStore.current);

  function apply(w: Wallpaper) {
    wallpaperStore.set(w);
    preview = null;
  }
</script>

<div class="wallpapers">
  <UiPanels rightWidth={220}>
    {#snippet main()}
      <!-- Галерея -->
      <div class="gallery-pane">
        <UiButtonGroup items={categories} value={selectedCat} onchange={(v) => (selectedCat = v)} />
        <div class="grid">
          {#each filtered as w (w.id)}
            <button
              class="thumb"
              class:current={wallpaperStore.current.id === w.id}
              class:previewing={preview?.id === w.id}
              onclick={() => (preview = w)}
              ondblclick={() => apply(w)}
              title="{w.name} — двойной клик для применения"
            >
              <div class="thumb-bg" style="background: {w.thumb}"></div>
              {#if wallpaperStore.current.id === w.id}
                <div class="thumb-badge current">✓</div>
              {/if}
              <div class="thumb-name">{w.name}</div>
            </button>
          {/each}
        </div>
        <p class="hint">Один клик — предпросмотр · Двойной клик — применить</p>
      </div>
    {/snippet}

    {#snippet right()}
      <!-- Превью -->
      <div class="preview-pane">
        <div class="screen-frame">
          <div class="screen-bg" style="background: {activePreview.css}">
            <div class="mock-icons">
              {#each ['📁', '📝', '🗑️', '💻', '🏪'] as ic (ic)}
                <div class="mock-icon">
                  <span>{ic}</span>
                  <div class="mock-label"></div>
                </div>
              {/each}
            </div>
            <div class="mock-taskbar"></div>
          </div>
        </div>
        <div class="preview-info">
          <span class="preview-name">{activePreview.name}</span>
          <UiBadge>{activePreview.category}</UiBadge>
        </div>
        <div class="preview-actions">
          {#if preview && preview.id !== wallpaperStore.current.id}
            <UiButton onclick={() => apply(preview!)}>✓ Применить</UiButton>
            <UiButton variant="secondary" onclick={() => (preview = null)}>Отмена</UiButton>
          {:else}
            <span class="applied-badge">✓ Установлено</span>
          {/if}
        </div>
      </div>
    {/snippet}
  </UiPanels>
</div>

<style>
  .wallpapers {
    height: 100%;
    font-size: 13px;
    background: #f5f6fa;
  }

  /* Preview pane */
  .preview-pane {
    height: 100%;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 16px;
    gap: 12px;
    overflow-y: auto;
  }

  .screen-frame {
    width: 180px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
    border: 3px solid #333;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    flex-shrink: 0;
  }

  .screen-bg {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    transition: background 0.4s ease;
  }

  .mock-icons {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px;
  }

  .mock-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    width: 22px;
  }
  .mock-icon span {
    font-size: 12px;
  }
  .mock-label {
    width: 18px;
    height: 3px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 2px;
  }

  .mock-taskbar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 12px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }

  .preview-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
  }
  .preview-name {
    font-weight: 700;
    font-size: 14px;
    color: #222;
  }
.preview-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

.applied-badge {
    font-size: 12px;
    color: #4a90d9;
    font-weight: 600;
  }

  /* Gallery pane */
  .gallery-pane {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .grid {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
    align-content: flex-start;
  }

  .thumb {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    padding: 0;
    background: none;
    display: flex;
    flex-direction: column;
    transition:
      transform 0.1s,
      border-color 0.15s;
  }
  .thumb:hover {
    transform: scale(1.04);
    border-color: #aac4e8;
  }
  .thumb.previewing {
    border-color: #4a90d9;
    box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.3);
  }
  .thumb.current {
    border-color: #2a70b9;
  }

  .thumb-bg {
    width: 100%;
    height: 70px;
    transition: background 0.3s;
  }

  .thumb-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }
  .thumb-badge.current {
    background: #4a90d9;
    color: white;
  }

  .thumb-name {
    padding: 4px 4px 5px;
    font-size: 10px;
    color: #444;
    text-align: center;
    background: white;
    line-height: 1.2;
  }

  .hint {
    padding: 6px 14px;
    font-size: 11px;
    color: #aaa;
    text-align: center;
    border-top: 1px solid #eee;
    margin: 0;
    background: white;
  }
</style>
