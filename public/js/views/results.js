export function initResults(state) {
  const btnPlayAgain = document.getElementById('btn-play-again');

  btnPlayAgain.addEventListener('click', () => {
    state.socket.emit('game:playAgain');
  });
}

export function showResults(state, data) {
  // Word reveal
  const revealContainer = document.getElementById('word-reveal');
  revealContainer.innerHTML = '<h4>Hidden Words:</h4>';
  for (const [playerId, info] of Object.entries(data.wordReveal)) {
    const div = document.createElement('div');
    div.className = 'reveal-entry';
    div.innerHTML = `<span>${info.playerName}</span><span style="color: var(--accent)">${info.word}</span>`;
    revealContainer.appendChild(div);
  }

  // Guess breakdown table
  const guessBreakdown = document.getElementById('guess-breakdown');
  guessBreakdown.innerHTML = `<h4>Self-Guesses:</h4>
    <table class="result-table">
      <thead><tr><th>Player</th><th>Guess</th><th>Word</th><th></th></tr></thead>
      <tbody>${data.guessResults.map(r => `
        <tr class="${r.correct ? 'correct' : 'incorrect'}">
          <td>${r.playerName}</td>
          <td>${r.guessed || '(none)'}</td>
          <td>${r.actual}</td>
          <td>${r.correct ? '\u2713' : '\u2717'}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;

  // Match breakdown table
  const matchBreakdown = document.getElementById('match-breakdown');
  if (data.matchResults && data.matchResults.length > 0) {
    matchBreakdown.innerHTML = `<h4>Match Results:</h4>
      <table class="result-table">
        <thead><tr><th>Matcher</th><th>Target</th><th>Guessed</th><th>Actual</th><th></th></tr></thead>
        <tbody>${data.matchResults.map(r => {
          const matcher = state.players.find(p => p.id === r.matcherId);
          const target = state.players.find(p => p.id === r.targetPlayerId);
          return `<tr class="${r.correct ? 'correct' : 'incorrect'}">
            <td>${matcher?.name || '?'}</td>
            <td>${target?.name || '?'}</td>
            <td>${r.guessedWord}</td>
            <td>${r.actualWord}</td>
            <td>${r.correct ? '\u2713' : '\u2717'}</td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>`;
  } else {
    matchBreakdown.innerHTML = '';
  }

  // Scoreboard
  const tbody = document.querySelector('#scoreboard tbody');
  tbody.innerHTML = '';
  data.finalScores.forEach(s => {
    const tr = document.createElement('tr');
    const timeStr = (s.totalTime / 1000).toFixed(1) + 's';
    tr.innerHTML = `
      <td>${s.playerName}</td>
      <td>${s.roundSelfGuess > 0 ? '+' + s.roundSelfGuess : s.roundSelfGuess}</td>
      <td>${s.roundMatchPoints > 0 ? '+' + s.roundMatchPoints : s.roundMatchPoints}</td>
      <td>${s.roundPenalties}</td>
      <td>${s.roundSelfGuess + s.roundMatchPoints + s.roundPenalties}</td>
      <td><strong>${s.total}</strong></td>
      <td>${timeStr}</td>
    `;
    tbody.appendChild(tr);
  });

  // Only host sees play again button
  document.getElementById('btn-play-again').style.display = state.isHost ? 'inline-block' : 'none';
}
