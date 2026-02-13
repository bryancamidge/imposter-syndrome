import { renderPlayerList } from '../ui-utils.js';

export function initLobby(state) {
  const btnStart = document.getElementById('btn-start');
  const btnCopy = document.getElementById('btn-copy-code');
  const settingsPanel = document.getElementById('lobby-settings');

  // Copy room code
  btnCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(state.roomCode).then(() => {
      btnCopy.textContent = 'Copied!';
      setTimeout(() => btnCopy.textContent = 'Copy Code', 1500);
    });
  });

  // Start game
  btnStart.addEventListener('click', () => {
    state.socket.emit('game:start');
  });

  // Settings changes (host only)
  const settingInputs = {
    'setting-theme': 'theme',
    'setting-clue-list': 'clueList',
    'setting-hand-size': 'handSize',
    'setting-clue-rounds': 'clueRounds',
    'setting-decoy-count': 'decoyCount',
    'setting-points-self': 'pointsSelfGuess',
    'setting-points-match': 'pointsMatch',
    'setting-penalty': 'penaltyMisidentified',
    'setting-clue-timer': 'clueTimer',
    'setting-guess-timer': 'guessTimer',
    'setting-match-timer': 'matchTimer',
  };

  for (const [elementId, settingKey] of Object.entries(settingInputs)) {
    const el = document.getElementById(elementId);
    el.addEventListener('change', () => {
      if (!state.isHost) return;
      const value = el.type === 'number' ? parseInt(el.value) : el.value;
      state.socket.emit('game:configure', { [settingKey]: value });
    });
  }
}

export function updateLobby(state) {
  const btnStart = document.getElementById('btn-start');
  const playerCount = document.getElementById('player-count');
  const lobbyStatus = document.getElementById('lobby-status');
  const settingsPanel = document.getElementById('lobby-settings');

  document.getElementById('room-code-display').textContent = state.roomCode;
  renderPlayerList('player-list', state.players, state.hostId);
  playerCount.textContent = `(${state.players.length})`;

  // Host controls
  const isHost = state.isHost;
  btnStart.style.display = isHost ? 'block' : 'none';
  btnStart.disabled = state.players.length < 3;

  // Settings: only host can edit
  settingsPanel.querySelectorAll('input, select').forEach(el => {
    el.disabled = !isHost;
  });

  if (state.players.length < 3) {
    lobbyStatus.textContent = `Need at least 3 players to start (${state.players.length}/3)`;
  } else {
    lobbyStatus.textContent = isHost ? 'Ready to start!' : 'Waiting for host to start...';
  }
}

export function populateThemes(themes) {
  const select = document.getElementById('setting-theme');
  select.innerHTML = '';
  for (const theme of themes) {
    const opt = document.createElement('option');
    opt.value = theme;
    opt.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    select.appendChild(opt);
  }
}

export function updateSettings(settings) {
  document.getElementById('setting-theme').value = settings.theme || 'animals';
  document.getElementById('setting-clue-list').value = settings.clueList || 'general';
  document.getElementById('setting-hand-size').value = settings.handSize || 5;
  document.getElementById('setting-clue-rounds').value = settings.clueRounds || 1;
  document.getElementById('setting-decoy-count').value = settings.decoyCount || 3;
  document.getElementById('setting-points-self').value = settings.pointsSelfGuess || 3;
  document.getElementById('setting-points-match').value = settings.pointsMatch || 1;
  document.getElementById('setting-penalty').value = settings.penaltyMisidentified || -1;
  document.getElementById('setting-clue-timer').value = settings.clueTimer ?? 60;
  document.getElementById('setting-guess-timer').value = settings.guessTimer ?? 90;
  document.getElementById('setting-match-timer').value = settings.matchTimer ?? 120;
}
