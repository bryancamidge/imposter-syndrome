const PHASES = {
  LOBBY: 'lobby',
  CLUE: 'clue',
  GUESSING: 'guessing',
  MATCHING: 'matching',
  RESULTS: 'results',
};

const ALLOWED_TRANSITIONS = {
  [PHASES.LOBBY]: [PHASES.CLUE],
  [PHASES.CLUE]: [PHASES.GUESSING],
  [PHASES.GUESSING]: [PHASES.MATCHING],
  [PHASES.MATCHING]: [PHASES.RESULTS],
  [PHASES.RESULTS]: [PHASES.CLUE, PHASES.LOBBY],
};

class GameState {
  constructor() {
    this.phase = PHASES.LOBBY;
    this.round = 0; // current clue round (1-based)
    this.wordIndex = 0; // index into shuffled word order

    // Word assignments: playerId -> hidden word
    this.hiddenWords = new Map();
    // Shuffled order of player IDs for word display
    this.wordOrder = [];

    // Clue tracking: Map<wordSlotIndex, Map<round, Map<playerId, clue>>>
    this.clues = new Map();
    // Current round submissions: playerId -> clue
    this.currentClueSubmissions = new Map();

    // Guessing: playerId -> guessed word
    this.guesses = new Map();

    // Matching: playerId -> Map<targetPlayerId, guessedWord>
    this.matches = new Map();

    // Scores: playerId -> { total, selfGuess, matchPoints, penalties, totalTime }
    this.scores = new Map();

    // Timing
    this.phaseStartTime = null;
    this.playerSubmitTimes = new Map(); // playerId -> cumulative ms
  }

  get currentPhase() {
    return this.phase;
  }

  canTransitionTo(nextPhase) {
    return ALLOWED_TRANSITIONS[this.phase]?.includes(nextPhase) ?? false;
  }

  transitionTo(nextPhase) {
    if (!this.canTransitionTo(nextPhase)) {
      throw new Error(`Invalid transition: ${this.phase} -> ${nextPhase}`);
    }
    this.phase = nextPhase;
    this.phaseStartTime = Date.now();
  }

  initGame(players, hiddenWordMap, wordOrder) {
    this.hiddenWords = new Map(Object.entries(hiddenWordMap));
    this.wordOrder = wordOrder;
    this.round = 0;
    this.wordIndex = 0;
    this.clues.clear();
    this.guesses.clear();
    this.matches.clear();
    this.currentClueSubmissions.clear();
    this.playerSubmitTimes.clear();

    // Initialize score tracking for all players
    for (const p of players) {
      if (!this.scores.has(p.id)) {
        this.scores.set(p.id, { total: 0, selfGuess: 0, matchPoints: 0, penalties: 0, totalTime: 0 });
      }
      this.playerSubmitTimes.set(p.id, 0);
    }
  }

  startNextClueStep() {
    // Move to next word, or next round
    this.currentClueSubmissions.clear();
    this.phaseStartTime = Date.now();
  }

  advanceCluePhase(playerCount) {
    // Store current submissions
    const slotKey = `${this.round}-${this.wordIndex}`;
    this.clues.set(slotKey, new Map(this.currentClueSubmissions));

    this.wordIndex++;
    if (this.wordIndex >= this.wordOrder.length) {
      this.wordIndex = 0;
      this.round++;
    }
    this.currentClueSubmissions.clear();
    this.phaseStartTime = Date.now();
  }

  isCluePhaseComplete(totalRounds) {
    return this.round >= totalRounds;
  }

  submitClue(playerId, clue) {
    if (this.currentClueSubmissions.has(playerId)) return false;
    this.currentClueSubmissions.set(playerId, clue);
    this.recordSubmitTime(playerId);
    return true;
  }

  allCluesIn(playerCount) {
    return this.currentClueSubmissions.size >= playerCount;
  }

  submitGuess(playerId, word) {
    if (this.guesses.has(playerId)) return false;
    this.guesses.set(playerId, word);
    this.recordSubmitTime(playerId);
    return true;
  }

  allGuessesIn(playerCount) {
    return this.guesses.size >= playerCount;
  }

  submitMatch(playerId, matchMap) {
    if (this.matches.has(playerId)) return false;
    this.matches.set(playerId, matchMap);
    this.recordSubmitTime(playerId);
    return true;
  }

  allMatchesIn(playerCount) {
    return this.matches.size >= playerCount;
  }

  recordSubmitTime(playerId) {
    if (!this.phaseStartTime) return;
    const elapsed = Date.now() - this.phaseStartTime;
    const current = this.playerSubmitTimes.get(playerId) || 0;
    this.playerSubmitTimes.set(playerId, current + elapsed);
  }

  getCluesForPlayer(playerId, totalRounds) {
    // Collect clues given about this player's word, separating blind clues
    const ownerIndex = this.wordOrder.indexOf(playerId);
    if (ownerIndex === -1) return { clues: [], blindClues: [] };

    const clues = [];
    const blindClues = [];
    for (let r = 0; r < totalRounds; r++) {
      const slotKey = `${r}-${ownerIndex}`;
      const submissions = this.clues.get(slotKey);
      if (submissions) {
        for (const [giverId, clue] of submissions) {
          if (giverId === playerId) {
            blindClues.push(clue);
          } else {
            clues.push(clue);
          }
        }
      }
    }
    return { clues, blindClues };
  }

  getAllCluesRevealed(players, totalRounds) {
    // Return all clues with player names attached (for matching phase)
    const revealed = [];
    for (let r = 0; r < totalRounds; r++) {
      for (let wi = 0; wi < this.wordOrder.length; wi++) {
        const slotKey = `${r}-${wi}`;
        const submissions = this.clues.get(slotKey);
        if (!submissions) continue;
        const targetPlayerId = this.wordOrder[wi];
        const targetWord = this.hiddenWords.get(targetPlayerId);
        for (const [playerId, clue] of submissions) {
          const player = players.find(p => p.id === playerId);
          revealed.push({
            playerId,
            playerName: player ? player.name : 'Unknown',
            clue,
            targetWord,
            targetPlayerId,
            round: r + 1,
          });
        }
      }
    }
    return revealed;
  }

  calculateResults(players, settings) {
    const results = {
      guessResults: [],
      matchResults: [],
      penalties: [],
      scoreChanges: new Map(),
      finalScores: [],
    };

    // Initialize score changes
    for (const p of players) {
      results.scoreChanges.set(p.id, { selfGuess: 0, matchPoints: 0, penalties: 0 });
    }

    // 1. Self-guess scoring
    for (const p of players) {
      const guessed = this.guesses.get(p.id);
      const actual = this.hiddenWords.get(p.id);
      const correct = guessed === actual;
      results.guessResults.push({
        playerId: p.id,
        playerName: p.name,
        guessed,
        actual,
        correct,
      });
      if (correct) {
        results.scoreChanges.get(p.id).selfGuess = settings.pointsSelfGuess;
      }
    }

    // 2. Match scoring + misidentification penalties
    // matchMap is keyed by word: { guessedWord: targetPlayerId }
    for (const [matcherId, matchMap] of this.matches) {
      for (const [guessedWord, targetPlayerId] of Object.entries(matchMap)) {
        const actualWord = this.hiddenWords.get(targetPlayerId);
        const correct = guessedWord === actualWord;
        results.matchResults.push({
          matcherId,
          targetPlayerId,
          guessedWord,
          actualWord,
          correct,
        });
        if (correct) {
          results.scoreChanges.get(matcherId).matchPoints += settings.pointsMatch;
        } else {
          // Penalty to the player who was misidentified
          // Find which player actually has the guessed word
          for (const [pid, word] of this.hiddenWords) {
            if (word === guessedWord && pid !== targetPlayerId) {
              results.scoreChanges.get(pid).penalties += settings.penaltyMisidentified;
              results.penalties.push({
                penalizedPlayerId: pid,
                matcherId,
                wrongWord: guessedWord,
                assignedToPlayerId: targetPlayerId,
              });
              break;
            }
          }
        }
      }
    }

    // Apply score changes
    for (const p of players) {
      const changes = results.scoreChanges.get(p.id);
      const score = this.scores.get(p.id);
      score.selfGuess += changes.selfGuess;
      score.matchPoints += changes.matchPoints;
      score.penalties += changes.penalties;
      score.total += changes.selfGuess + changes.matchPoints + changes.penalties;
      score.totalTime = this.playerSubmitTimes.get(p.id) || 0;
    }

    // Build final scores sorted by total desc, then time asc (tiebreaker)
    results.finalScores = players.map(p => {
      const score = this.scores.get(p.id);
      return {
        playerId: p.id,
        playerName: p.name,
        ...score,
        roundSelfGuess: results.scoreChanges.get(p.id).selfGuess,
        roundMatchPoints: results.scoreChanges.get(p.id).matchPoints,
        roundPenalties: results.scoreChanges.get(p.id).penalties,
      };
    }).sort((a, b) => b.total - a.total || a.totalTime - b.totalTime);

    return results;
  }

  resetForNewGame() {
    this.phase = PHASES.LOBBY;
    this.round = 0;
    this.wordIndex = 0;
    this.hiddenWords.clear();
    this.wordOrder = [];
    this.clues.clear();
    this.currentClueSubmissions.clear();
    this.guesses.clear();
    this.matches.clear();
    this.playerSubmitTimes.clear();
    // Keep scores for cumulative tracking
  }

  resetScores() {
    this.scores.clear();
  }
}

GameState.PHASES = PHASES;
module.exports = GameState;
