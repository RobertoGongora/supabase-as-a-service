# Running and deploying

Everything about getting the workspace live and keeping it there. For the first
deploy, [DEPLOY.md](../DEPLOY.md) is the short version; this is the reference.

## The three moving parts

| Part | Lives on | Goes live when |
| --- | --- | --- |
| Frontend (Vite build) | Any static host; Railway is wired up | Push to `main` (host rebuilds) |
| Database schema | Your Supabase project | A migration lands on `main` |
| Edge functions | Your Supabase project | A function changes on `main` |

Capability workers are optional Docker services and deploy on their own
schedule; the app works fully without them.

## Environment and secrets

| Where | Name | Notes |
| --- | --- | --- |
| Frontend, build time | `VITE_SUPABASE_URL` | Inlined into the bundle |
| Frontend, build time | `VITE_SUPABASE_ANON_KEY` | Public by design — RLS protects the data |
| Edge secret | `OPENROUTER_API_KEY` | Required. Server-side only |
| Edge secret | `OPENROUTER_MODEL` | Optional fallback slug when a model profile can't be read |
| Edge secret | `OPENROUTER_EFFORT` | Optional reasoning effort: `low`, `medium`, `high` |
| Edge secret | `OPENROUTER_SITE_URL`, `OPENROUTER_APP_NAME` | Optional OpenRouter ranking headers |
| Edge secret | `FORGE_PAT` | Optional. Enables in-app function deploys; the project ref is derived from the Supabase URL |

`VITE_*` values are read at **build time** — set them before the build runs, and
redeploy if you add them later. Everything else that looks like a credential —
email keys, Slack tokens, MCP tokens, mailbox passwords, team secrets — lives in
Supabase Vault and is written through admin-gated database routines, never as a
table column and never in a client payload.

Provider secrets cannot use the reserved `SUPABASE_` prefix, which is why the
Forge token is named `FORGE_PAT`.

## Continuous delivery

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `test.yml` | Every PR and push to `main` | Lint, build, frontend tests, edge tests |
| `deploy-functions.yml` | Function changes on `main` | Deploys the repo's edge functions |
| `deploy-migrations.yml` | Migration changes on `main` | Applies pending migrations, then re-schedules the automation cron jobs |
| `deploy-workers.yml` | Worker changes | Builds both worker images; deploys them when a Railway token is set |
| `release-tenants.yml` | Push to `release` | Fans migrations and functions out to every live tenant |
| `claude-feature.yml` | An approved feature card | Builds the feature on a branch and opens a PR |
| `sync-docs.yml` | Merge to `main` | Mirrors user-visible changes into the public docs site |

**Repository secrets.** `SUPABASE_ACCESS_TOKEN` (a Supabase personal access
token) covers function deploys and the tenant fan-out. `SUPABASE_DB_PASSWORD` is
additionally required for migrations, because applying them connects straight to
Postgres. The project ref is not a secret — it defaults in the workflows and is
overridable with a `SUPABASE_PROJECT_REF` repository variable.

After the one-time setup you should not need to run `supabase` commands by hand.

## Migrations

The schema lives in `supabase/migrations/` as numbered SQL files and is the
single source of truth: a fresh project becomes a working backend with one push,
and from then on CI applies what's pending.

Three rules matter:

1. **Unique, contiguous number prefixes.** The version comes from the prefix, so
   two files sharing a number stop the push dead. A unit test guards this, but it
   can only see files that are already on `main` — **re-check the next free
   number right before you push**, not when you created the file.
2. **Write it idempotently** where practical (`create … if not exists`,
   `drop policy if exists`), so re-applying against a partially-migrated
   workspace is a no-op.
3. **Changing a function's return type needs a `drop function if exists` first.**
   Postgres refuses to replace a function whose signature changed, and that error
   aborts the whole push — which means everything else in that file silently
   never applied. Editing the file to add the drop is the correct fix, precisely
   because it never recorded as applied.

After a schema change, regenerate the typed client with `npm run gen:types`.

## Scheduled work

Recurring work — the agent scheduler, event dispatch, PDF ingestion and mailbox
polling — is driven by database cron jobs. They are (re)scheduled automatically
after every migration run, so a new deployment schedules its own automation with
no manual step. The Listeners page shows a health banner for admins if the jobs
aren't running.

## Multi-tenant fan-out

One repo can serve many tenant workspaces, each with its own Supabase project and
frontend. Pushing to `main` only ever touches the origin project; merging `main`
into `release` fans the same migrations and functions out to every live tenant,
using a single org-owner token — nothing per-tenant to configure. The tenant list
comes from the control plane's own registry; a canary file can pin a rollout to
one project first.

**Never commit directly to `release`.** It only ever receives changes by merging
`main` into it. A commit authored on `release` makes the branches diverge and
turns the next merge into a conflict.

## Deploying edge functions without CI

If you can't push — or a function needs redeploying right now — an admin can do
it from **Forge → Deploy maintenance**: *Update core functions* redeploys the
repo's functions from the source bundled into the app at build time, and
*Redeploy forged functions* re-pushes every generated function's stored source
(the only path for those, since they live in the database rather than git).

Both need the Forge token on the project. On managed tenants, where functions are
deployed for you by the release fan-out, the panel simply says so instead of
offering buttons that can't work.

## Auth redirects

Confirmation and magic-link emails use the Supabase project's **Site URL** and
its redirect allowlist. Set both to your deployed origin, or links will send
people to `localhost`.

## Local development

```bash
npm install && npm run dev        # http://localhost:5173
```

Point `.env.local` at your own Supabase project (copy `.env.example`). Capability
workers run locally with the Docker Compose file under `infra/`. Edge functions
run against the linked project; the Deno test suite covers their shared logic
without needing a deploy.
