<script lang="ts">
  import { getMultiplayerState } from "$lib/multiplayer.svelte";

  const mp = getMultiplayerState();

  let playerName = $state("");
  let joinCode = $state("");
  let createPublic = $state(true);
  let showBrowse = $state(false);
  let homeTab = $state<"create" | "join">("create");

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
      <button
        class="tab-btn"
        class:active={homeTab === "create"}
        onclick={() => (homeTab = "create")}>Create Party</button
      >
      <button
        class="tab-btn"
        class:active={homeTab === "join"}
        onclick={() => (homeTab = "join")}>Join Party</button
      >
    </div>

    {#if homeTab === "create"}
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
    border-top: 3px double #1a1a1a;
    margin: 0.35rem 0;
  }

  header h1 {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 3rem;
    font-weight: 900;
    margin: 0.3rem 0 0.15rem;
    color: #1a1a1a;
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
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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

  input[type="text"]:focus-visible {
    border-color: #8b0000;
    box-shadow: 0 0 0 2px rgba(139, 0, 0, 0.2);
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
    border: 2px solid #1a1a1a;
    background: #1a1a1a;
    color: #f5e6c8;
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
    background: #fffef2;
    color: #1a1a1a;
  }

  .start-btn:focus-visible {
    outline: 2px solid #8b0000;
    outline-offset: 2px;
  }

  .start-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ─── HOME ─── */
  .home {
    max-width: 380px;
    margin: 0 auto;
  }

  .tab-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    margin-bottom: 1rem;
    border: 1px solid #c4b48a;
    overflow: hidden;
  }

  .tab-btn {
    padding: 0.75rem;
    border: none;
    background: #fffef2;
    color: #888;
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab-btn.active {
    background: #1a1a1a;
    color: #f5e6c8;
  }

  .tab-btn:focus-visible {
    outline: 2px solid #8b0000;
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
    border: 1px solid #c4b48a;
    background: #fffef2;
    color: #888;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .toggle-btn.active {
    border-color: #1a1a1a;
    background: #1a1a1a;
    color: #f5e6c8;
  }

  .toggle-btn:focus-visible {
    outline: 2px solid #8b0000;
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
    border: 1px solid #c4b48a;
    background: transparent;
    color: #777;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: "Source Serif 4", Georgia, serif;
    margin-bottom: 1rem;
  }

  .browse-toggle:hover {
    border-color: #1a1a1a;
    color: #1a1a1a;
  }

  .public-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .public-party-card {
    background: #fffef2;
    border: 1px solid #d4c5a0;
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
    color: #8b0000;
    background: rgba(139, 0, 0, 0.06);
    padding: 0.2rem 0.5rem;
  }

  .pp-join-btn {
    padding: 0.35rem 0.8rem;
    border: 1px solid #1a1a1a;
    background: #1a1a1a;
    color: #f5e6c8;
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
    border: 1px solid #c4b48a;
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
