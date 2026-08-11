# Roadmap

Where this project is headed, and why.

## The thesis

AI is becoming a metered utility. As usage grows, the systems that win are the ones
that **squeeze the most value out of every token**: shared context so nothing gets
explained twice, the right-sized model for each job, and clear visibility into what
everything costs. A workspace that *accumulates* context gets cheaper per task over
time — the opposite of pay-per-seat tools that start from zero every conversation.

The sequence is deliberate: **prove it works on the best model first, then drive the
cost down and prove it still works.** Every model call goes through OpenRouter, so
any model — hosted or local — is one admin change away.

## Already here

The foundation is built. Briefly, so the list below reads in context: a shared
assistant with team knowledge and per-person memory, artifacts you can share and
protect, collections you chat with, agents that run on schedules and events,
webhooks and REST APIs, Slack and email in both directions, a connection for
external Claude clients, guardrails enforced in code, security scans, evals with
model comparison, and per-call cost tracking. See the
[documentation index](./docs/README.md) for what each of those does.

## Now: make context compound

The core promise — every piece of work makes the next one faster, for the whole
team — has one gap left.

- **Artifacts feed the knowledge base**
  ([spec](./docs/tasks/artifact-knowledge.md)) — proposals and documents *made in
  the system* get indexed as they are written, so last week's proposal is context
  for this week's. Privacy follows the artifact: a private one compounds only for
  its owner. Files already work this way; the things you make do not yet.

## Next: cost — cap it and shrink it

Spend is visible today. The remaining work is acting on it.

1. **Budgets.** A soft monthly cap per workspace: warn the admins as it approaches,
   require an admin nod to blow past it. No surprise bills.
2. **Model routing.** The best model for interactive, high-stakes work; cheaper
   models for routine unattended runs. Per-agent model choice first, then automatic
   escalation — start cheap, step up only when the task demands it. The evals
   already exist to prove a cheaper model still passes.
3. **Prompt caching.** Always-on prompts and tool definitions are identical on
   every call. Cache them instead of paying to resend them.
4. **Per-agent cost attribution** and an export, so "this workflow costs us $11 a
   month" is a number you can point at.

## Next: the proposal workflow, finished

The pieces exist — knowledge-grounded drafting, artifacts, share links with
passwords. What turns them into a workflow a business runs on:

- **Artifact versions** — snapshot on share, so editing a proposal after sending it
  never silently changes what the client sees.
- **View tracking** — "your client opened the proposal", in the live feed.
- **A nicer share page** — light branding, and an accept or sign-off action.

## Later

- **One-command install.** Keep grinding the setup friction down, including a flow
  where Claude performs the Supabase setup itself, so "deploy your own" stops
  requiring a terminal.
- **Workspace export.** One button: conversations, artifacts and files as a
  portable archive. "You own your data" should be demonstrable.
- **Scanned-PDF ingestion** — vision extraction for documents with no text layer.
- **Richer team spaces** — roles beyond admin and member, comments, more of the
  workspace shareable per group.
- **Agent-to-agent collaboration** — agents that talk to each other, not only to
  people: one person's scheduling agent negotiating with another's, a project agent
  keeping notes and follow-ups in sync.
- **Keeping shared pages out of search engines**
  ([spec](./docs/tasks/share-noindex-hardening.md)) — an unlisted link should stay
  unlisted.

---

Have an opinion on the ordering, or want one of these badly? Open an issue.
