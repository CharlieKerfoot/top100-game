<script lang="ts">
  import { categories, getAllTags, searchCategories, type Category } from '$lib/categories/index';
  import { createMultiplayerState } from '$lib/multiplayer.svelte';
  import Autocomplete from '$lib/Autocomplete.svelte';

  const mp = createMultiplayerState();

  // Home screen state
  let playerName = $state('');
  let joinCode = $state('');
  let createPublic = $state(true);
  let showBrowse = $state(false);
  let homeTab = $state<'create' | 'join'>('create');

  // Lobby category browser state
  let categorySearch = $state('');
  let activeTag = $state<string | null>(null);
  let previewCategory = $state<Category | null>(null);
  let previewSearch = $state('');

  // Game state
  let guessInput = $state('');

  const allTags = getAllTags();
  const filteredCategories = $derived(searchCategories(categorySearch, activeTag));
  const filteredPreviewItems = $derived.by(() => {
    if (!previewCategory) return [];
    if (!previewSearch.trim()) return previewCategory.items.map((item, i) => ({ item, rank: i + 1 }));
    const q = previewSearch.toLowerCase();
    return previewCategory.items
      .map((item, i) => ({ item, rank: i + 1 }))
      .filter(({ item }) => item.toLowerCase().includes(q));
  });

  function handleCreate() {
    if (!playerName.trim()) return;
    mp.createParty(playerName.trim(), createPublic);
  }

  function handleJoin(code?: string) {
    if (!playerName.trim()) return;
    const c = code ?? joinCode;
    if (!c.trim()) return;
    mp.joinParty(c.trim(), playerName.trim());
  }

  function handleBrowse() {
    showBrowse = !showBrowse;
    if (showBrowse) mp.browseParties();
  }

  function selectCategory(cat: Category) {
    mp.updateSettings({ categoryId: cat.id });
    previewCategory = null;
    previewSearch = '';
  }

  const availableHints = $derived.by(() => {
    const hints = mp.category.hints ?? mp.category.items;
    const guessedNames = new Set(mp.guessedItems.map(g => g.name.toLowerCase()));
    return hints.filter(h => !guessedNames.has(h.toLowerCase()));
  });

  function handleSubmitGuess(val: string) {
    if (!val.trim() || mp.showResult || !mp.isMyTurn) return;
    mp.submitGuess(val.trim());
    guessInput = '';
  }

  function formatCodeInput() {
    // Strip everything except letters and digits
    let raw = joinCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    // First 5 chars are letters only, rest are digits only
    let letters = raw.slice(0, 5).replace(/[^A-Z]/g, '');
    let digits = raw.slice(5).replace(/[^0-9]/g, '').slice(0, 4);
    if (digits.length > 0) {
      joinCode = `${letters}-${digits}`;
    } else {
      joinCode = letters;
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(mp.partyCode);
  }
</script>

<div class="app">
  <header>
    <p class="edition-date">{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <h1>The Top 100</h1>
    <p class="subtitle">Interactive Edition &middot; Multiplayer Puzzle</p>
  </header>

  {#if mp.error}
    <div class="error-banner">{mp.error}</div>
  {/if}

  <!-- ─── HOME SCREEN ─── -->
  {#if mp.phase === 'home'}
    <div class="home">
      <div class="setup-section">
        <label for="playerName">Your Name</label>
        <input
          id="playerName"
          type="text"
          bind:value={playerName}
          placeholder="Enter your name..."
        />
      </div>

      <div class="tab-bar">
        <button class="tab-btn" class:active={homeTab === 'create'} onclick={() => homeTab = 'create'}>Create Party</button>
        <button class="tab-btn" class:active={homeTab === 'join'} onclick={() => homeTab = 'join'}>Join Party</button>
      </div>

      {#if homeTab === 'create'}
        <div class="setup-section">
          <div class="public-toggle">
            <button
              class="toggle-btn"
              class:active={createPublic}
              onclick={() => createPublic = true}
            >Public</button>
            <button
              class="toggle-btn"
              class:active={!createPublic}
              onclick={() => createPublic = false}
            >Private</button>
          </div>
          <p class="hint">
            {createPublic ? 'Anyone can find and join your party' : 'Only people with the code can join'}
          </p>
          <button
            class="start-btn"
            disabled={!playerName.trim()}
            onclick={handleCreate}
          >{!playerName.trim() ? 'Enter your name above first' : 'Create Party'}</button>
        </div>
      {:else}
        <div class="setup-section">
          <label for="joinCode">Party Code</label>
          <input
            id="joinCode"
            type="text"
            bind:value={joinCode}
            placeholder="CHASE-1285"
            maxlength="10"
            class="code-input"
            oninput={formatCodeInput}
          />
          <button
            class="start-btn"
            disabled={!playerName.trim() || !joinCode.trim()}
            onclick={() => handleJoin()}
          >{!playerName.trim() ? 'Enter your name above first' : 'Join Party'}</button>
        </div>

        <button class="browse-toggle" onclick={handleBrowse}>
          {showBrowse ? 'Hide' : 'Browse'} Public Parties
        </button>

        {#if showBrowse}
          <div class="public-list">
            {#if mp.publicParties.length === 0}
              <p class="empty-text">No public parties available</p>
            {:else}
              {#each mp.publicParties as party}
                <div class="public-party-card">
                  <div class="pp-info">
                    <span class="pp-host">{party.hostName}'s party</span>
                    <span class="pp-details">{party.categoryName} &middot; {party.playerCount} player{party.playerCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div class="pp-actions">
                    <span class="pp-code">{party.code}</span>
                    {#if party.phase === 'lobby'}
                      <button
                        class="pp-join-btn"
                        disabled={!playerName.trim()}
                        onclick={() => handleJoin(party.code)}
                      >{!playerName.trim() ? 'Name first' : 'Join'}</button>
                    {:else}
                      <span class="pp-status">In Game</span>
                    {/if}
                  </div>
                </div>
              {/each}
            {/if}
            <button class="refresh-btn" onclick={() => mp.browseParties()}>Refresh</button>
          </div>
        {/if}
      {/if}
    </div>

  <!-- ─── LOBBY SCREEN ─── -->
  {:else if mp.phase === 'lobby'}
    <div class="lobby">
      <div class="party-code-section">
        <span class="code-label">Party Code</span>
        <div class="code-display">
          <span class="code-text">{mp.partyCode}</span>
          <button class="copy-btn" onclick={copyCode}>Copy</button>
        </div>
        {#if mp.isHost}
          <div class="public-toggle small">
            <button class="toggle-btn small" class:active={mp.isPublic} onclick={() => mp.updateSettings({ isPublic: true })}>Public</button>
            <button class="toggle-btn small" class:active={!mp.isPublic} onclick={() => mp.updateSettings({ isPublic: false })}>Private</button>
          </div>
        {:else}
          <span class="visibility-label">{mp.isPublic ? 'Public' : 'Private'} party</span>
        {/if}
      </div>

      <div class="setup-section">
        <label>Players ({mp.players.length}/8)</label>
        <div class="player-list">
          {#each mp.players as player}
            <div class="lobby-player" class:host={player.id === mp.hostId} class:me={player.id === mp.myId}>
              <span class="lp-name">{player.name}</span>
              {#if player.id === mp.hostId}<span class="lp-badge">Host</span>{/if}
              {#if player.id === mp.myId}<span class="lp-you">You</span>{/if}
            </div>
          {/each}
        </div>
      </div>

      <!-- Settings (host editable, others read-only) -->
      <div class="setup-section">
        <label>Category</label>
        {#if mp.isHost}
          {#if previewCategory}
            <div class="category-preview">
              <div class="preview-header">
                <button class="back-btn" onclick={() => { previewCategory = null; previewSearch = ''; }}>&larr; Back</button>
                <div class="preview-title">
                  <h3>{previewCategory.name}</h3>
                  <p>{previewCategory.description}</p>
                </div>
                <button class="select-btn" onclick={() => selectCategory(previewCategory!)}>Select</button>
              </div>
              <div class="preview-tags">
                {#each previewCategory.tags as tag}
                  <span class="tag">{tag}</span>
                {/each}
              </div>
              <input type="text" bind:value={previewSearch} placeholder="Search items..." class="preview-search" />
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
            <input type="text" bind:value={categorySearch} placeholder="Search categories..." />
            <div class="tag-bar">
              <button class="tag-btn" class:active={activeTag === null} onclick={() => activeTag = null}>All</button>
              {#each allTags as tag}
                <button class="tag-btn" class:active={activeTag === tag} onclick={() => activeTag = activeTag === tag ? null : tag}>{tag}</button>
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
                  onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') mp.updateSettings({ categoryId: cat.id }); }}
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
                  <button class="browse-items-btn" onclick={(e: MouseEvent) => { e.stopPropagation(); previewCategory = cat; previewSearch = ''; }}>Browse items</button>
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

      <div class="setup-section">
        <label>Game Mode</label>
        {#if mp.isHost}
          <div class="mode-toggle">
            <button class="mode-btn" class:active={mp.mode === 'strikes'} onclick={() => mp.updateSettings({ mode: 'strikes' })}>
              <span class="mode-icon">&#10060;</span> Strikes
            </button>
            <button class="mode-btn" class:active={mp.mode === 'turns'} onclick={() => mp.updateSettings({ mode: 'turns' })}>
              <span class="mode-icon">&#128260;</span> Turns
            </button>
          </div>
          {#if mp.mode === 'strikes'}
            <div class="mode-config">
              <label for="maxStrikes">Strikes to eliminate</label>
              <div class="player-count-row">
                <button class="count-btn" disabled={mp.maxStrikes <= 1} onclick={() => mp.updateSettings({ maxStrikes: mp.maxStrikes - 1 })}>-</button>
                <span class="count-display">{mp.maxStrikes}</span>
                <button class="count-btn" disabled={mp.maxStrikes >= 10} onclick={() => mp.updateSettings({ maxStrikes: mp.maxStrikes + 1 })}>+</button>
              </div>
            </div>
          {:else}
            <div class="mode-config">
              <label for="maxTurns">Turns per player</label>
              <div class="player-count-row">
                <button class="count-btn" disabled={mp.maxTurns <= 1} onclick={() => mp.updateSettings({ maxTurns: mp.maxTurns - 1 })}>-</button>
                <span class="count-display">{mp.maxTurns}</span>
                <button class="count-btn" disabled={mp.maxTurns >= 50} onclick={() => mp.updateSettings({ maxTurns: mp.maxTurns + 1 })}>+</button>
              </div>
            </div>
          {/if}
        {:else}
          <div class="readonly-setting">
            <span class="setting-value">
              {mp.mode === 'strikes' ? `Strikes (${mp.maxStrikes} to eliminate)` : `Turns (${mp.maxTurns} per player)`}
            </span>
          </div>
        {/if}
      </div>

      <div class="lobby-actions">
        {#if mp.isHost}
          <button
            class="start-btn"
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
  {:else if mp.phase === 'playing'}
    <div class="game">
      <div class="game-header">
        <div class="category-badge">{mp.category.name}</div>
        <div class="mode-badge">{mp.mode === 'strikes' ? 'Strikes' : 'Turns'} Mode</div>
        <div class="code-badge">{mp.partyCode}</div>
      </div>

      <div class="scoreboard">
        {#each mp.players as player, i}
          <div
            class="player-card"
            class:active={player.id === mp.currentPlayerId}
            class:eliminated={player.eliminated}
            class:me={player.id === mp.myId}
          >
            <div class="player-name">
              {player.name}
              {#if player.id === mp.myId}<span class="you-tag">you</span>{/if}
            </div>
            <div class="player-score">{player.score} pts</div>
            <div class="player-meta">
              {#if mp.mode === 'strikes'}
                <span class="strikes">
                  {#each Array(mp.maxStrikes) as _, s}
                    <span class="strike-dot" class:hit={s < player.strikes}>&#10060;</span>
                  {/each}
                </span>
              {:else}
                <span class="turns-left">
                  {mp.maxTurns - player.guesses} left
                </span>
              {/if}
            </div>
            {#if player.eliminated}
              <div class="eliminated-badge">OUT</div>
            {/if}
          </div>
        {/each}
      </div>

      {#if mp.showResult && mp.lastResult}
        <div class="result" class:hit={!mp.lastResult.isStrike} class:miss={mp.lastResult.isStrike}>
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
          <button class="next-btn" onclick={() => mp.nextTurn()}>
            Next Turn
          </button>
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
            <button class="guess-btn" disabled={!guessInput.trim()} onclick={() => handleSubmitGuess(guessInput)}>Guess</button>
          </div>
        </div>
      {:else}
        <div class="guess-area waiting">
          <div class="current-turn">
            <span class="turn-label">Waiting for {mp.currentPlayer?.name ?? '...'}...</span>
          </div>
        </div>
      {/if}

      <div class="guessed-list">
        <h3>Guessed so far ({mp.guessedItems.length}/100)</h3>
        <div class="guessed-grid">
          {#each [...mp.guessedItems].sort((a, b) => a.index - b.index) as item}
            <div class="guessed-item">
              <span class="guessed-rank">#{item.index + 1}</span>
              <span class="guessed-name">{item.name}</span>
              <span class="guessed-by">{item.playerName}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>

  <!-- ─── RESULTS SCREEN ─── -->
  {:else if mp.phase === 'results'}
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
              {player.strikes} strike{player.strikes !== 1 ? 's' : ''}
              {#if player.eliminated}&middot; Eliminated{/if}
            </span>
          </div>
        {/each}
      </div>

      <div class="guessed-list">
        <h3>All Guessed Items ({mp.guessedItems.length}/100)</h3>
        <div class="guessed-grid">
          {#each [...mp.guessedItems].sort((a, b) => a.index - b.index) as item}
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
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap');

  :global(body) {
    margin: 0;
    font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif;
    background: #F5E6C8;
    color: #1A1A1A;
    min-height: 100vh;
  }

  .app {
    max-width: 720px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  header {
    text-align: center;
    margin-bottom: 2rem;
    border-bottom: 4px double #1A1A1A;
    padding-bottom: 1rem;
  }

  .edition-date {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #666;
    margin: 0 0 0.25rem;
    font-family: 'Source Serif 4', Georgia, serif;
  }

  header h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 3.2rem;
    font-weight: 900;
    margin: 0;
    color: #1A1A1A;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .subtitle {
    color: #666;
    margin: 0.35rem 0 0;
    font-size: 0.9rem;
    font-style: italic;
  }

  /* Error */
  .error-banner {
    background: #FFFEF2;
    border: 1px solid #8B0000;
    color: #8B0000;
    padding: 0.6rem 1rem;
    margin-bottom: 1rem;
    text-align: center;
    font-size: 0.9rem;
    animation: slideIn 0.3s ease-out;
  }

  /* Shared */
  .setup-section {
    background: #FFFEF2;
    border: 1px solid #D4C5A0;
    padding: 1.25rem;
    margin-bottom: 1rem;
  }

  .setup-section > label {
    display: block;
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #555;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid #E8D9B8;
    padding-bottom: 0.4rem;
  }

  input[type="text"] {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid #C4B48A;
    background: #FFFEF2;
    color: #1A1A1A;
    font-size: 1rem;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.2s;
    font-family: 'Source Serif 4', Georgia, serif;
  }

  input[type="text"]:focus {
    border-color: #8B0000;
  }

  .hint {
    color: #777;
    font-size: 0.85rem;
    margin: 0.5rem 0 0;
    font-style: italic;
  }

  .start-btn {
    width: 100%;
    padding: 0.85rem 2rem;
    border: 2px solid #1A1A1A;
    background: #1A1A1A;
    color: #F5E6C8;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    margin-top: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .start-btn:hover:not(:disabled) {
    background: #FFFEF2;
    color: #1A1A1A;
  }

  .start-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ─── HOME ─── */
  .home {
    max-width: 420px;
    margin: 0 auto;
  }

  .tab-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    margin-bottom: 1rem;
    border: 1px solid #C4B48A;
    overflow: hidden;
  }

  .tab-btn {
    padding: 0.75rem;
    border: none;
    background: #FFFEF2;
    color: #888;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab-btn.active {
    background: #1A1A1A;
    color: #F5E6C8;
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
    border: 1px solid #C4B48A;
    background: #FFFEF2;
    color: #888;
    font-family: 'Source Serif 4', Georgia, serif;
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
    border-color: #1A1A1A;
    background: #1A1A1A;
    color: #F5E6C8;
  }

  .code-input {
    text-align: center;
    font-size: 1.3rem !important;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-family: 'Courier New', Courier, monospace !important;
  }

  .browse-toggle {
    width: 100%;
    padding: 0.6rem;
    border: 1px solid #C4B48A;
    background: transparent;
    color: #777;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Source Serif 4', Georgia, serif;
    margin-bottom: 1rem;
  }

  .browse-toggle:hover {
    border-color: #1A1A1A;
    color: #1A1A1A;
  }

  .public-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .public-party-card {
    background: #FFFEF2;
    border: 1px solid #D4C5A0;
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pp-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .pp-host {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .pp-details {
    font-size: 0.8rem;
    color: #888;
  }

  .pp-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .pp-code {
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.8rem;
    color: #8B0000;
    background: rgba(139, 0, 0, 0.06);
    padding: 0.2rem 0.5rem;
  }

  .pp-join-btn {
    padding: 0.35rem 0.8rem;
    border: 1px solid #1A1A1A;
    background: #1A1A1A;
    color: #F5E6C8;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Source Serif 4', Georgia, serif;
  }

  .pp-join-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .pp-status {
    font-size: 0.8rem;
    color: #8B6914;
    font-style: italic;
  }

  .refresh-btn {
    align-self: center;
    padding: 0.4rem 1rem;
    border: 1px solid #C4B48A;
    background: transparent;
    color: #777;
    font-size: 0.8rem;
    cursor: pointer;
    font-family: 'Source Serif 4', Georgia, serif;
  }

  .empty-text {
    text-align: center;
    color: #888;
    font-size: 0.9rem;
    padding: 1rem;
    font-style: italic;
  }

  /* ─── LOBBY ─── */
  .lobby {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .party-code-section {
    text-align: center;
    background: #FFFEF2;
    border: 1px solid #D4C5A0;
    padding: 1.25rem;
    margin-bottom: 1rem;
  }

  .code-label {
    display: block;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #777;
    margin-bottom: 0.5rem;
  }

  .code-display {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
  }

  .code-text {
    font-size: 1.8rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    font-family: 'Courier New', Courier, monospace;
    color: #8B0000;
  }

  .copy-btn {
    padding: 0.35rem 0.7rem;
    border: 1px solid #C4B48A;
    background: transparent;
    color: #777;
    font-size: 0.8rem;
    cursor: pointer;
    font-family: 'Source Serif 4', Georgia, serif;
    transition: all 0.2s;
  }

  .copy-btn:hover {
    border-color: #1A1A1A;
    color: #1A1A1A;
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
    background: #F5E6C8;
    border: 1px solid transparent;
    border-bottom: 1px solid #E8D9B8;
  }

  .lobby-player.me {
    border-color: #C4B48A;
    background: #FFF8E8;
  }

  .lp-name {
    flex: 1;
    font-weight: 500;
  }

  .lp-badge {
    font-size: 0.7rem;
    padding: 0.15rem 0.45rem;
    background: rgba(139, 0, 0, 0.1);
    color: #8B0000;
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

  .readonly-setting {
    padding: 0.5rem 0;
  }

  .setting-value {
    font-weight: 600;
    font-size: 1rem;
  }

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
    background: #FFFEF2;
    border: 1px solid #D4C5A0;
  }

  .leave-btn {
    padding: 0.6rem;
    border: 1px solid #C4B48A;
    background: transparent;
    color: #888;
    font-size: 0.9rem;
    cursor: pointer;
    font-family: 'Source Serif 4', Georgia, serif;
    transition: all 0.2s;
  }

  .leave-btn:hover {
    border-color: #8B0000;
    color: #8B0000;
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
    border: 1px solid #C4B48A;
    background: transparent;
    color: #777;
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: capitalize;
  }

  .tag-btn:hover { border-color: #1A1A1A; color: #1A1A1A; }
  .tag-btn.active { background: #1A1A1A; border-color: #1A1A1A; color: #F5E6C8; }

  .category-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .category-card {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 0.85rem 1rem;
    border: 1px solid #D4C5A0;
    background: #FFFEF2;
    cursor: pointer;
    transition: all 0.2s;
  }

  .category-card:hover { border-color: #1A1A1A; }
  .category-card.selected { border-color: #8B0000; background: rgba(139, 0, 0, 0.03); }

  .card-top { display: flex; justify-content: space-between; align-items: center; }
  .card-name { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; font-size: 0.95rem; }
  .card-check { color: #8B0000; font-weight: 700; }
  .card-desc { font-size: 0.8rem; color: #888; font-style: italic; }
  .card-tags { display: flex; gap: 0.35rem; margin-top: 0.15rem; }
  .card-tag {
    font-size: 0.7rem;
    padding: 0.15rem 0.45rem;
    background: rgba(139, 0, 0, 0.06);
    color: #8B0000;
    text-transform: capitalize;
  }

  .browse-items-btn {
    align-self: flex-start;
    margin-top: 0.25rem;
    padding: 0.25rem 0.6rem;
    border: 1px solid #C4B48A;
    background: transparent;
    color: #777;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Source Serif 4', Georgia, serif;
  }

  .browse-items-btn:hover { border-color: #1A1A1A; color: #1A1A1A; }

  /* Category preview */
  .category-preview { display: flex; flex-direction: column; gap: 0.75rem; }
  .preview-header { display: flex; align-items: center; gap: 0.75rem; }

  .back-btn {
    padding: 0.4rem 0.7rem;
    border: 1px solid #C4B48A;
    background: transparent;
    color: #777;
    font-size: 0.85rem;
    cursor: pointer;
    font-family: 'Source Serif 4', Georgia, serif;
    white-space: nowrap;
  }

  .back-btn:hover { border-color: #1A1A1A; color: #1A1A1A; }

  .preview-title { flex: 1; }
  .preview-title h3 { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 1rem; }
  .preview-title p { margin: 0; font-size: 0.8rem; color: #888; font-style: italic; }

  .select-btn {
    padding: 0.4rem 1rem;
    border: 1px solid #1A1A1A;
    background: #1A1A1A;
    color: #F5E6C8;
    font-family: 'Source Serif 4', Georgia, serif;
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
    color: #8B0000;
    text-transform: capitalize;
  }

  .preview-list {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    max-height: 350px;
    overflow-y: auto;
  }

  .preview-search {
    border: 1px solid #C4B48A;
  }

  .preview-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.35rem 0.5rem;
    background: #F5E6C8;
    font-size: 0.85rem;
    border-bottom: 1px solid #E8D9B8;
  }

  .preview-rank { color: #8B0000; font-weight: 700; min-width: 2.2rem; }
  .preview-name { flex: 1; }
  .preview-points { color: #888; font-size: 0.75rem; font-weight: 600; }
  .preview-empty { text-align: center; color: #888; padding: 1rem; font-size: 0.85rem; font-style: italic; }

  /* ─── GAME MODE TOGGLE ─── */
  .mode-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .mode-btn {
    padding: 1rem;
    border: 1px solid #D4C5A0;
    background: #FFFEF2;
    color: #888;
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .mode-btn:hover { border-color: #1A1A1A; }
  .mode-btn.active { border-color: #1A1A1A; background: #1A1A1A; color: #F5E6C8; }
  .mode-icon { font-size: 1.5rem; }

  .mode-config {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #E8D9B8;
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
    border: 1px solid #C4B48A;
    background: #FFFEF2;
    color: #1A1A1A;
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .count-btn:hover:not(:disabled) { border-color: #1A1A1A; background: #F5E6C8; }
  .count-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .count-display { font-family: 'Playfair Display', Georgia, serif; font-size: 1.5rem; font-weight: 700; min-width: 2rem; text-align: center; }

  /* ─── GAME ─── */
  .game-header {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    padding-bottom: 1rem;
    border-bottom: 1px solid #D4C5A0;
  }

  .category-badge, .mode-badge, .code-badge {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    font-weight: 600;
    border: 1px solid;
  }

  .category-badge { background: rgba(139, 0, 0, 0.06); color: #8B0000; border-color: rgba(139, 0, 0, 0.2); }
  .mode-badge { background: rgba(26, 26, 26, 0.05); color: #555; border-color: #D4C5A0; }
  .code-badge { background: rgba(26, 26, 26, 0.05); color: #555; border-color: #D4C5A0; font-family: 'Courier New', Courier, monospace; }

  .scoreboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 0.6rem;
    margin-bottom: 1.5rem;
  }

  .player-card {
    background: #FFFEF2;
    border: 1px solid #D4C5A0;
    padding: 0.65rem;
    text-align: center;
    transition: all 0.3s;
    position: relative;
  }

  .player-card.active { border-color: #8B0000; background: rgba(139, 0, 0, 0.03); box-shadow: 0 0 12px rgba(139, 0, 0, 0.08); }
  .player-card.eliminated { opacity: 0.4; }
  .player-card.me { border-color: #C4B48A; border-width: 2px; }

  .player-name { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; font-size: 0.85rem; margin-bottom: 0.15rem; }
  .player-score { font-family: 'Playfair Display', Georgia, serif; font-size: 1.3rem; font-weight: 700; color: #8B0000; }
  .player-meta { margin-top: 0.2rem; }
  .strike-dot { font-size: 0.65rem; opacity: 0.2; margin: 0 1px; }
  .strike-dot.hit { opacity: 1; }
  .turns-left { font-size: 0.75rem; color: #888; }

  .you-tag {
    font-size: 0.65rem;
    padding: 0.1rem 0.35rem;
    background: rgba(26, 26, 26, 0.08);
    color: #555;
    font-weight: 600;
    margin-left: 0.25rem;
    font-style: italic;
  }

  .eliminated-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #8B0000;
    color: #FFFEF2;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 2px 6px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .guess-area {
    background: #FFFEF2;
    border: 1px solid #D4C5A0;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .guess-area.waiting {
    text-align: center;
    padding: 2rem 1.5rem;
  }

  .current-turn { text-align: center; margin-bottom: 1rem; }
  .turn-label { font-family: 'Playfair Display', Georgia, serif; font-size: 1.1rem; font-weight: 700; color: #8B0000; }
  .guess-area.waiting .turn-label { color: #888; font-style: italic; }

  form { display: flex; gap: 0.5rem; }
  form input { flex: 1; }
  .guess-form { display: flex; gap: 0.5rem; }

  .guess-btn {
    padding: 0.6rem 1.25rem;
    border: 1px solid #1A1A1A;
    background: #1A1A1A;
    color: #F5E6C8;
    font-family: 'Source Serif 4', Georgia, serif;
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

  .result.hit { background: #FFFEF2; border: 2px solid #2D5016; }
  .result.miss { background: #FFFEF2; border: 2px solid #8B0000; }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .result-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
  .result-text { font-size: 1rem; margin-bottom: 0.25rem; }
  .result-points { font-family: 'Playfair Display', Georgia, serif; font-size: 1.3rem; font-weight: 700; margin-bottom: 1rem; }
  .hit .result-points { color: #2D5016; }
  .miss .result-points { color: #8B0000; }

  .next-btn {
    padding: 0.6rem 1.5rem;
    border: 1px solid #1A1A1A;
    background: #1A1A1A;
    color: #F5E6C8;
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  }

  .next-btn:hover { background: #333; }

  /* Guessed list */
  .guessed-list {
    background: #FFFEF2;
    border: 1px solid #D4C5A0;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .guessed-list h3 {
    margin: 0 0 0.75rem;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #777;
    border-bottom: 1px solid #E8D9B8;
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
    border-bottom: 1px solid #EDE0C4;
    font-size: 0.85rem;
  }

  .guessed-rank { color: #8B0000; font-weight: 700; min-width: 2.5rem; }
  .guessed-name { flex: 1; }
  .guessed-by { color: #999; font-size: 0.8rem; font-style: italic; }

  /* Results */
  .results { text-align: center; }
  .results h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 2rem; margin-bottom: 1rem; }

  .winner-banner {
    background: #FFFEF2;
    border: 2px solid #8B0000;
    padding: 2rem;
    margin-bottom: 2rem;
    animation: slideIn 0.5s ease-out;
  }

  .winner-banner.tie {
    border-color: #8B6914;
  }

  .winner-icon { font-size: 3rem; margin-bottom: 0.5rem; }
  .winner-name { font-family: 'Playfair Display', Georgia, serif; font-size: 1.5rem; font-weight: 700; }
  .winner-score { font-size: 1.1rem; color: #8B0000; margin-top: 0.25rem; }

  .final-rankings {
    background: #FFFEF2;
    border: 1px solid #D4C5A0;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .final-rankings h3 {
    margin: 0 0 0.75rem;
    text-align: center;
    color: #777;
    font-family: 'Playfair Display', Georgia, serif;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 0.1em;
  }

  .ranking-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.5rem;
    border-bottom: 1px solid #EDE0C4;
  }

  .ranking-row.first { background: rgba(139, 0, 0, 0.04); }
  .ranking-position { font-size: 1.2rem; min-width: 2rem; text-align: center; }
  .ranking-name { flex: 1; font-weight: 600; }
  .ranking-score { font-weight: 700; color: #8B0000; }
  .ranking-details { font-size: 0.8rem; color: #888; font-style: italic; }
</style>
