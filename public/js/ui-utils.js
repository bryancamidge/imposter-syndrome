export function showView(viewId) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  const quitBtn = document.getElementById('btn-quit');
  if (quitBtn) quitBtn.classList.toggle('hidden', viewId === 'view-welcome');
}

export function renderPlayerList(containerId, players, hostId) {
  const ul = document.getElementById(containerId);
  ul.innerHTML = '';
  players.forEach(p => {
    const li = document.createElement('li');
    const nameSpan = document.createElement('span');
    nameSpan.textContent = p.name;
    li.appendChild(nameSpan);
    if (p.id === hostId || p.isHost) {
      const badge = document.createElement('span');
      badge.className = 'host-badge';
      badge.textContent = 'HOST';
      li.appendChild(badge);
    }
    li.dataset.playerId = p.id;
    ul.appendChild(li);
  });
}

export function renderSubmissionStatus(containerId, players, submittedIds) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  players.forEach(p => {
    const span = document.createElement('span');
    span.className = 'player-status' + (submittedIds.has(p.id) ? ' submitted' : '');
    span.textContent = p.name;
    container.appendChild(span);
  });
}

let timerInterval = null;

export function startTimer(elementId, seconds) {
  stopTimer();
  const el = document.getElementById(elementId);
  let remaining = seconds;
  el.textContent = formatTime(remaining);
  el.classList.remove('urgent');

  timerInterval = setInterval(() => {
    remaining--;
    if (remaining <= 10) el.classList.add('urgent');
    if (remaining <= 0) {
      el.textContent = '0:00';
      stopTimer();
      return;
    }
    el.textContent = formatTime(remaining);
  }, 1000);
}

export function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
