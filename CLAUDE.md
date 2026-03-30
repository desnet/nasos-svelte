# CLAUDE.md

Этот файл содержит инструкции для Claude Code (claude.ai/code) при работе с кодом в данном репозитории.

## Команды

```bash
npm run dev          # Запустить сервер разработки
npm run build        # Сборка для продакшена
npm run preview      # Предпросмотр продакшен-сборки
npm run check        # Проверка типов через svelte-check
npm run check:watch  # Проверка типов в режиме наблюдения
npm run lint         # Запуск проверок Prettier + ESLint
npm run format       # Форматирование кода через Prettier
```

## Архитектура

Проект на **SvelteKit 2** с использованием **Svelte 5 и Runes** (реактивные примитивы). Режим Runes включён глобально через `svelte.config.js`.

**Роутинг:** Файловый, через `src/routes/`. Файлы с префиксом `+` — соглашения SvelteKit (`+page.svelte`, `+layout.svelte`, `+page.server.ts` и т.д.).

**Общий код:** `src/lib/` — импортируется через псевдоним `$lib/` в любом месте приложения.

## Стиль кода

- **Пробелы** для отступов
- **Одинарные кавычки**, без завершающих запятых
- Ширина строки: 100 символов
- TypeScript в строгом режиме
- Использовать Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) — не устаревший синтаксис Svelte 4 (`$:`, `export let`)

## Проект: Симуляция десктопной ОС

`src/routes/+page.svelte` — рабочий стол. Отрисовывает окна, виджеты, таскбар и иконки рабочего стола.

### Динамические карты компонентов (`+page.svelte`)

`<svelte:component>` устарел в режиме Svelte 5 runes. Использовать карты + `{@const Comp = MAP[key]}` + `<Comp />`.

### Заметки по доступности (A11y)
- `<button>` не может быть потомком `<button>`: использовать `<div role="button" tabindex="0" onkeydown={...}>` для внешних контейнеров.
