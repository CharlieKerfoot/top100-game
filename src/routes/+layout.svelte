<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import { createMultiplayerState } from '$lib/multiplayer.svelte';
  import { setContext } from 'svelte';
  import { GAME_NAME, SITE_URL } from '$lib/seo';

  let { children } = $props();

  const mp = createMultiplayerState();
  setContext('mp', mp);

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    if (import.meta.env.PROD) {
      navigator.serviceWorker.register('/service-worker.js');
    } else {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) reg.unregister();
      });
    }
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <meta property="og:site_name" content={GAME_NAME} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content={SITE_URL} />
</svelte:head>

{@render children()}

<style>
  @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap");

  :root {
    --color-ink: #1a1a1a;
    --color-parchment: #f5e6c8;
    --color-cream: #fffef2;
    --color-crimson: #8b0000;
    --color-gold: #d4c5a0;
  }

  :global(body) {
    margin: 0;
    font-family: "Source Serif 4", Georgia, "Times New Roman", serif;
    background: var(--color-parchment);
    color: var(--color-ink);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  :global(h1),
  :global(h2),
  :global(h3) {
    text-wrap: balance;
  }

  :global(p) {
    text-wrap: pretty;
  }

  :global(button) {
    transition-property: transform, background-color, color, border-color, box-shadow, opacity;
    transition-duration: 0.15s;
    transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
  }

  :global(button:not(:disabled):active) {
    transform: scale(0.96);
  }

  :global(a) {
    transition-property: transform, color, opacity;
    transition-duration: 0.15s;
    transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    :global(*) {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
