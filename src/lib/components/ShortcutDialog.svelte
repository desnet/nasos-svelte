<script lang="ts">
	import { getContext } from 'svelte'
	import { desktop, AVAILABLE_APPS, type DesktopIcon, type DesktopIconType } from '$lib/stores/desktop.svelte'
	import { shortcutDialogState } from '$lib/stores/shortcutDialogState.svelte'

	const winId = getContext<number>('windowId')
	const icon = shortcutDialogState.target

	let label = $state(icon?.label ?? '')
	let emoji = $state(icon?.icon  ?? '🔗')
	let type  = $state<DesktopIconType>(icon?.type ?? 'url')
	let app   = $state(icon?.app   ?? 'explorer')
	let url   = $state(icon?.url   ?? 'https://')

	function save() {
		if (!label.trim()) return
		const data: Omit<DesktopIcon, 'id'> = {
			label: label.trim(),
			icon: emoji,
			type,
			app: type === 'app' ? app : 'iframe',
			url: type === 'url' ? url : undefined
		}
		shortcutDialogState.onSave?.(data)
		desktop.closeWindow(winId)
	}
</script>

<div class="form">
	<div class="field-row">
		<label for="sc-emoji">Иконка</label>
		<input id="sc-emoji" class="emoji-input" bind:value={emoji} maxlength="2" />
	</div>

	<div class="field-row">
		<label for="sc-label">Название</label>
		<input id="sc-label" bind:value={label} placeholder="Название ярлыка" />
	</div>

	<div class="field-row">
		<label for="sc-type">Тип</label>
		<select id="sc-type" bind:value={type}>
			<option value="app">Приложение</option>
			<option value="url">Ссылка (URL)</option>
		</select>
	</div>

	{#if type === 'app'}
		<div class="field-row">
			<label for="sc-app">Приложение</label>
			<select id="sc-app" bind:value={app}>
				{#each AVAILABLE_APPS as a (a.id)}
					<option value={a.id}>{a.icon} {a.label}</option>
				{/each}
			</select>
		</div>
	{:else}
		<div class="field-row">
			<label for="sc-url">URL</label>
			<input id="sc-url" bind:value={url} placeholder="https://..." type="url" />
		</div>
	{/if}

	<div class="actions">
		<button class="btn-cancel" onclick={() => desktop.closeWindow(winId)}>Отмена</button>
		<button class="btn-save" onclick={save} disabled={!label.trim()}>Сохранить</button>
	</div>
</div>

<style>
	.form {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		background: #f5f6fa;
		height: 100%;
		box-sizing: border-box;
	}

	.field-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.field-row label {
		width: 80px;
		font-size: 13px;
		color: #555;
		flex-shrink: 0;
	}

	.field-row input,
	.field-row select {
		flex: 1;
		padding: 6px 10px;
		border: 1px solid #d0d4e0;
		border-radius: 6px;
		font-size: 13px;
		font-family: inherit;
		outline: none;
	}
	.field-row input:focus,
	.field-row select:focus { border-color: #4a90d9; }

	.emoji-input {
		width: 48px !important;
		flex: none !important;
		text-align: center;
		font-size: 18px !important;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: auto;
		padding-top: 4px;
	}

	.btn-cancel {
		padding: 7px 16px;
		background: #f0f0f0;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 13px;
		cursor: pointer;
		color: #555;
	}
	.btn-cancel:hover { background: #e4e4e4; }

	.btn-save {
		padding: 7px 20px;
		background: #4a90d9;
		border: none;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 600;
		color: white;
		cursor: pointer;
	}
	.btn-save:hover:not(:disabled) { background: #357abd; }
	.btn-save:disabled { opacity: 0.5; cursor: default; }
</style>
