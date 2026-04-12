<script lang="ts">
  import { goto } from "$app/navigation";
  import { getMultiplayerState } from "$lib/multiplayer.svelte";
  import { getDailyCategory, loadDailyStats, getTodayKey } from "$lib/daily";

  const mp = getMultiplayerState();

  // Daily info
  const dailyCategory = getDailyCategory();
  const todayKey = getTodayKey();
  let dailyStats = $state(loadDailyStats());
  const hasPlayed = $derived(!!dailyStats.history[todayKey]);
  const hasHistory = $derived(dailyStats.gamesPlayed > 0);

  // Party form state
  let view = $state<"home" | "party">("home");
  let playerName = $state("");
  let joinCode = $state("");
  let createPublic = $state(true);
  let showBrowse = $state(false);
  let partyTab = $state<"create" | "join">("create");

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

  function formatCodeInput() {
    let raw = joinCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    let letters = raw.slice(0, 5).replace(/[^A-Z]/g, "");
    let digits = raw
      .slice(5)
      .replace(/[^0-9]/g, "")
      .slice(0, 4);
    if (digits.length > 0) {
      joinCode = `${letters}-${digits}`;
    } else {
      joinCode = letters;
    }
  }
</script>

<div class="app">
  <header>
    <div class="header-rule"></div>
    <h1>Common Cents</h1>
    <p class="subtitle">The Top&nbsp;100 Ranking Game</p>
    <div class="header-rule"></div>
    <p class="tagline">
      Name things from a Top&nbsp;100 list. Harder answers score more.
      Accumulate as many points as you can.
    </p>
  </header>

  {#if mp.error}
    <div class="error-banner">{mp.error}</div>
  {/if}

  {#if view === "home"}
    <div class="home">
      <div class="mode-selector">
        <button class="mode-card" onclick={() => goto('/daily')}>
          <div class="icon">&#9728;</div>
          <h3>Daily</h3>
          <p>
            {#if hasPlayed}
              Already played today!
            {:else}
              Today: {dailyCategory.tags[0]}
            {/if}
          </p>
        </button>
        <button class="mode-card" onclick={() => (view = "party")}>
          <div class="icon">&#9734;</div>
          <h3>Party</h3>
          <p>Play with friends.<br />Create or join a game.</p>
        </button>
      </div>

      {#if hasHistory}
        <div class="stats-bar">
          <div class="stat">
            <div class="stat-value">{dailyStats.streak}</div>
            <div class="stat-label">Streak</div>
          </div>
          <div class="stat">
            <div class="stat-value">{dailyStats.bestScore}</div>
            <div class="stat-label">Best</div>
          </div>
          <div class="stat">
            <div class="stat-value">{dailyStats.gamesPlayed}</div>
            <div class="stat-label">Played</div>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="home">
      <button class="back-btn" onclick={() => (view = "home")}>&larr; Back</button>

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
        <button
          class="tab-btn"
          class:active={partyTab === "create"}
          onclick={() => (partyTab = "create")}>Create Party</button
        >
        <button
          class="tab-btn"
          class:active={partyTab === "join"}
          onclick={() => (partyTab = "join")}>Join Party</button
        >
      </div>

      {#if partyTab === "create"}
        <div class="setup-section">
          <div class="public-toggle">
            <button
              class="toggle-btn"
              class:active={createPublic}
              onclick={() => (createPublic = true)}>Public</button
            >
            <button
              class="toggle-btn"
              class:active={!createPublic}
              onclick={() => (createPublic = false)}>Private</button
            >
          </div>
          <p class="hint">
            {createPublic
              ? "Anyone can find and join your party"
              : "Only people with the code can join"}
          </p>
          <button
            class="start-btn"
            disabled={!playerName.trim()}
            onclick={handleCreate}
            >{!playerName.trim()
              ? "Enter your name first"
              : "Create Party"}</button
          >
        </div>
      {:else}
        <div class="setup-section">
          <label for="joinCode">Party Code</label>
          <input
            id="joinCode"
            type="text"
            bind:value={joinCode}
            placeholder="XXXXX-0000"
            maxlength="10"
            class="code-input"
            oninput={formatCodeInput}
          />
          <button
            class="start-btn"
            disabled={!playerName.trim() || !joinCode.trim()}
            onclick={() => handleJoin()}
            >{!playerName.trim()
              ? "Enter your name above first"
              : "Join Party"}</button
          >
        </div>

        <button class="browse-toggle" onclick={handleBrowse}>
          {showBrowse ? "Hide" : "Browse"} Public Parties
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
                    <span class="pp-details"
                      >{party.categoryName} &middot; {party.playerCount} player{party.playerCount !==
                      1
                        ? "s"
                        : ""}</span
                    >
                  </div>
                  <div class="pp-actions">
                    <span class="pp-code">{party.code}</span>
                    {#if party.phase === "lobby"}
                      <button
                        class="pp-join-btn"
                        disabled={!playerName.trim()}
                        onclick={() => handleJoin(party.code)}
                        >{!playerName.trim() ? "Name first" : "Join"}</button
                      >
                    {:else}
                      <span class="pp-status">In Game</span>
                    {/if}
                  </div>
                </div>
              {/each}
            {/if}
            <button class="refresh-btn" onclick={() => mp.browseParties()}
              >Refresh</button
            >
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  .app {
    max-width: 720px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  /* ─── MASTHEAD ─── */
  header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .header-rule {
    border: none;
    border-top: 3px double var(--color-ink);
    margin: 0.35rem 0;
  }

  header h1 {
    font-family: "Playfair Display", Georgia, serif;
    font-size: clamp(2rem, 8vw, 3rem);
    font-weight: 900;
    margin: 0.3rem 0 0.15rem;
    color: var(--color-ink);
    letter-spacing: 0.04em;
    line-height: 1;
    text-transform: uppercase;
  }

  .subtitle {
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.8rem;
    color: #777;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin: 0.15rem 0;
  }

  .tagline {
    font-size: 0.95rem;
    color: #555;
    font-style: italic;
    line-height: 1.5;
    margin: 0.75rem auto 0;
    max-width: 420px;
  }

  /* Error */
  .error-banner {
    background: var(--color-cream);
    border: 1px solid var(--color-crimson);
    color: var(--color-crimson);
    padding: 0.6rem 1rem;
    margin-bottom: 1rem;
    text-align: center;
    font-size: 0.9rem;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ─── HOME ─── */
  .home {
    max-width: 380px;
    margin: 0 auto;
  }

  /* ─── MODE SELECTOR ─── */
  .mode-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 1.25rem;
  }

  .mode-card {
    border: 2px solid var(--color-ink);
    padding: 1.25rem 1rem;
    text-align: center;
    cursor: pointer;
    background: var(--color-cream);
    transition: all 0.2s;
    font-family: inherit;
  }

  .mode-card:hover {
    background: var(--color-ink);
    color: var(--color-parchment);
  }

  .mode-card:focus-visible {
    outline: 2px solid var(--color-crimson);
    outline-offset: 2px;
  }

  .mode-card .icon {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }

  .mode-card h3 {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 0.35rem;
  }

  .mode-card p {
    font-size: 0.8rem;
    color: #777;
    margin: 0;
    line-height: 1.4;
  }

  .mode-card:hover p {
    color: #ccc;
  }

  /* ─── STATS BAR ─── */
  .stats-bar {
    display: flex;
    justify-content: space-around;
    border: 1px solid var(--color-gold);
    padding: 0.75rem;
    background: rgba(212, 201, 168, 0.15);
  }

  .stat {
    text-align: center;
  }

  .stat-value {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.4rem;
    font-weight: 700;
  }

  .stat-label {
    font-size: 0.65rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* ─── BACK BUTTON ─── */
  .back-btn {
    background: none;
    border: none;
    color: #777;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0;
    margin-bottom: 1rem;
    font-family: inherit;
  }

  .back-btn:hover {
    color: var(--color-ink);
  }

  /* ─── PARTY FORM (same styles as before) ─── */
  .setup-section {
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
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
    border: 1px solid var(--color-gold);
    background: var(--color-cream);
    color: var(--color-ink);
    font-size: 1rem;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.2s;
    font-family: "Source Serif 4", Georgia, serif;
  }

  input[type="text"]:focus-visible {
    border-color: var(--color-crimson);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-crimson) 20%, transparent);
  }

  .hint {
    color: #777;
    font-size: 0.85rem;
    margin: 0.5rem 0 0;
    font-style: italic;
  }

  .start-btn {
    display: block;
    width: 100%;
    padding: 0.85rem 2rem;
    border: 2px solid var(--color-ink);
    background: var(--color-ink);
    color: var(--color-parchment);
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      background 0.2s,
      color 0.2s;
    margin-top: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-align: center;
  }

  .start-btn:hover:not(:disabled) {
    background: var(--color-cream);
    color: var(--color-ink);
  }

  .start-btn:focus-visible {
    outline: 2px solid var(--color-crimson);
    outline-offset: 2px;
  }

  .start-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .tab-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    margin-bottom: 1rem;
    border: 1px solid var(--color-gold);
    overflow: hidden;
  }

  .tab-btn {
    padding: 0.75rem;
    border: none;
    background: var(--color-cream);
    color: #888;
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab-btn.active {
    background: var(--color-ink);
    color: var(--color-parchment);
  }

  .tab-btn:focus-visible {
    outline: 2px solid var(--color-crimson);
    outline-offset: -2px;
  }

  .public-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .toggle-btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-gold);
    background: var(--color-cream);
    color: #888;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .toggle-btn.active {
    border-color: var(--color-ink);
    background: var(--color-ink);
    color: var(--color-parchment);
  }

  .toggle-btn:focus-visible {
    outline: 2px solid var(--color-crimson);
    outline-offset: 2px;
  }

  .code-input {
    text-align: center;
    font-size: 1.3rem !important;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-family: "Courier New", Courier, monospace !important;
  }

  .browse-toggle {
    width: 100%;
    padding: 0.6rem;
    border: 1px solid var(--color-gold);
    background: transparent;
    color: #777;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: "Source Serif 4", Georgia, serif;
    margin-bottom: 1rem;
  }

  .browse-toggle:hover {
    border-color: var(--color-ink);
    color: var(--color-ink);
  }

  .public-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .public-party-card {
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
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
    font-family: "Courier New", Courier, monospace;
    font-size: 0.8rem;
    color: var(--color-crimson);
    background: rgba(139, 0, 0, 0.06);
    padding: 0.2rem 0.5rem;
  }

  .pp-join-btn {
    padding: 0.35rem 0.8rem;
    border: 1px solid var(--color-ink);
    background: var(--color-ink);
    color: var(--color-parchment);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    font-family: "Source Serif 4", Georgia, serif;
  }

  .pp-join-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .pp-status {
    font-size: 0.8rem;
    color: #8b6914;
    font-style: italic;
  }

  .refresh-btn {
    align-self: center;
    padding: 0.4rem 1rem;
    border: 1px solid var(--color-gold);
    background: transparent;
    color: #777;
    font-size: 0.8rem;
    cursor: pointer;
    font-family: "Source Serif 4", Georgia, serif;
  }

  .empty-text {
    text-align: center;
    color: #888;
    font-size: 0.9rem;
    padding: 1rem;
    font-style: italic;
  }
</style>
