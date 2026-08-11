# Documentation

Start here. Everything in the repo that is meant to be read, in one list.

## For everyone

| Document | What it covers |
| --- | --- |
| [../README.md](../README.md) | What this project is, what you get, and how to run it |
| [../WHY.md](../WHY.md) | Why a small business would own a workspace like this |
| [../ROADMAP.md](../ROADMAP.md) | Where the project is heading, and what already landed |

There is also a public docs site at
[supanet-docs.dailyai.studio](https://supanet-docs.dailyai.studio/), kept in sync
from this repo on merge.

## Understanding the system

| Document | What it covers |
| --- | --- |
| [architecture.md](./architecture.md) | The shape of the system and the ideas behind it |
| [features.md](./features.md) | Every feature area: what it's for and where it lives |

## Feature deep dives

| Document | What it covers |
| --- | --- |
| [events-and-inbox.md](./events-and-inbox.md) | Events, listeners, the unified inbox, and IMAP mailboxes |
| [slack.md](./slack.md) | The Slack bot, channel bindings, and ambient participation |
| [mcp.md](./mcp.md) | Connecting Claude to the workspace, and the workspace to other MCP servers |
| [mcp-oauth.md](./mcp-oauth.md) | The paste-a-URL-and-approve connector flow |
| [playwright-mcp.md](./playwright-mcp.md) | Browser automation through an external MCP server |
| [capability-workers.md](./capability-workers.md) | Handing heavy jobs to Docker workers |

## Integrating from outside

| Document | What it covers |
| --- | --- |
| [artifacts-api.md](./artifacts-api.md) | REST CRUD for artifacts, with collection tagging |
| [todos-api.md](./todos-api.md) | REST CRUD for to-dos |

The in-app **API** page renders the same reference with your own base URL and a
token already selected.

## Building and operating

| Document | What it covers |
| --- | --- |
| [operations.md](./operations.md) | Environments, secrets, CI, migrations, tenant rollout |
| [../DEPLOY.md](../DEPLOY.md) | The short path to a first deploy |
| [../CLAUDE.md](../CLAUDE.md) | Conventions for anyone — human or agent — changing this repo |
| [../AGENTS.md](../AGENTS.md) | The same conventions, for non-Claude coding agents |

## Component READMEs

| Document | What it covers |
| --- | --- |
| [../workers/README.md](../workers/README.md) | The capability-worker workspace |
| [../control-plane/README.md](../control-plane/README.md) | Provisioning for the hosted offering |
| [../skills/](../skills/) | Skill documents seeded into the workspace |

## Archive

| Document | What it covers |
| --- | --- |
| [tasks/](./tasks/) | Design specs written before a feature was built; historical |
| [../specs/artifacts/spec.md](../specs/artifacts/spec.md) | An early exploration of hosting bundled SPAs; not implemented |
| [../TODO.md](../TODO.md) | The maintainer's informal idea list |
