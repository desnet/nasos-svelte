<script lang="ts">
	import { desktop } from '$lib/stores/desktop.svelte'

	let now = $state(new Date())
	let showStart = $state(false)

	setInterval(() => {
		now = new Date()
	}, 1000)

	const hours = $derived(now.toLocaleTimeString('ru-RU', { hour: '2-digit' }))
	const minutes = $derived(now.toLocaleTimeString('ru-RU', { minute: '2-digit' }))
	const seconds = $derived(now.toLocaleTimeString('ru-RU', { second: '2-digit' }))
	const blink = $derived(now.getSeconds() % 2 === 0)
	const date = $derived(
		now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
	)

	const startApps = [
		{ label: 'Проводник', icon: '📁', app: 'explorer' },
		{ label: 'Блокнот', icon: '📝', app: 'notepad' },
		{ label: 'Магазин', icon: '🏪', app: 'appstore' },
		{ label: 'Обо мне', icon: '💻', app: 'about' },
		{ label: 'Корзина', icon: '🗑️', app: 'trash' }
	]

	function clickApp(app: string) {
		desktop.openApp(app)
		showStart = false
	}

	function toggleStart(e: MouseEvent) {
		e.stopPropagation()
		showStart = !showStart
	}

	function taskbarClick(w: (typeof desktop.windows)[number]) {
		if (w.minimized) {
			desktop.restoreWindow(w.id)
		} else if (w.focused) {
			desktop.minimizeWindow(w.id)
		} else {
			desktop.focusWindow(w.id)
		}
	}
</script>

<svelte:window onclick={() => (showStart = false)} />

<!-- Start menu -->
{#if showStart}
	<div class="start-menu" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="menu" tabindex="0">
		<div class="start-header">
			<span class="start-logo">🖥️</span>
			<div>
				<div class="start-name">NasOS</div>
				<div class="start-sub">Главное меню</div>
			</div>
		</div>
		<div class="start-apps">
			{#each startApps as a (a.app)}
				<button class="start-app" onclick={() => clickApp(a.app)}>
					<span class="sa-icon">{a.icon}</span>
					<span>{a.label}</span>
				</button>
			{/each}
		</div>
		<div class="start-footer">
			<button class="start-power" onclick={() => (showStart = false)}>⏻ Выключить</button>
		</div>
	</div>
{/if}

<div class="taskbar">
	<!-- Start button -->
	<button class="start-btn" class:active={showStart} onclick={toggleStart}>
		🖥️ Пуск
	</button>

	<!-- Divider -->
	<div class="divider"></div>

	<!-- Running windows -->
	<div class="tasks">
		{#each desktop.windows as w (w.id)}
			<button
				class="task-btn"
				class:active={w.focused && !w.minimized}
				class:minimized={w.minimized}
				onclick={() => taskbarClick(w)}
				title={w.title}
			>
				<span>{w.icon}</span>
				<span class="task-label">{w.title}</span>
			</button>
		{/each}
	</div>

	<!-- Tray -->
	<div class="tray">
		<span class="tray-icon" title="Сеть">🌐</span>
		<span class="tray-icon" title="Звук">🔊</span>
		<div class="clock">
			<span class="time">
				{hours}<span class="colon" class:dim={blink}>:</span>{minutes}<span class="colon" class:dim={blink}>:</span><span class="secs">{seconds}</span>
			</span>
			<span class="date-small">{date}</span>
		</div>
	</div>
</div>

<style>
	.start-menu {
		position: fixed;
		bottom: 52px;
		left: 4px;
		width: 240px;
		background: #1e1e2e;
		color: white;
		border-radius: 8px 8px 0 8px;
		box-shadow: 4px -4px 24px rgba(0, 0, 0, 0.5);
		z-index: 10000;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.start-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		background: #2a2a3e;
	}
	.start-logo { font-size: 28px; }
	.start-name { font-size: 15px; font-weight: 700; }
	.start-sub { font-size: 11px; color: #aaa; }

	.start-apps {
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.start-app {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
		background: transparent;
		border: none;
		color: white;
		border-radius: 6px;
		cursor: pointer;
		font-size: 13px;
		text-align: left;
		width: 100%;
	}
	.start-app:hover { background: rgba(255,255,255,0.1); }
	.sa-icon { font-size: 18px; }

	.start-footer {
		padding: 8px;
		border-top: 1px solid rgba(255,255,255,0.1);
	}
	.start-power {
		width: 100%;
		padding: 8px;
		background: rgba(255,60,60,0.2);
		border: none;
		color: #ff8080;
		border-radius: 6px;
		cursor: pointer;
		font-size: 12px;
	}
	.start-power:hover { background: rgba(255,60,60,0.4); }

	/* Taskbar */
	.taskbar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 48px;
		background: linear-gradient(to bottom, #2a2a3e, #1a1a2e);
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 0 6px;
		z-index: 9999;
		box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.4);
	}

	.start-btn {
		height: 36px;
		padding: 0 16px;
		background: linear-gradient(to bottom, #4a90d9, #2c6fad);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 13px;
		font-weight: 600;
		white-space: nowrap;
		flex-shrink: 0;
	}
	.start-btn:hover { filter: brightness(1.15); }
	.start-btn.active { background: linear-gradient(to bottom, #2c6fad, #1a4f80); }

	.divider {
		width: 1px;
		height: 28px;
		background: rgba(255,255,255,0.2);
		flex-shrink: 0;
		margin: 0 2px;
	}

	.tasks {
		display: flex;
		gap: 4px;
		flex: 1;
		overflow: hidden;
	}

	.task-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		height: 36px;
		padding: 0 10px;
		background: rgba(255,255,255,0.08);
		border: 1px solid rgba(255,255,255,0.15);
		color: white;
		border-radius: 4px;
		cursor: pointer;
		font-size: 12px;
		max-width: 160px;
		overflow: hidden;
		flex-shrink: 0;
	}
	.task-btn:hover { background: rgba(255,255,255,0.18); }
	.task-btn.active {
		background: rgba(74,144,217,0.4);
		border-color: #4a90d9;
		box-shadow: inset 0 -2px 0 #4a90d9;
	}
	.task-btn.minimized { opacity: 0.6; }

	.task-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tray {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
		padding-left: 8px;
		border-left: 1px solid rgba(255,255,255,0.15);
	}

	.tray-icon {
		font-size: 16px;
		cursor: default;
	}

	.clock {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		cursor: default;
	}

	.time {
		font-size: 13px;
		font-weight: 600;
		color: white;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.3px;
	}

	.colon {
		opacity: 1;
		transition: opacity 0.1s;
	}
	.colon.dim { opacity: 0.3; }

	.secs {
		font-size: 10px;
		color: #aaa;
		font-weight: 400;
	}

	.date-small {
		font-size: 10px;
		color: #aaa;
	}
</style>
