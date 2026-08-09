# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

GitFlow turns a public GitHub repo (`owner/name`) into browsable, AI-generated documentation with a per-page chat grounded in that page's actual source files. A background pipeline fetches the repo tree, has an LLM plan a doc outline (sections → pages), then generates each page's markdown + Mermaid diagrams. See `README.md` for the full architecture writeup, sequence diagrams, and API table — read it before making non-trivial changes, it's kept accurate and detailed.

## Stack

Bun 1.3 (runtime + package manager) · Turborepo + Bun workspaces · Express 5 + Passport (Google OAuth) + JWT · Next.js 16 App Router + React 19 + Tailwind v4 + TanStack Query · PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) · Mistral (`mistral-large-latest`) via LangChain · Docker + Kubernetes + Skaffold for local k8s dev.

**Next.js 16 is very new and has breaking changes vs. training data** — `apps/frontend/AGENTS.md` (aliased from `apps/frontend/CLAUDE.md`) warns to check `node_modules/next/dist/docs/` before writing frontend code that touches Next APIs/conventions.

## Commands

```sh
bun install                         # from repo root, installs all workspaces

bun run dev                         # frontend (3000) + backend (4000), watch mode
bun run build                       # builds frontend; backend runs from source, no build step
bun run lint
bun run check-types
bun run format                      # prettier

turbo dev --filter=@repo/frontend   # run one workspace's task
```

Database (from `packages/db-prisma`):

```sh
bun run db:generate    # regenerate Prisma client — required before anything typechecks after a schema change
bun run db:migrate     # prisma migrate dev
bun run db:studio
```

Local Postgres: `docker compose -f docker/docker-compose.yml up -d`.

Backend tests (Bun's test runner + supertest, hit the real Express app and a real Postgres DB — no mocking, so Postgres must be up and `apps/backend/.env` populated; tests create/clean up their own rows):

```sh
cd apps/backend
bun test                              # everything
bun test src/tests/repo.test.ts       # one file
bun test -t "rejects duplicate email" # one test by name
```

## Env files

```sh
cp docker/.env.example docker/.env
cp apps/backend/.env.example apps/backend/.env
cp packages/db-prisma/.env.example packages/db-prisma/.env
```

`apps/backend/src/config/config.ts` throws at import time if any required var is missing (`PORT`, `BASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`, `EMAIL_USER`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `NODE_ENV`, `FRONTEND_URL`) — there is no partial-config path, so adding a new required var means adding its guard there too. `MISTRAL_API_KEY` is checked lazily in `packages/git-indexing/src/agent/agent.worker.ts` instead.

## Architecture

**Monorepo layout** — `apps/backend` (Express API, runs `.ts` directly on Bun, no build step), `apps/frontend` (Next.js, organized as `app/` + `features/<domain>/{api.ts,components,hooks}` + `shared/`), `packages/db-prisma` (schema, migrations, generated client, singleton export), `packages/git-indexing` (GitHub fetch + LLM planning/generating pipeline — used only by the backend, not the frontend), `packages/types` (Zod schemas + entity types shared by both apps), `packages/eslint-config` / `packages/typescript-config` (shared configs).

**Indexing is fire-and-forget.** `POST /repo/create` creates a `Repo` row with `status: pending` and returns `201` immediately; `startIndexing()` (`packages/git-indexing/src/pipeline.ts`) runs unawaited in-process and walks the row through `fetching → planning → generating → ready` (or `failed` on any thrown error, via a top-level try/catch). The frontend polls `GET /repo/:id` for status rather than receiving a push. Only one indexing job per user at a time is allowed — enforced via an in-process `Set<userId>` (`indexingUsers`, exported from `packages/git-indexing`), checked before creating the job and released in a `finally`. This state is **in-memory only**: it does not survive a backend restart and assumes a single backend replica.

**Auth is JWT-based**, not session-based. Access tokens are short-lived (2 minutes — expiry during normal use is the common case, not an edge case) and can arrive as `Authorization: Bearer <token>` or an httpOnly `token` cookie; `authMiddleware` (`apps/backend/src/middlewares/auth.middleware.ts`) checks both, verifies `type: "access"` in the payload, and sets `req.userId`. Refresh tokens live in a separate httpOnly cookie. The frontend's axios instance (`apps/frontend/src/shared/lib/api-client.ts`) transparently retries a `401` behind one refresh call and only redirects to `/login` if the refresh itself fails — this retry-once behavior is load-bearing, don't "simplify" it into a plain interceptor.

**Chat is grounded per page, not via embeddings.** Every question against `POST /page/:id/messages` re-fetches that page's `sourceFiles` from GitHub at the repo's pinned `sha`, builds a system prompt from the page's markdown + raw source, and only persists the user/assistant message pair after the LLM responds successfully — a failed generation leaves no partial turn in history.

**LLM access is centralized and rate-limited.** `packages/git-indexing/src/agent/agent.worker.ts` (`getModel()`) is the only place a `ChatMistralAI` instance is constructed; `rate-limiter.ts` serializes calls with 429 backoff. Planning (`planing.model.ts`) and generation (`generating.model.ts`) both validate LLM JSON output with Zod (`zod.schema.ts`) before writing to the DB — don't skip validation when adding a new LLM-backed step.

**Data model** (`packages/db-prisma/prisma/schema.prisma`): `User → Repo → Section → Page → Message`, all cascade-deleted from the top down. `Repo` carries the `IndexStatus` enum (`pending/fetching/planning/generating/ready/failed`) that drives the polling flow above. After editing `schema.prisma`, run `bun run db:generate` (in `packages/db-prisma`) before other workspaces will typecheck — the Prisma client is checked into `src/generated/prisma/` as generated code, not hand-edited.

**GitHub calls are unauthenticated** (60 req/hour cap) and capped at 2,000 files / 4,000 chars per file (`Repo.truncated` records when this kicks in) — keep this in mind when touching `packages/git-indexing/src/github-fetch.ts`.

## Deployment

Images are built with `turbo prune --docker` so each image only bundles the workspaces it needs. `skaffold dev` builds both images, applies everything under `k8s/`, runs Prisma migrations via an init container, and port-forwards to 3000/4000 (requires a cluster with the nginx ingress controller). `k8s/secret.yml` is gitignored — copy from `k8s/secret-example.yml` and fill in real values before running Skaffold.
