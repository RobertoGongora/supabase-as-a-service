# Deploying

The short path to a live workspace. Two pieces go up: the **Supabase backend**
(database, auth, storage, realtime, edge functions) and the **React frontend**.

For the full reference — every secret, the CI workflows, migration rules, and
multi-tenant rollout — see [docs/operations.md](./docs/operations.md).

## 1. Supabase backend

```bash
supabase link --project-ref <your-project-ref>
supabase db push                              # applies every migration in order
supabase secrets set OPENROUTER_API_KEY=sk-or-...
supabase functions deploy                     # deploys the repo's edge functions
```

Then grab the **Project URL** and **anon/publishable key** from
Project Settings → API.

Scheduled work (the agent scheduler, event dispatch, PDF ingestion, mailbox
polling) schedules itself as part of the migration run — there's nothing to wire
up by hand.

## 2. Frontend on Railway

1. Railway → **New Project → Deploy from GitHub repo** → this repo, `main`.
2. Add **service variables**, which Vite reads at *build* time:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your anon/publishable key (public by design; RLS
     protects the data)
3. Deploy. Railway installs, builds, and serves the static output with SPA
   fallback.
4. Open the generated URL and add it to Supabase
   **Auth → URL Configuration → Site URL / Redirect URLs**, so email confirmations
   and magic links come back to your app.

Sign up — the first account becomes the workspace admin.

## After the first deploy

Pushing to `main` keeps all three in sync: Railway rebuilds the frontend, and
GitHub Actions deploy changed edge functions and apply pending migrations. You
should not need to run `supabase` commands again.

## Two things that catch people out

- **`VITE_*` variables must exist before the build runs.** Adding them after the
  first deploy means triggering a redeploy so they get baked in.
- **The Site URL decides where auth emails send people.** If it still points at
  localhost, that's where your users land.

The OpenRouter key lives only as a Supabase edge-function secret — never in
Railway, never in the bundle.
