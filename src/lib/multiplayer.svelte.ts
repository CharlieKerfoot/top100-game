import { io, type Socket } from 'socket.io-client';
import { categories } from './categories/index';

export type AppPhase = 'home' | 'lobby' | 'playing' | 'results';

export interface PlayerInfo {
  id: string;
  name: string;
  score: number;
  strikes: number;
  eliminated: boolean;
  guesses: number;
}

export interface GuessedItem {
  index: number;
  name: string;
  playerName: string;
}

export interface GuessResult {
  guess: string;
  rank: number | null;
  points: number;
  isStrike: boolean;
  playerName: string;
}

export interface PublicParty {
  code: string;
  hostName: string;
  playerCount: number;
  categoryName: string;
  phase: string;
}

// In production, Socket.IO runs on the same origin. In dev, separate port.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.DEV ? 'http://localhost:3001' : undefined);

export function createMultiplayerState() {
  let socket = $state<Socket | null>(null);
  let phase = $state<AppPhase>('home');
  let error = $state('');

  // Party state
  let partyCode = $state('');
  let hostId = $state('');
  let isPublic = $state(true);
  let players = $state<PlayerInfo[]>([]);

  // Settings
  let categoryId = $state(categories[0].id);
  let mode = $state<'strikes' | 'turns'>('strikes');
  let maxStrikes = $state(3);
  let maxTurns = $state(10);

  // Game state
  let currentPlayerIndex = $state(0);
  let playerOrder = $state<string[]>([]);
  let guessedItems = $state<GuessedItem[]>([]);
  let lastResult = $state<GuessResult | null>(null);
  let showResult = $state(false);

  // Browse
  let publicParties = $state<PublicParty[]>([]);

  // Derived
  const myId = $derived(socket?.id ?? '');
  const isHost = $derived(myId === hostId);
  const category = $derived(categories.find(c => c.id === categoryId) ?? categories[0]);
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
    if (socket?.connected) return;

    const s = SOCKET_URL ? io(SOCKET_URL) : io();
    socket = s;

    s.on('connect', () => {
      error = '';
    });

    s.on('disconnect', () => {
      phase = 'home';
      error = 'Disconnected from server';
    });

    s.on('error-msg', ({ message }: { message: string }) => {
      error = message;
      setTimeout(() => { if (error === message) error = ''; }, 4000);
    });

    s.on('party-created', ({ party }: { party: any }) => {
      applyPartyState(party);
      phase = 'lobby';
      error = '';
    });

    s.on('party-updated', ({ party, game }: { party: any; game: any }) => {
      applyPartyState(party);
      if (game) applyGameState(game);
    });

    s.on('public-parties', ({ parties: list }: { parties: PublicParty[] }) => {
      publicParties = list;
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

    s.on('game-over', ({ party, game }: { party: any; game: any }) => {
      applyPartyState(party);
      if (game) applyGameState(game);
      phase = 'results';
    });

    s.on('returned-to-lobby', ({ party }: { party: any }) => {
      applyPartyState(party);
      lastResult = null;
      showResult = false;
      guessedItems = [];
      phase = 'lobby';
    });

    s.on('left-party', () => {
      resetState();
      phase = 'home';
    });
  }

  function applyPartyState(party: any) {
    partyCode = party.code;
    hostId = party.hostId;
    isPublic = party.isPublic;
    players = party.players;
    categoryId = party.settings.categoryId;
    mode = party.settings.mode;
    maxStrikes = party.settings.maxStrikes;
    maxTurns = party.settings.maxTurns;
    if (party.phase === 'lobby') phase = 'lobby';
  }

  function applyGameState(game: any) {
    currentPlayerIndex = game.currentPlayerIndex;
    playerOrder = game.playerOrder;
    guessedItems = game.guessedItems;
    lastResult = game.lastResult;
    showResult = game.showResult;
    if (game.players) players = game.players;
    if (game.categoryId) categoryId = game.categoryId;
    if (game.mode) mode = game.mode;
    if (game.maxStrikes) maxStrikes = game.maxStrikes;
    if (game.maxTurns) maxTurns = game.maxTurns;
  }

  function resetState() {
    partyCode = '';
    hostId = '';
    players = [];
    guessedItems = [];
    lastResult = null;
    showResult = false;
    currentPlayerIndex = 0;
    playerOrder = [];
  }

  function createParty(playerName: string, pub: boolean) {
    connect();
    // Wait for connection then emit
    const tryEmit = () => {
      if (socket?.connected) {
        socket.emit('create-party', { playerName, isPublic: pub });
      } else {
        setTimeout(tryEmit, 100);
      }
    };
    tryEmit();
  }

  function joinParty(code: string, playerName: string) {
    connect();
    const tryEmit = () => {
      if (socket?.connected) {
        socket.emit('join-party', { code: code.toUpperCase(), playerName });
      } else {
        setTimeout(tryEmit, 100);
      }
    };
    tryEmit();
  }

  function browseParties() {
    connect();
    const tryEmit = () => {
      if (socket?.connected) {
        socket.emit('browse-parties');
      } else {
        setTimeout(tryEmit, 100);
      }
    };
    tryEmit();
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

  function backToLobby() {
    socket?.emit('back-to-lobby');
  }

  function leaveParty() {
    socket?.emit('leave-party');
  }

  return {
    get phase() { return phase; },
    get error() { return error; },
    set error(v: string) { error = v; },
    get partyCode() { return partyCode; },
    get hostId() { return hostId; },
    get isPublic() { return isPublic; },
    get players() { return players; },
    get categoryId() { return categoryId; },
    get mode() { return mode; },
    get maxStrikes() { return maxStrikes; },
    get maxTurns() { return maxTurns; },
    get currentPlayerIndex() { return currentPlayerIndex; },
    get playerOrder() { return playerOrder; },
    get guessedItems() { return guessedItems; },
    get lastResult() { return lastResult; },
    get showResult() { return showResult; },
    get publicParties() { return publicParties; },
    get myId() { return myId; },
    get isHost() { return isHost; },
    get category() { return category; },
    get currentPlayerId() { return currentPlayerId; },
    get isMyTurn() { return isMyTurn; },
    get currentPlayer() { return currentPlayer; },
    get rankings() { return rankings; },
    get winner() { return winner; },
    connect,
    createParty,
    joinParty,
    browseParties,
    updateSettings,
    startGame,
    submitGuess,
    nextTurn,
    backToLobby,
    leaveParty,
  };
}
