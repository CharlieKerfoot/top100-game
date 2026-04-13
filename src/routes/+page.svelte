<script lang="ts">
  import { goto } from "$app/navigation";
  import { getMultiplayerState } from "$lib/multiplayer.svelte";
  import { getDailyList, loadDailyStats, getTodayKey } from "$lib/daily";
  import { lists } from "$lib/lists/index";

  const mp = getMultiplayerState();

  // Daily info
  const dailyList = getDailyList();
  const todayKey = getTodayKey();
  let dailyStats = $state(loadDailyStats());
  const hasPlayed = $derived(!!dailyStats.history[todayKey]);
  const hasHistory = $derived(dailyStats.gamesPlayed > 0);
  const allTopics = $derived(
    [...new Set(lists.flatMap((c) => c.topics))].sort(),
  );

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
        <button class="mode-card" onclick={() => goto("/daily")}>
          <div class="icon">&#9728;</div>
          <h3>Daily</h3>
          <p>
            {#if hasPlayed}
              Played! Score: {dailyStats.history[todayKey].score}
            {:else}
              {dailyList.name}
              <span class="daily-desc">{dailyList.description}</span>
            {/if}
          </p>
        </button>
        <button class="mode-card" onclick={() => (view = "party")}>
          <div class="icon">&#9734;</div>
          <h3>Party</h3>
          <p>Play with friends.<br />Create or join a game.</p>
        </button>
      </div>

      <div class="stats-bar">
        <div class="stat">
          <div class="stat-value">
            {hasHistory ? dailyStats.streak : "\u2014"}
          </div>
          <div class="stat-label">Streak</div>
        </div>
        <div class="stat">
          <div class="stat-value">
            {hasHistory ? dailyStats.bestScore : "\u2014"}
          </div>
          <div class="stat-label">Best</div>
        </div>
        <div class="stat">
          <div class="stat-value">
            {hasHistory ? dailyStats.gamesPlayed : "\u2014"}
          </div>
          <div class="stat-label">Played</div>
        </div>
      </div>
      {#if !hasHistory}
        <p class="stats-cta">Play your first daily!</p>
      {/if}

      <div class="section-divider"></div>

      <section class="info-columns" aria-label="About the game">
        <div class="info-col">
          <h2 class="section-heading">How it Works</h2>
          <div class="how-steps">
            <div class="step">
              <span class="step-num">1</span>
              <div>
                <span class="step-title">Pick a top 100 list</span>
                <span class="step-desc"
                  >Choose from lists like Most Populous Countries or
                  Highest-Grossing Movies.</span
                >
              </div>
            </div>
            <div class="step">
              <span class="step-num">2</span>
              <div>
                <span class="step-title">Name items</span>
                <span class="step-desc"
                  >Type your guesses. Answers off the list are strikes (0 points
                  in turn mode).</span
                >
              </div>
            </div>
            <div class="step">
              <span class="step-num">3</span>
              <div>
                <span class="step-title">Score big</span>
                <span class="step-desc"
                  >Rarer answers score more. #1 = 1pt. #97 = 97pts. Go obscure.</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="info-col">
          <h2 class="section-heading">Scoring</h2>
          <div
            class="scoring-example"
            aria-label="Scoring example: naming India (#1) earns 1 point, Peru (#47) earns 47 points, Luxembourg (#97) earns 97 points. Rarer answers score more."
          >
            <div class="scoring-row scoring-low">
              <span class="scoring-rank">#1</span>
              <span class="scoring-name">India</span>
              <span class="scoring-pts">1 pt</span>
            </div>
            <div class="scoring-row scoring-mid">
              <span class="scoring-rank">#47</span>
              <span class="scoring-name">Peru</span>
              <span class="scoring-pts">47 pts</span>
            </div>
            <div class="scoring-row scoring-high">
              <span class="scoring-rank">#97</span>
              <span class="scoring-name">Luxembourg</span>
              <span class="scoring-pts">97 pts</span>
            </div>
          </div>
        </div>

        <div class="info-col">
          <h2 class="section-heading">Topics</h2>
          <div class="tag-cloud">
            {#each allTopics as topic}
              <span class="tag-chip">{topic}</span>
            {/each}
          </div>
        </div>
      </section>
    </div>
  {:else}
    <div class="home home-party">
      <button class="back-btn" onclick={() => (view = "home")}
        >&larr; Back</button
      >

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
                      >{party.listName} &middot; {party.playerCount} player{party.playerCount !==
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

  @media (min-width: 900px) {
    .app {
      max-width: 960px;
    }
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

  @media (min-width: 600px) {
    .home {
      max-width: 480px;
    }
  }

  @media (min-width: 900px) {
    .home {
      max-width: 100%;
    }
    .home.home-party {
      max-width: 540px;
    }
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

  @media (min-width: 900px) {
    .mode-card {
      padding: 1.75rem 1.5rem;
    }

    .mode-card .icon {
      font-size: 2.25rem;
    }

    .mode-card h3 {
      font-size: 1.3rem;
    }

    .mode-card p {
      font-size: 0.9rem;
    }
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

  .daily-desc {
    display: block;
    font-style: italic;
    margin-top: 0.2rem;
    line-height: 1.3;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: -webkit-box;
    overflow: hidden;
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
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--color-crimson) 20%, transparent);
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

  /* ─── STATS CTA ─── */
  .stats-cta {
    text-align: center;
    font-size: 0.8rem;
    color: #888;
    font-style: italic;
    margin: 0.5rem 0 0;
  }

  /* ─── INFO COLUMNS ─── */
  .info-columns {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 900px) {
    .info-columns {
      grid-template-columns: 1fr 1fr 1fr;
      gap: 2rem;
    }
  }

  /* ─── SECTION STYLES ─── */
  .section-heading {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #555;
    margin: 0 0 0.75rem;
    border-bottom: 1px solid #e8d9b8;
    padding-bottom: 0.4rem;
  }

  .section-divider {
    border: none;
    border-top: 1px solid var(--color-gold);
    margin: 1.25rem 0;
  }

  /* ─── HOW IT WORKS ─── */
  .how-steps {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .step {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
  }

  .step-num {
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 900;
    font-size: 1.1rem;
    color: var(--color-crimson);
    line-height: 1;
    min-width: 1rem;
  }

  .step-title {
    font-weight: 700;
    font-size: 0.9rem;
    display: block;
  }

  .step-desc {
    font-size: 0.85rem;
    color: #666;
    font-style: italic;
    display: block;
    line-height: 1.4;
  }

  /* ─── SCORING EXAMPLE ─── */
  .scoring-example {
    border: 1px solid var(--color-gold);
    padding: 1rem;
    background: var(--color-cream);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .scoring-row {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .scoring-rank {
    font-family: "Courier New", Courier, monospace;
    min-width: 2rem;
  }

  .scoring-name {
    flex: 1;
  }

  .scoring-pts {
    text-align: right;
    white-space: nowrap;
  }

  .scoring-low .scoring-rank {
    font-size: 0.75rem;
    color: #777;
  }
  .scoring-low .scoring-name {
    font-size: 0.9rem;
    color: #777;
  }
  .scoring-low .scoring-pts {
    font-size: 0.9rem;
    color: #777;
  }

  .scoring-mid .scoring-rank {
    font-size: 0.8rem;
    color: #555;
  }
  .scoring-mid .scoring-name {
    font-size: 0.95rem;
    color: var(--color-ink);
  }
  .scoring-mid .scoring-pts {
    font-size: 0.95rem;
    color: var(--color-ink);
    font-weight: 600;
  }

  .scoring-high .scoring-rank {
    font-size: 0.85rem;
    color: var(--color-crimson);
  }
  .scoring-high .scoring-name {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-ink);
  }
  .scoring-high .scoring-pts {
    font-size: 1.2rem;
    font-weight: 900;
    color: var(--color-crimson);
    font-family: "Playfair Display", Georgia, serif;
  }

  /* ─── TAG CLOUD ─── */
  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .tag-chip {
    padding: 0.25rem 0.65rem;
    border: 1px solid var(--color-gold);
    background: var(--color-cream);
    font-size: 0.75rem;
    font-family: "Source Serif 4", Georgia, serif;
    color: #666;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
</style>
