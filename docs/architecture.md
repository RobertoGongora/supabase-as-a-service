# Architecture

What the system is made of, and the handful of ideas that explain most of its
decisions. This is a map, not a walkthrough — each feature area has its own page
(see the [docs index](./README.md)).

## The shape of it

```
Browser (React SPA) → Supabase (Postgres + RLS · Auth · Realtime · Storage · Edge Functions) → OpenRouter
```

- **The browser** holds a session and the Supabase anon key. It reads and writes
  tables directly; Postgres decides what it is allowed to see.
- **Supabase** is the whole backend: the database and its access rules, sign-in,
  file storage, live updates over websockets, and the Deno edge functions that do
  anything the browser must not (talk to a model, hold a credential, act on behalf
  of an external caller).
- **OpenRouter** is the single door to every model. Nothing in the codebase names a
  model; features ask for a *profile* and an admin decides what answers.

Two optional pieces run outside that loop:

- **Capability workers** (`workers/`) — Docker services that pick heavy jobs off a
  queue (documents, audio/video). See [capability workers](./capability-workers.md).
- **Control plane** (`control-plane/`) — the hosted-offering backend that provisions
  one workspace per customer.

## Four ideas that explain the rest

**1. Row-level security is the security boundary.** The anon key is public by
design. Every table states who may read and write each row, so a leaked key, a
crafted query, or a bug in the UI still cannot reach another team's data. When an
edge function runs with the service role (which bypasses RLS) it re-checks the same
rule in code before it answers.

**2. Configuration is data.** Tools, agents, prompts, guardrails, listeners,
dashboard widgets and model choices are rows, not code. That is why the workspace
can gain a capability without a deploy — and why an AI can extend it: adding a tool
is inserting a row.

**3. One assistant, many doorways.** Chat, scheduled runs, webhooks, Slack, event
listeners and evals all run the same model→tool→model loop with the same shared
context, tools and guardrails. A capability added for chat shows up everywhere.

**4. Everything is shareable on purpose.** Each item carries a visibility:
`private` (you, plus admins), `workspace` (everyone signed in), `unlisted` (anyone
with the link), `public` (open to the world). Nothing becomes visible by accident;
sharing is always an explicit choice on the row.

## Where things live

| Layer | Path | Responsibility |
| --- | --- | --- |
| App shell, pages, components | `src/` | Everything a signed-in person sees |
| Pure browser logic | `src/lib/` | Parsing, validation, formatting — unit-tested |
| Database schema and access rules | `supabase/migrations/` | The source of truth for structure and permissions |
| Server capabilities | `supabase/functions/` | Chat, webhooks, scheduler, MCP, ingest, and friends |
| Shared server logic | `supabase/functions/_shared/` | Reused by every function; the pure parts are unit-tested |
| Heavy jobs | `workers/` | Separate npm workspace, its own images |
| Hosted provisioning | `control-plane/` | Separate npm workspace |

## The data model at a glance

Grouped by what they are for, rather than listed alphabetically:

- **People** — `profiles`, `allowed_emails`, `invite_links`, `mcp_tokens`.
- **Conversation** — `conversations`, `messages`, `message_feedback`.
- **Things you make** — `artifacts`, `files`, `todos`, `links`, `whiteboards`,
  `card_boards`, `terminology`, `user_memories`, `user_tables` (plus the real
  `ut_*` tables it registers), `dashboard_widgets`.
- **Grouping** — `collections` and one join table per item type, so any kind of
  content can be filed into a named set you chat with.
- **Knowledge** — `documents`, `document_chunks` (semantic + keyword search).
- **Capability** — `tools`, `agents`, `skills`, `guardrails`, `model_profiles`,
  `mcp_servers`, `forged_functions`, `vault_secrets`.
- **Automation** — `schedules`, `webhooks`, `events`, `event_listeners`, `loops`,
  `agent_jobs`, `inbox_messages`, `email_accounts`, `table_forms`.
- **Insight** — `activity_log`, `usage_events`, `agent_runs`, `security_scans`,
  `eval_suites` and their runs.
- **Workspace config** — `feature_flags`, `workspace_settings`, `integrations`.

## Access rules in practice

- **Owner-only** (`conversations`, `messages`, `files`, `profiles`,
  `user_memories`, `dashboard_widgets`): personal by nature, never shared.
- **Private or workspace** (`todos`, `links`, `collections`, `user_tables`,
  `whiteboards`, `card_boards`, `terminology`, `inbox_messages`, `vault_secrets`):
  the owner and admins, or the whole team, collaboratively.
- **Also unlisted or public** (`artifacts`, `files`): the two things you hand to
  someone outside the workspace.
- **Admin-managed** (`tools`, `guardrails`, `model_profiles`, `feature_flags`,
  `workspace_settings`, always-on prompts): everyone reads, admins write.
- **Own-or-admin reads, server-only writes** (`activity_log`, `usage_events`,
  `agent_runs`, `security_findings`): audit trails you can read but not forge.

The first person to sign up becomes the admin. After that, signup is invite-only —
by allowlisted email or by a shareable link — and the database enforces it, not the
UI.

## Choosing models

Two seeded profiles cover everything:

- **`orchestrator`** — the main brain: chat, agents, webhooks, scheduled runs.
- **`utility`** — cheap and fast: guardrails, classification, summaries.

Features bind to the profile key, so re-pointing a profile in **Settings → Models**
changes what every one of them uses. Model ids are OpenRouter slugs
(`provider/model`), and the environment variable is only a fallback for when the
row cannot be read.

## Keeping it honest

Logic that can be wrong lives in a pure module with tests beside it, not inside a
component or request handler — `src/lib/*.ts` for the browser,
`supabase/functions/_shared/*.ts` for the server. That is why parsing, validation,
scheduling math and formatting are all testable without a database or a model.
See [CLAUDE.md](../CLAUDE.md) for the conventions that go with it.
