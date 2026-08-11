# Feature specs (archive)

Each file here is the proposal that was written **before** a feature was built: the
problem, the shape of the solution, and the trade-offs considered at the time. They
are kept because the reasoning is useful — not because they describe today's code.

For current behaviour, read [CLAUDE.md](../../CLAUDE.md) or the area doc in
[docs/](../README.md). Where the two disagree, the code wins.

## Shipped

| Spec | Became |
| --- | --- |
| [Shared knowledge](./shared-knowledge.md) | Uploaded documents are workspace knowledge by default, with an "Only me" opt-out. |
| [Email tools](./email-tools.md) | `send_email` / `check_email`, provider config in Settings, keys in Vault. |
| [Guardrails](./guardrails.md) | Pre-flight checks enforced in code, blocking or flagging a run. |
| [Model profiles](./model-profiles.md) | Named model slots (`orchestrator`, `utility`) an admin re-points. |
| [Loops](./loops.md) | Goal-directed runs that score themselves and stop at a price cap. |
| [Resilient streaming](./resilient-streaming.md) | Replies finish server-side, so leaving the page no longer loses them. |
| [MCP file upload](./mcp-file-upload.md) | File tools the assistant and an external Claude both use. |
| [MCP desktop connect](./mcp-desktop-connect.md) | Settings → Connect Claude emits a snippet for Code and Desktop. |

## In progress

| Spec | Where it stands |
| --- | --- |
| [Hosted control plane](./hosted-control-plane.md) | The provisioning engine exists in [control-plane/](../../control-plane/README.md); signup and billing are not wired end to end. |
| [One-command install](./one-command-install-and-hosted.md) | Same engine, second front door. Still a terminal run today. |

## Not built

| Spec | Note |
| --- | --- |
| [Artifacts feed the knowledge base](./artifact-knowledge.md) | Documents index today; artifacts made in the workspace do not. |
| [Generative UI in chat](./generative-ui.md) | Idea only. |
| [Keep shared artifacts out of search engines](./share-noindex-hardening.md) | Idea only. |
