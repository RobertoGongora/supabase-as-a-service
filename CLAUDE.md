# CLAUDE.md

The engineering map of this repository: what each part of the system is, what it gives
the people using it, and where to find it. It describes **what**, not how — the code is
the how.

- Working conventions (branches, commits, tests, migrations, doc style) live in
  [AGENTS.md](./AGENTS.md). Read that before your first commit.
- Every other document is listed in [docs/README.md](./docs/README.md).
- Keep this file current with the change that makes it true. It is the source the
  public docs site syncs from, so a feature that isn't described here tends to stay
  undocumented everywhere.

## What this is

A team workspace — an "intranet" — that a small business can own outright: a shared AI
assistant that knows the business from its own documents, content people and agents
both create and share, and automations that keep running when nobody is watching.

Supabase does the boring, solid parts (Postgres, Auth, Realtime, Storage, Edge
Functions). A React SPA sits on top. Models are reached through OpenRouter, so any
model is one admin setting away. The browser holds only the Supabase anon key;
Postgres row-level security is what protects data.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies. |
| `npm run dev` | Vite dev server on http://localhost:5173. |
| `npm run build` | Typecheck the whole app and build it. Run before pushing. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | Types only, no build. |
| `npm test` | Frontend unit tests (vitest). |
| `npm run test:deno` | Edge-function unit tests (deno test). |
| `npm run gen:types` | Regenerate `src/lib/database.types.ts` from the linked project. |
| `npm run start` | Serve the production build with SPA fallback. |

## The shape of the system

Four ideas explain most of the codebase:

- **The database is the API.** The SPA reads and writes Postgres directly under
  row-level security, and subscribes to realtime channels so views stay live. There is
  no bespoke backend for CRUD.
- **Edge functions hold the secrets.** Anything that needs a provider key, another
  user's data, or a model call runs server-side with the service role — and
  re-enforces the same access rules in code, because the service role bypasses RLS.
- **Capability is configuration.** Tools, skills, agents, guardrails, listeners,
  dashboard widgets and model choices are rows. A customer extends the workspace by
  adding rows, not by forking the code.
- **One assistant, six loops.** Chat, the scheduler, webhooks, Slack, the event
  dispatcher and loops all run the same model→tool→model cycle over the same toolset,
  so a capability added once is available everywhere.

## Feature map

Each entry: what it is, what it gives someone, and where it lives.

### Every day

**Home** (`/home`) — the landing dashboard. An Overview tab with quick actions, stat
tiles, a 14-day activity trend, a live recent-activity feed and your open to-dos; an
Explore tab that indexes every feature and backs the ⌘K palette. Users compose their
own tiles: a widget is a saved `{kind, source, spec}` row rendered by querying an
allow-listed source under the viewer's own RLS, so a widget can never read someone
else's rows. Ask the assistant for a widget in plain language and it creates one.
*`src/pages/HomePage.tsx`, `src/lib/dashboard.ts`, `src/lib/widgets.ts`.*

**Chat** (`/chat`) — the assistant. Replies stream in, persist to Postgres and sync
across devices. You can attach files (images, PDFs and text are read), open an
artifact in a side panel and evolve it in place, scope the conversation to
collections, and run a skill by typing `/`. The reply is finished server-side, so
reloading or navigating away mid-answer no longer loses it, while **Stop** genuinely
cancels the run and saves nothing. A thread can be shared with other members: in a
shared thread people talk to each other and the assistant only answers when a message
contains `@ai`, so team threads cost nothing until summoned.
*`src/pages/ChatPage.tsx`, `supabase/functions/chat/`.*

**Inbox** (`/inbox`) — one list for messages from anywhere: email, Slack, WhatsApp,
scripts, manual notes. Filter by source, mark read, file messages into collections.
Mail arrives either by provider inbound-parse or from IMAP mailboxes the workspace
polls; every arrival raises an event, so a listener can route it. See
[docs/events-and-inbox.md](./docs/events-and-inbox.md).

### Assets

**Collections** (`/collections`) — named groups you can chat with. A collection tags
artifacts, files, to-dos, links, tables, whiteboards, card boards, messages and
terminology, and each type has an "add to collection" bar on its own page. Scope a
chat to one or several and the collection's documents, files, tasks, links, tables and
boards become the assistant's primary context, budgeted against the model's real
context window (the page and the chat picker show how much of the window a collection
would fill). Collections are also an ingestion target: an outside Claude can push
notes, transcripts or articles straight into one.

**Files** (`/files`) — private per-user storage. Share a file with a signed link
scoped to an hour, a day or a week, or **publish** it to a stable public URL that is
safe to embed in a shared page. Select several and share them in one action. Uploaded
PDFs are indexed into the knowledge base automatically. The assistant can create files
too, which is how it hands back binary output it generated.

**Knowledge base** — text extracted from uploaded PDFs, chunked and embedded in
pgvector. Documents are **workspace knowledge by default**, so any member's chat can
search them and cite the source; an owner can flip one to "Only me". Search fuses
semantic and keyword matching so exact names and IDs are found alongside paraphrases,
labels each passage with its document and recency, and says plainly when nothing is
indexed on a topic. An always-on prompt teaches the assistant to answer from those
passages with citations rather than filling gaps from training.
*`supabase/functions/ingest/`, `supabase/functions/_shared/retrieval.ts`.*

**Tables** (`/tables`) — a spreadsheet-style area backed by **real Postgres tables**,
created by hand or by describing what you want. Every structural change goes through
validated database functions, so no browser ever runs DDL. A table is private (owner
and admins) or shared with the workspace. A table can also accept **public
submissions**: pick the columns a form may write, hand out the snippet, and anonymous
visitors can submit into it without the underlying table ever being exposed.
*`src/pages/TablesPage.tsx`, `src/lib/forms.ts`.*

**Artifacts** (`/artifacts`) — documents, code, HTML and text with live preview.
Share one privately, with the workspace, by unlisted link, or publicly, and optionally
require a password before a visitor sees it (the row is hidden until the password
checks out — it is not client-side theatre). HTML artifacts get a clean full-page URL
of their own and can be **interactive**: a tracker or checklist saves its state, and
the assistant can read and revise it in place. Images can be pasted or dropped into
the body. Deleting archives by default and the Trash panel restores; permanent removal
is a separate, explicit action. Artifacts also have a
[REST API](./docs/artifacts-api.md) so scripts and automations can push them.
*`src/pages/ArtifactsPage.tsx`, `ArtifactEditorPage.tsx`, `src/components/ArtifactFrame.tsx`.*

**To-dos** (`/todos`) — tasks with due dates, notes and drag-to-reorder, private or
shared with the workspace, filed into collections so a collection you chat with
carries its tasks alongside its documents. Also available over
[REST](./docs/todos-api.md) and to the assistant.

**Links** (`/links`) — shared bookmarks. Paste a URL and the title, description,
preview image and favicon fill themselves in; a screenshot can be attached. Private or
workspace-shared, filed into collections.

**Whiteboards** (`/whiteboards`) — Excalidraw canvases for planning, with live
multiplayer cursors and scenes. The assistant can read a board as text and draw on it,
so "draw me a flowchart" and "what's on the board?" both work.

**Cards** (`/cards`) — a free-form card wall, deliberately not a Kanban: dump cards
and drag them anywhere, position is the ranking. Multiplayer like whiteboards, with a
persistent chat panel per board so "add cards for X" fills the canvas live.

**Memory** (`/memory`) — the assistant's durable notes about you: your name,
defaults, tone, stack, ongoing projects. Owner-only by design, so one person's memory
never leaks into another's context, and injected into chat and scheduled runs so a
fresh conversation starts warm. You can read, edit, pin and forget entries; the
assistant writes here too, guided by an always-on prompt about what is worth keeping.

**Meeting Notes** (`/meeting-notes`) — record a meeting in the browser, get a live
transcript, chat with it while it runs, and save the result as an artifact. Needs a
workspace secret named `OPENAI_KEY` for transcription; the page says so up front when
it is missing. Saving raises a meeting event, so "when a meeting is recorded, run this
agent" is a listener away.

**Terminology** (`/terminology`) — a shared glossary of the words your business uses.
Private or workspace-wide, filed into collections so agents read domain language in
context.

**Skills** (`/skills`) — two kinds of prompt in one place. **Always-on** prompts are
admin-managed and shape every chat (this is where "we are Acme, here's how we talk"
lives). **On-demand** skills are personal: typing `/` in chat arms one, prefilling the
composer so you can add context before running it. Skills can be imported from a
GitHub URL, and the page shows how often each has been used.

### Automation

**Agents** (`/agents`) — a deployable unit: a name, instructions, the tools it may
use, and the collections it works from. Chat with one, point a webhook at one, or give
it a schedule. Cadence is either a simple interval or a cron expression evaluated in a
timezone, with a plain-English description and a next-runs preview while you type.
Each agent has a **runs** view showing what an unattended invocation actually did,
step by step — the answer to "why did the 6am agent do that?".
*`src/pages/AgentsPage.tsx`, `AgentDetailPage.tsx`, `supabase/functions/scheduler/`.*

**Events & Listeners** (`/events`, `/listeners`) — the automation substrate. Every
meaningful change raises an event (an artifact created, a file added to a collection, a
message received, a to-do completed…). A listener is a rule: match an event type and
some filters, then run an agent, call one tool with no model involved, file the item
into a collection, or just log the match while you test. Events are a machine stream,
kept separate from the human activity feed on purpose. See
[docs/events-and-inbox.md](./docs/events-and-inbox.md).

**Loops** (`/loops`) — goal-directed runs that improve on measured feedback. Give a
loop a goal, a way to score a candidate (a scoring tool or a rubric judged by a cheap
model), an iteration cap and a **dollar budget**, and it iterates until it converges,
hits the target, runs out of iterations, or reaches the cap — keeping the best result.
The budget uses real per-call cost, so it's a true ceiling. An external Claude can
start a loop and poll it like a long-running job.

**Tools** (`/tools`) — what the assistant can actually do, as data. Built-in tools
cover the workspace itself (artifacts, files, to-dos, links, tables, memory,
whiteboards, cards, terminology, messages, secrets, email, search, jobs, and the build
tools that create agents/tools/skills/webhooks). Custom **HTTP tools** point at any
URL. A **web** tool switches on model-side web search. Remote MCP servers appear as
one handle each. Any tool can also be run **directly, with no model in the loop** —
one call or a short chain — from the UI, a script, a cron job or a Zap.
*`supabase/functions/_shared/builtins.ts`, `supabase/functions/run-tool/`.*

**Forge** (`/forge`, admin) — describe a capability in plain language and get a
deployed edge function registered as a tool. For deterministic work a model shouldn't
be guessing at: a calculator, a converter, a precise transform, a validate-then-call
API. Generated code gets no database or secret access, is screened before deploy, and
fails closed on anything suspicious. The same page can redeploy the repo's core
functions when you can't push. *`supabase/functions/forge/`.*

### Connections

**Webhooks** (`/webhooks`) — a public URL that turns an inbound POST into work. Three
modes, in order of precedence: call one tool **directly** (no model, the payload is
validated against the tool's schema — this is the deterministic "function node"), run
an **agent**, or run a bare **prompt**. Inbound runs are read-only unless the webhook
explicitly allows tools, and a webhook can require a shared secret on top of its
unguessable URL. Every delivery is logged live.

**REST APIs** (`/api`) — plain `curl` surfaces for systems that don't speak MCP:
artifacts, to-dos, direct tool runs and message ingestion. All authenticate with a
personal token from Settings → Connect Claude, and the in-app API page renders
paste-ready examples with your token filled in. Full reference:
[artifacts](./docs/artifacts-api.md), [to-dos](./docs/todos-api.md).

**MCP server** — connect Claude Code or Claude Desktop to the workspace and build in
it from outside: create agents, tools, skills, webhooks, artifacts, collections,
whiteboards, jobs, evals and loops. Every call runs as the token's owner. Connect with
a personal token, or by pasting the URL into Claude's custom-connector flow and
approving — see [docs/mcp-oauth.md](./docs/mcp-oauth.md). Internal builtins and MCP
tools share one implementation, so both paths behave identically.

**External MCP servers** (Settings → External MCP, admin) — the workspace as a
client. Connect any number of remote MCP endpoints (Zapier in front of Gmail and
Calendar, a Playwright browser, anything else); their tools appear to the assistant and
agents like any other tool, and are re-exposed through the workspace's own MCP server
so a desktop Claude gets one unified endpoint. See
[docs/playwright-mcp.md](./docs/playwright-mcp.md).

**Slack** — bind a channel to collections (and optionally an agent) and the bot
answers `@mentions` in that room with that room's context. A channel can instead be
**ambient**: the bot reads along, a cheap model decides whether it's worth chiming in,
and it stays quiet by default. Agents can also post proactively into a channel. Setup
and the app manifest: [docs/slack.md](./docs/slack.md).

**Email** — agents send and check mail once an admin configures a provider. Sending is
rate-limited with an optional recipient allowlist and logged per send. Incoming mail
arrives by provider inbound-parse or from a polled IMAP mailbox and lands in the Inbox.
Provider keys live in Vault.

### Insights

**Activity** (`/activity`) — the live human feed: tool calls, uploads, artifacts,
webhook deliveries, guardrail decisions. You see your own rows; admins see everything.

**Usage** (`/usage`, admin) — what the AI costs. Every model call records its tokens
and price; the page shows totals, a daily chart, and breakdowns by model, context and
user, alongside the live OpenRouter balance.

**Feedback** (`/feedback`, admin) — thumbs up/down on assistant replies, with an
optional category and note, summarised over a time range. Each rating captures what
produced the answer, so feedback can be attributed to a model, skill or agent rather
than being a bare like count.

**Features** (`/features`) — the self-improvement board. Anyone files an idea; an
admin dragging it to **approved** opens a GitHub issue that an AI action builds on a
branch, and dragging the finished card to **ready** merges the pull request. The two
lane moves are the human approvals — one to spend AI effort, one to ship — and code
never reaches `main` without that review.

### Governance

**Guardrails** (`/guardrails`, admin) — pre-flight checks run by a cheap model
*before* the main model sees a request: does this payload try to redirect the agent,
does this message carry secrets. The verdict comes back as data and is enforced in
code — block or flag — never pasted into the prompt as advice. Webhook and Slack
traffic fails **closed** (an evaluator error blocks the run); chat fails **open**.

**Security** (`/security`, admin) — a repeatable posture scan over configuration, not
model opinion: webhooks without secrets, tool-enabled inbound webhooks, missing
blocking guardrails, unrestricted email recipients, workspace-scoped secrets, stale
tokens, public artifacts, single-admin bus factor. Findings keep their status across
runs, so an accepted risk stops nagging, and any finding can be promoted onto the
Features board to be fixed.

**Evals** (`/evals`, admin) — measure the assistant instead of guessing. A suite of
cases scores answers against a reference or rubric, and can assert **what the
assistant did**: which tools it called, with which arguments, how often, and which
tools it must never call. Runs are sandboxed by default — read-only tools execute,
everything with a side effect is captured but not run — so a suite is safe to re-run
across several models on a schedule. A suite can be grounded in a collection to test
"does it answer correctly from *this* knowledge".

**Secrets** (`/vault`, admin) — named credentials the team and the assistant can use.
Values live only in Supabase Vault, never in a table column or a log. A secret is
shared with the workspace or kept private. The assistant can list names for discovery
and fetch one value by name; every read is logged, because handing a credential to a
conversation is as sensitive as sending mail.

### Settings

One page per area under `/settings`. **Profile** and **Connect Claude** are for
everyone; the rest are admin: **Models** (which model each job slot uses),
**Timezone** (the clock unattended automations treat as local), **Email**, **Slack**,
**External MCP**, **Invite people** (invite by email or shareable link; disable,
re-enable or remove a member), and **Feature flags**.

Feature flags are feature *hiding*, not permissions: turning one off removes an area
from the sidebar and the palette workspace-wide, live, for teams that don't use it.
RLS still protects the data, and core pages can never be hidden. The sidebar, the ⌘K
palette and the flags page all read one config (`src/lib/nav.ts`), so they can't drift.

### Behind the app

**Capability workers** — heavy libraries run as containers, not in-process. The
assistant queues a durable job, a worker claims it, does the work (Office documents via
LibreOffice, audio and video via ffmpeg) and returns file references. Jobs retry,
survive a crashed worker, and never move large binaries through a prompt. The runtime
depends only on Postgres, Storage and environment variables, so it runs anywhere
containers do. See [docs/capability-workers.md](./docs/capability-workers.md) and
[workers/](./workers/README.md).

**Control plane** — the hosted offering: sign up, get a dedicated workspace
(its own Supabase project, frontend service, model key and subdomain). It is a separate
package with its own tests. See [control-plane/](./control-plane/README.md).

## How the AI layer is assembled

Every loop builds its system prompt the same way, from data rather than code: the
always-on prompts, the workspace's current local time, the caller's memory (chat and
scheduled runs only — externally-facing loops never auto-inject personal memory), the
collections in scope, and then the agent's instructions or an invoked skill.

Models resolve through **profiles**, never a hardcoded id: `orchestrator` is the main
brain, `utility` is the cheap fast model used for guardrails, judging, summaries and
participation decisions. An admin re-points a profile in Settings → Models and every
feature follows. Model ids are OpenRouter slugs, tool calls use the OpenAI
function-calling shape, and reasoning effort is a request field.

A tool reaches the model only after passing every gate: it must be active, within the
agent's allowed tools, permitted for that webhook or Slack binding, and past the
guardrail pre-flight. Direct tool runs skip the model entirely, so validation and
activation are the gate there.

## Security model

Row-level security is the boundary — never weaken a policy to make a feature easier.

- **Owner-only** by default: conversations, messages, files, profiles, memory.
- **Private or workspace** for shared content: collections, tables, to-dos, links,
  whiteboards, card boards, terminology, inbox messages. Workspace means every member
  can read *and* collaborate.
- **Unlisted or public** adds anonymous read for artifacts, which is how a share link
  works. A share password hides the row entirely until the password checks out.
- **Storage**: the `files` bucket is private and scoped per user; `artifact-images` and
  `public-files` are public on purpose, because their URLs are baked into content that
  must load for anonymous visitors. Screenshots stay private.
- **Invite-only signup**: the first user becomes admin; after that a database guard
  rejects any signup that an admin hasn't allowed, by email or through a shareable
  invite link.
- **Secrets** live in edge-function secrets or Supabase Vault. The browser only ever
  holds the anon key.
- **Service-role code re-checks access.** Edge functions bypass RLS, so every builtin
  and function re-enforces ownership, visibility and admin status in code.

## Where things live

```
src/
  App.tsx                  Routes. Public: /login, /join/:token, /share/a/:slug, /p/:slug
  contexts/AuthContext.tsx Session, sign in/up/out
  components/              Layout and nav, markdown, artifact frame, sharing controls, icons
  pages/                   One page per feature area; settings/ holds the Settings section
  lib/                     Supabase client, chat streaming, nav config, and the pure
                           helpers each feature's logic lives in (with sibling tests)
supabase/
  migrations/              Numbered SQL — the schema, RLS, seeded tools and prompts
  functions/               Edge functions: chat, webhook, scheduler, event-dispatch, loop,
                           slack-events, mcp, mcp-oauth, forge, evals, ingest, run-tool,
                           artifacts, todos, p, form-submit, email-*, imap-test, transcribe…
  functions/_shared/       Everything two loops would otherwise duplicate: the model client,
                           builtins, collections context, guardrails, retrieval, timezone…
  functions/tests/         Deno unit tests for those shared modules
workers/                   Capability workers (separate npm workspace)
control-plane/             Hosted provisioning engine (separate npm workspace)
infra/                     Local compose file and deployment config
skills/                    Skill files seeded into the workspace
docs/                      Area documentation — see docs/README.md
```

## Environment & secrets

| Scope | Variable | Notes |
| --- | --- | --- |
| Frontend (build time) | `VITE_SUPABASE_URL` | Inlined into the bundle. |
| Frontend (build time) | `VITE_SUPABASE_ANON_KEY` | Public by design; RLS protects the data. |
| Edge secret | `OPENROUTER_API_KEY` | Required. Never in the repo or the bundle. |
| Edge secret | `OPENROUTER_MODEL` / `OPENROUTER_EFFORT` | Optional fallbacks when a model profile can't be read. |
| Edge secret | `OPENROUTER_SITE_URL` / `OPENROUTER_APP_NAME` | Optional OpenRouter ranking headers. |
| Edge secret | `FORGE_PAT` | Optional. Enables in-app function deploys. |
| Workspace secret | `OPENAI_KEY` | Optional. Enables meeting transcription. |

`VITE_*` variables are read at build time, so they must exist before `npm run build`.

## Deploying

Landing on `main` updates everything: the frontend rebuilds, and CI deploys changed
edge functions and applies pending migrations. Tenant projects are updated by the
release fan-out, which reads the live tenant list and applies migrations and functions
to each one. [DEPLOY.md](./DEPLOY.md) has the first-time setup.

## Gotchas

- **Streaming has two sides.** The chat function emits server-sent events and the
  client parses them; change one and you change both.
- **Artifact HTML runs in a sandboxed frame**, never on the app origin where a visitor
  holds a session.
- **Supabase rewrites HTML served from `*.supabase.co` function URLs** to plain text,
  so the app's own `/p/:slug` route is what shares a rendered page, not the raw
  function URL.
- **Auth redirects** follow the Supabase project's Site URL and redirect allowlist. Set
  them to the deployed origin or magic links land on localhost.
- **Mobile matters.** The sidebar is a drawer and editors stack; don't reintroduce
  fixed side-by-side panels without a breakpoint guard.
- **A brand-new Supabase project's storage schema can lag** a few seconds; if the first
  migration fails on buckets, apply the core tables first and re-run.
- **Migration numbering has bitten this repo repeatedly.** The rules, and the rest of
  the working conventions, are in [AGENTS.md](./AGENTS.md).
