# Automation

How work happens without anyone watching. Every path here runs the same
model→tool→model loop as chat, with the same shared context and the same
guardrails — what changes is who starts it and what it is allowed to touch.

## Tools

A tool is a row that gives the assistant a real ability. Four kinds:

- **Built-in** — the capabilities that ship with the workspace: searching team
  knowledge, sending and checking email, reading and writing artifacts,
  collections, to-dos, links, files, tables, memory, whiteboards, cards, widgets,
  secrets, and even creating agents, tools, webhooks and skills.
- **Web** — search and page reading, provided by the model gateway.
- **HTTP** — anything you can reach with a URL: name it, describe its inputs, point
  it at an endpoint.
- **MCP** — one row per connected external MCP server; switching it on exposes that
  server's whole toolset.

Admins activate tools; an agent can be scoped to a subset; unattended callers are
locked down further (see below). Every call is logged.

**Running a tool directly.** Sometimes you want the capability without the model.
A single endpoint invokes any active tool with a plain payload, and can chain up to
ten steps where each step can reference the previous result. It authenticates with
either a personal token or a signed-in session, runs as that person, and logs every
call — which makes it the natural target for scripts, cron jobs and no-code tools.
The copy-ready examples live on the **API** page in the app.

## Agents

An agent is a deployable unit: a name, its instructions, the tools it may use, and
the collections it works from. Chat with one directly, point a webhook at it,
schedule it, or let an event trigger it — the collections it is bound to are
injected as context every time it runs.

**Runs and steps.** Each invocation records a run: which surface started it, its
status, its totals, its final answer, and one row per step with the tool inputs and
outputs. That trace is what turns "the overnight agent did something odd" into a
question you can actually answer.

**Schedules.** An agent can run on a fixed interval, or on a standard five-field
cron expression when you need an exact time — the fifteenth of the month, the last
day of the month, weekdays at nine. Cron expressions are evaluated in a timezone,
the editor shows the next few runs in plain English, and an invalid expression
pauses the schedule instead of spinning. Everything is floored to a one-minute
tick.

**Time.** Every unattended run is told the real local date and time, using the
workspace timezone an admin sets in **Settings → Timezone**. A schedule can
override it with its own.

## Events and listeners

The automation substrate: a workspace pub/sub layer, kept separate from the human
activity feed.

Meaningful changes raise events — an artifact created, a file deleted, a to-do
completed, a link saved, a message received, a meeting recorded, and the headline
"something was added to a collection". A **listener** is a rule: match an event
type (exactly, by prefix, or all of them) plus optional filters, then do one thing
— run an agent, run a tool, add the item to a collection, or just log it.

Each event is claimed once, so a rule cannot fire twice on the same event, and a
per-tick cap bounds any runaway chain. Both the event stream and the rules have
their own pages, with recent runs shown next to each rule. Full detail:
[events, listeners and the inbox](./events-and-inbox.md).

## Webhooks

Give an external system a URL and decide what an inbound POST does. Three modes, in
order of precedence:

1. **Call a function directly** — validate the payload against a tool's input
   schema and pass it straight through. No model is involved, so the schema *is*
   the gate; a bad payload comes back as a clear 400.
2. **Run an agent** — the agent's instructions and tools, applied to the payload.
3. **Run a prompt** — the simplest form.

Because the caller is outside your workspace, a webhook-triggered run is
**read-only unless you say otherwise**: tools are off until the webhook explicitly
allows them. That is a rule in code, not a request to the model. The URL token
alone is "secret link" security, so a webhook can also require a shared secret —
a wrong one is rejected before anything is even logged.

Every inbound call is recorded with its outcome and shown live on the page.

## Loops

For work that needs more than one pass: give a loop a goal, a rubric to score
itself against, a budget and an iteration cap, then let it run and check back. Each
iteration is scored and recorded, and the run stops when it is good enough, out of
budget, out of iterations, or out of time. External tools can drive the same loops
over MCP, so an outside Claude can hand off a goal and poll for the result.

## Capability workers

Some jobs do not belong inside a request: converting Office documents, cutting
audio and video. The assistant creates a durable job, a worker claims it, does the
work in its own container, uploads the results, and the assistant picks up where it
left off. Crashed workers are recovered, transient failures retry with backoff, and
a repeated request cannot produce duplicate output.

The workers are their own npm workspace with their own images, so they can run
anywhere Docker runs. Full detail: [capability workers](./capability-workers.md).

## Forge

Configuration-as-data cannot cover everything: sometimes you need real code that is
deterministic — a calculator, a converter, a precise transform, a validate-then-call
wrapper. Forge lets an admin describe the capability, generates the function,
deploys it, and registers it as an HTTP tool, so the rest of the system can call it
like any other.

The safety-critical parts are not the model's to write: a fixed harness owns
request handling and the per-function token, generated code gets no database or
secret access, a static check rejects anything that reaches for credentials or the
filesystem, a guardrail screens the code, and a dry run must succeed before a real
deploy. Anything that fails aborts the deploy. Every outcome is logged, and the
stored source is the record of what is live.

Forge also carries a small maintenance panel for redeploying the workspace's own
functions from inside the app, which is useful when you cannot push. On managed
workspaces that panel is hidden — deploys are handled for you.
