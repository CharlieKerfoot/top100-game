<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import {
    getAllTags,
    getFeaturedCategories,
    searchCategories,
    type Category,
  } from "$lib/categories/index";
  import { getMultiplayerState } from "$lib/multiplayer.svelte";
  import Autocomplete from "$lib/Autocomplete.svelte";

  const mp = getMultiplayerState();

  const routeCode = $derived((page.params.code ?? "").toUpperCase());

  // Join form state (shown when navigating to a party URL without being in it)
  let playerName = $state("");
  let partyInfo = $state<{
    exists: boolean;
    code: string;
    phase?: string;
    hostName?: string;
    playerCount?: number;
    categoryName?: string;
  } | null>(null);
  let checking = $state(true);

  // Check if party exists when we land on this route.
  // Wait for socketReady so we don't race with a rejoin that restores state.
  $effect(() => {
    if (!mp.socketReady) return; // wait for registered or rejoin before acting
    const code = routeCode;
    // Already in this party — no need to check
    if (mp.partyCode === code && mp.phase !== "home") {
      checking = false;
      return;
    }
    let active = true;
    checking = true;
    mp.checkParty(code).then((info) => {
      if (!active) return;
      partyInfo = info;
      checking = false;
    });
    return () => { active = false; };
  });

  const needsJoin = $derived(
    mp.partyCode !== routeCode || mp.phase === "home",
  );

  // Lobby category browser state
  let categorySearch = $state("");
  let activeTag = $state<string | null>("__featured__");
  let previewCategory = $state<Category | null>(null);
  let previewSearch = $state("");

  // Game state
  let guessInput = $state("");
  let showRules = $state(false);

  const sortedGuessed = $derived(
    [...mp.guessedItems].sort((a, b) => a.index - b.index),
  );

  const guessedMap = $derived(
    new Map(mp.guessedItems.map((g) => [g.index, g])),
  );

  const allTags = getAllTags();
  const filteredCategories = $derived.by(() => {
    if (activeTag === "__featured__" && !categorySearch.trim()) {
      return getFeaturedCategories();
    }
    return searchCategories(
      categorySearch,
      activeTag === "__featured__" ? null : activeTag,
    );
  });
  const filteredPreviewItems = $derived.by(() => {
    if (!previewCategory) return [];
    if (!previewSearch.trim())
      return previewCategory.items.map((item, i) => ({ item, rank: i + 1 }));
    const q = previewSearch.toLowerCase();
    return previewCategory.items
      .map((item, i) => ({ item, rank: i + 1 }))
      .filter(({ item }) => item.toLowerCase().includes(q));
  });

  function handleJoin() {
    if (!playerName.trim()) return;
    mp.joinParty(routeCode, playerName.trim());
  }

  function selectCategory(cat: Category) {
    mp.updateSettings({ categoryId: cat.id });
    previewCategory = null;
    previewSearch = "";
  }

  const availableHints = $derived.by(() => {
    const hints = mp.category.hints ?? mp.category.items;
    const guessedNames = new Set(
      mp.guessedItems.map((g) => g.name.toLowerCase()),
    );
    return hints.filter((h) => !guessedNames.has(h.toLowerCase()));
  });

  function handleSubmitGuess(val: string) {
    if (!val.trim() || mp.showResult || !mp.isMyTurn) return;
    mp.submitGuess(val.trim());
    guessInput = "";
  }

  let copied = $state(false);

  function copyCode() {
    navigator.clipboard.writeText(mp.partyCode);
    copied = true;
    setTimeout(() => { copied = false; }, 1500);
  }

</script>

<div class="app">
  <header>
    <div class="title-row">
      <div class="title-row-left">
        {#if mp.phase !== "lobby"}
          <button class="info-btn" onclick={() => (showRules = true)} title="How to play">i</button>
        {/if}
      </div>
      <a href="/" class="title-link"><h1>Common Cents</h1></a>
      <div class="title-row-right">
        {#if mp.phase === "lobby"}
          <div class="header-code-block">
            <span class="code-text">{mp.partyCode}</span>
            <button class="copy-btn" class:copied onclick={copyCode}>
              {copied ? "✓" : "Copy"}
            </button>
          </div>
        {/if}
      </div>
    </div>
    {#if !needsJoin && (mp.phase === "playing" || mp.phase === "results" || mp.phase === "sitting-out")}
      <div class="header-meta">
        <span class="header-mode"
          >{mp.mode === "strikes" ? "Strike" : "Turns"} Mode</span
        >
        <span class="header-code">{mp.partyCode}</span>
      </div>
    {/if}
  </header>

  {#if showRules}
    <div
      class="modal-overlay"
      onclick={() => (showRules = false)}
      role="presentation"
    >
      <div class="modal" onclick={(e) => e.stopPropagation()} role="dialog">
        <button class="modal-close" onclick={() => (showRules = false)}
          >&times;</button
        >
        <h2>How to Play</h2>
        <div class="rules-content">
          <p>
            Players take turns guessing items from a ranked list of 100. The
            closer to #100 your guess is, the more points it's worth.
          </p>
          <h3>Strike Mode</h3>
          <p>
            Each wrong guess earns a strike. Reach the strike limit and you're
            eliminated. Last player standing wins, or whoever has the most
            points when all 100 are found.
          </p>
          <h3>Turns Mode</h3>
          <p>
            Each player gets a fixed number of turns. Use them wisely &mdash;
            the player with the most points at the end wins.
          </p>
          <h3>Scoring</h3>
          <p>
            Points equal the item's rank: #1 = 1 point, #100 = 100 points.
            Higher-ranked (harder) items are worth more.
          </p>
        </div>
      </div>
    </div>
  {/if}

  {#if mp.error}
    <div class="error-banner">{mp.error}</div>
  {/if}

  <!-- ─── JOIN FORM (URL-based joining) ─── -->
  {#if needsJoin}
    <div class="join-screen">
      {#if checking}
        <div class="checking">Looking up party...</div>
      {:else if !partyInfo?.exists}
        <div class="not-found">
          <h2>Party Not Found</h2>
          <p>No party exists with the code <strong>{routeCode}</strong>.</p>
          <button class="start-btn" onclick={() => goto("/")}>Go Home</button>
        </div>
      {:else}
        <div class="party-preview">
          <h2>Join Party</h2>
          <div class="preview-info">
            <div class="preview-detail">
              <span class="preview-label">Host</span>
              <span class="preview-value">{partyInfo.hostName}</span>
            </div>
            <div class="preview-detail">
              <span class="preview-label">Category</span>
              <span class="preview-value">{partyInfo.categoryName}</span>
            </div>
            <div class="preview-detail">
              <span class="preview-label">Players</span>
              <span class="preview-value">{partyInfo.playerCount}/8</span>
            </div>
            <div class="preview-detail">
              <span class="preview-label">Status</span>
              <span class="preview-value">
                {#if partyInfo.phase === "lobby"}
                  Waiting in Lobby
                {:else if partyInfo.phase === "playing"}
                  Game In Progress
                {:else}
                  Viewing Results
                {/if}
              </span>
            </div>
          </div>
          {#if partyInfo.phase !== "lobby"}
            <div class="midgame-notice">
              This game is already in progress. You'll join as a spectator and can play in the next round.
            </div>
          {/if}
          <div class="setup-section">
            <label for="playerName">Your Name</label>
            <input
              id="playerName"
              type="text"
              bind:value={playerName}
              placeholder="Enter your name..."
              onkeydown={(e) => { if (e.key === "Enter") handleJoin(); }}
            />
            <button
              class="start-btn"
              disabled={!playerName.trim() || (partyInfo.playerCount ?? 0) >= 8}
              onclick={handleJoin}
            >
              {#if (partyInfo.playerCount ?? 0) >= 8}
                Party is Full
              {:else if !playerName.trim()}
                Enter your name first
              {:else if partyInfo.phase !== "lobby"}
                Join as Spectator
              {:else}
                Join Party
              {/if}
            </button>
          </div>
        </div>
      {/if}
    </div>

  <!-- ─── SITTING OUT SCREEN ─── -->
  {:else if mp.phase === "sitting-out"}
    <div class="sitting-out">
      <div class="sitting-out-banner">
        <div class="sitting-out-icon">&#128064;</div>
        <h2>Sitting This One Out</h2>
        <p>You joined while a game was in progress. Watch the action below and you'll be able to play in the next round!</p>
      </div>

      <div class="game">
        <div class="game-desktop">
          <div class="dt-top">
            <span class="dt-category-label">{mp.category.name}</span>
            <div class="dt-guess-area">
              {#if mp.showResult && mp.lastResult}
                <div
                  class="dt-result"
                  class:hit={!mp.lastResult.isStrike}
                  class:miss={mp.lastResult.isStrike}
                >
                  {#if mp.lastResult.isStrike}
                    <span><strong>{mp.lastResult.playerName}</strong> guessed "<strong>{mp.lastResult.guess}</strong>" &mdash; Strike!</span>
                  {:else}
                    <span><strong>{mp.lastResult.playerName}</strong> guessed "<strong>{mp.lastResult.guess}</strong>" &mdash; #{mp.lastResult.rank}! +{mp.lastResult.points} pts</span>
                  {/if}
                </div>
              {:else}
                <div class="dt-waiting">
                  Waiting for {mp.currentPlayer?.name ?? "..."}...
                </div>
              {/if}
            </div>
          </div>

          <div class="dt-body">
            <div class="dt-players">
              {#each mp.players as player}
                <div
                  class="dt-player"
                  class:active={player.id === mp.currentPlayerId}
                  class:eliminated={player.eliminated}
                  class:me={player.id === mp.myId}
                  class:sitting-out-player={player.sittingOut}
                >
                  <div class="dt-player-top">
                    <span class="dt-player-name">
                      {player.name}
                      {#if player.id === mp.myId}<span class="you-tag">you</span>{/if}
                    </span>
                    {#if player.sittingOut}
                      <span class="dt-player-spectating">Watching</span>
                    {:else if player.eliminated}
                      <span class="dt-player-out">Out</span>
                    {:else if player.id === mp.currentPlayerId}
                      <span class="dt-player-active">Playing</span>
                    {/if}
                  </div>
                  <div class="dt-player-score">{player.score}</div>
                  {#if !player.sittingOut}
                    <div class="dt-player-meta">
                      {#if mp.mode === "strikes"}
                        {#each Array(mp.maxStrikes) as _, s}
                          <span class="strike-dot" class:hit={s < player.strikes}>&#10060;</span>
                        {/each}
                      {:else}
                        {mp.maxTurns - player.guesses} turns left
                      {/if}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>

            <div class="dt-board">
              <div class="dt-board-header">
                <span class="dt-board-title">{mp.category.name}</span>
                <span class="dt-board-count">{mp.guessedItems.length} of 100 identified</span>
              </div>
              <div class="dt-board-body">
                <div class="dt-slots">
                  {#each Array(100) as _, i}
                    {@const item = guessedMap.get(i)}
                    <div class="dt-slot" class:filled={!!item}>
                      <span class="dt-slot-rank">{i + 1}.</span>
                      {#if item}
                        <span class="dt-slot-name">{item.name}</span>
                        <span class="dt-slot-by">{item.playerName}</span>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile spectator view -->
        <div class="game-mobile">
          <div class="game-header">
            <div class="category-badge">{mp.category.name}</div>
            <div class="mode-badge">{mp.mode === "strikes" ? "Strikes" : "Turns"} Mode</div>
            <div class="code-badge">{mp.partyCode}</div>
          </div>

          <div class="scoreboard">
            {#each mp.players as player}
              <div
                class="player-card"
                class:active={player.id === mp.currentPlayerId}
                class:eliminated={player.eliminated}
                class:me={player.id === mp.myId}
                class:sitting-out-player={player.sittingOut}
              >
                <div class="player-name">
                  {player.name}
                  {#if player.id === mp.myId}<span class="you-tag">you</span>{/if}
                </div>
                <div class="player-score">{player.score} pts</div>
                {#if player.sittingOut}
                  <div class="spectator-badge">Watching</div>
                {:else}
                  <div class="player-meta">
                    {#if mp.mode === "strikes"}
                      <span class="strikes">
                        {#each Array(mp.maxStrikes) as _, s}
                          <span class="strike-dot" class:hit={s < player.strikes}>&#10060;</span>
                        {/each}
                      </span>
                    {:else}
                      <span class="turns-left">{mp.maxTurns - player.guesses} left</span>
                    {/if}
                  </div>
                {/if}
                {#if player.eliminated}
                  <div class="eliminated-badge">OUT</div>
                {/if}
              </div>
            {/each}
          </div>

          {#if mp.showResult && mp.lastResult}
            <div
              class="result"
              class:hit={!mp.lastResult.isStrike}
              class:miss={mp.lastResult.isStrike}
            >
              {#if mp.lastResult.isStrike}
                <div class="result-icon">&#10060;</div>
                <div class="result-text">
                  <strong>{mp.lastResult.playerName}</strong> guessed "<strong>{mp.lastResult.guess}</strong>" &mdash; not in the top 100!
                </div>
                <div class="result-points">Strike!</div>
              {:else}
                <div class="result-icon">&#127942;</div>
                <div class="result-text">
                  <strong>{mp.lastResult.playerName}</strong> guessed "<strong>{mp.lastResult.guess}</strong>" &mdash; ranked <strong>#{mp.lastResult.rank}</strong>!
                </div>
                <div class="result-points">+{mp.lastResult.points} points</div>
              {/if}
            </div>
          {:else}
            <div class="guess-area waiting">
              <div class="current-turn">
                <span class="turn-label">Waiting for {mp.currentPlayer?.name ?? "..."}...</span>
              </div>
            </div>
          {/if}

          <div class="guessed-list">
            <h3>Guessed so far ({mp.guessedItems.length}/100)</h3>
            <div class="guessed-grid">
              {#each sortedGuessed as item}
                <div class="guessed-item">
                  <span class="guessed-rank">#{item.index + 1}</span>
                  <span class="guessed-name">{item.name}</span>
                  <span class="guessed-by">{item.playerName}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <div class="lobby-actions">
        <button class="leave-btn" onclick={() => mp.leaveParty()}>Leave Party</button>
      </div>
    </div>

  <!-- ─── LOBBY SCREEN ─── -->
  {:else if mp.phase === "lobby"}
    <div class="lobby">

      <!-- Column 1: Players + Game Mode -->
      <div class="lobby-col lobby-col-info">
        {#if mp.isHost}
          <div class="visibility-row">
            <button class="toggle-btn small" class:active={mp.isPublic} onclick={() => mp.updateSettings({ isPublic: true })}>Public</button>
            <button class="toggle-btn small" class:active={!mp.isPublic} onclick={() => mp.updateSettings({ isPublic: false })}>Private</button>
          </div>
        {:else}
          <span class="visibility-label">{mp.isPublic ? "Public" : "Private"} party</span>
        {/if}

        <div class="setup-section">
          <label>Players ({mp.players.length}/8)</label>
          <div class="player-list">
            {#each mp.players as player}
              <div
                class="lobby-player"
                class:host={player.id === mp.hostId}
                class:me={player.id === mp.myId}
              >
                <span class="lp-name">{player.name}</span>
                {#if player.id === mp.hostId}<span class="lp-badge">Host</span>{/if}
                {#if player.id === mp.myId}<span class="lp-you">You</span>{/if}
              </div>
            {/each}
          </div>
        </div>

        <div class="setup-section">
          <label>Game Mode</label>
          {#if mp.isHost}
            <div class="mode-toggle">
              <button
                class="mode-btn"
                class:active={mp.mode === "strikes"}
                onclick={() => mp.updateSettings({ mode: "strikes" })}
              >
                <span class="mode-icon">&#10060;</span> Strikes
              </button>
              <button
                class="mode-btn"
                class:active={mp.mode === "turns"}
                onclick={() => mp.updateSettings({ mode: "turns" })}
              >
                <span class="mode-icon">&#128260;</span> Turns
              </button>
            </div>
            {#if mp.mode === "strikes"}
              <div class="mode-config">
                <label for="maxStrikes">Strikes to eliminate</label>
                <div class="player-count-row">
                  <button
                    class="count-btn"
                    disabled={mp.maxStrikes <= 1}
                    onclick={() => mp.updateSettings({ maxStrikes: mp.maxStrikes - 1 })}
                    >-</button
                  >
                  <span class="count-display">{mp.maxStrikes}</span>
                  <button
                    class="count-btn"
                    disabled={mp.maxStrikes >= 10}
                    onclick={() => mp.updateSettings({ maxStrikes: mp.maxStrikes + 1 })}
                    >+</button
                  >
                </div>
              </div>
            {:else}
              <div class="mode-config">
                <label for="maxTurns">Turns per player</label>
                <div class="player-count-row">
                  <button
                    class="count-btn"
                    disabled={mp.maxTurns <= 1}
                    onclick={() => mp.updateSettings({ maxTurns: mp.maxTurns - 1 })}>-</button
                  >
                  <span class="count-display">{mp.maxTurns}</span>
                  <button
                    class="count-btn"
                    disabled={mp.maxTurns >= 50}
                    onclick={() => mp.updateSettings({ maxTurns: mp.maxTurns + 1 })}>+</button
                  >
                </div>
              </div>
            {/if}
          {:else}
            <div class="readonly-setting">
              <span class="setting-value">
                {mp.mode === "strikes"
                  ? `Strikes (${mp.maxStrikes} to eliminate)`
                  : `Turns (${mp.maxTurns} per player)`}
              </span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Column 2: Category -->
      <div class="lobby-col lobby-col-category">
        <div class="setup-section">
          <label>Category</label>
          {#if mp.isHost}
            {#if previewCategory}
              <div class="category-preview">
                <div class="preview-header">
                  <button
                    class="back-btn"
                    onclick={() => { previewCategory = null; previewSearch = ""; }}
                    >&larr; Back</button
                  >
                  <div class="preview-title">
                    <h3>{previewCategory.name}</h3>
                    <p>{previewCategory.description}</p>
                  </div>
                  <button
                    class="select-btn"
                    onclick={() => selectCategory(previewCategory!)}
                    >Select</button
                  >
                </div>
                <div class="preview-tags">
                  {#each previewCategory.tags as tag}
                    <span class="tag">{tag}</span>
                  {/each}
                </div>
                <input
                  type="text"
                  bind:value={previewSearch}
                  placeholder="Search items..."
                  class="preview-search"
                />
                <div class="preview-list">
                  {#each filteredPreviewItems as { item, rank }}
                    <div class="preview-item">
                      <span class="preview-rank">#{rank}</span>
                      <span class="preview-name">{item}</span>
                      <span class="preview-points">{rank} pts</span>
                    </div>
                  {/each}
                  {#if filteredPreviewItems.length === 0}
                    <div class="preview-empty">No items match "{previewSearch}"</div>
                  {/if}
                </div>
              </div>
            {:else}
              <input
                type="text"
                bind:value={categorySearch}
                placeholder="Search categories..."
              />
              <div class="tag-bar">
                <button
                  class="tag-btn"
                  class:active={activeTag === "__featured__"}
                  onclick={() => (activeTag = "__featured__")}>Featured</button
                >
                <button
                  class="tag-btn"
                  class:active={activeTag === null}
                  onclick={() => (activeTag = null)}>All</button
                >
                {#each allTags as tag}
                  <button
                    class="tag-btn"
                    class:active={activeTag === tag}
                    onclick={() => (activeTag = activeTag === tag ? null : tag)}
                    >{tag}</button
                  >
                {/each}
              </div>
              <div class="category-grid">
                {#each filteredCategories as cat}
                  <div
                    class="category-card"
                    class:selected={mp.categoryId === cat.id}
                    role="button"
                    tabindex="0"
                    onclick={() => mp.updateSettings({ categoryId: cat.id })}
                    onkeydown={(e: KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ")
                        mp.updateSettings({ categoryId: cat.id });
                    }}
                  >
                    <div class="card-top">
                      <span class="card-name">{cat.name}</span>
                      {#if mp.categoryId === cat.id}<span class="card-check">&#10003;</span>{/if}
                    </div>
                    <span class="card-desc">{cat.description}</span>
                    <div class="card-tags">
                      {#each cat.tags as tag}
                        <span class="card-tag">{tag}</span>
                      {/each}
                    </div>
                    <button
                      class="browse-items-btn"
                      onclick={(e: MouseEvent) => {
                        e.stopPropagation();
                        previewCategory = cat;
                        previewSearch = "";
                      }}>Browse items</button
                    >
                  </div>
                {/each}
              </div>
            {/if}
          {:else}
            <div class="readonly-setting">
              <span class="setting-value">{mp.category.name}</span>
              <span class="setting-desc">{mp.category.description}</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Actions bar spanning full width -->
      <div class="lobby-actions">
        {#if mp.isHost}
          <button
            class="start-btn lobby-start-btn"
            disabled={mp.players.length < 2}
            onclick={() => mp.startGame()}
          >
            Start Game {#if mp.players.length < 2}(need 2+ players){/if}
          </button>
        {:else}
          <div class="waiting-msg">Waiting for host to start...</div>
        {/if}
        <button class="leave-btn" onclick={() => mp.leaveParty()}>Leave Party</button>
      </div>
    </div>

  <!-- ─── GAME SCREEN ─── -->
  {:else if mp.phase === "playing"}
    <div class="game">
      <!-- Desktop: full-width layout -->
      <div class="game-desktop">
        <div class="dt-top">
          <span class="dt-category-label">{mp.category.name}</span>
          <div class="dt-guess-area">
            {#if mp.showResult && mp.lastResult}
              <div
                class="dt-result"
                class:hit={!mp.lastResult.isStrike}
                class:miss={mp.lastResult.isStrike}
              >
                {#if mp.lastResult.isStrike}
                  <span
                    ><strong>{mp.lastResult.playerName}</strong> guessed "<strong
                      >{mp.lastResult.guess}</strong
                    >" &mdash; Strike!</span
                  >
                {:else}
                  <span
                    ><strong>{mp.lastResult.playerName}</strong> guessed "<strong
                      >{mp.lastResult.guess}</strong
                    >" &mdash; #{mp.lastResult.rank}! +{mp.lastResult.points} pts</span
                  >
                {/if}
                <button class="dt-next-btn" onclick={() => mp.nextTurn()}>Next Turn</button>
              </div>
            {:else if mp.isMyTurn}
              <div class="dt-input-row">
                <Autocomplete
                  hints={availableHints}
                  bind:value={guessInput}
                  placeholder="Name something in the top 100..."
                  onsubmit={handleSubmitGuess}
                />
                <button
                  class="dt-submit-btn"
                  disabled={!guessInput.trim()}
                  onclick={() => handleSubmitGuess(guessInput)}>Submit</button
                >
              </div>
            {:else}
              <div class="dt-waiting">
                Waiting for {mp.currentPlayer?.name ?? "..."}...
              </div>
            {/if}
          </div>
        </div>

        <div class="dt-body">
          <div class="dt-players">
            {#each mp.players as player}
              <div
                class="dt-player"
                class:active={player.id === mp.currentPlayerId}
                class:eliminated={player.eliminated}
                class:me={player.id === mp.myId}
                class:sitting-out-player={player.sittingOut}
              >
                <div class="dt-player-top">
                  <span class="dt-player-name">
                    {player.name}
                    {#if player.id === mp.myId}<span class="you-tag">you</span>{/if}
                  </span>
                  {#if player.sittingOut}
                    <span class="dt-player-spectating">Watching</span>
                  {:else if player.eliminated}
                    <span class="dt-player-out">Out</span>
                  {:else if player.id === mp.currentPlayerId}
                    <span class="dt-player-active">Playing</span>
                  {/if}
                </div>
                <div class="dt-player-score">{player.score}</div>
                {#if !player.sittingOut}
                  <div class="dt-player-meta">
                    {#if mp.mode === "strikes"}
                      {#each Array(mp.maxStrikes) as _, s}
                        <span class="strike-dot" class:hit={s < player.strikes}>&#10060;</span>
                      {/each}
                    {:else}
                      {mp.maxTurns - player.guesses} turns left
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          </div>

          <div class="dt-board">
            <div class="dt-board-header">
              <span class="dt-board-title">{mp.category.name}</span>
              <span class="dt-board-count">{mp.guessedItems.length} of 100 identified</span>
            </div>
            <div class="dt-board-body">
              <div class="dt-slots">
                {#each Array(100) as _, i}
                  {@const item = guessedMap.get(i)}
                  <div class="dt-slot" class:filled={!!item}>
                    <span class="dt-slot-rank">{i + 1}.</span>
                    {#if item}
                      <span class="dt-slot-name">{item.name}</span>
                      <span class="dt-slot-by">{item.playerName}</span>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile: compact vertical layout -->
      <div class="game-mobile">
        <div class="game-header">
          <div class="category-badge">{mp.category.name}</div>
          <div class="mode-badge">{mp.mode === "strikes" ? "Strikes" : "Turns"} Mode</div>
          <div class="code-badge">{mp.partyCode}</div>
        </div>

        <div class="scoreboard">
          {#each mp.players as player}
            <div
              class="player-card"
              class:active={player.id === mp.currentPlayerId}
              class:eliminated={player.eliminated}
              class:me={player.id === mp.myId}
              class:sitting-out-player={player.sittingOut}
            >
              <div class="player-name">
                {player.name}
                {#if player.id === mp.myId}<span class="you-tag">you</span>{/if}
              </div>
              <div class="player-score">{player.score} pts</div>
              {#if player.sittingOut}
                <div class="spectator-badge">Watching</div>
              {:else}
                <div class="player-meta">
                  {#if mp.mode === "strikes"}
                    <span class="strikes">
                      {#each Array(mp.maxStrikes) as _, s}
                        <span class="strike-dot" class:hit={s < player.strikes}>&#10060;</span>
                      {/each}
                    </span>
                  {:else}
                    <span class="turns-left">{mp.maxTurns - player.guesses} left</span>
                  {/if}
                </div>
              {/if}
              {#if player.eliminated}
                <div class="eliminated-badge">OUT</div>
              {/if}
            </div>
          {/each}
        </div>

        {#if mp.showResult && mp.lastResult}
          <div
            class="result"
            class:hit={!mp.lastResult.isStrike}
            class:miss={mp.lastResult.isStrike}
          >
            {#if mp.lastResult.isStrike}
              <div class="result-icon">&#10060;</div>
              <div class="result-text">
                <strong>{mp.lastResult.playerName}</strong> guessed "<strong>{mp.lastResult.guess}</strong>" &mdash; not in the top 100!
              </div>
              <div class="result-points">Strike!</div>
            {:else}
              <div class="result-icon">&#127942;</div>
              <div class="result-text">
                <strong>{mp.lastResult.playerName}</strong> guessed "<strong>{mp.lastResult.guess}</strong>" &mdash; ranked <strong>#{mp.lastResult.rank}</strong>!
              </div>
              <div class="result-points">+{mp.lastResult.points} points</div>
            {/if}
            <button class="next-btn" onclick={() => mp.nextTurn()}>Next Turn</button>
          </div>
        {:else if mp.isMyTurn}
          <div class="guess-area">
            <div class="current-turn">
              <span class="turn-label">Your turn!</span>
            </div>
            <div class="guess-form">
              <Autocomplete
                hints={availableHints}
                bind:value={guessInput}
                placeholder="Enter your guess..."
                onsubmit={handleSubmitGuess}
              />
              <button
                class="guess-btn"
                disabled={!guessInput.trim()}
                onclick={() => handleSubmitGuess(guessInput)}>Guess</button
              >
            </div>
          </div>
        {:else}
          <div class="guess-area waiting">
            <div class="current-turn">
              <span class="turn-label">Waiting for {mp.currentPlayer?.name ?? "..."}...</span>
            </div>
          </div>
        {/if}

        <div class="guessed-list">
          <h3>Guessed so far ({mp.guessedItems.length}/100)</h3>
          <div class="guessed-grid">
            {#each sortedGuessed as item}
              <div class="guessed-item">
                <span class="guessed-rank">#{item.index + 1}</span>
                <span class="guessed-name">{item.name}</span>
                <span class="guessed-by">{item.playerName}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

  <!-- ─── RESULTS SCREEN ─── -->
  {:else if mp.phase === "results"}
    <div class="results">
      <h2>Game Over!</h2>

      {#if mp.winner}
        <div class="winner-banner">
          <div class="winner-icon">&#127942;</div>
          <div class="winner-name">{mp.winner.name} wins!</div>
          <div class="winner-score">{mp.winner.score} points</div>
        </div>
      {:else}
        <div class="winner-banner tie">
          <div class="winner-icon">&#129309;</div>
          <div class="winner-name">It's a tie!</div>
        </div>
      {/if}

      <div class="final-rankings">
        <h3>Final Rankings</h3>
        {#each mp.rankings as player, i}
          <div class="ranking-row" class:first={i === 0}>
            <span class="ranking-position">
              {#if i === 0}&#129351;{:else if i === 1}&#129352;{:else if i === 2}&#129353;{:else}{i + 1}{/if}
            </span>
            <span class="ranking-name">
              {player.name}
              {#if player.id === mp.myId}<span class="you-tag">you</span>{/if}
            </span>
            <span class="ranking-score">{player.score} pts</span>
            <span class="ranking-details">
              {player.strikes} strike{player.strikes !== 1 ? "s" : ""}
              {#if player.eliminated}&middot; Eliminated{/if}
            </span>
          </div>
        {/each}
      </div>

      <div class="guessed-list">
        <h3>All Guessed Items ({mp.guessedItems.length}/100)</h3>
        <div class="guessed-grid">
          {#each sortedGuessed as item}
            <div class="guessed-item">
              <span class="guessed-rank">#{item.index + 1}</span>
              <span class="guessed-name">{item.name}</span>
              <span class="guessed-by">{item.playerName}</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="lobby-actions">
        {#if mp.isHost}
          <button class="start-btn" onclick={() => mp.backToLobby()}>Back to Lobby</button>
        {:else}
          <div class="waiting-msg">Waiting for host...</div>
        {/if}
        <button class="leave-btn" onclick={() => mp.leaveParty()}>Leave Party</button>
      </div>
    </div>
  {/if}
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap");

  :global(body) {
    margin: 0;
    font-family: "Source Serif 4", Georgia, "Times New Roman", serif;
    background: #f5e6c8;
    color: #1a1a1a;
    min-height: 100vh;
  }

  .app {
    max-width: 720px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  /* ─── LOBBY ─── */
  .lobby {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .category-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  @media (min-width: 900px) {
    .app:has(.game) {
      max-width: 1400px;
      padding: 1.5rem 2rem;
    }

    .app:has(.lobby) {
      height: 100dvh;
      box-sizing: border-box;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-width: 1200px;
      padding: 1.5rem 2rem;
    }

    .lobby {
      flex: 1;
      min-height: 0;
      display: grid;
      grid-template-columns: 300px 1fr;
      grid-template-rows: 1fr auto;
      gap: 1.25rem;
    }

    .lobby-col-info {
      grid-column: 1;
      grid-row: 1;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .lobby-col-category {
      grid-column: 2;
      grid-row: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }

    /* Category setup-section fills the right column */
    .lobby-col-category .setup-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }

    .lobby-actions {
      grid-column: 1 / -1;
      grid-row: 2;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid #d4c5a0;
    }

    .lobby-start-btn { flex: 1; margin-top: 0; }
    .lobby-actions .leave-btn { flex-shrink: 0; }
    .lobby-actions .waiting-msg { flex: 1; }

    /* Category grid: 3 columns, fills space, scrolls on overflow */
    .category-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.75rem;
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      align-content: start;
    }

    /* Category preview also fills and scrolls */
    .category-preview {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }

    .preview-list {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }
  }

  header {
    text-align: center;
    margin-bottom: 1.5rem;
    border-bottom: 3px double #1a1a1a;
    padding-bottom: 0.75rem;
  }

  .title-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
  }

  .title-row-left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .title-row-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .title-link {
    text-decoration: none;
    color: inherit;
    text-align: center;
  }

  .header-code-block {
    display: flex;
    align-items: center;
    gap: 0;
    background: rgba(139, 0, 0, 0.05);
    border: 1px solid rgba(139, 0, 0, 0.2);
  }

  .header-code-block .code-text {
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    font-family: "Courier New", Courier, monospace;
    color: #8b0000;
    padding: 0.3rem 0.75rem;
  }

  .header-code-block .copy-btn {
    font-size: 0.72rem;
    padding: 0.3rem 0.6rem;
    border: none;
    border-left: 1px solid rgba(139, 0, 0, 0.2);
    background: rgba(139, 0, 0, 0.08);
    color: #8b0000;
    font-family: "Source Serif 4", Georgia, serif;
    cursor: pointer;
    transition: background 0.15s;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    height: 100%;
  }

  .header-code-block .copy-btn:hover {
    background: rgba(139, 0, 0, 0.15);
  }

  .header-code-block .copy-btn.copied {
    color: #2d7a2d;
    border-left-color: rgba(45, 122, 45, 0.3);
    background: rgba(45, 122, 45, 0.08);
  }

  .visibility-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  header h1 {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 2.4rem;
    font-weight: 900;
    margin: 0;
    color: #1a1a1a;
    letter-spacing: 0.02em;
    line-height: 1;
    text-transform: uppercase;
  }

  .info-btn {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 1.5px solid #999;
    background: transparent;
    color: #999;
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.75rem;
    font-style: italic;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .info-btn:hover {
    border-color: #1a1a1a;
    color: #1a1a1a;
  }

  .header-meta {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.6rem;
    margin-top: 0.4rem;
    font-size: 0.78rem;
  }

  .header-mode {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    color: #666;
  }

  .header-code {
    font-family: "Courier New", Courier, monospace;
    color: #8b0000;
    font-weight: 700;
    font-size: 0.75rem;
    background: rgba(139, 0, 0, 0.06);
    border: 1px solid rgba(139, 0, 0, 0.15);
    padding: 0.15rem 0.5rem;
    letter-spacing: 0.05em;
  }

  /* ─── RULES MODAL ─── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.15s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal {
    background: #fffef2;
    border: 1px solid #d4c5a0;
    padding: 2rem;
    max-width: 480px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }

  .modal-close {
    position: absolute;
    top: 0.75rem;
    right: 1rem;
    border: none;
    background: transparent;
    font-size: 1.5rem;
    color: #999;
    cursor: pointer;
    line-height: 1;
  }

  .modal-close:hover { color: #1a1a1a; }

  .modal h2 {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.4rem;
    font-weight: 900;
    margin: 0 0 1rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .rules-content h3 {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.95rem;
    font-weight: 700;
    margin: 1rem 0 0.25rem;
    color: #8b0000;
  }

  .rules-content p {
    margin: 0 0 0.5rem;
    font-size: 0.9rem;
    line-height: 1.5;
    color: #444;
  }

  /* Error */
  .error-banner {
    background: #fffef2;
    border: 1px solid #8b0000;
    color: #8b0000;
    padding: 0.6rem 1rem;
    margin-bottom: 1rem;
    text-align: center;
    font-size: 0.9rem;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Shared */
  .setup-section {
    background: #fffef2;
    border: 1px solid #d4c5a0;
    padding: 1.25rem;
    margin-bottom: 1rem;
  }

  .setup-section > label {
    display: block;
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #555;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid #e8d9b8;
    padding-bottom: 0.4rem;
  }

  input[type="text"] {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid #c4b48a;
    background: #fffef2;
    color: #1a1a1a;
    font-size: 1rem;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.2s;
    font-family: "Source Serif 4", Georgia, serif;
  }

  input[type="text"]:focus { border-color: #8b0000; }

  .start-btn {
    width: 100%;
    padding: 0.85rem 2rem;
    border: 2px solid #1a1a1a;
    background: #1a1a1a;
    color: #f5e6c8;
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    margin-top: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .start-btn:hover:not(:disabled) {
    background: #fffef2;
    color: #1a1a1a;
  }

  .start-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ─── JOIN SCREEN ─── */
  .join-screen {
    max-width: 420px;
    margin: 0 auto;
  }

  .checking {
    text-align: center;
    padding: 3rem 1rem;
    color: #888;
    font-style: italic;
    font-size: 1.1rem;
  }

  .not-found {
    text-align: center;
    padding: 2rem;
    background: #fffef2;
    border: 1px solid #d4c5a0;
  }

  .not-found h2 {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.5rem;
    font-weight: 900;
    margin: 0 0 0.5rem;
    text-transform: uppercase;
  }

  .not-found p {
    color: #666;
    margin: 0 0 1.5rem;
  }

  .party-preview h2 {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.5rem;
    font-weight: 900;
    text-transform: uppercase;
    text-align: center;
    margin: 0 0 1rem;
  }

  .preview-info {
    background: #fffef2;
    border: 1px solid #d4c5a0;
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .preview-detail {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .preview-label {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #999;
    font-weight: 700;
  }

  .preview-value {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .midgame-notice {
    background: rgba(139, 105, 20, 0.08);
    border: 1px solid rgba(139, 105, 20, 0.25);
    color: #8b6914;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    line-height: 1.4;
    text-align: center;
  }

  /* ─── SITTING OUT ─── */
  .sitting-out-banner {
    text-align: center;
    background: #fffef2;
    border: 1px solid #d4c5a0;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .sitting-out-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .sitting-out-banner h2 {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.3rem;
    font-weight: 900;
    text-transform: uppercase;
    margin: 0 0 0.5rem;
    color: #8b6914;
  }

  .sitting-out-banner p {
    color: #666;
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .sitting-out-player {
    opacity: 0.5;
  }

  .dt-player-spectating {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    color: #8b6914;
  }

  .spectator-badge {
    font-size: 0.7rem;
    color: #8b6914;
    font-weight: 600;
    font-style: italic;
  }

  .party-code-section {
    text-align: center;
    background: #fffef2;
    border: 1px solid #d4c5a0;
    padding: 1.25rem;
    margin-bottom: 1rem;
  }

  .code-label {
    display: block;
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #777;
    margin-bottom: 0.5rem;
  }

  .code-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .code-text {
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    font-family: "Courier New", Courier, monospace;
    color: #8b0000;
  }

  .copy-btn {
    padding: 0.35rem 0.7rem;
    border: 1px solid #c4b48a;
    background: transparent;
    color: #777;
    font-size: 0.8rem;
    cursor: pointer;
    font-family: "Source Serif 4", Georgia, serif;
    transition: all 0.2s;
  }

  .copy-btn:hover {
    border-color: #1a1a1a;
    color: #1a1a1a;
  }

  .copy-btn.copied {
    border-color: #2d7a2d;
    color: #2d7a2d;
  }

  .public-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .public-toggle.small {
    max-width: 200px;
    margin: 0.5rem auto;
  }

  .toggle-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #c4b48a;
    background: #fffef2;
    color: #888;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .toggle-btn.small {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }

  .toggle-btn.active {
    border-color: #1a1a1a;
    background: #1a1a1a;
    color: #f5e6c8;
  }

  .visibility-label {
    display: block;
    font-size: 0.8rem;
    color: #888;
    margin-top: 0.5rem;
    font-style: italic;
  }

  .player-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .lobby-player {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #f5e6c8;
    border: 1px solid transparent;
    border-bottom: 1px solid #e8d9b8;
  }

  .lobby-player.me {
    border-color: #c4b48a;
    background: #fff8e8;
  }

  .lp-name { flex: 1; font-weight: 500; }

  .lp-badge {
    font-size: 0.7rem;
    padding: 0.15rem 0.45rem;
    background: rgba(139, 0, 0, 0.1);
    color: #8b0000;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .lp-you {
    font-size: 0.7rem;
    padding: 0.15rem 0.45rem;
    background: rgba(26, 26, 26, 0.08);
    color: #555;
    font-weight: 600;
    font-style: italic;
  }

  .readonly-setting { padding: 0.5rem 0; }

  .setting-value { font-weight: 600; font-size: 1rem; }

  .setting-desc {
    display: block;
    font-size: 0.8rem;
    color: #888;
    margin-top: 0.15rem;
    font-style: italic;
  }

  .lobby-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .waiting-msg {
    text-align: center;
    padding: 1rem;
    color: #777;
    font-size: 1rem;
    font-style: italic;
    background: #fffef2;
    border: 1px solid #d4c5a0;
  }

  .leave-btn {
    padding: 0.6rem;
    border: 1px solid #c4b48a;
    background: transparent;
    color: #888;
    font-size: 0.9rem;
    cursor: pointer;
    font-family: "Source Serif 4", Georgia, serif;
    transition: all 0.2s;
  }

  .leave-btn:hover {
    border-color: #8b0000;
    color: #8b0000;
  }

  /* ─── CATEGORY BROWSER ─── */
  .tag-bar {
    display: flex;
    gap: 0.4rem;
    margin: 0.75rem 0;
    flex-wrap: wrap;
  }

  .tag-btn {
    padding: 0.3rem 0.7rem;
    border: 1px solid #c4b48a;
    background: transparent;
    color: #777;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: capitalize;
  }

  .tag-btn:hover {
    border-color: #1a1a1a;
    color: #1a1a1a;
  }
  .tag-btn.active {
    background: #1a1a1a;
    border-color: #1a1a1a;
    color: #f5e6c8;
  }

  .category-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.6rem 0.75rem;
    border: 1px solid #d4c5a0;
    background: #fffef2;
    cursor: pointer;
    transition: all 0.2s;
  }

  .category-card:hover { border-color: #1a1a1a; }
  .category-card.selected {
    border-color: #8b0000;
    background: rgba(139, 0, 0, 0.03);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .card-name {
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 700;
    font-size: 0.88rem;
  }
  .card-check { color: #8b0000; font-weight: 700; }
  .card-desc {
    font-size: 0.75rem;
    color: #888;
    font-style: italic;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .card-tags { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-top: 0.1rem; }
  .card-tag {
    font-size: 0.7rem;
    padding: 0.15rem 0.45rem;
    background: rgba(139, 0, 0, 0.06);
    color: #8b0000;
    text-transform: capitalize;
  }

  .browse-items-btn {
    align-self: flex-start;
    margin-top: 0.25rem;
    padding: 0.25rem 0.6rem;
    border: 1px solid #c4b48a;
    background: transparent;
    color: #777;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: "Source Serif 4", Georgia, serif;
  }

  .browse-items-btn:hover {
    border-color: #1a1a1a;
    color: #1a1a1a;
  }

  /* Category preview */
  .category-preview {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .preview-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .back-btn {
    padding: 0.4rem 0.7rem;
    border: 1px solid #c4b48a;
    background: transparent;
    color: #777;
    font-size: 0.85rem;
    cursor: pointer;
    font-family: "Source Serif 4", Georgia, serif;
    white-space: nowrap;
  }

  .back-btn:hover {
    border-color: #1a1a1a;
    color: #1a1a1a;
  }

  .preview-title { flex: 1; }
  .preview-title h3 {
    margin: 0;
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1rem;
  }
  .preview-title p {
    margin: 0;
    font-size: 0.8rem;
    color: #888;
    font-style: italic;
  }

  .select-btn {
    padding: 0.4rem 1rem;
    border: 1px solid #1a1a1a;
    background: #1a1a1a;
    color: #f5e6c8;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .select-btn:hover { background: #333; }

  .preview-tags { display: flex; gap: 0.35rem; }
  .tag {
    font-size: 0.7rem;
    padding: 0.15rem 0.5rem;
    background: rgba(139, 0, 0, 0.06);
    color: #8b0000;
    text-transform: capitalize;
  }

  .preview-list {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    max-height: 350px;
    overflow-y: auto;
  }

  .preview-search { border: 1px solid #c4b48a; }

  .preview-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.35rem 0.5rem;
    background: #f5e6c8;
    font-size: 0.85rem;
    border-bottom: 1px solid #e8d9b8;
  }

  .preview-rank { color: #8b0000; font-weight: 700; min-width: 2.2rem; }
  .preview-name { flex: 1; }
  .preview-points { color: #888; font-size: 0.75rem; font-weight: 600; }
  .preview-empty {
    text-align: center;
    color: #888;
    padding: 1rem;
    font-size: 0.85rem;
    font-style: italic;
  }

  /* ─── GAME MODE TOGGLE ─── */
  .mode-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .mode-btn {
    padding: 1rem;
    border: 1px solid #d4c5a0;
    background: #fffef2;
    color: #888;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .mode-btn:hover { border-color: #1a1a1a; }
  .mode-btn.active {
    border-color: #1a1a1a;
    background: #1a1a1a;
    color: #f5e6c8;
  }
  .mode-icon { font-size: 1.5rem; }

  .mode-config {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e8d9b8;
  }

  .mode-config > label {
    display: block;
    font-size: 0.85rem;
    color: #777;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .player-count-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
  }

  .count-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid #c4b48a;
    background: #fffef2;
    color: #1a1a1a;
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .count-btn:hover:not(:disabled) {
    border-color: #1a1a1a;
    background: #f5e6c8;
  }
  .count-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .count-display {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.5rem;
    font-weight: 700;
    min-width: 2rem;
    text-align: center;
  }

  /* ─── GAME ─── */
  .game-header {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    padding-bottom: 1rem;
    border-bottom: 1px solid #d4c5a0;
  }

  .category-badge,
  .mode-badge,
  .code-badge {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    font-weight: 600;
    border: 1px solid;
  }

  .category-badge {
    background: rgba(139, 0, 0, 0.06);
    color: #8b0000;
    border-color: rgba(139, 0, 0, 0.2);
  }
  .mode-badge {
    background: rgba(26, 26, 26, 0.05);
    color: #555;
    border-color: #d4c5a0;
  }
  .code-badge {
    background: rgba(26, 26, 26, 0.05);
    color: #555;
    border-color: #d4c5a0;
    font-family: "Courier New", Courier, monospace;
  }

  .scoreboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 0.6rem;
    margin-bottom: 1.5rem;
  }

  .player-card {
    background: #fffef2;
    border: 1px solid #d4c5a0;
    padding: 0.65rem;
    text-align: center;
    transition: all 0.3s;
    position: relative;
  }

  .player-card.active {
    border-color: #8b0000;
    background: rgba(139, 0, 0, 0.03);
    box-shadow: 0 0 12px rgba(139, 0, 0, 0.08);
  }
  .player-card.eliminated { opacity: 0.4; }
  .player-card.me {
    border-color: #c4b48a;
    border-width: 2px;
  }

  .player-name {
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 700;
    font-size: 0.85rem;
    margin-bottom: 0.15rem;
  }
  .player-score {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: #8b0000;
  }
  .player-meta { margin-top: 0.2rem; }
  .strike-dot {
    font-size: 0.65rem;
    opacity: 0.2;
    margin: 0 1px;
  }
  .strike-dot.hit { opacity: 1; }
  .turns-left { font-size: 0.75rem; color: #888; }

  .you-tag {
    font-size: 0.6rem;
    padding: 0.2rem 0.35rem 0.15rem;
    background: rgba(26, 26, 26, 0.08);
    color: #555;
    font-weight: 600;
    margin-left: 0.25rem;
    font-style: italic;
    display: inline-block;
    line-height: 1;
    vertical-align: middle;
  }

  .eliminated-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #8b0000;
    color: #fffef2;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 2px 6px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .guess-area {
    background: #fffef2;
    border: 1px solid #d4c5a0;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .guess-area.waiting {
    text-align: center;
    padding: 2rem 1.5rem;
  }

  .current-turn {
    text-align: center;
    margin-bottom: 1rem;
  }
  .turn-label {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #8b0000;
  }
  .guess-area.waiting .turn-label {
    color: #888;
    font-style: italic;
  }

  .guess-form {
    display: flex;
    gap: 0.5rem;
  }

  .guess-btn {
    padding: 0.6rem 1.25rem;
    border: 1px solid #1a1a1a;
    background: #1a1a1a;
    color: #f5e6c8;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .guess-btn:hover:not(:disabled) { background: #333; }
  .guess-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Result */
  .result {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: center;
    animation: slideIn 0.3s ease-out;
  }

  .result.hit {
    background: #fffef2;
    border: 2px solid #2d5016;
  }
  .result.miss {
    background: #fffef2;
    border: 2px solid #8b0000;
  }

  .result-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
  .result-text { font-size: 1rem; margin-bottom: 0.25rem; }
  .result-points {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }
  .hit .result-points { color: #2d5016; }
  .miss .result-points { color: #8b0000; }

  .next-btn {
    padding: 0.6rem 1.5rem;
    border: 1px solid #1a1a1a;
    background: #1a1a1a;
    color: #f5e6c8;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  }

  .next-btn:hover { background: #333; }

  /* Guessed list */
  .guessed-list {
    background: #fffef2;
    border: 1px solid #d4c5a0;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .guessed-list h3 {
    margin: 0 0 0.75rem;
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #777;
    border-bottom: 1px solid #e8d9b8;
    padding-bottom: 0.4rem;
  }

  .guessed-grid {
    display: flex;
    flex-direction: column;
    gap: 0;
    max-height: 300px;
    overflow-y: auto;
  }

  .guessed-item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.35rem 0.5rem;
    border-bottom: 1px solid #ede0c4;
    font-size: 0.85rem;
  }

  .guessed-rank { color: #8b0000; font-weight: 700; min-width: 2.5rem; }
  .guessed-name { flex: 1; }
  .guessed-by { color: #999; font-size: 0.8rem; font-style: italic; }

  /* Results */
  .results { text-align: center; }
  .results h2 {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .winner-banner {
    background: #fffef2;
    border: 2px solid #8b0000;
    padding: 2rem;
    margin-bottom: 2rem;
    animation: slideIn 0.5s ease-out;
  }

  .winner-banner.tie { border-color: #8b6914; }

  .winner-icon { font-size: 3rem; margin-bottom: 0.5rem; }
  .winner-name {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.5rem;
    font-weight: 700;
  }
  .winner-score {
    font-size: 1.1rem;
    color: #8b0000;
    margin-top: 0.25rem;
  }

  .final-rankings {
    background: #fffef2;
    border: 1px solid #d4c5a0;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .final-rankings h3 {
    margin: 0 0 0.75rem;
    text-align: center;
    color: #777;
    font-family: "Playfair Display", Georgia, serif;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 0.1em;
  }

  .ranking-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.5rem;
    border-bottom: 1px solid #ede0c4;
  }

  .ranking-row.first { background: rgba(139, 0, 0, 0.04); }
  .ranking-position { font-size: 1.2rem; min-width: 2rem; text-align: center; }
  .ranking-name { flex: 1; font-weight: 600; }
  .ranking-score { font-weight: 700; color: #8b0000; }
  .ranking-details { font-size: 0.8rem; color: #888; font-style: italic; }

  /* ─── DESKTOP / MOBILE GAME TOGGLE ─── */
  .game-desktop { display: none; }
  .game-mobile { display: block; }

  @media (min-width: 900px) {
    .game-desktop {
      display: flex;
      flex-direction: column;
    }
    .game-mobile { display: none; }
  }

  /* ─── DESKTOP TOP BAR ─── */
  .dt-top {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .dt-category-label {
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #555;
    white-space: nowrap;
  }

  .dt-guess-area { flex: 1; }

  .dt-input-row {
    display: flex;
    gap: 0.5rem;
  }

  .dt-submit-btn {
    padding: 0.5rem 1.5rem;
    background: #8b0000;
    border: 1px solid #8b0000;
    color: #fffef2;
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s;
  }

  .dt-submit-btn:hover:not(:disabled) { background: #6b0000; }
  .dt-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .dt-waiting {
    text-align: center;
    color: #888;
    font-style: italic;
    font-size: 0.95rem;
    padding: 0.5rem 0;
  }

  .dt-result {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.5rem 0;
    font-size: 0.95rem;
    animation: slideIn 0.3s ease-out;
  }

  .dt-result.hit { color: #2d5016; }
  .dt-result.miss { color: #8b0000; }

  .dt-next-btn {
    padding: 0.4rem 1.2rem;
    border: 1px solid #1a1a1a;
    background: #1a1a1a;
    color: #f5e6c8;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .dt-next-btn:hover { background: #333; }

  /* ─── DESKTOP BODY ─── */
  .dt-body {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  /* ─── DESKTOP PLAYERS SIDEBAR ─── */
  .dt-players {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .dt-player {
    background: #fffef2;
    border: 1px solid #d4c5a0;
    padding: 0.75rem 1rem;
    transition: all 0.2s;
  }

  .dt-player.active {
    border-color: #8b0000;
    border-left: 4px solid #8b0000;
  }

  .dt-player.eliminated { opacity: 0.35; }
  .dt-player.me { background: #fff8e8; }

  .dt-player-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
  }

  .dt-player-name {
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 700;
    font-size: 0.95rem;
  }

  .dt-player-out {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    color: #8b0000;
  }

  .dt-player-active {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    color: #2d5016;
  }

  .dt-player-score {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: #8b0000;
    line-height: 1;
  }

  .dt-player-meta {
    font-size: 0.75rem;
    color: #888;
    margin-top: 0.25rem;
  }

  /* ─── DESKTOP BOARD ─── */
  .dt-board {
    background: #fffef2;
    border: 1px solid #d4c5a0;
    display: flex;
    flex-direction: column;
  }

  .dt-board-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 1rem;
    border-bottom: 2px solid #1a1a1a;
  }

  .dt-board-title {
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 700;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .dt-board-count {
    font-size: 0.8rem;
    color: #8b0000;
    font-weight: 600;
  }

  .dt-board-body {
    flex: 1;
    overflow-y: auto;
    max-height: calc(100vh - 280px);
  }

  /* 100-slot list */
  .dt-slots {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(25, auto);
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

  .dt-slot:nth-child(25),
  .dt-slot:nth-child(50),
  .dt-slot:nth-child(75),
  .dt-slot:nth-child(100) {
    border-bottom: none;
  }

  .dt-slot.filled { background: rgba(139, 0, 0, 0.04); }

  .dt-slot-rank {
    font-weight: 700;
    min-width: 1.8rem;
    font-size: 0.78rem;
    color: #c4b48a;
  }

  .dt-slot.filled .dt-slot-rank { color: #8b0000; }

  .dt-slot-name {
    flex: 1;
    font-weight: 500;
    color: #1a1a1a;
    animation: slideIn 0.2s ease-out;
  }

  .dt-slot-by {
    color: #bbb;
    font-size: 0.72rem;
    font-style: italic;
  }
</style>
