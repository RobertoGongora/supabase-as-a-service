
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

A complete team workspace you fully own — a shared AI assistant that learns your
business from your own material, turns conversations into things you can hand to a
client, and takes care of the work that arrives while you are asleep.

It leans on Supabase for the parts that should be boring and solid — database,
sign-in, storage, live updates, server functions — and adds a clean React app on
top. **Wondering why a small business would run this? Read [WHY.md](./WHY.md).**

## What you get

- 💬 **A shared assistant.** Replies stream as they are written, persist, and sync
  across your devices. Attach files and it reads them. Walk away mid-answer and it
  still finishes and saves.
- 📄 **Things you can hand over.** Turn any reply into a document, code file or web
  page, then share it privately, with the team, by secret link, or publicly — with
  an optional password.
- 📚 **Collections.** Group related documents, files, tasks, links, tables and
  boards into a named set, then chat with exactly that set. Each one shows how much
  of the model's attention it would fill.
- 📁 **Files that become knowledge.** Uploaded PDFs are indexed automatically and
  become searchable by the whole team, with sources cited. Any document can be kept
  to yourself.
- ✅ **The everyday stuff** — to-dos, bookmarks, a glossary, spreadsheet-style
  tables that are real database tables, whiteboards and card walls you can edit
  together in real time, and meeting notes recorded in the browser.
- 🧠 **Memory.** The assistant remembers your name, your defaults and your ongoing
  projects, so a new conversation is not a blank page. It is yours alone.
- 🛠️ **Tools.** Give the assistant real abilities — web search, email, your own
  HTTP endpoints, whole external services. Adding a capability is adding a row, not
  shipping code.
- 🤖 **Agents and automation.** Package instructions plus tools as an agent, then
  run it on a schedule, from a webhook, or whenever something happens in the
  workspace. Every run keeps a step-by-step trace.
- 🪝 **Webhooks and APIs.** Give an outside system a URL, or push work in over
  plain REST from a script or a Zap.
- 💬 **Slack.** Bind a channel to a collection and the assistant answers in the
  room, either on mention or by reading along and chiming in when it helps.
- 📧 **Email.** Send and receive, with mail landing in one unified inbox alongside
  messages from everywhere else.
- 🔌 **Connect Claude.** Point Claude Code or Claude Desktop at your workspace and
  say "build an agent that does X" — it appears in your dashboard.
- 🛡️ **Guardrails, security scans and evals.** Cheap pre-flight checks enforced in
  code, a repeatable scan of your own configuration, and a way to measure whether a
  cheaper model still does the job.
- 💸 **Costs in the open.** Every model call's tokens and cost are recorded, with a
  breakdown by model, area and person.
- 🔐 **Invite-only, and yours.** The first person to sign up becomes the admin;
  after that only invited people can join, enforced by the database.
- 📱 **Works on a phone**, and installs as an app if you want it to.

The model key lives **only** on the server. Your data is protected by database-level
access rules, not by hiding a key.

> CLUADE DESKTOP INTEGRATION

![](images/claude-desktop-integration.png)

## How it fits together

```
Browser (React SPA) → Supabase (Postgres + access rules · Auth · Realtime · Storage · Edge Functions) → OpenRouter
```

The browser holds a session and the public key, and reads and writes tables
directly — the database decides what it may see. Anything that needs a secret or
must act for someone else happens in a server function. Every model call goes
through OpenRouter, so any model is one admin change away.

[docs/architecture.md](./docs/architecture.md) explains it properly in a page.

<img width="2684" height="1820" alt="CleanShot 2026-06-21 at 21 43 49@2x" src="https://github.com/user-attachments/assets/77f646c0-2855-4c19-9504-2b155143deba" />

## Tech stack

- **Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · React Router
- **Backend:** Supabase — Postgres, Auth, Realtime, Storage, Edge Functions (Deno)
- **AI:** any model via [OpenRouter](https://openrouter.ai) through a streaming edge function
- **Hosting:** any static host; first-class config for [Railway](https://railway.app)

## Quick start (local)

<img width="2650" height="1572" alt="CleanShot 2026-06-21 at 21 44 26@2x" src="https://github.com/user-attachments/assets/49efe409-dda5-4c15-8142-5e6f9c0f1d44" />

**You will need:** Node 20, a [Supabase](https://supabase.com) project, an
[OpenRouter API key](https://openrouter.ai/keys), and the
[Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
# 1. Install
npm install

# 2. Configure the frontend
cp .env.example .env.local
#   then set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (Project Settings → API)

# 3. Create the database
supabase link --project-ref <your-project-ref>
supabase db push                 # applies every migration in order

# 4. Deploy the server functions and the model key
supabase secrets set OPENROUTER_API_KEY=sk-or-...
supabase functions deploy

# 5. Run
npm run dev                      # http://localhost:5173
```

Sign up — you are the admin — and start chatting.

> **Tip for a first run:** in Supabase → Authentication → Providers → Email, turn
> off **"Confirm email"** so password signups log in immediately. The built-in
> email sender is rate-limited.

After this, you never run those commands by hand again: pushing to `main` rebuilds
the frontend, redeploys changed functions, and applies new migrations.

## Environment variables

| Where | Variable | Notes |
| --- | --- | --- |
| Frontend (build-time) | `VITE_SUPABASE_URL` | Your Supabase project URL. Inlined into the bundle. |
| Frontend (build-time) | `VITE_SUPABASE_ANON_KEY` | Public by design — access rules protect the data. |
| Server secret | `OPENROUTER_API_KEY` | Required. Never in the repo, never in the bundle. |
| Server secret | `OPENROUTER_MODEL` | Optional fallback slug, used only if the model settings cannot be read. |
| Server secret | `OPENROUTER_EFFORT` | Optional reasoning effort: `low`, `medium` or `high`. |

`VITE_*` values are read at **build time** — set them before the build runs.

Which model each part of the system uses is a setting, not a variable: **Settings →
Models** points the `orchestrator` and `utility` profiles at any OpenRouter model.

## Deploying

<img width="2734" height="1802" alt="CleanShot 2026-06-21 at 21 44 55@2x" src="https://github.com/user-attachments/assets/808cb448-146e-4c5d-8ab4-20929e9d59fa" />

Two pieces go live: the Supabase backend and the static frontend. Railway is wired
up out of the box — connect the repo, set the two `VITE_*` variables, deploy, and
add the resulting URL to Supabase's auth settings so login links come back to your
app.

Step-by-step, including the Site URL detail that catches everyone:
[**DEPLOY.md**](./DEPLOY.md).

## Connect Claude

Generate a token in **Settings → Connect Claude**, then connect from whichever
Claude you use. Claude Code takes one command:

```bash
claude mcp add --scope user --transport http intranet https://<your-project>.supabase.co/functions/v1/mcp --header "Authorization: Bearer <your-token>"
```

Claude Desktop runs MCP servers as local processes, so it needs a small bridge
entry in its config file — the settings page generates that too, with your URL and
token already filled in. You can also skip tokens entirely and connect by pasting
the URL and approving: see [MCP connector OAuth](./docs/mcp-oauth.md).

## Documentation

| Read this | If you want |
| --- | --- |
| [docs/README.md](./docs/README.md) | The index of everything written down |
| [docs/architecture.md](./docs/architecture.md) | The pieces and the ideas behind them |
| [docs/workspace.md](./docs/workspace.md) | What each area of the app is for |
| [docs/automation.md](./docs/automation.md) | Agents, schedules, events, webhooks, workers |
| [docs/integrations.md](./docs/integrations.md) | Claude, Slack, email, external services, REST |
| [docs/governance.md](./docs/governance.md) | Invites, guardrails, security, evals, costs |
| [CLAUDE.md](./CLAUDE.md) | How to work in this repository |
| [ROADMAP.md](./ROADMAP.md) | Where this is going |

## Security model

- The browser only ever holds the **public** key. Row-level security is what
  protects data — every table states who may read and write each row.
- Files live in a private store scoped to their owner; sharing is a deliberate act
  that mints a time-limited link or publishes a copy.
- The **OpenRouter key** and every other credential live server-side, in Supabase
  Vault. Never in the repo, never in the bundle, never in a log.
- Calls that reach the model require a valid session, and anything triggered from
  outside the workspace runs read-only unless you explicitly allow otherwise.

## Contributing

1. Fork and clone.
2. `npm install`, then follow **Quick start** to point at your own Supabase project.
3. Read [CLAUDE.md](./CLAUDE.md) — it is short, and it is what reviewers expect.
4. Make sure `npm run build`, `npm test` and `npm run lint` pass.
5. Open a pull request that explains what changed and why.

## Origins

This is the third iteration of an idea [Alfred Nutile](https://github.com/alnutile)
has been building and writing about since 2023 — before "agents" was a product
category:

- **[LaraChain → LaraLlama](https://github.com/LlmLaraHub/larallama)** (2023–2024, now
  archived) — document collections you could chat with, email and web ingestion,
  multi-LLM workflows, and outputs deployable as chatbots and APIs. Built in Laravel,
  shipped before the major platforms offered these as features.
- **[*PHP and LLMs*](https://leanpub.com/php_and_llms)** — the book written along the
  way: patterns for building LLM applications, learned from shipping one.
- **[The video series](https://youtube.com/playlist?list=PLL8JVuiFkO9K7oEwcQo8lzijczKm7ccuS&si=Pjitnmo5-y4v1oUT)**
  — walkthroughs of those systems being designed and built, as it happened.

The idea was early; the 2023 models weren't ready for it. They are now. This project
is the same vision — a team's shared, tool-using AI workspace on infrastructure it
owns — rebuilt from scratch on Supabase and current models.

## License

MIT — see [`LICENSE`](./LICENSE). Use it, fork it, build your own intranet.
