<script lang="ts">
  import { tick } from "svelte";
  import Autocomplete from "$lib/Autocomplete.svelte";
  import { normalizeGuess } from "$lib/normalize";
  import { getListSize } from "$lib/lists/index";
  import type { GameList } from "$lib/lists/types";
  import { playGuessSound, playStrikeSound } from "$lib/sounds";

  export type GuessEntry =
    | { type: "hit"; rank: number; name: string; points: number; guess: string; value?: string }
    | { type: "strike"; guess: string };

  export interface GameProgress {
    score: number;
    strikes: number;
    guessedRanks: number[];
    guessHistory: GuessEntry[];
  }

  export interface GameResult extends GameProgress {
    reason: "strike-out";
  }

  interface Props {
    list: GameList;
    /** Optional mid-game state to restore. */
    initial?: GameProgress;
    /** If true, show the first-time tooltip about scoring. Controlled by parent so different pages can opt in/out. */
    showOnboarding?: boolean;
    onDismissOnboarding?: () => void;
    onProgress?: (p: GameProgress) => void;
    onComplete: (r: GameResult) => void;
  }

  const {
    list,
    initial,
    showOnboarding = false,
    onDismissOnboarding,
    onProgress,
    onComplete,
  }: Props = $props();

  const listSize = getListSize(list);
  const gridCols = listSize <= 50 ? 2 : 4;
  const gridRows = Math.ceil(listSize / gridCols);
  const maxStrikes = 3;

  // Build normalized lookup: normalized -> { index, original }
  const itemLookup = new Map<string, { index: number; original: string }>();
  for (let i = 0; i < list.items.length; i++) {
    itemLookup.set(normalizeGuess(list.items[i]), {
      index: i,
      original: list.items[i],
    });
  }
  if (list.aliases) {
    for (const [alias, canonical] of Object.entries(list.aliases)) {
      const normalizedCanonical = normalizeGuess(canonical);
      const target = itemLookup.get(normalizedCanonical);
      if (target) {
        itemLookup.set(normalizeGuess(alias), target);
      }
    }
  }

  let score = $state(initial?.score ?? 0);
  let strikes = $state(initial?.strikes ?? 0);
  let guessValue = $state("");
  let guessedRanks = $state<number[]>(initial?.guessedRanks ?? []);
  let guessHistory = $state<GuessEntry[]>(initial?.guessHistory ?? []);
  let foundItems = $state<{ rank: number; name: string; points: number; value?: string }[]>(
    (initial?.guessedRanks ?? []).map((rank) => ({
      rank,
      name: list.items[rank - 1],
      points: rank,
      value: list.values?.[rank - 1],
    })),
  );
  let lastFeedback = $state<{ type: "gold" | "gray" | "strike"; rank?: number } | null>(null);
  let feedbackTimeout = $state<ReturnType<typeof setTimeout> | null>(null);
  let debouncing = $state(false);
  let ended = $state(false);

  const guessedMap = $derived(new Map(foundItems.map((item) => [item.rank - 1, item])));

  const availableHints = $derived.by(() => {
    const allHints = list.hints ?? list.items;
    const guessedCanonicals = new Set(foundItems.map((item) => item.name.toLowerCase()));
    return allHints.filter((h) => {
      const lower = h.toLowerCase();
      if (guessedCanonicals.has(lower)) return false;
      if (list.aliases) {
        const canonical = list.aliases[h];
        if (canonical && guessedCanonicals.has(canonical.toLowerCase())) return false;
      }
      return true;
    });
  });

  function emitProgress() {
    onProgress?.({ score, strikes, guessedRanks, guessHistory });
  }

  function handleGuess(value: string) {
    if (ended || debouncing) return;
    if (showOnboarding) onDismissOnboarding?.();

    debouncing = true;
    setTimeout(() => {
      debouncing = false;
    }, 100);

    const normalized = normalizeGuess(value);
    const match = itemLookup.get(normalized);

    if (!match) {
      strikes++;
      guessHistory = [{ type: "strike", guess: value }, ...guessHistory];
      showFeedback("strike");
      playStrikeSound();
      if (strikes >= maxStrikes) {
        end("strike-out");
      } else {
        emitProgress();
      }
      return;
    }

    const rank = match.index + 1;
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
    emitProgress();
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

  function end(reason: GameResult["reason"]) {
    if (ended) return;
    ended = true;
    onComplete({ score, strikes, guessedRanks, guessHistory, reason });
  }
</script>

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
          Rarer answers score more. #1 = 1pt, #{listSize} = {listSize}pts. Go obscure!
          <button class="onboarding-dismiss" onclick={() => onDismissOnboarding?.()}>&times;</button>
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
        Rarer answers score more. #1 = 1pt, #{listSize} = {listSize}pts. Go obscure!
        <button class="onboarding-dismiss" onclick={() => onDismissOnboarding?.()}>&times;</button>
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

<style>
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
    0% { transform: scale(1); }
    40% { transform: scale(1.3); color: #daa520; }
    100% { transform: scale(1); }
  }

  @keyframes grayPop {
    0% { transform: scale(1); }
    40% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }

  @keyframes redShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .guess-area {
    margin-bottom: 1rem;
  }

  .found-count {
    text-align: center;
    font-size: 0.8rem;
    color: var(--color-crimson);
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

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
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
