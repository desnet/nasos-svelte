<script lang="ts">
	import type { Snippet } from 'svelte'

	export type WidgetConfig = {
		name: string
		app?: string
		args?: Record<string, unknown>
		variant?: 'default' | 'transparent'
	}

	let { config, ondblclick, children } = $props<{
		config: WidgetConfig
		ondblclick?: (config: WidgetConfig) => void
		children?: Snippet
	}>()
</script>

<div class="widget" class:transparent={config.variant === 'transparent'} ondblclick={() => ondblclick?.(config)} role="presentation">
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.widget {
		background: rgba(15, 25, 45, 0.82);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 10px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
		color: white;
		overflow: hidden;
		cursor: default;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		padding: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.widget.transparent {
		background: rgba(255, 255, 255, 0.01);
		border-color: rgba(255, 255, 255, 0.22);
		border-radius: 20px;
		box-shadow: none;
		backdrop-filter: blur(12px);
	}
</style>
