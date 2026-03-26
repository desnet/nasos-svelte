export type GridItem = {
	id: number
	col: number      // 1-based column index
	row: number      // 1-based row index
	colSpan: number  // width in cells
	rowSpan: number  // height in cells
	color: string
	label: string
}

function createDesktopGrid() {
	let items = $state<GridItem[]>([
		{ id: 1, col: 2,  row: 2,  colSpan: 8,  rowSpan: 8,  color: '#e74c3c', label: 'Red'    },
		{ id: 2, col: 12, row: 2,  colSpan: 12, rowSpan: 6,  color: '#3498db', label: 'Blue'   },
		{ id: 3, col: 2,  row: 12, colSpan: 6,  rowSpan: 10, color: '#2ecc71', label: 'Green'  },
		{ id: 4, col: 14, row: 10, colSpan: 10, rowSpan: 8,  color: '#f39c12', label: 'Orange' },
		{ id: 5, col: 26, row: 4,  colSpan: 8,  rowSpan: 8,  color: '#9b59b6', label: 'Purple' },
	])
	let nextId = $state(6)

	function isOccupied(col: number, row: number, colSpan: number, rowSpan: number, excludeId?: number): boolean {
		return items.some((item) => {
			if (item.id === excludeId) return false
			return (
				col < item.col + item.colSpan &&
				col + colSpan > item.col &&
				row < item.row + item.rowSpan &&
				row + rowSpan > item.row
			)
		})
	}

	function move(id: number, col: number, row: number) {
		items = items.map((item) => (item.id === id ? { ...item, col, row } : item))
	}

	return {
		get items() { return items },
		isOccupied,
		move
	}
}

export const desktopGrid = createDesktopGrid()
