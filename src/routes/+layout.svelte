<script lang="ts">
  import favicon from '$lib/assets/favicon.svg'
  import { auth } from '$lib/stores/auth.svelte'
  import { goto, afterNavigate } from '$app/navigation'

  let { children } = $props()

  afterNavigate(({ to }) => {
    if (!auth.loggedIn && to?.url.pathname !== '/login') {
      goto('/login')
    }
  })
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
