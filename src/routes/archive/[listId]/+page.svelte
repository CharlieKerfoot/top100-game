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
    <a href="/archive" class="back-link">&larr; Archive</a>
    <div class="category-header">
      <h2>{list!.name}</h2>
      <p class="date-line">Archive &middot; Day #{dayNumber}</p>
    </div>
  </header>

  {#if phase === "playing"}
    <GamePlay
      list={list!}
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
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }

  .date-line {
    font-size: 0.8rem;
    color: #888;
    margin-top: 0.25rem;
  }
</style>
