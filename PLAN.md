# Imposter Syndrome — Online Multiplayer Word Game Plan

## Context

Browser-based multiplayer word/deduction party game built on a web-native stack (Node.js + Express + Socket.io + vanilla JS). Replaced an empty Godot 4.6 project.

## Game Mechanics

### Overview
Each player has a hidden word they don't know. Players take turns giving clue cards about each other's words. Then everyone guesses their own word and tries to match other players to theirs.

### Detailed Flow

**1. Setup (Host configures):**
- Hand size: 3–15 cards drawn per clue round
- Clue rounds per word: how many rounds of clues each hidden word gets
- Number of decoy words in the guessing phase
- Themed word list selection (animals, food, places, objects, professions, activities)
- Clue word list selection (general, fantasy, everyday, science, emotional)
- Points for correctly guessing your own word (default: 3)
- Points for each correct player-to-word match (default: 1)
- Penalty for being misidentified by another player (default: -1)

**2. Word Assignment:**
- Each player is assigned a hidden word from the themed list
- Players never see their own word

**3. Clue Phase (cycles through all words per round):**
- At game start, the word order is shuffled randomly once and kept consistent across all rounds
- Each round cycles through every word in this shuffled order
- For each word: it's displayed to everyone EXCEPT the owner (who sees "????")
- ALL players (including the hidden player, who is blind) draw N cards from a separate clue word list
- Each player selects one card from their hand to play as a clue
- Clues appear **anonymously and in real-time** as each player submits (no player names, no per-player submission indicators)
- A counter shows "3/5 clues submitted" progress
- **No timer** — round advances only when all players have submitted
- After all words have been clued once, the next round begins (if configured for multiple rounds)
- Consistent ordering lets players track clue history per word slot without revealing ownership

**4. Guessing Phase:**
- Each player sees a list: their actual hidden word + decoy words from the same theme
- They guess which word is theirs, based on the anonymous clues others gave
- All players guess simultaneously, 90-second timer

**5. Matching Phase:**
- All hidden words are revealed (excluding each player's own word from their options)
- Clue cards are NOW shown **with player names attached**, grouped by word then sorted by player name
- Each player matches hidden words to other players (who had which word?)
- 120-second timer

**6. Scoring (all values configurable in setup):**
- **+N points** for correctly guessing your own hidden word (default: 3)
- **+N points** for each correct player-to-word match (default: 1)
- **-N points** if other players incorrectly assign a wrong word to YOU (default: -1)
- **Tiebreaker:** Total response time is tracked server-side across all submissions (clues, guesses, matches). Faster cumulative time wins ties. Time is displayed in the scoreboard.

## Tech Stack

- **Backend:** Node.js 20+ / Express / Socket.io
- **Frontend:** Vanilla JS (ES modules, no build step), single HTML page with view sections
- **State:** In-memory (no database — games are ephemeral)
- **Dev:** `node --watch server/index.js` (Node 20+ built-in watch mode)

## Project Structure

```
imposter-syndrome/
├── package.json
├── .gitignore
├── CLAUDE.md
├── PLAN.md
├── server/
│   ├── index.js                # Express + Socket.io entry point
│   ├── GameRoom.js             # Room orchestrator (wires events → state)
│   ├── GameState.js            # State machine + game logic + scoring
│   ├── PlayerManager.js        # Player tracking, join/leave/reconnect
│   ├── WordBank.js             # Themed word lists (hidden words)
│   ├── ClueDeck.js             # Clue card word pool + draw logic
│   ├── roomCodes.js            # 4-letter room code generation
│   └── constants.js            # Defaults for timers, scoring, etc.
├── public/
│   ├── index.html              # Single page, all 6 views as <section>s
│   ├── css/styles.css          # Dark-themed responsive CSS
│   └── js/
│       ├── main.js             # Socket.io client init, shared state
│       ├── socket-handlers.js  # All server→client event listeners
│       ├── ui-utils.js         # View switching, timer, DOM helpers
│       └── views/
│           ├── welcome.js      # Create/join game
│           ├── lobby.js        # Player list, game settings, start
│           ├── clue.js         # Card hand, clue selection, live anonymous display
│           ├── guessing.js     # Guess your own word from options
│           ├── matching.js     # Match hidden words to players (grouped by word)
│           └── results.js      # Scores with time, breakdown, play again
```

## State Machine

```
LOBBY → CLUE PHASE → GUESSING → MATCHING → RESULTS
                                                ↓
                                          LOBBY (new game)
```

**LOBBY:** Host sets game options. Players join via 4-letter room code. Start when 3+ players.

**CLUE PHASE** (no timer, all words get one round before any gets a second):
```
At game start: shuffle the word order once (randomized, NOT player-join order)
Keep this same order for all rounds.

For each clue round (1..configuredRounds):
  For each word in shuffled order:
    1. Show the word to everyone except its owner (owner sees "????")
    2. All players draw N cards from clue deck
    3. All players select one card → submit
    4. Each clue appears anonymously in real-time as submitted
    5. Advance when all players have submitted
  Next word
Next round
```

**GUESSING:** Each player picks their word from [real word + K decoys]. Simultaneous, 90s timer.

**MATCHING:** Other players' hidden words revealed (own word excluded from options). Clues shown grouped by word with player names. Each player assigns words to other players. Simultaneous, 120s timer.

**RESULTS:** Scores with time column, breakdown of guesses and matches, play again button (host only).

## Key Socket.io Events

### Client → Server
| Event | Payload | Phase |
|---|---|---|
| `room:create` | `{ playerName }` | — |
| `room:join` | `{ roomCode, playerName }` | — |
| `game:configure` | `{ handSize, clueRounds, decoyCount, pointsSelfGuess, pointsMatch, penaltyMisidentified, theme }` | LOBBY |
| `game:start` | `{}` | LOBBY |
| `clue:select` | `{ cardIndex, clue }` | CLUE |
| `guess:submit` | `{ word }` | GUESSING |
| `match:submit` | `{ matches: {playerId: word, ...} }` | MATCHING |
| `game:playAgain` | `{}` | RESULTS |

### Server → Client
| Event | Payload | Phase |
|---|---|---|
| `room:joined` | `{ roomCode, playerId, players, hostId, settings }` | — |
| `room:playerJoined` | `{ player }` | LOBBY |
| `room:playerLeft` | `{ playerId, newHostId }` | Any |
| `room:error` | `{ message }` | Any |
| `game:configured` | `{ settings }` | LOBBY |
| `game:started` | `{ phase }` | — |
| `clue:roundStart` | `{ wordSlot, totalSlots, roundNum, totalRounds, word/null, hand, isYourWord }` | CLUE |
| `clue:submitted` | `{ clue, count, total }` | CLUE (anonymous, real-time) |
| `guess:start` | `{ options, cluesForYou }` | GUESSING |
| `guess:playerSubmitted` | `{ playerId }` | GUESSING |
| `match:start` | `{ hiddenWords (excludes own), players, revealedClues }` | MATCHING (per-player) |
| `match:playerSubmitted` | `{ playerId }` | MATCHING |
| `game:results` | `{ guessResults, matchResults, penalties, scoreChanges, finalScores, wordReveal }` | RESULTS |
| `phase:lobby` | `{ players, settings }` | — |
| `timer:start` | `{ seconds }` | Any timed phase |

## Key Design Decisions

- **Anonymous then named clues:** During clue phase, clues appear anonymously in real-time. During matching, names are revealed so players can deduce who had which word.
- **No clue timer:** Players take as long as they need. Guessing and matching phases still have timers.
- **Hidden player plays blind:** Adds chaos and deception — their random clue card might accidentally be relevant or misleading.
- **Own word excluded from matching:** Players only see other players' hidden words in the matching dropdown, reducing noise.
- **Penalty for being misidentified:** Incentivizes giving clear, distinctive clues — if your clues are ambiguous, other players might assign the wrong word to you, costing you points.
- **Two separate word pools:** Hidden words come from themed lists (concrete, guessable). Clue cards come from a broader associative list (~240 words).
- **Server-authoritative:** All game logic runs on server. Client is display-only. Cards are dealt server-side to prevent cheating.
- **Server-side time tracking:** Cumulative response time per player tracked for tiebreaking (faster wins). Displayed in scoreboard.
- **No database:** Games are ephemeral. In-memory state is sufficient.
- **No build step:** Vanilla JS with ES modules served directly.

## Verification

1. `npm run dev` starts server on `localhost:3000`
2. Open 3+ browser tabs, create room, all join via code
3. Host configures settings (hand size, clue rounds, decoys, scoring, theme)
4. Start game → verify each player gets "????" for their own word
5. Clue phase → verify clues appear anonymously in real-time, no timer, counter shows progress
6. Guessing phase → verify each player sees correct clues + word options
7. Matching phase → verify clues grouped by word/player, own word excluded from options
8. Results → verify scoring with time column, correct points/penalties
9. "Play Again" → new game with same players
10. Test on mobile viewport (Chrome DevTools responsive mode)
