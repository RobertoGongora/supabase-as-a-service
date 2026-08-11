# AGENTS.md

Conventions for anyone working in this repository — human or AI. Short, and worth
reading in full before your first commit.

`CLAUDE.md` is the map of what the system does and where each part lives. This file
is the map of **how we work on it**.

## Read this first

| You want to… | Read |
| --- | --- |
| Understand the product | [README.md](./README.md) |
| Find the feature you're about to change | [CLAUDE.md](./CLAUDE.md) |
| Go deep on one area | [docs/README.md](./docs/README.md) — the docs index |
| Know where the project is heading | [ROADMAP.md](./ROADMAP.md) |

## Branches and pull requests

- Work on a branch off `main`, open a pull request, and land it with a **squash
  merge**. `main` is the deploy trigger: the frontend rebuilds, and CI applies new
  migrations and edge functions.
- **Never commit to `release`.** `release` is a cut of `main` and only ever changes by
  merging `main` into it. Committing straight onto `release` makes the next
  `main → release` merge a conflict. If it has already drifted, merge `release` into
  `main` resolving every conflict in main's favour, then cut again.
- Keep a pull request to one intent. Unrelated cleanup belongs in its own branch.

## Commit messages

- One imperative summary line, under 70 characters: `Add quick todo button to home page`.
- A short body when the reason isn't obvious from the diff — explain **why**, not what
  the diff already shows.
- Close the issue it came from with a `Closes #123` line.
- **No co-authoring trailers.** No `Co-authored-by:`, no session links, no tool
  signatures. The commit records the change, not who or what typed it.

## Before you push

```bash
npm install && npm run lint && npm run build && npm test
```

`npm run build` typechecks the whole app, so it catches what tests don't. If you
touched `supabase/functions/`, also run `npm run test:deno`. CI runs the same
commands on every pull request, so a green local run is a green pull request.

## Tests belong with logic

Testable logic is deliberately kept out of components and request handlers. Put it in
a pure module and unit-test that module:

- Browser-side logic → `src/lib/*.ts` with a sibling `*.test.ts` (vitest).
- Edge-function logic → `supabase/functions/_shared/*.ts` with a test in
  `supabase/functions/tests/` (deno test).

Parsing, validation, formatting, date maths, and access decisions are all logic. A
logic change without a test is unfinished work.

## Database migrations

- Add one file to `supabase/migrations/` using the **next free number**
  (`0111_…` after `0110_…`). Numbers must stay unique and contiguous —
  `supabase db push` derives a migration's version from that prefix, and a collision
  aborts the entire push, silently leaving later migrations undeployed.
- **Re-check the number right before you push**, not only when you create the file.
  Another migration may have landed on `main` while you were working. This has bitten
  the repo repeatedly; `src/lib/migrations.test.ts` guards it.
- Write migrations idempotently (`create … if not exists`, `drop policy if exists`) so
  re-applying them against a workspace that already has the objects is a no-op.
- Changing a function's return type needs an explicit
  `drop function if exists public.fn(argtypes);` first — Postgres refuses
  `create or replace` across a signature change, and the failed file never records as
  applied.
- Regenerate the typed client afterwards with `npm run gen:types`; never hand-edit
  `src/lib/database.types.ts` beyond keeping the build green.

## Rules that protect the workspace

- **Row-level security is the security boundary.** Never widen a policy to make a
  feature easier. Edge functions that run with the service role must re-enforce the
  same access rule in code.
- **Secrets stay server-side.** The browser only ever holds the Supabase anon key.
  Provider keys live in edge-function secrets or Supabase Vault, never in a table
  column, a client payload, or a log.
- **Never hardcode a model id.** Features bind to a model profile key
  (`orchestrator`, `utility`); an admin re-points the key in Settings → Models.
- **Don't silently downgrade a model to save cost.** That's the maintainer's call.

## Documentation

Docs ship with the change that makes them true. When you add or alter behaviour,
update `CLAUDE.md`'s entry for that area in the same pull request, and the area doc
under `docs/` if one exists.

House style, everywhere:

- Say **what** something is and what it gives someone. Leave the **how** to the code.
- Be propositive and plain. Skip jargon, skip adjectives about quality.
- Code in docs is an example, not an implementation: one line, or a short command
  block someone can paste.
- Prefer describing the rule ("archiving hides the row from every normal view but the
  owner can restore it") over narrating the implementation.

`docs/README.md` indexes every document; add new ones there. `src/lib/docs.test.ts`
checks that the index is complete and that links between documents resolve.
