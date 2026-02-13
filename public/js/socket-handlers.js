import { showView, startTimer, stopTimer } from './ui-utils.js';
import { updateLobby, updateSettings } from './views/lobby.js';
import { showClueRound, showClueCard } from './views/clue.js';
import { showGuessingPhase, showGuessSubmitted } from './views/guessing.js';
import { showMatchingPhase, showMatchSubmitted } from './views/matching.js';
import { showResults } from './views/results.js';

export function registerSocketHandlers(state) {
  const { socket } = state;

  // Room events
  socket.on('room:joined', (data) => {
    state.playerId = data.playerId;
    state.roomCode = data.roomCode;
    state.players = data.players;
    state.hostId = data.hostId;
    state.isHost = data.playerId === data.hostId;
    if (data.settings) updateSettings(data.settings);
    updateLobby(state);
    showView('view-lobby');
  });

  socket.on('room:playerJoined', ({ player }) => {
    state.players.push(player);
    updateLobby(state);
  });

  socket.on('room:playerLeft', ({ playerId, newHostId }) => {
    state.players = state.players.filter(p => p.id !== playerId);
    if (newHostId) {
      state.hostId = newHostId;
      state.isHost = state.playerId === newHostId;
    }
    updateLobby(state);
  });

  socket.on('room:error', ({ message }) => {
    const errorEl = document.getElementById('error-msg');
    if (errorEl) errorEl.textContent = message;
  });

  socket.on('game:configured', ({ settings }) => {
    updateSettings(settings);
  });

  // Game start
  socket.on('game:started', () => {
    showView('view-clue');
  });

  // Clue phase
  socket.on('clue:roundStart', (data) => {
    stopTimer();
    showClueRound(state, data);
    showView('view-clue');
    if (data.timer > 0) startTimer('clue-timer', data.timer);
  });

  socket.on('clue:submitted', ({ clue, count, total }) => {
    showClueCard(clue, count, total);
  });

  // Guessing phase
  socket.on('guess:start', (data) => {
    showGuessingPhase(state, data);
    showView('view-guessing');
    if (data.timer > 0) startTimer('guess-timer', data.timer);
  });

  socket.on('guess:playerSubmitted', ({ playerId }) => {
    showGuessSubmitted(state, playerId);
  });

  // Matching phase
  socket.on('match:start', (data) => {
    showMatchingPhase(state, data);
    showView('view-matching');
    if (data.timer > 0) startTimer('match-timer', data.timer);
  });

  socket.on('match:playerSubmitted', ({ playerId }) => {
    showMatchSubmitted(state, playerId);
  });

  // Results
  socket.on('game:results', (data) => {
    stopTimer();
    showResults(state, data);
    showView('view-results');
  });

  // Back to lobby
  socket.on('phase:lobby', (data) => {
    state.players = data.players;
    if (data.settings) updateSettings(data.settings);
    updateLobby(state);
    showView('view-lobby');
  });

  // Timer sync (server broadcasts this for its own tracking; client timers started per-phase above)
}
