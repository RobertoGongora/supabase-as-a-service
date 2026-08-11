
<div align="center">

# ✺ Intranet In A Box [BETA]

**A friendly, open-source intranet layer on top of [Supabase](https://supabase.com).**

Log in, chat with AI to build things, and share what you make — publicly or locked down. Files, artifacts, automation, and live updates included.

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

A complete team workspace — an "intranet" — that you fully own. A shared AI
assistant that learns your business from your own documents and prompts, turns
conversations into things you can send to a client, and quietly handles the work
that arrives while nobody's watching.

It leans on Supabase for the parts that should be boring and solid, and adds a
clean React app on top. **Wondering why a small business would run this?
Read [WHY.md](./WHY.md).**

## What you get

**Work with an assistant that knows your business**

- 💬 **Chat** — talk to any model through OpenRouter. Replies stream, persist, and
  sync live across devices. Attach files and it reads them. Walk away mid-reply
  and it finishes anyway.
- 📚 **A team knowledge base** — uploaded PDFs are indexed automatically and
  shared with the workspace by default, answered with citations and an honest
  "we don't have anything on that". Flip any document to *Only me*.
- 🗂️ **Collections** — group the docs, files, tasks, links and tables for a
  project, then chat with just that set. A meter shows how much of the model's
  window it fills before you send.
- 🧠 **Memory** — your own durable profile, so a new chat doesn't start from
  zero. Private to you, always.
- ⚡ **Prompts & skills** — always-on prompts shape every conversation
  ("this is Acme's intranet"); personal skills run on demand with `/`.

**Turn conversations into things you can hand over**

- 📄 **Artifacts** — documents, code and HTML with live preview. Share them
  private, workspace-wide, unlisted or public, optionally behind a password.
  HTML artifacts get their own clean page, and can be interactive apps whose
  state persists.
- 🎨 **Planner** — Excalidraw whiteboards and free-form card walls, both
  multiplayer, both readable *and* writable by the assistant.
- 📁 **Files** — private storage with one-click sharing: an hour, a day, a week,
  or a permanent public link.
- 📊 **Tables** — real Postgres tables you create by describing them, with a
  spreadsheet grid and optional public write-forms for contact and signup pages.
- 🎙️ **Meeting notes, to-dos, links and a glossary** — the small pieces a team
  actually runs on, each filable into a collection.

**Let it do the work**

- 🤖 **Agents** — instructions plus the tools they may use. Chat with one,
  schedule it on a cron, or point a webhook at it. Every run leaves a trace.
- 🔔 **Events & listeners** — "when a file lands in this collection, run that
  agent." Every meaningful change emits an event; rules react to them.
- 📬 **Unified inbox** — email (pushed or polled over IMAP), Slack, WhatsApp,
  scripts. Route each message on arrival while it still lands in the inbox.
- 🪝 **Webhooks** — a public URL that runs an agent, calls one function with no
  model in the loop, or drops the payload straight into a table.
- 💬 **Slack** — bind a channel to a collection and the bot answers in that
  room's context, on `@mention` or ambiently.
- 🛠️ **Tools as data** — web search, custom HTTP tools, and dozens of built-ins
  covering the workspace itself. Adding a capability is adding a row.
- 🔥 **Forge** — describe a function, and it's written, deployed and registered
  as a tool for when a model shouldn't be doing the maths by hand.
- 🔁 **Loops** — goal-directed runs that score their own output and stop at a
  price cap.

**Stay in control**

- 🔐 **Invite-only** — the first user becomes admin; after that, people join by
  invitation or a shareable link, enforced in the database.
- 🛡️ **Guardrails** — a cheap model screens requests *before* the main model
  runs, and the verdict is enforced in code. Untrusted callers get no tools
  unless you say so.
- 🔒 **Secrets** — API keys and passwords live only in Supabase Vault.
- 📡 **Security scan** — a repeatable posture check over your configuration,
  with findings you can accept or promote into work.
- 💸 **Usage & cost** — every model call's tokens and cost, by model, context and
  person, next to your live OpenRouter balance.
- 📈 **Evals** — measure whether the answers are good, compare models on the same
  suite, and assert which tools the assistant did (or didn't) call.
- 🚩 **Feature flags** — hide the areas your team doesn't use.

**Connect it to everything else**

- 🔌 **MCP, both ways** — connect Claude Code or Desktop to your workspace and
  build in it from there; connect the workspace out to other MCP servers and
  their tools appear everywhere, including back in your desktop Claude.
- 🌐 **REST APIs** — artifacts, to-dos and direct tool runs, with copy-ready
  examples inside the app.
- 📱 **Installable** — responsive, and installs to your phone or desktop.

The OpenRouter API key lives **only** on the server. Your data is protected by
Postgres row-level security, not by hiding a key.

> CLAUDE DESKTOP INTEGRATION

![](images/claude-desktop-integration.png)

## How it fits together

```
   Browser  ───▶  React SPA (Vite + Tailwind)
   (Railway)        • Supabase Auth session
                    • RLS-scoped reads and writes
                    • Realtime subscriptions
                         │  anon key — safe, RLS protects the data
                         ▼
                  Supabase
                    • Postgres + row-level security
                    • Auth · Realtime · Storage
                    • Edge functions ──▶ OpenRouter, Slack, email, MCP
                         │  (provider keys stay server-side)
                         ▼
                  Capability workers (optional Docker services)
```

More detail: [docs/architecture.md](./docs/architecture.md).

<img width="2684" height="1820" alt="CleanShot 2026-06-21 at 21 43 49@2x" src="https://github.com/user-attachments/assets/77f646c0-2855-4c19-9504-2b155143deba" />

## Tech stack

- **Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · React Router
- **Backend:** Supabase — Postgres, Auth, Realtime, Storage, Edge Functions (Deno)
- **AI:** any model via [OpenRouter](https://openrouter.ai), chosen per job slot
  in Settings → Models
- **Workers:** optional Docker services for heavy libraries (LibreOffice, ffmpeg)
- **Hosting:** any static host; first-class config for [Railway](https://railway.app)

## Quick start (local)

<img width="2650" height="1572" alt="CleanShot 2026-06-21 at 21 44 26@2x" src="https://github.com/user-attachments/assets/49efe409-dda5-4c15-8142-5e6f9c0f1d44" />

**Prerequisites:** Node 20, a [Supabase](https://supabase.com) project, an
[OpenRouter API key](https://openrouter.ai/keys), and the
[Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
# 1. Install
npm install

# 2. Configure the frontend
cp .env.example .env.local        # set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 3. Apply the database schema
supabase link --project-ref <your-project-ref>
supabase db push

# 4. Deploy the edge functions and their one required secret
supabase secrets set OPENROUTER_API_KEY=sk-or-...
supabase functions deploy

# 5. Run
npm run dev                       # http://localhost:5173
```

Sign up — the first account becomes the admin — and start chatting. After this
first setup, CI keeps the database and functions in sync; you don't run these
commands again.

> **Tip for first-run testing:** in Supabase → Authentication → Providers →
> Email, turning off **Confirm email** lets password signups log in immediately.

## Environment variables

| Where | Variable | Notes |
| --- | --- | --- |
| Frontend (build time) | `VITE_SUPABASE_URL` | Your Supabase project URL. Inlined into the bundle. |
| Frontend (build time) | `VITE_SUPABASE_ANON_KEY` | Anon/publishable key. Safe in the browser — RLS protects data. |
| Edge secret | `OPENROUTER_API_KEY` | **Server-only.** The one secret you must set. |
| Edge secret | `OPENROUTER_MODEL` | Optional fallback slug when a model profile can't be read. |
| Edge secret | `OPENROUTER_EFFORT` | Optional reasoning effort: `low`, `medium`, `high`. |

`VITE_*` values are read at **build time** — set them before the build runs. The
full list, including optional secrets, is in
[docs/operations.md](./docs/operations.md).

## Deploying

<img width="2734" height="1802" alt="CleanShot 2026-06-21 at 21 44 55@2x" src="https://github.com/user-attachments/assets/808cb448-146e-4c5d-8ab4-20929e9d59fa" />

Two pieces go live: the **Supabase backend** and the **static frontend**. Railway
is wired up out of the box:

1. Railway → **New Project → Deploy from GitHub repo** → this repo, `main`.
2. Add the service variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Deploy.
4. Add your deployed URL to Supabase **Authentication → URL Configuration** so
   magic links come back to your app.

**Pushing to `main` updates everything.** Railway rebuilds the frontend, and
GitHub Actions deploy changed edge functions and apply pending migrations.

Short guide: [DEPLOY.md](./DEPLOY.md). Full reference, including migration rules
and multi-tenant rollout: [docs/operations.md](./docs/operations.md).

## Connect Claude

Mint a token in **Settings → Connect Claude**, then connect Claude Code in one
command:

```bash
claude mcp add --scope user --transport http intranet https://<project-ref>.supabase.co/functions/v1/mcp --header "Authorization: Bearer <token>"
```

Claude Desktop needs a small bridge config, which that same settings page
generates for you with your URL and token filled in. There's also an OAuth
option — paste the URL, sign in, approve, no token to copy. See
[docs/mcp.md](./docs/mcp.md).

## Security model

- The browser only ever holds the **anon** key. Row-level security is what
  protects data, not key secrecy.
- Files live in a private bucket scoped per user; sharing is explicit, and public
  links publish a separate copy rather than exposing the original.
- Provider keys, tokens and mailbox passwords live in **Supabase Vault**, read
  only server-side.
- Requests from the outside world — webhooks, Slack, inbound mail — run
  read-only unless you explicitly allow tools, and are screened by guardrails
  first.

## Documentation

- [docs/](./docs/README.md) — the full index
- [docs/features.md](./docs/features.md) — what every area does
- [docs/architecture.md](./docs/architecture.md) — how it fits together
- [CLAUDE.md](./CLAUDE.md) / [AGENTS.md](./AGENTS.md) — conventions for
  contributors and coding agents
- [ROADMAP.md](./ROADMAP.md) — where this is going

## Origins

This is the third iteration of an idea [Alfred Nutile](https://github.com/alnutile)
has been building and writing about since 2023 — before "agents" was a product
category:

- **[LaraChain → LaraLlama](https://github.com/LlmLaraHub/larallama)** (2023–2024,
  now archived) — document collections you could chat with, email and web
  ingestion, multi-LLM workflows, and outputs deployable as chatbots and APIs.
- **[*PHP and LLMs*](https://leanpub.com/php_and_llms)** — the book written along
  the way.
- **[The video series](https://youtube.com/playlist?list=PLL8JVuiFkO9K7oEwcQo8lzijczKm7ccuS&si=Pjitnmo5-y4v1oUT)**
  — those systems being designed and built, as it happened.

The idea was early; the 2023 models weren't ready for it. They are now. This is
the same vision — a team's shared, tool-using AI workspace on infrastructure it
owns — rebuilt on Supabase and current models.

## Contributing

1. Fork and clone, then `npm install` and follow **Quick start** against your own
   Supabase project.
2. Read [CLAUDE.md](./CLAUDE.md) — commit style, migration rules, and the
   security lines that don't move.
3. `npm run build`, `npm test` and `npm run lint` should pass.
4. Open a PR with a clear description of what changed and why.

Issues and PRs welcome.

## License

MIT — see [`LICENSE`](./LICENSE). Use it, fork it, build your own intranet.
