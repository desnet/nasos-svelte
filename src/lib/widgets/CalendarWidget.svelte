<script lang="ts">
	let today = new Date()
	let viewing = $state({ year: today.getFullYear(), month: today.getMonth() })

	const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
	const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь',
	                'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']

	const cells = $derived.by(() => {
		const { year, month } = viewing
		const first = new Date(year, month, 1)
		// Пн=0 … Вс=6
		const startDow = (first.getDay() + 6) % 7
		const daysInMonth = new Date(year, month + 1, 0).getDate()
		const arr: (number | null)[] = Array(startDow).fill(null)
		for (let d = 1; d <= daysInMonth; d++) arr.push(d)
		while (arr.length % 7 !== 0) arr.push(null)
		return arr
	})

	function prev() {
		let { year, month } = viewing
		month--
		if (month < 0) { month = 11; year-- }
		viewing = { year, month }
	}
	function next() {
		let { year, month } = viewing
		month++
		if (month > 11) { month = 0; year++ }
		viewing = { year, month }
	}

	function isToday(d: number | null) {
		return d !== null
			&& d === today.getDate()
			&& viewing.month === today.getMonth()
			&& viewing.year === today.getFullYear()
	}
</script>

<div class="cal">
	<div class="nav">
		<button onclick={prev}>◀</button>
		<span>{MONTHS[viewing.month]} {viewing.year}</span>
		<button onclick={next}>▶</button>
	</div>
	<div class="grid">
		{#each DAYS as d (d)}
			<div class="cell header">{d}</div>
		{/each}
		{#each cells as cell, i (i)}
			<div class="cell" class:today={isToday(cell)} class:empty={cell === null}>
				{cell ?? ''}
			</div>
		{/each}
	</div>
</div>

<style>
	.cal { width: 186px; }

	.nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
		font-size: 12px;
		font-weight: 600;
		color: white;
	}

	.nav button {
		background: none;
		border: none;
		color: rgba(255,255,255,0.6);
		cursor: pointer;
		font-size: 11px;
		padding: 2px 6px;
		border-radius: 4px;
	}
	.nav button:hover { background: rgba(255,255,255,0.1); color: white; }

	.grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 2px;
	}

	.cell {
		text-align: center;
		font-size: 11px;
		padding: 3px 0;
		border-radius: 4px;
		color: rgba(255,255,255,0.75);
	}

	.cell.header {
		font-weight: 700;
		color: rgba(255,255,255,0.4);
		font-size: 10px;
	}

	.cell.today {
		background: #4a90d9;
		color: white;
		font-weight: 700;
	}

	.cell.empty { opacity: 0; }
</style>
