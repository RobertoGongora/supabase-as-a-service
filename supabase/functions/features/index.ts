// Supabase Edge Function: `features` (verify_jwt=true, ADMIN ONLY).
//
// The GitHub side of the Features kanban. Lane moves with side effects call
// here; plain moves go straight to the table.
//   approve → open a GitHub issue (title + description + signed screenshot
//             URLs) labeled `approved-for-work`. Two build paths pick it up:
//             the Claude Code GitHub Action (.github/workflows/claude-feature.yml)
//             on cloud deployments, or — when a local builder capability is
//             registered via AGENT_JOBS_EXTRA_CAPABILITIES — a directly
//             enqueued `agent_jobs` row (capability `builder`) that a
//             self-hosted worker claims and turns into a PR. The board is the
//             single source of approvals: the label is informative, workers
//             act on the queue row, never on out-of-band label changes.
//   sync    → find the PR linked to the issue (timeline cross-references) and
//             refresh its state; a merged PR moves the card to `shipped`.
//   merge   → squash-merge the PR (the "approved to merge" lane). Merging main
//             is deploying: Railway rebuilds the app and the supabase-deploy
//             workflow applies migrations + redeploys edge functions.
//
// Auth: verify_jwt validates the caller's token; we additionally require
// profiles.is_admin. The GitHub PAT lives ONLY in the team vault (secret
// `github_pat`) and is read via the service-role `read_vault_secret` RPC —
// same posture as every other credential in this system.

import { createClient } from 'npm:@supabase/supabase-js@2.45.4'

const GITHUB_REPO = Deno.env.get('GITHUB_REPO') ?? 'alnutile/supabase-as-a-service'
const GH_API = 'https://api.github.com'
const APPROVED_LABEL = 'approved-for-work'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

function userIdFromAuth(req: Request): string | null {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

// deno-lint-ignore no-explicit-any
async function gh(pat: string, method: string, path: string, body?: unknown): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`${GH_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    // some endpoints return empty bodies
  }
  return { ok: res.ok, status: res.status, data }
}

// deno-lint-ignore no-explicit-any
type DB = any

// A local builder is "configured" when the functions runtime registers the
// builder capability (same env the agent_jobs builtins read). Deterministic
// gate: no env → cloud-only behavior, byte-identical to upstream.
function builderConfigured(): boolean {
  try {
    const extra = JSON.parse(Deno.env.get('AGENT_JOBS_EXTRA_CAPABILITIES') ?? '{}')
    return Array.isArray(extra?.builder) && extra.builder.includes('builder.build_issue')
  } catch {
    return false
  }
}

// Enqueue the build job for a self-hosted builder worker. The job contract is
// host-agnostic on purpose: `host` names the git backend ('github' today;
// forgejo/gitea/gitlab later) and `repo` is owner/name on that host, so the
// worker never assumes github.com. Failures are logged but never fail the
// approve — the issue exists either way and the job can be enqueued by hand.
async function enqueueBuildJob(
  db: DB,
  userId: string,
  feature: { id: string; title: string },
  issueNumber: number,
): Promise<void> {
  try {
    const { error } = await db.from('agent_jobs').insert({
      requested_by: userId,
      capability: 'builder',
      operation: 'builder.build_issue',
      status: 'queued',
      instructions: `Build feature "${feature.title}" from issue #${issueNumber} and open a PR.`,
      parameters: { issue_number: issueNumber, repo: GITHUB_REPO, host: 'github' },
      idempotency_key: `builder:${GITHUB_REPO}#${issueNumber}`,
    })
    if (error) throw new Error(error.message)
    await db.from('activity_log').insert({
      type: 'feature.build_enqueued',
      summary: `Build job queued for issue #${issueNumber}: ${feature.title}`,
      detail: { feature_id: feature.id, issue_number: issueNumber, repo: GITHUB_REPO, host: 'github' },
      actor_id: userId,
    })
  } catch (err) {
    await db.from('activity_log').insert({
      type: 'feature.build_enqueue_failed',
      summary: `Could not queue build job for issue #${issueNumber}: ${err instanceof Error ? err.message : 'error'}`,
      detail: { feature_id: feature.id, issue_number: issueNumber, repo: GITHUB_REPO },
      actor_id: userId,
    }).catch(() => {})
  }
}

async function issueBody(db: DB, feature: { description: string; screenshots: string[]; id: string }): Promise<string> {
  const parts = [feature.description || '(no description provided)']
  const shots: string[] = []
  for (const path of feature.screenshots ?? []) {
    // Signed URLs so the coding agent (and reviewers) can see the images. Kept
    // SHORT (24h, not days): on a public repo the issue is world-readable, so
    // every hour of validity is an hour the private-bucket screenshot is
    // public. The agent runs within minutes of approval; a reviewer who needs
    // the image later can re-open it from the board card. Note GitHub proxies
    // rendered images through its camo cache, so treat anything screenshotted
    // as published the moment the issue opens — the TTL only bounds NEW reads
    // of the original file.
    const { data } = await db.storage.from('files').createSignedUrl(path, 24 * 3600)
    if (data?.signedUrl) shots.push(`![screenshot](${data.signedUrl})`)
  }
  if (shots.length) parts.push('## Screenshots', shots.join('\n\n'))
  parts.push(
    '---',
    '_Filed from the Features board._',
    `<!-- feature:${feature.id} -->`,
  )
  return parts.join('\n\n')
}

// Find the PR that references the issue via timeline cross-references.
async function findLinkedPr(pat: string, issueNumber: number): Promise<{ number: number; url: string } | null> {
  const { ok, data } = await gh(pat, 'GET', `/repos/${GITHUB_REPO}/issues/${issueNumber}/timeline?per_page=100`)
  if (!ok || !Array.isArray(data)) return null
  let found: { number: number; url: string } | null = null
  for (const ev of data) {
    const src = ev?.source?.issue
    if (ev?.event === 'cross-referenced' && src?.pull_request && src?.number) {
      found = { number: src.number, url: src.pull_request.html_url ?? src.html_url }
    }
  }
  return found
}

async function syncRow(db: DB, pat: string, row: { id: string; issue_number: number | null; pr_number: number | null }) {
  let prNumber = row.pr_number
  let prUrl: string | undefined
  if (!prNumber && row.issue_number) {
    const linked = await findLinkedPr(pat, row.issue_number)
    if (linked) {
      prNumber = linked.number
      prUrl = linked.url
    }
  }
  if (!prNumber) return { pr_number: null, pr_state: null }
  const { ok, data } = await gh(pat, 'GET', `/repos/${GITHUB_REPO}/pulls/${prNumber}`)
  if (!ok) return { pr_number: prNumber, pr_state: null }
  const state = data.merged ? 'merged' : data.state // open | closed | merged
  const update: Record<string, unknown> = {
    pr_number: prNumber,
    pr_url: prUrl ?? data.html_url,
    pr_state: state,
    updated_at: new Date().toISOString(),
  }
  if (state === 'merged') update.lane = 'shipped'
  await db.from('features').update(update).eq('id', row.id)
  return update
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const userId = userIdFromAuth(req)
  if (!userId) return json({ error: 'unauthorized' }, 401)
  const { data: profile } = await db.from('profiles').select('is_admin').eq('id', userId).maybeSingle()
  if (!profile?.is_admin) return json({ error: 'Admins only.' }, 403)

  const { data: pat } = await db.rpc('read_vault_secret', { p_name: 'github_pat', p_user_id: null })
  if (!pat || typeof pat !== 'string') {
    return json({ error: 'Add a workspace secret named "github_pat" (a GitHub token with repo scope) in Secrets first.' }, 400)
  }

  let body: { action?: string; id?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400)
  }
  const { action, id } = body
  if (!id) return json({ error: 'id is required.' }, 400)

  const { data: feature } = await db.from('features').select('*').eq('id', id).maybeSingle()
  if (!feature) return json({ error: 'Feature not found.' }, 404)

  try {
    if (action === 'approve') {
      if (feature.issue_number) return json({ error: 'An issue already exists for this feature.' }, 400)
      const bodyText = await issueBody(db, feature)
      const { ok, status, data } = await gh(pat, 'POST', `/repos/${GITHUB_REPO}/issues`, {
        title: feature.title,
        body: bodyText,
        labels: [APPROVED_LABEL],
      })
      if (!ok) {
        const msg = `GitHub issue creation failed (${status}): ${data?.message ?? 'unknown'}`
        await db.from('features').update({ last_error: msg, updated_at: new Date().toISOString() }).eq('id', id)
        return json({ error: msg }, 502)
      }
      await db.from('features').update({
        lane: 'approved',
        issue_number: data.number,
        last_error: null,
        updated_at: new Date().toISOString(),
      }).eq('id', id)
      await db.from('activity_log').insert({
        type: 'feature.approved',
        summary: `Feature approved for work: ${feature.title}`,
        detail: { feature_id: id, issue: data.html_url },
        actor_id: userId,
      })
      if (builderConfigured()) {
        await enqueueBuildJob(db, userId, feature, data.number)
      }
      return json({ ok: true, issue_number: data.number, issue_url: data.html_url })
    }

    if (action === 'sync') {
      const update = await syncRow(db, pat, feature)
      return json({ ok: true, ...update })
    }

    if (action === 'merge') {
      // Refresh first so we merge the real linked PR.
      const synced = await syncRow(db, pat, feature)
      const prNumber = (synced.pr_number as number | null) ?? feature.pr_number
      if (!prNumber) return json({ error: 'No PR is linked to this feature yet.' }, 400)
      if (synced.pr_state === 'merged') return json({ ok: true, already: true })
      const { ok, status, data } = await gh(pat, 'PUT', `/repos/${GITHUB_REPO}/pulls/${prNumber}/merge`, {
        merge_method: 'squash',
      })
      if (!ok) {
        const msg = `Merge failed (${status}): ${data?.message ?? 'unknown'}`
        await db.from('features').update({ last_error: msg, lane: 'ready', updated_at: new Date().toISOString() }).eq('id', id)
        return json({ error: msg }, 502)
      }
      await db.from('features').update({
        lane: 'shipped',
        pr_state: 'merged',
        last_error: null,
        updated_at: new Date().toISOString(),
      }).eq('id', id)
      await db.from('activity_log').insert({
        type: 'feature.shipped',
        summary: `Feature merged: ${feature.title}`,
        detail: { feature_id: id, pr: feature.pr_url },
        actor_id: userId,
      })
      return json({ ok: true })
    }

    return json({ error: `Unknown action: ${action}` }, 400)
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'error' }, 500)
  }
})
