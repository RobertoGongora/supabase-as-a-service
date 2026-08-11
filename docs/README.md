# Documentation index

Everything written down in this repository, and who each piece is for. Start
wherever your question sits.

## Start here

| Read this | If you want |
| --- | --- |
| [README](../README.md) | What this is, what you get, and how to run it |
| [WHY](../WHY.md) | The case for a small business owning a workspace like this |
| [CLAUDE.md](../CLAUDE.md) | How we work in this repository — conventions, commands, the map |
| [AGENTS.md](../AGENTS.md) | The same conventions, for agents that look for that filename |
| [ROADMAP](../ROADMAP.md) | Where this is heading and why |
| [DEPLOY](../DEPLOY.md) | Getting your own copy live |

## The system

| Document | Covers |
| --- | --- |
| [architecture.md](./architecture.md) | The pieces, the four ideas behind them, the data model, who can see what |
| [workspace.md](./workspace.md) | Home, chat, artifacts, collections, files, to-dos, links, tables, boards, memory, notes, inbox, skills |
| [automation.md](./automation.md) | Tools, agents, schedules, events and listeners, webhooks, loops, workers, Forge |
| [integrations.md](./integrations.md) | Connecting Claude, external MCP servers, Slack, email, the REST APIs |
| [governance.md](./governance.md) | Invites, guardrails, security scans, evals, usage, activity, flags, secrets |

## Feature guides

Deeper detail on one area, usually because it needs setup steps.

| Document | Covers |
| --- | --- |
| [artifacts-api.md](./artifacts-api.md) | REST endpoints for pushing and syncing artifacts |
| [todos-api.md](./todos-api.md) | REST endpoints for to-dos |
| [events-and-inbox.md](./events-and-inbox.md) | The event substrate, listener rules, and every way mail arrives |
| [slack.md](./slack.md) | Connecting the Slack app, binding channels, the app manifest |
| [mcp-oauth.md](./mcp-oauth.md) | Connecting Claude by pasting a URL and approving |
| [playwright-mcp.md](./playwright-mcp.md) | Browser automation through an external MCP server |
| [capability-workers.md](./capability-workers.md) | The job queue and the Docker workers that run heavy libraries |

## Elsewhere in the repository

| Location | Covers |
| --- | --- |
| [workers/README.md](../workers/README.md) | Running and building the capability workers |
| [control-plane/README.md](../control-plane/README.md) | The hosted-offering provisioning backend |
| [skills/](../skills/) | Skill files seeded into the workspace, including the worker contracts |
| [specs/](../specs/) | Exploratory specifications, not yet built |

## Design notes

`docs/tasks/` holds the specification written *before* a feature was built. They
are kept for the reasoning — the problem, the options weighed, the choice made —
and are not maintained afterwards, so where one disagrees with the pages above, the
pages above are right.

| Note | Subject | Built? |
| --- | --- | --- |
| [artifact-knowledge.md](./tasks/artifact-knowledge.md) | Indexing artifacts into the knowledge base | Not yet |
| [email-tools.md](./tasks/email-tools.md) | Email as a capability, credentials in the vault | Shipped |
| [generative-ui.md](./tasks/generative-ui.md) | Richer chat UI from a constrained catalog | Not yet |
| [guardrails.md](./tasks/guardrails.md) | Cheap-model pre-flight checks enforced in code | Shipped |
| [hosted-control-plane.md](./tasks/hosted-control-plane.md) | The hosted signup and provisioning service | In progress |
| [loops.md](./tasks/loops.md) | Goal-directed runs that stop at a price cap | Shipped |
| [mcp-desktop-connect.md](./tasks/mcp-desktop-connect.md) | The Claude Desktop connection path | Shipped |
| [mcp-file-upload.md](./tasks/mcp-file-upload.md) | Uploading files over MCP | Shipped |
| [model-profiles.md](./tasks/model-profiles.md) | Naming the job instead of the model | Shipped |
| [one-command-install-and-hosted.md](./tasks/one-command-install-and-hosted.md) | One provisioning engine, two front doors | In progress |
| [resilient-streaming.md](./tasks/resilient-streaming.md) | Not losing a reply when you navigate away | Shipped |
| [share-noindex-hardening.md](./tasks/share-noindex-hardening.md) | Keeping shared artifacts out of search engines | Not yet |
| [shared-knowledge.md](./tasks/shared-knowledge.md) | Team-shared PDF knowledge by default | Shipped |

## Keeping this honest

Two habits keep documentation from drifting:

- When a change alters what someone can do, update the page that describes it in
  the same commit.
- When you add a document, add it to this index. A unit test checks that every
  file under `docs/` is listed here, so a missing row fails the build.
