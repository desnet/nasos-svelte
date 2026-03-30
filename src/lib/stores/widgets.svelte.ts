import type { Component } from 'svelte';

export type WidgetType = 'clock' | 'calendar' | 'notes' | 'sysmon';

const WIDGET_META: Record<WidgetType, { label: string; icon: string }> = {
  clock: { label: 'Часы', icon: '🕐' },
  calendar: { label: 'Календарь', icon: '📅' },
  notes: { label: 'Заметка', icon: '🗒️' },
  sysmon: { label: 'Монитор системы', icon: '📊' }
};

// Автообнаружение компонентов: убираем суффикс "Widget" и приводим к нижнему регистру
// ClockWidget.svelte → clock, NotesWidget.svelte → notes
const _modules = import.meta.glob<{ default: Component }>('/src/lib/widgets/*.svelte', {
  eager: true
});

const _components: Record<string, Component> = Object.fromEntries(
  Object.entries(_modules).map(([path, mod]) => {
    const raw = path.match(/\/(\w+)\.svelte$/)?.[1] ?? '';
    return [raw.replace(/Widget$/, '').toLowerCase(), mod.default];
  })
);

function createWidgets() {
  function list(): { type: WidgetType; label: string; icon: string }[] {
    return (Object.keys(WIDGET_META) as WidgetType[]).map((type) => ({
      type,
      ...WIDGET_META[type]
    }));
  }

  function getComponent(type: string): Component | undefined {
    return _components[type];
  }

  return { list, getComponent };
}

export const widgets = createWidgets();
