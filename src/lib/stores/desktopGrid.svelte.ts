export type GridItem = {
	id: number
	col: number      // 1-based column index
	row: number      // 1-based row index
	colSpan: number  // width in cells
	rowSpan: number  // height in cells
	color?: string
}

function createDesktopGrid() {
	function isOccupied(items: GridItem[], col: number, row: number, colSpan: number, rowSpan: number, excludeId?: number): boolean {
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

	function move(items: GridItem[], id: number, col: number, row: number): GridItem[] {
		return items.map((item) => (item.id === id ? { ...item, col, row } : item))
	}

	return { isOccupied, move }
}

export const desktopGrid = createDesktopGrid()
