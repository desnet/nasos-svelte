<script lang="ts">
	export type ShortcutConfig = {
		icon: string
		label: string
		app: string
		args?: Record<string, unknown>
	}

	let { config, ondblclick, onclick } = $props<{
		config: ShortcutConfig
		ondblclick?: (config: ShortcutConfig) => void
		onclick?: (config: ShortcutConfig) => void
	}>()
</script>

<button class="shortcut" ondblclick={() => ondblclick?.(config)} onclick={() => onclick?.(config)}>
	{#if config.icon.includes('/')}
		<img src={config.icon} alt={config.label} class="shortcut-icon-img"/>
	{:else}
		<span class="shortcut-icon">{config.icon}</span>
	{/if}
	<span class="shortcut-label">{config.label}</span>
</button>

<style>
	.shortcut {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 6px;
		background: none;
		border: none;
		cursor: default;
		border-radius: 8px;
		width: 100%;
		height: 100%;
		font-family: inherit;
		transition: background 0.12s;
	}

	.shortcut:hover {
		background: rgba(255, 255, 255, 0.12);
	}

	.shortcut:active {
		background: rgba(255, 255, 255, 0.2);
	}

	.shortcut-icon {
		font-size: 32px;
		line-height: 1;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
		pointer-events: none;
	}
	.shortcut-icon-img {
		width: 40px;
		height: 40px;
		object-fit: contain;
		filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
		pointer-events: none;
	}

	.shortcut-label {
		font-size: 11px;
		font-weight: 500;
		color: white;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
		pointer-events: none;
	}
</style>
