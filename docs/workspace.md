# The workspace

The areas a person uses day to day. Everything here is a normal table with normal
access rules, and everything here is also reachable by the assistant — so anything
you can do by clicking, you can ask for in chat.

## Home

A live picture of what is going on: quick actions, tiles for open to-dos,
artifacts, files and events this week, a fourteen-day activity trend, a realtime
feed, and your open to-dos with an inline tick-box.

You can also compose your own tiles. Describe a tile in the "Add widget" prompt and
the assistant creates it; it renders by querying one of an allow-listed set of
sources under your own permissions, so a saved widget can never surface someone
else's rows. A second tab keeps the feature index and the ⌘K search.

## Chat

The main way to work with the assistant. Replies stream token by token, persist to
the database, and sync live across your devices.

- **It finishes what it starts.** Once a reply begins, the server sees it through
  and saves it, so reloading the page or walking away mid-answer does not lose it.
  **Stop** genuinely cancels: nothing is saved.
- **Attach files** with the paperclip. They land in your Files area and the
  assistant reads them — images and PDFs as content, text inlined.
- **Scope a conversation** to one or more collections with the picker, so the
  assistant answers out of exactly that material. Each collection shows its
  estimated size against the current model's context window, so you can tell
  whether it fits before you send.
- **Arm a skill** by typing `/`. The composer is pre-filled with the invocation and
  you add context before sending, rather than firing on the click.
- **Work beside an artifact.** Creating or opening an artifact in chat pins it in a
  live panel next to the thread; ask for a change and it updates in place.
- **Team threads.** Add other members to a conversation and it becomes a group
  chat: people talk to each other for free, and the assistant only joins when a
  message contains `@ai`. Everyone posts as themselves.

## Artifacts

Documents, code, HTML pages and notes — the things you make and hand to someone.
Write one yourself or ask the assistant to turn a reply into one.

- **Share deliberately:** private, workspace-wide, unlisted (anyone with the link),
  or public. Shared artifacts are served to anonymous visitors, and an HTML
  artifact can also be viewed as a clean, full-page site of its own.
- **Add a password** to a shared artifact when a link alone is not enough. Until
  the password is right, the row is not readable at all — the gate is in the
  database, not the page.
- **Illustrate it.** Paste, drop or attach an image into the body and it is
  uploaded and linked at your cursor. Those images stay reachable for anonymous
  visitors, forever.
- **Make it interactive.** An HTML artifact can be a small stateful app — a
  tracker, a checklist, a board — whose state is saved as people click. It runs
  sandboxed, so the page never sees your credentials.
- **Deleting archives.** A deleted artifact is hidden everywhere but recoverable
  from the Trash panel until you delete it for good. The same is true of skills.

There is also a plain REST API for pushing artifacts in from scripts, Zaps and cron
jobs — see [the artifacts API](./artifacts-api.md).

## Collections

A named set of related material — the unit you chat with. Anything can be filed
into one: artifacts, files, to-dos, links, tables, whiteboards, card boards,
terminology and inbox messages.

Select items anywhere in the app and file them with the "Add to collection" bar, or
open the Collections page for a per-collection dashboard with a chat bubble that
answers about that set and files new work straight back into it. Scoping a chat to
several collections merges them and counts overlapping items once.

## Files

A private per-person store with sharing when you want it.

- **Share in bulk:** select files and hand out either a signed link that expires in
  an hour, a day or a week, or a permanent public link.
- **Publishing copies the file** into a public bucket, so the URL keeps working
  forever and is safe to bake into a public page. Unpublishing removes that copy;
  the private original is untouched.
- **PDFs become team knowledge.** An uploaded PDF is indexed automatically and
  becomes searchable by anyone's chat, with the source cited. Flip any document to
  "Only me" to keep it out. Only the extracted text is shared — the file itself
  stays private.
- **The assistant can write files too**, which matters most for output it
  generates, like a chart or an image that only exists as data.

## To-dos

A task list that plugs into collections. Title, notes, due date, a tick-box, and
drag-to-reorder. Keep a list private or share it with the team, where anyone can
tick items off. A collection you chat with carries its tasks alongside its
documents, and there is a [REST API](./todos-api.md) for syncing them from
elsewhere.

## Links

Shared bookmarks. Paste a URL and the title, description, preview image and favicon
fill themselves in — the page is fetched server-side, so it works for pages your
browser could never read cross-origin. A screenshot can be attached to a link when
one is captured. Links file into collections like everything else.

## Tables

Real Postgres tables with a spreadsheet-style editor. Create one by hand or by
describing it; add columns, edit rows, share the table with the team.

The browser never runs schema changes directly — every structural change goes
through a validated routine that allows only known column types and safely-quoted
names, so any member can create tables without opening an injection surface. The
assistant can list, query, and write rows, and an update always requires a filter
so it cannot rewrite a whole table by accident.

**Public write-forms.** A table can accept submissions from people who are not
signed in — a contact form or signup sheet embedded in a shared page — without
exposing the table. You choose which columns the form may write; a public endpoint
enforces that allow-list, forces the owner, checks required fields and rate-limits
abuse. Reads stay closed. See the `supanet-table-forms` skill for the embedding
details.

## Whiteboards

Excalidraw canvases for planning. Private or shared with the team, and shared
boards are genuinely collaborative — other people's edits and cursors appear live,
and the board is saved continuously as the durable copy.

The assistant reads a board as text and can draw on it: ask for a flowchart, or ask
what is on the board.

## Cards

A free-form card wall, deliberately not a kanban. Double-click to add a card, drag
it anywhere; position is the ranking. Multiplayer like whiteboards, and the
assistant can dump a brain-dump into cards or tell you the top priority.

Each board has its own persistent chat thread, so the conversation about a board
lives with it and shows up in your chat list.

## Memory

A personal profile the assistant carries between conversations — your name,
defaults, tone, stack, ongoing projects, standing preferences — so a fresh chat is
not a blank slate. Memories are owner-only and never leak into someone else's
context.

Review, pin, edit and forget them on the Memory page; the assistant writes here
too, and a seeded prompt teaches it what is worth keeping (durable facts yes,
secrets and one-offs no). Chat and scheduled runs load your memories; webhook and
Slack runs deliberately do not, because those face the outside world.

## Meeting notes

Record a meeting in the browser, get a running transcript, and save it as an
artifact when you are done. An in-progress recording survives a page reload, a chat
panel lets you ask about the meeting as it happens, and saving emits a dedicated
event so an automation can react to *meetings* specifically rather than to every
new artifact.

## Terminology

The house glossary: a term, its definition, notes and where it came from. Terms
file into collections, so a collection you chat with carries the vocabulary your
business actually uses alongside its documents.

## Inbox

One place for messages from anywhere — email, Slack, WhatsApp, a script, a form.
Filter by source, mark read, file messages into collections, or compose one by
hand.

Mail arrives two ways: pushed in by a provider or a script, or pulled from an IMAP
mailbox you register. Every arriving message raises an event, so "when mail lands
here, do X" is an ordinary automation rule. See
[events, listeners and the inbox](./events-and-inbox.md).

## Skills and prompts

Two modes of the same thing.

- **Always-on prompts** shape every conversation — a built-in explanation of how
  the workspace works, plus whatever context an admin adds about your business.
- **On-demand skills** are personal and run when you pick them from `/` in chat.

Skills can be written in the app or imported from a markdown file or a GitHub URL,
and the Skills page shows how often each one is actually used, so stale ones are
easy to spot.
