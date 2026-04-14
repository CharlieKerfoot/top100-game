import { Server } from 'socket.io';
import { lists } from '../src/lib/lists/index.ts';
import { FIVE_LETTER_WORDS } from './words.ts';
import { normalizeGuess } from '../src/lib/normalize.ts';

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
  listId: string;
  mode: 'strikes' | 'turns';
  maxStrikes: number;
  maxTurns: number;
  hints: boolean;
}

interface GuessHistoryEntry {
  guess: string;
  playerName: string;
  isStrike: boolean;
  rank: number | null;
  value?: string;
}

interface GameState {
  currentPlayerIndex: number;
  playerOrder: string[];
  guessedItems: Map<number, string>;
  guessHistory: GuessHistoryEntry[];
  lastResult: GuessResult | null;
  showResult: boolean;
  /** Set when the winner chooses "keep going" — only this player gets turns */
  winnerId: string | null;
}

interface GuessResult {
  guess: string;
  rank: number | null;
  points: number;
  isStrike: boolean;
  playerName: string;
  value?: string;
  valueLabel?: string;
}

interface ListSuggestion {
  playerId: string;
  playerName: string;
  listId: string;
  listName: string;
}

interface Party {
  code: string;
  hostId: string;
  isPublic: boolean;
  players: Map<string, Player>;
  settings: GameSettings;
  game: GameState | null;
  phase: 'lobby' | 'playing' | 'results';
  suggestions: Map<string, string>; // playerId -> listId
}

// ── State ──────────────────────────────────────────────────

const parties = new Map<string, Party>();
const playerParty = new Map<string, string>(); // playerId -> partyCode
const socketToPlayer = new Map<string, string>(); // socketId -> playerId
const playerToSocket = new Map<string, string>(); // playerId -> socketId
const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>(); // playerId -> timeout

// ── Helpers ────────────────────────────────────────────────

function sanitizeString(s: unknown, maxLen: number): string | null {
  if (typeof s !== 'string') return null;
  const trimmed = s.trim().slice(0, maxLen);
  return trimmed || null;
}

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

function serializeParty(party: Party) {
  const suggestions: ListSuggestion[] = [];
  for (const [playerId, listId] of party.suggestions) {
    const player = party.players.get(playerId);
    const list = lists.find(c => c.id === listId);
    if (player && list) {
      suggestions.push({ playerId, playerName: player.name, listId, listName: list.name });
    }
  }
  return {
    code: party.code,
    hostId: party.hostId,
    isPublic: party.isPublic,
    players: [...party.players.values()],
    settings: party.settings,
    phase: party.phase,
    suggestions,
  };
}

function serializeGameState(party: Party) {
  if (!party.game) return null;
  const list = lists.find(c => c.id === party.settings.listId);
  return {
    currentPlayerIndex: party.game.currentPlayerIndex,
    playerOrder: party.game.playerOrder,
    guessedItems: [...party.game.guessedItems.entries()].map(([idx, name]) => ({
      index: idx,
      name: list?.items[idx] ?? '???',
      playerName: name,
      value: list?.values?.[idx],
    })),
    valueLabel: list?.valueLabel,
    guessHistory: party.game.guessHistory,
    lastResult: party.game.lastResult,
    showResult: party.game.showResult,
    winnerId: party.game.winnerId,
    players: [...party.players.values()],
    listId: party.settings.listId,
    mode: party.settings.mode,
    maxStrikes: party.settings.maxStrikes,
    maxTurns: party.settings.maxTurns,
    hints: party.settings.hints,
  };
}

function getPublicParties() {
  const result: { code: string; hostName: string; playerCount: number; listName: string; phase: string }[] = [];
  for (const party of parties.values()) {
    if (!party.isPublic) continue;
    const host = party.players.get(party.hostId);
    const list = lists.find(c => c.id === party.settings.listId);
    result.push({
      code: party.code,
      hostName: host?.name ?? 'Unknown',
      playerCount: party.players.size,
      listName: list?.name ?? 'Unknown',
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
    return active.length === 0;
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
  party.suggestions.delete(playerId);
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
      const wasCurrentPlayer = orderIdx === party.game.currentPlayerIndex;
      if (orderIdx < party.game.currentPlayerIndex) {
        party.game.currentPlayerIndex--;
      }
      party.game.playerOrder.splice(orderIdx, 1);

      // Wrap the index if it's now past the end of the array
      if (party.game.playerOrder.length > 0) {
        party.game.currentPlayerIndex = party.game.currentPlayerIndex % party.game.playerOrder.length;
      }

      // If the removed player was the current player, find the next valid one
      if (wasCurrentPlayer && party.game.playerOrder.length > 0) {
        // Temporarily step back so findNextActivePlayer advances to the right slot
        party.game.currentPlayerIndex = (party.game.currentPlayerIndex - 1 + party.game.playerOrder.length) % party.game.playerOrder.length;
        const next = findNextActivePlayer(party);
        if (next !== -1) {
          party.game.currentPlayerIndex = next;
        }
      }
    }

    if (isGameOver(party) || party.game.playerOrder.length === 0) {
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
      if (typeof playerId !== 'string' || !playerId || playerId.length > 100) return;
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
      const name = sanitizeString(playerName, 30);
      if (!name) return;

      removePlayerFromParty(playerId, io);

      const code = generateCode();
      const player: Player = {
        id: playerId, name,
        score: 0, strikes: 0, eliminated: false, guesses: 0,
        sittingOut: false,
      };

      const party: Party = {
        code, hostId: playerId, isPublic,
        players: new Map([[playerId, player]]),
        settings: { listId: lists[0].id, mode: 'strikes', maxStrikes: 3, maxTurns: 10, hints: true },
        game: null, phase: 'lobby',
        suggestions: new Map(),
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
      const name = sanitizeString(playerName, 30);
      if (!name) return;

      const party = parties.get(code.toUpperCase());
      if (!party) { socket.emit('error-msg', { message: 'Party not found' }); return; }
      if (party.players.size >= 8) { socket.emit('error-msg', { message: 'Party is full (max 8 players)' }); return; }

      removePlayerFromParty(playerId, io);

      const isMidGame = party.phase !== 'lobby';
      const player: Player = {
        id: playerId, name,
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
        const list = lists.find(c => c.id === party.settings.listId);
        socket.emit('party-check', {
          exists: true,
          code: party.code,
          phase: party.phase,
          hostName: host?.name ?? 'Unknown',
          playerCount: party.players.size,
          listName: list?.name ?? 'Unknown',
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

      if (settings.listId !== undefined) {
        if (typeof settings.listId !== 'string' || !lists.find(c => c.id === settings.listId)) return;
        party.settings.listId = settings.listId;
      }
      if (settings.mode !== undefined) {
        if (settings.mode !== 'strikes' && settings.mode !== 'turns') return;
        party.settings.mode = settings.mode;
      }
      if (settings.maxStrikes !== undefined) {
        const n = Number(settings.maxStrikes);
        if (!Number.isInteger(n) || n < 1 || n > 10) return;
        party.settings.maxStrikes = n;
      }
      if (settings.maxTurns !== undefined) {
        const n = Number(settings.maxTurns);
        if (!Number.isInteger(n) || n < 1 || n > 100) return;
        party.settings.maxTurns = n;
      }
      if (settings.hints !== undefined) {
        if (typeof settings.hints !== 'boolean') return;
        party.settings.hints = settings.hints;
      }
      if (settings.isPublic !== undefined) {
        if (typeof settings.isPublic !== 'boolean') return;
        party.isPublic = settings.isPublic;
      }

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
        guessHistory: [],
        lastResult: null,
        showResult: false,
        winnerId: null,
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
      const safeGuess = sanitizeString(guess, 200);
      if (!safeGuess) return;
      const code = playerParty.get(playerId);
      if (!code) return;
      const party = parties.get(code);
      if (!party || !party.game || party.phase !== 'playing') return;

      const game = party.game;
      if (game.playerOrder[game.currentPlayerIndex] !== playerId) return;

      const list = lists.find(c => c.id === party.settings.listId);
      if (!list) return;

      const normalized = normalizeGuess(safeGuess);
      let foundIndex = -1;
      for (let i = 0; i < list.items.length; i++) {
        if (normalizeGuess(list.items[i]) === normalized) { foundIndex = i; break; }
      }
      // Check aliases if no direct match
      if (foundIndex < 0 && list.aliases) {
        for (const [alias, canonical] of Object.entries(list.aliases)) {
          if (normalizeGuess(alias) === normalized) {
            for (let i = 0; i < list.items.length; i++) {
              if (normalizeGuess(list.items[i]) === normalizeGuess(canonical)) { foundIndex = i; break; }
            }
            break;
          }
        }
      }

      const alreadyGuessed = foundIndex >= 0 && game.guessedItems.has(foundIndex);
      const player = party.players.get(playerId)!;
      let result: GuessResult;

      if (alreadyGuessed || foundIndex < 0) {
        result = { guess: safeGuess, rank: null, points: 0, isStrike: true, playerName: player.name };
        player.strikes++;
        player.guesses++;
        if (party.settings.mode === 'strikes' && player.strikes >= party.settings.maxStrikes) {
          player.eliminated = true;
        }
      } else {
        const rank = foundIndex + 1;
        const points = rank;
        const value = list.values?.[foundIndex];
        const valueLabel = list.valueLabel;
        result = { guess: safeGuess, rank, points, isStrike: false, playerName: player.name, value, valueLabel };
        player.score += points;
        player.guesses++;
        game.guessedItems.set(foundIndex, player.name);
      }

      game.guessHistory.push({ guess: safeGuess, playerName: player.name, isStrike: result.isStrike, rank: result.rank, value: result.value });
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
      if (!game.showResult) return; // only advance when a result is showing

      game.lastResult = null;
      game.showResult = false;

      if (isGameOver(party)) {
        party.phase = 'results';
        io.to(code).emit('game-over', { party: serializeParty(party), game: serializeGameState(party) });
        return;
      }

      // If the winner is in "keep going" mode, they play solo
      if (game.winnerId) {
        const winner = party.players.get(game.winnerId);
        if (!winner || winner.eliminated) {
          // Winner got their final strike — game over, show results
          party.phase = 'results';
          io.to(code).emit('game-over', { party: serializeParty(party), game: serializeGameState(party) });
          return;
        }
        // Winner keeps going — turn stays on them
        const winnerIndex = game.playerOrder.indexOf(game.winnerId);
        game.currentPlayerIndex = winnerIndex;
        io.to(code).emit('turn-advanced', { game: serializeGameState(party) });
        return;
      }

      // In strikes mode, check if only one player remains
      if (party.settings.mode === 'strikes') {
        const active = [...party.players.values()].filter(p => !p.eliminated);
        if (active.length === 1) {
          const lastPlayer = active[0];
          const otherScores = [...party.players.values()]
            .filter(p => p.id !== lastPlayer.id)
            .map(p => p.score);
          const highestOtherScore = otherScores.length > 0 ? Math.max(...otherScores) : 0;
          if (lastPlayer.score > highestOtherScore) {
            // Last player standing AND has the highest score — they win
            io.to(code).emit('last-player-standing', {
              winnerId: lastPlayer.id,
              winnerName: lastPlayer.name,
              game: serializeGameState(party),
              players: [...party.players.values()],
            });
            return;
          }
          // Last player standing but NOT in the lead — they keep playing solo
          // (findNextActivePlayer will return them since they're the only one left)
        }
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

    socket.on('end-game-early', () => {
      const playerId = getPlayerId(socket.id);
      if (!playerId) return;
      const code = playerParty.get(playerId);
      if (!code) return;
      const party = parties.get(code);
      if (!party || !party.game || party.phase !== 'playing') return;

      party.phase = 'results';
      io.to(code).emit('game-over', { party: serializeParty(party), game: serializeGameState(party) });
    });

    socket.on('continue-game', () => {
      const playerId = getPlayerId(socket.id);
      if (!playerId) return;
      const code = playerParty.get(playerId);
      if (!code) return;
      const party = parties.get(code);
      if (!party || !party.game || party.phase !== 'playing') return;

      const game = party.game;
      // Only the winner keeps playing — other players stay eliminated
      game.winnerId = playerId;
      // Un-eliminate the winner so they can keep guessing
      const winner = party.players.get(playerId);
      if (winner) winner.eliminated = false;
      // Set the current player to the winner
      const winnerIndex = game.playerOrder.indexOf(playerId);
      if (winnerIndex === -1) {
        party.phase = 'results';
        io.to(code).emit('game-over', { party: serializeParty(party), game: serializeGameState(party) });
        return;
      }
      game.currentPlayerIndex = winnerIndex;
      io.to(code).emit('game-continued', {
        game: serializeGameState(party),
        players: [...party.players.values()],
      });
    });

    socket.on('back-to-lobby', () => {
      const playerId = getPlayerId(socket.id);
      if (!playerId) return;
      const code = playerParty.get(playerId);
      if (!code) return;
      const party = parties.get(code);
      if (!party || party.hostId !== playerId) return;

      party.game = null;
      party.phase = 'lobby';
      party.suggestions.clear();
      for (const player of party.players.values()) {
        player.score = 0; player.strikes = 0; player.eliminated = false; player.guesses = 0; player.sittingOut = false;
      }
      io.to(code).emit('returned-to-lobby', { party: serializeParty(party) });
    });

    socket.on('suggest-list', ({ listId }: { listId: string }) => {
      const playerId = getPlayerId(socket.id);
      if (!playerId) return;
      const code = playerParty.get(playerId);
      if (!code) return;
      const party = parties.get(code);
      if (!party || party.phase !== 'lobby' || party.hostId === playerId) return;
      if (!lists.find(c => c.id === listId)) return;

      party.suggestions.set(playerId, listId);
      io.to(code).emit('party-updated', { party: serializeParty(party), game: null });
    });

    socket.on('dismiss-suggestion', ({ playerId: targetId }: { playerId: string }) => {
      const playerId = getPlayerId(socket.id);
      if (!playerId) return;
      const code = playerParty.get(playerId);
      if (!code) return;
      const party = parties.get(code);
      if (!party) return;
      // Host can dismiss any suggestion; non-host can only retract their own
      if (party.hostId !== playerId && targetId !== playerId) return;

      party.suggestions.delete(targetId);
      io.to(code).emit('party-updated', { party: serializeParty(party), game: null });
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
