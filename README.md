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

<p align="center">
  <img src="docs/screenshots/train.png" width="240" alt="Logging a block during a range session" />
  <img src="docs/screenshots/progress.png" width="240" alt="Consistency trend over recent weeks" />
  <img src="docs/screenshots/guide.png" width="240" alt="Reference carry distances per club" />
</p>

## Stack

- **API** — NestJS 11, Prisma, PostgreSQL, BetterAuth (email/password), pino logging
- **Web** — React + Vite PWA, Tailwind + shadcn/ui, Dexie (IndexedDB), TanStack Query, Recharts
- **Tooling** — pnpm workspaces, jj, Docker, Jest + Vitest

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

Source is bind-mounted into the containers, so edits hot-reload. Sign-up sends a verification
email — open Mailpit, click the link, then sign in. The app starts in English; switch to
Italian from the Profile tab, and dates and numbers follow the language.

If file watching feels sluggish (it can on macOS over a bind mount), run the apps on the host
and keep only the infra in Docker:

```sh
pnpm install
just infra        # Postgres + Mailpit only
just migrate      # create/apply migrations
just dev-local    # api + web on the host
```

`just` on its own lists every command.

## Tests

```sh
pnpm --filter @golf/api test         # unit, with coverage gate
pnpm --filter @golf/api test:e2e     # hits a real Postgres (just infra first)
pnpm --filter @golf/web test
```

## How sync works

While you're using the app the phone is the source of truth. Everything you log lands in
IndexedDB (through Dexie) and the screens read straight from there, so nothing needs a
connection. The server only exists to back things up and let another device catch up — sync
is what reconciles the two.

It can afford to be simple, because it's all your own data: two devices almost never touch the
same record at the same moment. Every row that syncs (clubs, sessions, shot blocks) carries an
`updatedAt` that doubles as its version, plus a `deletedAt` — deletes are just a flag, so they
travel like any other edit instead of disappearing.

The client keeps two cursors in a local `meta` table: when it last pushed and when it last
pulled. A push sends every row changed since the push cursor to `POST /api/sync`; the server
keeps each one only if its `updatedAt` beats what it already has (and ignores rows owned by
someone else), then returns its own clock as the next cursor. A pull is the mirror image —
`GET /api/sync?since=<cursor>` hands back everything that changed server-side, deletions
included, and the client keeps whichever copy is newer.

So it's last-write-wins, one row at a time. No operation log, no CRDT — they'd be solving a
conflict this app doesn't have. Sync runs on load and after you finish a session, and because
every write is an upsert keyed by id, running it again changes nothing.
