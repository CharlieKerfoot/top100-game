---
title: "feat: Display stat values for guesses and near-miss rank feedback"
type: feat
status: active
date: 2026-04-11
---

# Display Stat Values for Guesses and Near-Miss Rank Feedback

## Overview

Two complementary enhancements to guess feedback:

1. **Stat values** — When a player guesses correctly, show the underlying data value alongside the rank (e.g., "India — #1! 1.43B people, +1 pts").
2. **Near-miss feedback** — When a player guesses something valid but outside the top 100, tell them how far off they were instead of just "Strike!" (e.g., "Logan Paul — #127, not in the top 100! Strike!").

## Proposed Solution

### Feature 1: Stat Values

**Data model change** — Add two optional fields to the `Category` interface:

```ts
// src/lib/categories/types.ts
export interface Category {
  id: string;
  name: string;
  description: string;
  tags: string[];
  items: string[];
  hints?: string[];
  values?: string[];      // parallel to items — e.g. ["1.43B", "$219B", "328M"]
  valueLabel?: string;    // e.g. "Population", "Net Worth", "Subscribers"
}
```

- `values` is a string array parallel to `items` (same length, same order). Strings allow flexible formatting ("$4.2B", "1.43B people", "287M streams").
- `valueLabel` is an optional column header used in the guessed-items grid.
- Both fields are optional so existing categories work without changes and new categories can omit them if values don't make sense.

**Server change** — In `server/socket.ts` `submit-guess` handler (~line 452), when a guess is a hit, include the value in the result:

```ts
// Extend GuessResult interface
interface GuessResult {
  guess: string;
  rank: number | null;
  points: number;
  isStrike: boolean;
  playerName: string;
  value?: string;       // NEW
  valueLabel?: string;  // NEW
}
```

When building a successful result:
```ts
const value = cat.values?.[foundIndex];
const valueLabel = cat.valueLabel;
result = { guess, rank, points, isStrike: false, playerName: player.name, value, valueLabel };
```

**Client changes** — Mirror the new fields in `src/lib/multiplayer.svelte.ts` `GuessResult` interface. Then update the display in `src/routes/[code]/+page.svelte` at every location that shows a successful guess result.

Also extend the `GuessedItem` and `GuessHistoryEntry` types to carry `value` so the guessed-items grid and history panel can show them too.

**UI locations to update (6 total):**

| Location | Current text | New text (when value exists) |
|----------|-------------|------------------------------|
| Desktop header result (line ~362) | `"— #5! +5 pts"` | `"— #5 (1.43B)! +5 pts"` |
| Desktop large result (line ~513) | `"— ranked #5!"` | `"— ranked #5 (1.43B)!"` |
| Desktop guessed grid (line ~533) | `#5 India PlayerName` | `#5 India 1.43B PlayerName` |
| Mobile header result (line ~993) | same as desktop header | same treatment |
| Mobile large result (line ~1200) | same as desktop large | same treatment |
| Mobile guessed grid (line ~1242) | same as desktop grid | same treatment |

History entries (lines ~1103, ~1263, ~1373) could optionally show values too, but they're compact — skip unless it looks good.

### Feature 2: Near-Miss Feedback

**Server change** — In `server/socket.ts` `submit-guess` handler, when a guess is a strike (not found in top 100 items AND not already guessed), check the hints array for a match:

```ts
// Inside the strike branch (line ~445), before building the result:
if (foundIndex < 0) {
  // Check hints for near-miss
  let hintRank: number | null = null;
  if (cat.hints) {
    for (let i = 0; i < cat.hints.length; i++) {
      if (normalizeGuess(cat.hints[i]) === normalized) {
        // Hints array = top 100 items + extras beyond 100
        // Items beyond index 99 are outside the top 100
        if (i >= 100) {
          hintRank = i + 1; // approximate rank
        }
        break;
      }
    }
  }
  result = { guess, rank: null, points: 0, isStrike: true, playerName: player.name, nearMissRank: hintRank };
}
```

**Important consideration:** The current hints arrays have the top 100 first, then extras beyond. But the extras aren't necessarily in rank order — they're just "plausible guesses." So we have two options:

- **Option A:** Just say "not in the top 100" for any hint match beyond 100 (no specific rank). Simplest, always accurate.
- **Option B:** Order the beyond-100 hints by rank and report the actual rank. Requires reordering existing hint data and maintaining rank order for future categories.

**Recommendation: Option A** for now. It's still useful feedback ("we recognized your guess, it's just not top 100") without requiring ranked hint data. The UI would show:

> "Logan Paul" — recognized but not in the top 100! Strike!

vs. an unrecognized guess:

> "asdfgh" — not in the top 100! Strike!

This keeps hint files as-is and is trivially correct.

**Data model addition:**

```ts
interface GuessResult {
  guess: string;
  rank: number | null;
  points: number;
  isStrike: boolean;
  playerName: string;
  value?: string;
  valueLabel?: string;
  nearMiss?: boolean;  // NEW — true if guess matched a hint but wasn't in top 100
}
```

**UI change** — In the 4 strike display locations, check `nearMiss`:

```svelte
{#if mp.lastResult.isStrike}
  {#if mp.lastResult.nearMiss}
    "..." — recognized, but not in the top 100! Strike!
  {:else}
    "..." — not in the top 100! Strike!
  {/if}
{/if}
```

Also update GuessHistoryEntry to carry `nearMiss` so history shows the distinction.

## Acceptance Criteria

- [ ] `Category` type has optional `values: string[]` and `valueLabel: string` fields (`src/lib/categories/types.ts`)
- [ ] `GuessResult` has optional `value`, `valueLabel`, and `nearMiss` fields (server + client)
- [ ] `GuessedItem` carries `value` for display in the board grid
- [ ] `GuessHistoryEntry` carries `value` and `nearMiss`
- [ ] Server populates `value`/`valueLabel` on successful guesses from `cat.values`
- [ ] Server populates `nearMiss: true` when a strike matches a hint beyond the top 100
- [ ] All 6 UI hit-display locations show the value when present
- [ ] All 4 UI strike-display locations differentiate near-miss from total miss
- [ ] History panel shows values for hits and near-miss indicator for strikes
- [ ] At least 2-3 existing categories get `values` populated as proof-of-concept (e.g., `most-populous-countries`, `forbes-billionaires`, `most-subscribed-youtube`)
- [ ] Categories without `values` render exactly as before (no regressions)
- [ ] `serializeGameState` in server includes new fields in emitted events

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/categories/types.ts` | Add `values?`, `valueLabel?` |
| `server/socket.ts` | Extend `GuessResult`, `GuessHistoryEntry`; update `submit-guess` handler; update `serializeGameState` |
| `src/lib/multiplayer.svelte.ts` | Extend `GuessResult`, `GuessedItem`, `GuessHistoryEntry` interfaces |
| `src/routes/[code]/+page.svelte` | Update ~10 UI locations for value display + near-miss feedback |
| `src/lib/categories/most-populous-countries.ts` | Add `values` + `valueLabel` |
| `src/lib/categories/forbes-billionaires.ts` | Add `values` + `valueLabel` |
| `src/lib/categories/most-subscribed-youtube.ts` | Add `values` + `valueLabel` |

## Implementation Order

1. **Types first** — Update `Category`, `GuessResult`, `GuessHistoryEntry`, `GuessedItem` interfaces in both server and client
2. **Server logic** — Update `submit-guess` handler and serialization
3. **Client state** — Update `multiplayer.svelte.ts` to handle new fields
4. **UI** — Update all display locations in `+page.svelte`
5. **Data** — Add `values`/`valueLabel` to a few categories as proof-of-concept
6. **Test** — Play through a game with a values-enabled category and verify display
