# Deploying

Two pieces go live: the **Supabase backend** (database, auth, storage, realtime, the
edge functions) and the **React frontend**. Set them up once, and after that landing a
change on `main` updates everything.

## 1. Supabase backend

1. Link the project and create the schema — this applies every file in
   `supabase/migrations/` in order:
   ```bash
   supabase link --project-ref <your-project-ref> && supabase db push
   ```
2. Set the model key and deploy the functions:
   ```bash
   supabase secrets set OPENROUTER_API_KEY=sk-or-... && supabase functions deploy
   ```
3. Copy the **Project URL** and **anon key** (Project Settings → API) for the frontend.

Optional secrets: `FORGE_PAT` (a Supabase personal access token) enables deploying
functions from inside the app; a workspace secret named `OPENAI_KEY`, added in
Settings → Secrets, enables meeting transcription.

## 2. Frontend on Railway

Railway builds the Vite app and serves the result with the small Express server in
`server.js` (SPA fallback, plus the MCP connector routes).

1. **New Project → Deploy from GitHub repo** → this repo, `main`.
2. Add **service variables** — they're read at *build* time, so they must exist before
   the first build:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (public by design — row-level security protects the data)
3. Deploy. Railway runs `npm install` → `npm run build` → `npm run start`.
4. Add the generated URL to Supabase **Authentication → URL Configuration** (Site URL
   and Redirect URLs), or magic links and email confirmations will redirect to
   localhost.

## 3. Keeping it updated

Pushing to `main` is the deploy:

| What changed | What happens |
| --- | --- |
| Frontend code | Railway rebuilds and redeploys. |
| `supabase/functions/**` | The functions workflow deploys the changed functions. |
| `supabase/migrations/**` | The migrations workflow applies what's pending, then re-schedules the workspace's background jobs. |

Those two workflows need repository secrets **Settings → Secrets and variables →
Actions**:

| Secret | What it is |
| --- | --- |
| `SUPABASE_ACCESS_TOKEN` | A Supabase personal access token (Dashboard → Account → Access Tokens). |
| `SUPABASE_DB_PASSWORD` | The project's database password. Applying migrations connects straight to Postgres, so the token alone isn't enough. |

The project ref defaults in the workflows and can be overridden with a repository
variable `SUPABASE_PROJECT_REF`.

If you run several tenant projects, the release fan-out applies migrations and
functions to each live tenant when `main` is merged into `release`. Never commit
directly to `release` — see [AGENTS.md](./AGENTS.md).

## Notes

- Add a `VITE_*` variable after the first deploy? Trigger a rebuild so it gets baked in.
- The OpenRouter key lives only as a Supabase edge-function secret — never in Railway,
  never in the bundle.
- Which model answers is a database setting (Settings → Models), so changing it doesn't
  need a deploy.
