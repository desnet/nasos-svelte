<script lang="ts">
  import favicon from '$lib/assets/favicon.svg'
  import { auth } from '$lib/stores/auth.svelte'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import { page } from '$app/stores'

  let { children } = $props()

  let mounted = $state(false)

  onMount(() => {
    mounted = true
  })

  $effect(() => {
    if (mounted && !auth.loggedIn && $page.url.pathname !== '/login') {
      goto('/login')
    }
  })
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
