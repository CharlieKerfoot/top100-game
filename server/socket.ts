import { Server } from 'socket.io';
import { categories } from '../src/lib/categories/index.ts';
import { FIVE_LETTER_WORDS } from './words.ts';

// ── Types ──────────────────────────────────────────────────

interface Player {
  id: string;
  name: string;
  score: number;
  strikes: number;
  eliminated: boolean;
  guesses: number;
  sittingOut: boolean;
}

interface GameSettings {
  categoryId: string;
  mode: 'strikes' | 'turns';
  maxStrikes: number;
  maxTurns: number;
  hints: boolean;
}

interface GameState {
  currentPlayerIndex: number;
  playerOrder: string[];
  guessedItems: Map<number, string>;
  lastResult: GuessResult | null;
  showResult: boolean;
}

interface GuessResult {
  guess: string;
  rank: number | null;
  points: number;
  isStrike: boolean;
  playerName: string;
}

interface Party {
  code: string;
  hostId: string;
  isPublic: boolean;
  players: Map<string, Player>;
  settings: GameSettings;
  game: GameState | null;
  phase: 'lobby' | 'playing' | 'results';
}

// ── State ──────────────────────────────────────────────────

const parties = new Map<string, Party>();
const playerParty = new Map<string, string>(); // playerId -> partyCode
const socketToPlayer = new Map<string, string>(); // socketId -> playerId
const playerToSocket = new Map<string, string>(); // playerId -> socketId
const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>(); // playerId -> timeout

// ── Helpers ────────────────────────────────────────────────

function getPlayerId(socketId: string): string | undefined {
  return socketToPlayer.get(socketId);
}

function generateCode(): string {
  for (let attempt = 0; attempt < 100; attempt++) {
    const word = FIVE_LETTER_WORDS[Math.floor(Math.random() * FIVE_LETTER_WORDS.length)].toUpperCase();
    const num = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const code = `${word}-${num}`;
    if (!parties.has(code)) return code;
  }
  throw new Error('Could not generate unique code');
}

function normalizeGuess(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function serializeParty(party: Party) {
  return {
    code: party.code,
    hostId: party.hostId,
    isPublic: party.isPublic,
    players: [...party.players.values()],
    settings: party.settings,
    phase: party.phase,
  };
}

function serializeGameState(party: Party) {
  if (!party.game) return null;
  const cat = categories.find(c => c.id === party.settings.categoryId);
  return {
    currentPlayerIndex: party.game.currentPlayerIndex,
    playerOrder: party.game.playerOrder,
    guessedItems: [...party.game.guessedItems.entries()].map(([idx, name]) => ({
      index: idx,
      name: cat?.items[idx] ?? '???',
      playerName: name,
    })),
    lastResult: party.game.lastResult,
    showResult: party.game.showResult,
    players: [...party.players.values()],
    categoryId: party.settings.categoryId,
    mode: party.settings.mode,
    maxStrikes: party.settings.maxStrikes,
    maxTurns: party.settings.maxTurns,
    hints: party.settings.hints,
  };
}

function getPublicParties() {
  const result: { code: string; hostName: string; playerCount: number; categoryName: string; phase: string }[] = [];
  for (const party of parties.values()) {
    if (!party.isPublic) continue;
    const host = party.players.get(party.hostId);
    const cat = categories.find(c => c.id === party.settings.categoryId);
    result.push({
      code: party.code,
      hostName: host?.name ?? 'Unknown',
      playerCount: party.players.size,
      categoryName: cat?.name ?? 'Unknown',
      phase: party.phase,
    });
  }
  return result;
}

function findNextActivePlayer(party: Party): number {
  const game = party.game!;
  const order = game.playerOrder;
  const settings = party.settings;
  let next = (game.currentPlayerIndex + 1) % order.length;

  for (let i = 0; i < order.length; i++) {
    const playerId = order[next];
    const player = party.players.get(playerId);
    if (player) {
      if (settings.mode === 'strikes' && player.eliminated) {
        next = (next + 1) % order.length;
        continue;
      }
      if (settings.mode === 'turns' && player.guesses >= settings.maxTurns) {
        next = (next + 1) % order.length;
        continue;
      }
      return next;
    }
    next = (next + 1) % order.length;
  }
  return -1;
}

function isGameOver(party: Party): boolean {
  const settings = party.settings;
  const players = [...party.players.values()];

  if (settings.mode === 'strikes') {
    const active = players.filter(p => !p.eliminated);
    return active.length <= 1;
  } else {
    return players.every(p => p.guesses >= settings.maxTurns);
  }
}

function removePlayerFromParty(playerId: string, io: Server) {
  const code = playerParty.get(playerId);
  if (!code) return;

  const party = parties.get(code);
  if (!party) {
    playerParty.delete(playerId);
    return;
  }

  party.players.delete(playerId);
  playerParty.delete(playerId);
  playerToSocket.delete(playerId);

  if (party.players.size === 0) {
    parties.delete(code);
    return;
  }

  if (party.hostId === playerId) {
    const newHost = party.players.keys().next().value!;
    party.hostId = newHost;
  }

  if (party.game) {
    const orderIdx = party.game.playerOrder.indexOf(playerId);
    if (orderIdx !== -1) {
      if (orderIdx < party.game.currentPlayerIndex) {
        party.game.currentPlayerIndex--;
      } else if (orderIdx === party.game.currentPlayerIndex) {
        party.game.currentPlayerIndex = Math.min(
          party.game.currentPlayerIndex,
          party.game.playerOrder.length - 2
        );
        if (party.game.currentPlayerIndex < 0) party.game.currentPlayerIndex = 0;
      }
      party.game.playerOrder.splice(orderIdx, 1);
    }

    if (isGameOver(party)) {
      party.phase = 'results';
      io.to(code).emit('game-over', {
        party: serializeParty(party),
        game: serializeGameState(party),
      });
      return;
    }
  }

  io.to(code).emit('party-updated', {
    party: serializeParty(party),
    game: serializeGameState(party),
  });
}

// ── Public setup function ──────────────────────────────────

export function setupSocketServer(io: Server) {
  io.on('connection', (socket) => {
    console.log(`[+] ${socket.id}`);

    // Register maps the client's stable playerId to this socket
    socket.on('register', ({ playerId }: { playerId: string }) => {
      socketToPlayer.set(socket.id, playerId);
      playerToSocket.set(playerId, socket.id);

      // Cancel any pending disconnect removal
      const timer = disconnectTimers.get(playerId);
      if (timer) {
        clearTimeout(timer);
        disconnectTimers.delete(playerId);
      }

      // Check if this player is already in a party (reconnecting)
      const code = playerParty.get(playerId);
      if (code) {
        const party = parties.get(code);
        if (party && party.players.has(playerId)) {
          socket.join(code);
          socket.emit('rejoin', {
            phase: party.phase,
            party: serializeParty(party),
            game: serializeGameState(party),
          });
          console.log(`[reconnect] ${playerId} rejoined ${code}`);
          return;
        }
      }

      socket.emit('registered');
    });

    socket.on('create-party', ({ playerName, isPublic }: { playerName: string; isPublic: boolean }) => {
      const playerId = getPlayerId(socket.id);
      if (!playerId) return;

      removePlayerFromParty(playerId, io);

      const code = generateCode();
      const player: Player = {
        id: playerId, name: playerName,
        score: 0, strikes: 0, eliminated: false, guesses: 0,
        sittingOut: false,
      };

      const party: Party = {
        code, hostId: playerId, isPublic,
        players: new Map([[playerId, player]]),
        settings: { categoryId: categories[0].id, mode: 'strikes', maxStrikes: 3, maxTurns: 10, hints: true },
        game: null, phase: 'lobby',
      };

      parties.set(code, party);
      playerParty.set(playerId, code);
      socket.join(code);
      socket.emit('party-created', { party: serializeParty(party) });
      console.log(`[party] ${code} created by ${playerName}`);
    });

    socket.on('join-party', ({ code, playerName }: { code: string; playerName: string }) => {
      const playerId = getPlayerId(socket.id);
      if (!playerId) return;

      const party = parties.get(code.toUpperCase());
      if (!party) { socket.emit('error-msg', { message: 'Party not found' }); return; }
      if (party.players.size >= 8) { socket.emit('error-msg', { message: 'Party is full (max 8 players)' }); return; }

      removePlayerFromParty(playerId, io);

      const isMidGame = party.phase !== 'lobby';
      const player: Player = {
        id: playerId, name: playerName,
        score: 0, strikes: 0, eliminated: false, guesses: 0,
        sittingOut: isMidGame,
      };

      party.players.set(playerId, player);
      playerParty.set(playerId, party.code);
      socket.join(party.code);

      if (isMidGame) {
        // Tell the joining player they're sitting out
        socket.emit('joined-mid-game', {
          party: serializeParty(party),
          game: serializeGameState(party),
        });
        // Tell everyone else about the new spectator
        socket.to(party.code).emit('party-updated', {
          party: serializeParty(party),
          game: serializeGameState(party),
        });
      } else {
        io.to(party.code).emit('party-updated', { party: serializeParty(party), game: null });
      }
      console.log(`[party] ${playerName} joined ${party.code}${isMidGame ? ' (sitting out)' : ''}`);
    });

    socket.on('browse-parties', () => {
      socket.emit('public-parties', { parties: getPublicParties() });
    });

    socket.on('check-party', ({ code }: { code: string }) => {
      const party = parties.get(code.toUpperCase());
      if (!party) {
        socket.emit('party-check', { exists: false, code: code.toUpperCase() });
      } else {
        const host = party.players.get(party.hostId);
        const cat = categories.find(c => c.id === party.settings.categoryId);
        socket.emit('party-check', {
          exists: true,
          code: party.code,
          phase: party.phase,
          hostName: host?.name ?? 'Unknown',
          playerCount: party.players.size,
          categoryName: cat?.name ?? 'Unknown',
        });
      }
    });

    socket.on('update-settings', (settings: Partial<GameSettings> & { isPublic?: boolean }) => {
      const playerId = getPlayerId(socket.id);
      if (!playerId) return;
      const code = playerParty.get(playerId);
      if (!code) return;
      const party = parties.get(code);
      if (!party || party.hostId !== playerId) return;

      if (settings.categoryId !== undefined) party.settings.categoryId = settings.categoryId;
      if (settings.mode !== undefined) party.settings.mode = settings.mode;
      if (settings.maxStrikes !== undefined) party.settings.maxStrikes = settings.maxStrikes;
      if (settings.maxTurns !== undefined) party.settings.maxTurns = settings.maxTurns;
      if (settings.hints !== undefined) party.settings.hints = settings.hints;
      if (settings.isPublic !== undefined) party.isPublic = settings.isPublic;

      io.to(code).emit('party-updated', { party: serializeParty(party), game: null });
    });

    socket.on('start-game', () => {
      const playerId = getPlayerId(socket.id);
      if (!playerId) return;
      const code = playerParty.get(playerId);
      if (!code) return;
      const party = parties.get(code);
      if (!party || party.hostId !== playerId) return;
      if (party.players.size < 2) { socket.emit('error-msg', { message: 'Need at least 2 players' }); return; }

      for (const player of party.players.values()) {
        player.score = 0; player.strikes = 0; player.eliminated = false; player.guesses = 0; player.sittingOut = false;
      }

      party.game = {
        currentPlayerIndex: 0,
        playerOrder: [...party.players.keys()],
        guessedItems: new Map(),
        lastResult: null,
        showResult: false,
      };
      party.phase = 'playing';

      io.to(code).emit('game-started', {
        party: serializeParty(party),
        game: serializeGameState(party),
      });
      console.log(`[game] started in ${code}`);
    });

    socket.on('submit-guess', ({ guess }: { guess: string }) => {
      const playerId = getPlayerId(socket.id);
      if (!playerId) return;
      const code = playerParty.get(playerId);
      if (!code) return;
      const party = parties.get(code);
      if (!party || !party.game || party.phase !== 'playing') return;

      const game = party.game;
      if (game.playerOrder[game.currentPlayerIndex] !== playerId) return;

      const cat = categories.find(c => c.id === party.settings.categoryId);
      if (!cat) return;

      const normalized = normalizeGuess(guess);
      let foundIndex = -1;
      for (let i = 0; i < cat.items.length; i++) {
        if (normalizeGuess(cat.items[i]) === normalized) { foundIndex = i; break; }
      }

      const alreadyGuessed = foundIndex >= 0 && game.guessedItems.has(foundIndex);
      const player = party.players.get(playerId)!;
      let result: GuessResult;

      if (alreadyGuessed || foundIndex < 0) {
        result = { guess, rank: null, points: 0, isStrike: true, playerName: player.name };
        player.strikes++;
        player.guesses++;
        if (party.settings.mode === 'strikes' && player.strikes >= party.settings.maxStrikes) {
          player.eliminated = true;
        }
      } else {
        const rank = foundIndex + 1;
        const points = rank;
        result = { guess, rank, points, isStrike: false, playerName: player.name };
        player.score += points;
        player.guesses++;
        game.guessedItems.set(foundIndex, player.name);
      }

      game.lastResult = result;
      game.showResult = true;

      io.to(code).emit('guess-result', {
        result,
        game: serializeGameState(party),
        players: [...party.players.values()],
      });
    });

    socket.on('next-turn', () => {
      const playerId = getPlayerId(socket.id);
      if (!playerId) return;
      const code = playerParty.get(playerId);
      if (!code) return;
      const party = parties.get(code);
      if (!party || !party.game || party.phase !== 'playing') return;

      const game = party.game;
      game.lastResult = null;
      game.showResult = false;

      if (isGameOver(party)) {
        party.phase = 'results';
        io.to(code).emit('game-over', { party: serializeParty(party), game: serializeGameState(party) });
        return;
      }

      const next = findNextActivePlayer(party);
      if (next === -1) {
        party.phase = 'results';
        io.to(code).emit('game-over', { party: serializeParty(party), game: serializeGameState(party) });
        return;
      }

      game.currentPlayerIndex = next;
      io.to(code).emit('turn-advanced', { game: serializeGameState(party) });
    });

    socket.on('back-to-lobby', () => {
      const playerId = getPlayerId(socket.id);
      if (!playerId) return;
      const code = playerParty.get(playerId);
      if (!code) return;
      const party = parties.get(code);
      if (!party) return;

      party.game = null;
      party.phase = 'lobby';
      for (const player of party.players.values()) {
        player.score = 0; player.strikes = 0; player.eliminated = false; player.guesses = 0; player.sittingOut = false;
      }
      io.to(code).emit('returned-to-lobby', { party: serializeParty(party) });
    });

    socket.on('leave-party', () => {
      const playerId = getPlayerId(socket.id);
      if (!playerId) return;
      removePlayerFromParty(playerId, io);
      socket.emit('left-party');
    });

    socket.on('disconnect', () => {
      const playerId = socketToPlayer.get(socket.id);
      console.log(`[-] ${socket.id} (player: ${playerId ?? 'unknown'})`);
      socketToPlayer.delete(socket.id);

      if (!playerId) return;

      // Grace period: wait 30s before removing the player
      const timer = setTimeout(() => {
        disconnectTimers.delete(playerId);
        playerToSocket.delete(playerId);
        removePlayerFromParty(playerId, io);
        console.log(`[timeout] ${playerId} removed after disconnect grace period`);
      }, 30_000);
      disconnectTimers.set(playerId, timer);
    });
  });
}
