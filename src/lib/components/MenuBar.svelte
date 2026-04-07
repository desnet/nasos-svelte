<script lang="ts">
  import { auth } from '$lib/stores/auth.svelte'
  import { goto } from '$app/navigation'

  let now = $state(new Date());
  setInterval(() => {
    now = new Date();
  }, 1000);

  const timeStr = $derived(now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
  const dateStr = $derived(
    now.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })
  );

  function handleLogout() {
    auth.logout()
    goto('/login')
  }
</script>

<div class="menubar">
  <span class="menubar-logo">NasOS</span>
  <div class="menubar-tray">
    <button class="tray-user" onclick={handleLogout} title="Выйти из системы">
      <span class="user-avatar">{auth.avatar}</span>
      <span class="user-name">{auth.username}</span>
    </button>
    <span class="tray-sep"></span>
    <span class="tray-icon" title="Сеть">🌐</span>
    <span class="tray-icon" title="Звук">🔊</span>
    <div class="menubar-clock">
      <span class="clock-time">{timeStr}</span>
      <span class="clock-date">{dateStr}</span>
    </div>
  </div>
</div>

<style>
  .menubar {
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background: rgba(30, 30, 46, 0.82);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    user-select: none;
    flex-shrink: 0;
  }

  .menubar-logo {
    font-size: 13px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.4px;
  }

  .menubar-tray {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .tray-user {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.75);
    font-family: inherit;
    padding: 2px 7px;
    border-radius: 5px;
    height: 22px;
    transition: background 0.12s, color 0.12s;
  }

  .tray-user:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.95);
  }

  .user-avatar {
    font-size: 13px;
    line-height: 1;
  }

  .user-name {
    font-size: 11px;
    font-weight: 500;
  }

  .tray-sep {
    width: 1px;
    height: 14px;
    background: rgba(255, 255, 255, 0.12);
  }

  .tray-icon {
    font-size: 14px;
    cursor: default;
  }

  .menubar-clock {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: default;
  }

  .clock-time {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    font-variant-numeric: tabular-nums;
  }

  .clock-date {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
  }
</style>
