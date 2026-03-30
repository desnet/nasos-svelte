<script lang="ts">
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
    <button onclick={save} disabled={saved}>💾 Сохранить</button>
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

  .toolbar button {
    padding: 2px 10px;
    border: 1px solid #bbb;
    border-radius: 3px;
    background: white;
    cursor: pointer;
    font-size: 12px;
  }
  .toolbar button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .toolbar button:hover:not(:disabled) {
    background: #e0e8f8;
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
