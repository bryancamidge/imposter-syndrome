# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Imposter Syndrome** is a browser-based multiplayer word/deduction party game. Each player has a hidden word they can't see. Players give clue cards about each other's words, then guess their own word and match words to players.

## Tech Stack

- **Backend:** Node.js 20+ / Express / Socket.io
- **Frontend:** Vanilla JS (ES modules, no build step)
- **State:** In-memory (no database)

## Commands

```bash
npm run dev    # Start dev server with --watch (auto-restarts on changes)
npm start      # Start production server
```

Server runs on `http://localhost:3000` by default (`PORT` env var to change).

## Architecture

### Server (`server/`)
- `index.js` — Express + Socket.io entry point, room creation/lookup, rejoin handler
- `GameRoom.js` — Room orchestrator: wires socket events to state transitions, manages timers, disconnect grace period, reconnection
- `GameState.js` — Pure state machine (lobby → clue → guessing → matching → results), scoring logic, player ID migration
- `PlayerManager.js` — Player tracking, host management, disconnect handling, socket ID migration
- `WordBank.js` — Themed hidden word lists (animals, food, places, objects, professions, activities, movies)
- `ClueDeck.js` — Theme-matched clue card pools (animals, food, places, objects, professions, activities, movies), 500 descriptive words each, draw mechanics
- `roomCodes.js` — 4-letter room code generation
- `constants.js` — Default config values, timer durations (all timers host-configurable, 0=disabled)

### Frontend (`public/`)
Single-page app with hidden `<section>` views toggled via CSS classes.

- `js/main.js` — Socket.io client init, shared state object
- `js/socket-handlers.js` — All server→client event listeners, view transitions
- `js/ui-utils.js` — View switching, timer, DOM helpers
- `js/views/` — One module per game phase (welcome, lobby, clue, guessing, matching, results)

### Key Pattern
All game logic is server-authoritative. The client is display-only. Socket events drive all state changes. Game phases transition via `GameState.transitionTo()` with validated transitions.

### Game Flow
`LOBBY → CLUE PHASE → GUESSING → MATCHING → RESULTS → (play again)`

Clue phase iterates: for each round, cycle through all players' hidden words in a shuffled order. All words get one round of clues before any gets a second.

### Timers
All three phase timers (clue, guessing, matching) are host-configurable in lobby settings. Setting a timer to 0 disables it (phase only advances when all players submit). Timer durations are sent from server to client in each phase-start event (`data.timer`).

### Guessing Screen
The guessing screen shows clues about the player's hidden word and a set of word options to choose from. Clues are split into two sections:

- **Other players' clues:** Displayed normally as clue cards — these are the useful hints.
- **Blind clues:** Clues the player themselves gave for their own word (without seeing it) are shown in a separate section below with dimmed styling (`clue-card blind` class, 0.55 opacity), separated by a dashed border. Server returns `cluesForYou` (others' clues) and `blindClues` (own blind clues) as flat arrays from `GameState.getCluesForPlayer()`.

### Matching Screen
Revealed clues are displayed grouped by hidden word (in clue-phase order), with side-by-side columns per clue-giver underneath each word header. Each column shows the giver's name bolded at top and their clue words below.

- **Own word first:** The current player's own hidden word and its clues are displayed at the top, separated by an "Other Players" divider from the rest. The word header shows "(Your Word)" and uses accent color. Match buttons under the own word section are non-interactive (rendered as plain divs) with red styling (`own-word-inactive` class).
- **Own clues highlighted:** Within each word section, the current player's own clue column appears on the left with distinct red styling (`own-clue-column` class — red-tinted background, accent left border, warning-colored header).
- **Alphabetical alignment:** Other players' clue columns are sorted alphabetically by name so they align vertically across all word sections.
- **Allow Duplicate Matches:** Host-configurable setting (`allowDuplicateMatches`). When enabled, players can assign the same person to multiple words. When disabled (default), selecting a player for one word clears their previous assignment. Match data is word-keyed (`{ word: playerId }`) to support duplicates.

### Clue Cards
Clue cards use two-tier tracking: `dealtThisStep` prevents duplicate cards within a single clue step (cleared each step), while `playedThisGame` permanently excludes cards that were actually selected by a player (cleared only on "Play Again"). Unplayed hand cards return to the pool each step, extending effective pool life. If the pool runs out, `playedThisGame` is cleared as overflow protection.

### Connection & Reconnection
Socket.io configured with 3-minute ping timeout and CORS `origin: "*"` for online play. Disconnected players get a 30-second grace period (`DISCONNECT_GRACE_SECONDS` in `constants.js`) before being removed — if they reconnect within the window, their session is restored seamlessly.

**Reconnection flow:**
- Server: `room:rejoin` event finds disconnected player by name, calls `GameRoom.reconnectPlayer()` which migrates socket ID across `PlayerManager` and `GameState`, re-registers socket events, and sends phase-appropriate state.
- Client: `sessionStorage` persists `roomCode` + `playerName` across page refreshes. On socket `connect`, auto-emits `room:rejoin` if session data exists.
- Fallback: `addPlayer()` also checks for disconnected players by name when game is in progress, so manually clicking "Join Game" with the same name+code also triggers rejoin.
- `room:playerReconnected` event broadcasts the old→new player ID mapping so other clients update their local state.
- Connection status banner (`#connection-banner`) shows "Reconnecting..." overlay during disconnects.

### Scoring
Scores reset to 0 on "Play Again" via `GameState.resetScores()`. Each game is standalone — scores do not accumulate across games.
