# Roadmap

Where this project is headed, and why.

## The thesis

AI is becoming a metered utility. As usage grows, the systems that win are the
ones that **squeeze the most value out of every token**: shared context so
nothing gets explained twice, the right-sized model for each job, and clear
visibility into what everything costs. A workspace that *accumulates* context
gets cheaper per task over time — the opposite of pay-per-seat tools that start
from zero every conversation.

The sequence is deliberate: **prove it works on the best model first, then drive
the cost down and prove it keeps working.** Models run through OpenRouter, so any
model — hosted or local — is one admin edit away.

## Landed

The foundations this roadmap was originally written to reach are in:

- **Shared team knowledge** — uploaded PDFs join the workspace knowledge base by
  default, with a per-document "Only me" opt-out, and retrieval fuses semantic
  and keyword search so exact names and IDs are found alongside paraphrases.
  Answers cite their source and say when the brain holds nothing.
- **Model profiles** — features bind to named job slots (`orchestrator`,
  `utility`), re-pointed in Settings without a code change.
- **Cost visibility** — every model call records tokens and cost; the Usage page
  breaks spend down by model, context and person beside the live balance.
- **Guardrails** — a cheap pre-flight check whose verdict is enforced in code,
  failing closed for anything arriving from outside.
- **The automation spine** — events, listeners, schedules with real cron, agent
  run traces, a unified inbox with routing, and Slack rooms bound to collections.
- **Evals** — suites that grade answers *and* tool usage, comparable across
  models, safe to re-run on a schedule.
- **Measurement of the workspace itself** — a repeatable security posture scan
  whose findings can be promoted straight onto the Features board.

## Now: cost you can cap, not just watch

1. **Budgets.** A soft monthly cap per workspace: warn admins as it approaches,
   require a nod to go past it. No surprise bills.
2. **Model routing.** Per-agent model choice, then automatic escalation — start
   cheap, step up only when the task demands it. Unattended work shouldn't run on
   the most expensive model by default.
3. **Prompt caching.** Always-on prompts and tool definitions are identical on
   every call; stop paying full price to resend them.

## Next: finish the proposal workflow

The pieces exist — grounded drafting, artifacts, share links with passwords.
What turns them into a workflow a business runs on:

- **Artifact versions** — snapshot on share, so editing a proposal after sending
  it never silently changes what the client sees.
- **View tracking** — "your client opened the proposal", in the live feed.
- **A nicer share page** — light branding and an accept/sign-off action.
- **Keep shared pages out of search engines** — an unlisted link should stay
  link-only even if it reaches a crawler.

## Next: context that compounds

- **Artifacts feed the knowledge base** — work made *in* the system gets indexed
  on create and edit, so last week's proposal is context for this week's, with
  privacy following the artifact's own visibility.
- **Retrieval for collections** — search a collection instead of injecting it
  whole, so a large collection stops competing with the conversation for room.
- **Scanned-PDF ingestion** — vision extraction for documents with no text layer.

## Later

- **One-command install and a hosted option** — the same provisioning engine
  behind both, so "deploy your own" stops requiring a terminal.
- **Workspace export.** One button: conversations, artifacts and files as a
  portable archive. "You own your data" should be demonstrable.
- **Richer team spaces** — roles beyond admin and member, comments, per-space
  sharing.
- **More capability workers** — PDF/OCR, browser, image — on the existing job
  protocol.
- **Agent-to-agent collaboration** — agents that talk to each other, not only to
  people, with the workspace as the place they discover one another.

---

Have an opinion on the ordering, or want one of these badly? Open an issue — or
file it on the in-app Features board, where an approved card becomes a branch and
a PR.
