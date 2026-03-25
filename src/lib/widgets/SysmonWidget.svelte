<script lang="ts">
	type Sample = { cpu: number; ram: number }

	function rand(base: number, spread: number) {
		return Math.min(100, Math.max(0, base + (Math.random() - 0.5) * spread))
	}

	let cpu = $state(rand(35, 20))
	let ram = $state(rand(60, 10))
	let history = $state<Sample[]>(Array.from({ length: 20 }, () => ({ cpu: rand(35, 20), ram: rand(60, 10) })))

	setInterval(() => {
		cpu = rand(cpu, 15)
		ram = rand(ram, 5)
		history = [...history.slice(1), { cpu, ram }]
	}, 1000)

	function bar(val: number) {
		return `${val.toFixed(0)}%`
	}

	function color(val: number) {
		if (val > 80) return '#e05050'
		if (val > 60) return '#e0a030'
		return '#4a90d9'
	}

	// SVG sparkline
	function sparkline(key: keyof Sample) {
		const pts = history.map((s, i) => {
			const x = (i / (history.length - 1)) * 180
			const y = 30 - (s[key] / 100) * 28
			return `${x},${y}`
		})
		return `M ${pts.join(' L ')}`
	}
</script>

<div class="sysmon">
	<!-- CPU -->
	<div class="row">
		<span class="label">ЦПУ</span>
		<div class="bar-track">
			<div class="bar-fill" style="width:{cpu}%; background:{color(cpu)}"></div>
		</div>
		<span class="val">{bar(cpu)}</span>
	</div>

	<!-- RAM -->
	<div class="row">
		<span class="label">ОЗУ</span>
		<div class="bar-track">
			<div class="bar-fill" style="width:{ram}%; background:{color(ram)}"></div>
		</div>
		<span class="val">{bar(ram)}</span>
	</div>

	<!-- Sparkline -->
	<svg class="spark" viewBox="0 0 180 30" preserveAspectRatio="none">
		<path d={sparkline('cpu')} fill="none" stroke="#4a90d9" stroke-width="1.5" opacity="0.8"/>
		<path d={sparkline('ram')} fill="none" stroke="#50c878" stroke-width="1.5" opacity="0.6"/>
	</svg>

	<div class="legend">
		<span style="color:#4a90d9">■ ЦПУ</span>
		<span style="color:#50c878">■ ОЗУ</span>
	</div>
</div>

<style>
	.sysmon { width: 180px; display: flex; flex-direction: column; gap: 8px; }

	.row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.label {
		font-size: 11px;
		color: rgba(255,255,255,0.55);
		width: 28px;
		flex-shrink: 0;
	}

	.bar-track {
		flex: 1;
		height: 6px;
		background: rgba(255,255,255,0.1);
		border-radius: 3px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		border-radius: 3px;
		transition: width 0.8s ease, background 0.8s ease;
	}

	.val {
		font-size: 11px;
		color: white;
		width: 32px;
		text-align: right;
		flex-shrink: 0;
	}

	.spark {
		width: 100%;
		height: 30px;
		display: block;
	}

	.legend {
		display: flex;
		gap: 12px;
		font-size: 10px;
		color: rgba(255,255,255,0.5);
	}
</style>
