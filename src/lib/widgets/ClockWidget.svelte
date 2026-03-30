<script lang="ts">
  let now = $state(new Date());
  setInterval(() => (now = new Date()), 1000);

  const time = $derived(
    now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const date = $derived(
    now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
  );

  // Углы стрелок
  const secDeg = $derived(now.getSeconds() * 6);
  const minDeg = $derived(now.getMinutes() * 6 + now.getSeconds() * 0.1);
  const hourDeg = $derived((now.getHours() % 12) * 30 + now.getMinutes() * 0.5);
</script>

<div class="clock-widget">
  <!-- Аналоговые часы -->
  <div class="analog">
    <svg viewBox="0 0 100 100" class="face">
      <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
      {#each Array(12) as _, i}
        <line
          x1={50 + 40 * Math.sin((i * 30 * Math.PI) / 180)}
          y1={50 - 40 * Math.cos((i * 30 * Math.PI) / 180)}
          x2={50 + 45 * Math.sin((i * 30 * Math.PI) / 180)}
          y2={50 - 45 * Math.cos((i * 30 * Math.PI) / 180)}
          stroke="rgba(255,255,255,0.5)"
          stroke-width="2"
          stroke-linecap="round"
        />
      {/each}
      <!-- Часовая -->
      <line
        x1="50"
        y1="50"
        x2={50 + 28 * Math.sin((hourDeg * Math.PI) / 180)}
        y2={50 - 28 * Math.cos((hourDeg * Math.PI) / 180)}
        stroke="white"
        stroke-width="3"
        stroke-linecap="round"
      />
      <!-- Минутная -->
      <line
        x1="50"
        y1="50"
        x2={50 + 37 * Math.sin((minDeg * Math.PI) / 180)}
        y2={50 - 37 * Math.cos((minDeg * Math.PI) / 180)}
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
      />
      <!-- Секундная -->
      <line
        x1="50"
        y1="50"
        x2={50 + 40 * Math.sin((secDeg * Math.PI) / 180)}
        y2={50 - 40 * Math.cos((secDeg * Math.PI) / 180)}
        stroke="#4a90d9"
        stroke-width="1"
        stroke-linecap="round"
      />
      <circle cx="50" cy="50" r="3" fill="#4a90d9" />
    </svg>
  </div>
  <div class="digital">{time}</div>
  <div class="date-str">{date}</div>
</div>

<style>
  .clock-widget {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: 160px;
  }

  .analog {
    width: 100px;
    height: 100px;
  }
  .face {
    width: 100%;
    height: 100%;
  }

  .digital {
    font-size: 22px;
    font-weight: 300;
    letter-spacing: 2px;
    color: white;
  }

  .date-str {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.55);
    text-align: center;
  }
</style>
