import type { Component } from 'svelte';

const APPS_META: { id: string; label: string; icon: string }[] = [
  { id: 'explorer', label: 'Проводник', icon: '📁' },
  { id: 'notepad', label: 'Блокнот', icon: '📝' },
  { id: 'trash', label: 'Корзина', icon: '🗑️' },
  { id: 'about', label: 'Обо мне', icon: '💻' },
  { id: 'appstore', label: 'Магазин приложений', icon: '🏪' },
  { id: 'wallpapers', label: 'Обои рабочего стола', icon: '🖼️' },
  { id: 'launcher', label: 'Лаунчер', icon: '' }
];

// Автообнаружение компонентов: убираем суффикс "App" и приводим к нижнему регистру
// Explorer.svelte → explorer, IframeApp.svelte → iframe, AppStore.svelte → appstore
const _modules = import.meta.glob<{ default: Component }>('/src/lib/apps/*.svelte', {
  eager: true
});

const _components: Record<string, Component> = Object.fromEntries(
  Object.entries(_modules).map(([path, mod]) => {
    const raw = path.match(/\/(\w+)\.svelte$/)?.[1] ?? '';
    return [raw.replace(/App$/, '').toLowerCase(), mod.default];
  })
);

function createApps() {
  function list(): { id: string; label: string; icon: string }[] {
    return APPS_META;
  }

  function getComponent(id: string): Component | undefined {
    return _components[id];
  }

  return { list, getComponent };
}

export const apps = createApps();
