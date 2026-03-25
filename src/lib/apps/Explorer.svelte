<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity'

	type FileItem = {
		name: string
		type: 'folder' | 'file'
		icon: string
		size?: string
		modified?: string
		children?: FileItem[]
	}

	const tree: FileItem[] = [
		{
			name: 'Рабочий стол', type: 'folder', icon: '🖥️',
			children: [
				{ name: 'Проекты', type: 'folder', icon: '📁', children: [
					{ name: 'nasos-svelte', type: 'folder', icon: '📁', children: [
						{ name: 'src', type: 'folder', icon: '📁', children: [] },
						{ name: 'package.json', type: 'file', icon: '📄', size: '1 КБ' }
					]}
				]},
				{ name: 'Заметки.txt', type: 'file', icon: '📝', size: '2 КБ', modified: '25.03.2026' }
			]
		},
		{
			name: 'Документы', type: 'folder', icon: '📂',
			children: [
				{ name: 'Отчёт.docx',       type: 'file', icon: '📄', size: '45 КБ',  modified: '20.03.2026' },
				{ name: 'Презентация.pptx', type: 'file', icon: '📊', size: '2 МБ',   modified: '18.03.2026' },
				{ name: 'Таблица.xlsx',     type: 'file', icon: '📊', size: '120 КБ', modified: '15.03.2026' }
			]
		},
		{
			name: 'Загрузки', type: 'folder', icon: '📥',
			children: [
				{ name: 'setup.exe', type: 'file', icon: '⚙️', size: '55 МБ', modified: '24.03.2026' },
				{ name: 'фото.jpg',  type: 'file', icon: '🖼️', size: '3 МБ',  modified: '22.03.2026' }
			]
		},
		{
			name: 'Музыка', type: 'folder', icon: '🎵',
			children: [
				{ name: 'playlist.mp3', type: 'file', icon: '🎵', size: '8 МБ', modified: '10.03.2026' }
			]
		},
		{
			name: 'Этот компьютер', type: 'folder', icon: '💻',
			children: [
				{ name: 'Диск C:', type: 'folder', icon: '💾', children: [] },
				{ name: 'Диск D:', type: 'folder', icon: '💾', children: [] }
			]
		}
	]

	// Ключ выделения — путь через '/', уникален для любого узла дерева
	let selectedKey = $state<string | null>('Рабочий стол')
	let expanded = $state(new SvelteSet<string>(['Рабочий стол']))
	let currentFolder = $state<FileItem>(tree[0])
	let path = $state<string[]>(['Рабочий стол'])
	let searchQuery = $state('')

	function openItem(item: FileItem, itemPath: string[]) {
		const key = itemPath.join('/')
		selectedKey = key
		if (item.type !== 'folder') return
		currentFolder = item
		path = itemPath
		if (expanded.has(key)) {
			expanded.delete(key)
		} else {
			expanded.add(key)
		}
	}

	function findByPath(parts: string[]): FileItem | null {
		let curr: FileItem[] = tree
		let found: FileItem | null = null
		for (const p of parts) {
			found = curr.find((f) => f.name === p) ?? null
			if (!found) return null
			curr = found.children ?? []
		}
		return found
	}

	function navigatePath(idx: number) {
		const newPath = path.slice(0, idx + 1)
		const item = findByPath(newPath)
		if (item) {
			currentFolder = item
			path = newPath
			selectedKey = newPath.join('/')
		}
	}

	const displayItems = $derived(
		searchQuery
			? (currentFolder.children ?? []).filter((f) =>
					f.name.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: currentFolder.children ?? []
	)

	function buildFlatTree(
		items: FileItem[],
		depth = 0,
		pathArr: string[] = []
	): { item: FileItem; depth: number; itemPath: string[] }[] {
		const result: { item: FileItem; depth: number; itemPath: string[] }[] = []
		for (const item of items) {
			const itemPath = [...pathArr, item.name]
			result.push({ item, depth, itemPath })
			if (item.type === 'folder' && expanded.has(itemPath.join('/')) && item.children) {
				result.push(...buildFlatTree(item.children, depth + 1, itemPath))
			}
		}
		return result
	}

	const flatTree = $derived(buildFlatTree(tree))
</script>

<div class="explorer">
	<!-- Toolbar -->
	<div class="toolbar">
		<button class="tb-btn" onclick={() => navigatePath(path.length - 2)} disabled={path.length <= 1}>◀</button>
		<div class="breadcrumb">
			{#each path as part, i (i)}
				{#if i > 0}<span class="sep">›</span>{/if}
				<button class="crumb" onclick={() => navigatePath(i)}>{part}</button>
			{/each}
		</div>
		<input class="search" type="text" placeholder="🔍 Поиск..." bind:value={searchQuery} />
	</div>

	<div class="content">
		<!-- Sidebar tree -->
		<div class="sidebar">
			{#each flatTree as { item, depth, itemPath } (itemPath.join('/'))}
				<button
					class="tree-item"
					class:selected={selectedKey === itemPath.join('/')}
					style="padding-left: {12 + depth * 16}px"
					onclick={() => openItem(item, itemPath)}
				>
					{#if item.type === 'folder'}
						<span class="arrow">{expanded.has(itemPath.join('/')) ? '▾' : '▸'}</span>
					{:else}
						<span class="arrow"> </span>
					{/if}
					<span class="item-icon">{item.icon}</span>
					<span class="item-name">{item.name}</span>
				</button>
			{/each}
		</div>

		<!-- Main content -->
		<div class="main">
			{#if displayItems.length === 0}
				<div class="empty">Папка пуста</div>
			{:else}
				<div class="file-grid">
					{#each displayItems as item (item.name)}
						<button
							class="file-item"
							class:selected={selectedKey === [...path, item.name].join('/')}
							ondblclick={() => item.type === 'folder' && openItem(item, [...path, item.name])}
							onclick={() => (selectedKey = [...path, item.name].join('/'))}
						>
							<span class="file-icon">{item.icon}</span>
							<span class="file-name">{item.name}</span>
							{#if item.size}
								<span class="file-meta">{item.size}</span>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Status bar -->
	<div class="statusbar">
		{displayItems.length} объект(ов)
		{#if selectedKey}
			&nbsp;· Выбран: {selectedKey.split('/').at(-1)}
		{/if}
	</div>
</div>

<style>
	.explorer {
		display: flex;
		flex-direction: column;
		height: 100%;
		font-size: 13px;
		background: #fafafa;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		background: #f0f0f0;
		border-bottom: 1px solid #ccc;
	}

	.tb-btn {
		padding: 2px 8px;
		border: 1px solid #bbb;
		border-radius: 3px;
		background: white;
		cursor: pointer;
		font-size: 12px;
	}
	.tb-btn:disabled { opacity: 0.4; cursor: default; }
	.tb-btn:hover:not(:disabled) { background: #e0e8f8; }

	.breadcrumb {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 3px 8px;
		background: white;
		border: 1px solid #bbb;
		border-radius: 3px;
		overflow: hidden;
	}

	.crumb {
		cursor: pointer;
		color: #0066cc;
		white-space: nowrap;
		background: none;
		border: none;
		padding: 0;
		font-size: inherit;
		font-family: inherit;
	}
	.crumb:hover { text-decoration: underline; }
	.sep { color: #999; }

	.search {
		width: 160px;
		padding: 3px 8px;
		border: 1px solid #bbb;
		border-radius: 3px;
		font-size: 12px;
	}

	.content {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.sidebar {
		width: 200px;
		overflow-y: auto;
		border-right: 1px solid #ddd;
		background: #f7f7f7;
		padding: 4px 0;
	}

	.tree-item {
		display: flex;
		align-items: center;
		gap: 4px;
		padding-top: 3px;
		padding-bottom: 3px;
		padding-right: 8px;
		cursor: pointer;
		white-space: nowrap;
		overflow: hidden;
		background: none;
		border: none;
		width: 100%;
		text-align: left;
		font-size: 13px;
		font-family: inherit;
		color: inherit;
	}
	.tree-item:hover { background: #ddeeff; }
	.tree-item.selected { background: #cce0ff; }

	.arrow { font-size: 10px; width: 12px; flex-shrink: 0; }
	.item-icon { flex-shrink: 0; }
	.item-name { overflow: hidden; text-overflow: ellipsis; }

	.main {
		flex: 1;
		overflow-y: auto;
		padding: 8px;
	}

	.empty {
		color: #999;
		text-align: center;
		margin-top: 40px;
	}

	.file-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-content: flex-start;
	}

	.file-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		width: 80px;
		padding: 8px 4px;
		border-radius: 4px;
		cursor: pointer;
		text-align: center;
		border: 2px solid transparent;
		background: none;
		font-size: 13px;
		font-family: inherit;
		color: inherit;
	}
	.file-item:hover { background: #e8f0fe; }
	.file-item.selected { background: #cce0ff; border-color: #4a90d9; }

	.file-icon { font-size: 28px; }
	.file-name {
		font-size: 11px;
		overflow: hidden;
		text-overflow: ellipsis;
		width: 100%;
		word-break: break-word;
	}
	.file-meta { font-size: 10px; color: #888; }

	.statusbar {
		padding: 3px 10px;
		background: #f0f0f0;
		border-top: 1px solid #ccc;
		font-size: 11px;
		color: #555;
	}
</style>
