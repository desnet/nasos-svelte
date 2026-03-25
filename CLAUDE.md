# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run check        # Type-check with svelte-check
npm run check:watch  # Type-check in watch mode
npm run lint         # Run Prettier + ESLint checks
npm run format       # Format code with Prettier
```

## Architecture

This is a **SvelteKit 2** project using **Svelte 5 with Runes** (reactive primitives). Runes mode is enabled globally via `svelte.config.js`.

**Routing:** File-based via `src/routes/`. Files prefixed with `+` are SvelteKit conventions (`+page.svelte`, `+layout.svelte`, `+page.server.ts`, etc.).

**Shared code:** `src/lib/` — importable as `$lib/` alias throughout the app.

## Code Style

- **Tabs** for indentation (not spaces)
- **Single quotes**, no trailing commas
- Line width: 100 characters
- TypeScript strict mode enabled
- Use Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) — not legacy Svelte 4 reactive syntax (`$:`, `export let`)

## Project: Desktop OS Simulation

`src/routes/+page.svelte` is the desktop. It renders windows, widgets, taskbar, and desktop icons.

### Key Stores (`src/lib/stores/`)

- **`desktop.svelte.ts`** — windows + desktop icons state. `DesktopIcon` has `type: 'app' | 'url'`, optional `url`. Methods: `openApp`, `openUrl`, `addIcon`, `updateIcon`, `removeIcon`, `closeWindow`, `minimizeWindow`, `toggleMaximize`, `focusWindow`, `moveWindow`, `getZIndex`. `AVAILABLE_APPS` maps app keys to `{ title, icon }`.
- **`widgets.svelte.ts`** — desktop widgets (clock, calendar, notes, sysmon). BFS spiral collision detection for placement. `widgets.add(type, x, y)`, `widgets.move(id, x, y)`, `widgets.remove(id)`.
- **`shortcutDialogState.svelte.ts`** — singleton holding `target: DesktopIcon | null` for the shortcut add/edit dialog.

### Dynamic Component Maps (`+page.svelte`)

`<svelte:component>` is deprecated in Svelte 5 runes mode. Use maps + `{@const Comp = MAP[key]}` + `<Comp />`:

```ts
const APP_COMPONENTS: Record<string, Component> = {
  explorer: Explorer, notepad: Notepad, ...,
  'shortcut-dialog': ShortcutDialog, iframe: IframeApp
}
const WIDGET_COMPONENTS: Record<string, Component> = {
  clock: ClockWidget, calendar: CalendarWidget, ...
}
```

### Icon Positioning (`+page.svelte`)

- `iconPositions: $state<Record<number, IconPos>>` — stores only explicitly dragged positions.
- `effectivePositions: $derived.by(...)` — synchronously computes positions for ALL icons. Uses `SvelteSet` for occupied slot tracking. New icons get auto-placed in first free grid slot. **Must use `$derived.by`, not `$effect`** — `$effect` runs after render (causes undefined crash on new icons).
- `onIconMousedown` reads from `effectivePositions[id]`, not `iconPositions[id]`.

### Window ↔ App Context

`Window.svelte` calls `setContext('windowId', untrack(() => id))`. Apps inside windows call `getContext<number>('windowId')` to get their window ID (used by `ShortcutDialog`, `IframeApp`).

### ShortcutDialog

Rendered inside a `Window` component (registered as `'shortcut-dialog'` in APP_COMPONENTS). Reads `shortcutDialogState.target` for initial values. Uses `getContext('windowId')` to call `desktop.closeWindow()` on save/cancel.

### Widget Drag Pattern

Local `$state` for visual position during drag (`dragX`, `dragY`). Store method (`widgets.move`) called only once on `mouseup`. Template: `left: {dragging ? dragX : x}px`.

### A11y Notes

- Overlay `<div>` elements (in ContextMenu, IconContextMenu) require `<!-- svelte-ignore a11y_click_events_have_key_events -->`.
- `<button>` cannot be descendant of `<button>`: use `<div role="button" tabindex="0" onkeydown={...}>` for outer containers.
- `setContext('windowId', untrack(() => id))` — `untrack` suppresses `state_referenced_locally` warning.
