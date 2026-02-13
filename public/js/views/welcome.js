export function initWelcome(state) {
  const btnCreate = document.getElementById('btn-create');
  const btnJoin = document.getElementById('btn-join');
  const nameInput = document.getElementById('player-name');
  const codeInput = document.getElementById('room-code-input');
  const errorMsg = document.getElementById('error-msg');

  function clearError() {
    errorMsg.textContent = '';
  }

  btnCreate.addEventListener('click', () => {
    clearError();
    const name = nameInput.value.trim();
    if (!name) {
      errorMsg.textContent = 'Please enter your name';
      return;
    }
    state.socket.emit('room:create', { playerName: name });
  });

  btnJoin.addEventListener('click', () => {
    clearError();
    const name = nameInput.value.trim();
    const code = codeInput.value.trim().toUpperCase();
    if (!name) {
      errorMsg.textContent = 'Please enter your name';
      return;
    }
    if (code.length !== 4) {
      errorMsg.textContent = 'Room code must be 4 letters';
      return;
    }
    state.socket.emit('room:join', { roomCode: code, playerName: name });
  });

  // Enter key support
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnCreate.click();
  });
  codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnJoin.click();
  });
}
