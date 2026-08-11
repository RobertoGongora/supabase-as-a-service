# AGENTS.md

Conventions for any coding agent working in this repository. They are the same
conventions humans follow — [CLAUDE.md](./CLAUDE.md) is the full version, and
this file is the short one. Read that before a non-trivial change.

## Orientation

- [docs/architecture.md](./docs/architecture.md) — how the system is put together
- [docs/features.md](./docs/features.md) — what each feature area does
- [docs/operations.md](./docs/operations.md) — environments, CI, migrations
- [docs/README.md](./docs/README.md) — the documentation index

## The rules that matter most

1. **Verify before you finish.** `npm run build`, `npm test`, plus
   `npm run test:deno` if you touched `supabase/functions/`, and `npm run lint`.
2. **Test the logic you add.** Extract pure logic into a module and test the
   module; keep components and handlers thin.
3. **Commit messages carry no attribution trailers.** No `Co-authored-by:`, no
   "Generated with", no session links. One imperative summary, a short why, and
   `Closes #123` when there's an issue.
4. **Never commit to `release`.** It only receives `main` by merge. Feature work
   goes on a branch and lands by PR; maintainers work trunk-based on `main`.
5. **Never weaken row-level security**, and re-enforce the same access rule in
   any code that runs as the service role.
6. **No secrets in the frontend.** The anon key is the only key that ships to the
   browser; everything else belongs in Supabase Vault or an edge secret.
7. **Never hardcode a model id.** Features bind to a named model profile that an
   admin controls.
8. **Migration numbers must be unique and contiguous** — re-check the next free
   number immediately before pushing, and regenerate the typed schema after a
   schema change.
9. **Update the docs in the same change.** Say what a thing does and why, not how
   it's implemented; keep examples to one line.
10. **Don't widen or narrow the task.** Do what was asked, finish it, and say
    plainly what you did and didn't do.
