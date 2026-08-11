# Integrations

Ways in and out of the workspace. The theme is that the workspace is not the only
place you work — so it connects to the tools you already use, in both directions.

## Connect Claude (MCP server)

Your workspace exposes an MCP server, so an external Claude can build in it: create
agents, tools, skills, webhooks and artifacts; read and file collections; manage
to-dos, links, files, memory, tables, whiteboards, cards and widgets; drive loops
and evals. Whatever it makes appears in the dashboard like anything else.

Every call runs as the person whose credential it used, so the same permissions
apply as when that person clicks. There are two ways to connect, both set up from
**Settings → Connect Claude**:

- **A personal token.** Claude Code adds it in one command; Claude Desktop launches
  MCP servers as local processes, so it connects through a small bridge. The
  settings page generates both snippets with your URL and token already filled in.
- **Paste-the-URL and approve.** Add the workspace as a custom connector, sign in
  with your workspace email and password, approve, and you are done — no token to
  copy. See [MCP connector OAuth](./mcp-oauth.md).

## Connect other services (external MCP servers)

The inverse: the workspace connects out to any number of external MCP endpoints, so
your agents can use their tools. An admin adds a server once in **Settings →
External MCP servers**; each server gets one row in the tools list, and switching
that row on exposes its whole remote toolset — subject to every existing gate:
admin activation, per-agent scoping, and the read-only rule for unattended runs.

Two things worth knowing:

- **Tokens live in the vault**, never in a table column or a payload.
- **Those tools are re-exposed outward.** Connect a browser-automation server such
  as Playwright once, and its tools appear to Claude Desktop and Claude Code
  through your workspace endpoint too — one address for everything. See
  [Playwright over MCP](./playwright-mcp.md).

Remote tools can act on the outside world, so treat them with the same care as
sending email.

## Slack

Put the assistant in the rooms where the conversation already happens. An admin
connects the Slack app once, then binds a channel to one or more collections and
optionally an agent. The person who creates the binding is the identity the bot
runs as, so bind team-visible collections for team rooms.

- **Mention mode** — the bot answers `@mentions` in the thread, grounded in that
  room's collections.
- **Ambient mode** — the bot reads along and a cheap model decides whether it has
  something worth adding. It stays quiet when unsure, because a needless
  interruption costs more than a missed one.

Messages can also be captured into the unified inbox, which makes them ordinary
events you can automate on. Requests are verified by signature, replies go back
into the thread, and the bot never answers itself. Setup guide and app manifest:
[Slack](./slack.md).

## Email

Configure a provider once in **Settings → Email** and the assistant can send and
read mail — "email me a summary every morning" becomes a schedule, not a project.

- **Sending** goes through an HTTP provider rather than raw SMTP. It is
  rate-limited, can be restricted to an allowlist of addresses or domains, and
  every send is logged.
- **Receiving** works two ways: a provider posts inbound mail to your workspace, or
  you register an IMAP mailbox and the workspace polls it. Either way mail lands in
  the unified inbox and raises an event, so routing it — into a table, to an agent,
  through a function — is an ordinary rule.

Use an app password for IMAP; most providers reject a normal login password once
two-factor is on. Details in [events, listeners and the inbox](./events-and-inbox.md).

## REST APIs

For everything that does not speak MCP — a script, a Zap, a cron job, another app.
The same personal token authenticates all of them, and a signed-in session works
too, so the app itself uses the same endpoints.

| API | What it is for | Reference |
| --- | --- | --- |
| Artifacts | Push and sync documents, code and pages; tag them into collections | [artifacts-api.md](./artifacts-api.md) |
| To-dos | Capture and sync tasks from anywhere | [todos-api.md](./todos-api.md) |
| Run tools | Invoke any active tool, or chain a few, with no model involved | The **API** page in the app |
| Message ingest | Push a message from any source into the unified inbox | [events-and-inbox.md](./events-and-inbox.md) |

The **API** page inside the app renders the base URL, the endpoints and copy-ready
examples with a token you pick or mint on the spot — start there rather than
assembling a request by hand.

## Credentials

Every credential the workspace holds — the mail provider key, external MCP tokens,
IMAP passwords, and the team's own shared secrets — lives only in Supabase Vault.
The database stores a pointer, never a value; values are written through
admin-gated routines and read only by the server. Nothing lands in a table column,
a browser payload, or a log.
