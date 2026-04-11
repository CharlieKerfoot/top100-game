<script lang="ts">
  import { getMultiplayerState } from "$lib/multiplayer.svelte";

  const mp = getMultiplayerState();

  let playerName = $state("");
  let joinCode = $state("");
  let createPublic = $state(true);
  let showBrowse = $state(false);
  let homeTab = $state<"create" | "join">("create");
  let showRules = $state(false);

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
    <div class="title-row">
      <h1>Common Cents</h1>
      <button
        class="info-btn"
        onclick={() => (showRules = true)}
        title="How to play">i</button
      >
    </div>
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
            ? "Enter your name above first"
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

  header {
    text-align: center;
    margin-bottom: 1.5rem;
    border-bottom: 3px double #1a1a1a;
    padding-bottom: 0.75rem;
  }

  .title-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
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

  .hint {
    color: #777;
    font-size: 0.85rem;
    margin: 0.5rem 0 0;
    font-style: italic;
  }

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

  .pp-host { font-weight: 600; font-size: 0.9rem; }
  .pp-details { font-size: 0.8rem; color: #888; }

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
