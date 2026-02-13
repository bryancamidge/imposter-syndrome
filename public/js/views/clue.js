import { startTimer, stopTimer } from '../ui-utils.js';

let selectedCardIndex = null;
let currentHand = [];

export function initClue(state) {
  const btnSubmit = document.getElementById('btn-submit-clue');

  btnSubmit.addEventListener('click', () => {
    if (selectedCardIndex === null) return;
    const clue = currentHand[selectedCardIndex];
    state.socket.emit('clue:select', { cardIndex: selectedCardIndex, clue });
    btnSubmit.disabled = true;
    disableHand();
  });
}

export function showClueRound(state, data) {
  selectedCardIndex = null;
  currentHand = data.hand;

  const progress = document.getElementById('clue-progress');
  progress.textContent = `Round ${data.roundNum}/${data.totalRounds} — Word ${data.wordSlot + 1}/${data.totalSlots}`;

  const wordDisplay = document.getElementById('word-display');
  if (data.isYourWord) {
    wordDisplay.textContent = '????';
    wordDisplay.className = 'word-display your-word';
  } else {
    wordDisplay.textContent = data.word;
    wordDisplay.className = 'word-display hidden-word';
  }

  const instruction = document.getElementById('clue-instruction');
  instruction.textContent = data.isYourWord
    ? "This is YOUR word — you can't see it! Pick a card anyway to blend in."
    : 'Pick a card from your hand as a clue for this word.';

  // Render hand
  const handContainer = document.getElementById('hand-container');
  handContainer.innerHTML = '';
  data.hand.forEach((word, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = word;
    card.addEventListener('click', () => selectCard(i));
    handContainer.appendChild(card);
  });

  // Reset submit button
  document.getElementById('btn-submit-clue').disabled = true;

  // Reset clue counter
  document.getElementById('clue-counter').textContent = '';

  // Clear previous clue cards
  document.getElementById('clue-results').innerHTML = '';
}

function selectCard(index) {
  selectedCardIndex = index;
  const cards = document.querySelectorAll('#hand-container .card');
  cards.forEach((card, i) => {
    card.classList.toggle('selected', i === index);
  });
  document.getElementById('btn-submit-clue').disabled = false;
}

function disableHand() {
  document.querySelectorAll('#hand-container .card').forEach(card => {
    card.classList.add('disabled');
  });
}

export function showClueCard(clue, count, total) {
  // Show the clue card anonymously
  const container = document.getElementById('clue-results');
  const span = document.createElement('span');
  span.className = 'clue-card';
  span.textContent = clue;
  container.appendChild(span);

  // Update counter
  document.getElementById('clue-counter').textContent = `${count}/${total} clues submitted`;
}
