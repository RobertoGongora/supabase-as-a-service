# AGENTS.md

The conventions for this repository live in **[CLAUDE.md](./CLAUDE.md)** — one file,
so there is nothing to keep in sync. Read it before you change anything.

What the system does is described in the [documentation index](./docs/README.md).

The short version, if you read nothing else:

- Verify with `npm run build` and `npm test`; add `npm run test:deno` when you touch
  `supabase/functions/`.
- Put logic that can be wrong in a pure module (`src/lib/`,
  `supabase/functions/_shared/`) with a test beside it.
- Implement what was asked and nothing more.
- Commit with one imperative summary line under 70 characters and a short body
  saying why. No co-author trailers and no tool advertisements.
- Give every migration the next free `NNNN_` prefix, and check that it is still
  free right before you push.
- Never weaken row-level security, never hardcode a model id, and never put a
  credential anywhere but the vault.
- Update the documentation page that describes the behavior you changed, in the
  same commit.
