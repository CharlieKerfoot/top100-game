<script lang="ts">
  import { lists } from "$lib/lists/index";
  import { getArchiveListIds, getArchiveResult } from "$lib/daily";
  import { SITE_URL, GAME_NAME } from "$lib/seo";

  const listById = new Map(lists.map((l) => [l.id, l]));

  // Newest-first: the most recent past daily is at the top.
  const entries = $derived.by(() => {
    const ids = getArchiveListIds();
    return ids
      .map((id, i) => {
        const list = listById.get(id);
        if (!list) return null;
        const result = getArchiveResult(id);
        return { list, dayNumber: i + 1, playedScore: result?.score };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null)
      .reverse();
  });
</script>

<svelte:head>
  <title>Archive | {GAME_NAME}</title>
  <meta
    name="description"
    content="Play past daily lists. Each list can be played once."
  />
  <link rel="canonical" href="{SITE_URL}/archive" />
</svelte:head>

<div class="app">
  <header>
    <a href="/" class="back-link">&larr; Home</a>
    <div class="category-header">
      <h2>Archive</h2>
      <p class="tagline">Past dailies. One play per list.</p>
    </div>
  </header>

  {#if entries.length === 0}
    <div class="empty">
      <p>The archive is empty — today is Day 1 of Common Cents.</p>
      <a class="play-link" href="/daily">Play today's daily &rarr;</a>
    </div>
  {:else}
    <ul class="archive-list">
      {#each entries as entry}
        <li class="archive-row" class:played={entry.playedScore !== undefined}>
          <a href="/archive/{entry.list.id}">
            <div class="row-main">
              <span class="day-number">#{entry.dayNumber}</span>
              <span class="list-name">{entry.list.name}</span>
            </div>
            <div class="row-meta">
              {#if entry.playedScore !== undefined}
                <span class="played-badge">Played &middot; {entry.playedScore} pts</span>
              {:else}
                <span class="play-cta">Play &rarr;</span>
              {/if}
            </div>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .app {
    max-width: 640px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  header {
    margin-bottom: 1.5rem;
  }

  .back-link {
    display: inline-block;
    color: #777;
    text-decoration: none;
    font-size: 0.85rem;
    margin-bottom: 0.75rem;
  }

  .back-link:hover {
    color: var(--color-ink);
  }

  .category-header {
    text-align: center;
    border-bottom: 1px solid var(--color-gold);
    padding-bottom: 0.75rem;
  }

  .category-header h2 {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.6rem;
    font-weight: 700;
    margin: 0;
  }

  .tagline {
    font-size: 0.85rem;
    color: #888;
    margin-top: 0.25rem;
  }

  .empty {
    text-align: center;
    padding: 3rem 1rem;
    color: #777;
  }

  .empty p {
    margin-bottom: 1rem;
  }

  .play-link {
    color: var(--color-crimson);
    font-weight: 600;
    text-decoration: none;
  }

  .archive-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .archive-row a {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid #ede0c4;
    text-decoration: none;
    color: var(--color-ink);
    transition: background 0.15s;
  }

  .archive-row a:hover {
    background: rgba(139, 0, 0, 0.04);
  }

  .archive-row.played a {
    opacity: 0.85;
  }

  .row-main {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    min-width: 0;
  }

  .day-number {
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 700;
    color: var(--color-gold);
    font-size: 0.9rem;
    min-width: 3rem;
  }

  .list-name {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .row-meta {
    font-size: 0.85rem;
    flex-shrink: 0;
    margin-left: 1rem;
  }

  .play-cta {
    color: var(--color-crimson);
    font-weight: 600;
  }

  .played-badge {
    color: #888;
    font-size: 0.8rem;
  }
</style>
