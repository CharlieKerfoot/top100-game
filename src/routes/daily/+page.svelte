<script lang="ts">
  import DailyResults from "$lib/DailyResults.svelte";
  import GamePlay, { type GameProgress, type GameResult } from "$lib/GamePlay.svelte";
  import {
    getDailyList,
    getDayNumber,
    getTodayKey,
    loadDailyStats,
    recordGame,
    loadInProgress,
    saveInProgress,
    clearInProgress,
    updateResultPercentile,
    type DailyStats,
  } from "$lib/daily";
  import { getListSize, getMaxScore } from "$lib/lists/index";
  import { SITE_URL, GAME_NAME, ogImageUrl } from "$lib/seo";

  const list = getDailyList();
  const listSize = getListSize(list);
  const maxPossible = getMaxScore(list);
  const dayNumber = getDayNumber();
  const todayKey = getTodayKey();
  const dateDisplay = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Already-played check. Ignore stored results for a different list than
  // today's (e.g. if the daily schedule changed under the user after they
  // played). Without this guard, ranks from the old list would be applied
  // to the new list's items.
  const initialStats = loadDailyStats();
  const rawPrevious = initialStats.history[todayKey];
  const previousResult =
    rawPrevious && rawPrevious.listId === list.id ? rawPrevious : undefined;
  let stats = $state<DailyStats>(initialStats);

  // Mid-game restore, only if the in-progress matches today's list.
  const initialProgress: GameProgress | undefined = (() => {
    if (previousResult) return undefined;
    const inProgress = loadInProgress();
    if (inProgress && inProgress.dateKey === todayKey && inProgress.listId === list.id) {
      return {
        score: inProgress.score,
        strikes: inProgress.strikes,
        guessedRanks: inProgress.guessedRanks,
        guessHistory: inProgress.guessHistory,
      };
    }
    if (inProgress) clearInProgress();
    return undefined;
  })();

  // Render phase.
  let phase = $state<"playing" | "results">(previousResult ? "results" : "playing");

  // Results state — populated when the game ends or restored from previousResult.
  let score = $state(previousResult?.score ?? 0);
  let guessedRanks = $state<number[]>(previousResult?.guessedRanks ?? []);
  let foundItems = $state<{ rank: number; name: string; points: number; value?: string }[]>(
    previousResult
      ? previousResult.guessedRanks
          .map((rank) => ({
            rank,
            name: list.items[rank - 1],
            points: rank,
            value: list.values?.[rank - 1],
          }))
          .sort((a, b) => b.rank - a.rank)
      : [],
  );
  let percentile = $state<number | undefined>(previousResult?.percentile);
  let avgScore = $state<number | undefined>(undefined);
  let playCount = $state<number | undefined>(undefined);
  let histogramEdges = $state<number[]>([]);
  let histogramCounts = $state<number[]>([]);

  // Whether this result was restored from localStorage (already played today)
  const isRestored = $derived(!!previousResult && phase === "results");

  // Onboarding tooltip — first-time-ever tip about scoring.
  const ONBOARDING_KEY = "onboarding_seen";
  let showOnboarding = $state(false);

  $effect(() => {
    if (typeof window === "undefined") return;
    if (phase !== "playing") return;
    if (previousResult) return;
    try {
      if (!window.localStorage.getItem(ONBOARDING_KEY)) {
        showOnboarding = true;
      }
    } catch {
      /* localStorage blocked */
    }
  });

  function dismissOnboarding() {
    showOnboarding = false;
    try {
      window.localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      /* localStorage blocked */
    }
  }

  function handleProgress(p: GameProgress) {
    saveInProgress({
      dateKey: todayKey,
      listId: list.id,
      score: p.score,
      strikes: p.strikes,
      guessedRanks: p.guessedRanks,
      guessHistory: p.guessHistory,
    });
  }

  function handleComplete(r: GameResult) {
    score = r.score;
    guessedRanks = r.guessedRanks;
    foundItems = r.guessedRanks
      .map((rank) => ({
        rank,
        name: list.items[rank - 1],
        points: rank,
        value: list.values?.[rank - 1],
      }))
      .sort((a, b) => b.rank - a.rank);

    stats = recordGame(r.score, list.id, r.guessedRanks.length, r.guessedRanks);
    clearInProgress();
    phase = "results";
    submitScore();
  }

  async function submitScore() {
    try {
      const res = await fetch("/api/daily/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId: list.id, score }),
      });
      if (res.ok) {
        const data = await res.json();
        percentile = data.percentile;
        avgScore = data.avgScore;
        playCount = data.playCount;
        if (typeof percentile === "number") {
          updateResultPercentile(todayKey, percentile);
        }
      }
    } catch {
      // Server unavailable, that's fine
    }
    fetchServerStats();
  }

  async function fetchServerStats() {
    try {
      const res = await fetch(`/api/daily/stats?listId=${encodeURIComponent(list.id)}`);
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

  // If restored from localStorage, fetch server stats so the histogram renders.
  if (previousResult) {
    fetchServerStats();
  }
</script>

<svelte:head>
  <title>Daily #{dayNumber} - {list.name} | {GAME_NAME}</title>
  <meta name="description" content="Daily challenge #{dayNumber}: {list.name}. {list.description}" />
  <link rel="canonical" href="{SITE_URL}/daily" />
  <meta property="og:title" content="Daily #{dayNumber} - {list.name} | {GAME_NAME}" />
  <meta property="og:description" content="Daily challenge #{dayNumber}: {list.name}. {list.description}" />
  <meta property="og:image" content={ogImageUrl({ list: list.id })} />
  <meta property="og:url" content="{SITE_URL}/daily" />
  <meta property="og:type" content="website" />
  <meta name="twitter:title" content="Daily #{dayNumber} - {list.name} | {GAME_NAME}" />
  <meta name="twitter:description" content="Daily challenge #{dayNumber}: {list.name}. {list.description}" />
  <meta name="twitter:image" content={ogImageUrl({ list: list.id })} />
</svelte:head>

<div class="app" class:has-game={phase === "playing"} class:has-results={phase === "results"}>
  <header>
    <div class="top-nav">
      <a href="/" class="back-link">&larr; Home</a>
      <a href="/archive" class="archive-link">Archive</a>
    </div>
    <div class="category-header">
      <h2>{list.name}</h2>
      <p class="date-line">{dateDisplay} &middot; #{dayNumber}</p>
    </div>
  </header>

  {#if phase === "playing"}
    <GamePlay
      {list}
      initial={initialProgress}
      {showOnboarding}
      onDismissOnboarding={dismissOnboarding}
      onProgress={handleProgress}
      onComplete={handleComplete}
    />
  {:else}
    <DailyResults
      {score}
      {maxPossible}
      {percentile}
      {avgScore}
      {playCount}
      {stats}
      edges={histogramEdges}
      counts={histogramCounts}
      {list}
      {dayNumber}
      {listSize}
      {guessedRanks}
      {foundItems}
      restored={isRestored}
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

  .back-link,
  .archive-link {
    display: inline-block;
    color: #777;
    text-decoration: none;
    font-size: 0.85rem;
  }

  .back-link:hover,
  .archive-link:hover {
    color: var(--color-ink);
  }

  .archive-link {
    font-weight: 600;
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
