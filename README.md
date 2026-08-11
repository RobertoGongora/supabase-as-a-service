
<div align="center">

# ✺ Intranet In A Box [BETA]

**A friendly, open-source intranet layer on top of [Supabase](https://supabase.com).**

Log in, chat with AI to build things, and share what you make — publicly or locked down. Files, artifacts, and live updates included.

**👀 Read the [docs](https://supanet-docs.dailyai.studio/)**

**👀 More Info [supanet](https://supanet.dailyai.studio)**

<br/>

![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%7C%20Auth%20%7C%20Realtime%20%7C%20Storage-3FCF8E?logo=supabase&logoColor=white)
![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-6566F1?logo=openai&logoColor=white)

</div>

<img width="2746" height="1874" alt="CleanShot 2026-06-21 at 21 43 05@2x" src="https://github.com/user-attachments/assets/16458091-a1c6-4bf5-8466-f15220ca229e" />

---

## What is this?

A complete team workspace — an "intranet" — that you own outright. A shared AI
assistant that learns your business from your own documents and prompts, turns
conversations into things you can hand to a customer, and keeps working when nobody is
watching.

It leans on Supabase for the parts that should be boring and solid (Postgres, Auth,
Realtime, Storage, Edge Functions) and adds a clean React UI on top. Models come
through [OpenRouter](https://openrouter.ai), so any model — hosted or local — is one
admin setting away.

**Wondering why a small business would run its own?** Read [WHY.md](./WHY.md).

## What you get

**Talk to it**

- 💬 **AI chat** that streams, remembers, and syncs live across your devices. Attach
  files and it reads them. Share a thread with a colleague and the assistant stays
  quiet until someone says `@ai`.
- 🧠 **Memory** — it keeps your name, defaults and ongoing projects, so a new
  conversation doesn't start from zero.
- ⚡ **Prompts & skills** — always-on prompts that tell it how your business works, and
  personal skills you run from chat with `/`.

**Make things**

- 📄 **Artifacts** — documents, code and HTML pages with live preview. Keep one private,
  share it with the team, hand out an unlisted link, or publish it — with an optional
  password. HTML artifacts get their own clean page, and can be interactive: a tracker
  or checklist that saves what you click.
- 📁 **Files** — private storage with signed links when you want to share, or a
  permanent public URL when you're embedding something in a page.
- 📊 **Tables** — a spreadsheet-style area backed by real Postgres tables. Describe what
  you want and the assistant builds it. A table can accept submissions from a public
  form without ever being exposed.
- 🗺️ **Whiteboards & cards** — plan on a shared canvas or a wall of sticky notes, with
  live cursors. The assistant can read a board and draw on it.
- 🎙️ **Meeting notes** — record, transcribe, chat with the transcript, save the result.

**Keep it together**

- 📚 **Collections** — group documents, files, tasks, links and tables under one name,
  then chat with just that set. The meter shows how much of the model's context window
  it fills, so nothing is a guess.
- 🔎 **Team knowledge base** — uploaded PDFs are indexed automatically and become shared
  workspace knowledge, answered with citations. Flip any document to "Only me" and only
  the extracted text stays out of the shared pool; the file itself was always private.
- 📥 **Unified inbox** — email (provider push or your own IMAP mailbox), Slack, or
  anything that can POST, in one list you can file and automate on.

**Put it to work**

- 🤖 **Agents** — a prompt plus the tools it may use plus the collections it works from.
  Chat with one, schedule it, or point a webhook at it — and see exactly what it did on
  its own runs page.
- 🪝 **Webhooks & listeners** — turn an inbound POST or any change in the workspace
  ("when a file lands in this collection…") into an action, with or without a model in
  the loop.
- 🛠️ **Tools as data** — web search, custom HTTP endpoints, remote MCP servers. Adding a
  capability is usually adding a row, not shipping code.
- 🔥 **Forge** — describe a small function, get it deployed and registered as a tool, for
  work a model shouldn't be guessing at.
- 🔁 **Loops** — give a goal, a way to score the result and a dollar budget, and let it
  iterate until it's good enough or the budget says stop.

**Stay in control**

- 🔐 **Invite-only** — the first user bootstraps the workspace and becomes admin; after
  that only invited people can sign up, enforced in the database.
- 🛡️ **Guardrails** — a cheap model screens inbound work *before* the main model runs,
  and the verdict is enforced in code. Webhook traffic runs read-only unless you say
  otherwise.
- 📡 **Security scan & activity feed** — a repeatable posture check over your
  configuration, and a live log of everything happening.
- 💸 **Usage & cost** — every model call's tokens and price, broken down by model,
  context and person, next to your live OpenRouter balance.
- 🔌 **MCP server** — connect Claude Code or Claude Desktop and say *"build an agent that
  does X on my intranet"*. It shows up in the dashboard. Your app is one way to build
  here; it isn't the only one.

The OpenRouter key lives **only** on the server, in a Supabase Edge Function. Data is
protected by Postgres row-level security, not by hiding keys.

> CLAUDE DESKTOP INTEGRATION

![](images/claude-desktop-integration.png)

## How it fits together

```
                 ┌─────────────────────────────────────────────┐
   Browser  ───▶ │  React SPA (Vite + Tailwind)                 │
                 │   • Supabase Auth (session)                  │
                 │   • RLS-scoped reads/writes                  │
                 │   • Realtime subscriptions (websockets)      │
                 └───────────────┬─────────────────────────────┘
                                 │ anon key (safe; RLS protects data)
                                 ▼
                 ┌─────────────────────────────────────────────┐
                 │  Supabase                                    │
                 │   • Postgres + row-level security             │
                 │   • Auth · Realtime · Storage                 │
                 │   • Edge functions ──▶ OpenRouter             │
                 │     (the API key stays server-side)           │
                 └─────────────────────────────────────────────┘
```

<img width="2684" height="1820" alt="CleanShot 2026-06-21 at 21 43 49@2x" src="https://github.com/user-attachments/assets/77f646c0-2855-4c19-9504-2b155143deba" />

## Tech stack

- **Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · React Router
- **Backend:** Supabase — Postgres, Auth, Realtime, Storage, Edge Functions (Deno)
- **AI:** any model via [OpenRouter](https://openrouter.ai), chosen per job slot in
  Settings → Models
- **Hosting:** any static host; first-class config for [Railway](https://railway.app)

## Quick start (local)

<img width="2650" height="1572" alt="CleanShot 2026-06-21 at 21 44 26@2x" src="https://github.com/user-attachments/assets/49efe409-dda5-4c15-8142-5e6f9c0f1d44" />

**You'll need:** Node 20, a [Supabase](https://supabase.com) project, an
[OpenRouter API key](https://openrouter.ai/keys), and the
[Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
# 1. Install
npm install

# 2. Point the frontend at your project
cp .env.example .env.local        # set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 3. Create the database (applies every migration in order)
supabase link --project-ref <your-project-ref>
supabase db push

# 4. Deploy the edge functions and their key
supabase secrets set OPENROUTER_API_KEY=sk-or-...
supabase functions deploy

# 5. Run it
npm run dev                       # http://localhost:5173
```

Sign up — the first account becomes the admin — and start chatting.

> **Tip for first-run testing:** in Supabase → Authentication → Providers → Email you
> can turn off **Confirm email** so password signups log in immediately.

## Environment variables

| Where | Variable | Notes |
| --- | --- | --- |
| Frontend (build time) | `VITE_SUPABASE_URL` | Your Supabase project URL. Inlined into the bundle. |
| Frontend (build time) | `VITE_SUPABASE_ANON_KEY` | Anon key. Safe in the browser — RLS protects data. |
| Edge function secret | `OPENROUTER_API_KEY` | **Server-only.** `supabase secrets set OPENROUTER_API_KEY=…` |
| Edge function secret | `OPENROUTER_MODEL` | Optional fallback slug if the model profile can't be read. |
| Edge function secret | `OPENROUTER_EFFORT` | Optional reasoning effort: `low`, `medium` or `high`. |

`VITE_*` variables are read at **build time** — on a host like Railway they must be set
before the build runs. Which model actually answers is a database setting
(Settings → Models), not an environment variable.

## Deploying

<img width="2734" height="1802" alt="CleanShot 2026-06-21 at 21 44 55@2x" src="https://github.com/user-attachments/assets/808cb448-146e-4c5d-8ab4-20929e9d59fa" />

Two pieces go live: the **Supabase backend** (schema, auth, storage, realtime, edge
functions) and the **static frontend**. Railway is wired up out of the box, and after
the one-time setup you don't run `supabase` commands by hand — landing on `main`
rebuilds the frontend, deploys changed functions and applies new migrations.

Step-by-step, including the Site URL gotcha: [`DEPLOY.md`](./DEPLOY.md).

## Connect Claude (MCP)

The workspace exposes an **MCP server** so an external Claude can build things in it —
agents, tools, skills, webhooks, artifacts. **Settings → Connect Claude** generates a
token and a ready-to-paste snippet for whichever Claude you use.

**Claude Code (CLI)** — one command:

```bash
claude mcp add --scope user --transport http intranet https://‹your-project›.supabase.co/functions/v1/mcp --header "Authorization: Bearer ‹your-token›"
```

**Claude Desktop** — Desktop launches MCP servers as local processes, so the remote
server is bridged with [`mcp-remote`](https://www.npmjs.com/package/mcp-remote).
Settings → Connect Claude emits the exact `claude_desktop_config.json` block, including
the header split that `mcp-remote` requires; paste it, then fully quit and reopen
Desktop.

Prefer approving in a browser to copying a token? The connector also supports Claude's
custom-connector OAuth flow — see [docs/mcp-oauth.md](./docs/mcp-oauth.md).

## Security model

- The browser only ever holds the **anon key**. Row-level security is what protects
  data, not key secrecy — owners see their own rows, and shared content opens up only
  as far as it was explicitly shared.
- Files live in a **private** bucket scoped per user. Sharing hands out a time-limited
  signed link, or an explicit public copy when you ask for one.
- The **OpenRouter key** and every provider credential stay server-side, in edge-function
  secrets or Supabase Vault.
- Signing in is required to reach the assistant, and signing up requires an invitation.

## Contributing

1. Fork and clone.
2. `npm install`, then follow **Quick start** to point at your own Supabase project.
3. Read [AGENTS.md](./AGENTS.md) — branch and commit conventions, testing, and the
   migration rules that keep deploys green.
4. `npm run lint`, `npm run build` and `npm test` should pass.
5. Open a pull request with a clear description.

Working on the internals? [CLAUDE.md](./CLAUDE.md) maps every feature area, and
[docs/README.md](./docs/README.md) indexes the deeper documentation.

## Where this is going

[ROADMAP.md](./ROADMAP.md) has the direction and what shipped recently. In short: shared
context that makes every task cheaper than the last, agents that collaborate, and cost
you can see and cap.

Issues and pull requests welcome.

## Origins

This is the third iteration of an idea [Alfred Nutile](https://github.com/alnutile) has
been building and writing about since 2023 — before "agents" was a product category:

- **[LaraChain → LaraLlama](https://github.com/LlmLaraHub/larallama)** (2023–2024, now
  archived) — document collections you could chat with, email and web ingestion,
  multi-LLM workflows, and outputs deployable as chatbots and APIs. Built in Laravel,
  shipped before the major platforms offered these as features.
- **[*PHP and LLMs*](https://leanpub.com/php_and_llms)** — the book written along the
  way: patterns for building LLM applications, learned from shipping one.
- **[The video series](https://youtube.com/playlist?list=PLL8JVuiFkO9K7oEwcQo8lzijczKm7ccuS&si=Pjitnmo5-y4v1oUT)**
  — walkthroughs of those systems being designed and built, as it happened.

The idea was early; the 2023 models weren't ready for it. They are now. This project is
the same vision — a team's shared, tool-using AI workspace on infrastructure it owns —
rebuilt from scratch on Supabase and current models.

## License

MIT — see [`LICENSE`](./LICENSE). Use it, fork it, build your own intranet.
