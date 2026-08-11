# Feature catalogue

What each area of the workspace is for, where it lives, and what the assistant
can do with it. Areas follow the sidebar. Anything an admin has hidden with a
feature flag simply disappears from the navigation — the data and its rules are
unchanged.

Deep dives live in their own documents: [Slack](./slack.md),
[events, listeners and the inbox](./events-and-inbox.md),
[MCP](./mcp.md), [capability workers](./capability-workers.md),
[artifacts API](./artifacts-api.md), [to-dos API](./todos-api.md).

---

## Home, chat and the inbox

### Home — `/home`
A live picture of the workspace: quick actions, stat tiles, a 14-day activity
trend, a realtime feed, and your open to-dos with inline complete. The **Explore**
tab keeps the full feature index and ⌘K search.

**Custom widgets.** Describe a tile in plain language ("open to-dos due this
week") and the assistant composes it. A widget is a saved row naming a source
from a fixed allow-list; the dashboard renders it by querying that source under
your own permissions, so a saved widget can never read someone else's rows.

### Chat — `/chat`
The main assistant. Replies stream token by token, persist to Postgres, and sync
across devices in realtime. Attach files (images, PDFs, text) and the assistant
reads them. Type `/` to arm an on-demand skill, then add context before sending.

A reply keeps going if you navigate away: the run finishes server-side and saves
itself, and anything it produced appears when you come back. **Stop** genuinely
cancels — the run halts and saves nothing.

**Team threads.** Share a conversation with workspace members and the thread
becomes a room: people talk to each other over realtime, and the assistant only
answers when a message contains `@ai`. Everyone posts as themselves.

**Live artifact panel.** Creating or opening an artifact from chat docks it
beside the thread, following the row in realtime, so "check off the second item"
edits *that* artifact instead of minting a new one.

### Inbox — `/inbox`
One place for messages from anywhere: email, Slack, WhatsApp, a script, a manual
note. Filter by source, mark read, file messages into collections. Mail arrives
either by provider push or by an **IMAP mailbox you add** and the workspace
polls; each message can be routed on arrival — into a table, to an agent, or to a
function — while still landing in the inbox. Full detail:
[events-and-inbox.md](./events-and-inbox.md).

---

## Assets

### Collections — `/collections`
A collection is a named set of work you can point a chat at: artifacts, files,
to-dos, links, tables, whiteboards, card boards, terminology and messages. Scope
a chat to one or several and their content becomes primary context, deduped
across collections and budgeted to the model's real window. A meter shows how
much of that window a collection would fill, so you can judge fit before sending.
Collections are also the natural ingestion target — an outside Claude, a script
or a scheduled agent can file content straight into one.

### Files — `/files`
Private per-user storage with titles and descriptions. Share a selection in one
action: a signed link scoped to an hour, a day or a week, or a **permanent public
link** that publishes a copy into a public bucket — the stable URL you want baked
into a public page. Unpublishing drops the public copy and leaves the original
untouched.

**Team knowledge base.** Uploaded PDFs are indexed automatically and shared with
the workspace by default, so anyone's chat can search them and cite the document.
Flip a document to "Only me" for privacy — only the extracted text is ever
shared, the raw file stays private.

The assistant can create files too, including binary output it generates, with
size and type limits enforced server-side.

### Tables — `/tables`
Real Postgres tables, created by hand or by describing what you need. You get a
spreadsheet-style grid, and PostgREST exposes the table for ordinary queries.
Structural changes go through validated database routines, so no browser ever
runs DDL. Each table is private or workspace-shared, and the assistant can query,
insert and update rows within those same rules.

**Public write-forms.** A table can accept anonymous submissions — a contact form
or signup sheet embedded in a shared page — without opening the table to the
public. You pick exactly which columns the form may write; everything else is
dropped, required fields are checked, ownership is forced, and submissions are
rate-limited. Reads stay private. See the `supanet-table-forms` skill for the
embedding recipe.

**Table events.** Opt a table into emitting an event on each new row, and
automations can react to writes — including a webhook that drops a raw payload
straight into a column with no model involved.

### Artifacts — `/artifacts`
Documents, code, HTML and text with live preview. Share as private, workspace,
unlisted or public; public and unlisted pages are served to anonymous visitors,
optionally behind a **share password** that hides the row from non-owners
entirely rather than just hiding the UI.

**Standalone pages.** An HTML artifact renders chrome-free at its own public
`/p/:slug` URL — a good way to hand someone a diagram or a small app. Editing the
artifact updates the page.

**Interactive artifacts.** HTML artifacts can be stateful mini-apps — trackers,
kanbans, checklists — whose state persists. The page asks for its saved state and
posts changes back; the app does the saving, so the artifact never sees
credentials.

**Inline images.** Paste, drag or attach an image into the body and it uploads to
a public image bucket with a markdown link spliced in at the cursor, so the image
still loads for anonymous visitors years later.

**Archive and recover.** Deleting archives by default: the row disappears from
every view but stays recoverable in the Trash panel. Permanent removal is a
separate, deliberate action. Skills work the same way.

Artifacts also have a plain REST API for scripts and automations —
[artifacts-api.md](./artifacts-api.md).

### To-dos — `/todos`
Tasks with notes, due dates, drag-to-reorder and private or workspace
visibility. File them into collections so a collection you chat with carries its
tasks alongside its docs. Full REST API: [todos-api.md](./todos-api.md).

### Links — `/links`
Shared bookmarks. Paste a URL and the title, description, preview image and
favicon fill in by themselves; a screenshot can be attached as the card image.
Links file into collections like everything else.

### Whiteboards — `/whiteboards`
Excalidraw canvases for planning, with **live multiplayer**: shared cursors, a
peer count, and scenes that stay in sync. The board is also a structured file the
assistant can read *and* draw on — ask for a flowchart, or ask what's on the
board.

### Cards — `/cards`
A free-form card wall, deliberately not a kanban: dump cards and drag them
anywhere, because position *is* the ranking. Multiplayer like whiteboards, with a
persistent chat panel per board — "brain-dump these ten ideas as cards" writes to
the board and the canvas updates live.

### Memory — `/memory`
Your durable personal profile — name, defaults, tone, stack, standing
preferences — so a new chat doesn't start from zero. Memories are **owner-only**;
one person's memory never enters another's context. The assistant saves and
refines them as you work, and you can pin, edit or forget any of them. The
outward-facing loops never auto-inject memory.

### Meeting notes — `/meeting-notes`
Record a meeting, get a transcript, and save the notes as an artifact. A saved
meeting emits its own event, so "when a meeting is recorded, run this agent" is a
listener rule rather than a special case.

### Terminology — `/terminology`
A shared glossary: terms, definitions and notes, private or workspace-wide, and
filable into collections — so an agent working on a collection speaks your
domain's language.

### Skills — `/skills`
Two modes in one place. **Always-on prompts** are admin-managed and shape every
chat in the workspace ("this is Acme's intranet"). **On-demand skills** are
personal and run from chat with `/`. The page tracks how often each on-demand
skill is used, so stale ones are easy to spot.

---

## Automation

### Agents — `/agents`
An agent is a deployable unit: a name, instructions, the tools it may use, and
the collections it works from. Chat with one, schedule it, point a webhook or a
Slack channel at it, or have a listener run it. Schedules take a simple interval
or a full cron expression with a timezone, with a plain-English description and a
next-runs preview while you type.

**Run traces.** Each invocation records a run with its steps — model turns and
tool calls with their inputs and outputs — so you can see what an unattended
agent actually did.

### Listeners — `/listeners` and Events — `/events`
The automation spine. Meaningful changes emit events; a listener is a "when this,
do this" rule that matches events and runs an agent, calls one tool with no model
involved, files something into a collection, or just logs the match. Events are
claimed once, and each tick caps how much it runs, so chains stay bounded. Detail:
[events-and-inbox.md](./events-and-inbox.md).

### Loops — `/loops`
Goal-directed runs that self-correct. Give a loop a goal, a way to score the
result, an iteration cap and a **price cap**; it proposes, scores, improves, and
stops on budget, iterations, convergence or a target score — keeping the best
result. An external Claude can start a loop and check back on it.

### Tools — `/tools`
Everything the assistant can *do*, as rows. Built-in tools cover the workspace
itself (artifacts, collections, to-dos, links, files, tables, memory, messages,
whiteboards, cards, jobs, secrets, email, Slack, search, and the build tools that
create agents and skills). Custom HTTP tools point at any URL. Web search is a
tool. External MCP servers appear as one row each. Admins activate tools; agents
scope down to a subset; untrusted callers get none unless explicitly allowed.

Tools also run **without a model**: a single call or a short chain, from the UI, a
script or a cron job, using the same dispatch and the same permission rules.

### Forge — `/forge` (admin)
Describe a capability in plain language and Forge writes a small function,
deploys it to the live project, and registers it as a tool. Use it for the
deterministic work a model shouldn't be doing by hand — a calculator, a precise
transform, a validate-then-call API. Generated code is screened before deploy and
runs with no database or secret access.

---

## Connections

### Webhooks — `/webhooks`
Give an external system a URL. Each inbound POST can run an agent, run a prompt,
call one function directly with schema validation and no model, or drop the
payload into a table column. Add a shared secret to turn the secret URL into real
authentication. Events and results are logged live.

### API — `/api`
In-app, copy-ready documentation for the REST surfaces — artifacts, to-dos and
direct tool runs — including picking or minting the bearer token so the examples
are paste-ready.

---

## Insights

### Activity — `/activity`
A live feed of what happened across the workspace: tool calls, artifacts,
uploads, webhook events, guardrail decisions. You see your own rows; admins see
everything.

### Usage — `/usage` (admin)
What the AI costs. Every model call records tokens and cost; the page shows
totals, a daily chart, and breakdowns by model, context and user, alongside your
live OpenRouter balance.

### Feedback — `/feedback` (admin)
Ratings on assistant replies, captured with a snapshot of what produced the
answer — model, agent, skill, tools — so quality can be attributed rather than
counted.

### Features — `/features`
The team's own board. Anyone files an idea; an admin approving it opens a GitHub
issue, the coding agent implements it on a branch and opens a PR, and moving the
card to ready merges it. Security findings can be promoted onto this board, so a
finding becomes scheduled work instead of a recurring nag.

---

## Governance

### Guardrails — `/guardrails` (admin)
Pre-flight checks run by a cheap model *before* the main model sees a request:
does this payload try to redirect the agent, does this message carry secrets. The
verdict comes back as data and is enforced in code — block or flag — and is never
pasted into the main prompt. Webhooks and Slack fail closed; chat fails open.

### Security — `/security` (admin)
A repeatable posture scan over configuration, not model opinion: webhooks without
secrets, tool-enabled webhooks, missing blocking guardrails, exfiltration-capable
tools without an allowlist, stale tokens, public artifact inventory, single-admin
risk. Findings carry a stable identity, so dismissing one as accepted risk sticks
across re-runs. Run it from the page, on a schedule, or from chat.

### Evals — `/evals` (admin)
Measure whether the pipeline is actually good, and catch regressions when you
change a model or a prompt. A suite is a set of cases with typed assertions; runs
can compare several models at once. Suites can be grounded in a collection
("answer only from this knowledge"), and can assert what the assistant *does* —
which tools it called, with what arguments, or that it did **not** call a
dangerous one. Tool-usage runs are sandboxed by default: read-only tools execute,
everything else is captured but not run, so a suite is safe to re-run on a
schedule.

### Secrets — `/vault` (admin)
Named team secrets — API keys, tokens, passwords — stored only in Supabase Vault.
Agents can list secret *names* for discovery and fetch a value by name when
explicitly scoped to do so; every read is logged.

---

## Settings

| Area | What you set |
| --- | --- |
| Profile | Your name, appearance, and installing the app on your device |
| Connect Claude | Personal tokens plus paste-ready snippets for Claude Code and Claude Desktop |
| Models | Which model backs each job slot (`orchestrator`, `utility`) — any OpenRouter slug |
| Timezone | The workspace clock every unattended automation treats as "local" |
| Email | The sending provider and inbound parsing |
| Slack | The bot connection and per-channel bindings |
| External MCP | Outbound connections to other MCP servers |
| Invite people | Invite by email or by shareable link; promote, disable or remove members |
| Feature flags | Hide areas the team doesn't use. Hiding is not permission — RLS still decides who sees data |

---

## Capability workers

Heavy libraries run as separate Docker services rather than inside the app. The
assistant creates a durable job, the right worker claims it, runs an allow-listed
operation, uploads its outputs, and the assistant continues from the manifest.
Office documents (LibreOffice) and media (ffmpeg) ship today; the protocol is the
same for any future worker. Detail: [capability-workers.md](./capability-workers.md).
