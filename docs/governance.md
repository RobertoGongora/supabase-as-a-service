# Governance and insight

The admin surfaces: who gets in, what the assistant is allowed to do, what it
costs, whether it is any good, and what actually happened.

## People

The first person to sign up becomes the admin and the workspace is invite-only from
then on. Admins invite two ways in **Settings → Invite people**: add an address to
the allowlist, or mint a shareable link and hand it out. Opening the link lets
someone sign up with their own email — the link authorizes an email, it never
creates an account, so the same database-level check still gates every signup. Links
can carry an expiry, a use limit and a revoke switch.

Admins can also disable an account or remove a person, and disabling is reversible,
which is usually what you want first.

## Guardrails

Pre-flight checks run by a cheap model *before* the main model sees a request:
does this payload try to redirect the agent, does this message carry secrets or
personal data. Each guardrail says what to look for, where it applies (chat,
webhooks), and what to do — block the run or just flag it.

Two properties make this a boundary rather than advice:

- The verdict comes back as **data and is enforced in code**. It is never pasted
  into the main prompt, where an untrusted payload could argue with it.
- **Webhooks fail closed** — if the check itself errors, the run is blocked.
  **Chat fails open**, because a broken checker should not stop a person working.

Every outcome is recorded. A prompt-injection screen ships switched on for
webhooks.

## Security

A repeatable posture scan over your configuration, not a model's opinion: webhooks
without a shared secret, webhooks that allow tools, missing blocking guardrails,
email without a recipient allowlist, workspace-wide secrets, active external MCP
connections, tokens unused for months, the inventory of public artifacts, and
whether you have only one admin.

Findings carry a stable identity, so accepting a risk or promoting a finding sticks
across re-runs instead of nagging you again. **Promote to feature** files a finding
onto the Features board, where the normal approval flow takes over. Run the scan
from the dashboard, on a schedule, or by asking in chat — it is an ordinary tool,
so it works everywhere tools work. Progress ticks through live while it runs.

## Evals

Measure whether the assistant is actually good at your work, and whether a cheaper
model still is. A suite is a set of cases; a run scores them and keeps the results.

- **Grade the answer** against a reference or a rubric.
- **Grade the behavior** — which tools were called, with what arguments, how many
  times, and crucially which tools were *not* called. "An untrusted input must
  never send email" is a test you can run.
- **Ground it in a collection**, so the assistant answers out of exactly the
  material you care about.
- **Compare models** on the same suite in one go and read a best-first scorecard.

Runs are sandboxed by default: read-only capabilities really execute, everything
with a side effect is captured but not run, so a suite is safe to re-run on a
schedule. Opt out deliberately when you want a real integration test.

## Usage and cost

Every model call records its tokens and cost. The Usage page shows totals, a daily
chart, and a breakdown by model, by context and by person, alongside your live
account balance at the gateway. It is visibility, deliberately — budgets and
enforcement are the next step, not a hidden brake.

## Activity

A live feed of what is happening across the workspace: webhook events, tool calls,
artifacts, uploads, guardrail decisions, secret reads. You see your own rows;
admins see everything. It is written by the database and the server, never by the
browser, so it is a record rather than a claim.

## Feedback

Mark any reply as good or bad with an optional note. The Feedback page summarizes
what has been landing well and what has not, which is the raw material for both
prompt changes and eval cases.

## Features

The self-improvement board. Ideas move through lanes, and the lane moves are the
approvals: approving one opens a GitHub issue that the build automation picks up,
and the final lane merges the resulting pull request. Deliberately human-gated —
nothing spends effort or ships without someone moving a card.

## Feature flags

Feature hiding, not permissions. Switching an area off removes it from the sidebar
and the ⌘K palette for the whole workspace, because you do not use it or are still
deciding. The data is still protected by the database — hiding a link never gates a
route — and core areas plus every settings page can never be hidden, so nobody can
lock themselves out of the page that manages the flags. Changes apply live.

## Workspace settings

Small workspace-wide choices an admin makes once: the **timezone** every unattended
run treats as local, the **models** each profile points at, the **email** and
**Slack** connections, and the external MCP servers. Admins write, everyone reads,
and changes take effect without a deploy.

## Secrets

A vault for the credentials the team — and the assistant — needs: API keys, tokens,
passwords. Values live only in Supabase Vault; the database holds a pointer. A
secret is either shared with the workspace or kept to its owner and admins.

The assistant can list secret *names* freely, which is how it discovers what is
available, but reading a value is a separate, logged capability that can be scoped
away from any agent — because a returned credential is as sensitive as sending
mail.
