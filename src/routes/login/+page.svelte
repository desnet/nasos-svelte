<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { auth } from '$lib/stores/auth.svelte';

  type Step = 'user' | 'password';

  let step = $state<Step>('user');
  let usernameInput = $state('');
  let password = $state('');
  let error = $state(false);
  let loading = $state(false);
  let passwordInput = $state<HTMLInputElement | null>(null);
  let nameInput = $state<HTMLInputElement | null>(null);

  function handleSelectUser(e: SubmitEvent) {
    e.preventDefault();
    auth.setUsername(usernameInput || 'Пользователь');
    step = 'password';
    setTimeout(() => passwordInput?.focus(), 50);
  }

  async function handlePassword(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    error = false;
    if (auth.login(password)) {
      await goto(resolve('/'));
    } else {
      error = true;
      loading = false;
      password = '';
      passwordInput?.focus();
    }
  }

  function backToUser() {
    step = 'user';
    password = '';
    error = false;
    setTimeout(() => nameInput?.focus(), 50);
  }

  $effect(() => {
    // Подавляем диалог подтверждения при перезагрузке страницы.
    // Браузер показывает его из-за <input type="password"> с введёнными данными.
    // Очищаем поля до выгрузки, чтобы браузер не считал форму "грязной".
    const handler = () => {
      if (passwordInput) passwordInput.value = '';
      if (nameInput) nameInput.value = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  });
</script>

<div class="screen">
  <div class="bg"></div>

  <div class="center">
    <div class="avatar">{auth.avatar}</div>

    {#if step === 'user'}
      <form onsubmit={handleSelectUser} class="form" autocomplete="off">
        <div class="name-wrap">
          <input
            bind:this={nameInput}
            class="name-input"
            type="text"
            bind:value={usernameInput}
            placeholder="Пользователь"
            autocomplete="username"
            spellcheck="false"
            autofocus
          />
          <button type="submit" class="next-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7h10M8 3l4 4-4 4"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
        <p class="hint">Введите имя пользователя</p>
      </form>
    {:else}
      <div class="username">{auth.username}</div>

      <form onsubmit={handlePassword} class="form" autocomplete="off">
        <div class="password-wrap" class:shake={error}>
          <input
            bind:this={passwordInput}
            type="password"
            bind:value={password}
            placeholder="Пароль"
            autocomplete="current-password"
            onanimationend={() => (error = false)}
          />
          <button type="submit" class="arrow-btn" disabled={loading} tabindex="-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
        <p class="hint">Демо · любой пароль</p>
        <button type="button" class="back-btn" onclick={backToUser}>
          ← Сменить пользователя
        </button>
      </form>
    {/if}
  </div>

  <div class="bottom-bar">
    <span class="bottom-btn">↺ Перезагрузить</span>
    <span class="bottom-btn">⏾ Сон</span>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
  }

  .screen {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 30% 20%, rgba(60, 120, 200, 0.35) 0%, transparent 60%),
      radial-gradient(ellipse at 70% 80%, rgba(80, 40, 160, 0.3) 0%, transparent 55%),
      linear-gradient(160deg, #0d1b2e 0%, #0a1628 40%, #12102a 70%, #0a0a1e 100%);
    z-index: 0;
  }

  .center {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .avatar {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    border: 3px solid rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 54px;
    line-height: 1;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    margin-bottom: 18px;
  }

  .form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* ─── Поле имени ─── */
  .name-wrap {
    position: relative;
    width: 220px;
  }

  .name-input {
    width: 100%;
    height: 34px;
    padding: 0 38px 0 14px;
    box-sizing: border-box;
    border-radius: 17px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.12);
    color: white;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transition:
      border-color 0.15s,
      background 0.15s,
      box-shadow 0.15s;
    text-align: center;
    letter-spacing: 0.3px;
  }

  .name-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
    font-weight: 300;
  }

  .name-input:focus {
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.16);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08);
  }

  .next-btn {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.12s;
    padding: 0;
  }

  .next-btn:hover {
    background: rgba(255, 255, 255, 0.35);
  }

  /* ─── Имя пользователя (шаг 2) ─── */
  .username {
    font-size: 26px;
    font-weight: 300;
    color: rgba(255, 255, 255, 0.92);
    letter-spacing: 0.5px;
    margin-bottom: 20px;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
  }

  /* ─── Поле пароля ─── */
  .password-wrap {
    position: relative;
    width: 220px;
  }

  .password-wrap input {
    width: 100%;
    height: 34px;
    padding: 0 38px 0 14px;
    box-sizing: border-box;
    border-radius: 17px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.12);
    color: white;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transition:
      border-color 0.15s,
      background 0.15s,
      box-shadow 0.15s;
    text-align: center;
    letter-spacing: 0.3px;
  }

  .password-wrap input::placeholder {
    color: rgba(255, 255, 255, 0.4);
    font-weight: 300;
  }

  .password-wrap input:focus {
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.16);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08);
  }

  .arrow-btn {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.12s;
    padding: 0;
  }

  .arrow-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.35);
  }
  .arrow-btn:disabled {
    opacity: 0.4;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    15% {
      transform: translateX(-8px);
    }
    30% {
      transform: translateX(8px);
    }
    45% {
      transform: translateX(-6px);
    }
    60% {
      transform: translateX(6px);
    }
    75% {
      transform: translateX(-3px);
    }
    90% {
      transform: translateX(3px);
    }
  }

  .password-wrap.shake {
    animation: shake 0.45s ease;
  }
  .password-wrap.shake input {
    border-color: rgba(255, 80, 80, 0.7);
    background: rgba(255, 60, 60, 0.1);
  }

  /* ─── Подсказки ─── */
  .hint {
    margin: 10px 0 6px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.25);
    font-weight: 300;
  }

  .back-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.35);
    font-size: 11px;
    font-family: inherit;
    cursor: pointer;
    padding: 4px 0;
    transition: color 0.12s;
  }

  .back-btn:hover {
    color: rgba(255, 255, 255, 0.65);
  }

  /* ─── Нижняя панель ─── */
  .bottom-bar {
    position: absolute;
    bottom: 28px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 32px;
    z-index: 1;
  }

  .bottom-btn {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    cursor: pointer;
    user-select: none;
    transition: color 0.12s;
  }

  .bottom-btn:hover {
    color: rgba(255, 255, 255, 0.75);
  }
</style>
