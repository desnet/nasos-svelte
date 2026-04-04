<script lang="ts">
  import UiButton from '$lib/components/UiButton.svelte';

  let text = $state('Введите текст...\n\nДобро пожаловать в Блокнот!');
  let saved = $state(true);

  function onChange() {
    saved = false;
  }

  function save() {
    saved = true;
  }
</script>

<div class="notepad">
  <div class="toolbar">
    <UiButton variant="secondary" size="sm" disabled={saved} onclick={save}>💾 Сохранить</UiButton>
    <span class="status">{saved ? '✓ Сохранено' : '● Не сохранено'}</span>
  </div>
  <textarea
    bind:value={text}
    oninput={onChange}
    spellcheck="false"
    placeholder="Начните вводить текст..."
  ></textarea>
</div>

<style>
  .notepad {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 8px;
    background: #f0f0f0;
    border-bottom: 1px solid #ddd;
  }

.status {
    font-size: 11px;
    color: #666;
  }

  textarea {
    flex: 1;
    resize: none;
    border: none;
    outline: none;
    padding: 12px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
    background: white;
  }
</style>
