import { io, type Socket } from 'socket.io-client';
import { goto } from '$app/navigation';
import { getContext } from 'svelte';
import { lists } from './lists/index';

export type AppPhase = 'home' | 'lobby' | 'playing' | 'results' | 'sitting-out';

export interface PlayerInfo {
  id: string;
  name: string;
  score: number;
  strikes: number;
  eliminated: boolean;
  guesses: number;
  sittingOut: boolean;
}

export interface GuessedItem {
  index: number;
  name: string;
  playerName: string;
  value?: string;
}

export interface GuessResult {
  guess: string;
  rank: number | null;
  points: number;
  isStrike: boolean;
  playerName: string;
  value?: string;
  valueLabel?: string;
}

export interface GuessHistoryEntry {
  guess: string;
  playerName: string;
  isStrike: boolean;
  rank: number | null;
  value?: string;
}

export interface PublicParty {
  code: string;
  hostName: string;
  playerCount: number;
  listName: string;
  phase: string;
}

export interface ListSuggestion {
  playerId: string;
  playerName: string;
  listId: string;
  listName: string;
}

// In production, Socket.IO runs on the same origin. In dev, separate port.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.DEV ? 'http://localhost:3001' : undefined);

function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('top100_player_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('top100_player_id', id);
  }
  return id;
}

export function createMultiplayerState() {
  let socket = $state<Socket | null>(null);
  let phase = $state<AppPhase>('home');
  let error = $state('');
  let socketReady = $state(false); // true after registered or rejoin fires

  // Party state
  let partyCode = $state('');
  let hostId = $state('');
  let isPublic = $state(true);
  let players = $state<PlayerInfo[]>([]);

  // Settings
  let listId = $state(lists[0].id);
  let mode = $state<'strikes' | 'turns'>('strikes');
  let maxStrikes = $state(3);
  let maxTurns = $state(10);
  let hints = $state(true);
  let valueLabel = $state<string | undefined>(undefined);

  // Game state
  let currentPlayerIndex = $state(0);
  let playerOrder = $state<string[]>([]);
  let guessedItems = $state<GuessedItem[]>([]);
  let guessHistory = $state<GuessHistoryEntry[]>([]);
  let lastResult = $state<GuessResult | null>(null);
  let showResult = $state(false);
  let lastPlayerStanding = $state<{ winnerId: string; winnerName: string } | null>(null);

  // Browse
  let publicParties = $state<PublicParty[]>([]);

  // List suggestions (lobby)
  let listSuggestions = $state<ListSuggestion[]>([]);

  const playerId = getOrCreatePlayerId();

  // Derived
  const myId = $derived(playerId);
  const isHost = $derived(myId === hostId);
  const list = $derived(lists.find(c => c.id === listId) ?? lists[0]);
  const currentPlayerId = $derived(playerOrder[currentPlayerIndex] ?? '');
  const isMyTurn = $derived(currentPlayerId === myId);
  const currentPlayer = $derived(players.find(p => p.id === currentPlayerId));
  const rankings = $derived([...players].sort((a, b) => b.score - a.score));
  const winner = $derived.by(() => {
    if (phase !== 'results') return null;
    const sorted = [...players].sort((a, b) => b.score - a.score);
    if (sorted.length >= 2 && sorted[0].score === sorted[1].score) return null;
    return sorted[0];
  });

  function connect() {
    if (socket) return; // already created (may still be connecting)

    const opts = { transports: ['websocket'] as string[] };
    const s = SOCKET_URL ? io(SOCKET_URL, opts) : io(opts);
    socket = s;

    s.on('connect', () => {
      error = '';
      // Register with stable playerId on every connect/reconnect
      s.emit('register', { playerId });
    });

    s.on('registered', () => {
      socketReady = true;
    });

    s.on('rejoin', ({ phase: p, party, game }: { phase: string; party: any; game: any }) => {
      applyPartyState(party);
      if (game) applyGameState(game);
      // Check if this player is sitting out
      const me = party.players?.find((pl: any) => pl.id === playerId);
      if (me?.sittingOut && (p === 'playing' || p === 'results')) {
        phase = 'sitting-out';
      } else {
        phase = p as AppPhase;
      }
      error = '';
      socketReady = true;
      if (party.code && window.location.pathname !== `/${party.code}`) {
        goto(`/${party.code}`);
      }
    });

    s.on('disconnect', () => {
      // Don't reset to home on disconnect, we might reconnect
      error = 'Reconnecting...';
    });

    s.on('error-msg', ({ message }: { message: string }) => {
      error = message;
      setTimeout(() => { if (error === message) error = ''; }, 4000);
    });

    s.on('party-created', ({ party }: { party: any }) => {
      applyPartyState(party);
      phase = 'lobby';
      error = '';
      goto(`/${party.code}`);
    });

    s.on('party-updated', ({ party, game }: { party: any; game: any }) => {
      const wasHome = phase === 'home';
      applyPartyState(party);
      if (game) applyGameState(game);
      // If we were on the home screen and just joined, navigate to the party
      if (wasHome && partyCode && window.location.pathname !== `/${partyCode}`) {
        goto(`/${partyCode}`);
      }
    });

    s.on('public-parties', ({ parties: partyList }: { parties: PublicParty[] }) => {
      publicParties = partyList;
    });

    s.on('joined-mid-game', ({ party, game }: { party: any; game: any }) => {
      applyPartyState(party);
      if (game) applyGameState(game);
      phase = 'sitting-out';
      error = '';
      if (window.location.pathname !== `/${party.code}`) {
        goto(`/${party.code}`);
      }
    });

    s.on('game-started', ({ party, game }: { party: any; game: any }) => {
      applyPartyState(party);
      applyGameState(game);
      phase = 'playing';
      error = '';
    });

    s.on('guess-result', ({ result, game, players: updatedPlayers }: { result: GuessResult; game: any; players: PlayerInfo[] }) => {
      lastResult = result;
      showResult = true;
      players = updatedPlayers;
      if (game) applyGameState(game);
    });

    s.on('turn-advanced', ({ game }: { game: any }) => {
      applyGameState(game);
      lastResult = null;
      showResult = false;
    });

    s.on('last-player-standing', ({ winnerId, winnerName, game, players: updatedPlayers }: { winnerId: string; winnerName: string; game: any; players: PlayerInfo[] }) => {
      if (game) applyGameState(game);
      players = updatedPlayers;
      lastPlayerStanding = { winnerId, winnerName };
    });

    s.on('game-continued', ({ game, players: updatedPlayers }: { game: any; players: PlayerInfo[] }) => {
      if (game) applyGameState(game);
      players = updatedPlayers;
      lastPlayerStanding = null;
      lastResult = null;
      showResult = false;
    });

    s.on('game-over', ({ party, game }: { party: any; game: any }) => {
      applyPartyState(party);
      if (game) applyGameState(game);
      lastPlayerStanding = null;
      phase = 'results';
    });

    s.on('returned-to-lobby', ({ party }: { party: any }) => {
      applyPartyState(party);
      lastResult = null;
      showResult = false;
      guessedItems = [];
      phase = 'lobby';
      goto(`/${party.code}`);
    });

    s.on('left-party', () => {
      resetState();
      phase = 'home';
      goto('/');
    });
  }

  function applyPartyState(party: any) {
    partyCode = party.code;
    hostId = party.hostId;
    isPublic = party.isPublic;
    players = party.players;
    listId = party.settings.listId;
    mode = party.settings.mode;
    maxStrikes = party.settings.maxStrikes;
    maxTurns = party.settings.maxTurns;
    hints = party.settings.hints ?? true;
    listSuggestions = party.suggestions ?? [];
    if (party.phase === 'lobby') phase = 'lobby';
  }

  function applyGameState(game: any) {
    currentPlayerIndex = game.currentPlayerIndex;
    playerOrder = game.playerOrder;
    guessedItems = game.guessedItems;
    lastResult = game.lastResult;
    showResult = game.showResult;
    if (game.players) players = game.players;
    if (game.listId) listId = game.listId;
    if (game.mode) mode = game.mode;
    if (game.maxStrikes) maxStrikes = game.maxStrikes;
    if (game.maxTurns) maxTurns = game.maxTurns;
    if (game.hints !== undefined) hints = game.hints;
    if (game.valueLabel !== undefined) valueLabel = game.valueLabel;
    if (game.guessHistory) guessHistory = game.guessHistory;
  }

  function resetState() {
    partyCode = '';
    hostId = '';
    players = [];
    guessedItems = [];
    guessHistory = [];
    lastResult = null;
    showResult = false;
    currentPlayerIndex = 0;
    playerOrder = [];
    listSuggestions = [];
    valueLabel = undefined;
  }

  function waitForConnection(fn: () => void) {
    let attempts = 0;
    const tryEmit = () => {
      if (socket?.connected) {
        fn();
      } else if (++attempts > 50) {
        error = 'Could not connect to the server. Please try again.';
      } else {
        setTimeout(tryEmit, 100);
      }
    };
    tryEmit();
  }

  function createParty(playerName: string, pub: boolean) {
    connect();
    waitForConnection(() => socket!.emit('create-party', { playerName, isPublic: pub }));
  }

  function joinParty(code: string, playerName: string) {
    connect();
    waitForConnection(() => socket!.emit('join-party', { code: code.toUpperCase(), playerName }));
  }

  function browseParties() {
    connect();
    waitForConnection(() => socket!.emit('browse-parties'));
  }

  function updateSettings(update: Record<string, unknown>) {
    socket?.emit('update-settings', update);
  }

  function startGame() {
    socket?.emit('start-game');
  }

  function submitGuess(guess: string) {
    socket?.emit('submit-guess', { guess });
  }

  function nextTurn() {
    socket?.emit('next-turn');
  }

  function endGameEarly() {
    socket?.emit('end-game-early');
  }

  function continueGame() {
    socket?.emit('continue-game');
  }

  function backToLobby() {
    socket?.emit('back-to-lobby');
  }

  function leaveParty() {
    socket?.emit('leave-party');
  }

  function checkParty(code: string): Promise<{ exists: boolean; code: string; phase?: string; hostName?: string; playerCount?: number; listName?: string }> {
    connect();
    return new Promise((resolve) => {
      let attempts = 0;
      const tryEmit = () => {
        if (++attempts > 50) {
          resolve({ exists: false, code: code.toUpperCase() });
          return;
        }
        if (socket?.connected) {
          socket.once('party-check', (data: any) => resolve(data));
          socket.emit('check-party', { code });
        } else {
          setTimeout(tryEmit, 100);
        }
      };
      tryEmit();
    });
  }

  function suggestList(listId: string) {
    socket?.emit('suggest-list', { listId });
  }

  function dismissSuggestion(targetPlayerId: string) {
    socket?.emit('dismiss-suggestion', { playerId: targetPlayerId });
  }

  function setPhase(p: AppPhase) {
    phase = p;
  }

  // Lazy connect: only auto-connect if we're on a party route (reconnect on refresh).
  // Otherwise, connect() is called by createParty/joinParty/browseParties on demand.
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.slice(1);
    if (path && /^[A-Z]{5}-\d{4}$/i.test(path)) {
      connect();
    }
  }

  return {
    get phase() { return phase; },
    get socketReady() { return socketReady; },
    get error() { return error; },
    set error(v: string) { error = v; },
    get partyCode() { return partyCode; },
    get hostId() { return hostId; },
    get isPublic() { return isPublic; },
    get players() { return players; },
    get listId() { return listId; },
    get mode() { return mode; },
    get maxStrikes() { return maxStrikes; },
    get maxTurns() { return maxTurns; },
    get hints() { return hints; },
    get valueLabel() { return valueLabel; },
    get currentPlayerIndex() { return currentPlayerIndex; },
    get playerOrder() { return playerOrder; },
    get guessedItems() { return guessedItems; },
    get guessHistory() { return guessHistory; },
    get lastResult() { return lastResult; },
    get showResult() { return showResult; },
    get publicParties() { return publicParties; },
    get listSuggestions() { return listSuggestions; },
    get myId() { return myId; },
    get isHost() { return isHost; },
    get list() { return list; },
    get currentPlayerId() { return currentPlayerId; },
    get isMyTurn() { return isMyTurn; },
    get currentPlayer() { return currentPlayer; },
    get rankings() { return rankings; },
    get winner() { return winner; },
    get lastPlayerStanding() { return lastPlayerStanding; },
    connect,
    createParty,
    joinParty,
    browseParties,
    updateSettings,
    startGame,
    submitGuess,
    nextTurn,
    endGameEarly,
    continueGame,
    backToLobby,
    leaveParty,
    checkParty,
    suggestList,
    dismissSuggestion,
    setPhase,
  };
}

export type MultiplayerState = ReturnType<typeof createMultiplayerState>;

export function getMultiplayerState(): MultiplayerState {
  return getContext<MultiplayerState>('mp');
}
