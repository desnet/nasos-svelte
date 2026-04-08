function createClock() {
  // Смещение относительно системного времени в мс
  let offsetMs = $state(0)
  let timezone = $state(Intl.DateTimeFormat().resolvedOptions().timeZone)

  function now(): Date {
    return new Date(Date.now() + offsetMs)
  }

  function setDateTime(date: Date) {
    offsetMs = date.getTime() - Date.now()
  }

  function setTimezone(tz: string) {
    timezone = tz
  }

  function reset() {
    offsetMs = 0
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  return {
    get timezone() { return timezone },
    now,
    setDateTime,
    setTimezone,
    reset
  }
}

export const clockStore = createClock()
