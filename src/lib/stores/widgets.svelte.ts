export type WidgetType = 'clock' | 'calendar' | 'notes' | 'sysmon'

export type WidgetDef = {
	id: number
	type: WidgetType
	x: number
	y: number
}

const WIDGET_META: Record<WidgetType, { title: string; icon: string }> = {
	clock:    { title: 'Часы',            icon: '🕐' },
	calendar: { title: 'Календарь',       icon: '📅' },
	notes:    { title: 'Заметка',         icon: '🗒️' },
	sysmon:   { title: 'Монитор системы', icon: '📊' }
}

// Приблизительные размеры виджетов (ширина × высота) с учётом заголовка и padding
export const WIDGET_SIZES: Record<WidgetType, { w: number; h: number }> = {
	clock:    { w: 204, h: 232 },
	calendar: { w: 210, h: 256 },
	notes:    { w: 204, h: 196 },
	sysmon:   { w: 204, h: 152 }
}

const GRID = 20
const TASKBAR_H = 48

function snap(v: number) {
	return Math.round(v / GRID) * GRID
}

function overlaps(
	ax: number, ay: number, aw: number, ah: number,
	bx: number, by: number, bw: number, bh: number
) {
	return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

// Ищет ближайшую свободную позицию по сетке методом BFS-спирали
function findFreePos(
	wantX: number,
	wantY: number,
	type: WidgetType,
	others: WidgetDef[],
	excludeId: number | null
): { x: number; y: number } {
	const { w, h } = WIDGET_SIZES[type]
	const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
	const vh = typeof window !== 'undefined' ? window.innerHeight : 800

	const maxX = Math.max(0, vw - w)
	const maxY = Math.max(0, vh - TASKBAR_H - h)

	const isFree = (cx: number, cy: number) =>
		others.every((o) => {
			if (o.id === excludeId) return true
			const s = WIDGET_SIZES[o.type]
			return !overlaps(cx, cy, w, h, o.x, o.y, s.w, s.h)
		})

	// Поиск по расширяющейся спирали вокруг желаемой позиции
	for (let radius = 0; radius <= 20; radius++) {
		for (let dx = -radius; dx <= radius; dx++) {
			for (let dy = -radius; dy <= radius; dy++) {
				if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue
				const cx = Math.max(0, Math.min(snap(wantX + dx * GRID), maxX))
				const cy = Math.max(0, Math.min(snap(wantY + dy * GRID), maxY))
				if (isFree(cx, cy)) return { x: cx, y: cy }
			}
		}
	}

	return { x: snap(wantX), y: snap(wantY) }
}

function createWidgets() {
	const vw = typeof window !== 'undefined' ? window.innerWidth : 1280

	let list = $state<WidgetDef[]>([
		{ id: 1, type: 'clock',    x: snap(vw - 220), y: snap(16)  },
		{ id: 2, type: 'calendar', x: snap(vw - 220), y: snap(16) + WIDGET_SIZES.clock.h + GRID }
	])
	let nextId = $state(3)

	function add(type: WidgetType, x: number, y: number) {
		const pos = findFreePos(snap(x), snap(y), type, list, null)
		list.push({ id: nextId++, type, ...pos })
	}

	function remove(id: number) {
		list = list.filter((w) => w.id !== id)
	}

	function move(id: number, x: number, y: number) {
		const widget = list.find((w) => w.id === id)
		if (!widget) return
		const pos = findFreePos(x, y, widget.type, list, id)
		list = list.map((w) => (w.id === id ? { ...w, ...pos } : w))
	}

	function meta(type: WidgetType) {
		return WIDGET_META[type]
	}

	return {
		get list() { return list },
		add,
		remove,
		move,
		meta
	}
}

export const widgets = createWidgets()
