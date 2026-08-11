# Roadmap

Where this project is headed, and why.

## The thesis

AI is becoming a metered utility. The systems that win are the ones that squeeze the
most value out of every token: shared context so nothing gets explained twice, the
right-sized model for each job, and clear visibility into what everything costs. A
workspace that *accumulates* context gets cheaper per task over time — the opposite of
tools that start from zero every conversation.

The development sequence is deliberate: prove it works on the best model first, then
drive the cost down and prove it keeps working. Every model call goes through
OpenRouter, so any model — hosted or local — is one admin edit away.

## Shipped

The foundations the rest of this roadmap builds on are in place:

- **Shared knowledge** — uploaded documents join the team knowledge base by default,
  with a per-document "Only me" opt-out, and search fuses meaning with exact keywords
  so names and IDs aren't missed.
- **Model profiles** — named job slots (`orchestrator`, `utility`) that features bind
  to, so swapping a model is one admin edit rather than a code change.
- **Cost visibility** — every model call records its tokens and real price; the admin
  Usage page shows totals, a daily chart and breakdowns by model, context and person,
  next to the live account balance.
- **Guardrails** — a cheap pre-flight check whose verdict is enforced in code, with
  inbound traffic read-only unless explicitly opened up.
- **Measurement** — evaluation suites that grade answers *and* assert which tools were
  used, plus thumbs-up/down feedback captured with what produced each answer.
- **Loops** — goal-directed runs that score themselves and stop at a dollar cap.
- **Security posture** — a repeatable scan over configuration, with findings that
  remember being accepted and can be promoted into work.

## Next: cost — cap it and shrink it

1. **Budgets.** A soft monthly cap per workspace: warn admins as it approaches, require
   an admin nod to go past it. No surprise bills.
2. **Model routing.** Keep the strongest model for interactive, high-stakes work and
   route routine unattended jobs to cheaper ones — per-agent model choice first, then
   automatic escalation: start cheap, step up only when the task demands it.
3. **Prompt caching.** Always-on prompts and tool definitions are identical on every
   call. Stop paying full price to resend them.

## Next: knowledge that compounds

- **Artifacts feed the knowledge base** ([spec](./docs/tasks/artifact-knowledge.md)) —
  proposals and docs made *in* the system get indexed, so last week's proposal is
  context for this week's. Privacy follows the artifact: private ones compound only for
  their owner.
- **Retrieval over injection** — scope large collections by relevance instead of
  injecting their full content, so a big collection stays affordable.

## Next: the proposal workflow, finished

The pieces exist — knowledge-grounded drafting, artifacts, share links. What turns them
into a workflow a business runs on:

- **Artifact versions** — snapshot on share, so editing a proposal after sending it
  never silently changes what the client sees.
- **View tracking** — "your client opened the proposal" in the live activity feed.
- **A nicer share page** — light branding, and an accept or sign-off action.

## Later

- **Agent-to-agent collaboration** — agents that talk to each other, not just to
  people: one person's scheduling agent negotiating with another's, a project agent
  keeping follow-ups in sync. The workspace becomes where agents find one another.
- **One-command install and a hosted front door** — the provisioning engine exists
  ([control-plane/](./control-plane/README.md)); the goal is "deploy your own" without
  a terminal.
- **Workspace export.** One button: conversations, artifacts and files as a portable
  archive. "You own your data" should be demonstrable.
- **Scanned-PDF ingestion** — vision extraction for documents with no text layer.
- **Richer team spaces** — roles beyond admin and member, comments, shared views.
- **Run it locally** — a fully local option, private networking included.

Smaller ideas that aren't scheduled live in [TODO.md](./TODO.md), and anything a team
member files in the app lands on the Features board.

---

Have an opinion on the ordering, or want one of these badly? Open an issue.
