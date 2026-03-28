export type WidgetType = 'clock' | 'calendar' | 'notes' | 'sysmon'

const WIDGET_META: Record<WidgetType, { label: string; icon: string }> = {
	clock:    { label: 'Часы',            icon: '🕐' },
	calendar: { label: 'Календарь',       icon: '📅' },
	notes:    { label: 'Заметка',         icon: '🗒️' },
	sysmon:   { label: 'Монитор системы', icon: '📊' },
}

function createWidgets() {
	function list(): { type: WidgetType; label: string; icon: string }[] {
		return (Object.keys(WIDGET_META) as WidgetType[]).map((type) => ({
			type,
			...WIDGET_META[type],
		}))
	}

	return { list }
}

export const widgets = createWidgets()
