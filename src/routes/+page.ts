import { redirect } from '@sveltejs/kit'
import { auth } from '$lib/stores/auth.svelte'
import { browser } from '$app/environment'

export function load() {
  if (browser && !auth.loggedIn) {
    redirect(307, '/login')
  }
}
