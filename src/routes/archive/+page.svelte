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
      <p class="tagline">Past dailies &middot; One play per list</p>
    </div>
  </header>

  {#if entries.length === 0}
    <div class="empty">
      <p>The archive is empty — today is Day 1 of Common Cents.</p>
      <a class="play-link" href="/daily">Play today's daily &rarr;</a>
    </div>
  {:else}
    <ul class="archive-grid">
      {#each entries as entry}
        {@const size = entry.list.size ?? 100}
        {@const topic = entry.list.topics?.[0]}
        <li class="archive-card" class:played={entry.playedScore !== undefined}>
          <a href="/archive/{entry.list.id}">
            <!-- Mobile: flat row (day + name | status) -->
            <div class="row-main">
              <span class="day-number">#{entry.dayNumber}</span>
              <span class="list-name">{entry.list.name}</span>
            </div>
            <div class="row-meta">
              {#if entry.playedScore !== undefined}
                <span class="played-badge"
                  >Played &middot; {entry.playedScore} pts</span
                >
              {:else}
                <span class="play-cta">Play &rarr;</span>
              {/if}
            </div>

            <!-- Desktop: card layout -->
            <div class="card-top">
              <span class="card-day">Day #{entry.dayNumber}</span>
              <span class="card-size">Top {size}</span>
            </div>
            <div class="card-body">
              <h3 class="card-name">{entry.list.name}</h3>
              {#if topic}
                <span class="topic-badge">{topic}</span>
              {/if}
            </div>
            <div class="card-footer">
              {#if entry.playedScore !== undefined}
                <span class="played-badge"
                  >Played &middot; {entry.playedScore} pts</span
                >
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

  @media (min-width: 900px) {
    .app {
      max-width: 1200px;
      padding: 2rem 2.5rem;
    }
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
    text-align: center;
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

  .archive-grid {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  /* ─── MOBILE: flat row layout ─── */
  .archive-card a {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid #ede0c4;
    text-decoration: none;
    color: var(--color-ink);
    transition:
      background 0.15s,
      border-color 0.15s;
    box-sizing: border-box;
  }

  .archive-card a:hover {
    background: rgba(139, 0, 0, 0.04);
  }

  .archive-card.played a {
    background: #f0ebe0;
    color: #8a7f6d;
  }

  .archive-card.played .day-number {
    color: #8a7f6d;
  }

  .archive-card.played .list-name {
    color: #8a7f6d;
    font-weight: 400;
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
    color: #a6772c;
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

  .card-top,
  .card-body,
  .card-footer {
    display: none;
  }

  .play-cta {
    color: var(--color-crimson);
    font-weight: 600;
  }

  .played-badge {
    color: #888;
    font-size: 0.8rem;
  }

  /* ─── DESKTOP: responsive card grid ─── */
  @media (min-width: 600px) {
    .archive-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .archive-card a {
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      gap: 0.6rem;
      border: 1px solid var(--color-gold);
      background: var(--color-cream);
      border-bottom: 1px solid var(--color-gold);
      padding: 1rem;
      height: 100%;
    }

    .archive-card a:hover {
      border-color: var(--color-crimson);
      background: rgba(139, 0, 0, 0.05);
    }

    .archive-card.played a {
      background: #ebe4d2;
      border-color: #d4c89f;
      border-style: dashed;
      opacity: 1;
    }

    .archive-card.played .card-day,
    .archive-card.played .card-name {
      color: #8a7f6d;
    }

    .archive-card.played .card-name {
      font-weight: 600;
    }

    .archive-card.played .topic-badge {
      color: #a59982;
    }

    .archive-card.played .card-footer {
      border-top-color: rgba(138, 127, 109, 0.3);
    }

    .row-main,
    .row-meta {
      display: none;
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 0.5rem;
    }

    .card-day {
      font-family: "Playfair Display", Georgia, serif;
      font-weight: 700;
      color: #a6772c;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .card-size {
      font-size: 0.68rem;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .card-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 0;
    }

    .card-name {
      font-family: "Playfair Display", Georgia, serif;
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0;
      line-height: 1.25;
      color: var(--color-ink);
    }

    .topic-badge {
      display: inline-block;
      font-size: 0.7rem;
      color: #996633;
      text-transform: capitalize;
      width: fit-content;
    }

    .card-footer {
      display: flex;
      justify-content: flex-end;
      font-size: 0.82rem;
      padding-top: 0.4rem;
      border-top: 1px solid rgba(205, 160, 95, 0.35);
    }

    .played-badge {
      font-size: 0.82rem;
    }
  }

  @media (min-width: 900px) {
    .archive-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
  }

  @media (min-width: 1200px) {
    .archive-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
