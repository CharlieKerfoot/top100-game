<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { tick } from "svelte";
  import { SITE_URL, GAME_NAME, DEFAULT_DESCRIPTION, ogImageUrl } from "$lib/seo";
  import {
    getAllTopics,
    getFeaturedLists,
    searchLists,
    getListSize,
    getEffectiveTopics,
    type GameList,
  } from "$lib/lists/index";
  import { getMultiplayerState } from "$lib/multiplayer.svelte";
  import Autocomplete from "$lib/Autocomplete.svelte";
  import { getAudioCtx, playGuessSound, playStrikeSound } from "$lib/sounds";

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
    listName?: string;
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
    return () => {
      active = false;
    };
  });

  const needsJoin = $derived(mp.partyCode !== routeCode || mp.phase === "home");

  // Lobby list browser state
  let listSearch = $state("");
  let activeTopic = $state<string | null>("__featured__");
  let previewList = $state<GameList | null>(null);
  let previewSearch = $state("");

  // Non-host suggest browser state
  let showSuggestBrowser = $state(false);
  let suggestSearch = $state("");
  let suggestTopic = $state<string | null>("__featured__");

  // Game state
  let guessInput = $state("");
  let showRules = $state(false);
  let showHistory = $state(false);
  let confirmAction = $state<"leave" | "end" | null>(null);
  let showCelebration = $state(false);
  let showAllAnswers = $state(false);
  let winnerCelebrationReady = $state(false);

  // Warm up AudioContext on any user interaction so it's ready when we need it
  $effect(() => {
    if (typeof window === "undefined") return;
    const warm = () => {
      getAudioCtx();
      window.removeEventListener("click", warm);
      window.removeEventListener("keydown", warm);
    };
    window.addEventListener("click", warm, { once: true });
    window.addEventListener("keydown", warm, { once: true });
    return () => {
      window.removeEventListener("click", warm);
      window.removeEventListener("keydown", warm);
    };
  });

  // How long the audio lead-in plays before the visual seal appears
  const CELEBRATION_LEADIN = 1.5;

  function playCelebrationSound() {
    const maybeCtx = getAudioCtx();
    if (!maybeCtx) return;
    const ctx = maybeCtx;
    const t = ctx.currentTime;

    // ── Phase 1: Low rumble swell (0s – 1.5s) ──
    // Subby drone that fades in from nothing, tells players something is coming
    const droneLen = CELEBRATION_LEADIN;
    const drone = ctx.createOscillator();
    drone.type = "sawtooth";
    drone.frequency.setValueAtTime(55, t);
    drone.frequency.linearRampToValueAtTime(80, t + droneLen);
    const droneLP = ctx.createBiquadFilter();
    droneLP.type = "lowpass";
    droneLP.frequency.setValueAtTime(120, t);
    droneLP.frequency.linearRampToValueAtTime(300, t + droneLen);
    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0, t);
    droneGain.gain.linearRampToValueAtTime(0.18, t + droneLen * 0.8);
    droneGain.gain.linearRampToValueAtTime(0, t + droneLen); // dip to silence before impact
    drone.connect(droneLP).connect(droneGain).connect(ctx.destination);
    drone.start(t);
    drone.stop(t + droneLen + 0.1);

    // ── Phase 2: Ascending tonal steps (0.3s – 1.4s) ──
    // Three rising tones that build anticipation, like a fanfare winding up
    function step(start: number, freq: number, vol: number, dur: number) {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(vol, start + 0.04);
      g.gain.setValueAtTime(vol, start + dur * 0.6);
      g.gain.linearRampToValueAtTime(0, start + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    }
    step(t + 0.3, 220, 0.06, 0.35);  // A3
    step(t + 0.7, 330, 0.08, 0.3);   // E4
    step(t + 1.05, 440, 0.1, 0.25);  // A4

    // ── Phase 3: Accelerating tick roll (0.6s – 1.45s) ──
    // Rapid clicks that speed up like a ratchet being wound — builds urgency
    const rollLen = 0.85;
    const rollStart = t + 0.6;
    const rollBuf = ctx.createBuffer(1, ctx.sampleRate * rollLen, ctx.sampleRate);
    const rollData = rollBuf.getChannelData(0);
    for (let i = 0; i < rollData.length; i++) {
      const progress = i / rollData.length;
      // Pulse rate accelerates from 6/s to 50/s
      const pulseRate = 6 + progress * progress * 44;
      const pulse = Math.sin(progress * pulseRate * Math.PI * 2) > 0.7 ? 1 : 0;
      // Volume swells then dips at the very end for the silence gap
      const env = progress < 0.85 ? progress * 1.1 : (1 - progress) * 6;
      rollData[i] = (Math.random() * 2 - 1) * env * 0.5 * pulse;
    }
    const roll = ctx.createBufferSource();
    roll.buffer = rollBuf;
    const rollLP = ctx.createBiquadFilter();
    rollLP.type = "lowpass";
    rollLP.frequency.setValueAtTime(800, rollStart);
    rollLP.frequency.linearRampToValueAtTime(3000, rollStart + rollLen);
    const rollGain = ctx.createGain();
    rollGain.gain.value = 0.15;
    roll.connect(rollLP).connect(rollGain).connect(ctx.destination);
    roll.start(rollStart);

    // ── Phase 4: Brief silence (~0.05s gap before stamp) ──
    // The drone and roll both fade to zero just before stampTime,
    // creating a tiny breath that makes the impact hit harder.

    // ── Phase 5: Seal stamp impact at 1.5s (when visual appears) ──
    const stampTime = t + CELEBRATION_LEADIN;

    // Heavy wax thud: low sine sweep down
    const thud = ctx.createOscillator();
    thud.type = "sine";
    thud.frequency.setValueAtTime(180, stampTime);
    thud.frequency.exponentialRampToValueAtTime(30, stampTime + 0.25);
    const thudGain = ctx.createGain();
    thudGain.gain.setValueAtTime(0.45, stampTime);
    thudGain.gain.exponentialRampToValueAtTime(0.001, stampTime + 0.35);
    thud.connect(thudGain).connect(ctx.destination);
    thud.start(stampTime);
    thud.stop(stampTime + 0.4);

    // Impact crack: short noise burst for the press contact
    const crackLen = 0.08;
    const crackBuf = ctx.createBuffer(1, ctx.sampleRate * crackLen, ctx.sampleRate);
    const crackData = crackBuf.getChannelData(0);
    for (let i = 0; i < crackData.length; i++) {
      const env = Math.pow(1 - i / crackData.length, 3);
      crackData[i] = (Math.random() * 2 - 1) * env;
    }
    const crack = ctx.createBufferSource();
    crack.buffer = crackBuf;
    const crackHP = ctx.createBiquadFilter();
    crackHP.type = "highpass";
    crackHP.frequency.value = 2000;
    const crackGain = ctx.createGain();
    crackGain.gain.value = 0.18;
    crack.connect(crackHP).connect(crackGain).connect(ctx.destination);
    crack.start(stampTime);

    // ── Phase 6: Gold shimmer chimes (post-impact) ──
    function chime(start: number, freq: number, vol: number) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.8);
      osc.connect(g).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.85);
    }
    chime(stampTime + 0.1, 1200, 0.08);
    chime(stampTime + 0.2, 1800, 0.06);
    chime(stampTime + 0.35, 2400, 0.05);

    // Final celebratory bell: clear, bright ring
    const bell = ctx.createOscillator();
    bell.type = "sine";
    bell.frequency.value = 3200;
    const bellOvertone = ctx.createOscillator();
    bellOvertone.type = "sine";
    bellOvertone.frequency.value = 3200 * 2.76;
    const bellGain = ctx.createGain();
    bellGain.gain.setValueAtTime(0.15, stampTime + 0.15);
    bellGain.gain.exponentialRampToValueAtTime(0.001, stampTime + 0.6);
    const bellOvGain = ctx.createGain();
    bellOvGain.gain.value = 0.04;
    bell.connect(bellGain).connect(ctx.destination);
    bellOvertone.connect(bellOvGain).connect(bellGain);
    bell.start(stampTime + 0.15);
    bell.stop(stampTime + 0.65);
    bellOvertone.start(stampTime + 0.15);
    bellOvertone.stop(stampTime + 0.65);
  }

  const WINNER_LEADIN = 0.6;

  function playWinnerSound() {
    const maybeCtx = getAudioCtx();
    if (!maybeCtx) return;
    const ctx = maybeCtx;
    const t = ctx.currentTime;

    // Helper: play a brass-like fanfare note (square + sawtooth layered)
    function fanfare(start: number, freq: number, vol: number, dur: number) {
      const sq = ctx.createOscillator();
      sq.type = "square";
      sq.frequency.value = freq;
      const saw = ctx.createOscillator();
      saw.type = "sawtooth";
      saw.frequency.value = freq * 1.002; // slight detune for richness
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = freq * 3;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(vol, start + 0.02);
      g.gain.setValueAtTime(vol * 0.85, start + dur * 0.7);
      g.gain.linearRampToValueAtTime(0, start + dur);
      sq.connect(lp);
      saw.connect(lp);
      lp.connect(g).connect(ctx.destination);
      sq.start(start);
      sq.stop(start + dur + 0.05);
      saw.start(start);
      saw.stop(start + dur + 0.05);
    }

    // ── Fanfare: quick ascending "ta-da-da-DAAAA" in Bb major ──
    fanfare(t, 466.16, 0.06, 0.12);         // Bb4 — "ta"
    fanfare(t + 0.12, 587.33, 0.07, 0.12);  // D5  — "da"
    fanfare(t + 0.24, 698.46, 0.08, 0.12);  // F5  — "da"
    fanfare(t + 0.38, 932.33, 0.10, 0.8);   // Bb5 — "DAAAA" (long hold)

    // Harmony on the big note — major triad underneath
    fanfare(t + 0.38, 587.33, 0.05, 0.7);   // D5
    fanfare(t + 0.38, 698.46, 0.04, 0.7);   // F5

    // ── Synthesized crowd cheering (filtered noise with vowel formants) ──
    const cheerLen = 2.5;
    const cheerBuf = ctx.createBuffer(1, ctx.sampleRate * cheerLen, ctx.sampleRate);
    const cheerData = cheerBuf.getChannelData(0);
    for (let i = 0; i < cheerData.length; i++) {
      // Modulated noise — random amplitude wobble simulates crowd dynamics
      const progress = i / cheerData.length;
      const wobble = 0.7 + 0.3 * Math.sin(progress * 18) * Math.sin(progress * 7.3);
      const fadeIn = Math.min(1, progress * 5);
      const fadeOut = progress > 0.7 ? (1 - progress) / 0.3 : 1;
      cheerData[i] = (Math.random() * 2 - 1) * wobble * fadeIn * fadeOut;
    }
    const cheer = ctx.createBufferSource();
    cheer.buffer = cheerBuf;
    // Bandpass to sound voice-like (~300-3000Hz)
    const cheerBP = ctx.createBiquadFilter();
    cheerBP.type = "bandpass";
    cheerBP.frequency.value = 1200;
    cheerBP.Q.value = 0.5;
    // Second formant peak for "ahh" vowel sound
    const cheerPeak = ctx.createBiquadFilter();
    cheerPeak.type = "peaking";
    cheerPeak.frequency.value = 2500;
    cheerPeak.gain.value = 6;
    cheerPeak.Q.value = 2;
    const cheerGain = ctx.createGain();
    cheerGain.gain.setValueAtTime(0, t + 0.3);
    cheerGain.gain.linearRampToValueAtTime(0.12, t + 0.6);
    cheerGain.gain.setValueAtTime(0.12, t + 1.0);
    cheerGain.gain.linearRampToValueAtTime(0.06, t + 2.0);
    cheerGain.gain.linearRampToValueAtTime(0, t + 2.8);
    cheer.connect(cheerBP).connect(cheerPeak).connect(cheerGain).connect(ctx.destination);
    cheer.start(t + 0.3);

    // ── Cymbal crash on the big note ──
    const crashLen = 1.5;
    const crashBuf = ctx.createBuffer(1, ctx.sampleRate * crashLen, ctx.sampleRate);
    const crashData = crashBuf.getChannelData(0);
    for (let i = 0; i < crashData.length; i++) {
      const env = Math.pow(1 - i / crashData.length, 1.5);
      crashData[i] = (Math.random() * 2 - 1) * env;
    }
    const crash = ctx.createBufferSource();
    crash.buffer = crashBuf;
    const crashHP = ctx.createBiquadFilter();
    crashHP.type = "highpass";
    crashHP.frequency.value = 4000;
    const crashGain = ctx.createGain();
    crashGain.gain.value = 0.08;
    crash.connect(crashHP).connect(crashGain).connect(ctx.destination);
    crash.start(t + 0.36);

    // ── Impact bass thump on the big note ──
    const thump = ctx.createOscillator();
    thump.type = "sine";
    thump.frequency.setValueAtTime(120, t + 0.38);
    thump.frequency.exponentialRampToValueAtTime(40, t + 0.65);
    const thumpGain = ctx.createGain();
    thumpGain.gain.setValueAtTime(0.3, t + 0.38);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    thump.connect(thumpGain).connect(ctx.destination);
    thump.start(t + 0.38);
    thump.stop(t + 0.75);
  }

  // Trigger winner celebration when lastPlayerStanding appears
  $effect(() => {
    if (mp.lastPlayerStanding) {
      playWinnerSound();
      setTimeout(() => {
        winnerCelebrationReady = true;
      }, WINNER_LEADIN * 1000);
    } else {
      winnerCelebrationReady = false;
    }
  });

  $effect(() => {
    if (mp.phase === "playing") {
      const html = document.documentElement;
      html.style.overflow = "hidden";
      html.style.height = "100dvh";
      document.body.style.overflow = "hidden";
      document.body.style.height = "100dvh";

      return () => {
        html.style.overflow = "";
        html.style.height = "";
        document.body.style.overflow = "";
        document.body.style.height = "";
      };
    }
  });

  $effect(() => {
    const result = mp.lastResult;
    if (!result) return;
    if (result.isStrike) {
      playStrikeSound();
      return;
    }
    if (result.rank != null) {
      const rank = result.rank;
      if (rank === listSize) {
        playCelebrationSound();
        setTimeout(() => {
          showCelebration = true;
        }, CELEBRATION_LEADIN * 1000);
        setTimeout(() => {
          showCelebration = false;
        }, CELEBRATION_LEADIN * 1000 + 4000);
      } else {
        playGuessSound(rank, listSize);
      }
      tick().then(() => {
        const slot = document.querySelector(`[data-slot="${rank - 1}"]`);
        if (!slot) return;
        const container = slot.closest(".dt-board-body");
        if (container) {
          const slotTop = (slot as HTMLElement).offsetTop;
          const slotHeight = (slot as HTMLElement).offsetHeight;
          const containerHeight = container.clientHeight;
          container.scrollTo({
            top: slotTop - containerHeight / 2 + slotHeight / 2,
            behavior: "smooth",
          });
        }
      });
    }
  });

  const sortedGuessed = $derived(
    [...mp.guessedItems].sort((a, b) => a.index - b.index),
  );

  const guessedMap = $derived(
    new Map(mp.guessedItems.map((g) => [g.index, g])),
  );

  const listSize = $derived(getListSize(mp.list));
  const gridCols = $derived(listSize <= 50 ? 2 : 4);
  const gridRows = $derived(Math.ceil(listSize / gridCols));

  const allTopics = getAllTopics();
  const mySuggestion = $derived(
    mp.listSuggestions.find((s) => s.playerId === mp.myId) ?? null,
  );
  const filteredSuggestLists = $derived.by(() => {
    if (suggestTopic === "__featured__" && !suggestSearch.trim()) {
      return getFeaturedLists();
    }
    return searchLists(
      suggestSearch,
      suggestTopic === "__featured__" ? null : suggestTopic,
    );
  });
  const filteredLists = $derived.by(() => {
    if (activeTopic === "__featured__" && !listSearch.trim()) {
      return getFeaturedLists();
    }
    return searchLists(
      listSearch,
      activeTopic === "__featured__" ? null : activeTopic,
    );
  });
  const filteredPreviewItems = $derived.by(() => {
    if (!previewList) return [];
    if (!previewSearch.trim())
      return previewList.items.map((item, i) => ({ item, rank: i + 1 }));
    const q = previewSearch.toLowerCase();
    return previewList.items
      .map((item, i) => ({ item, rank: i + 1 }))
      .filter(({ item }) => item.toLowerCase().includes(q));
  });

  function handleJoin() {
    if (!playerName.trim()) return;
    mp.joinParty(routeCode, playerName.trim());
  }

  function selectList(cat: GameList) {
    mp.updateSettings({ listId: cat.id });
    previewList = null;
    previewSearch = "";
  }

  const availableHints = $derived.by(() => {
    const hints = mp.list.hints ?? mp.list.items;
    const guessedNames = new Set(
      mp.guessedItems.map((g) => g.name.toLowerCase()),
    );
    return hints.filter((h) => {
      const lower = h.toLowerCase();
      if (guessedNames.has(lower)) return false;
      // Also filter out aliases whose canonical item was already guessed
      if (mp.list.aliases) {
        const canonical = mp.list.aliases[h];
        if (canonical && guessedNames.has(canonical.toLowerCase())) return false;
      }
      return true;
    });
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
    setTimeout(() => {
      copied = false;
    }, 1500);
  }
</script>

<svelte:head>
  <title>Join Party | {GAME_NAME}</title>
  <meta name="robots" content="noindex" />
  <meta property="og:title" content="Join my {GAME_NAME} party!" />
  <meta property="og:description" content={DEFAULT_DESCRIPTION} />
  <meta property="og:image" content={ogImageUrl()} />
  <meta property="og:url" content="{SITE_URL}/{routeCode}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:title" content="Join my {GAME_NAME} party!" />
  <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
  <meta name="twitter:image" content={ogImageUrl()} />
</svelte:head>

<div class="app">
  <header>
    <div class="title-row">
      <div class="title-row-left">
        {#if mp.phase === "lobby"}
          <button
            class="visibility-toggle"
            class:is-public={mp.isPublic}
            onclick={() =>
              mp.isHost && mp.updateSettings({ isPublic: !mp.isPublic })}
            class:readonly={!mp.isHost}
            title={mp.isHost
              ? mp.isPublic
                ? "Switch to Private"
                : "Switch to Public"
              : ""}
          >
            <span class="visibility-label-text"
              >{mp.isPublic ? "Public" : "Private"}</span
            >
            <span class="visibility-slider">
              <span class="visibility-knob"></span>
            </span>
          </button>
        {/if}
      </div>
      <div class="title-center">
        <h1>Common Cents</h1>
        <button
          class="info-btn"
          onclick={() => (showRules = true)}
          title="How to play">i</button
        >
      </div>
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
        <button class="header-code" class:copied onclick={copyCode}>
          {copied ? "Copied!" : mp.partyCode}
        </button>
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
            Players take turns guessing items from a ranked list of {listSize}. The
            closer to #{listSize} your guess is, the more points it's worth.
          </p>
          <h3>Strike Mode</h3>
          <p>
            Each wrong guess earns a strike. Reach the strike limit and you're
            eliminated. Last player standing wins, or whoever has the most
            points when all {listSize} are found.
          </p>
          <h3>Turns Mode</h3>
          <p>
            Each player gets a fixed number of turns. Use them wisely &mdash;
            the player with the most points at the end wins.
          </p>
          <h3>Scoring</h3>
          <p>
            Points equal the item's rank: #1 = 1 point, #{listSize} = {listSize} points.
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
              <span class="preview-label">List</span>
              <span class="preview-value">{partyInfo.listName}</span>
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
              This game is already in progress. You'll join as a spectator and
              can play in the next round.
            </div>
          {/if}
          <div class="setup-section">
            <label for="playerName">Your Name</label>
            <input
              id="playerName"
              type="text"
              bind:value={playerName}
              placeholder="Enter your name..."
              onkeydown={(e) => {
                if (e.key === "Enter") handleJoin();
              }}
            />
            <button
              class="start-btn"
              style="margin-top: 0.75rem;"
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
        <p>
          You joined while a game was in progress. Watch the action below and
          you'll be able to play in the next round!
        </p>
      </div>

      <div class="game">
        <div class="game-desktop">
          <div class="dt-top">
            <span class="dt-category-label">{mp.list.name}</span>
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
                      >" &mdash; #{mp.lastResult
                        .rank}{#if mp.lastResult.value}&nbsp;({mp.lastResult
                          .value}){/if}! +{mp.lastResult.points} pts</span
                    >
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
                      {#if player.id === mp.myId}<span class="you-tag">you</span
                        >{/if}
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
                          <span
                            class="strike-dot"
                            class:hit={s < player.strikes}>&#10060;</span
                          >
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
                <span class="dt-board-title">{mp.list.description}</span>
                <span class="dt-board-count"
                  >{mp.guessedItems.length} of {listSize} identified</span
                >
              </div>
              <div class="dt-board-body">
                <div class="dt-slots" style="grid-template-columns: repeat({gridCols}, 1fr); grid-template-rows: repeat({gridRows}, auto)">
                  {#each Array(listSize) as _, i}
                    {@const item = guessedMap.get(i)}
                    <div class="dt-slot" class:filled={!!item} class:dt-slot-large={listSize <= 50} data-slot={i}>
                      <span class="dt-slot-rank">{i + 1}.</span>
                      {#if item}
                        <span class="dt-slot-name">{item.name}</span>
                        {#if item.value}<span class="dt-slot-value"
                            >{item.value}</span
                          >{/if}
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
            <div class="category-badge">{mp.list.name}</div>
            <div class="mode-badge">
              {mp.mode === "strikes" ? "Strikes" : "Turns"} Mode
            </div>
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
                  {#if player.id === mp.myId}<span class="you-tag">you</span
                    >{/if}
                </div>
                <div class="player-score">{player.score} pts</div>
                {#if player.sittingOut}
                  <div class="spectator-badge">Watching</div>
                {:else}
                  <div class="player-meta">
                    {#if mp.mode === "strikes"}
                      <span class="strikes">
                        {#each Array(mp.maxStrikes) as _, s}
                          <span
                            class="strike-dot"
                            class:hit={s < player.strikes}>&#10060;</span
                          >
                        {/each}
                      </span>
                    {:else}
                      <span class="turns-left"
                        >{mp.maxTurns - player.guesses} left</span
                      >
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
                  <strong>{mp.lastResult.playerName}</strong> guessed "<strong
                    >{mp.lastResult.guess}</strong
                  >" &mdash; not in the top {listSize}!
                </div>
                <div class="result-points">Strike!</div>
              {:else}
                <div class="result-icon">&#127942;</div>
                <div class="result-text">
                  <strong>{mp.lastResult.playerName}</strong> guessed "<strong
                    >{mp.lastResult.guess}</strong
                  >" &mdash; ranked
                  <strong>#{mp.lastResult.rank}</strong
                  >{#if mp.lastResult.value}&nbsp;({mp.lastResult.value}){/if}!
                </div>
                <div class="result-points">+{mp.lastResult.points} points</div>
              {/if}
            </div>
          {:else}
            <div class="guess-area waiting">
              <div class="current-turn">
                <span class="turn-label"
                  >Waiting for {mp.currentPlayer?.name ?? "..."}...</span
                >
              </div>
            </div>
          {/if}

          <div class="guessed-list">
            <h3>Guessed so far ({mp.guessedItems.length}/{listSize})</h3>
            <div class="guessed-grid">
              {#each sortedGuessed as item}
                <div class="guessed-item">
                  <span class="guessed-rank">#{item.index + 1}</span>
                  <span class="guessed-name">{item.name}</span>
                  {#if item.value}<span class="guessed-value">{item.value}</span
                    >{/if}
                  <span class="guessed-by">{item.playerName}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <div class="lobby-actions">
        <button class="leave-btn" onclick={() => mp.leaveParty()}
          >Leave Party</button
        >
      </div>
    </div>

    <!-- ─── LOBBY SCREEN ─── -->
  {:else if mp.phase === "lobby"}
    <div class="lobby">
      <!-- Column 1: Players + Game Mode -->
      <div class="lobby-col lobby-col-info">
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
                {#if player.id === mp.hostId}<span class="lp-badge">Host</span
                  >{/if}
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
                    onclick={() =>
                      mp.updateSettings({ maxStrikes: mp.maxStrikes - 1 })}
                    >-</button
                  >
                  <span class="count-display">{mp.maxStrikes}</span>
                  <button
                    class="count-btn"
                    disabled={mp.maxStrikes >= 10}
                    onclick={() =>
                      mp.updateSettings({ maxStrikes: mp.maxStrikes + 1 })}
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
                    onclick={() =>
                      mp.updateSettings({ maxTurns: mp.maxTurns - 1 })}
                    >-</button
                  >
                  <span class="count-display">{mp.maxTurns}</span>
                  <button
                    class="count-btn"
                    disabled={mp.maxTurns >= 50}
                    onclick={() =>
                      mp.updateSettings({ maxTurns: mp.maxTurns + 1 })}
                    >+</button
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

        <div class="setup-section">
          <label>
            Hints
            <span
              class="hint-info"
              aria-label="Show autocomplete suggestions as you type"
              >i
              <span class="hint-tooltip"
                >Show autocomplete suggestions while typing your guess</span
              >
            </span>
          </label>
          {#if mp.isHost}
            <div class="mode-toggle">
              <button
                class="mode-btn"
                class:active={mp.hints}
                onclick={() => mp.updateSettings({ hints: true })}
              >
                On
              </button>
              <button
                class="mode-btn"
                class:active={!mp.hints}
                onclick={() => mp.updateSettings({ hints: false })}
              >
                Off
              </button>
            </div>
          {:else}
            <div class="readonly-setting">
              <span class="setting-value">{mp.hints ? "On" : "Off"}</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Column 2: List -->
      <div class="lobby-col lobby-col-category">
        <div class="setup-section">
          <label>List</label>
          {#if mp.isHost}
            {#if previewList}
              <div class="category-preview">
                <div class="preview-header">
                  <button
                    class="back-btn"
                    onclick={() => {
                      previewList = null;
                      previewSearch = "";
                    }}>&larr; Back</button
                  >
                  <div class="preview-title">
                    <h3>{previewList.name}</h3>
                    <p>{previewList.description}</p>
                  </div>
                  <button
                    class="select-btn"
                    onclick={() => selectList(previewList!)}>Select</button
                  >
                </div>
                <div class="preview-tags">
                  {#each getEffectiveTopics(previewList) as topic}
                    <span class="tag" class:tag-new={topic === "new"}>{topic}</span>
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
                    <div class="preview-empty">
                      No items match "{previewSearch}"
                    </div>
                  {/if}
                </div>
              </div>
            {:else}
              {#if mp.listSuggestions.length > 0}
                <div class="suggestions-panel">
                  <div class="suggestions-panel-header">Player suggestions</div>
                  {#each mp.listSuggestions as suggestion}
                    <div class="suggestion-row">
                      <div class="suggestion-row-info">
                        <span class="suggestion-row-player"
                          >{suggestion.playerName}</span
                        >
                        <span class="suggestion-row-arrow">suggested</span>
                        <span class="suggestion-row-category"
                          >{suggestion.listName}</span
                        >
                      </div>
                      <div class="suggestion-row-actions">
                        <button
                          class="suggestion-accept-btn"
                          onclick={() => {
                            mp.updateSettings({
                              listId: suggestion.listId,
                            });
                            mp.dismissSuggestion(suggestion.playerId);
                          }}>Accept</button
                        >
                        <button
                          class="suggestion-dismiss-btn"
                          onclick={() =>
                            mp.dismissSuggestion(suggestion.playerId)}
                          >&times;</button
                        >
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
              <input
                type="text"
                bind:value={listSearch}
                placeholder="Search lists..."
              />
              <div class="tag-bar">
                <button
                  class="tag-btn"
                  class:active={activeTopic === "__featured__"}
                  onclick={() => (activeTopic = "__featured__")}
                  >Featured</button
                >
                <button
                  class="tag-btn"
                  class:active={activeTopic === null}
                  onclick={() => (activeTopic = null)}>All</button
                >
                {#each allTopics as topic}
                  <button
                    class="tag-btn"
                    class:active={activeTopic === topic}
                    onclick={() =>
                      (activeTopic = activeTopic === topic ? null : topic)}
                    >{topic}</button
                  >
                {/each}
              </div>
              <div class="category-grid">
                {#each filteredLists as cat}
                  <div
                    class="category-card"
                    class:selected={mp.listId === cat.id}
                    role="button"
                    tabindex="0"
                    onclick={() => mp.updateSettings({ listId: cat.id })}
                    onkeydown={(e: KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ")
                        mp.updateSettings({ listId: cat.id });
                    }}
                  >
                    <div class="card-top">
                      <span class="card-name">{cat.name}</span>
                      {#if mp.listId === cat.id}<span class="card-check"
                          >&#10003;</span
                        >{/if}
                    </div>
                    <span class="card-desc">{cat.description}</span>
                    <div class="card-tags">
                      {#each getEffectiveTopics(cat) as topic}
                        <span class="card-tag" class:card-tag-new={topic === "new"}>{topic}</span>
                      {/each}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          {:else if showSuggestBrowser}
            <div class="suggest-browser">
              <div class="suggest-browser-header">
                <button
                  class="back-btn"
                  onclick={() => {
                    showSuggestBrowser = false;
                    suggestSearch = "";
                    suggestTopic = "__featured__";
                  }}>&larr; Back</button
                >
                <span class="suggest-browser-title">Suggest a list</span>
              </div>
              <input
                type="text"
                bind:value={suggestSearch}
                placeholder="Search lists..."
              />
              <div class="tag-bar">
                <button
                  class="tag-btn"
                  class:active={suggestTopic === "__featured__"}
                  onclick={() => (suggestTopic = "__featured__")}
                  >Featured</button
                >
                <button
                  class="tag-btn"
                  class:active={suggestTopic === null}
                  onclick={() => (suggestTopic = null)}>All</button
                >
                {#each allTopics as topic}
                  <button
                    class="tag-btn"
                    class:active={suggestTopic === topic}
                    onclick={() =>
                      (suggestTopic = suggestTopic === topic ? null : topic)}
                    >{topic}</button
                  >
                {/each}
              </div>
              <div class="category-grid">
                {#each filteredSuggestLists as cat}
                  <div
                    class="category-card"
                    class:selected={mySuggestion?.listId === cat.id}
                    role="button"
                    tabindex="0"
                    onclick={() => {
                      mp.suggestList(cat.id);
                      showSuggestBrowser = false;
                      suggestSearch = "";
                      suggestTopic = "__featured__";
                    }}
                    onkeydown={(e: KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        mp.suggestList(cat.id);
                        showSuggestBrowser = false;
                        suggestSearch = "";
                        suggestTopic = "__featured__";
                      }
                    }}
                  >
                    <div class="card-top">
                      <span class="card-name">{cat.name}</span>
                      {#if mySuggestion?.listId === cat.id}<span
                          class="card-check">&#10003;</span
                        >{/if}
                    </div>
                    <span class="card-desc">{cat.description}</span>
                    <div class="card-tags">
                      {#each getEffectiveTopics(cat) as topic}
                        <span class="card-tag" class:card-tag-new={topic === "new"}>{topic}</span>
                      {/each}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {:else}
            <div class="category-readonly">
              <div class="category-readonly-inner">
                <div class="category-readonly-eyebrow">List</div>
                <div class="category-readonly-name">{mp.list.name}</div>
                <div class="category-readonly-desc">
                  {mp.list.description}
                </div>
                {#if getEffectiveTopics(mp.list).length}
                  <div class="category-readonly-tags">
                    {#each getEffectiveTopics(mp.list) as topic}
                      <span class="card-tag" class:card-tag-new={topic === "new"}>{topic}</span>
                    {/each}
                  </div>
                {/if}
                {#if mySuggestion}
                  <div class="my-suggestion">
                    <div class="my-suggestion-check">&#10003;</div>
                    <div class="my-suggestion-label">Your suggestion</div>
                    <div class="my-suggestion-name">
                      {mySuggestion.listName}
                    </div>
                    <div class="my-suggestion-footer">
                      <button
                        class="my-suggestion-change"
                        onclick={() => (showSuggestBrowser = true)}
                        >Change</button
                      >
                      <span class="my-suggestion-sep">&middot;</span>
                      <button
                        class="my-suggestion-retract"
                        onclick={() => mp.dismissSuggestion(mp.myId)}
                        >Retract</button
                      >
                    </div>
                  </div>
                {:else}
                  <button
                    class="suggest-open-btn"
                    onclick={() => (showSuggestBrowser = true)}
                    >Suggest a list</button
                  >
                {/if}
              </div>
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
        <button class="leave-btn" onclick={() => mp.leaveParty()}
          >Leave Party</button
        >
      </div>
    </div>

    <!-- ─── GAME SCREEN ─── -->
  {:else if mp.phase === "playing"}
    <div class="game">
      <!-- Desktop: full-width layout -->
      <div class="game-desktop">
        <div class="dt-top">
          <span class="dt-category-label">{mp.list.name}</span>
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
                    >" &mdash; #{mp.lastResult
                      .rank}{#if mp.lastResult.value}&nbsp;({mp.lastResult
                        .value}){/if}! +{mp.lastResult.points} pts</span
                  >
                {/if}
                <button class="dt-next-btn" onclick={() => mp.nextTurn()}
                  >Next Turn</button
                >
              </div>
            {:else if mp.isMyTurn}
              <div class="dt-input-row">
                <Autocomplete
                  hints={mp.hints ? availableHints : []}
                  bind:value={guessInput}
                  placeholder="Name something in the top {listSize}..."
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
                    {#if player.id === mp.myId}<span class="you-tag">you</span
                      >{/if}
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
                        <span class="strike-dot" class:hit={s < player.strikes}
                          >&#10060;</span
                        >
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
              <span class="dt-board-title">{mp.list.description}</span>
              <span class="dt-board-count"
                >{mp.guessedItems.length} of {listSize} identified</span
              >
            </div>
            <div class="dt-board-body">
              <div class="dt-slots" style="grid-template-columns: repeat({gridCols}, 1fr); grid-template-rows: repeat({gridRows}, auto)">
                {#each Array(listSize) as _, i}
                  {@const item = guessedMap.get(i)}
                  <div class="dt-slot" class:filled={!!item} class:dt-slot-large={listSize <= 50} data-slot={i}>
                    <span class="dt-slot-rank">{i + 1}.</span>
                    {#if item}
                      <span class="dt-slot-name">{item.name}</span>
                      {#if item.value}<span class="dt-slot-value"
                          >{item.value}</span
                        >{/if}
                      <span class="dt-slot-by">{item.playerName}</span>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop game action bar -->
      <div class="game-action-bar">
        {#if showHistory}
          <div class="history-panel">
            <div class="history-list">
              {#each [...mp.guessHistory].reverse() as entry}
                <div
                  class="history-entry"
                  class:history-hit={!entry.isStrike}
                  class:history-miss={entry.isStrike}
                >
                  <span class="history-player">{entry.playerName}</span>
                  <span class="history-guess">{entry.guess}</span>
                  <span class="history-result">
                    {#if entry.isStrike}✗{:else}#{entry.rank}{#if entry.value}&nbsp;({entry.value}){/if}{/if}
                  </span>
                </div>
              {/each}
              {#if mp.guessHistory.length === 0}
                <p class="history-empty">No guesses yet</p>
              {/if}
            </div>
          </div>
        {/if}
        <button
          class="game-action-btn"
          onclick={() => (showHistory = !showHistory)}
        >
          {showHistory ? "Hide" : "Show"} All Guesses ({mp.guessHistory.length})
        </button>
        {#if mp.isHost}
          <button
            class="game-action-btn"
            onclick={() => (confirmAction = "end")}>End Game</button
          >
        {/if}
        <button
          class="game-action-btn danger"
          onclick={() => (confirmAction = "leave")}>Leave Game</button
        >
      </div>

      <!-- Mobile: compact vertical layout -->
      <div class="game-mobile">
        <div class="game-header">
          <div class="category-badge">{mp.list.name}</div>
          <div class="mode-badge">
            {mp.mode === "strikes" ? "Strikes" : "Turns"} Mode
          </div>
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
                        <span class="strike-dot" class:hit={s < player.strikes}
                          >&#10060;</span
                        >
                      {/each}
                    </span>
                  {:else}
                    <span class="turns-left"
                      >{mp.maxTurns - player.guesses} left</span
                    >
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
                <strong>{mp.lastResult.playerName}</strong> guessed "<strong
                  >{mp.lastResult.guess}</strong
                >" &mdash; not in the top {listSize}!
              </div>
              <div class="result-points">Strike!</div>
            {:else}
              <div class="result-icon">&#127942;</div>
              <div class="result-text">
                <strong>{mp.lastResult.playerName}</strong> guessed "<strong
                  >{mp.lastResult.guess}</strong
                >" &mdash; ranked
                <strong>#{mp.lastResult.rank}</strong
                >{#if mp.lastResult.value}&nbsp;({mp.lastResult.value}){/if}!
              </div>
              <div class="result-points">+{mp.lastResult.points} points</div>
            {/if}
            <button class="next-btn" onclick={() => mp.nextTurn()}
              >Next Turn</button
            >
          </div>
        {:else if mp.isMyTurn}
          <div class="guess-area">
            <div class="current-turn">
              <span class="turn-label">Your turn!</span>
            </div>
            <div class="guess-form">
              <Autocomplete
                hints={mp.hints ? availableHints : []}
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
              <span class="turn-label"
                >Waiting for {mp.currentPlayer?.name ?? "..."}...</span
              >
            </div>
          </div>
        {/if}

        <div class="guessed-list">
          <h3>Guessed so far ({mp.guessedItems.length}/{listSize})</h3>
          <div class="guessed-grid">
            {#each sortedGuessed as item}
              <div class="guessed-item">
                <span class="guessed-rank">#{item.index + 1}</span>
                <span class="guessed-name">{item.name}</span>
                {#if item.value}<span class="guessed-value">{item.value}</span
                  >{/if}
                <span class="guessed-by">{item.playerName}</span>
              </div>
            {/each}
          </div>
        </div>

        <div class="mobile-game-actions">
          {#if showHistory}
            <div class="history-panel">
              <div class="history-list">
                {#each [...mp.guessHistory].reverse() as entry}
                  <div
                    class="history-entry"
                    class:history-hit={!entry.isStrike}
                    class:history-miss={entry.isStrike}
                  >
                    <span class="history-player">{entry.playerName}</span>
                    <span class="history-guess">{entry.guess}</span>
                    <span class="history-result">
                      {#if entry.isStrike}✗{:else}#{entry.rank}{#if entry.value}&nbsp;({entry.value}){/if}{/if}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          <button
            class="game-action-btn"
            onclick={() => (showHistory = !showHistory)}
          >
            {showHistory ? "Hide" : "Show"} All Guesses ({mp.guessHistory
              .length})
          </button>
          {#if mp.isHost}
            <button
              class="game-action-btn"
              onclick={() => (confirmAction = "end")}>End Game</button
            >
          {/if}
          <button
            class="game-action-btn danger"
            onclick={() => (confirmAction = "leave")}>Leave Game</button
          >
        </div>
      </div>

      {#if confirmAction}
        <div class="confirm-overlay" onclick={() => (confirmAction = null)}>
          <div class="confirm-modal" onclick={(e) => e.stopPropagation()}>
            <p class="confirm-msg">
              {#if confirmAction === "leave"}
                Leave the game? You'll be taken back to the home screen.
              {:else}
                End the game for everyone? The party will return to the lobby.
              {/if}
            </p>
            <div class="confirm-btns">
              <button
                class="confirm-cancel"
                onclick={() => (confirmAction = null)}>Cancel</button
              >
              <button
                class="confirm-ok"
                class:danger={confirmAction === "leave"}
                onclick={() => {
                  if (confirmAction === "leave") mp.leaveParty();
                  else mp.backToLobby();
                  confirmAction = null;
                }}
              >
                {confirmAction === "leave" ? "Leave Game" : "End Game"}
              </button>
            </div>
          </div>
        </div>
      {/if}

      {#if showCelebration}
        <div class="cel-overlay">
          {#each Array(90) as _, i}
            <div
              class="cel-confetti"
              style="--x: {Math.random() * 100}vw; --drift: {(Math.random() -
                0.5) *
                120}px; --delay: {0.2 + Math.random() * 1.2}s; --dur: {2 +
                Math.random() * 1.5}s; --rot: {Math.random() * 720 -
                360}deg; --bg: {[
                '#d4af37',
                '#8b0000',
                '#f5d061',
                '#a0342b',
                '#fffef2',
                '#6b0000',
              ][i % 6]}; --w: {4 + Math.random() * 6}px; --h: {6 +
                Math.random() * 10}px;"
            ></div>
          {/each}

          <div class="cel-shimmer-ring"></div>
          <div class="cel-shimmer-ring"></div>
          <div class="cel-shimmer-ring"></div>

          {#each [{ size: "4px", tx: "-120px", ty: "-80px", delay: "0.35s" }, { size: "3px", tx: "100px", ty: "-110px", delay: "0.38s" }, { size: "5px", tx: "-90px", ty: "70px", delay: "0.4s" }, { size: "3px", tx: "130px", ty: "60px", delay: "0.36s" }, { size: "4px", tx: "-60px", ty: "-130px", delay: "0.42s" }, { size: "3px", tx: "80px", ty: "120px", delay: "0.39s" }, { size: "5px", tx: "150px", ty: "-40px", delay: "0.37s" }, { size: "4px", tx: "-140px", ty: "30px", delay: "0.41s" }, { size: "3px", tx: "-30px", ty: "140px", delay: "0.43s" }, { size: "4px", tx: "40px", ty: "-150px", delay: "0.34s" }, { size: "3px", tx: "-150px", ty: "-50px", delay: "0.44s" }, { size: "5px", tx: "110px", ty: "-90px", delay: "0.33s" }] as p}
            <div
              class="cel-gold-particle"
              style="--size: {p.size}; --tx: {p.tx}; --ty: {p.ty}; --delay: {p.delay};"
            ></div>
          {/each}

          <div class="cel-seal">
            <div class="cel-seal-shimmer"></div>
            <span class="cel-seal-no">No.</span>
            <span class="cel-seal-number">{listSize}</span>
            <div class="cel-seal-rule"></div>
            <span class="cel-seal-points">+{listSize} Points</span>
          </div>
        </div>
      {/if}

      {#if mp.lastPlayerStanding}
        <div class="lps-overlay">
          {#each Array(60) as _, i}
            <div
              class="lps-confetti"
              style="--x: {Math.random() * 100}vw; --drift: {(Math.random() - 0.5) * 120}px; --delay: {0.2 + Math.random() * 1.2}s; --dur: {2 + Math.random() * 1.5}s; --rot: {Math.random() * 720 - 360}deg; --bg: {['#d4af37', '#8b0000', '#f5d061', '#a0342b', '#fffef2', '#6b0000'][i % 6]}; --w: {4 + Math.random() * 6}px; --h: {6 + Math.random() * 10}px;"
            ></div>
          {/each}

          {#if winnerCelebrationReady}
            <div class="lps-card">
              <div class="lps-seal">
                <div class="lps-seal-shimmer"></div>
                <span class="lps-seal-letter">{mp.lastPlayerStanding.winnerName[0]}</span>
              </div>
              <div class="lps-name">{mp.lastPlayerStanding.winnerName}</div>
              <div class="lps-rule"></div>
              <div class="lps-label">Winner</div>
              {#if mp.lastPlayerStanding.winnerId === mp.myId}
                <div class="lps-actions">
                  <button class="lps-btn end" onclick={() => mp.endGameEarly()}>End Game</button>
                  <button class="lps-btn keep" onclick={() => mp.continueGame()}>Keep Going</button>
                </div>
              {:else}
                <div class="lps-waiting">
                  Waiting for {mp.lastPlayerStanding.winnerName} to decide...
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- ─── RESULTS SCREEN ─── -->
  {:else if mp.phase === "results"}
    <div class="results">
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

      <div class="results-row">
        <div class="results-rankings">
          <h3>Final Rankings</h3>
          {#each mp.rankings as player, i}
            {@const avgScore = player.guesses - player.strikes > 0
              ? Math.round(player.score / (player.guesses - player.strikes))
              : 0}
            <div class="ranking-row" class:first={i === 0}>
              <span class="ranking-position">
                {#if i === 0}&#129351;{:else if i === 1}&#129352;{:else if i === 2}&#129353;{:else}{i +
                    1}{/if}
              </span>
              <span class="ranking-name">
                {player.name}
                {#if player.id === mp.myId}<span class="you-tag">you</span>{/if}
              </span>
              <span class="ranking-score">{player.score} pts</span>
              <span class="ranking-details">
                {player.guesses} guess{player.guesses !== 1 ? "es" : ""}
                &middot; avg {avgScore}
                {#if player.eliminated}&middot; Eliminated{/if}
              </span>
            </div>
          {/each}
        </div>
        <div class="results-strikes">
          <h3>Strikes</h3>
          {#each mp.rankings as player}
            {@const playerStrikes = mp.guessHistory.filter(
              (e) => e.isStrike && e.playerId === player.id,
            )}
            {#if playerStrikes.length > 0}
              <div class="player-strikes">
                <div class="player-strikes-name">{player.name}</div>
                {#each playerStrikes as strike}
                  <div class="strike-entry">
                    <span class="strike-x">&#10007;</span>
                    <span class="strike-guess">{strike.guess}</span>
                  </div>
                {/each}
              </div>
            {/if}
          {/each}
          {#if mp.guessHistory.every((e) => !e.isStrike)}
            <div class="no-strikes">No strikes this game!</div>
          {/if}
        </div>
      </div>

      <button
        class="answers-toggle"
        onclick={() => (showAllAnswers = !showAllAnswers)}
      >
        {showAllAnswers ? "Hide" : "Show"} All Answers ({mp.guessedItems.length} of {listSize} found)
      </button>

      {#if showAllAnswers}
        <div class="all-answers">
          <div class="all-answers-header">
            <span class="all-answers-title">{mp.list.description}</span>
            <span class="all-answers-count">{mp.guessedItems.length} of {listSize} found</span>
          </div>
          <div class="dt-slots" style="grid-template-columns: repeat({gridCols}, 1fr); grid-template-rows: repeat({gridRows}, auto)">
            {#each Array(listSize) as _, i}
              {@const item = guessedMap.get(i)}
              <div class="dt-slot" class:filled={!!item} class:dt-slot-large={listSize <= 50} class:dt-slot-missed={!item}>
                <span class="dt-slot-rank">{i + 1}.</span>
                {#if item}
                  <span class="dt-slot-name">{item.name}</span>
                  {#if item.value}<span class="dt-slot-value">{item.value}</span>{/if}
                  <span class="dt-slot-by">{item.playerName}</span>
                {:else}
                  <span class="dt-slot-name dt-slot-missed-name">{mp.list.items[i]}</span>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <div class="results-actions">
        {#if mp.isHost}
          <button class="results-lobby-btn" onclick={() => mp.backToLobby()}
            >Back to Lobby</button
          >
        {:else}
          <div class="waiting-msg">Waiting for host...</div>
        {/if}
        <button class="results-leave-btn" onclick={() => mp.leaveParty()}
          >Leave Party</button
        >
      </div>
    </div>
  {/if}
</div>

<style>
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

  .results-actions {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .results-lobby-btn {
    flex: 3;
    padding: 0.7rem 1rem;
    border: 2px solid var(--color-ink);
    background: var(--color-ink);
    color: var(--color-parchment);
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: background 0.2s, color 0.2s;
  }

  .results-lobby-btn:hover {
    background: var(--color-cream);
    color: var(--color-ink);
  }

  .results-leave-btn {
    flex: 1;
    padding: 0.7rem 0.5rem;
    border: 1px solid var(--color-gold);
    background: transparent;
    color: #888;
    font-size: 0.85rem;
    cursor: pointer;
    font-family: "Source Serif 4", Georgia, serif;
    transition: all 0.2s;
  }

  .results-leave-btn:hover {
    border-color: var(--color-crimson);
    color: var(--color-crimson);
  }

  .results-actions .waiting-msg {
    flex: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
    font-style: italic;
  }

  .lobby-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  @media (min-width: 900px) {
    .app:has(.game) {
      max-width: 1400px;
      padding: 1.5rem 2rem;
    }

    .app:has(.results) {
      max-width: 1200px;
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
      overflow-y: auto;
      min-height: 0;
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

    /* Suggest browser fills the column the same way the host browser does */
    .suggest-browser {
      overflow: hidden;
    }

    .suggest-browser .category-grid {
      overflow-y: auto;
    }

    .lobby-actions {
      grid-column: 1 / -1;
      grid-row: 2;
      display: flex;
      flex-direction: row;
      align-items: stretch;
      gap: 0;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-gold);
    }

    .lobby-actions {
      gap: 0.5rem;
    }
    .lobby-start-btn {
      flex: 3;
      margin-top: 0;
      width: auto;
      padding: 0.85rem 1rem;
    }
    .lobby-actions > .leave-btn {
      flex: 1;
      border: 2px solid var(--color-ink);
      background: transparent;
      color: var(--color-ink);
      font-family: "Playfair Display", Georgia, serif;
      font-size: 1.1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.85rem 0.5rem;
      cursor: pointer;
      transition:
        background 0.2s,
        color 0.2s;
    }
    .lobby-actions > .leave-btn:hover {
      background: var(--color-ink);
      color: var(--color-parchment);
    }
    .lobby-actions .waiting-msg {
      flex: 3;
    }

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
    border-bottom: 3px double var(--color-ink);
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

  .title-center {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .visibility-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(139, 0, 0, 0.05);
    border: 1px solid rgba(139, 0, 0, 0.2);
    padding: 0.3rem 0.5rem 0.3rem 0.75rem;
    cursor: pointer;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-crimson);
    transition: background 0.2s;
  }

  .visibility-toggle.readonly {
    cursor: default;
  }

  .visibility-toggle:not(.readonly):hover {
    background: rgba(139, 0, 0, 0.1);
  }

  .visibility-slider {
    width: 28px;
    height: 16px;
    background: rgba(139, 0, 0, 0.2);
    border-radius: 8px;
    position: relative;
    transition: background 0.2s;
    flex-shrink: 0;
  }

  .visibility-toggle.is-public .visibility-slider {
    background: var(--color-crimson);
  }

  .visibility-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--color-cream);
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .visibility-toggle.is-public .visibility-knob {
    transform: translateX(12px);
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
    color: var(--color-crimson);
    padding: 0.3rem 0.75rem;
  }

  .header-code-block .copy-btn {
    font-size: 0.72rem;
    padding: 0.3rem 0.6rem;
    border: none;
    border-left: 1px solid rgba(139, 0, 0, 0.2);
    background: rgba(139, 0, 0, 0.08);
    color: var(--color-crimson);
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

  header h1 {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 2.4rem;
    font-weight: 900;
    margin: 0;
    color: var(--color-ink);
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
    border-color: var(--color-ink);
    color: var(--color-ink);
  }

  .hint-info {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid #bbb;
    color: #bbb;
    font-family: Georgia, serif;
    font-size: 0.55rem;
    font-style: italic;
    font-weight: 400;
    cursor: default;
    position: relative;
    margin-left: 4px;
    flex-shrink: 0;
  }

  .hint-info:hover {
    border-color: #888;
    color: #888;
  }

  .hint-tooltip {
    display: none;
    position: absolute;
    left: 0;
    bottom: calc(100% + 5px);
    background: #333;
    color: var(--color-cream);
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.72rem;
    font-style: normal;
    font-weight: 400;
    white-space: normal;
    width: 160px;
    padding: 0.3rem 0.5rem;
    border-radius: 3px;
    pointer-events: none;
    z-index: 200;
    opacity: 0.92;
  }

  .hint-tooltip::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 6px;
    border: 4px solid transparent;
    border-top-color: #333;
  }

  .hint-info:hover .hint-tooltip {
    display: block;
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
    color: var(--color-crimson);
    font-weight: 700;
    font-size: 0.75rem;
    background: rgba(139, 0, 0, 0.06);
    border: 1px solid rgba(139, 0, 0, 0.15);
    padding: 0.15rem 0.5rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: background 0.15s;
  }

  .header-code:hover {
    background: rgba(139, 0, 0, 0.15);
  }

  .header-code.copied {
    color: #2d7a2d;
    border-color: rgba(45, 122, 45, 0.3);
    background: rgba(45, 122, 45, 0.08);
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
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal {
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
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

  .modal-close:hover {
    color: var(--color-ink);
  }

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
    color: var(--color-crimson);
  }

  .rules-content p {
    margin: 0 0 0.5rem;
    font-size: 0.9rem;
    line-height: 1.5;
    color: #444;
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

  /* Shared */
  .setup-section {
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
    padding: 1.25rem;
    margin-bottom: 1rem;
  }

  .setup-section > label {
    display: flex;
    align-items: center;
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

  .start-btn {
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
    text-transform: uppercase;
    letter-spacing: 0.05em;
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
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
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
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
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
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
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

  .code-text {
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    font-family: "Courier New", Courier, monospace;
    color: var(--color-crimson);
  }

  .copy-btn {
    padding: 0.35rem 0.7rem;
    border: 1px solid var(--color-gold);
    background: transparent;
    color: #777;
    font-size: 0.8rem;
    cursor: pointer;
    font-family: "Source Serif 4", Georgia, serif;
    transition: all 0.2s;
  }

  .copy-btn:hover {
    border-color: var(--color-ink);
    color: var(--color-ink);
  }

  .copy-btn.copied {
    border-color: #2d7a2d;
    color: #2d7a2d;
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
    background: var(--color-parchment);
    border: 1px solid transparent;
    border-bottom: 1px solid #e8d9b8;
  }

  .lobby-player.me {
    border-color: var(--color-gold);
    background: #fff8e8;
  }

  .lp-name {
    flex: 1;
    font-weight: 500;
  }

  .lp-badge {
    font-size: 0.7rem;
    padding: 0.15rem 0.45rem;
    background: rgba(139, 0, 0, 0.1);
    color: var(--color-crimson);
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

  .category-readonly {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }

  .category-readonly-inner {
    text-align: center;
    max-width: 420px;
    padding: 2.5rem 2rem;
    border: 2px solid var(--color-gold);
    border-radius: 8px;
    background: #fffef7;
  }

  .category-readonly-eyebrow {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #b89a5a;
    margin-bottom: 0.75rem;
  }

  .category-readonly-name {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-ink);
    line-height: 1.2;
    margin-bottom: 0.6rem;
  }

  .category-readonly-desc {
    font-size: 0.95rem;
    color: #555;
    margin-bottom: 1rem;
    font-style: italic;
  }

  .category-readonly-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    justify-content: center;
    margin-bottom: 1.25rem;
  }

  .suggest-open-btn {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: transparent;
    border: 2px solid var(--color-ink);
    color: var(--color-ink);
    padding: 0.55rem 1.25rem;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }

  .suggest-open-btn:hover {
    background: var(--color-ink);
    color: var(--color-parchment);
  }

  .my-suggestion {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    padding: 1.25rem 1.5rem 1rem;
    background: #fffef7;
    border: 2px solid #b89a5a;
    border-radius: 6px;
    margin-top: 0.5rem;
  }

  .my-suggestion-check {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--color-ink);
    color: var(--color-parchment);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.4rem;
  }

  .my-suggestion-label {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #b89a5a;
  }

  .my-suggestion-name {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--color-ink);
    text-align: center;
    line-height: 1.2;
    margin-top: 0.1rem;
  }

  .my-suggestion-footer {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.6rem;
  }

  .my-suggestion-sep {
    color: #ccc;
    font-size: 0.8rem;
  }

  .my-suggestion-change,
  .my-suggestion-retract {
    background: transparent;
    border: none;
    font-size: 0.78rem;
    cursor: pointer;
    padding: 0;
    transition: color 0.15s;
  }

  .my-suggestion-change {
    color: #555;
    text-decoration: underline;
  }

  .my-suggestion-change:hover {
    color: var(--color-ink);
  }

  .my-suggestion-retract {
    color: #aaa;
    text-decoration: underline;
  }

  .my-suggestion-retract:hover {
    color: #666;
  }

  /* Suggest browser (non-host) */
  .suggest-browser {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    gap: 0.5rem;
  }

  .suggest-browser-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-bottom: 0.25rem;
  }

  .suggest-browser-title {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-ink);
  }

  /* Host suggestions panel */
  .suggestions-panel {
    border: 2px solid #b89a5a;
    border-radius: 6px;
    background: #fffbf0;
    margin-bottom: 0.5rem;
    overflow: hidden;
  }

  .suggestions-panel-header {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #b89a5a;
    padding: 0.4rem 0.75rem;
    background: #fdf5e0;
    border-bottom: 1px solid var(--color-gold);
  }

  .suggestion-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #ede5cc;
  }

  .suggestion-row:last-child {
    border-bottom: none;
  }

  .suggestion-row-info {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex: 1;
    min-width: 0;
    flex-wrap: wrap;
  }

  .suggestion-row-player {
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--color-ink);
  }

  .suggestion-row-arrow {
    font-size: 0.75rem;
    color: #999;
    font-style: italic;
  }

  .suggestion-row-category {
    font-size: 0.85rem;
    color: #444;
  }

  .suggestion-row-actions {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-shrink: 0;
  }

  .suggestion-accept-btn {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--color-ink);
    color: var(--color-parchment);
    border: none;
    padding: 0.3rem 0.65rem;
    cursor: pointer;
    border-radius: 3px;
    transition: background 0.15s;
  }

  .suggestion-accept-btn:hover {
    background: #333;
  }

  .suggestion-dismiss-btn {
    background: transparent;
    border: 1px solid #ccc;
    color: #888;
    font-size: 1rem;
    line-height: 1;
    width: 1.6rem;
    height: 1.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 3px;
    transition:
      border-color 0.15s,
      color 0.15s;
  }

  .suggestion-dismiss-btn:hover {
    border-color: #888;
    color: #333;
  }

  .waiting-msg {
    text-align: center;
    padding: 1rem;
    color: #777;
    font-size: 1rem;
    font-style: italic;
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
  }

  .leave-btn {
    padding: 0.6rem;
    border: 1px solid var(--color-gold);
    background: transparent;
    color: #888;
    font-size: 0.9rem;
    cursor: pointer;
    font-family: "Source Serif 4", Georgia, serif;
    transition: all 0.2s;
  }

  .leave-btn:hover {
    border-color: var(--color-crimson);
    color: var(--color-crimson);
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
    border: 1px solid var(--color-gold);
    background: transparent;
    color: #777;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: capitalize;
  }

  .tag-btn:hover {
    border-color: var(--color-ink);
    color: var(--color-ink);
  }
  .tag-btn.active {
    background: var(--color-ink);
    border-color: var(--color-ink);
    color: var(--color-parchment);
  }

  .category-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--color-gold);
    background: var(--color-cream);
    cursor: pointer;
    transition: all 0.2s;
  }

  .category-card:hover {
    border-color: var(--color-ink);
  }
  .category-card.selected {
    border-color: var(--color-crimson);
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
  .card-check {
    color: var(--color-crimson);
    font-weight: 700;
  }
  .card-desc {
    font-size: 0.75rem;
    color: #888;
    font-style: italic;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .card-tags {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
    margin-top: 0.1rem;
  }
  .card-tag {
    font-size: 0.7rem;
    padding: 0.15rem 0.45rem;
    background: rgba(139, 0, 0, 0.06);
    color: var(--color-crimson);
    text-transform: capitalize;
  }
  .card-tag-new {
    background: rgba(184, 134, 11, 0.15);
    color: #8b6914;
    font-weight: 700;
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
    border: 1px solid var(--color-gold);
    background: transparent;
    color: #777;
    font-size: 0.85rem;
    cursor: pointer;
    font-family: "Source Serif 4", Georgia, serif;
    white-space: nowrap;
  }

  .back-btn:hover {
    border-color: var(--color-ink);
    color: var(--color-ink);
  }

  .preview-title {
    flex: 1;
  }
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
    border: 1px solid var(--color-ink);
    background: var(--color-ink);
    color: var(--color-parchment);
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .select-btn:hover {
    background: #333;
  }

  .preview-tags {
    display: flex;
    gap: 0.35rem;
  }
  .tag {
    font-size: 0.7rem;
    padding: 0.15rem 0.5rem;
    background: rgba(139, 0, 0, 0.06);
    color: var(--color-crimson);
    text-transform: capitalize;
  }
  .tag-new {
    background: rgba(184, 134, 11, 0.15);
    color: #8b6914;
    font-weight: 700;
  }

  .preview-list {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    max-height: 350px;
    overflow-y: auto;
  }

  .preview-search {
    border: 1px solid var(--color-gold);
  }

  .preview-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.35rem 0.5rem;
    background: var(--color-parchment);
    font-size: 0.85rem;
    border-bottom: 1px solid #e8d9b8;
  }

  .preview-rank {
    color: var(--color-crimson);
    font-weight: 700;
    min-width: 2.2rem;
  }
  .preview-name {
    flex: 1;
  }
  .preview-points {
    color: #888;
    font-size: 0.75rem;
    font-weight: 600;
  }
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
    border: 1px solid var(--color-gold);
    background: var(--color-cream);
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

  .mode-btn:hover {
    border-color: var(--color-ink);
  }
  .mode-btn.active {
    border-color: var(--color-ink);
    background: var(--color-ink);
    color: var(--color-parchment);
  }
  .mode-icon {
    font-size: 1.5rem;
  }

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
    border: 1px solid var(--color-gold);
    background: var(--color-cream);
    color: var(--color-ink);
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .count-btn:hover:not(:disabled) {
    border-color: var(--color-ink);
    background: var(--color-parchment);
  }
  .count-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
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
    border-bottom: 1px solid var(--color-gold);
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
    color: var(--color-crimson);
    border-color: rgba(139, 0, 0, 0.2);
  }
  .mode-badge {
    background: rgba(26, 26, 26, 0.05);
    color: #555;
    border-color: var(--color-gold);
  }
  .code-badge {
    background: rgba(26, 26, 26, 0.05);
    color: #555;
    border-color: var(--color-gold);
    font-family: "Courier New", Courier, monospace;
  }

  .scoreboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 0.6rem;
    margin-bottom: 1.5rem;
  }

  .player-card {
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
    padding: 0.65rem;
    text-align: center;
    transition: all 0.3s;
    position: relative;
  }

  .player-card.active {
    border-color: var(--color-crimson);
    background: rgba(139, 0, 0, 0.03);
    box-shadow: 0 0 12px rgba(139, 0, 0, 0.08);
  }
  .player-card.eliminated {
    opacity: 0.4;
  }
  .player-card.me {
    border-color: var(--color-gold);
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
    color: var(--color-crimson);
  }
  .player-meta {
    margin-top: 0.2rem;
  }
  .strike-dot {
    font-size: 0.65rem;
    opacity: 0.2;
    margin: 0 1px;
  }
  .strike-dot.hit {
    opacity: 1;
  }
  .turns-left {
    font-size: 0.75rem;
    color: #888;
  }

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
    background: var(--color-crimson);
    color: var(--color-cream);
    font-size: 0.65rem;
    font-weight: 700;
    padding: 2px 6px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .guess-area {
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
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
    color: var(--color-crimson);
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
    border: 1px solid var(--color-ink);
    background: var(--color-ink);
    color: var(--color-parchment);
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .guess-btn:hover:not(:disabled) {
    background: #333;
  }
  .guess-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Result */
  .result {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: center;
    animation: slideIn 0.3s ease-out;
  }

  .result.hit {
    background: var(--color-cream);
    border: 2px solid #2d5016;
  }
  .result.miss {
    background: var(--color-cream);
    border: 2px solid var(--color-crimson);
  }

  .result-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  .result-text {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }
  .result-points {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }
  .hit .result-points {
    color: #2d5016;
  }
  .miss .result-points {
    color: var(--color-crimson);
  }

  .next-btn {
    padding: 0.6rem 1.5rem;
    border: 1px solid var(--color-ink);
    background: var(--color-ink);
    color: var(--color-parchment);
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  }

  .next-btn:hover {
    background: #333;
  }

  /* Game action bar */
  .game-action-bar {
    display: flex;
    gap: 0.5rem;
    padding: 0.25rem 0 2.5rem;
    border-top: 1px solid var(--color-gold);
    flex-wrap: wrap;
    position: relative;
  }

  .mobile-game-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.75rem;
    position: relative;
  }

  .game-action-btn {
    padding: 0.35rem 0.8rem;
    border: 1px solid var(--color-gold);
    background: transparent;
    color: #555;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .game-action-btn:hover {
    border-color: var(--color-ink);
    color: var(--color-ink);
  }

  .game-action-btn.danger {
    border-color: rgba(139, 0, 0, 0.3);
    color: var(--color-crimson);
  }

  .game-action-btn.danger:hover {
    border-color: var(--color-crimson);
    background: rgba(139, 0, 0, 0.05);
  }

  /* History panel */
  .history-panel {
    position: absolute;
    bottom: 100%;
    left: 0;
    width: 240px;
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
    max-height: 260px;
    overflow-y: auto;
    z-index: 50;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 2px;
  }

  /* Confirmation modal */
  .confirm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
  }

  .confirm-modal {
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
    padding: 1.5rem;
    max-width: 320px;
    width: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  }

  .confirm-msg {
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.95rem;
    color: var(--color-ink);
    margin: 0 0 1.25rem;
    line-height: 1.5;
  }

  .confirm-btns {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .confirm-cancel {
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-gold);
    background: transparent;
    color: #555;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .confirm-cancel:hover {
    border-color: var(--color-ink);
    color: var(--color-ink);
  }

  .confirm-ok {
    padding: 0.5rem 1rem;
    border: 2px solid var(--color-ink);
    background: var(--color-ink);
    color: var(--color-parchment);
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .confirm-ok.danger {
    border-color: var(--color-crimson);
    background: var(--color-crimson);
  }

  .confirm-ok:hover {
    opacity: 0.85;
  }

  .history-list {
    display: flex;
    flex-direction: column;
  }

  .history-entry {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.75rem;
    border-bottom: 1px solid #ede0c4;
    font-size: 0.82rem;
  }

  .history-entry:last-child {
    border-bottom: none;
  }

  .history-entry.history-miss {
    opacity: 0.6;
  }

  .history-player {
    font-weight: 600;
    min-width: 70px;
    color: #555;
    font-size: 0.75rem;
  }

  .history-guess {
    flex: 1;
    font-style: italic;
  }

  .history-result {
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 40px;
    text-align: right;
  }

  .history-entry.history-hit .history-result {
    color: #2d7a2d;
  }

  .history-entry.history-miss .history-result {
    color: var(--color-crimson);
  }

  .history-empty {
    text-align: center;
    color: #888;
    font-style: italic;
    padding: 1rem;
    font-size: 0.85rem;
  }

  /* Guessed list */
  .guessed-list {
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
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

  .guessed-rank {
    color: var(--color-crimson);
    font-weight: 700;
    min-width: 2.5rem;
  }
  .guessed-name {
    flex: 1;
  }
  .guessed-value {
    color: #996633;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
  }
  .guessed-by {
    color: #999;
    font-size: 0.8rem;
    font-style: italic;
  }

  /* Results */
  .results {
    text-align: center;
  }

  .results-row {
    display: flex;
    gap: 0;
    margin-bottom: 1.5rem;
    border: 1px solid var(--color-gold);
    background: var(--color-cream);
  }

  .results-rankings,
  .results-strikes {
    flex: 1;
    min-width: 0;
    padding: 1.25rem;
    text-align: left;
  }

  .results-strikes {
    border-left: 1px solid var(--color-gold);
  }

  .results-rankings h3,
  .results-strikes h3 {
    margin: 0 0 0.75rem;
    text-align: center;
    color: #777;
    font-family: "Playfair Display", Georgia, serif;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 0.1em;
  }

  .player-strikes {
    margin-bottom: 0.75rem;
  }

  .player-strikes:last-child {
    margin-bottom: 0;
  }

  .player-strikes-name {
    font-weight: 700;
    font-size: 0.85rem;
    color: #555;
    margin-bottom: 0.25rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid #ede0c4;
  }

  .strike-entry {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0.5rem;
    font-size: 0.82rem;
  }

  .strike-x {
    color: var(--color-crimson);
    font-weight: 700;
  }

  .strike-guess {
    font-style: italic;
    color: #666;
  }

  .no-strikes {
    text-align: center;
    color: #888;
    font-style: italic;
    padding: 1rem;
    font-size: 0.85rem;
  }

  .cel-overlay {
    position: fixed;
    inset: 0;
    z-index: 999;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    animation: cel-fade-out 0.6s 3.2s ease-in forwards;
  }

  @keyframes cel-fade-out {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .cel-confetti {
    position: absolute;
    top: -20px;
    left: var(--x);
    width: var(--w, 8px);
    height: var(--h, 10px);
    background: var(--bg, #d4af37);
    opacity: 0;
    animation: cel-confetti-fall var(--dur, 2.5s) var(--delay, 0.3s) ease-in
      forwards;
  }

  @keyframes cel-confetti-fall {
    0% {
      opacity: 1;
      transform: translateY(0) translateX(0) rotate(0deg);
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(105vh) translateX(var(--drift, 0px))
        rotate(var(--rot, 360deg));
    }
  }

  .cel-shimmer-ring {
    position: absolute;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    border: 2px solid rgba(212, 175, 55, 0);
    opacity: 0;
    animation: cel-shimmer-expand 1.2s 0.4s ease-out forwards;
  }
  .cel-shimmer-ring:nth-child(2) {
    animation-delay: 0.55s;
  }
  .cel-shimmer-ring:nth-child(3) {
    animation-delay: 0.7s;
  }

  @keyframes cel-shimmer-expand {
    0% {
      opacity: 0.8;
      transform: scale(1);
      border-color: rgba(212, 175, 55, 0.6);
    }
    100% {
      opacity: 0;
      transform: scale(4);
      border-color: rgba(212, 175, 55, 0);
    }
  }

  .cel-gold-particle {
    position: absolute;
    width: var(--size);
    height: var(--size);
    background: linear-gradient(135deg, #d4af37, #f5d061);
    border-radius: 50%;
    opacity: 0;
    animation: cel-particle-burst 1s var(--delay) ease-out forwards;
  }

  @keyframes cel-particle-burst {
    0% {
      opacity: 1;
      transform: translate(0, 0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(var(--tx), var(--ty)) scale(0);
    }
  }

  .cel-seal {
    position: relative;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: radial-gradient(
      circle at 40% 35%,
      #a0342b,
      #8b0000 40%,
      #6b0000
    );
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.15),
      inset 0 -2px 4px rgba(0, 0, 0, 0.3),
      0 4px 20px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(2.5);
    animation: cel-seal-press 0.4s 0.1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes cel-seal-press {
    0% {
      opacity: 0;
      transform: scale(2.5);
    }
    60% {
      opacity: 1;
      transform: scale(0.9);
    }
    80% {
      transform: scale(1.05);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .cel-seal::before {
    content: "";
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    border: 1.5px solid rgba(255, 255, 255, 0.2);
  }

  .cel-seal::after {
    content: "";
    position: absolute;
    inset: 14px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .cel-seal-shimmer {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(212, 175, 55, 0.15) 45%,
      rgba(212, 175, 55, 0.25) 50%,
      rgba(212, 175, 55, 0.15) 55%,
      transparent 60%
    );
    opacity: 0;
    animation: cel-foil-sweep 1s 0.6s ease-in-out forwards;
  }

  @keyframes cel-foil-sweep {
    0% {
      opacity: 0;
      transform: translateX(-100%);
    }
    30% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateX(100%);
    }
  }

  .cel-seal-no {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.4em;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: -0.2rem;
  }

  .cel-seal-number {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 3.5rem;
    font-weight: 900;
    color: #fffef2;
    line-height: 1;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .cel-seal-rule {
    width: 50px;
    height: 1px;
    background: rgba(255, 255, 255, 0.25);
    margin: 0.2rem 0;
  }

  .cel-seal-points {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
  }

  .lps-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    overflow: hidden;
    animation: lps-bg-in 0.5s ease-out;
  }

  @keyframes lps-bg-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .lps-confetti {
    position: absolute;
    top: -20px;
    left: var(--x);
    width: var(--w, 8px);
    height: var(--h, 10px);
    background: var(--bg, #d4af37);
    opacity: 0;
    animation: lps-confetti-fall var(--dur, 2.5s) var(--delay, 0.3s) ease-in forwards;
    pointer-events: none;
  }

  @keyframes lps-confetti-fall {
    0% { opacity: 1; transform: translateY(0) translateX(0) rotate(0deg); }
    80% { opacity: 1; }
    100% { opacity: 0; transform: translateY(105vh) translateX(var(--drift, 0px)) rotate(var(--rot, 360deg)); }
  }

  .lps-card {
    position: relative;
    background: var(--color-cream, #faf6f1);
    border: 2px solid var(--color-ink, #1a1a1a);
    padding: 2rem 2.5rem 1.75rem;
    text-align: center;
    max-width: 360px;
    width: 88%;
    z-index: 1;
    opacity: 0;
    transform: translateY(20px);
    animation: lps-card-in 0.4s 0.1s ease-out forwards;
  }

  @keyframes lps-card-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Wax seal with winner initial */
  .lps-seal {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: radial-gradient(circle at 40% 35%, #a0342b, #8b0000 40%, #6b0000);
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.15),
      inset 0 -2px 4px rgba(0, 0, 0, 0.3),
      0 4px 16px rgba(0, 0, 0, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.25rem;
    position: relative;
    opacity: 0;
    transform: scale(2);
    animation: lps-seal-press 0.35s 0.15s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .lps-seal::before {
    content: "";
    position: absolute;
    inset: 5px;
    border-radius: 50%;
    border: 1.5px solid rgba(255, 255, 255, 0.18);
  }

  .lps-seal::after {
    content: "";
    position: absolute;
    inset: 10px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .lps-seal-shimmer {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(212, 175, 55, 0.15) 45%,
      rgba(212, 175, 55, 0.25) 50%,
      rgba(212, 175, 55, 0.15) 55%,
      transparent 60%
    );
    opacity: 0;
    animation: lps-foil-sweep 0.8s 0.5s ease-in-out forwards;
  }

  @keyframes lps-foil-sweep {
    0% { opacity: 0; transform: translateX(-100%); }
    30% { opacity: 1; }
    100% { opacity: 0; transform: translateX(100%); }
  }

  @keyframes lps-seal-press {
    0% { opacity: 0; transform: scale(2); }
    60% { opacity: 1; transform: scale(0.92); }
    80% { transform: scale(1.04); }
    100% { opacity: 1; transform: scale(1); }
  }

  .lps-seal-letter {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 2.8rem;
    font-weight: 900;
    color: #fffef2;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    line-height: 1;
    position: relative;
  }

  .lps-name {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.75rem;
    font-weight: 900;
    color: var(--color-ink, #1a1a1a);
    line-height: 1.15;
    margin-bottom: 0.75rem;
    opacity: 0;
    animation: lps-fade-up 0.35s 0.3s ease-out forwards;
  }

  .lps-rule {
    width: 60px;
    height: 2px;
    background: var(--color-crimson, #8b2500);
    margin: 0 auto 0.6rem;
    opacity: 0;
    animation: lps-fade-up 0.3s 0.4s ease-out forwards;
  }

  .lps-label {
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.8rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 1.5rem;
    opacity: 0;
    animation: lps-fade-up 0.3s 0.45s ease-out forwards;
  }

  @keyframes lps-fade-up {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .lps-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    opacity: 0;
    animation: lps-fade-up 0.3s 0.55s ease-out forwards;
  }

  .lps-btn {
    padding: 0.65rem 1.25rem;
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.95rem;
    font-weight: 600;
    border: 2px solid var(--color-ink, #1a1a1a);
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }

  .lps-btn:active {
    transform: scale(0.97);
  }

  .lps-btn.end {
    background: var(--color-ink, #1a1a1a);
    color: var(--color-parchment, #faf6f1);
  }

  .lps-btn.end:hover {
    background: var(--color-crimson, #8b2500);
    border-color: var(--color-crimson, #8b2500);
  }

  .lps-btn.keep {
    background: transparent;
    color: var(--color-ink, #1a1a1a);
  }

  .lps-btn.keep:hover {
    background: var(--color-ink, #1a1a1a);
    color: var(--color-parchment, #faf6f1);
  }

  .lps-waiting {
    color: #888;
    font-family: "Source Serif 4", Georgia, serif;
    font-style: italic;
    font-size: 0.9rem;
    opacity: 0;
    animation: lps-fade-up 0.3s 0.55s ease-out forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .winner-banner {
    background: var(--color-cream);
    border: 2px solid var(--color-crimson);
    padding: 2rem;
    margin-bottom: 2rem;
    animation: slideIn 0.5s ease-out;
  }

  .winner-banner.tie {
    border-color: #8b6914;
  }

  .winner-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }
  .winner-name {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 1.5rem;
    font-weight: 700;
  }
  .winner-score {
    font-size: 1.1rem;
    color: var(--color-crimson);
    margin-top: 0.25rem;
  }


  .ranking-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.5rem;
    border-bottom: 1px solid #ede0c4;
  }

  .ranking-row.first {
    background: rgba(139, 0, 0, 0.04);
  }
  .ranking-position {
    font-size: 1.2rem;
    min-width: 2rem;
    text-align: center;
  }
  .ranking-name {
    flex: 1;
    font-weight: 600;
  }
  .ranking-score {
    font-weight: 700;
    color: var(--color-crimson);
  }
  .ranking-details {
    font-size: 0.8rem;
    color: #888;
    font-style: italic;
  }

  /* ─── DESKTOP / MOBILE GAME TOGGLE ─── */
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

  /* ─── DESKTOP TOP BAR ─── */
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

  .dt-guess-area {
    flex: 1;
  }

  .dt-input-row {
    display: flex;
    gap: 0.5rem;
  }

  .dt-submit-btn {
    padding: 0.5rem 1.5rem;
    background: var(--color-crimson);
    border: 1px solid var(--color-crimson);
    color: var(--color-cream);
    font-family: "Playfair Display", Georgia, serif;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s;
  }

  .dt-submit-btn:hover:not(:disabled) {
    background: #6b0000;
  }
  .dt-submit-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

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

  .dt-result.hit {
    color: #2d5016;
  }
  .dt-result.miss {
    color: var(--color-crimson);
  }

  .dt-next-btn {
    padding: 0.4rem 1.2rem;
    border: 1px solid var(--color-ink);
    background: var(--color-ink);
    color: var(--color-parchment);
    font-family: "Source Serif 4", Georgia, serif;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .dt-next-btn:hover {
    background: #333;
  }

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
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
    padding: 0.75rem 1rem;
    transition: all 0.2s;
  }

  .dt-player.active {
    border-color: var(--color-crimson);
    border-left: 4px solid var(--color-crimson);
  }

  .dt-player.eliminated {
    opacity: 0.35;
  }
  .dt-player.me {
    background: #fff8e8;
  }

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
    color: var(--color-crimson);
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
    color: var(--color-crimson);
    line-height: 1;
  }

  .dt-player-meta {
    font-size: 0.75rem;
    color: #888;
    margin-top: 0.25rem;
  }

  /* ─── DESKTOP BOARD ─── */
  .dt-board {
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

  /* ranked-slot list */
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

  .dt-slot-value {
    color: #996633;
    font-size: 0.72rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .dt-slot-by {
    color: #bbb;
    font-size: 0.72rem;
    font-style: italic;
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
    margin-bottom: 0.75rem;
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
    margin-bottom: 1rem;
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

  .dt-slot-missed {
    opacity: 0.5;
  }

  .dt-slot-missed-name {
    font-style: italic;
    color: #999 !important;
    font-weight: 400 !important;
  }
</style>
