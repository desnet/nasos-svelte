<div class="about">
	<div class="logo">🖥️</div>
	<h2>NasOS</h2>
	<p class="version">Версия 1.0.0</p>
	<hr />
	<div class="info">
		<div class="row"><span>Система:</span><span>NasOS Desktop</span></div>
		<div class="row"><span>Платформа:</span><span>Web (SvelteKit 2 + Svelte 5)</span></div>
		<div class="row"><span>Процессор:</span><span>JavaScript Engine</span></div>
		<div class="row"><span>ОЗУ:</span><span>∞ МБ</span></div>
		<div class="row"><span>Дата сборки:</span><span>25.03.2026</span></div>
	</div>
	<p class="footer">© 2026 NasOS. Все права защищены.</p>
</div>

<style>
	.about {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 32px 24px;
		gap: 8px;
		font-size: 13px;
		height: 100%;
		box-sizing: border-box;
	}

	.logo { font-size: 64px; }
	h2 { margin: 0; font-size: 22px; }
	.version { color: #666; margin: 0; }

	hr { width: 100%; border: none; border-top: 1px solid #ddd; margin: 12px 0; }

	.info {
		width: 100%;
		max-width: 320px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.row {
		display: flex;
		justify-content: space-between;
		padding: 4px 8px;
		background: #f5f5f5;
		border-radius: 4px;
	}
	.row span:first-child { color: #555; }
	.row span:last-child { font-weight: 600; }

	.footer {
		margin-top: auto;
		color: #aaa;
		font-size: 11px;
	}
</style>
