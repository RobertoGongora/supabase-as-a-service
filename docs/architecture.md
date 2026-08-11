# Architecture

The shape of the system, and the handful of ideas the whole thing is built on.
For *what each feature does*, see [features.md](./features.md). For running and
deploying it, see [operations.md](./operations.md).

## The shape

```
Browser ──▶ React SPA (Vite + Tailwind + React Router)
                │  anon key + a signed-in session
                ▼
            Supabase
              • Postgres + row-level security  — the security boundary
              • Auth · Realtime · Storage
              • Edge Functions (Deno)          — everything that needs a secret
                    │
                    ▼
              OpenRouter (any model)  ·  Slack · email · external MCP servers
                    │
                    ▼
            Capability workers (Docker) — heavy libraries, off the request path
```

The browser talks straight to Postgres for ordinary reads and writes. Anything
that needs a secret, a privileged identity, or a long-running job goes through an
edge function.

## Five ideas that explain most of the code

**1. Row-level security is the boundary.** The browser holds only the anon key,
which is public by design. Every table has policies; a user sees a row because
Postgres says so, never because the UI hid a button. Edge functions that run as
the service role bypass RLS, so they re-check the same rule in code.

**2. Four visibility levels, used consistently.** Most content tables use
`private` (owner + admins) or `workspace` (every member reads *and* collaborates).
Shareable things — artifacts, files — add `unlisted` (anyone with the link) and
`public`. Personal areas (conversations, memory) are owner-only on purpose.

**3. Configuration as data.** Tools, prompts, skills, agents, guardrails,
listeners, schedules, dashboard widgets and evals are **rows**, not code. Adding a
capability is inserting a row, so a workspace extends itself without a fork or a
redeploy. Forge is the escape hatch when a row isn't enough: it generates and
deploys a real function, then registers it as a tool row like any other.

**4. One agent loop, six front doors.** Chat, the scheduler, webhooks, Slack,
event dispatch and loops all run the same model → tool-call → result → model
cycle over the same shared modules: system-prompt assembly, tool loading and
dispatch, guardrails, collection context, user memory, the workspace clock, and
usage recording. A capability added to the shared layer shows up in all six.

**5. Pure logic lives in modules, not components.** Parsing, validation,
matching, formatting and scheduling maths are extracted into small modules with
unit tests; components and handlers stay thin. That is why the test suites are
fast and why a behaviour change is usually a test change first.

## Trust boundaries

| Boundary | Rule |
| --- | --- |
| Browser | Anon key + user session only. No provider keys, ever. |
| Edge functions | Hold the OpenRouter key, the service role, and Vault-read access. |
| Vault | Provider keys, MCP tokens, mailbox passwords and team secrets live only in Supabase Vault, reachable by the service role through a named RPC. |
| Untrusted input | Webhooks, Slack and inbound mail are outside input. Their agents run **read-only unless explicitly allowed tools**, and guardrails screen them first. |
| Generated code | Forge functions get no database or secret access — compute and `fetch` only — and are lint-screened before deploy. |
| Sandboxed HTML | Artifact HTML renders in an opaque-origin iframe, so it never runs on the app origin where a session lives. |

Guardrails **fail closed** for webhooks and Slack (an evaluator error blocks the
run) and **fail open** for interactive chat (an error lets your message through).

## The agent loops

| Loop | Front door | Runs as |
| --- | --- | --- |
| `chat` | The Chat page and every in-app chat panel | The signed-in user |
| `scheduler` | A cron tick against `schedules` | The schedule's owner |
| `webhook` | A public URL with an opaque token | The webhook's owner |
| `slack-events` | Slack's Events API, HMAC-verified | The channel binding's creator |
| `event-dispatch` | A cron tick over unprocessed `events` | The listener's owner |
| `loop` | A goal-directed run with a budget and a rubric | The run's trigger |

Every loop injects the workspace's local date and time, loads the always-on
prompts, and records tokens and cost per call. Chat and the scheduler also inject
the caller's personal memory; the outward-facing loops deliberately do not, so
personal context can't leak into a reply to an outsider.

## Retrieval

Uploaded PDFs are chunked and embedded in-edge (free, no external embedding
bill) and stored in pgvector. Search fuses two signals — semantic similarity and
Postgres full-text — so exact names, IDs and rare terms are found alongside
paraphrases. Passages come back labelled with their source document and recency,
and an always-on prompt teaches the assistant to cite them and to say plainly
when the knowledge base holds nothing on the topic.

Collections take the other approach: a collection's content is injected whole as
primary context, budgeted against the live model's context window, with a meter
in the UI so you can see the fit before you send.

## Where things live

```
src/
  pages/            One page per feature area (+ pages/settings/* for config)
  components/       App shell, markdown, artifact frame, sharing controls, icons
  contexts/         Auth provider
  lib/              Supabase client, pure logic modules, and their unit tests
supabase/
  migrations/       The schema. Numbered, forward-only, the source of truth.
  functions/        Edge functions, one folder each
  functions/_shared/  The shared agent layer every loop imports
  functions/tests/  Deno unit tests for the shared modules
workers/            Capability workers (separate npm workspace)
control-plane/      Hosted-offering provisioning (separate npm workspace)
infra/              Docker Compose + per-provider deploy config
skills/             Skill documents seeded into the workspace
docs/               This documentation
```

The database types in `src/lib/database.types.ts` are generated from the live
schema — regenerate them after a migration rather than editing by hand.
