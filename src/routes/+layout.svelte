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

<style>
  @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap");

  :global(body) {
    margin: 0;
    font-family: "Source Serif 4", Georgia, "Times New Roman", serif;
    background: #f5e6c8;
    color: #1a1a1a;
    min-height: 100vh;
  }

  @media (prefers-reduced-motion: reduce) {
    :global(*) {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
