# MCP, in both directions

The workspace is an MCP **server** (an outside AI can work inside it) and an MCP
**client** (it can call other people's MCP tools). Both are on by default in the
sense that the plumbing ships; you just connect what you want.

## Inbound: connect Claude to your workspace

Mint a personal token in **Settings → Connect Claude**. Every call then runs *as
you* — same permissions, same visibility rules, same activity log. Revoking the
token cuts access immediately.

**Claude Code** connects in one command:

```bash
claude mcp add --scope user --transport http intranet https://<project-ref>.supabase.co/functions/v1/mcp --header "Authorization: Bearer <token>"
```

**Claude Desktop** launches MCP servers as local processes, so it reaches a
remote server through the `mcp-remote` bridge. Settings → Connect Claude
generates the exact config block with your URL and token already filled in —
copy it from there rather than hand-writing it, since the header has to be split
in a specific way for the bridge to pass it through intact.

**Paste-a-URL instead of a token.** There is also an OAuth path: add the MCP URL
as a custom connector, sign in with your workspace email, approve, and no static
token changes hands. See [mcp-oauth.md](./mcp-oauth.md).

### What an outside Claude can do

- **Author content** — artifacts (create, update, archive, restore), notes,
  links, to-dos, files, messages, whiteboards and card boards, all filable into
  collections.
- **Pull a whole collection in one call** — metadata plus artifacts, files,
  links, to-dos, tables and messages, with an optional "changed since" filter for
  a cheap daily diff.
- **Build the workspace** — agents, HTTP tools, skills, prompts and webhooks, so
  "build me an agent that does X on my intranet" ends with the agent visible in
  the dashboard. Admin-only actions stay admin-only.
- **Run and watch work** — start a loop and poll it, queue a capability-worker
  job and poll it, run an eval suite across several models and read the
  side-by-side scorecard.
- **Search the knowledge base** and read the activity log.

The same handlers back the in-app assistant, so the internal and external Claude
can never drift apart.

### Not using MCP?

Artifacts, to-dos and direct tool runs each have a plain REST surface with the
same bearer token — see [artifacts-api.md](./artifacts-api.md),
[todos-api.md](./todos-api.md), and the in-app **API** page for copy-ready
examples.

## Outbound: connect the workspace to other MCP servers

An admin adds servers in **Settings → External MCP servers**: a label, a URL and
an optional token, which is stored only in Supabase Vault. Each server becomes a
**single tool row** — activating it turns that server's whole remote toolset on,
and scoping it to an agent works exactly like any other tool.

Remote tools appear under a namespaced name (`‹label›__‹remote-tool›`), so two
servers can offer a similarly-named tool without colliding. The discovered list
is cached briefly so the agent loops don't re-handshake on every message, and
Settings has a "connect and list tools" action to refresh it.

Because these tools can act on the outside world, they carry the same trust as
sending email: admin activation, per-agent scoping, the webhook tool lock, and
the guardrail pre-flight all apply.

**They are also re-exposed outward.** Anything you connect here shows up to your
Claude Desktop or Claude Code through the workspace's own MCP endpoint. Connect a
browser-automation server once and your desktop AI gains browser tools alongside
the workspace's own — one endpoint, everything in it. See
[playwright-mcp.md](./playwright-mcp.md) for that setup.
