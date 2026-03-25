export type AppCategory = 'Все' | 'Продуктивность' | 'Утилиты' | 'Игры' | 'Медиа' | 'Разработка'

export type StoreApp = {
	id: string
	name: string
	icon: string
	description: string
	version: string
	size: string
	author: string
	category: AppCategory
	rating: number
	reviews: number
	installed: boolean
	featured?: boolean
}

function createAppStore() {
	let apps = $state<StoreApp[]>([
		{
			id: 'calculator',
			name: 'Калькулятор',
			icon: '🧮',
			description: 'Простой и удобный калькулятор для базовых вычислений.',
			version: '2.1.0',
			size: '1.2 МБ',
			author: 'NasOS Team',
			category: 'Утилиты',
			rating: 4.5,
			reviews: 1240,
			installed: false,
			featured: true
		},
		{
			id: 'browser',
			name: 'NasBrowser',
			icon: '🌐',
			description: 'Быстрый и безопасный веб-браузер с поддержкой вкладок.',
			version: '5.0.1',
			size: '48 МБ',
			author: 'NasOS Team',
			category: 'Утилиты',
			rating: 4.7,
			reviews: 8920,
			installed: false,
			featured: true
		},
		{
			id: 'music',
			name: 'NasMusic',
			icon: '🎵',
			description: 'Музыкальный плеер с поддержкой плейлистов и эквалайзером.',
			version: '3.4.2',
			size: '22 МБ',
			author: 'NasOS Team',
			category: 'Медиа',
			rating: 4.3,
			reviews: 3410,
			installed: false
		},
		{
			id: 'photos',
			name: 'Галерея',
			icon: '🖼️',
			description: 'Просмотр и организация фотографий и изображений.',
			version: '1.8.0',
			size: '15 МБ',
			author: 'NasOS Team',
			category: 'Медиа',
			rating: 4.2,
			reviews: 2100,
			installed: false
		},
		{
			id: 'snake',
			name: 'Змейка',
			icon: '🐍',
			description: 'Классическая игра Змейка. Собирай еду и не врезайся в стены!',
			version: '1.0.0',
			size: '800 КБ',
			author: 'IndieStudio',
			category: 'Игры',
			rating: 4.6,
			reviews: 5670,
			installed: false,
			featured: true
		},
		{
			id: 'tetris',
			name: 'Тетрис',
			icon: '🟦',
			description: 'Легендарная головоломка. Укладывай фигуры и зарабатывай очки.',
			version: '2.0.0',
			size: '1.1 МБ',
			author: 'RetroGames',
			category: 'Игры',
			rating: 4.8,
			reviews: 12300,
			installed: false
		},
		{
			id: 'codepad',
			name: 'CodePad',
			icon: '💻',
			description: 'Редактор кода с подсветкой синтаксиса для разработчиков.',
			version: '4.2.1',
			size: '35 МБ',
			author: 'DevTools Inc.',
			category: 'Разработка',
			rating: 4.9,
			reviews: 7800,
			installed: false
		},
		{
			id: 'terminal',
			name: 'Терминал',
			icon: '⬛',
			description: 'Системный терминал с поддержкой bash-команд.',
			version: '1.5.0',
			size: '3 МБ',
			author: 'NasOS Team',
			category: 'Разработка',
			rating: 4.7,
			reviews: 4500,
			installed: false
		},
		{
			id: 'tasks',
			name: 'Задачи',
			icon: '✅',
			description: 'Менеджер задач с напоминаниями и приоритетами.',
			version: '2.3.0',
			size: '5 МБ',
			author: 'Productivity Lab',
			category: 'Продуктивность',
			rating: 4.4,
			reviews: 3200,
			installed: false
		},
		{
			id: 'weather',
			name: 'Погода',
			icon: '⛅',
			description: 'Прогноз погоды на 7 дней с красивыми анимациями.',
			version: '3.1.0',
			size: '8 МБ',
			author: 'WeatherApp',
			category: 'Утилиты',
			rating: 4.1,
			reviews: 6700,
			installed: false
		},
		{
			id: 'paint',
			name: 'NasPaint',
			icon: '🎨',
			description: 'Простой графический редактор для рисования и редактирования изображений.',
			version: '1.2.0',
			size: '12 МБ',
			author: 'CreativeTools',
			category: 'Медиа',
			rating: 3.9,
			reviews: 1800,
			installed: false
		},
		{
			id: 'pdf',
			name: 'PDF Viewer',
			icon: '📕',
			description: 'Быстрый просмотрщик PDF-файлов с поиском по тексту.',
			version: '2.0.5',
			size: '18 МБ',
			author: 'DocSoft',
			category: 'Продуктивность',
			rating: 4.3,
			reviews: 2900,
			installed: false
		}
	])

	// Прогресс установки: appId → 0–100 | null
	let installing = $state<Record<string, number>>({})

	function install(id: string) {
		if (installing[id] !== undefined) return
		installing[id] = 0
		const interval = setInterval(() => {
			installing[id] = Math.min(100, installing[id] + Math.random() * 18 + 4)
			if (installing[id] >= 100) {
				clearInterval(interval)
				apps = apps.map((a) => (a.id === id ? { ...a, installed: true } : a))
				const copy = { ...installing }
				delete copy[id]
				installing = copy
			}
		}, 200)
	}

	function uninstall(id: string) {
		apps = apps.map((a) => (a.id === id ? { ...a, installed: false } : a))
	}

	function getProgress(id: string): number | null {
		return installing[id] ?? null
	}

	return {
		get apps() { return apps },
		get installing() { return installing },
		install,
		uninstall,
		getProgress
	}
}

export const appStore = createAppStore()
