<script lang="ts">
  import { appStore, type AppCategory, type StoreApp } from '$lib/stores/appstore.svelte';
  import UiInputSearch from '$lib/components/UiInputSearch.svelte';

  const CATEGORIES: AppCategory[] = [
    'Все',
    'Продуктивность',
    'Утилиты',
    'Игры',
    'Медиа',
    'Разработка'
  ];

  let category = $state<AppCategory>('Все');
  let search = $state('');
  let detail = $state<StoreApp | null>(null);

  const filtered = $derived(
    appStore.apps.filter((a) => {
      const matchCat = category === 'Все' || a.category === category;
      const matchSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
  );

  const featured = $derived(appStore.apps.filter((a) => a.featured));

  function stars(rating: number) {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  }
</script>

<div class="store">
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="store-logo">
      <span>🏪</span>
      <span>NasStore</span>
    </div>
    <UiInputSearch bind:value={search} />
    <nav class="nav">
      {#each CATEGORIES as cat (cat)}
        <button
          class="nav-item"
          class:active={category === cat}
          onclick={() => {
            category = cat;
            detail = null;
          }}
        >
          {cat}
        </button>
      {/each}
    </nav>
    <div class="installed-count">
      Установлено: {appStore.apps.filter((a) => a.installed).length} / {appStore.apps.length}
    </div>
  </aside>

  <!-- Main -->
  <main class="main">
    {#if detail}
      <!-- Детальная страница приложения -->
      <div class="detail">
        <button class="back-btn" onclick={() => (detail = null)}>← Назад</button>
        <div class="detail-header">
          <span class="detail-icon">{detail.icon}</span>
          <div class="detail-info">
            <h2>{detail.name}</h2>
            <div class="detail-meta">
              <span class="author">{detail.author}</span>
              <span class="cat-badge">{detail.category}</span>
            </div>
            <div class="rating">
              <span class="stars">{stars(detail.rating)}</span>
              <span class="rating-num">{detail.rating}</span>
              <span class="reviews">({detail.reviews.toLocaleString('ru')} отзывов)</span>
            </div>
          </div>
          <div class="detail-action">
            {#if appStore.getProgress(detail.id) !== null}
              <div class="progress-wrap">
                <div class="progress-bar" style="width: {appStore.getProgress(detail.id)}%"></div>
              </div>
              <span class="progress-label">{Math.round(appStore.getProgress(detail.id)!)}%</span>
            {:else if detail.installed}
              <button class="btn-uninstall" onclick={() => appStore.uninstall(detail!.id)}>
                Удалить
              </button>
            {:else}
              <button class="btn-install" onclick={() => appStore.install(detail!.id)}>
                Установить
              </button>
            {/if}
          </div>
        </div>

        <div class="detail-body">
          <div class="detail-desc">{detail.description}</div>
          <div class="detail-specs">
            <div class="spec"><span>Версия</span><span>{detail.version}</span></div>
            <div class="spec"><span>Размер</span><span>{detail.size}</span></div>
            <div class="spec"><span>Категория</span><span>{detail.category}</span></div>
            <div class="spec"><span>Разработчик</span><span>{detail.author}</span></div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Список приложений -->
      {#if category === 'Все' && !search}
        <!-- Рекомендуемые -->
        <section class="section">
          <h3 class="section-title">⭐ Рекомендуемые</h3>
          <div class="featured-row">
            {#each featured as app (app.id)}
              <button class="featured-card" onclick={() => (detail = app)}>
                <span class="fc-icon">{app.icon}</span>
                <span class="fc-name">{app.name}</span>
                <span class="fc-cat">{app.category}</span>
                {#if app.installed}
                  <span class="fc-badge">✓</span>
                {/if}
              </button>
            {/each}
          </div>
        </section>
      {/if}

      <section class="section">
        <h3 class="section-title">
          {category === 'Все' ? 'Все приложения' : category}
          <span class="count">{filtered.length}</span>
        </h3>
        {#if filtered.length === 0}
          <div class="empty">Ничего не найдено</div>
        {:else}
          <div class="app-list">
            {#each filtered as app (app.id)}
              <div
                class="app-row"
                onclick={() => (detail = app)}
                onkeydown={(e) => e.key === 'Enter' && (detail = app)}
                role="button"
                tabindex="0"
              >
                <span class="app-icon">{app.icon}</span>
                <div class="app-info">
                  <div class="app-name">
                    {app.name}
                    <span class="app-ver">v{app.version}</span>
                  </div>
                  <div class="app-desc">{app.description}</div>
                  <div class="app-meta">
                    <span class="stars small">{stars(app.rating)}</span>
                    <span class="app-size">{app.size}</span>
                  </div>
                </div>
                <div class="app-action" onclick={(e) => e.stopPropagation()} role="presentation">
                  {#if appStore.getProgress(app.id) !== null}
                    <div class="mini-progress">
                      <div class="mini-bar" style="width: {appStore.getProgress(app.id)}%"></div>
                    </div>
                  {:else if app.installed}
                    <span class="installed-badge">✓ Установлено</span>
                  {:else}
                    <button
                      class="btn-install small"
                      onclick={(e) => {
                        e.stopPropagation();
                        appStore.install(app.id);
                      }}
                    >
                      Установить
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </section>
    {/if}
  </main>
</div>

<style>
  .store {
    display: flex;
    height: 100%;
    font-size: 13px;
    background: #f5f6fa;
  }

  /* Sidebar */
  .sidebar {
    width: 180px;
    flex-shrink: 0;
    border-right: 1px solid #dde0ea;
    background: #fff;
    display: flex;
    flex-direction: column;
    padding: 16px 10px;
    gap: 6px;
  }

  .store-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 4px 12px;
    font-size: 14px;
    font-weight: 700;
    color: #222;
    border-bottom: 1px solid #dde0ea;
    margin-bottom: 4px;
  }
  .store-logo span:first-child {
    font-size: 20px;
  }

  .nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .nav-item {
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid transparent;
    background: white;
    color: #555;
    font-size: 12px;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    transition:
      border-color 0.12s,
      color 0.12s,
      background 0.12s;
  }
  .nav-item:hover {
    border-color: #4a90d9;
    color: #4a90d9;
  }
  .nav-item.active {
    background: #4a90d9;
    border-color: #4a90d9;
    color: white;
    font-weight: 600;
  }

  .installed-count {
    margin-top: auto;
    font-size: 11px;
    color: #bbb;
    padding: 0 4px;
  }

  /* Main */
  .main {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px;
  }

  .section {
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 700;
    color: #333;
    margin: 0 0 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .count {
    font-size: 11px;
    background: #eef0f8;
    color: #888;
    padding: 1px 7px;
    border-radius: 10px;
    font-weight: 400;
  }

  /* Featured */
  .featured-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .featured-card {
    position: relative;
    width: 120px;
    padding: 14px 10px;
    background: white;
    border: 1px solid #dde0ea;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    transition:
      box-shadow 0.15s,
      border-color 0.15s;
    font-family: inherit;
  }
  .featured-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-color: #4a90d9;
  }

  .fc-icon {
    font-size: 32px;
  }
  .fc-name {
    font-size: 12px;
    font-weight: 600;
    color: #333;
  }
  .fc-cat {
    font-size: 10px;
    color: #aaa;
  }
  .fc-badge {
    position: absolute;
    top: 6px;
    right: 8px;
    background: #4a90d9;
    color: white;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    font-size: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* App list */
  .app-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .app-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: white;
    border: 1px solid #dde0ea;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    transition:
      box-shadow 0.1s,
      border-color 0.12s;
  }
  .app-row:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
    border-color: #4a90d9;
  }

  .app-icon {
    font-size: 28px;
    flex-shrink: 0;
  }

  .app-info {
    flex: 1;
    overflow: hidden;
  }
  .app-name {
    font-size: 13px;
    font-weight: 600;
    color: #222;
  }
  .app-ver {
    font-size: 10px;
    color: #bbb;
    font-weight: 400;
    margin-left: 4px;
  }
  .app-desc {
    font-size: 11px;
    color: #777;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 2px 0;
  }
  .app-meta {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .app-size {
    font-size: 10px;
    color: #bbb;
  }

  .app-action {
    flex-shrink: 0;
    min-width: 100px;
    display: flex;
    justify-content: flex-end;
  }

  /* Buttons */
  .btn-install {
    padding: 6px 14px;
    background: #4a90d9;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    font-family: inherit;
  }
  .btn-install:hover {
    background: #357abd;
  }
  .btn-install.small {
    padding: 4px 10px;
    font-size: 11px;
  }

  .btn-uninstall {
    padding: 6px 14px;
    background: #f0f0f0;
    color: #c03030;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
  }
  .btn-uninstall:hover {
    background: #ffe0e0;
    border-color: #c03030;
  }

  .installed-badge {
    font-size: 11px;
    color: #4a90d9;
    font-weight: 600;
  }

  /* Progress */
  .progress-wrap {
    width: 90px;
    height: 6px;
    background: #eef0f8;
    border-radius: 3px;
    overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    background: #4a90d9;
    border-radius: 3px;
    transition: width 0.2s;
  }
  .progress-label {
    font-size: 11px;
    color: #888;
    text-align: center;
    margin-top: 3px;
  }

  .mini-progress {
    width: 70px;
    height: 4px;
    background: #eef0f8;
    border-radius: 2px;
    overflow: hidden;
  }
  .mini-bar {
    height: 100%;
    background: #4a90d9;
    border-radius: 2px;
    transition: width 0.2s;
  }

  /* Stars */
  .stars {
    color: #f0a020;
    font-size: 12px;
  }
  .stars.small {
    font-size: 10px;
  }

  /* Detail */
  .detail {
    max-width: 560px;
  }

  .back-btn {
    background: none;
    border: none;
    color: #4a90d9;
    cursor: pointer;
    font-size: 13px;
    padding: 0;
    margin-bottom: 16px;
    font-family: inherit;
  }
  .back-btn:hover {
    text-decoration: underline;
  }

  .detail-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    background: white;
    border: 1px solid #dde0ea;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 12px;
  }

  .detail-icon {
    font-size: 52px;
    flex-shrink: 0;
  }

  .detail-info {
    flex: 1;
  }
  .detail-info h2 {
    margin: 0 0 4px;
    font-size: 20px;
    color: #222;
  }

  .detail-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;
  }
  .author {
    font-size: 12px;
    color: #888;
  }
  .cat-badge {
    font-size: 10px;
    background: #eef0f8;
    color: #4a90d9;
    padding: 2px 8px;
    border-radius: 10px;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .rating-num {
    font-weight: 700;
    color: #333;
  }
  .reviews {
    font-size: 11px;
    color: #bbb;
  }

  .detail-action {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .detail-body {
    background: white;
    border: 1px solid #dde0ea;
    border-radius: 12px;
    padding: 20px;
  }

  .detail-desc {
    color: #555;
    line-height: 1.6;
    margin-bottom: 16px;
    font-size: 13px;
  }

  .detail-specs {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .spec {
    display: flex;
    justify-content: space-between;
    padding: 6px 10px;
    background: #f5f6fa;
    border-radius: 6px;
    font-size: 12px;
  }
  .spec span:first-child {
    color: #888;
  }
  .spec span:last-child {
    font-weight: 600;
    color: #333;
  }

  .empty {
    color: #bbb;
    text-align: center;
    padding: 40px;
  }
</style>
