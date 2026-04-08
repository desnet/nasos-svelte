<script lang="ts">
  import favicon from '$lib/assets/favicon.svg'
  import { auth } from '$lib/stores/auth.svelte'
  import { beforeNavigate, goto } from '$app/navigation'

  let { children } = $props()

  beforeNavigate(({ to, cancel }) => {
    if (!auth.loggedIn && to?.url.pathname !== '/login') {
      cancel()
      goto('/login')
    }
  })
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
