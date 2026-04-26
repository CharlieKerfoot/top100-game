## Skill routing
When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.


Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

## List topics

The 10 list topics are **final** and must not be changed, added to, or removed:

`entertainment`, `education`, `film & tv`, `geography`, `internet`, `misc`, `business`, `music`, `sports`, `food`

Additionally, `new` and `top50` are meta-topics describing list format, not content categories.

When creating new lists, assign one or two of the above topics. If a list doesn't fit any specific topic, use `misc`. Never introduce new topics.

## Lists and Hints
Hints are search bar autocomplete suggestions. There must be far more possible suggestions than actual answers otherwise the game is too easy. It should not be difficult to get a strike.

For Top 100 Lists, there should be at the very least 500+ hints (for fixed groups like countries, every possible answer is adequate). The aim should really be for 750-1000 if possible.
For Top 50 Lists, the bare minimum should be 250. Again, aim for at least 500 is possible.

Make sure that all hints are unique (no duplicates) and don't repeat with difference in punctuation or capitalization either.

## Adding a new list — checklist

Follow every rule below when creating or modifying a list. Guesses are matched via `normalizeGuess()` which strips diacritics, lowercases, and removes all non-alphanumeric characters.

### No duplicate items
No two items in the `items` array may normalize to the same string. For example, "password" and "Password" are duplicates. If the source data has two entries that normalize identically (e.g. an original and a revival), disambiguate them (e.g. "Cabaret" and "Cabaret (Revival)").

### Every item must appear in hints
Every single item in `items` must have a matching entry in the `hints` array (matching after normalization). If a player can't find an item via autocomplete, the game is broken.

### No strike-bait hints
A "strike-bait" hint is a hint that a reasonable player would select expecting it to match an item, but whose normalized form doesn't match any item — causing a strike. Common patterns:
- **Alternate names:** "Harry Potter" in hints when the item is "Wizarding World"
- **Missing prefix:** "Hunger Games" when the item is "The Hunger Games"
- **Year/country tags:** "Chicago (2002)" when the item is "Chicago"
- **Sub-variants:** "Ford F-150" when the item is "Ford F-Series"
- **City suffixes:** "Willis Tower Chicago" when the item is "Willis Tower"
- **Short names:** "Beautiful" when the item is "Beautiful: The Carole King Musical"
- **`&` vs `and`:** "Fast and Furious" when the item is "Fast & Furious" (normalization strips `&` but keeps `and`)

Fix strike-bait by adding an entry to the `aliases` object: `{ "Strike-Bait Hint": "Actual Item Name" }`. The server normalizes both sides when matching, so the alias value doesn't need to be an exact string match — just close enough to normalize identically to the item.

### Values array must match items
If a list has a `valueLabel`, it must have a `values` array with exactly the same length as `items`. Each value corresponds to the item at the same index.

### Hints must be unique
No two hints should normalize to the same string. Check for duplicates caused by punctuation differences, casing, or diacritics (e.g. "Beyoncé" and "Beyonce").

### Aliases point to real items
Every value in the `aliases` object must normalize-match to an actual item in `items`. An alias pointing to a non-existent item silently fails.

## Daily schedule — FROZEN

The daily game's list order is defined by `src/lib/lists/daily-schedule.ts`. It is an append-only array of list ids. Day N's list is `dailySchedule[N - 1]`.

**Invariants (never violate):**
- Never reorder entries. Never rename. Never delete. Players who played day N played the list at index N-1, and that must never change across deploys — the server's daily stats, users' localStorage history, and streak counters all assume stability.
- A list appears in the schedule at most once. No list ever repeats as a daily.
- Every id in `src/lib/lists/index.ts` must appear in the schedule exactly once. Every id in the schedule must resolve to a real list. `bun run scripts/validate-lists.ts` enforces this and fails the build if violated.

**When adding a new list, run this workflow:**
1. Create the list file under `src/lib/lists/` and register it in `src/lib/lists/index.ts`.
2. `bun run scripts/gen-schedule.ts` — preview which ids will be appended.
3. `bun run scripts/gen-schedule.ts --append` — append the new ids to `daily-schedule.ts`. Existing entries are untouched.
4. `bun run scripts/validate-lists.ts` — confirm 0 errors (schedule integrity + per-list rules).
5. Commit `index.ts`, the new list file(s), **and** `daily-schedule.ts` together in the same commit. Splitting them will fail validation on the intermediate commit.

**Do not** edit `daily-schedule.ts` by hand to reorder. If you genuinely need a specific list on a specific future day (launch event, holiday tie-in, etc.), discuss first — the correct move is usually to append in a way that lands it on the target day, not to rewrite history.
