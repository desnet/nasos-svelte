<script lang="ts">
  import favicon from '$lib/assets/favicon.svg'
  import { auth } from '$lib/stores/auth.svelte'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { browser } from '$app/environment'
  import { tick } from 'svelte'

  let { children } = $props()

  $effect(() => {
    if (browser && !auth.loggedIn && $page.url.pathname !== '/login') {
      tick().then(() => goto('/login'))
    }
  })
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
