import { Server } from 'socket.io';
import { createServer } from 'http';
import { categories } from '../src/lib/categories/index.ts';

const PORT = 3001;

// ── Types ──────────────────────────────────────────────────

interface Player {
  id: string;
  name: string;
  score: number;
  strikes: number;
  eliminated: boolean;
  guesses: number;
}

interface GameSettings {
  categoryId: string;
  mode: 'strikes' | 'turns';
  maxStrikes: number;
  maxTurns: number;
}

interface GameState {
  currentPlayerIndex: number;
  playerOrder: string[]; // socket IDs in turn order
  guessedItems: Map<number, string>; // item index → player name
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
const playerParty = new Map<string, string>(); // socketId → partyCode

// ── Helpers ────────────────────────────────────────────────

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 100; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
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

function removePlayerFromParty(socketId: string, io: Server) {
  const code = playerParty.get(socketId);
  if (!code) return;

  const party = parties.get(code);
  if (!party) {
    playerParty.delete(socketId);
    return;
  }

  party.players.delete(socketId);
  playerParty.delete(socketId);

  // If party is empty, delete it
  if (party.players.size === 0) {
    parties.delete(code);
    return;
  }

  // If host left, assign new host
  if (party.hostId === socketId) {
    const newHost = party.players.keys().next().value!;
    party.hostId = newHost;
  }

  // If game is in progress, remove from player order and check game state
  if (party.game) {
    const orderIdx = party.game.playerOrder.indexOf(socketId);
    if (orderIdx !== -1) {
      // Adjust currentPlayerIndex if needed
      if (orderIdx < party.game.currentPlayerIndex) {
        party.game.currentPlayerIndex--;
      } else if (orderIdx === party.game.currentPlayerIndex) {
        // Current player left - don't change index but it'll wrap
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

// ── Server ─────────────────────────────────────────────────

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log(`[+] ${socket.id}`);

  // ── Create Party ──

  socket.on('create-party', ({ playerName, isPublic }: { playerName: string; isPublic: boolean }) => {
    // Leave any existing party
    removePlayerFromParty(socket.id, io);

    const code = generateCode();
    const player: Player = {
      id: socket.id,
      name: playerName,
      score: 0,
      strikes: 0,
      eliminated: false,
      guesses: 0,
    };

    const party: Party = {
      code,
      hostId: socket.id,
      isPublic,
      players: new Map([[socket.id, player]]),
      settings: {
        categoryId: categories[0].id,
        mode: 'strikes',
        maxStrikes: 3,
        maxTurns: 10,
      },
      game: null,
      phase: 'lobby',
    };

    parties.set(code, party);
    playerParty.set(socket.id, code);
    socket.join(code);

    socket.emit('party-created', { party: serializeParty(party) });
    console.log(`[party] ${code} created by ${playerName}`);
  });

  // ── Join Party ──

  socket.on('join-party', ({ code, playerName }: { code: string; playerName: string }) => {
    const party = parties.get(code.toUpperCase());
    if (!party) {
      socket.emit('error-msg', { message: 'Party not found' });
      return;
    }
    if (party.phase !== 'lobby') {
      socket.emit('error-msg', { message: 'Game already in progress' });
      return;
    }
    if (party.players.size >= 8) {
      socket.emit('error-msg', { message: 'Party is full (max 8 players)' });
      return;
    }

    // Leave any existing party
    removePlayerFromParty(socket.id, io);

    const player: Player = {
      id: socket.id,
      name: playerName,
      score: 0,
      strikes: 0,
      eliminated: false,
      guesses: 0,
    };

    party.players.set(socket.id, player);
    playerParty.set(socket.id, code);
    socket.join(code);

    io.to(code).emit('party-updated', { party: serializeParty(party), game: null });
    console.log(`[party] ${playerName} joined ${code}`);
  });

  // ── Browse Public Parties ──

  socket.on('browse-parties', () => {
    socket.emit('public-parties', { parties: getPublicParties() });
  });

  // ── Update Settings (host only) ──

  socket.on('update-settings', (settings: Partial<GameSettings> & { isPublic?: boolean }) => {
    const code = playerParty.get(socket.id);
    if (!code) return;
    const party = parties.get(code);
    if (!party || party.hostId !== socket.id) return;

    if (settings.categoryId !== undefined) party.settings.categoryId = settings.categoryId;
    if (settings.mode !== undefined) party.settings.mode = settings.mode;
    if (settings.maxStrikes !== undefined) party.settings.maxStrikes = settings.maxStrikes;
    if (settings.maxTurns !== undefined) party.settings.maxTurns = settings.maxTurns;
    if (settings.isPublic !== undefined) party.isPublic = settings.isPublic;

    io.to(code).emit('party-updated', { party: serializeParty(party), game: null });
  });

  // ── Start Game (host only) ──

  socket.on('start-game', () => {
    const code = playerParty.get(socket.id);
    if (!code) return;
    const party = parties.get(code);
    if (!party || party.hostId !== socket.id) return;
    if (party.players.size < 2) {
      socket.emit('error-msg', { message: 'Need at least 2 players' });
      return;
    }

    // Reset player scores
    for (const player of party.players.values()) {
      player.score = 0;
      player.strikes = 0;
      player.eliminated = false;
      player.guesses = 0;
    }

    const playerOrder = [...party.players.keys()];
    party.game = {
      currentPlayerIndex: 0,
      playerOrder,
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

  // ── Submit Guess ──

  socket.on('submit-guess', ({ guess }: { guess: string }) => {
    const code = playerParty.get(socket.id);
    if (!code) return;
    const party = parties.get(code);
    if (!party || !party.game || party.phase !== 'playing') return;

    const game = party.game;
    const currentPlayerId = game.playerOrder[game.currentPlayerIndex];
    if (currentPlayerId !== socket.id) return; // not your turn

    const cat = categories.find(c => c.id === party.settings.categoryId);
    if (!cat) return;

    const normalized = normalizeGuess(guess);
    let foundIndex = -1;
    for (let i = 0; i < cat.items.length; i++) {
      if (normalizeGuess(cat.items[i]) === normalized) {
        foundIndex = i;
        break;
      }
    }

    const alreadyGuessed = foundIndex >= 0 && game.guessedItems.has(foundIndex);
    const player = party.players.get(socket.id)!;

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
      const points = 101 - rank;
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

  // ── Next Turn ──

  socket.on('next-turn', () => {
    const code = playerParty.get(socket.id);
    if (!code) return;
    const party = parties.get(code);
    if (!party || !party.game || party.phase !== 'playing') return;

    const game = party.game;
    game.lastResult = null;
    game.showResult = false;

    if (isGameOver(party)) {
      party.phase = 'results';
      io.to(code).emit('game-over', {
        party: serializeParty(party),
        game: serializeGameState(party),
      });
      return;
    }

    const next = findNextActivePlayer(party);
    if (next === -1) {
      party.phase = 'results';
      io.to(code).emit('game-over', {
        party: serializeParty(party),
        game: serializeGameState(party),
      });
      return;
    }

    game.currentPlayerIndex = next;

    io.to(code).emit('turn-advanced', {
      game: serializeGameState(party),
    });
  });

  // ── Back to Lobby ──

  socket.on('back-to-lobby', () => {
    const code = playerParty.get(socket.id);
    if (!code) return;
    const party = parties.get(code);
    if (!party) return;

    party.game = null;
    party.phase = 'lobby';

    // Reset player stats
    for (const player of party.players.values()) {
      player.score = 0;
      player.strikes = 0;
      player.eliminated = false;
      player.guesses = 0;
    }

    io.to(code).emit('returned-to-lobby', { party: serializeParty(party) });
  });

  // ── Leave Party ──

  socket.on('leave-party', () => {
    removePlayerFromParty(socket.id, io);
    socket.emit('left-party');
  });

  // ── Disconnect ──

  socket.on('disconnect', () => {
    console.log(`[-] ${socket.id}`);
    removePlayerFromParty(socket.id, io);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Game server running on http://localhost:${PORT}`);
});
