<script lang="ts">
  let now = $state(new Date());
  setInterval(() => {
    now = new Date();
  }, 1000);

  const timeStr = $derived(now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
  const dateStr = $derived(
    now.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })
  );
</script>

<div class="menubar">
  <span class="menubar-logo">NasOS</span>
  <div class="menubar-tray">
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
