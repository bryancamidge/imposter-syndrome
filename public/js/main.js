import { initWelcome } from './views/welcome.js';
import { initLobby } from './views/lobby.js';
import { initClue } from './views/clue.js';
import { initGuessing } from './views/guessing.js';
import { initMatching } from './views/matching.js';
import { initResults } from './views/results.js';
import { registerSocketHandlers } from './socket-handlers.js';
import { showView } from './ui-utils.js';

const socket = io({
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

const state = {
  socket,
  playerId: null,
  playerName: null,
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
initQuitButton(state);

function initQuitButton(state) {
  const quitBtn = document.getElementById('btn-quit');
  const modal = document.getElementById('quit-modal');
  const modalButtons = document.getElementById('quit-modal-buttons');

  function closeModal() { modal.classList.add('hidden'); }

  quitBtn.addEventListener('click', () => {
    modalButtons.innerHTML = '';

    const activeView = document.querySelector('.view.active')?.id;
    const inGamePhase = ['view-clue', 'view-guessing', 'view-matching'].includes(activeView);

    // Abort Game — host only, mid-game only
    if (state.isHost && inGamePhase) {
      const abortBtn = document.createElement('button');
      abortBtn.className = 'btn btn-secondary';
      abortBtn.textContent = 'Abort Game';
      abortBtn.addEventListener('click', () => {
        state.socket.emit('game:abort');
        closeModal();
      });
      modalButtons.appendChild(abortBtn);
    }

    // Leave Room — always available
    const leaveBtn = document.createElement('button');
    leaveBtn.className = 'btn btn-primary';
    leaveBtn.textContent = 'Leave Room';
    leaveBtn.addEventListener('click', () => {
      state.socket.emit('room:leave');
      sessionStorage.removeItem('rejoin');
      state.roomCode = null;
      state.playerName = null;
      state.playerId = null;
      state.isHost = false;
      closeModal();
      showView('view-welcome');
    });
    modalButtons.appendChild(leaveBtn);

    // Cancel
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-small';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', closeModal);
    modalButtons.appendChild(cancelBtn);

    modal.classList.remove('hidden');
  });

  // Click backdrop to dismiss
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

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
