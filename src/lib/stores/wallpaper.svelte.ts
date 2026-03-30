export type Wallpaper = {
	id: string
	name: string
	category: string
	css: string
	thumb: string // то же, что css — для превью
}

export const WALLPAPERS: Wallpaper[] = [
	// Ночное небо (по умолчанию)
	{
		id: 'night-blue',
		name: 'Ночной горизонт',
		category: 'Абстракция',
		css: 'linear-gradient(135deg, #1a3a5c 0%, #0d2137 40%, #1a2d4a 70%, #0a1a2e 100%)',
		thumb: 'linear-gradient(135deg, #1a3a5c 0%, #0d2137 40%, #1a2d4a 70%, #0a1a2e 100%)'
	},
	{
		id: 'aurora',
		name: 'Северное сияние',
		category: 'Природа',
		css: 'linear-gradient(160deg, #0a0a2e 0%, #1a4a3a 30%, #2a8a5a 55%, #4aaa7a 70%, #1a3a5a 100%)',
		thumb: 'linear-gradient(160deg, #0a0a2e 0%, #1a4a3a 30%, #2a8a5a 55%, #4aaa7a 70%, #1a3a5a 100%)'
	},
	{
		id: 'sunset',
		name: 'Закат',
		category: 'Природа',
		css: 'linear-gradient(180deg, #1a0a2e 0%, #6a1a4a 25%, #c04a20 55%, #e08030 75%, #f0b060 100%)',
		thumb: 'linear-gradient(180deg, #1a0a2e 0%, #6a1a4a 25%, #c04a20 55%, #e08030 75%, #f0b060 100%)'
	},
	{
		id: 'ocean',
		name: 'Океан',
		category: 'Природа',
		css: 'linear-gradient(180deg, #001a3a 0%, #003a6a 30%, #0060a0 60%, #0080c0 80%, #00a0d0 100%)',
		thumb: 'linear-gradient(180deg, #001a3a 0%, #003a6a 30%, #0060a0 60%, #0080c0 80%, #00a0d0 100%)'
	},
	{
		id: 'forest',
		name: 'Лес',
		category: 'Природа',
		css: 'linear-gradient(180deg, #0a1a0a 0%, #1a3a1a 25%, #2a5a2a 55%, #3a7a3a 80%, #4a8a4a 100%)',
		thumb: 'linear-gradient(180deg, #0a1a0a 0%, #1a3a1a 25%, #2a5a2a 55%, #3a7a3a 80%, #4a8a4a 100%)'
	},
	{
		id: 'volcano',
		name: 'Вулкан',
		category: 'Природа',
		css: 'linear-gradient(180deg, #0a0a0a 0%, #2a0a0a 30%, #6a1a00 55%, #c04000 75%, #e06000 100%)',
		thumb: 'linear-gradient(180deg, #0a0a0a 0%, #2a0a0a 30%, #6a1a00 55%, #c04000 75%, #e06000 100%)'
	},
	{
		id: 'purple-dream',
		name: 'Фиолетовый сон',
		category: 'Абстракция',
		css: 'linear-gradient(135deg, #0d0d2e 0%, #1a0a3a 30%, #3a1a6a 60%, #6a2a9a 85%, #8a3aba 100%)',
		thumb: 'linear-gradient(135deg, #0d0d2e 0%, #1a0a3a 30%, #3a1a6a 60%, #6a2a9a 85%, #8a3aba 100%)'
	},
	{
		id: 'rose-gold',
		name: 'Розовое золото',
		category: 'Абстракция',
		css: 'linear-gradient(135deg, #2a1a1a 0%, #4a2a2a 30%, #8a4a4a 55%, #c08060 75%, #e0b080 100%)',
		thumb: 'linear-gradient(135deg, #2a1a1a 0%, #4a2a2a 30%, #8a4a4a 55%, #c08060 75%, #e0b080 100%)'
	},
	{
		id: 'cyber',
		name: 'Киберпанк',
		category: 'Абстракция',
		css: 'linear-gradient(135deg, #000a1a 0%, #001a2a 40%, #0a2a1a 60%, #001a00 80%, #0a0a0a 100%)',
		thumb: 'linear-gradient(135deg, #000a1a 0%, #001a2a 40%, #0a2a1a 60%, #001a00 80%, #0a0a0a 100%)'
	},
	{
		id: 'space',
		name: 'Космос',
		category: 'Космос',
		css: 'radial-gradient(ellipse at 30% 40%, #1a0a3a 0%, #0a0a1a 50%, #000000 100%)',
		thumb: 'radial-gradient(ellipse at 30% 40%, #1a0a3a 0%, #0a0a1a 50%, #000000 100%)'
	},
	{
		id: 'nebula',
		name: 'Туманность',
		category: 'Космос',
		css: 'radial-gradient(ellipse at 20% 60%, #2a0a4a 0%, #0a1a3a 40%, #001a2a 70%, #000a0a 100%)',
		thumb: 'radial-gradient(ellipse at 20% 60%, #2a0a4a 0%, #0a1a3a 40%, #001a2a 70%, #000a0a 100%)'
	},
	{
		id: 'galaxy',
		name: 'Галактика',
		category: 'Космос',
		css: 'conic-gradient(from 200deg at 50% 50%, #0a0a2e, #1a0a3a, #0a1a3a, #001a2a, #0a0a2e)',
		thumb: 'conic-gradient(from 200deg at 50% 50%, #0a0a2e, #1a0a3a, #0a1a3a, #001a2a, #0a0a2e)'
	},
	{
		id: 'mint',
		name: 'Мята',
		category: 'Минимализм',
		css: 'linear-gradient(135deg, #e8f5f0 0%, #c8eae0 50%, #a8dfd0 100%)',
		thumb: 'linear-gradient(135deg, #e8f5f0 0%, #c8eae0 50%, #a8dfd0 100%)'
	},
	{
		id: 'sand',
		name: 'Песок',
		category: 'Минимализм',
		css: 'linear-gradient(135deg, #f5f0e8 0%, #ead5b0 50%, #d4b880 100%)',
		thumb: 'linear-gradient(135deg, #f5f0e8 0%, #ead5b0 50%, #d4b880 100%)'
	},
	{
		id: 'slate',
		name: 'Сланец',
		category: 'Минимализм',
		css: 'linear-gradient(135deg, #2a2a3a 0%, #3a3a4a 50%, #4a4a5a 100%)',
		thumb: 'linear-gradient(135deg, #2a2a3a 0%, #3a3a4a 50%, #4a4a5a 100%)'
	},
	{
		id: 'pure-black',
		name: 'Чёрный',
		category: 'Минимализм',
		css: '#000000',
		thumb: '#000000'
	}
]

function createWallpaperStore() {
	let current = $state<Wallpaper>(WALLPAPERS[7])

	function set(w: Wallpaper) {
		current = w
	}

	return {
		get current() { return current },
		set
	}
}

export const wallpaperStore = createWallpaperStore()
