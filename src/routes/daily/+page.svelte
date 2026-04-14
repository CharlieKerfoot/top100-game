<script lang="ts">
  import { goto } from "$app/navigation";
  import { tick } from "svelte";
  import Autocomplete from "$lib/Autocomplete.svelte";
  import { normalizeGuess } from "$lib/normalize";
  import {
    getDailyList,
    getDayNumber,
    getTodayKey,
    loadDailyStats,
    recordGame,
    generateShareText,
    generateShareGrid,
    type DailyStats,
    type DayResult,
  } from "$lib/daily";
  import { getListSize, getMaxScore } from "$lib/lists/index";
  import { SITE_URL, GAME_NAME, ogImageUrl } from "$lib/seo";
  import { getAudioCtx, playGuessSound, playStrikeSound } from "$lib/sounds";

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
    timeZone: "UTC",
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
  let foundItems = $state<{ rank: number; name: string; points: number }[]>([]);
  type GuessEntry =
    | { type: "hit"; rank: number; name: string; points: number; guess: string }
    | { type: "strike"; guess: string };
  let guessHistory = $state<GuessEntry[]>([]);
  let guessedRanks = $state<number[]>([]);
  let lastFeedback = $state<{
    type: "gold" | "gray" | "strike";
    rank?: number;
  } | null>(null);
  let feedbackTimeout = $state<ReturnType<typeof setTimeout> | null>(null);
  let debouncing = $state(false);
  let showAllAnswers = $state(false);

  // Server stats (after game over)
  let percentile = $state<number | undefined>(undefined);
  let avgScore = $state<number | undefined>(undefined);
  let playCount = $state<number | undefined>(undefined);
  let histogram = $state<number[]>([]);

  // Share state
  let shareStatus = $state<"idle" | "copied" | "fallback">("idle");
  let shareText = $state("");

  // Countdown
  let countdown = $state("");

  // Already-played check
  const initialStats = loadDailyStats();
  const previousResult = initialStats.history[todayKey];
  let stats = $state<DailyStats>(initialStats);

  if (previousResult) {
    phase = "results";
    score = previousResult.score;
    guessedRanks = previousResult.guessedRanks;
    // Rebuild foundItems from guessedRanks
    const restored: { rank: number; name: string; points: number }[] = [];
    for (const rank of previousResult.guessedRanks) {
      restored.push({ rank, name: list.items[rank - 1], points: rank });
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
    foundItems = [...foundItems, { rank, name: match.original, points }];
    guessHistory = [
      { type: "hit", rank, name: match.original, points, guess: value },
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

  function handleShare() {
    const text = generateShareText({
      dayNumber,
      listName: list.name,
      score,
      streak: stats.streak,
      guessedRanks,
      percentile,
      listSize,
    });
    shareText = text;

    navigator.clipboard.writeText(text).then(
      () => {
        shareStatus = "copied";
      },
      () => {
        shareStatus = "fallback";
      },
    );
  }

  // Countdown timer
  $effect(() => {
    if (phase !== "results") return;
    const update = () => {
      const now = new Date();
      const tomorrow = new Date(
        now.getFullYear(), now.getMonth(), now.getDate() + 1,
      );
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      countdown = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  });

  const maxHistogram = $derived(Math.max(...histogram, 1));
  const gridText = $derived(generateShareGrid(guessedRanks, listSize));
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
    <div class="results">
      <div class="result-card">
        <h3>Common Cents &middot; #{dayNumber}</h3>
        <div class="final-score">{score}</div>
        <div class="max-score">of {maxPossible.toLocaleString()} possible</div>
        {#if percentile !== undefined}
          <div class="percentile">Better than {percentile}% of players</div>
        {/if}
        {#if stats.streak > 0}
          <div class="streak-line">&#128293; {stats.streak}-day streak</div>
        {/if}
      </div>

      {#if histogram.length > 0 && histogram.some((v) => v > 0)}
        <div class="histogram">
          <h4>Score Distribution</h4>
          <div class="histogram-bars">
            {#each histogram as count, i}
              <div class="histogram-bar-wrapper">
                <div
                  class="histogram-bar"
                  style="height: {Math.max(
                    (count / maxHistogram) * 100,
                    count > 0 ? 4 : 0,
                  )}%"
                ></div>
                <span class="histogram-label">{i * 500}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <div class="share-grid-container">
        <pre class="share-grid">{gridText}</pre>
      </div>

      <button class="share-btn" onclick={handleShare}>
        {shareStatus === "copied" ? "Copied!" : "Share Result"}
      </button>

      {#if shareStatus === "fallback"}
        <div class="share-fallback">
          <p>Copy your result:</p>
          <textarea readonly rows="12">{shareText}</textarea>
        </div>
      {/if}

      <button
        class="answers-toggle"
        onclick={() => (showAllAnswers = !showAllAnswers)}
      >
        {showAllAnswers ? "Hide" : "Show"} All Answers
      </button>

      {#if showAllAnswers}
        <div class="all-answers">
          <div class="all-answers-header">
            <span class="all-answers-title">{list.description}</span>
            <span class="all-answers-count">{foundItems.length} of {listSize} found</span>
          </div>
          <div class="dt-slots" style="grid-template-columns: repeat({gridCols}, 1fr); grid-template-rows: repeat({gridRows}, auto)">
            {#each Array(listSize) as _, i}
              {@const item = guessedMap.get(i)}
              <div class="dt-slot" class:filled={!!item} class:dt-slot-large={listSize <= 50} class:dt-slot-missed={!item}>
                <span class="dt-slot-rank">{i + 1}.</span>
                {#if item}
                  <span class="dt-slot-name">{item.name}</span>
                  <span class="dt-slot-points">+{item.points}</span>
                {:else}
                  <span class="dt-slot-name dt-slot-missed-name">{list.items[i]}</span>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <button class="play-friends-btn" onclick={() => goto("/")}>
        Play with Friends &rarr;
      </button>

      <div class="countdown">
        Next daily in <span class="time">{countdown}</span>
      </div>
    </div>
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

  /* ─── RESULTS ─── */
  .results {
    text-align: center;
  }

  .result-card {
    border: 2px solid var(--color-ink);
    padding: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .result-card h3 {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.75rem;
  }

  .final-score {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 3rem;
    font-weight: 900;
    line-height: 1;
  }

  .max-score {
    font-size: 0.85rem;
    color: #888;
    margin-top: 0.25rem;
  }

  .percentile {
    margin-top: 0.75rem;
    padding: 0.5rem;
    background: rgba(139, 0, 0, 0.06);
    font-size: 0.9rem;
    font-weight: 600;
  }

  .streak-line {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #555;
  }

  /* ─── SHARE GRID ─── */
  .share-grid-container {
    margin-bottom: 1.25rem;
  }

  .share-grid {
    font-size: 1rem;
    line-height: 1.2;
    letter-spacing: 0.05em;
    margin: 0 auto;
    display: inline-block;
    text-align: left;
  }

  /* ─── HISTOGRAM ─── */
  .histogram {
    margin-bottom: 1.25rem;
    border: 1px solid var(--color-gold);
    padding: 1rem;
    background: var(--color-cream);
  }

  .histogram h4 {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.75rem;
    color: #555;
  }

  .histogram-bars {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 80px;
  }

  .histogram-bar-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    justify-content: flex-end;
  }

  .histogram-bar {
    width: 100%;
    background: var(--color-crimson);
    opacity: 0.7;
    min-width: 0;
  }

  .histogram-label {
    font-size: 0.55rem;
    color: #999;
    margin-top: 4px;
  }

  /* ─── BUTTONS ─── */
  .share-btn {
    display: block;
    width: 100%;
    padding: 0.85rem;
    border: 2px solid var(--color-ink);
    background: var(--color-ink);
    color: var(--color-parchment);
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .share-btn:hover {
    background: var(--color-cream);
    color: var(--color-ink);
  }

  .share-btn:focus-visible {
    outline: 2px solid var(--color-crimson);
    outline-offset: 2px;
  }

  .play-friends-btn {
    display: block;
    width: 100%;
    padding: 0.65rem;
    border: 1px solid var(--color-gold);
    background: transparent;
    color: #777;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.9rem;
    cursor: pointer;
    margin-bottom: 1rem;
  }

  .play-friends-btn:hover {
    border-color: var(--color-ink);
    color: var(--color-ink);
  }

  /* ─── SHARE FALLBACK ─── */
  .share-fallback {
    margin-bottom: 1rem;
  }

  .share-fallback p {
    font-size: 0.85rem;
    color: #777;
    margin-bottom: 0.5rem;
  }

  .share-fallback textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--color-gold);
    background: var(--color-cream);
    font-family: monospace;
    font-size: 0.8rem;
    resize: none;
    box-sizing: border-box;
  }

  /* ─── COUNTDOWN ─── */
  .countdown {
    text-align: center;
    font-size: 0.85rem;
    color: #888;
  }

  .countdown .time {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-ink);
    font-family: "Courier New", monospace;
  }

  /* ─── ALL ANSWERS ─── */
  .answers-toggle {
    display: block;
    width: 100%;
    padding: 0.65rem;
    border: 1px solid var(--color-gold);
    background: transparent;
    color: #777;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.9rem;
    cursor: pointer;
    margin-bottom: 0.75rem;
    transition: all 0.2s;
  }

  .answers-toggle:hover {
    border-color: var(--color-ink);
    color: var(--color-ink);
  }

  .all-answers {
    border: 1px solid var(--color-gold);
    background: var(--color-cream);
    padding: 0;
    margin-bottom: 1rem;
    text-align: left;
    overflow-x: hidden;
  }

  .all-answers-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--color-gold);
  }

  .all-answers-title {
    font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-ink);
  }

  .all-answers-count {
    font-size: 0.75rem;
    color: #888;
  }

  .all-answers .dt-slots {
    max-height: 60vh;
    overflow-y: auto;
  }

  .dt-slot-missed {
    opacity: 0.5;
  }

  .dt-slot-missed-name {
    font-style: italic;
    color: #999 !important;
    font-weight: 400 !important;
  }
</style>
