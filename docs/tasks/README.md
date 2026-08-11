# Task specs (archive)

These are the design specs written *before* a feature was built — the thinking,
the trade-offs, and the acceptance criteria at the time. They are kept for
context, not as current documentation.

**Read them as history.** Where a spec and the running system disagree, the
system is right; [../features.md](../features.md) and
[../architecture.md](../architecture.md) describe what actually exists today.

| Spec | Status |
| --- | --- |
| [shared-knowledge.md](./shared-knowledge.md) | Shipped — uploaded PDFs are workspace knowledge by default, with an "Only me" opt-out |
| [model-profiles.md](./model-profiles.md) | Shipped — features bind to named job slots, re-pointed in Settings → Models |
| [guardrails.md](./guardrails.md) | Shipped — pre-flight checks enforced in code, fail closed for untrusted input |
| [email-tools.md](./email-tools.md) | Shipped — send and check email, with Vault-backed provider keys |
| [loops.md](./loops.md) | Shipped — goal-directed runs with a rubric, an iteration cap and a price cap |
| [mcp-desktop-connect.md](./mcp-desktop-connect.md) | Shipped — Settings → Connect Claude generates both snippets |
| [mcp-file-upload.md](./mcp-file-upload.md) | Shipped — the assistant creates files, including binary output |
| [resilient-streaming.md](./resilient-streaming.md) | Shipped — a reply survives a reload; Stop still truly cancels |
| [hosted-control-plane.md](./hosted-control-plane.md) | In progress — see [../../control-plane/](../../control-plane/) |
| [one-command-install-and-hosted.md](./one-command-install-and-hosted.md) | In progress — the same engine behind self-install and hosted signup |
| [artifact-knowledge.md](./artifact-knowledge.md) | Not built — work made *in* the system doesn't yet feed the knowledge base automatically |
| [share-noindex-hardening.md](./share-noindex-hardening.md) | Not built — shared pages emit no robots directive yet |
| [generative-ui.md](./generative-ui.md) | Not built — an exploration of catalog-constrained rich chat output |

New work does not need a spec here. Ideas belong on the in-app **Features** board
(or [../../ROADMAP.md](../../ROADMAP.md) for direction); a spec is worth writing
when a change is large enough that the design deserves review before the code.
