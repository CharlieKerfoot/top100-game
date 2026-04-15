<script lang="ts">
  import { goto } from "$app/navigation";
  import { generateShareText, generateShareGrid, type DailyStats } from "$lib/daily";
  import { playCountTick, playCelebrationSound } from "$lib/sounds";
  import type { GameList } from "$lib/lists/types";
  import { SITE_URL, GAME_NAME, ogImageUrl } from "$lib/seo";

  interface Props {
    score: number;
    maxPossible: number;
    percentile: number | undefined;
    avgScore: number | undefined;
    playCount: number | undefined;
    stats: DailyStats;
    histogram: number[];
    list: GameList;
    dayNumber: number;
    listSize: number;
    guessedRanks: number[];
    foundItems: { rank: number; name: string; points: number; value?: string }[];
    /** Whether this is a restored result (already played today) — skip celebration */
    restored?: boolean;
  }

  let {
    score,
    maxPossible,
    percentile,
    avgScore,
    playCount,
    stats,
    histogram,
    list,
    dayNumber,
    listSize,
    guessedRanks,
    foundItems,
    restored = false,
  }: Props = $props();

  const gridCols = listSize <= 50 ? 2 : 4;
  const gridRows = Math.ceil(listSize / gridCols);
  const gridText = $derived(generateShareGrid(guessedRanks, listSize));
  const maxHistogram = $derived(Math.max(...histogram, 1));

  // Build guessed map for all-answers grid
  const guessedMap = $derived(
    new Map(foundItems.map((item) => [item.rank - 1, item])),
  );

  // Missed items: top 3-5 highest-rank items not found
  const missedItems = $derived.by(() => {
    const guessedSet = new Set(guessedRanks);
    const missed: { rank: number; name: string; value?: string }[] = [];
    for (let i = listSize - 1; i >= 0; i--) {
      if (!guessedSet.has(i + 1)) {
        missed.push({
          rank: i + 1,
          name: list.items[i],
          value: list.values?.[i],
        });
      }
      if (missed.length >= 5) break;
    }
    return missed;
  });

  // Score count-up animation state
  let displayScore = $state(restored ? score : 0);
  let celebrationDone = $state(restored);
  let cardVisible = $state(restored);

  // Share state
  let shareStatus = $state<"idle" | "copied" | "fallback">("idle");
  let shareText = $state("");
  let showAllAnswers = $state(false);

  // Countdown
  let countdown = $state("");

  $effect(() => {
    const update = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
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

  // Score count-up animation
  $effect(() => {
    if (restored || score === 0) {
      displayScore = score;
      celebrationDone = true;
      cardVisible = true;
      return;
    }

    let frame: number;
    const duration = Math.min(2500, Math.max(800, score * 2));
    const startTime = performance.now();
    let lastTickScore = 0;
    const tickInterval = Math.max(30, Math.floor(2000 / Math.max(score / 50, 1)));

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      displayScore = Math.round(eased * score);

      // Play tick sounds at intervals
      if (displayScore - lastTickScore >= tickInterval || (progress === 1 && lastTickScore < score)) {
        playCountTick(progress);
        lastTickScore = displayScore;
      }

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        displayScore = score;
        playCelebrationSound();
        setTimeout(() => {
          celebrationDone = true;
          cardVisible = true;
        }, 300);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  });

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
      () => { shareStatus = "copied"; },
      () => { shareStatus = "fallback"; },
    );
  }
</script>

<div class="results">
  <!-- Score count-up -->
  <div class="result-card" class:card-enter={cardVisible && !restored}>
    <h3>Common Cents &middot; #{dayNumber}</h3>
    <div class="final-score" class:counting={!celebrationDone}>
      {displayScore.toLocaleString()}
    </div>
    <div class="max-score">of {maxPossible.toLocaleString()} possible</div>
    {#if celebrationDone && percentile !== undefined}
      <div class="percentile">Better than {percentile}% of players</div>
    {/if}
    {#if celebrationDone && stats.streak > 0}
      <div class="streak-line" class:streak-pulse={stats.streak > 1 && !restored}>
        &#128293; {stats.streak}-day streak
      </div>
    {/if}
  </div>

  <!-- Missed items reveal -->
  {#if celebrationDone && missedItems.length > 0}
    <div class="missed-section">
      <h4>You missed the big ones</h4>
      <div class="missed-items">
        {#each missedItems as item}
          <div class="missed-item">
            <span class="missed-rank">#{item.rank}</span>
            <span class="missed-name">{item.name}</span>
            {#if item.value}<span class="missed-value">{item.value}</span>{/if}
            <span class="missed-points">+{item.rank} pts</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if celebrationDone && histogram.length > 0 && histogram.some((v) => v > 0)}
    <div class="histogram">
      <h4>Score Distribution</h4>
      <div class="histogram-bars">
        {#each histogram as count, i}
          <div class="histogram-bar-wrapper">
            <div
              class="histogram-bar"
              style="height: {Math.max((count / maxHistogram) * 100, count > 0 ? 4 : 0)}%"
            ></div>
            <span class="histogram-label">{i * 500}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if celebrationDone}
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
                {#if list.values?.[i]}<span class="dt-slot-value">{list.values[i]}</span>{/if}
                <span class="dt-slot-points">+{item.points}</span>
              {:else}
                <span class="dt-slot-name dt-slot-missed-name">{list.items[i]}</span>
                {#if list.values?.[i]}<span class="dt-slot-value dt-slot-missed-value">{list.values[i]}</span>{/if}
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <button class="challenge-btn" onclick={() => goto(`/?challenge=${list.id}`)}>
      Challenge a Friend &rarr;
    </button>

    <div class="countdown">
      Next daily in <span class="time">{countdown}</span>
    </div>
  {/if}
</div>

<style>
  .results {
    text-align: center;
  }

  .result-card {
    border: 2px solid var(--color-ink);
    padding: 1.25rem;
    margin-bottom: 1.25rem;
    opacity: 1;
  }

  .result-card.card-enter {
    animation: cardSlideUp 0.4s ease-out;
  }

  @keyframes cardSlideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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

  .final-score.counting {
    color: var(--color-crimson);
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
    animation: fadeIn 0.3s ease-out;
  }

  .streak-line {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #555;
  }

  .streak-pulse {
    animation: streakPulse 0.6s ease-out;
  }

  @keyframes streakPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* ─── MISSED ITEMS ─── */
  .missed-section {
    margin-bottom: 1.25rem;
    border: 1px solid var(--color-gold);
    background: var(--color-cream);
    padding: 0.75rem;
    animation: fadeIn 0.4s ease-out;
  }

  .missed-section h4 {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
    color: #888;
  }

  .missed-items {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .missed-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.5rem;
    font-size: 0.88rem;
    border-bottom: 1px solid #ede0c4;
  }

  .missed-item:last-child {
    border-bottom: none;
  }

  .missed-rank {
    font-weight: 700;
    color: var(--color-crimson);
    min-width: 2.5rem;
  }

  .missed-name {
    flex: 1;
    text-align: left;
    font-weight: 500;
  }

  .missed-value {
    color: #996633;
    font-size: 0.78rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .missed-points {
    color: #888;
    font-size: 0.78rem;
    font-weight: 600;
    white-space: nowrap;
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

  .challenge-btn {
    display: block;
    width: 100%;
    padding: 0.65rem;
    border: 2px solid var(--color-crimson);
    background: transparent;
    color: var(--color-crimson);
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .challenge-btn:hover {
    background: var(--color-crimson);
    color: var(--color-parchment);
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

  .dt-slot-missed {
    opacity: 0.5;
  }

  .dt-slot-missed-name {
    font-style: italic;
    color: #999 !important;
    font-weight: 400 !important;
  }

  .dt-slot-value {
    color: #996633;
    font-size: 0.72rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .dt-slot-missed-value {
    color: #999 !important;
  }
</style>
