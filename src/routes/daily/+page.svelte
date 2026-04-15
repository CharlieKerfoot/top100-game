<script lang="ts">
  import { goto } from "$app/navigation";
  import { tick } from "svelte";
  import Autocomplete from "$lib/Autocomplete.svelte";
  import DailyResults from "$lib/DailyResults.svelte";
  import { normalizeGuess } from "$lib/normalize";
  import {
    getDailyList,
    getDayNumber,
    getTodayKey,
    loadDailyStats,
    recordGame,
    type DailyStats,
  } from "$lib/daily";
  import { getListSize, getMaxScore } from "$lib/lists/index";
  import { SITE_URL, GAME_NAME, ogImageUrl } from "$lib/seo";
  import { playGuessSound, playStrikeSound } from "$lib/sounds";

  const list = getDailyList();
  const listSize = getListSize(list);
  const maxPossible = getMaxScore(list);
  const gridCols = listSize <= 50 ? 2 : 4;
  const gridRows = Math.ceil(listSize / gridCols);
  const dayNumber = getDayNumber();
  const todayKey = getTodayKey();
  const dateDisplay = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Build normalized lookup: normalized -> { index, original }
  const itemLookup = new Map<string, { index: number; original: string }>();
  for (let i = 0; i < list.items.length; i++) {
    itemLookup.set(normalizeGuess(list.items[i]), {
      index: i,
      original: list.items[i],
    });
  }
  // Add aliases to the lookup
  if (list.aliases) {
    for (const [alias, canonical] of Object.entries(list.aliases)) {
      const normalizedCanonical = normalizeGuess(canonical);
      const target = itemLookup.get(normalizedCanonical);
      if (target) {
        itemLookup.set(normalizeGuess(alias), target);
      }
    }
  }

  // Game state
  let phase = $state<"playing" | "results">("playing");
  let score = $state(0);
  let strikes = $state(0);
  let guessValue = $state("");
  let foundItems = $state<{ rank: number; name: string; points: number; value?: string }[]>([]);
  type GuessEntry =
    | { type: "hit"; rank: number; name: string; points: number; guess: string; value?: string }
    | { type: "strike"; guess: string };
  let guessHistory = $state<GuessEntry[]>([]);
  let guessedRanks = $state<number[]>([]);
  let lastFeedback = $state<{
    type: "gold" | "gray" | "strike";
    rank?: number;
  } | null>(null);
  let feedbackTimeout = $state<ReturnType<typeof setTimeout> | null>(null);
  let debouncing = $state(false);

  // Server stats (after game over)
  let percentile = $state<number | undefined>(undefined);
  let avgScore = $state<number | undefined>(undefined);
  let playCount = $state<number | undefined>(undefined);
  let histogram = $state<number[]>([]);

  // Onboarding tooltip
  const ONBOARDING_KEY = 'onboarding_seen';
  let showOnboarding = $state(false);

  $effect(() => {
    if (typeof window === 'undefined') return;
    if (phase !== 'playing') return;
    if (previousResult) return;
    try {
      if (!window.localStorage.getItem(ONBOARDING_KEY)) {
        showOnboarding = true;
      }
    } catch { /* localStorage blocked */ }
  });

  function dismissOnboarding() {
    showOnboarding = false;
    try {
      window.localStorage.setItem(ONBOARDING_KEY, '1');
    } catch { /* localStorage blocked */ }
  }

  // Already-played check
  const initialStats = loadDailyStats();
  const previousResult = initialStats.history[todayKey];
  let stats = $state<DailyStats>(initialStats);

  if (previousResult) {
    phase = "results";
    score = previousResult.score;
    guessedRanks = previousResult.guessedRanks;
    // Rebuild foundItems from guessedRanks
    const restored: { rank: number; name: string; points: number; value?: string }[] = [];
    for (const rank of previousResult.guessedRanks) {
      restored.push({ rank, name: list.items[rank - 1], points: rank, value: list.values?.[rank - 1] });
    }
    restored.sort((a, b) => b.rank - a.rank);
    foundItems = restored;
    fetchServerStats();
  }

  const maxStrikes = 3;

  // Build a map for the 100-slot board (desktop)
  const guessedMap = $derived(
    new Map(foundItems.map((item) => [item.rank - 1, item])),
  );

  // Filter hints to remove any that match already-guessed items (by canonical name or alias)
  const availableHints = $derived.by(() => {
    const allHints = list.hints ?? list.items;
    const guessedCanonicals = new Set(
      foundItems.map((item) => item.name.toLowerCase()),
    );
    return allHints.filter((h) => {
      const lower = h.toLowerCase();
      // Check if this hint IS a guessed canonical name
      if (guessedCanonicals.has(lower)) return false;
      // Check if this hint is an alias for a guessed canonical name
      if (list.aliases) {
        const canonical = list.aliases[h];
        if (canonical && guessedCanonicals.has(canonical.toLowerCase())) return false;
      }
      return true;
    });
  });

  // ── Audio ──

  function handleGuess(value: string) {
    if (phase !== "playing" || debouncing) return;
    if (showOnboarding) dismissOnboarding();

    // Debounce
    debouncing = true;
    setTimeout(() => {
      debouncing = false;
    }, 100);

    const normalized = normalizeGuess(value);
    const match = itemLookup.get(normalized);

    if (!match) {
      // Strike
      strikes++;
      guessHistory = [{ type: "strike", guess: value }, ...guessHistory];
      showFeedback("strike");
      playStrikeSound();
      if (strikes >= maxStrikes) {
        endGame();
      }
      return;
    }

    const rank = match.index + 1; // 1-indexed

    // Already found
    if (guessedRanks.includes(rank)) return;

    const points = rank;
    score += points;
    guessedRanks = [...guessedRanks, rank];
    foundItems = [...foundItems, { rank, name: match.original, points, value: list.values?.[match.index] }];
    guessHistory = [
      { type: "hit", rank, name: match.original, points, guess: value, value: list.values?.[match.index] },
      ...guessHistory,
    ];

    showFeedback(rank >= 50 ? "gold" : "gray", rank);
    playGuessSound(rank, listSize);
    scrollToSlot(rank);
  }

  async function scrollToSlot(rank: number) {
    await tick();
    const slot = document.querySelector(`[data-slot="${rank - 1}"]`);
    slot?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function showFeedback(type: "gold" | "gray" | "strike", rank?: number) {
    if (feedbackTimeout) clearTimeout(feedbackTimeout);
    lastFeedback = { type, rank };
    feedbackTimeout = setTimeout(() => {
      lastFeedback = null;
    }, 800);
  }

  function endGame() {
    phase = "results";
    const updatedStats = recordGame(
      score,
      list.id,
      guessedRanks.length,
      guessedRanks,
    );
    stats = updatedStats;
    submitScore();
  }

  async function submitScore() {
    try {
      const res = await fetch("/api/daily/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayKey,
          listId: list.id,
          score,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        percentile = data.percentile;
        avgScore = data.avgScore;
        playCount = data.playCount;
      }
    } catch {
      // Server unavailable, that's fine
    }
    fetchServerStats();
  }

  async function fetchServerStats() {
    try {
      const res = await fetch("/api/daily/stats");
      if (res.ok) {
        const data = await res.json();
        histogram = data.scores ?? [];
        if (playCount === undefined) {
          playCount = data.playCount;
          avgScore = data.avgScore;
        }
      }
    } catch {
      // Server unavailable
    }
  }

  // Whether this result was restored from localStorage (already played today)
  const isRestored = $derived(!!previousResult && phase === "results");

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

<div class="app" class:has-game={phase === "playing"}>
  <header>
    <a href="/" class="back-link">&larr; Home</a>
    <div class="category-header">
      <h2>{list.name}</h2>
      <p class="date-line">{dateDisplay} &middot; #{dayNumber}</p>
    </div>
  </header>

  {#if phase === "playing"}
    <!-- ─── DESKTOP LAYOUT ─── -->
    <div class="game-desktop">
      <div class="dt-top">
        <span class="dt-category-label">{list.name}</span>
        <div class="dt-strikes">
          {#each Array(maxStrikes) as _, i}
            <span class="strike-dot" class:used={i < strikes}></span>
          {/each}
        </div>
        <div
          class="dt-score"
          class:gold-pop={lastFeedback?.type === "gold"}
          class:gray-pop={lastFeedback?.type === "gray"}
          class:red-shake={lastFeedback?.type === "strike"}
        >
          <span class="dt-score-value">{score}</span>
          <span class="dt-score-label">pts</span>
        </div>
        <div class="dt-guess-area">
          {#if showOnboarding}
            <div class="onboarding-tooltip">
              Rarer answers score more. #1 = 1pt, #97 = 97pts. Go obscure!
              <button class="onboarding-dismiss" onclick={dismissOnboarding}>&times;</button>
            </div>
          {/if}
          <Autocomplete
            hints={availableHints}
            bind:value={guessValue}
            placeholder="Type your guess..."
            onsubmit={handleGuess}
          />
        </div>
        <span class="dt-found-count">{foundItems.length} of {listSize}</span>
      </div>

      <div class="dt-body">
        <div class="dt-board">
          <div class="dt-board-header">
            <span class="dt-board-title">{list.description}</span>
            <span class="dt-board-count">{foundItems.length} of {listSize} identified</span>
          </div>
          <div class="dt-board-body">
            <div class="dt-slots" style="grid-template-columns: repeat({gridCols}, 1fr); grid-template-rows: repeat({gridRows}, auto)">
              {#each Array(listSize) as _, i}
                {@const item = guessedMap.get(i)}
                <div class="dt-slot" class:filled={!!item} class:dt-slot-large={listSize <= 50} data-slot={i}>
                  <span class="dt-slot-rank">{i + 1}.</span>
                  {#if item}
                    <span class="dt-slot-name">{item.name}</span>
                    {#if item.value}<span class="dt-slot-value">{item.value}</span>{/if}
                    <span class="dt-slot-points">+{item.points}</span>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── MOBILE LAYOUT ─── -->
    <div class="game-mobile">
      <div class="strikes">
        {#each Array(maxStrikes) as _, i}
          <span class="strike-dot" class:used={i < strikes}></span>
        {/each}
      </div>

      <div
        class="score-display"
        class:gold-pop={lastFeedback?.type === "gold"}
        class:gray-pop={lastFeedback?.type === "gray"}
        class:red-shake={lastFeedback?.type === "strike"}
      >
        <div class="big">{score}</div>
        <div class="label">Points</div>
      </div>

      <div class="guess-area">
        {#if showOnboarding}
          <div class="onboarding-tooltip">
            Rarer answers score more. #1 = 1pt, #97 = 97pts. Go obscure!
            <button class="onboarding-dismiss" onclick={dismissOnboarding}>&times;</button>
          </div>
        {/if}
        <Autocomplete
          hints={availableHints}
          bind:value={guessValue}
          placeholder="Type your guess..."
          onsubmit={handleGuess}
        />
      </div>

      <div class="found-count">{foundItems.length} of {listSize} found</div>

      {#if guessHistory.length > 0}
        <div class="board">
          {#each guessHistory as entry}
            {#if entry.type === "hit"}
              <div class="board-row">
                <span class="rank">#{entry.rank}</span>
                <span class="name">{entry.name}</span>
                {#if entry.value}<span class="board-value">{entry.value}</span>{/if}
                <span class="points">+{entry.points}</span>
              </div>
            {:else}
              <div class="board-row strike-row">
                <span class="strike-x">&#10060;</span>
                <span class="name strike-name">{entry.guess}</span>
                <span class="strike-label">Strike</span>
              </div>
            {/if}
          {/each}
        </div>
      {:else}
        <div class="board">
          <div class="board-row empty">
            <span class="name">Name items from the Top {listSize} list...</span>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <DailyResults
      {score}
      {maxPossible}
      {percentile}
      {avgScore}
      {playCount}
      {stats}
      {histogram}
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

    .app:has(.results) {
      max-width: 800px;
      padding: 1.5rem 2rem;
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

  /* ─── DESKTOP / MOBILE TOGGLE ─── */
  .game-desktop {
    display: none;
  }
  .game-mobile {
    display: block;
  }

  @media (min-width: 900px) {
    .game-desktop {
      display: flex;
      flex-direction: column;
    }
    .game-mobile {
      display: none;
    }
  }

  /* ═══════════════════════════════════════════
     DESKTOP LAYOUT
     ═══════════════════════════════════════════ */

  .dt-top {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    height: 2.5rem;
  }

  .dt-category-label {
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 900;
    font-size: 1.3rem;
    letter-spacing: 0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #555;
  }

  .dt-strikes {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .dt-score {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    white-space: nowrap;
  }

  .dt-score-value {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.8rem;
    font-weight: 900;
    line-height: 1;
  }

  .dt-score-label {
    font-size: 0.7rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .dt-guess-area {
    flex: 1;
  }

  .dt-found-count {
    font-size: 0.8rem;
    color: var(--color-crimson);
    font-weight: 600;
    white-space: nowrap;
  }

  .dt-body {
    display: flex;
  }

  /* ─── DESKTOP BOARD ─── */
  .dt-board {
    flex: 1;
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
    display: flex;
    flex-direction: column;
  }

  .dt-board-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 1rem;
    border-bottom: 2px solid var(--color-ink);
  }

  .dt-board-title {
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.8rem;
    font-style: italic;
    color: #666;
  }

  .dt-board-count {
    font-size: 0.8rem;
    color: var(--color-crimson);
    font-weight: 600;
  }

  .dt-board-body {
    flex: 1;
    overflow-y: auto;
    max-height: calc(100vh - 280px);
  }

  .dt-slots {
    display: grid;
    grid-auto-flow: column;
    gap: 0;
  }

  .dt-slot {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.75rem;
    border-bottom: 1px solid #ede0c4;
    font-size: 0.82rem;
    min-height: 1.4rem;
    transition: background 0.2s;
  }

  .dt-slot-large {
    padding: 0.4rem 0.75rem;
    font-size: 0.9rem;
    min-height: 1.8rem;
  }

  .dt-slot:last-child {
    border-bottom: none;
  }

  .dt-slot.filled {
    background: rgba(139, 0, 0, 0.04);
  }

  .dt-slot-rank {
    font-weight: 700;
    min-width: 1.8rem;
    font-size: 0.78rem;
    color: var(--color-gold);
  }

  .dt-slot.filled .dt-slot-rank {
    color: var(--color-crimson);
  }

  .dt-slot-name {
    flex: 1;
    min-width: 0;
    font-weight: 500;
    color: var(--color-ink);
    animation: slideIn 0.2s ease-out;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dt-slot-points {
    color: #888;
    font-size: 0.72rem;
    font-weight: 600;
    white-space: nowrap;
  }

  /* ═══════════════════════════════════════════
     MOBILE LAYOUT
     ═══════════════════════════════════════════ */

  /* ─── STRIKES ─── */
  .strikes {
    display: flex;
    gap: 6px;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .strike-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--color-crimson);
  }

  .strike-dot.used {
    background: var(--color-crimson);
  }

  /* ─── SCORE ─── */
  .score-display {
    text-align: center;
    margin-bottom: 1rem;
  }

  .score-display .big {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 2.5rem;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 10px;
  }

  .score-display .label {
    font-size: 0.7rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* ─── ANIMATED FEEDBACK ─── */
  .gold-pop .big,
  .gold-pop .dt-score-value {
    animation: goldPop 0.4s ease-out;
    color: #b8860b;
  }

  .gray-pop .big,
  .gray-pop .dt-score-value {
    animation: grayPop 0.3s ease-out;
  }

  .red-shake {
    animation: redShake 0.4s ease-out;
  }

  @keyframes goldPop {
    0% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.3);
      color: #daa520;
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes grayPop {
    0% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.15);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes redShake {
    0%,
    100% {
      transform: translateX(0);
    }
    20% {
      transform: translateX(-6px);
    }
    40% {
      transform: translateX(6px);
    }
    60% {
      transform: translateX(-4px);
    }
    80% {
      transform: translateX(4px);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ─── GUESS AREA ─── */
  .guess-area {
    margin-bottom: 1rem;
  }

  /* ─── FOUND COUNT ─── */
  .found-count {
    text-align: center;
    font-size: 0.8rem;
    color: var(--color-crimson);
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  /* ─── BOARD (mobile guess history) ─── */
  .board {
    margin-bottom: 1rem;
  }

  .board-row {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem 0.75rem;
    border-bottom: 1px solid #e8e0d0;
    font-size: 0.9rem;
  }

  .board-row .rank {
    color: var(--color-crimson);
    font-weight: 700;
    width: 40px;
  }

  .board-row .name {
    flex: 1;
  }

  .board-row .board-value {
    color: #996633;
    font-size: 0.8rem;
    font-weight: 600;
    margin-right: 0.5rem;
    white-space: nowrap;
  }

  .board-row .points {
    color: #888;
    font-weight: 600;
  }

  .board-row.empty {
    color: #bbb;
    font-style: italic;
    justify-content: center;
  }

  .board-row.strike-row {
    background: rgba(139, 0, 0, 0.04);
  }

  .strike-x {
    width: 40px;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
  }

  .strike-name {
    color: #999;
    font-style: italic;
  }

  .strike-label {
    color: var(--color-crimson);
    font-weight: 600;
    font-size: 0.8rem;
  }

  /* ─── ONBOARDING TOOLTIP ─── */
  .onboarding-tooltip {
    background: var(--color-ink);
    color: var(--color-parchment);
    padding: 0.5rem 0.75rem;
    font-size: 0.82rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: tooltipFadeIn 0.3s ease-out;
  }

  .onboarding-dismiss {
    background: none;
    border: none;
    color: var(--color-parchment);
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0 0.25rem;
    opacity: 0.7;
    line-height: 1;
  }

  .onboarding-dismiss:hover {
    opacity: 1;
  }

  @keyframes tooltipFadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
