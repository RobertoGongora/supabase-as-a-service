import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatDate } from '../lib/util'
import { featuresForBoard, isValidRepo, removeFeature, upsertFeature } from '../lib/features'
import { LinkIcon, PaperclipIcon, PlusIcon, TrashIcon } from '../components/icons'

// The self-improvement pipeline as a kanban. Lane moves are the approvals:
// idea → approved opens a GitHub issue the Claude Code action builds from;
// → ready merges the PR (merge = deploy). Side-effect moves go through the
// `features` edge function; plain metadata edits hit the table directly.
//
// Multi-repo: a `feature_boards` row is a board bound to one GitHub repo. The
// switcher's first tab is the DEFAULT board — cards with `board_id = null`,
// targeting the function's `GITHUB_REPO` env var — so a workspace with no
// boards is exactly the original single-board page.

interface Feature {
  id: string
  title: string
  description: string
  screenshots: string[]
  lane: Lane
  issue_number: number | null
  pr_number: number | null
  pr_url: string | null
  pr_state: string | null
  last_error: string | null
  owner_id: string | null
  board_id: string | null
  created_at: string
  updated_at: string
}

interface FeatureBoard {
  id: string
  name: string
  repo: string
  created_at: string
}

// The repo behind the default board is a server-side secret (`GITHUB_REPO` on
// the edge function). `VITE_GITHUB_REPO` is an OPTIONAL build-time mirror used
// only as a label — never as the value the function acts on.
const DEFAULT_REPO_LABEL: string | undefined = import.meta.env.VITE_GITHUB_REPO

type Lane = 'idea' | 'approved' | 'ready' | 'shipped'

const LANES: { key: Lane; title: string; hint: string }[] = [
  { key: 'idea', title: 'Ideas', hint: 'Anyone can add. Screenshots welcome.' },
  { key: 'approved', title: 'Approved for work', hint: 'AI builds it and opens a PR.' },
  { key: 'ready', title: 'Approved to merge', hint: 'Dropping here merges the PR.' },
  { key: 'shipped', title: 'Shipped', hint: 'Merged — deploy runs from main.' },
]

async function callFeaturesFn(action: 'approve' | 'sync' | 'merge', id: string) {
  const { data: sess } = await supabase.auth.getSession()
  const token = sess.session?.access_token
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/features`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ action, id }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
  return body
}

export default function FeaturesPage() {
  const { user } = useAuth()
  const [features, setFeatures] = useState<Feature[]>([])
  const [boards, setBoards] = useState<FeatureBoard[]>([])
  // null = the default board (cards with no board_id).
  const [boardId, setBoardId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [addingBoard, setAddingBoard] = useState(false)
  const [detail, setDetail] = useState<Feature | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<Lane | null>(null)
  const dragId = useRef<string | null>(null)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('features')
      .select('*')
      .order('updated_at', { ascending: false })
    setFeatures((data as unknown as Feature[]) ?? [])
    setLoading(false)
  }, [])

  const loadBoards = useCallback(async () => {
    const { data } = await supabase
      .from('feature_boards')
      .select('id, name, repo, created_at')
      .order('created_at', { ascending: true })
    setBoards((data as unknown as FeatureBoard[]) ?? [])
  }, [])

  useEffect(() => {
    load()
    loadBoards()
  }, [load, loadBoards])

  // If the selected board disappears (another admin deleted it), fall back to
  // the default board rather than rendering an empty phantom kanban.
  useEffect(() => {
    if (boardId && !boards.some((b) => b.id === boardId)) setBoardId(null)
  }, [boards, boardId])

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => setIsAdmin(Boolean(data?.is_admin)))
  }, [user])

  // Refresh PR state for in-flight cards when the board opens.
  useEffect(() => {
    if (!isAdmin) return
    const inFlight = features.filter((f) => f.issue_number && f.lane !== 'shipped')
    if (!inFlight.length) return
    Promise.allSettled(inFlight.map((f) => callFeaturesFn('sync', f.id))).then(() => load())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  // Live board: the PR link (and lane/state) lands on the row asynchronously —
  // the `features` edge function syncs it in the background, so without Realtime
  // the freshly-synced PR only shows after a manual reload (issue #104). Push
  // every INSERT/UPDATE/DELETE straight into the list (and the open detail).
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('features-board')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'features' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const id = (payload.old as { id?: string })?.id
          if (!id) return
          setFeatures((prev) => removeFeature(prev, id))
          setDetail((d) => (d?.id === id ? null : d))
          return
        }
        const row = payload.new as Feature
        if (!row?.id) return
        setFeatures((prev) => upsertFeature(prev, row))
        setDetail((d) => (d?.id === row.id ? row : d))
      })
      // A board created (or removed) elsewhere should appear in the switcher
      // without a reload — same reasoning as the `features` subscription above.
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feature_boards' }, () => {
        loadBoards()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, loadBoards])

  async function moveTo(feature: Feature, lane: Lane) {
    if (!isAdmin || feature.lane === lane) return
    setNotice(null)
    try {
      if (lane === 'approved' && !feature.issue_number) {
        if (!confirm(`Approve “${feature.title}” for AI work?\n\nThis opens a GitHub issue; the coding agent will implement it and open a PR for review.\n\n⚠️ If the repo is public, the issue is too: the card's title, description, and screenshots become publicly visible the moment it opens.`)) return
        await callFeaturesFn('approve', feature.id)
      } else if (lane === 'ready') {
        if (!confirm(`Merge the PR for “${feature.title}”?\n\nMerging main deploys to production (app + migrations + functions).`)) return
        await supabase.from('features').update({ lane: 'ready', updated_at: new Date().toISOString() }).eq('id', feature.id)
        await callFeaturesFn('merge', feature.id)
      } else {
        await supabase.from('features').update({ lane, updated_at: new Date().toISOString() }).eq('id', feature.id)
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Something went wrong.')
    }
    load()
  }

  async function deleteBoard(board: FeatureBoard) {
    // Only offered for an empty board, but re-check here: the count could have
    // changed under us, and a delete would strand those cards on the default
    // board (the FK is `on delete set null` — cards are never deleted).
    if (featuresForBoard(features, board.id).length) {
      setNotice('That board still has cards. Move or delete them first.')
      return
    }
    if (!confirm(`Delete the board “${board.name}” (${board.repo})?`)) return
    setNotice(null)
    const { error } = await supabase.from('feature_boards').delete().eq('id', board.id)
    if (error) {
      setNotice(error.message)
      return
    }
    setBoardId(null)
    loadBoards()
    load()
  }

  const board = boards.find((b) => b.id === boardId) ?? null
  const boardFeatures = featuresForBoard(features, boardId)
  const boardRepo = board ? board.repo : DEFAULT_REPO_LABEL

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-8 pb-1">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Features</h1>
          <p className="mt-1 text-sm text-muted">
            Ideas in, shipped code out. Dragging a card is the approval: into{' '}
            <strong>Approved for work</strong> the AI builds it (PR for review); into{' '}
            <strong>Approved to merge</strong> the PR merges and deploys.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong"
        >
          <PlusIcon className="h-4 w-4" /> New idea
        </button>
      </div>

      {notice && (
        <div className="mx-6 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {notice}
        </div>
      )}

      {/* Board switcher — one board per GitHub repo. With no boards there is
          nothing to switch between, so only the admin's "New board" affordance
          renders and the page stays the single-board kanban it has always been. */}
      {(boards.length > 0 || isAdmin) && (
        <div className="flex flex-wrap items-center gap-2 px-6 pt-3">
          {(boards.length ? [null, ...boards.map((b) => b.id)] : []).map((id) => {
            const b = boards.find((x) => x.id === id) ?? null
            const active = boardId === id
            const count = featuresForBoard(features, id).length
            return (
              <button
                key={id ?? 'default'}
                onClick={() => setBoardId(id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-left ${
                  active
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-border bg-surface text-muted hover:border-border-strong'
                }`}
              >
                <span className="text-sm font-medium">{b ? b.name : 'Main'}</span>
                <span className="text-[11px] text-faint">{b ? b.repo : (DEFAULT_REPO_LABEL ?? 'default repo')}</span>
                <span className="rounded-full bg-surface-2 px-1.5 text-[11px] text-muted">{count}</span>
              </button>
            )
          })}
          {isAdmin && (
            <button
              onClick={() => setAddingBoard(true)}
              className="flex items-center gap-1 rounded-full border border-dashed border-border-strong px-3 py-1.5 text-xs font-medium text-muted hover:text-text"
            >
              <PlusIcon className="h-3.5 w-3.5" /> New board
            </button>
          )}
          {isAdmin && board && boardFeatures.length === 0 && (
            <button
              onClick={() => deleteBoard(board)}
              className="rounded-md p-1.5 text-faint hover:bg-red-50 hover:text-red-600"
              title={`Delete the “${board.name}” board`}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <div className="flex flex-1 gap-4 overflow-x-auto px-6 py-4">
        {LANES.map((lane) => {
          const cards = boardFeatures.filter((f) => f.lane === lane.key)
          return (
            <div
              key={lane.key}
              onDragOver={(e) => {
                if (!isAdmin) return
                e.preventDefault()
                setDragOver(lane.key)
              }}
              onDragLeave={() => setDragOver((d) => (d === lane.key ? null : d))}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(null)
                const f = features.find((x) => x.id === dragId.current)
                if (f) moveTo(f, lane.key)
              }}
              className={`flex w-72 shrink-0 flex-col rounded-xl border bg-surface-2/50 ${
                dragOver === lane.key ? 'border-primary ring-2 ring-primary-soft' : 'border-border'
              }`}
            >
              <div className="px-3 pt-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-text">{lane.title}</h2>
                  <span className="rounded-full bg-surface-2 px-2 text-xs text-muted">{cards.length}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-faint">{lane.hint}</p>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {cards.map((f) => (
                  <div
                    key={f.id}
                    draggable={isAdmin}
                    onDragStart={() => (dragId.current = f.id)}
                    onClick={() => setDetail(f)}
                    className="cursor-pointer rounded-lg border border-border bg-surface p-3 shadow-sm hover:border-border-strong"
                  >
                    <div className="text-sm font-medium text-text">{f.title}</div>
                    {f.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted">{f.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-faint">
                      {f.screenshots.length > 0 && (
                        <span className="flex items-center gap-1">
                          <PaperclipIcon className="h-3 w-3" /> {f.screenshots.length}
                        </span>
                      )}
                      {f.issue_number && (
                        <span className="rounded-full bg-surface-2 px-1.5 py-0.5">#{f.issue_number}</span>
                      )}
                      {f.pr_url && (
                        <a
                          href={f.pr_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium ${
                            f.pr_state === 'merged'
                              ? 'bg-emerald-100 text-emerald-700'
                              : f.pr_state === 'closed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-primary-soft text-primary'
                          }`}
                        >
                          <LinkIcon className="h-3 w-3" /> PR {f.pr_number} · {f.pr_state ?? 'open'}
                        </a>
                      )}
                      {f.issue_number && !f.pr_url && f.lane === 'approved' && (
                        <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-amber-700">building…</span>
                      )}
                      <span>{formatDate(f.updated_at)}</span>
                    </div>
                    {f.last_error && (
                      <p className="mt-2 rounded bg-red-50 px-2 py-1 text-[11px] text-red-700">{f.last_error}</p>
                    )}
                  </div>
                ))}
                {!loading && cards.length === 0 && (
                  <p className="px-1 py-2 text-center text-xs text-faint">Empty</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!isAdmin && (
        <p className="px-6 pb-3 text-xs text-faint">
          Anyone can file ideas; moving cards between lanes is admin-only.
        </p>
      )}

      {creating && (
        <NewIdeaModal
          boardId={boardId}
          boardName={board ? board.name : 'Main'}
          boardRepo={boardRepo}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            load()
          }}
        />
      )}
      {addingBoard && (
        <NewBoardModal
          onClose={() => setAddingBoard(false)}
          onSaved={(id) => {
            setAddingBoard(false)
            setBoardId(id)
            loadBoards()
          }}
        />
      )}
      {detail && (
        <DetailModal
          feature={detail}
          isAdmin={isAdmin}
          isOwner={detail.owner_id === user?.id}
          onClose={() => setDetail(null)}
          onChanged={() => {
            setDetail(null)
            load()
          }}
        />
      )}
    </div>
  )
}

function NewIdeaModal({
  boardId,
  boardName,
  boardRepo,
  onClose,
  onSaved,
}: {
  boardId: string | null
  boardName: string
  boardRepo: string | undefined
  onClose: () => void
  onSaved: () => void
}) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!title.trim() || !user) return
    setSaving(true)
    setError(null)
    try {
      const paths: string[] = []
      for (const file of files) {
        const path = `${user.id}/features/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const { error: upErr } = await supabase.storage.from('files').upload(path, file)
        if (upErr) throw new Error(`Screenshot upload failed: ${upErr.message}`)
        paths.push(path)
      }
      const { error: insErr } = await supabase.from('features').insert({
        title: title.trim(),
        description: description.trim(),
        screenshots: paths,
        lane: 'idea',
        owner_id: user.id,
        // null files it on the default board, which is every card today.
        board_id: boardId,
      })
      if (insErr) throw new Error(insErr.message)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-surface shadow-xl sm:rounded-2xl">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">New idea</h2>
          <p className="mt-0.5 text-[11px] text-faint">
            Filed on <strong className="font-medium text-muted">{boardName}</strong>
            {boardRepo ? ` · ${boardRepo}` : ''}
          </p>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Clicking a skill in chat should arm it, not send a message"
              className="w-full rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">
              Description — what's wrong / what you want. The coding agent reads this verbatim, so
              include where it happens and what "done" looks like.
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full resize-y rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">
              Screenshots (optional) — if an admin approves this card, they're posted to the GitHub
              issue (public on a public repo), so avoid capturing sensitive data.
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-text"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-hover">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !title.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Add idea'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Admin-only: bind a new kanban to a GitHub repository. The repo string is
// validated here AND by a check constraint AND by the edge function — it ends
// up interpolated into GitHub REST paths, so "owner/name" is a hard rule, not
// a formatting preference.
function NewBoardModal({ onClose, onSaved }: { onClose: () => void; onSaved: (id: string) => void }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [repo, setRepo] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const repoOk = isValidRepo(repo)

  async function save() {
    if (!name.trim() || !repoOk) return
    setSaving(true)
    setError(null)
    const { data, error: insErr } = await supabase
      .from('feature_boards')
      .insert({ name: name.trim(), repo: repo.trim(), created_by: user?.id ?? null })
      .select('id')
      .single()
    if (insErr || !data) {
      setError(insErr?.message ?? 'Could not create the board.')
      setSaving(false)
      return
    }
    onSaved(data.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-surface shadow-xl sm:rounded-2xl">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">New board</h2>
        </div>
        <div className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Marketing site"
              className="w-full rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">
              GitHub repository — <code>owner/name</code>. Approving a card on this board opens the
              issue here, and merging its PR deploys that repo.
            </span>
            <input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="acme/marketing-site"
              className="w-full rounded-lg border border-border-strong px-3 py-2 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
            />
          </label>
          {repo.trim() && !repoOk && (
            <p className="text-xs text-amber-700">Use the <code>owner/name</code> form, e.g. <code>acme/web</code>.</p>
          )}
          <p className="text-xs text-faint">
            The workspace secret <code>github_pat</code> must have access to this repository.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-hover">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !name.trim() || !repoOk}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create board'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailModal({
  feature,
  isAdmin,
  isOwner,
  onClose,
  onChanged,
}: {
  feature: Feature
  isAdmin: boolean
  isOwner: boolean
  onClose: () => void
  onChanged: () => void
}) {
  const [urls, setUrls] = useState<string[]>([])
  const canDelete = isAdmin || (isOwner && feature.lane === 'idea')

  useEffect(() => {
    let alive = true
    Promise.all(
      (feature.screenshots ?? []).map(async (p) => {
        const { data } = await supabase.storage.from('files').createSignedUrl(p, 3600)
        return data?.signedUrl ?? null
      }),
    ).then((u) => alive && setUrls(u.filter((x): x is string => Boolean(x))))
    return () => {
      alive = false
    }
  }, [feature])

  async function remove() {
    if (!confirm(`Delete “${feature.title}”?`)) return
    await supabase.from('features').delete().eq('id', feature.id)
    onChanged()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-surface shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">{feature.title}</h2>
          {canDelete && (
            <button onClick={remove} className="rounded-md p-1.5 text-faint hover:bg-red-50 hover:text-red-600" title="Delete">
              <TrashIcon className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <p className="whitespace-pre-wrap text-sm text-text">{feature.description || 'No description.'}</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            <span className="rounded-full bg-surface-2 px-2 py-0.5">{feature.lane}</span>
            {feature.issue_number && <span className="rounded-full bg-surface-2 px-2 py-0.5">issue #{feature.issue_number}</span>}
            {feature.pr_url && (
              <a href={feature.pr_url} target="_blank" rel="noreferrer" className="rounded-full bg-primary-soft px-2 py-0.5 text-primary">
                PR #{feature.pr_number} · {feature.pr_state ?? 'open'}
              </a>
            )}
          </div>
          {feature.last_error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{feature.last_error}</p>
          )}
          {urls.map((u) => (
            <img key={u} src={u} alt="screenshot" className="max-w-full rounded-lg border border-border" />
          ))}
        </div>
      </div>
    </div>
  )
}
