# Documentation index

Everything written down about this project, in one list. Start with whichever row
matches what you're doing.

## Start here

| Document | What it covers |
| --- | --- |
| [README](../README.md) | What the product is, what you get, and how to run it. Written for people evaluating or installing it. |
| [WHY](../WHY.md) | The case for a small business running its own workspace. |
| [CLAUDE](../CLAUDE.md) | The engineering map: every feature area, what it does, where it lives. |
| [AGENTS](../AGENTS.md) | How we work here — branches, commits, tests, migrations, doc style. |
| [ROADMAP](../ROADMAP.md) | Where the project is heading and what shipped already. |
| [TODO](../TODO.md) | Parked ideas that aren't scheduled yet. |
| [DEPLOY](../DEPLOY.md) | Taking a workspace live and keeping it updated. |

## Feature areas

| Document | What it covers |
| --- | --- |
| [Artifacts REST API](./artifacts-api.md) | Push and sync documents from a script, a Zap, or a cron job with a bearer token and `curl`. |
| [To-dos REST API](./todos-api.md) | The same plain-REST surface for tasks. |
| [Events, listeners & the unified inbox](./events-and-inbox.md) | The automation stream, "when this / do this" rules, and every way a message gets into the workspace — including IMAP mailboxes. |
| [Slack bot](./slack.md) | Binding a Slack channel to a collection, mention-only or ambient replies, and the app setup. |
| [MCP connector OAuth](./mcp-oauth.md) | Connecting Claude by pasting a URL and approving, instead of copying a token. |
| [Playwright over MCP](./playwright-mcp.md) | Giving the workspace a real browser, and re-exposing those tools to your desktop AI. |
| [Capability workers](./capability-workers.md) | Offloading heavy jobs (Office documents, audio and video) to containers through a durable job queue. |

## Other packages in this repo

| Document | What it covers |
| --- | --- |
| [workers/](../workers/README.md) | The worker runtime and the two shipped workers. |
| [control-plane/](../control-plane/README.md) | Provisioning a dedicated workspace per customer for the hosted offering. |
| [skills/](../skills/capability-workers.md) | Skill files seeded into the workspace so the assistant knows how to use the workers. |

## Background and archive

| Document | What it covers |
| --- | --- |
| [Feature specs (`docs/tasks/`)](./tasks/README.md) | The original proposal for each major feature. Historical — read the area doc above for current behaviour. |
| [Hosted SPA sketch](../specs/artifacts/spec.md) | An unbuilt idea for serving multi-file apps from storage. Not implemented. |
