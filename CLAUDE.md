# CLAUDE.md

How we work in this repository. Written for AI agents and humans alike — both need
the same conventions.

For *what the system does*, read the [documentation index](./docs/README.md); the
five system pages there describe every feature. This page is about the rules of the
road: commands, conventions, and where things live.

## What this is

A team workspace built on Supabase: sign-in, a shared AI assistant, shareable
documents, files, live updates, and automation that runs without anyone watching.
The model key stays on the server; the browser holds only the public key and is
protected by database-level access rules. [docs/architecture.md](./docs/architecture.md)
explains the shape in a page.

## Commands

```bash
npm install            # install dependencies
npm run dev            # dev server on http://localhost:5173
npm run build          # typecheck the whole app + build — run before pushing
npm run lint           # eslint
npm test               # frontend unit tests (src/**/*.test.ts(x))
npm run test:deno      # edge-function unit tests (supabase/functions/tests/)
npm run gen:types      # regenerate src/lib/database.types.ts from the linked project
npm run start          # serve dist/ with SPA fallback (production)
```

Node 20. `workers/` and `control-plane/` are separate npm workspaces with their own
builds; they are not part of the app build or its checks.

## Before you push

Run `npm run build` and `npm test`. Add `npm run test:deno` if you touched
`supabase/functions/`, and `npm run lint` if you touched anything the linter reads.
The same checks run in CI on every pull request and every push to `main`, so a
green local run is the cheap way to find out.

## Conventions

**Keep logic out of components and handlers.** Anything that can be wrong — parsing,
validation, calculation, formatting, scheduling math — belongs in a pure module
with a test beside it: `src/lib/*.ts` for the browser,
`supabase/functions/_shared/*.ts` for the server. A logic change without a test is
unfinished work. Look at how the repository already solves a similar problem before
inventing a new shape.

**Stay in scope.** Implement what was asked. No drive-by refactors, no unrelated
formatting sweeps, no extra features that seemed like a good idea at the time.

**Write commits like a note to the next person.** One imperative summary line under
70 characters, a blank line, then a short body explaining *why* when it is not
obvious. Reference the issue it closes. No co-author trailers, no tool
advertisements, no session links — the commit message is about the change, not
about what produced it.

```
Add password gate to shared artifacts
```

**Land work on `main`.** Small changes go straight there; anything worth reviewing
goes through a pull request and is squash-merged. `main` is what deploys.

**Never commit to `release`.** It is a cut of `main` and only ever receives changes
by merging `main` into it. Committing straight onto `release` makes it diverge, and
the next merge becomes a conflict. If it has already drifted, merge `release` into
`main` resolving every conflict in **main's favor** — main is the superset — which
records the shared history without changing a file, and the pending merge becomes a
clean fast-forward again.

**Migrations are numbered and immutable-ish.** Every file in
`supabase/migrations/` needs a unique, contiguous `NNNN_` prefix; two files sharing
a number abort the entire push and every later migration silently stops deploying.
A unit test guards this, but it can only see files that have landed — so re-check
the next free number right before you push, not when you create the file. Write
migrations idempotently where practical, and after a schema change run
`npm run gen:types`.

**Never hardcode a model id.** Features resolve a model profile key
(`orchestrator` or `utility`); an admin re-points the profile in Settings. Model
ids are OpenRouter slugs. Do not quietly downgrade a model to save money — that is
the maintainer's call and it is a one-line edit in the app.

**Keep model calls in the shared client.** Every loop talks to OpenRouter through
the same module, which means one place decides the request shape: slugs for model
ids, a reasoning-effort field rather than any provider-specific option, the
OpenAI-style function-calling shape for tools, streamed responses, and a usage row
recorded per call. Add a capability there rather than a second way of calling a
model.

**Do not weaken the security boundary.** Row-level security is what protects data,
not key secrecy. Code that runs with the service role bypasses those rules and must
re-check the same access rule itself. Credentials belong in Supabase Vault, never
in a table column, a browser payload, or a log. The only key that belongs in the
frontend is the public anon key.

**Update the docs in the same commit.** If a change alters what someone can do,
edit the page that describes it. New documents get a row in
[docs/README.md](./docs/README.md) — a test checks that every file under `docs/` is
listed there.

## Where things live

| Path | What |
| --- | --- |
| `src/pages/` | One file per screen; settings areas under `src/pages/settings/` |
| `src/components/` | The shell, shared controls, icons (inline SVG, no icon dependency) |
| `src/lib/` | Pure browser logic + the typed database schema; tests sit beside each module |
| `src/lib/nav.ts` | The single source of truth for the sidebar, the ⌘K palette and feature flags |
| `supabase/migrations/` | Schema, access rules, and the rows that seed capabilities |
| `supabase/functions/` | Edge functions: chat, webhook, scheduler, mcp, ingest, and the rest |
| `supabase/functions/_shared/` | Logic shared by every function; the pure parts are unit-tested |
| `supabase/functions/tests/` | Deno tests for the shared modules |
| `docs/` | The documentation set — start at `docs/README.md` |
| `skills/` | Skill files seeded into the workspace |
| `workers/`, `control-plane/` | Separate workspaces, own builds |

## Deployment

Pushing to `main` updates everything: the frontend rebuilds, changed edge functions
redeploy, and pending migrations are applied. Hosted workspaces are updated by a
fan-out on the `release` branch, so a tenant never ends up running new frontend
code against an old database. [DEPLOY.md](./DEPLOY.md) has the setup.

Forged functions are the exception: they live in the database rather than in git,
so they are redeployed from their stored source, from inside the app.

## Gotchas

Things that have actually cost someone an afternoon.

- **A failed migration never records as applied**, so its objects are simply
  missing in production until you fix it. Editing the file in place is the correct
  fix in that case.
- **Changing a function's return type needs a `drop` first.** Postgres refuses to
  replace a function whose signature changed, and that aborts the whole push.
- **A new enum value cannot be used in the transaction that adds it.** Add the
  value in one migration and use it in the next.
- **`VITE_*` variables are read at build time.** They must exist before the build
  runs, or the deployed bundle points at nothing.
- **Streaming has two sides.** The chat function emits server-sent events and the
  browser parses them; change one and you must change the other.
- **Realtime echoes your own insert.** Chat tracks the ids it has seen so an
  optimistic insert and its echo do not render twice.
- **Auth redirects depend on the project's Site URL** and redirect allowlist. Set
  them to the deployed origin or your login links go to localhost.
- **Function URLs on `*.supabase.co` serve HTML as plain text** (an anti-phishing
  rewrite), which is why shared HTML pages link to the app's own route rather than
  the function.
- **Claude Desktop's MCP bridge mangles a space inside a header argument**, so the
  token is passed through the environment instead. The settings page emits the
  correct snippet.
- **Keep the layout responsive.** The sidebar is a drawer on small screens and
  editors stack; guard side-by-side panels behind a breakpoint.
- **A brand-new Supabase project can lag on storage.** If the first push fails on a
  storage object, apply the core tables first and re-run.
- **Edge-function tests fetch remote dependencies**, so a CDN hiccup can fail an
  otherwise-green run. CI retries before believing it.
