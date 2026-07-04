# TypeArena — MVP

A working multiplayer typing-esports scaffold: room codes, live races, real-time
WPM/accuracy tracking, threshold-based elimination, a live leaderboard, and a
cyberpunk-styled Next.js frontend. Built by **Waqqas**.

> ⚠️ **Security note:** an API key was pasted into the chat that produced this
> project. Revoke/rotate it immediately if you haven't already — it should
> never be committed to this repo or shared anywhere. Nothing in this codebase
> uses it.

## What's actually implemented

- Realtime server (Node + Express + Socket.IO): rooms by code, quick match,
  host-started countdown, live progress broadcasting, an elimination engine
  that checks WPM / accuracy / mistake thresholds once per second after a
  grace period, and match-end resolution (first clean finisher wins, or
  highest WPM survivor on timeout).
- Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion frontend:
  Landing → Lobby → Arena → Victory flow, glassmorphic panels, neon glows,
  scanlines, animated countdown, live per-character typing feedback,
  circular accuracy gauge, animated leaderboard + elimination feed, and a
  confetti/gold-beam victory screen.

## What's intentionally out of scope for this pass

These were explicitly deferred in your own Phase 7 MVP scope, and are not in
this build: persistent accounts/auth, PostgreSQL/Redis persistence (all state
is in-memory and resets on server restart), AI coach, anti-cheat, matchmaking
by rank/ping/region, tournament brackets, battle pass/store, and payments.
The architecture (separate realtime server + frontend, typed socket payloads)
is set up so each of those can be layered in without a rewrite.

## Running it locally

Requires Node.js 18+.

```bash
# terminal 1 — realtime server
cd server
npm install
npm run dev        # listens on :4000

# terminal 2 — frontend
cd web
npm install
cp .env.local.example .env.local
npm run dev         # http://localhost:3000
```

Open two browser tabs at `http://localhost:3000` to test multiplayer: one
creates a room, copies the code, the other joins with it.

## Project layout

```
typearena/
  server/
    src/
      index.js               # Socket.IO server, match lifecycle
      rooms.js                # Room/RoomManager, lobby thresholds
      eliminationEngine.js    # Per-tick elimination checks
      quotes.js                # Quote library
  web/
    app/
      page.tsx                 # Landing
      lobby/page.tsx            # Waiting room
      arena/[roomCode]/page.tsx # Core gameplay screen
      victory/page.tsx          # Results / celebration screen
    components/                # GlassPanel, NeonButton, Hud, TypingArena, ...
    lib/                        # socket client, shared types, session helpers
```

## Editing the credit footer

`web/components/Footer.tsx` currently shows a placeholder email
(`waqqas@typearena.dev`) — swap in your real contact address there.

## Suggested next steps, in order

1. Wire Postgres for accounts + match history (the `matches`/`profiles`
   tables from your Phase 2 schema slot in cleanly).
2. Add Redis for room state so the server can scale horizontally.
3. Auth (JWT or session-based) gating room creation.
4. Tournament brackets on top of the existing Room/RoomManager classes.
