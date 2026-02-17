import { renderSubmissionStatus, startTimer, stopTimer } from '../ui-utils.js';

let matchSelections = {};  // { word: playerId }
let expectedCount = 0;
let allowDuplicateMatches = false;

export function initMatching(state) {
  const btnSubmit = document.getElementById('btn-submit-match');

  btnSubmit.addEventListener('click', () => {
    state.socket.emit('match:submit', { matches: matchSelections });
    btnSubmit.disabled = true;
    document.querySelectorAll('.match-btn').forEach(b => b.classList.add('disabled'));
  });
}

export function showMatchingPhase(state, data) {
  matchSelections = {};
  allowDuplicateMatches = !!data.allowDuplicateMatches;

  // Build a set of other player IDs (valid match targets)
  const otherPlayers = data.players.filter(p => p.id !== state.playerId);
  const otherPlayerIds = new Set(otherPlayers.map(p => p.id));
  expectedCount = data.hiddenWords.length;

  // Build a lookup: playerName -> playerId from revealedClues
  const nameToId = {};
  data.revealedClues.forEach(entry => {
    nameToId[entry.playerName] = entry.playerId;
  });

  // Find the current player's own hidden word from revealed clues
  const ownWord = data.revealedClues.find(
    entry => entry.targetPlayerId === state.playerId
  )?.targetWord;

  // Group revealed clues by target word, then by giver name
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

  // Partition into own word and other words
  const ownWordEntries = [];
  const otherWordEntries = [];
  for (const [word, givers] of cluesByWord) {
    if (word === ownWord) {
      ownWordEntries.push([word, givers]);
    } else {
      otherWordEntries.push([word, givers]);
    }
  }

  // Render clue sections with clickable buttons for other players
  const cluesContainer = document.getElementById('revealed-clues');
  cluesContainer.innerHTML = '';

  // Show guess result banner
  const guessBanner = document.createElement('div');
  guessBanner.className = 'guess-result-banner ' + (data.guessCorrect ? 'correct' : 'incorrect');
  if (data.guessCorrect) {
    guessBanner.innerHTML = `You guessed <strong>${data.guessedWord}</strong> — Correct!`;
  } else {
    guessBanner.innerHTML = `You guessed <strong>${data.guessedWord || 'nothing'}</strong> — Wrong! Your word was <strong>${data.ownWord}</strong>`;
  }
  cluesContainer.appendChild(guessBanner);

  // Helper to render a word section
  const renderWordSection = (word, givers, isOwn) => {
    const section = document.createElement('div');
    section.className = 'clue-word-section' + (isOwn ? ' own-word-section' : '');

    const wordHeader = document.createElement('div');
    wordHeader.className = 'clue-word-header';
    wordHeader.textContent = isOwn ? `${word} (Your Word)` : word;
    section.appendChild(wordHeader);

    // Partition givers into own clues and others
    const ownGivers = [];
    const otherGivers = [];
    for (const [giverName, clues] of givers) {
      const giverId = nameToId[giverName];
      if (!otherPlayerIds.has(giverId)) {
        ownGivers.push([giverName, clues]);
      } else {
        otherGivers.push([giverName, clues]);
      }
    }

    // Helper to build a clue column element
    const buildColumn = (giverName, clues, isClickable, isSelf) => {
      const isInactiveUnderOwn = isOwn && !isSelf;
      const column = document.createElement(isClickable ? 'button' : 'div');
      column.className = 'clue-column'
        + (isClickable ? ' match-btn' : '')
        + (isSelf ? ' own-clue-column' : '')
        + (isInactiveUnderOwn ? ' own-word-inactive' : '');

      if (isClickable) {
        column.type = 'button';
        column.dataset.playerId = nameToId[giverName];
        column.dataset.word = word;
        column.addEventListener('click', () => handleMatchClick(nameToId[giverName], word));
      }

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

      return column;
    };

    // Sort other players alphabetically for consistent vertical alignment
    otherGivers.sort((a, b) => a[0].localeCompare(b[0]));

    // Render all in one row: own clue first (left), then others alphabetically
    const row = document.createElement('div');
    row.className = 'clue-givers-row';

    for (const [giverName, clues] of ownGivers) {
      row.appendChild(buildColumn(giverName, clues, false, true));
    }
    for (const [giverName, clues] of otherGivers) {
      const isClickable = !isOwn;
      row.appendChild(buildColumn(giverName, clues, isClickable, false));
    }

    section.appendChild(row);
    return section;
  };

  // Render own word first
  for (const [word, givers] of ownWordEntries) {
    cluesContainer.appendChild(renderWordSection(word, givers, true));
  }

  // Add separator if there are both own and other entries
  if (ownWordEntries.length > 0 && otherWordEntries.length > 0) {
    const separator = document.createElement('div');
    separator.className = 'match-section-divider';
    separator.textContent = 'Other Players';
    cluesContainer.appendChild(separator);
  }

  // Render other words
  for (const [word, givers] of otherWordEntries) {
    cluesContainer.appendChild(renderWordSection(word, givers, false));
  }

  document.getElementById('btn-submit-match').disabled = true;

  state.matchSubmitted = new Set();
  renderSubmissionStatus('match-submissions', state.players, state.matchSubmitted);
}

function handleMatchClick(playerId, word) {
  // If a different player was already selected for this word, clear that
  const prevPlayer = matchSelections[word];
  if (prevPlayer && prevPlayer !== playerId) {
    const oldBtn = document.querySelector(
      `.match-btn[data-player-id="${prevPlayer}"][data-word="${word}"]`
    );
    if (oldBtn) oldBtn.classList.remove('selected');
    delete matchSelections[word];
  }

  // If duplicates not allowed and this player is already assigned to a different word, clear that
  if (!allowDuplicateMatches) {
    for (const [w, pid] of Object.entries(matchSelections)) {
      if (pid === playerId && w !== word) {
        const oldBtn = document.querySelector(
          `.match-btn[data-player-id="${playerId}"][data-word="${w}"]`
        );
        if (oldBtn) oldBtn.classList.remove('selected');
        delete matchSelections[w];
        break;
      }
    }
  }

  // Toggle current selection
  const btn = document.querySelector(
    `.match-btn[data-player-id="${playerId}"][data-word="${word}"]`
  );
  if (matchSelections[word] === playerId) {
    // Deselect
    delete matchSelections[word];
    if (btn) btn.classList.remove('selected');
  } else {
    // Select
    matchSelections[word] = playerId;
    if (btn) btn.classList.add('selected');
  }

  updateSubmitButton();
}

function updateSubmitButton() {
  const filledCount = Object.keys(matchSelections).length;
  document.getElementById('btn-submit-match').disabled = filledCount < expectedCount;
}

export function showMatchSubmitted(state, playerId) {
  state.matchSubmitted.add(playerId);
  renderSubmissionStatus('match-submissions', state.players, state.matchSubmitted);
}
