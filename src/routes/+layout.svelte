<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import { createMultiplayerState } from '$lib/multiplayer.svelte';
  import { setContext } from 'svelte';

  let { children } = $props();

  const mp = createMultiplayerState();
  setContext('mp', mp);
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
