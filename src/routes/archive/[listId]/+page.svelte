<script lang="ts">
  import { page } from "$app/state";
  import { error } from "@sveltejs/kit";
  import DailyResults from "$lib/DailyResults.svelte";
  import GamePlay, { type GameResult } from "$lib/GamePlay.svelte";
  import {
    getDayNumberForList,
    isArchiveEligible,
    getArchiveResult,
    saveArchiveResult,
    updateArchivePercentile,
    type DailyStats,
  } from "$lib/daily";
  import { lists, getListSize, getMaxScore } from "$lib/lists/index";
  import { SITE_URL, GAME_NAME, ogImageUrl } from "$lib/seo";

  const listId = page.params.listId ?? "";
  const list = lists.find((l) => l.id === listId);

  if (!listId || !list || !isArchiveEligible(listId)) {
    // 404 for unknown listIds, today's listId, and future listIds.
    error(404, "Not found");
  }

  const listSize = getListSize(list!);
  const maxPossible = getMaxScore(list!);
  const dayNumber = getDayNumberForList(listId)!;

  // Empty stats — archive completion never touches the daily streak.
  const emptyStats: DailyStats = {
    streak: 0,
    maxStreak: 0,
    gamesPlayed: 0,
    bestScore: 0,
    history: {},
  };

  const existing = getArchiveResult(listId);

  let phase = $state<"playing" | "results">(existing ? "results" : "playing");
  let score = $state(existing?.score ?? 0);
  let guessedRanks = $state<number[]>(existing?.guessedRanks ?? []);
  let foundItems = $state<{ rank: number; name: string; points: number; value?: string }[]>(
    existing
      ? existing.guessedRanks
          .map((rank) => ({
            rank,
            name: list!.items[rank - 1],
            points: rank,
            value: list!.values?.[rank - 1],
          }))
          .sort((a, b) => b.rank - a.rank)
      : [],
  );
  let percentile = $state<number | undefined>(existing?.percentile);
  let avgScore = $state<number | undefined>(undefined);
  let playCount = $state<number | undefined>(undefined);
  let histogramEdges = $state<number[]>([]);
  let histogramCounts = $state<number[]>([]);

  const isRestored = $derived(!!existing && phase === "results");

  // Hard mode — persisted preference, shared with /daily.
  const HARD_MODE_KEY = "hard_mode";
  let hardMode = $state(false);
  if (typeof window !== "undefined") {
    try {
      hardMode = window.localStorage.getItem(HARD_MODE_KEY) === "1";
    } catch {
      /* localStorage blocked */
    }
  }
  $effect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HARD_MODE_KEY, hardMode ? "1" : "0");
    } catch {
      /* localStorage blocked */
    }
  });

  function handleComplete(r: GameResult) {
    score = r.score;
    guessedRanks = r.guessedRanks;
    foundItems = r.guessedRanks
      .map((rank) => ({
        rank,
        name: list!.items[rank - 1],
        points: rank,
        value: list!.values?.[rank - 1],
      }))
      .sort((a, b) => b.rank - a.rank);

    saveArchiveResult(listId, {
      score: r.score,
      guessedRanks: r.guessedRanks,
      completedAt: new Date().toISOString(),
    });

    phase = "results";
    submitScore();
  }

  async function submitScore() {
    try {
      const res = await fetch("/api/daily/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId, score }),
      });
      if (res.ok) {
        const data = await res.json();
        percentile = data.percentile;
        avgScore = data.avgScore;
        playCount = data.playCount;
        if (typeof percentile === "number") {
          updateArchivePercentile(listId, percentile);
        }
      }
    } catch {
      // Server unavailable
    }
    fetchServerStats();
  }

  async function fetchServerStats() {
    try {
      const res = await fetch(`/api/daily/stats?listId=${encodeURIComponent(listId)}`);
      if (res.ok) {
        const data = await res.json();
        histogramEdges = data.edges ?? [];
        histogramCounts = data.counts ?? [];
        if (playCount === undefined) {
          playCount = data.playCount;
          avgScore = data.avgScore;
        }
      }
    } catch {
      // Server unavailable
    }
  }

  // If restored, fetch server stats so the histogram renders.
  if (existing) {
    fetchServerStats();
  }
</script>

<svelte:head>
  <title>Archive #{dayNumber} - {list!.name} | {GAME_NAME}</title>
  <meta
    name="description"
    content="Archive Day #{dayNumber}: {list!.name}. Replay a past daily."
  />
  <link rel="canonical" href="{SITE_URL}/archive/{listId}" />
  <meta property="og:image" content={ogImageUrl({ list: listId })} />
</svelte:head>

<div class="app" class:has-game={phase === "playing"} class:has-results={phase === "results"}>
  <header>
    <div class="top-nav">
      <a href="/archive" class="back-link">&larr; Archive</a>
      {#if phase === "playing"}
        <button
          type="button"
          class="hard-mode-btn"
          class:hard-mode-on={hardMode}
          onclick={() => (hardMode = !hardMode)}
          aria-pressed={hardMode}
        >
          <span class="hard-mode-dot" aria-hidden="true"></span>
          Hard Mode:&nbsp;<span class="hard-mode-state">{hardMode ? "On" : "Off"}</span>
          <span class="hard-mode-info" aria-hidden="true">i</span>
          <span class="hard-mode-tooltip" role="tooltip">
            Hard mode hides autocomplete suggestions — you must type each answer exactly.
          </span>
        </button>
      {/if}
    </div>
    <div class="category-header">
      <h2>{list!.name}</h2>
      <p class="date-line">Archive &middot; Day #{dayNumber}</p>
    </div>
  </header>

  {#if phase === "playing"}
    <GamePlay
      list={list!}
      bind:hardMode
      onComplete={handleComplete}
    />
  {:else}
    <DailyResults
      {score}
      {maxPossible}
      {percentile}
      {avgScore}
      {playCount}
      stats={emptyStats}
      edges={histogramEdges}
      counts={histogramCounts}
      list={list!}
      {dayNumber}
      {listSize}
      {guessedRanks}
      {foundItems}
      restored={isRestored}
      isArchive={true}
    />
  {/if}
</div>

<style>
  .app {
    max-width: 480px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  @media (min-width: 900px) {
    .app.has-game {
      max-width: 1400px;
      padding: 1.5rem 2rem;
    }

    .app.has-results {
      max-width: 1200px;
      padding: 1.5rem 2.5rem 0;
      height: 100dvh;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
  }

  header {
    margin-bottom: 1.5rem;
  }

  .top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .back-link {
    display: inline-block;
    color: #777;
    text-decoration: none;
    font-size: 0.85rem;
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
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }

  .date-line {
    font-size: 0.8rem;
    color: #888;
    margin-top: 0.25rem;
  }

  .hard-mode-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
    color: var(--color-ink);
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 0.4rem 0.85rem;
    cursor: pointer;
    line-height: 1;
    transition:
      background 0.15s,
      border-color 0.15s,
      color 0.15s;
  }

  .hard-mode-btn:hover {
    border-color: var(--color-ink);
  }

  .hard-mode-btn.hard-mode-on {
    background: var(--color-crimson);
    border-color: var(--color-crimson);
    color: var(--color-parchment);
  }

  .hard-mode-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #c8bfa6;
    transition: background 0.15s;
  }

  .hard-mode-btn.hard-mode-on .hard-mode-dot {
    background: var(--color-gold);
  }

  .hard-mode-state {
    font-weight: 700;
  }

  .hard-mode-info {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1px solid currentColor;
    font-family: "Source Serif 4", Georgia, serif;
    font-style: italic;
    font-size: 0.68rem;
    line-height: 1;
    opacity: 0.7;
    margin-left: 0.1rem;
  }

  .hard-mode-tooltip {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: max-content;
    max-width: 260px;
    background: var(--color-ink);
    color: var(--color-parchment);
    padding: 0.55rem 0.7rem;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.4;
    white-space: normal;
    text-align: left;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
    z-index: 10;
  }

  .hard-mode-btn:hover .hard-mode-tooltip,
  .hard-mode-btn:focus-visible .hard-mode-tooltip {
    opacity: 1;
  }
</style>
