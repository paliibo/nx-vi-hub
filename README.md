# Vi Hub

A self-hostable video hub — browse a catalog, watch, comment, subscribe and
curate playlists. Built as an Nx monorepo where a single **ts-rest contract** is
the only definition of the HTTP surface: the Express API implements it, the
Next.js app consumes it, and changing a response shape breaks the build on both
sides rather than returning the wrong JSON at runtime.

```bash
cp .env.example .env
docker compose up --build
# http://localhost:3000 — sign in with demo@vihub.dev / demo1234
```

---

## What it does

| | |
|---|---|
| **Discover** | Featured hero plus Trending, Just added, Continue watching and From your subscriptions — all five shelves in one API request |
| **Watch** | Custom player with the keyboard shortcuts you expect (`space` `k` `j` `l` `f` `t` `0–9`), a resume point that survives reloads, theatre mode and shareable `?t=` timestamps |
| **Search** | Free text over titles, descriptions and channels, filtered by category or tag, in four sort orders — every combination has its own URL |
| **⌘K palette** | Type-ahead across videos and channels, plus jump-to-page and theme switching |
| **Engage** | Like and dislike, subscribe, and comments one level deep — all optimistic, all reconciled against the server |
| **Library** | Watch history with resume bars, liked videos, and playlists you can create, reorder and delete |
| **Studio** | Publish, edit and unpublish videos on your own channel, with public / unlisted / private visibility |
| **Themes** | Light, dark and system, driven entirely by semantic design tokens |

## Stack

Nx 23 · Next.js 15 (App Router, RSC) · React 19 · Express 4 · Prisma 5 ·
PostgreSQL 16 · ts-rest · Zod · Tailwind 3 · Radix UI · Jest 30

```
apps/
  api/              Express server implementing the shared contract
  web/              Next.js App Router front end
package/
  shared/           The ts-rest contract, Zod schemas, typed errors
  shared-ui/        Radix-based component library on semantic tokens
  db/               Prisma schema, client and seed
  tailwind/         Design tokens and the Tailwind preset
```

### Why a shared contract

`package/shared/src/api` describes the whole surface once — 42 operations
across 31 paths. The API implements it
through `@ts-rest/express`, so a handler that returns the wrong shape does not
compile; the web app calls it through `@ts-rest/core`, so a page reading a field
that no longer exists does not compile either. Request validation and response
parsing both come from the same Zod schemas.

Discovery and type-ahead live under `/catalog` rather than `/videos` on purpose:
`/videos/discover` would stop resolving the day somebody published a video whose
slug happened to be `discover`.

### Auth

Access tokens are short-lived JWTs; refresh tokens are 48 random bytes stored as
a SHA-256 hash in their own table, which makes them individually revocable and
useless to anyone who reads the database. Both travel as `httpOnly` cookies, and
the refresh cookie is scoped to the auth routes so nothing else ever receives
it. Presenting a refresh token spends it and issues a new one, so a replay finds
it revoked. Passwords use argon2id at the OWASP floor, and sign-in verifies
against a real hash even when the account does not exist, so a missing email and
a wrong password take the same time to answer.

## Running it

### With Docker

```bash
cp .env.example .env
docker compose up --build
```

Brings up Postgres, runs migrations, seeds the catalog and starts both apps.

### Locally

Requires Node 22+, pnpm 10+ and a PostgreSQL 16 database.

```bash
pnpm install
cp .env.example .env          # then point DATABASE_URL at your database
pnpm nx run db:migrate:deploy
pnpm nx run db:seed

pnpm nx serve api             # http://localhost:4308
pnpm nx dev web               # http://localhost:3000
```

| URL | |
|---|---|
| http://localhost:3000 | The app |
| http://localhost:4308/api-docs | OpenAPI explorer, generated from the contract |
| http://localhost:4308/health | Liveness |

The seed creates 7 channels, 37 videos and 122 comments, and a demo account —
**demo@vihub.dev / demo1234** — that already has history, subscriptions and a
playlist, so every shelf has something in it. It is deterministic: durations,
view counts and dates are hashed from each video's slug, so the catalog is
identical on every machine. Every write is an upsert, so re-running it changes
nothing.

Playable media points at the Blender Foundation's open movies. Nothing breaks
without network access — videos fall back to generated poster art, which is what
the seeded catalog uses for thumbnails anyway: a gradient derived from a hash of
the video's slug, anchored to its channel's accent colour.

## Development

```bash
pnpm nx run-many -t lint test build   # everything CI runs
pnpm nx test api                      # one project
pnpm nx run db:studio                 # browse the database
pnpm nx format:write --all
```

Tests are Jest: 82 across the workspace. The API suite includes 30 end-to-end
cases that drive the real Express app against a real Postgres database through
supertest — the auth lifecycle including refresh rotation and replay rejection,
ownership rules, the comment depth limit, resume clamping and the library. Each
run namespaces its records and deletes them afterwards, so it is safe against a
seeded development database.

CI runs the same commands against a `postgres:16` service.

### Notes

- **One `.env` at the root.** Prisma resolves it, the API loads it on boot, and
  `next.config.js` forwards the public values into the browser bundle.
- `API_BASE_URL` and `NEXT_PUBLIC_API_BASE_URL` are different values, not a
  fallback chain: server components reach the API over the internal network,
  the browser needs an address the user's machine can resolve.
- The web build pins `NODE_ENV=production`. Nx sets `development` for
  run-commands targets, and Next then loads its development pages runtime
  alongside a production bundle, which fails prerendering with `<Html> should
  not be imported outside of pages/_document`.
