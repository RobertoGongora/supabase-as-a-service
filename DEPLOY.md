# Deploying

Two pieces go live: the **Supabase backend** (database, auth, storage, realtime, and the edge functions) and the **React frontend** (hosted on Railway).

## 1. Supabase backend

1. Apply the schema. `supabase/migrations/` is the single source of truth — every file, in order, not just `0001_init.sql`:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
2. Set the one required secret and deploy the functions:
   ```bash
   supabase secrets set OPENROUTER_API_KEY=sk-or-...
   supabase functions deploy          # deploys every function under supabase/functions
   ```
   `verify_jwt` per function comes from `supabase/config.toml`, so the public token-gated functions (`webhook`, `mcp`, `p`, `run-tool`, …) stay `verify_jwt = false` on deploy.
3. Grab **Project URL** and **anon/publishable key** (Project Settings → API).

> After this one-time setup you never run these by hand again: `deploy-migrations.yml` and `deploy-functions.yml` apply migrations and redeploy functions on every push to `main`, and `deploy-migrations.yml` also calls `setup_automation_cron` so the pg_cron ticks (scheduler, event dispatcher, ingest, email poll) schedule themselves.

## 2. Frontend on Railway

Railway builds the Vite app (Nixpacks) and runs `npm run start`, which is `node server.js` — a small Express server that serves `dist/` with SPA fallback **and** fronts the MCP connector's OAuth discovery at the app's own domain (see [`docs/mcp-oauth.md`](./docs/mcp-oauth.md)). See `railway.json` and the `start` script.

1. In Railway: **New Project → Deploy from GitHub repo** → pick this repo (`main`).
2. Add **service variables** (read at *build* time — Vite inlines them into the bundle):
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon/publishable key (public by design — RLS protects the data)
3. Deploy. Railway runs `npm install` → `npm run build` → `npm run start` (serves `dist/` on `$PORT` with SPA fallback).
4. Open the generated Railway URL. Add that URL to Supabase **Auth → URL Configuration → Site URL / Redirect URLs** so magic links and email confirmations redirect back correctly.

### Notes
- `VITE_*` variables must exist **before the build runs**. If you add them after the first deploy, trigger a redeploy so they get baked in.
- The OpenRouter key lives only as a Supabase edge-function secret — never in Railway, never in the bundle.
- `server.js` proxies `/mcp` and `/mcp-oauth/*` to the edge functions. It derives the target from `VITE_SUPABASE_URL`; set `SUPABASE_FUNCTIONS_URL` only if you need to point it somewhere else.
- Optional edge-function secrets: `FORGE_PAT` (a Supabase personal access token — required for Forge and for the in-app "Update core functions" button) and `FORGE_PROJECT_REF` (only when the ref can't be derived from `SUPABASE_URL`). Note that a secret name may not start with `SUPABASE_`; the platform reserves that prefix.
