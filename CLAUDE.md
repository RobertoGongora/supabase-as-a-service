# CLAUDE.md

How we work in this repository. Read this before changing anything; it is the
same guidance for humans and for coding agents.

**What the code does** is documented separately, and deliberately so:

- [docs/architecture.md](./docs/architecture.md) — the shape of the system
- [docs/features.md](./docs/features.md) — every feature area, what it's for
- [docs/operations.md](./docs/operations.md) — environments, CI, migrations, rollout
- [docs/README.md](./docs/README.md) — the full documentation index

Keep this file about *conventions*. When you learn something about how a feature
behaves, it belongs in `docs/`, not here.

## What this is

A React workspace on top of Supabase: auth, an AI assistant, shareable artifacts,
files, tables, automation, and realtime everywhere. The OpenRouter key lives only
in edge functions; the browser holds the anon key and is protected by row-level
security.

## Commands

```bash
npm install            # install deps
npm run dev            # Vite dev server on http://localhost:5173
npm run build          # typecheck + build — run before every commit
npm run lint           # eslint
npm test               # vitest (frontend unit tests)
npm run test:deno      # deno test (edge-function units)
npm run gen:types      # regenerate the typed schema from the linked project
npm run start          # serve dist/ with SPA fallback (production)
```

## Before you commit

1. `npm run build` — it typechecks the whole app, so it catches more than a lint.
2. `npm test`.
3. `npm run test:deno` as well, if you touched `supabase/functions/`.
4. `npm run lint`.

CI runs the same four on every PR and every push to `main`. A change that adds or
alters logic needs tests in the same commit.

## Commit messages

Write for the person reading `git log` in a year.

- One imperative summary line: *Add share-password gate to standalone pages*.
- A short body explaining **why**, when the reason isn't obvious from the diff.
- Reference the issue when there is one: `Closes #123`.

**No co-authoring or attribution trailers.** No `Co-authored-by:`, no
"Generated with", no session links. The commit records what changed and why —
which tool typed it is not part of the repository's history. Older commits
predate this rule; don't copy them.

## Branches

- Maintainers work trunk-based: commit and push to `main`, which deploys.
- Work built from the Features board goes on its own branch and lands by PR.
- **Never commit directly to `release`.** It only ever receives `main` by merge.
  A commit authored on `release` makes the branches diverge and turns the next
  merge into a conflict.

## Testing

Pure logic lives in its own module with its own tests; components and handlers
stay thin. This is a deliberate pattern, not an accident — parsers, validators,
matchers, formatters and scheduling maths are all extracted, which is why the
suites run in seconds.

Follow the existing shape: the artifact protocol parser, webhook payload
validation, event matching, cron maths, retrieval fusion and the widget
allow-list are each a module plus a test file. When you add logic, put it
somewhere it can be tested without a browser or a database, then test it.

## Database changes

The schema is `supabase/migrations/`, numbered and forward-only. CI applies what's
pending when a migration lands on `main`.

- **Unique, contiguous number prefixes.** The version comes from the prefix, so
  two files sharing a number stop the push dead. A unit test guards this, but it
  only sees files already on `main` — **re-check the next free number right
  before you push**, not when you created the file.
- **Write it idempotently** (`create … if not exists`, `drop policy if exists`)
  so re-applying is a no-op.
- **Changing a function's return type needs `drop function if exists` first.**
  Postgres refuses to replace a function whose signature changed, and that error
  aborts the entire file — so everything else in it silently never applied.
  Because it never recorded as applied, editing the file in place to add the drop
  is the correct fix.
- Run `npm run gen:types` afterwards and commit the result.

## Security rules that don't bend

- **Never weaken row-level security.** It is the boundary, not a convenience.
  Owner-only tables stay owner-only; shared tables get their access from an
  explicit visibility column.
- **Code that runs as the service role re-enforces the same rule.** Edge
  functions bypass RLS, so every builtin and every loop re-checks ownership and
  visibility in code.
- **No secrets in the frontend.** The anon key is the only key that ships to the
  browser. Provider keys, tokens and passwords live in Supabase Vault and are
  read only by the service role through a named routine.
- **Exfiltration-capable capabilities stay ordinary tool rows** — sending email,
  posting to Slack, reading a secret, calling a remote MCP server. That keeps
  admin activation, per-agent scoping and the webhook tool lock applying to them
  automatically.
- **Untrusted input runs read-only.** Webhooks, Slack and inbound mail get no
  tools unless explicitly allowed, and guardrails screen them first — failing
  closed there, open for interactive chat.
- **User HTML never runs on the app origin.** Artifact HTML renders in an
  opaque-origin sandbox.

## Models

- **Never hardcode a model id.** Features bind to a named profile
  (`orchestrator`, `utility`) and the database row is the source of truth; the
  environment variable is only a fallback. Admins re-point a profile in
  Settings → Models.
- **Don't silently downgrade a model to save cost.** That's the maintainer's
  call, and it's a one-line edit in Settings.
- Model ids are OpenRouter slugs (`provider/model`). Reasoning effort goes
  through the `reasoning` field, tool calls use the OpenAI function-calling
  shape, and responses stream. Don't change those conventions without a reason.

## Frontend conventions

- The sidebar, the ⌘K palette and the feature-flag list all read one config
  (`src/lib/nav.ts`). Add a page there, not in three places.
- Icons are inline SVG in `src/components/icons.tsx` — no icon dependency.
- Layout is responsive: the sidebar is a drawer on small screens and side-by-side
  panels are `md:`-guarded. Don't reintroduce fixed two-column layouts.
- Prefer extending an existing shared component (the add-to-collection bar, the
  visibility control, the artifact frame, the resize handle) over a parallel one.

## Documentation

Docs are part of the change, not a follow-up.

- User-visible behaviour changed → update [docs/features.md](./docs/features.md)
  or the feature's own document.
- How it's built, deployed or operated changed → update
  [docs/architecture.md](./docs/architecture.md) or
  [docs/operations.md](./docs/operations.md).
- A convention changed → update this file and [AGENTS.md](./AGENTS.md).

**Voice:** helpful and plain. Describe *what* something does and why it's there,
not how it's implemented — the code is the implementation. Keep code samples to
one line, or a single command where one is genuinely needed. No walls of
pasted function bodies.

## Gotchas worth knowing

- **Streaming format.** The chat function emits server-sent events and the client
  parses them; change one side and you must change the other.
- **Realtime de-dupe.** Optimistic inserts and their realtime echo both arrive —
  track seen ids or rows render twice.
- **Auth redirects.** Magic links use the project's Site URL and redirect
  allowlist. If they point at localhost, that's where your users end up.
- **Function URLs and HTML.** Supabase rewrites `text/html` to `text/plain` on
  `*.supabase.co` function URLs, so the app's own `/p/:slug` route is what links
  to standalone pages, not the raw function.
- **`verify_jwt` comes from `supabase/config.toml`**, not from the deploy command.
  Public functions gate on a token or a signature in code instead.
- **Edge secrets can't use the reserved `SUPABASE_` prefix** — that's why the
  Forge token is `FORGE_PAT`.
- **Excalidraw** is large and lazy-loaded, and needs its `process.env` define in
  the Vite config or the bundle throws at runtime.
- **Fresh Supabase projects** can lag a few seconds on the storage schema; if the
  first migration fails there, re-run it.
