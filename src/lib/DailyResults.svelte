<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    generateShareText,
    generateShareGrid,
    type DailyStats,
  } from "$lib/daily";
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
    bucketSize: number;
    list: GameList;
    dayNumber: number;
    listSize: number;
    guessedRanks: number[];
    foundItems: {
      rank: number;
      name: string;
      points: number;
      value?: string;
    }[];
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
    bucketSize,
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
  const userBucket = $derived(
    bucketSize > 0
      ? Math.min(Math.floor(score / bucketSize), histogram.length - 1)
      : 0,
  );

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
    const tickInterval = Math.max(
      30,
      Math.floor(2000 / Math.max(score / 50, 1)),
    );

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      displayScore = Math.round(eased * score);

      // Play tick sounds at intervals
      if (
        displayScore - lastTickScore >= tickInterval ||
        (progress === 1 && lastTickScore < score)
      ) {
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
      () => {
        shareStatus = "copied";
      },
      () => {
        shareStatus = "fallback";
      },
    );
  }
</script>

<div class="results">
  <!-- SCORE CARD -->
  <div class="result-card" class:card-enter={cardVisible && !restored}>
    <h3>Common Cents &middot; #{dayNumber}</h3>
    <div class="score-row">
      <div class="final-score" class:counting={!celebrationDone}>
        {displayScore.toLocaleString()}
      </div>
      <div class="score-meta">
        <div class="max-score">of {maxPossible.toLocaleString()} possible</div>
        {#if celebrationDone && percentile !== undefined}
          <div class="percentile">Better than {percentile}% of players</div>
        {/if}
        {#if celebrationDone && stats.streak > 0}
          <div
            class="streak-line"
            class:streak-pulse={stats.streak > 1 && !restored}
          >
            &#128293; {stats.streak}-day streak
          </div>
        {/if}
      </div>
    </div>
  </div>

  {#if celebrationDone}
    <!-- BODY: two columns on desktop, stacked on mobile -->
    <div class="results-body">
      <div class="results-col results-col-left">
        {#if missedItems.length > 0}
          <div class="missed-section">
            <h4>Some Notable Misses</h4>
            <div class="missed-items">
              {#each missedItems as item}
                <div class="missed-item">
                  <span class="missed-rank">#{item.rank}</span>
                  <span class="missed-name">{item.name}</span>
                  {#if item.value}<span class="missed-value">{item.value}</span
                    >{/if}
                  <span class="missed-points">+{item.rank} pts</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div class="results-col results-col-right">
        {#if histogram.length > 0 && histogram.some((v) => v > 0)}
          {@const labelStep =
            histogram.length > 14 ? 4 : histogram.length > 8 ? 2 : 1}
          <div class="histogram">
            <h4>Players' Scores</h4>
            <div class="histogram-bars">
              {#each histogram as count, i}
                {@const isUser = i === userBucket}
                <div class="histogram-bar-wrapper">
                  <span
                    class="histogram-count"
                    class:histogram-count-user={isUser}
                  >
                    {count > 0 ? count : ""}
                  </span>
                  <div
                    class="histogram-bar"
                    class:histogram-bar-user={isUser}
                    style="height: {Math.max(
                      (count / maxHistogram) * 100,
                      count > 0 ? 3 : 0,
                    )}%"
                  ></div>
                </div>
              {/each}
            </div>
            <div class="histogram-labels">
              {#each histogram as _, i}
                <div class="histogram-label-slot">
                  {#if i % labelStep === 0}
                    <span class="histogram-label"
                      >{(i * bucketSize).toLocaleString()}</span
                    >
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- ALL ANSWERS: tight to the body above -->
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
          <span class="all-answers-count"
            >{foundItems.length} of {listSize} found</span
          >
        </div>
        <div
          class="dt-slots"
          style="grid-template-columns: repeat({gridCols}, 1fr); grid-template-rows: repeat({gridRows}, auto)"
        >
          {#each Array(listSize) as _, i}
            {@const item = guessedMap.get(i)}
            <div
              class="dt-slot"
              class:filled={!!item}
              class:dt-slot-large={listSize <= 50}
              class:dt-slot-missed={!item}
            >
              <span class="dt-slot-rank">{i + 1}.</span>
              {#if item}
                <span class="dt-slot-name">{item.name}</span>
                {#if list.values?.[i]}<span class="dt-slot-value"
                    >{list.values[i]}</span
                  >{/if}
                <span class="dt-slot-points">+{item.points}</span>
              {:else}
                <span class="dt-slot-name dt-slot-missed-name"
                  >{list.items[i]}</span
                >
                {#if list.values?.[i]}<span
                    class="dt-slot-value dt-slot-missed-value"
                    >{list.values[i]}</span
                  >{/if}
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- ACTION BUTTONS: pinned to bottom -->
    <div class="action-buttons">
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
        class="challenge-btn"
        onclick={() => goto(`/?challenge=${list.id}`)}
      >
        Challenge a Friend &rarr;
      </button>
    </div>
  {/if}
</div>

<style>
  .results {
    text-align: center;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* ─── SCORE CARD ─── */
  .result-card {
    border: 2px solid var(--color-ink);
    padding: 1.25rem;
    margin-bottom: 1.25rem;
    opacity: 1;
  }

  .result-card.card-enter {
    animation: cardSlideUp 0.4s ease-out;
  }

  .score-row {
    display: flex;
    flex-direction: column;
    align-items: center;
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

  .score-meta {
    text-align: center;
  }

  .max-score {
    font-size: 0.85rem;
    color: #888;
    margin-top: 0.25rem;
  }

  .percentile {
    margin-top: 0.5rem;
    padding: 0.35rem 0.75rem;
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
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.15);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* ─── TWO COLUMN BODY (desktop) ─── */
  .results-body {
    display: contents;
  }

  @media (min-width: 900px) {
    .score-row {
      flex-direction: row;
      justify-content: center;
      gap: 1.5rem;
    }

    .score-meta {
      text-align: left;
    }

    .results-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: stretch;
    }

    .results-col {
      display: flex;
      flex-direction: column;
    }
  }

  /* ─── MISSED ITEMS ─── */
  .missed-section {
    margin-bottom: 0.5rem;
    border: 1px solid var(--color-gold);
    background: var(--color-cream);
    padding: 0.75rem;
    animation: fadeIn 0.4s ease-out;
    flex: 1;
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

  /* ─── HISTOGRAM ─── */
  .histogram {
    margin-bottom: 0.5rem;
    border: 1px solid var(--color-gold);
    padding: 1rem 0.75rem 0.5rem;
    background: var(--color-cream);
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .histogram h4 {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
    color: #555;
    padding-left: 0.25rem;
  }

  .histogram-bars {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    flex: 1;
    min-height: 120px;
  }

  .histogram-bar-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    justify-content: flex-end;
    min-width: 0;
  }

  .histogram-count {
    font-size: 0.6rem;
    font-weight: 600;
    color: var(--color-gold);
    margin-bottom: 2px;
    line-height: 1;
  }

  .histogram-count-user {
    color: var(--color-crimson);
  }

  .histogram-bar {
    width: 100%;
    background: var(--color-gold);
    opacity: 0.8;
    min-width: 0;
    border-radius: 1px 1px 0 0;
  }

  .histogram-bar-user {
    background: var(--color-crimson);
    opacity: 1;
  }

  .histogram-labels {
    display: flex;
    gap: 2px;
    margin-top: 4px;
    border-top: 1px solid #ddd;
    padding-top: 4px;
  }

  .histogram-label-slot {
    flex: 1;
    text-align: center;
    min-width: 0;
  }

  .histogram-label {
    font-size: 0.55rem;
    color: #999;
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
    margin-bottom: auto;
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
    margin-bottom: 0.75rem;
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

  /* ─── ACTION BUTTONS ─── */
  .action-buttons {
    margin-top: auto;
    padding-top: 1rem;
    padding-bottom: 1.5rem;
  }

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
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .challenge-btn:hover {
    background: var(--color-crimson);
    color: var(--color-parchment);
  }

  /* ─── SHARE FALLBACK ─── */
  .share-fallback {
    margin-bottom: 0.5rem;
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

  /* ─── ANSWER GRID ─── */
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
