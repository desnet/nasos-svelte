<script lang="ts">
	export type IconConfig = {
		icon: string
		label: string
		app: string
		args?: Record<string, unknown>
	}

	let { config, ondblclick } = $props<{
		config: IconConfig
		ondblclick?: (config: IconConfig) => void
	}>()
</script>

<button class="shortcut" ondblclick={() => ondblclick?.(config)}>
	<span class="shortcut-icon">{config.icon}</span>
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
		cursor: pointer;
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
