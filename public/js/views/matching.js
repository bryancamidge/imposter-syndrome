import { renderSubmissionStatus, startTimer, stopTimer } from '../ui-utils.js';

let matchSelections = {};

export function initMatching(state) {
  const btnSubmit = document.getElementById('btn-submit-match');

  btnSubmit.addEventListener('click', () => {
    state.socket.emit('match:submit', { matches: matchSelections });
    btnSubmit.disabled = true;
    disableSelects();
  });
}

export function showMatchingPhase(state, data) {
  matchSelections = {};

  // Group revealed clues by target word (preserves clue-phase order),
  // then sub-group by giver name within each word
  const cluesByWord = new Map();
  data.revealedClues.forEach(entry => {
    if (!cluesByWord.has(entry.targetWord)) {
      cluesByWord.set(entry.targetWord, new Map());
    }
    const givers = cluesByWord.get(entry.targetWord);
    if (!givers.has(entry.playerName)) {
      givers.set(entry.playerName, []);
    }
    givers.get(entry.playerName).push(entry.clue);
  });

  // Render: for each hidden word, a section with giver columns side by side
  const cluesContainer = document.getElementById('revealed-clues');
  cluesContainer.innerHTML = '';

  for (const [word, givers] of cluesByWord) {
    const section = document.createElement('div');
    section.className = 'clue-word-section';

    const wordHeader = document.createElement('div');
    wordHeader.className = 'clue-word-header';
    wordHeader.textContent = word;
    section.appendChild(wordHeader);

    const row = document.createElement('div');
    row.className = 'clue-givers-row';

    for (const [giverName, clues] of givers) {
      const column = document.createElement('div');
      column.className = 'clue-column';

      const header = document.createElement('div');
      header.className = 'clue-column-header';
      header.textContent = giverName;
      column.appendChild(header);

      clues.forEach(clue => {
        const div = document.createElement('div');
        div.className = 'clue-entry';
        div.textContent = clue;
        column.appendChild(div);
      });

      row.appendChild(column);
    }

    section.appendChild(row);
    cluesContainer.appendChild(section);
  }

  // Build match grid: for each other player, pick their word
  const grid = document.getElementById('match-grid');
  grid.innerHTML = '';

  const otherPlayers = data.players.filter(p => p.id !== state.playerId);

  otherPlayers.forEach(player => {
    const row = document.createElement('div');
    row.className = 'match-row';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'player-name';
    nameSpan.textContent = player.name;

    const select = document.createElement('select');
    select.dataset.playerId = player.id;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- pick word --';
    select.appendChild(defaultOption);

    data.hiddenWords.forEach(word => {
      const option = document.createElement('option');
      option.value = word;
      option.textContent = word;
      select.appendChild(option);
    });

    select.addEventListener('change', () => {
      matchSelections[player.id] = select.value;
      updateSubmitButton(otherPlayers.length);
    });

    row.appendChild(nameSpan);
    row.appendChild(select);
    grid.appendChild(row);
  });

  document.getElementById('btn-submit-match').disabled = true;

  state.matchSubmitted = new Set();
  renderSubmissionStatus('match-submissions', state.players, state.matchSubmitted);
}

function updateSubmitButton(expectedCount) {
  const filledCount = Object.values(matchSelections).filter(v => v).length;
  document.getElementById('btn-submit-match').disabled = filledCount < expectedCount;
}

function disableSelects() {
  document.querySelectorAll('#match-grid select').forEach(s => s.disabled = true);
}

export function showMatchSubmitted(state, playerId) {
  state.matchSubmitted.add(playerId);
  renderSubmissionStatus('match-submissions', state.players, state.matchSubmitted);
}
