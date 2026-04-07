<script lang="ts">
  import { goto } from '$app/navigation'
  import { auth } from '$lib/stores/auth.svelte'

  let username = $state(auth.username)
  let password = $state('')
  let error = $state('')
  let loading = $state(false)

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    loading = true
    error = ''
    const ok = auth.login(password)
    if (ok) {
      await goto('/')
    } else {
      error = 'Неверный пароль'
      loading = false
    }
  }
</script>

<div class="login-screen">
  <div class="login-card">
    <div class="login-avatar">{auth.avatar}</div>
    <h1 class="login-title">NasOS</h1>
    <p class="login-subtitle">Добро пожаловать</p>

    <form onsubmit={handleSubmit}>
      <div class="field">
        <label for="username">Пользователь</label>
        <input
          id="username"
          type="text"
          bind:value={username}
          autocomplete="username"
          spellcheck="false"
        />
      </div>
      <div class="field">
        <label for="password">Пароль</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          autocomplete="current-password"
          placeholder="Введите пароль"
        />
      </div>

      {#if error}
        <p class="error">{error}</p>
      {/if}

      <button type="submit" class="btn-login" disabled={loading}>
        {loading ? 'Вход...' : 'Войти'}
      </button>
    </form>

    <p class="demo-hint">Демо-режим · любой пароль</p>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', sans-serif;
  }

  .login-screen {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a3a5c 0%, #0d2137 40%, #1a2d4a 70%, #0a1a2e 100%);
  }

  .login-card {
    width: 340px;
    padding: 40px 36px 32px;
    background: rgba(30, 30, 46, 0.82);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
    color: white;
    text-align: center;
  }

  .login-avatar {
    font-size: 56px;
    margin-bottom: 12px;
    line-height: 1;
  }

  .login-title {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 4px;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: 0.3px;
  }

  .login-subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    margin: 0 0 28px;
  }

  .field {
    text-align: left;
    margin-bottom: 14px;
  }

  .field label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .field input {
    width: 100%;
    height: 36px;
    padding: 0 12px;
    box-sizing: border-box;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.07);
    color: white;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s, background 0.15s;
  }

  .field input::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }

  .field input:focus {
    border-color: rgba(74, 144, 217, 0.7);
    background: rgba(255, 255, 255, 0.1);
  }

  .error {
    font-size: 12px;
    color: #ff6b6b;
    margin: -4px 0 10px;
    text-align: left;
  }

  .btn-login {
    width: 100%;
    height: 40px;
    margin-top: 6px;
    border-radius: 8px;
    border: none;
    background: #4a90d9;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.12s, opacity 0.12s;
    letter-spacing: 0.2px;
  }

  .btn-login:hover:not(:disabled) {
    background: #357abd;
  }

  .btn-login:active:not(:disabled) {
    background: #2a6aa8;
  }

  .btn-login:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .demo-hint {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.2);
    margin: 20px 0 0;
  }
</style>
