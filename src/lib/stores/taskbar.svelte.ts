import { apps } from '$lib/stores/apps.svelte';

export type Pinned = {
  id: string;
  label?: string;
  icon?: string;
  app: string;
  args?: Record<string, unknown>;
};

const PINNED_APPS: Pinned[] = [
  {
    id: 'launcher-apps',
    app: 'launcher',
    label: 'Приложения',
    args: {
      appType: 'apps'
    }
  },
  {
    id: 'launcher-widgets',
    app: 'launcher',
    label: 'Виджеты',
    args: {
      appType: 'widgets'
    }
  },
  {
    id: 'trash',
    app: 'trash'
  }
];

function createTaskbar() {
  function pinnedList() {
    const allApps = apps.list();
    const pinnedApps = PINNED_APPS.map((pinned) => {
      const app = allApps.find((app) => pinned.app == app.id);
      if (app) {
        pinned.icon = app.icon;
        if (!pinned.label) {
          pinned.label = app.label;
        }
        return pinned;
      }
    });
    return pinnedApps.filter((pinned) => !!pinned);
  }
  function pin(id: string, app: string, args: Record<string, unknown>) {
    PINNED_APPS.push({
      id,
      app,
      args
    });
  }
  function unpin(id: string) {
    const appIndex = PINNED_APPS.findIndex((pinned) => pinned.id == id);
    if (appIndex >= 0) {
      PINNED_APPS.splice(appIndex, 1);
    }
  }
  return {
    pinnedList,
    pin,
    unpin
  };
}

export const taskbar = createTaskbar();
