<script lang="ts">
  import favicon from '$lib/assets/favicon.svg'
  import { auth } from '$lib/stores/auth.svelte'
  import { beforeNavigate, goto } from '$app/navigation'
  import { resolve } from '$app/paths'

  let { children } = $props()

  beforeNavigate(({ to, cancel }) => {
    if (!auth.loggedIn && to?.url.pathname !== '/login') {
      cancel()
      goto(resolve('/login'))
    }
  })
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
