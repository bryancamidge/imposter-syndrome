import { initWelcome } from './views/welcome.js';
import { initLobby } from './views/lobby.js';
import { initClue } from './views/clue.js';
import { initGuessing } from './views/guessing.js';
import { initMatching } from './views/matching.js';
import { initResults } from './views/results.js';
import { registerSocketHandlers } from './socket-handlers.js';

const socket = io();

const state = {
  socket,
  playerId: null,
  roomCode: null,
  isHost: false,
  hostId: null,
  players: [],
  // Phase-specific
  clueSubmitted: new Set(),
  guessSubmitted: new Set(),
  matchSubmitted: new Set(),
};

initWelcome(state);
initLobby(state);
initClue(state);
initGuessing(state);
initMatching(state);
initResults(state);
registerSocketHandlers(state);
