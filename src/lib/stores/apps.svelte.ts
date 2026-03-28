const APPS_META: { id: string; label: string; icon: string }[] = [
	{ id: 'explorer',   label: 'Проводник',           icon: '📁' },
	{ id: 'notepad',    label: 'Блокнот',             icon: '📝' },
	{ id: 'trash',      label: 'Корзина',             icon: '🗑️' },
	{ id: 'about',      label: 'Обо мне',             icon: '💻' },
	{ id: 'appstore',   label: 'Магазин приложений',  icon: '🏪' },
	{ id: 'wallpapers', label: 'Обои рабочего стола', icon: '🖼️' },
	{ id: 'launcher',   label: 'Лаунчер',             icon: '' },
]

function createApps() {
	function list(): { id: string; label: string; icon: string }[] {
		return APPS_META
	}
	return { list }
}

export const apps = createApps()
