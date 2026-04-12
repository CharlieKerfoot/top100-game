<script lang="ts">
  import { goto } from "$app/navigation";
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

  const list = getDailyList();
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

  // Game state
  let phase = $state<"playing" | "results">("playing");
  let score = $state(0);
  let strikes = $state(0);
  let guessValue = $state("");
  let foundItems = $state<{ rank: number; name: string; points: number }[]>([]);
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
      showFeedback("strike");
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
    foundItems = [...foundItems, { rank, name: match.original, points }].sort(
      (a, b) => b.rank - a.rank,
    );

    showFeedback(rank >= 50 ? "gold" : "gray", rank);
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
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
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
  const gridText = $derived(generateShareGrid(guessedRanks));
</script>

<div class="app">
  <header>
    <a href="/" class="back-link">&larr; Home</a>
    <div class="category-header">
      <h2>{list.name}</h2>
      <p class="date-line">{dateDisplay} &middot; #{dayNumber}</p>
    </div>
  </header>

  {#if phase === "playing"}
    <div class="game">
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
          hints={list.hints ?? list.items}
          bind:value={guessValue}
          placeholder="Type your guess..."
          onsubmit={handleGuess}
        />
      </div>

      {#if foundItems.length > 0}
        <div class="board">
          {#each foundItems as item}
            <div class="board-row">
              <span class="rank">#{item.rank}</span>
              <span class="name">{item.name}</span>
              <span class="points">+{item.points}</span>
            </div>
          {/each}
        </div>
      {:else}
        <div class="board">
          <div class="board-row empty">
            <span class="name">Name items from the Top 100 list...</span>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="results">
      <div class="result-card">
        <h3>Common Cents &middot; #{dayNumber}</h3>
        <div class="final-score">{score}</div>
        <div class="max-score">of 5,050 possible</div>
        {#if percentile !== undefined}
          <div class="percentile">Better than {percentile}% of players</div>
        {/if}
        {#if stats.streak > 0}
          <div class="streak-line">&#128293; {stats.streak}-day streak</div>
        {/if}
      </div>

      <div class="share-grid-container">
        <pre class="share-grid">{gridText}</pre>
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

      <button class="share-btn" onclick={handleShare}>
        {shareStatus === "copied" ? "Copied!" : "Share Result"}
      </button>

      {#if shareStatus === "fallback"}
        <div class="share-fallback">
          <p>Copy your result:</p>
          <textarea readonly rows="12">{shareText}</textarea>
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
  .gold-pop .big {
    animation: goldPop 0.4s ease-out;
    color: #b8860b;
  }

  .gray-pop .big {
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

  /* ─── GUESS AREA ─── */
  .guess-area {
    margin-bottom: 1rem;
  }

  /* ─── BOARD ─── */
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
</style>
