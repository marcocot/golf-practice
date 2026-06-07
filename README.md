# Golf Practice

A small app I'm building to learn NestJS. The excuse is golf: I just started, I only hit
at the driving range, and I wanted a way to tell whether I'm actually getting better without
writing down every single shot.

So instead of logging shots one by one, you log a *block* — say 10 balls with the 7 iron —
and tap three things: how many were solid, where they went (left / straight / right), and the
rough distance off the range markers. From that the app tracks a consistency score over time
and shows which level you're roughly in. There's also a reference card with expected carry
distances per club and a few fixes for the usual misses.

The backend is where the actual learning happens: NestJS + Prisma + Postgres, auth, and a
sync endpoint. The phone app is local-first, so it works on the range with no signal and
syncs when it gets back online.

## Stack

- **API** — NestJS 11, Prisma, PostgreSQL, BetterAuth (email/password), pino logging
- **Web** — React + Vite PWA, Tailwind + shadcn/ui, Dexie (IndexedDB), TanStack Query, Recharts
- **Tooling** — pnpm workspaces, jj, Docker, Jest + Vitest

## Layout

```
apps/api   NestJS service (auth, sync, health)
apps/web   React PWA (offline-first client)
```

## Running it

Everything runs in Docker — Postgres, the Mailpit inbox, the API and the web app. You only
need Docker (and [`just`](https://github.com/casey/just) for the shortcuts).

```sh
just dev          # or: docker compose up --build
```

The API container applies pending migrations on start, so there's nothing else to wire up.

- Web: http://localhost:5173
- API: http://localhost:3000/api
- Mailpit (verification / reset emails land here): http://localhost:8025

Source is bind-mounted into the api and web containers, so edits hot-reload.

Sign-up sends a verification email — open Mailpit, click the link, then sign in. The web app
defaults to English; switch to Italian from the Profile tab. Dates and numbers follow the
chosen language.

**Working on the host instead** (faster file watching on macOS): keep only the infra in
Docker and run the apps with pnpm.

```sh
pnpm install
just infra                           # Postgres + Mailpit only
just migrate                         # create/apply migrations
just dev-local                       # api + web on the host
```

Run `just` to see every command.

## Tests

```sh
pnpm --filter @golf/api test         # unit, with coverage gate
pnpm --filter @golf/api test:e2e     # hits a real Postgres (docker compose up -d db first)
pnpm --filter @golf/web test
```

## How sync works

The phone is the source of truth while you're using it. Everything you log goes straight into
IndexedDB (via Dexie) and the UI reads from there, so the app is fully usable offline. The
server is just a backup/second device, and sync reconciles the two.

**Record shape.** Every syncable row (clubs, sessions, shot blocks) carries two extra fields:

- `updatedAt` — an ISO timestamp that doubles as the row's version
- `deletedAt` — set instead of actually deleting, so a delete can travel like any other change

**Cursors.** The client keeps two timestamps in a local `meta` table: the last time it pushed
and the last time it pulled.

**Push.** The client collects every local row with `updatedAt` newer than the push cursor and
sends them to `POST /api/sync`. The server upserts each one with a last-write-wins rule: it
applies the incoming row only if its `updatedAt` is newer than what's stored, and it ignores
rows owned by a different user. The response carries the server time, which becomes the new
push cursor.

**Pull.** The client asks `GET /api/sync?since=<pull cursor>` and gets back every row the
server changed after that point (deletions included, as rows with `deletedAt` set). It merges
them into Dexie with the same rule — keep whichever side has the newer `updatedAt` — and stores
the server time as the new pull cursor.

**Why this is enough.** The data is single-user: you're the only one editing your own bag and
sessions. Concurrent edits to the same record are rare, so last-write-wins per record is
plenty — no operation log, no CRDT. Sync runs when the app loads and after you finish a
session, and it's safe to run repeatedly because upserts are idempotent.
