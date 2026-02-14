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

// Splash screen: animate 0%→100% over 3 seconds then hide
const splashEl = document.getElementById('splash');
const counterEl = document.getElementById('splash-counter');
const splashDuration = 3000;
const splashInterval = 30;
let splashElapsed = 0;
const splashTimer = setInterval(() => {
  splashElapsed += splashInterval;
  const pct = Math.min(100, Math.round((splashElapsed / splashDuration) * 100));
  counterEl.textContent = pct + '%';
  if (splashElapsed >= splashDuration) {
    clearInterval(splashTimer);
    splashEl.classList.add('hidden');
  }
}, splashInterval);
