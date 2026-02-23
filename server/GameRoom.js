const PlayerManager = require('./PlayerManager');
const GameState = require('./GameState');
const WordBank = require('./WordBank');
const ClueDeck = require('./ClueDeck');
const {
  MIN_PLAYERS, MAX_PLAYERS,
  DEFAULT_HAND_SIZE, DEFAULT_CLUE_ROUNDS, DEFAULT_DECOY_COUNT,
  DEFAULT_POINTS_SELF_GUESS, DEFAULT_POINTS_MATCH, DEFAULT_PENALTY_MISIDENTIFIED,
  DEFAULT_ALLOW_DUPLICATE_MATCHES,
  DEFAULT_CLUE_TIMER, DEFAULT_GUESS_TIMER, DEFAULT_MATCH_TIMER,
  DISCONNECT_GRACE_SECONDS,
} = require('./constants');

class GameRoom {
  constructor(roomCode, io) {
    this.roomCode = roomCode;
    this.io = io;
    this.players = new PlayerManager();
    this.state = new GameState();
    this.wordBank = new WordBank();
    this.clueDeck = new ClueDeck();
    this.timerId = null;

    this.disconnectTimers = new Map(); // socketId -> timeout handle
    this.lastResultsPayload = null;   // cached results for reconnecting players

    this.settings = {
      handSize: DEFAULT_HAND_SIZE,
      clueRounds: DEFAULT_CLUE_ROUNDS,
      decoyCount: DEFAULT_DECOY_COUNT,
      pointsSelfGuess: DEFAULT_POINTS_SELF_GUESS,
      pointsMatch: DEFAULT_POINTS_MATCH,
      penaltyMisidentified: DEFAULT_PENALTY_MISIDENTIFIED,
      theme: 'animals',
      clueList: 'animals',
      allowDuplicateMatches: DEFAULT_ALLOW_DUPLICATE_MATCHES,
      clueTimer: DEFAULT_CLUE_TIMER,
      guessTimer: DEFAULT_GUESS_TIMER,
      matchTimer: DEFAULT_MATCH_TIMER,
    };
  }

  addPlayer(socket, name, isHost) {
    if (this.state.currentPhase !== GameState.PHASES.LOBBY) {
      // Allow rejoin if a disconnected player has this name
      const disconnected = this.players.findDisconnectedByName(name);
      if (disconnected) {
        this.reconnectPlayer(disconnected.id, socket);
        return;
      }
      socket.emit('room:error', { message: 'Game already in progress' });
      return;
    }
    if (this.players.count() >= MAX_PLAYERS) {
      socket.emit('room:error', { message: 'Room is full' });
      return;
    }
    if (this.players.hasName(name)) {
      socket.emit('room:error', { message: 'Name already taken' });
      return;
    }

    const player = this.players.add(socket.id, name, isHost);
    socket.join(this.roomCode);
    this._registerSocketEvents(socket);

    socket.emit('room:joined', {
      roomCode: this.roomCode,
      playerId: socket.id,
      players: this.players.toClientArray(),
      hostId: this.players.getHostId(),
      settings: this.settings,
      themes: this.wordBank.getThemes(),
    });

    socket.to(this.roomCode).emit('room:playerJoined', {
      player: { id: player.id, name: player.name, isHost: player.isHost },
    });
  }

  _registerSocketEvents(socket) {
    socket.on('game:configure', (data) => this._handleConfigure(socket.id, data));
    socket.on('game:start', () => this._handleStart(socket.id));
    socket.on('clue:select', (data) => this._handleClueSelect(socket.id, data));
    socket.on('guess:submit', (data) => this._handleGuessSubmit(socket.id, data));
    socket.on('match:submit', (data) => this._handleMatchSubmit(socket.id, data));
    socket.on('game:playAgain', () => this._handlePlayAgain(socket.id));
    socket.on('game:abort', () => this._handleAbort(socket.id));
  }

  _handleConfigure(socketId, data) {
    if (!this.players.isHost(socketId)) return;
    if (this.state.currentPhase !== GameState.PHASES.LOBBY) return;

    if (data.handSize != null) this.settings.handSize = Math.max(3, Math.min(15, parseInt(data.handSize)));
    if (data.clueRounds != null) this.settings.clueRounds = Math.max(1, Math.min(5, parseInt(data.clueRounds)));
    if (data.decoyCount != null) this.settings.decoyCount = Math.max(1, Math.min(10, parseInt(data.decoyCount)));
    if (data.pointsSelfGuess != null) this.settings.pointsSelfGuess = Math.max(0, Math.min(10, parseInt(data.pointsSelfGuess)));
    if (data.pointsMatch != null) this.settings.pointsMatch = Math.max(0, Math.min(10, parseInt(data.pointsMatch)));
    if (data.penaltyMisidentified != null) this.settings.penaltyMisidentified = Math.max(-10, Math.min(0, parseInt(data.penaltyMisidentified)));
    if (data.theme && this.wordBank.getThemes().includes(data.theme)) this.settings.theme = data.theme;
    if (data.clueList && ClueDeck.getLists().includes(data.clueList)) {
      this.settings.clueList = data.clueList;
      this.clueDeck.setList(data.clueList);
    }
    if (data.allowDuplicateMatches != null) this.settings.allowDuplicateMatches = !!data.allowDuplicateMatches;
    if (data.clueTimer != null) this.settings.clueTimer = Math.max(0, Math.min(300, parseInt(data.clueTimer)));
    if (data.guessTimer != null) this.settings.guessTimer = Math.max(0, Math.min(300, parseInt(data.guessTimer)));
    if (data.matchTimer != null) this.settings.matchTimer = Math.max(0, Math.min(300, parseInt(data.matchTimer)));

    this.io.to(this.roomCode).emit('game:configured', { settings: this.settings });
  }

  _handleStart(socketId) {
    if (!this.players.isHost(socketId)) return;
    if (this.state.currentPhase !== GameState.PHASES.LOBBY) return;
    if (this.players.count() < MIN_PLAYERS) return;

    const activePlayers = this.players.getAll();
    const playerCount = activePlayers.length;

    // Pick hidden words: one per player + decoys
    const totalWords = playerCount + this.settings.decoyCount;
    const words = this.wordBank.pickWords(this.settings.theme, totalWords);

    // Assign hidden words to players
    const hiddenWordMap = {};
    activePlayers.forEach((p, i) => {
      hiddenWordMap[p.id] = words[i];
    });

    // Decoy words for guessing phase
    this.decoyWords = words.slice(playerCount);

    // Shuffle word order (randomized, not player-join order)
    const wordOrder = activePlayers.map(p => p.id).sort(() => Math.random() - 0.5);

    this.state.initGame(activePlayers, hiddenWordMap, wordOrder);
    this.state.transitionTo(GameState.PHASES.CLUE);
    this.state.round = 0;
    this.state.wordIndex = 0;

    this.io.to(this.roomCode).emit('game:started', { phase: 'clue' });

    this._startClueStep();
  }

  _startClueStep() {
    this.state.startNextClueStep();
    this.clueDeck.startStep();

    const targetPlayerId = this.state.wordOrder[this.state.wordIndex];
    const targetWord = this.state.hiddenWords.get(targetPlayerId);
    const activePlayers = this.players.getAll();

    // Send each player their hand and the word (or null if it's their word)
    for (const p of activePlayers) {
      const hand = this.clueDeck.draw(this.settings.handSize);
      const isOwner = p.id === targetPlayerId;

      this.io.to(p.id).emit('clue:roundStart', {
        wordSlot: this.state.wordIndex,
        totalSlots: this.state.wordOrder.length,
        roundNum: this.state.round + 1,
        totalRounds: this.settings.clueRounds,
        word: isOwner ? null : targetWord,
        hand,
        isYourWord: isOwner,
        timer: this.settings.clueTimer,
      });
    }

    if (this.settings.clueTimer > 0) {
      this._startTimer(this.settings.clueTimer, () => {
        this._finishClueStep();
      });
    }
  }

  _handleClueSelect(socketId, { cardIndex, clue }) {
    if (this.state.currentPhase !== GameState.PHASES.CLUE) return;

    const submitted = this.state.submitClue(socketId, clue);
    if (!submitted) return;

    this.clueDeck.markPlayed(clue);

    // Broadcast the clue anonymously (no player info)
    this.io.to(this.roomCode).emit('clue:submitted', {
      clue,
      count: this.state.currentClueSubmissions.size,
      total: this.players.count(),
    });

    if (this.state.allCluesIn(this.players.count())) {
      this._clearTimer();
      this._finishClueStep();
    }
  }

  _finishClueStep() {

    // Advance to next word/round
    this.state.advanceCluePhase(this.players.count());

    if (this.state.isCluePhaseComplete(this.settings.clueRounds)) {
      // Short delay to let players see the last clues, then move to guessing
      setTimeout(() => this._startGuessingPhase(), 3000);
    } else {
      // Short delay then start next clue step
      setTimeout(() => this._startClueStep(), 3000);
    }
  }

  _startGuessingPhase() {
    this.state.transitionTo(GameState.PHASES.GUESSING);
    const activePlayers = this.players.getAll();

    for (const p of activePlayers) {
      const { clues, blindClues } = this.state.getCluesForPlayer(p.id, this.settings.clueRounds);
      const actualWord = this.state.hiddenWords.get(p.id);

      // Build options: actual word + decoys, shuffled
      const options = [actualWord, ...this.decoyWords].sort(() => Math.random() - 0.5);

      this.io.to(p.id).emit('guess:start', {
        options,
        cluesForYou: clues,
        blindClues,
        timer: this.settings.guessTimer,
      });
    }

    if (this.settings.guessTimer > 0) {
      this._startTimer(this.settings.guessTimer, () => {
        this._finishGuessingPhase();
      });
    }
  }

  _handleGuessSubmit(socketId, { word }) {
    if (this.state.currentPhase !== GameState.PHASES.GUESSING) return;

    const submitted = this.state.submitGuess(socketId, word);
    if (!submitted) return;

    this.io.to(this.roomCode).emit('guess:playerSubmitted', { playerId: socketId });

    if (this.state.allGuessesIn(this.players.count())) {
      this._clearTimer();
      this._finishGuessingPhase();
    }
  }

  _finishGuessingPhase() {
    this._startMatchingPhase();
  }

  _startMatchingPhase() {
    this.state.transitionTo(GameState.PHASES.MATCHING);
    const activePlayers = this.players.getAll();
    const revealedClues = this.state.getAllCluesRevealed(activePlayers, this.settings.clueRounds);
    const playerList = activePlayers.map(p => ({ id: p.id, name: p.name }));
    const allHiddenWords = Array.from(this.state.hiddenWords.entries());

    // Send each player a personalized word list excluding their own hidden word
    for (const p of activePlayers) {
      const ownWord = this.state.hiddenWords.get(p.id);
      const otherWords = allHiddenWords
        .filter(([pid]) => pid !== p.id)
        .map(([, word]) => word)
        .sort(() => Math.random() - 0.5);

      const guessedWord = this.state.guesses.get(p.id);
      const guessCorrect = guessedWord === ownWord;

      this.io.to(p.id).emit('match:start', {
        hiddenWords: otherWords,
        players: playerList,
        revealedClues,
        allowDuplicateMatches: this.settings.allowDuplicateMatches,
        timer: this.settings.matchTimer,
        guessedWord,
        guessCorrect,
        ownWord,
      });
    }

    if (this.settings.matchTimer > 0) {
      this._startTimer(this.settings.matchTimer, () => {
        this._finishMatchingPhase();
      });
    }
  }

  _handleMatchSubmit(socketId, { matches }) {
    if (this.state.currentPhase !== GameState.PHASES.MATCHING) return;

    const submitted = this.state.submitMatch(socketId, matches);
    if (!submitted) return;

    this.io.to(this.roomCode).emit('match:playerSubmitted', { playerId: socketId });

    if (this.state.allMatchesIn(this.players.count())) {
      this._clearTimer();
      this._finishMatchingPhase();
    }
  }

  _finishMatchingPhase() {
    this.state.transitionTo(GameState.PHASES.RESULTS);
    const activePlayers = this.players.getAll();
    const results = this.state.calculateResults(activePlayers, this.settings);

    // Build hidden word reveal
    const wordReveal = {};
    for (const [playerId, word] of this.state.hiddenWords) {
      const player = this.players.get(playerId);
      wordReveal[playerId] = { playerName: player ? player.name : 'Unknown', word };
    }

    this.lastResultsPayload = {
      ...results,
      wordReveal,
      scoreChanges: Object.fromEntries(results.scoreChanges),
      finalScores: results.finalScores,
    };

    this.io.to(this.roomCode).emit('game:results', this.lastResultsPayload);
  }

  _handlePlayAgain(socketId) {
    if (!this.players.isHost(socketId)) return;
    if (this.state.currentPhase !== GameState.PHASES.RESULTS) return;

    this.state.resetForNewGame();
    this.state.resetScores();
    this.wordBank.reset();
    this.clueDeck.resetRound();
    this.lastResultsPayload = null;

    this.io.to(this.roomCode).emit('phase:lobby', {
      players: this.players.toClientArray(),
      settings: this.settings,
    });
  }

  leavePlayer(socketId) {
    // Cancel any pending disconnect grace period
    const timer = this.disconnectTimers.get(socketId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(socketId);
    }

    const wasHost = this.players.isHost(socketId);
    this.players.remove(socketId);
    const newHostId = wasHost ? this.players.promoteNewHost() : null;

    this.io.to(this.roomCode).emit('room:playerLeft', {
      playerId: socketId,
      newHostId,
    });

    // If mid-game, check if remaining players have all submitted and can advance
    this._checkPhaseAdvance();
  }

  _checkPhaseAdvance() {
    const count = this.players.count();
    if (count === 0) return;
    const phase = this.state.currentPhase;
    if (phase === GameState.PHASES.CLUE && this.state.allCluesIn(count)) {
      this._clearTimer();
      this._finishClueStep();
    } else if (phase === GameState.PHASES.GUESSING && this.state.allGuessesIn(count)) {
      this._clearTimer();
      this._finishGuessingPhase();
    } else if (phase === GameState.PHASES.MATCHING && this.state.allMatchesIn(count)) {
      this._clearTimer();
      this._finishMatchingPhase();
    }
  }

  _handleAbort(socketId) {
    if (!this.players.isHost(socketId)) return;
    const phase = this.state.currentPhase;
    if (phase === GameState.PHASES.LOBBY || phase === GameState.PHASES.RESULTS) return;

    this._clearTimer();
    this.state.resetForNewGame();
    this.state.resetScores();
    this.wordBank.reset();
    this.clueDeck.resetRound();
    this.lastResultsPayload = null;

    this.io.to(this.roomCode).emit('phase:lobby', {
      players: this.players.toClientArray(),
      settings: this.settings,
    });
  }

  handleDisconnect(socketId) {
    this.players.markDisconnected(socketId);

    // Start grace period — only broadcast removal if they don't reconnect in time
    const timer = setTimeout(() => {
      this.disconnectTimers.delete(socketId);
      const wasHost = this.players.isHost(socketId);
      if (wasHost) {
        // Remove host flag before promoting
        const p = this.players.get(socketId);
        if (p) p.isHost = false;
      }
      const newHostId = wasHost ? this.players.promoteNewHost() : null;

      this.io.to(this.roomCode).emit('room:playerLeft', {
        playerId: socketId,
        newHostId,
      });
    }, DISCONNECT_GRACE_SECONDS * 1000);

    this.disconnectTimers.set(socketId, timer);
  }

  reconnectPlayer(oldSocketId, newSocket) {
    // Cancel grace period timer
    const timer = this.disconnectTimers.get(oldSocketId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(oldSocketId);
    }

    // Migrate player record to new socket ID
    const player = this.players.updateSocketId(oldSocketId, newSocket.id);
    if (!player) return false;

    // Migrate game state references
    this.state.updatePlayerId(oldSocketId, newSocket.id);

    // Join room and register events
    newSocket.join(this.roomCode);
    this._registerSocketEvents(newSocket);

    // Send current game state based on phase
    this._sendReconnectState(newSocket, player);

    // Notify others that player reconnected with new socket ID
    newSocket.to(this.roomCode).emit('room:playerReconnected', {
      oldPlayerId: oldSocketId,
      playerId: newSocket.id,
      playerName: player.name,
    });

    return true;
  }

  _sendReconnectState(socket, player) {
    const phase = this.state.currentPhase;

    if (phase === GameState.PHASES.LOBBY) {
      socket.emit('room:joined', {
        roomCode: this.roomCode,
        playerId: socket.id,
        players: this.players.toClientArray(),
        hostId: this.players.getHostId(),
        settings: this.settings,
        themes: this.wordBank.getThemes(),
      });
      return;
    }

    // For all in-game phases, first confirm they're in a game
    socket.emit('room:joined', {
      roomCode: this.roomCode,
      playerId: socket.id,
      players: this.players.toClientArray(),
      hostId: this.players.getHostId(),
      settings: this.settings,
      themes: this.wordBank.getThemes(),
    });

    if (phase === GameState.PHASES.CLUE) {
      const targetPlayerId = this.state.wordOrder[this.state.wordIndex];
      const targetWord = this.state.hiddenWords.get(targetPlayerId);
      const isOwner = socket.id === targetPlayerId;
      const hand = this.clueDeck.draw(this.settings.handSize);

      socket.emit('clue:roundStart', {
        wordSlot: this.state.wordIndex,
        totalSlots: this.state.wordOrder.length,
        roundNum: this.state.round + 1,
        totalRounds: this.settings.clueRounds,
        word: isOwner ? null : targetWord,
        hand,
        isYourWord: isOwner,
        timer: 0, // Don't send timer — they're rejoining mid-step
      });
    } else if (phase === GameState.PHASES.GUESSING) {
      const { clues, blindClues } = this.state.getCluesForPlayer(socket.id, this.settings.clueRounds);
      const actualWord = this.state.hiddenWords.get(socket.id);
      const options = [actualWord, ...this.decoyWords].sort(() => Math.random() - 0.5);

      socket.emit('guess:start', {
        options,
        cluesForYou: clues,
        blindClues,
        timer: 0,
      });
    } else if (phase === GameState.PHASES.MATCHING) {
      const activePlayers = this.players.getAll();
      const revealedClues = this.state.getAllCluesRevealed(activePlayers, this.settings.clueRounds);
      const playerList = activePlayers.map(p => ({ id: p.id, name: p.name }));
      const allHiddenWords = Array.from(this.state.hiddenWords.entries());
      const ownWord = this.state.hiddenWords.get(socket.id);
      const otherWords = allHiddenWords
        .filter(([pid]) => pid !== socket.id)
        .map(([, word]) => word)
        .sort(() => Math.random() - 0.5);
      const guessedWord = this.state.guesses.get(socket.id);
      const guessCorrect = guessedWord === ownWord;

      socket.emit('match:start', {
        hiddenWords: otherWords,
        players: playerList,
        revealedClues,
        allowDuplicateMatches: this.settings.allowDuplicateMatches,
        timer: 0,
        guessedWord,
        guessCorrect,
        ownWord,
      });
    } else if (phase === GameState.PHASES.RESULTS && this.lastResultsPayload) {
      socket.emit('game:results', this.lastResultsPayload);
    }
  }

  hasPlayer(socketId) {
    return !!this.players.get(socketId);
  }

  isEmpty() {
    return this.players.count() === 0;
  }

  _startTimer(seconds, callback) {
    this._clearTimer();
    this.io.to(this.roomCode).emit('timer:start', { seconds });
    this.timerId = setTimeout(callback, seconds * 1000);
  }

  _clearTimer() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}

module.exports = GameRoom;
