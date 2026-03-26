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

const GAP = 8
const TASKBAR_H = 48
const MIN_Y = 44   // menu bar (28px) + padding (16px)

function overlaps(
	ax: number, ay: number, aw: number, ah: number,
	bx: number, by: number, bw: number, bh: number
) {
	return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

// Фактическая ширина колонки = максимальная ширина среди виджетов с тем же x
function colWidth(x: number, list: WidgetDef[]): number {
	return list
		.filter((o) => o.x === x)
		.reduce((max, o) => Math.max(max, WIDGET_SIZES[o.type].w), 0)
}

// Ищет позицию с гарантированным GAP=8px на всех сторонах
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

	const minY = MIN_Y
	const maxX = Math.max(0, vw - w)
	const maxY = Math.max(minY, vh - TASKBAR_H - h)

	const relevant = others.filter((o) => o.id !== excludeId)

	// Коллизия с учётом выровненной ширины колонки каждого виджета
	const isFree = (cx: number, cy: number) =>
		relevant.every((o) => {
			const ow = colWidth(o.x, relevant)
			const oh = WIDGET_SIZES[o.type].h
			return !overlaps(cx, cy, w, h, o.x - GAP, o.y - GAP, ow + GAP * 2, oh + GAP * 2)
		})

	const clampedY = Math.max(minY, Math.min(wantY, maxY))
	const clampedX = Math.max(0,    Math.min(wantX, maxX))

	// Стековые позиции по Y: ровно GAP от нижней/верхней грани каждого виджета
	const stackYs: number[] = []
	for (const o of relevant) {
		const oh = WIDGET_SIZES[o.type].h
		const below = o.y + oh + GAP
		if (below <= maxY) stackYs.push(below)
		const above = o.y - GAP - h
		if (above >= minY) stackYs.push(above)
	}
	stackYs.sort((a, b) => Math.abs(a - wantY) - Math.abs(b - wantY))

	// X-кандидаты: сначала wantX, затем ровно GAP от края каждой колонки
	const cols = [...new Set(relevant.map((o) => o.x))]
	const stackXs: number[] = []
	for (const cx of cols) {
		const cw = colWidth(cx, relevant)
		const right = cx + cw + GAP
		if (right <= maxX) stackXs.push(right)
		const left = cx - w - GAP
		if (left >= 0) stackXs.push(left)
	}
	stackXs.sort((a, b) => Math.abs(a - wantX) - Math.abs(b - wantX))
	const xs = [clampedX, ...stackXs.filter((x) => x !== clampedX)]

	for (const cx of xs) {
		// Для существующей колонки — стековые позиции приоритетнее курсора;
		// для новой колонки — курсор приоритетнее стековых позиций.
		const isExistingCol = relevant.some((o) => o.x === cx)
		const ys = isExistingCol
			? [...stackYs, clampedY]
			: [clampedY, ...stackYs]

		for (const cy of ys) {
			if (isFree(cx, cy)) return { x: cx, y: cy }
		}
	}

	return { x: clampedX, y: clampedY }
}

function createWidgets() {
	const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
	const initX = vw - WIDGET_SIZES.calendar.w - GAP * 2

	let list = $state<WidgetDef[]>([
		{ id: 1, type: 'clock',    x: initX, y: MIN_Y },
		{ id: 2, type: 'calendar', x: initX, y: MIN_Y + WIDGET_SIZES.clock.h + GAP }
	])
	let nextId = $state(3)

	function add(type: WidgetType, x: number, y: number) {
		const pos = findFreePos(x, y, type, list, null)
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
		// Ширина виджета = максимальная ширина среди виджетов в той же колонке
		get widths(): Record<number, number> {
			const result: Record<number, number> = {}
			for (const w of list) result[w.id] = colWidth(w.x, list)
			return result
		},
		add,
		remove,
		move,
		meta
	}
}

export const widgets = createWidgets()
