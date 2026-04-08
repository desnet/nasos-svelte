<script lang="ts">
  import { getContext } from 'svelte'
  import type { WindowContext } from '$lib/components/Window.svelte'
  import { clockStore } from '$lib/stores/clock.svelte'
  import UiButton from '$lib/components/UiButton.svelte'
  import UiSelect from '$lib/components/UiSelect.svelte'
  import type { UiSelectOption } from '$lib/components/UiSelect.js'

  const win = getContext<WindowContext>('window')
  win.setSize(460, 480)
  win.setResizable(false)

  // Список часовых поясов
  const TIMEZONES: UiSelectOption[] = [
    { label: 'Калининград (UTC+2)', value: 'Europe/Kaliningrad' },
    { label: 'Москва (UTC+3)', value: 'Europe/Moscow' },
    { label: 'Самара (UTC+4)', value: 'Europe/Samara' },
    { label: 'Екатеринбург (UTC+5)', value: 'Asia/Yekaterinburg' },
    { label: 'Омск (UTC+6)', value: 'Asia/Omsk' },
    { label: 'Красноярск (UTC+7)', value: 'Asia/Krasnoyarsk' },
    { label: 'Иркутск (UTC+8)', value: 'Asia/Irkutsk' },
    { label: 'Якутск (UTC+9)', value: 'Asia/Yakutsk' },
    { label: 'Владивосток (UTC+10)', value: 'Asia/Vladivostok' },
    { label: 'Магадан (UTC+11)', value: 'Asia/Magadan' },
    { label: 'Камчатка (UTC+12)', value: 'Asia/Kamchatka' },
    { label: 'Лондон (UTC+0)', value: 'Europe/London' },
    { label: 'Берлин (UTC+1)', value: 'Europe/Berlin' },
    { label: 'Стамбул (UTC+3)', value: 'Europe/Istanbul' },
    { label: 'Дубай (UTC+4)', value: 'Asia/Dubai' },
    { label: 'Нью-Йорк (UTC-5)', value: 'America/New_York' },
    { label: 'Чикаго (UTC-6)', value: 'America/Chicago' },
    { label: 'Денвер (UTC-7)', value: 'America/Denver' },
    { label: 'Лос-Анджелес (UTC-8)', value: 'America/Los_Angeles' },
    { label: 'Токио (UTC+9)', value: 'Asia/Tokyo' },
    { label: 'Шанхай (UTC+8)', value: 'Asia/Shanghai' },
    { label: 'Сингапур (UTC+8)', value: 'Asia/Singapore' },
    { label: 'Сидней (UTC+10)', value: 'Australia/Sydney' },
  ]

  // Текущее время из store (живое)
  let tick = $state(0)
  const interval = setInterval(() => tick++, 1000)
  $effect(() => () => clearInterval(interval))

  const liveNow = $derived(() => { void tick; return clockStore.now() })

  // Форматирование для отображения
  const displayTime = $derived(
    liveNow().toLocaleTimeString('ru-RU', {
      timeZone: clockStore.timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  )
  const displayDate = $derived(
    liveNow().toLocaleDateString('ru-RU', {
      timeZone: clockStore.timezone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  )

  let editDate = $state(formatDateInput(new Date()))
  let editTime = $state(formatTimeInput(new Date()))
  let editTz   = $state(clockStore.timezone)
  let saved    = $state(false)

  // При смене timezone обновляем поля
  $effect(() => {
    const now = new Date(clockStore.now().toLocaleString('en-US', { timeZone: clockStore.timezone }))
    editDate = formatDateInput(now)
    editTime = formatTimeInput(now)
    editTz   = clockStore.timezone
  })

  function formatDateInput(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  function formatTimeInput(d: Date) {
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${h}:${min}`
  }

  function apply() {
    // Собираем дату/время в контексте выбранного часового пояса
    const localStr = `${editDate}T${editTime}:00`
    // Получаем UTC-момент, который соответствует этому local-времени в выбранном TZ
    const utcMs = getUTCfromLocalStr(localStr, editTz)
    if (!isNaN(utcMs)) {
      clockStore.setDateTime(new Date(utcMs))
    }
    clockStore.setTimezone(editTz)
    saved = true
    setTimeout(() => (saved = false), 2000)
  }

  function reset() {
    clockStore.reset()
    editTz = clockStore.timezone
  }

  // Конвертация "локального времени в TZ" → UTC ms
  function getUTCfromLocalStr(localStr: string, tz: string): number {
    // Форматируем дату через Intl чтобы найти смещение
    const probe = new Date(localStr)
    if (isNaN(probe.getTime())) return NaN
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    })
    const parts = Object.fromEntries(
      formatter.formatToParts(probe).filter(p => p.type !== 'literal').map(p => [p.type, p.value])
    )
    const tzLocal = new Date(
      `${parts.year}-${parts.month}-${parts.day}T${parts.hour === '24' ? '00' : parts.hour}:${parts.minute}:${parts.second}`
    )
    const diff = probe.getTime() - tzLocal.getTime()
    return new Date(localStr).getTime() + diff
  }
</script>

<div class="app">
  <!-- Живые часы -->
  <div class="clock-display">
    <div class="clock-time">{displayTime}</div>
    <div class="clock-date">{displayDate}</div>
    <div class="clock-tz">{clockStore.timezone}</div>
  </div>

  <div class="settings">
    <!-- Дата и время -->
    <section class="section">
      <h3 class="section-title">Дата и время</h3>
      <div class="row">
        <label for="edit-date">Дата</label>
        <input id="edit-date" type="date" bind:value={editDate} />
      </div>
      <div class="row">
        <label for="edit-time">Время</label>
        <input id="edit-time" type="time" bind:value={editTime} />
      </div>
    </section>

    <!-- Часовой пояс -->
    <section class="section">
      <h3 class="section-title">Часовой пояс</h3>
      <div class="row">
        <label for="edit-tz">Пояс</label>
        <UiSelect bind:value={editTz} options={TIMEZONES} />
      </div>
    </section>

    <!-- Кнопки -->
    <div class="actions">
      <UiButton variant="secondary" onclick={reset}>Сбросить</UiButton>
      <UiButton onclick={apply}>{saved ? '✓ Применено' : 'Применить'}</UiButton>
    </div>
  </div>
</div>

<style>
  .app {
    height: 100%;
    display: flex;
    flex-direction: column;
    font-size: 13px;
    background: #f5f6fa;
    overflow: hidden;
  }

  /* ─── Живые часы ─── */
  .clock-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 24px 20px 20px;
    background: linear-gradient(160deg, #1a2d4a 0%, #0d1e35 100%);
    color: white;
    flex-shrink: 0;
  }

  .clock-time {
    font-size: 48px;
    font-weight: 200;
    letter-spacing: 2px;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  .clock-date {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.65);
    text-transform: capitalize;
  }

  .clock-tz {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.35);
    margin-top: 2px;
  }

  /* ─── Настройки ─── */
  .settings {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .section {
    background: white;
    border: 1px solid #dde0ea;
    border-radius: 10px;
    overflow: hidden;
  }

  .section-title {
    font-size: 11px;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 8px 14px 6px;
    margin: 0;
    border-bottom: 1px solid #eef0f8;
    background: #f8f9fc;
  }

  .row {
    display: flex;
    align-items: center;
    padding: 9px 14px;
    border-bottom: 1px solid #f0f1f7;
    gap: 12px;
  }

  .row:last-child {
    border-bottom: none;
  }

  .row label {
    width: 60px;
    font-size: 13px;
    color: #555;
    flex-shrink: 0;
  }

  .row input {
    flex: 1;
    height: 30px;
    padding: 0 10px;
    border: 1px solid #c8ccd8;
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    color: #222;
    background: white;
    outline: none;
    transition: border-color 0.15s;
  }

  .row input:focus {
    border-color: #4a90d9;
  }

  /* ─── Кнопки ─── */
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-bottom: 4px;
  }

</style>
