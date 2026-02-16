import { showView, startTimer, stopTimer } from './ui-utils.js';
import { updateLobby, updateSettings, populateThemes } from './views/lobby.js';
import { showClueRound, showClueCard } from './views/clue.js';
import { showGuessingPhase, showGuessSubmitted } from './views/guessing.js';
import { showMatchingPhase, showMatchSubmitted } from './views/matching.js';
import { showResults } from './views/results.js';

export function registerSocketHandlers(state) {
  const { socket } = state;
  const banner = document.getElementById('connection-banner');
  const bannerMsg = document.getElementById('connection-msg');

  // Connection lifecycle
  socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
    if (state.roomCode) {
      banner.classList.remove('hidden', 'error');
      bannerMsg.textContent = 'Connection lost — reconnecting...';
    }
  });

  socket.on('connect', () => {
    // Restore session from storage (survives page refresh)
    if (!state.roomCode) {
      try {
        const saved = JSON.parse(sessionStorage.getItem('rejoin'));
        if (saved) {
          state.roomCode = saved.roomCode;
          state.playerName = saved.playerName;
        }
      } catch (e) { /* ignore parse errors */ }
    }
    // If we were in a room, attempt to rejoin
    if (state.roomCode && state.playerName) {
      bannerMsg.textContent = 'Reconnecting to room...';
      socket.emit('room:rejoin', {
        roomCode: state.roomCode,
        playerName: state.playerName,
      });
    }
  });

  socket.on('connect_error', (err) => {
    console.error('Connection error:', err.message);
    if (state.roomCode) {
      banner.classList.remove('hidden');
      banner.classList.add('error');
      bannerMsg.textContent = 'Connection error — retrying...';
    }
  });

  // Room events
  socket.on('room:joined', (data) => {
    banner.classList.add('hidden');
    state.playerId = data.playerId;
    state.roomCode = data.roomCode;
    state.players = data.players;
    state.hostId = data.hostId;
    state.isHost = data.playerId === data.hostId;
    // Store name from the player list for reconnection
    const me = data.players.find(p => p.id === data.playerId);
    if (me) state.playerName = me.name;
    sessionStorage.setItem('rejoin', JSON.stringify({ roomCode: state.roomCode, playerName: state.playerName }));
    if (data.themes) populateThemes(data.themes);
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

  socket.on('room:playerReconnected', ({ oldPlayerId, playerId, playerName }) => {
    // Update the player's ID in our local list (socket ID changed on reconnect)
    const existing = state.players.find(p => p.id === oldPlayerId);
    if (existing) {
      existing.id = playerId;
    } else if (!state.players.find(p => p.id === playerId)) {
      state.players.push({ id: playerId, name: playerName, isHost: false });
    }
    updateLobby(state);
  });

  socket.on('room:error', ({ message }) => {
    banner.classList.add('hidden');
    // If reconnect failed, reset to welcome
    if (message === 'Room not found' || message === 'No disconnected player found with that name') {
      state.roomCode = null;
      state.playerName = null;
      state.playerId = null;
      sessionStorage.removeItem('rejoin');
      showView('view-welcome');
    }
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
