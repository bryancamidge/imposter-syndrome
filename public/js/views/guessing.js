import { renderSubmissionStatus, startTimer, stopTimer } from '../ui-utils.js';

let selectedWord = null;

export function initGuessing(state) {
  const btnSubmit = document.getElementById('btn-submit-guess');

  btnSubmit.addEventListener('click', () => {
    if (!selectedWord) return;
    state.socket.emit('guess:submit', { word: selectedWord });
    btnSubmit.disabled = true;
    disableOptions();
  });
}

export function showGuessingPhase(state, data) {
  selectedWord = null;

  // Display clues given about your word
  const cluesContainer = document.getElementById('your-clues');
  cluesContainer.innerHTML = '<h4>Clues about your word:</h4>';
  const clueList = document.createElement('div');
  clueList.className = 'clue-list';
  data.cluesForYou.forEach((roundClues, i) => {
    roundClues.forEach(clue => {
      const span = document.createElement('span');
      span.className = 'clue-card';
      span.textContent = clue;
      clueList.appendChild(span);
    });
  });
  cluesContainer.appendChild(clueList);

  // Display word options
  const optionsContainer = document.getElementById('guess-options');
  optionsContainer.innerHTML = '';
  data.options.forEach(word => {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = word;
    card.addEventListener('click', () => selectGuess(word));
    optionsContainer.appendChild(card);
  });

  document.getElementById('btn-submit-guess').disabled = true;

  state.guessSubmitted = new Set();
  renderSubmissionStatus('guess-submissions', state.players, state.guessSubmitted);
}

function selectGuess(word) {
  selectedWord = word;
  document.querySelectorAll('#guess-options .card').forEach(card => {
    card.classList.toggle('selected', card.textContent === word);
  });
  document.getElementById('btn-submit-guess').disabled = false;
}

function disableOptions() {
  document.querySelectorAll('#guess-options .card').forEach(card => {
    card.classList.add('disabled');
  });
}

export function showGuessSubmitted(state, playerId) {
  state.guessSubmitted.add(playerId);
  renderSubmissionStatus('guess-submissions', state.players, state.guessSubmitted);
}
