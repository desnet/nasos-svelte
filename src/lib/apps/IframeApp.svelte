<script lang="ts">
  let { url } = $props<{ url?: string }>();
</script>

{#if url}
  <iframe
    src={url}
    title="iframe"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  ></iframe>
{:else}
  <div class="empty">Нет URL</div>
{/if}

<style>
  iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }
  .empty {
    padding: 24px;
    color: #888;
    font-size: 13px;
  }
</style>
