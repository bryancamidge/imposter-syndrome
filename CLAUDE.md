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
- `index.js` — Express + Socket.io entry point, room creation/lookup
- `GameRoom.js` — Room orchestrator: wires socket events to state transitions, manages timers
- `GameState.js` — Pure state machine (lobby → clue → guessing → matching → results), scoring logic
- `PlayerManager.js` — Player tracking, host management, disconnect handling
- `WordBank.js` — Themed hidden word lists (animals, food, places, objects, professions, activities)
- `ClueDeck.js` — Clue card word pool with named lists (general, fantasy, everyday, science, emotional, adjectives, adverbs), draw mechanics
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

### Matching Screen
Revealed clues are displayed grouped by hidden word (in clue-phase order), with side-by-side columns per clue-giver underneath each word header. Each column shows the giver's name bolded at top and their clue words below.
