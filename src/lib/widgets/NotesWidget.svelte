<script lang="ts">
	let text = $state('📌 Заметки\n\n- Идеи для проекта\n- Купить продукты\n- Позвонить другу')
</script>

<textarea
	class="notes"
	bind:value={text}
	placeholder="Введите заметку..."
	spellcheck="false"
></textarea>

<style>
	.notes {
		width: 180px;
		height: 120px;
		resize: none;
		background: transparent;
		border: none;
		outline: none;
		color: rgba(255, 255, 255, 0.85);
		font-size: 12px;
		line-height: 1.6;
		font-family: inherit;
		padding: 0;
		box-sizing: border-box;
	}

	.notes::placeholder {
		color: rgba(255, 255, 255, 0.3);
	}
</style>
