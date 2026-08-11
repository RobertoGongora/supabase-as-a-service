import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CodeIcon } from '../components/icons'
import { useIsAdmin } from './settings/shell'

// Embeds the workspace's self-hosted T3 Code server: ONE persistent shared
// coding environment (not a session per user), shown here for visibility.
// The server URL is deployment-specific, so it lives in workspace_settings
// (key 'code_url', admin-written) rather than in code — no row means the
// feature simply isn't configured for this workspace. Pairing happens inside
// the embedded app and persists per browser.
const SETTING_KEY = 'code_url'

export default function CodePage() {
  const { user } = useAuth()
  const { isAdmin } = useIsAdmin()
  const [url, setUrl] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('workspace_settings')
      .select('value')
      .eq('key', SETTING_KEY)
      .maybeSingle()
    setUrl(data?.value || null)
    setReady(true)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const save = async () => {
    const value = draft.trim().replace(/\/+$/, '')
    if (!value || !user) return
    setSaving(true)
    await supabase.from('workspace_settings').upsert({
      key: SETTING_KEY,
      value,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    await load()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <CodeIcon className="h-4 w-4 shrink-0 text-muted" />
          <h1 className="truncate text-sm font-semibold">Code</h1>
          <span className="hidden truncate text-xs text-muted sm:inline">
            interactive coding sessions on the workspace code server
          </span>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted hover:text-text"
          >
            Open in new tab ↗
          </a>
        )}
      </div>

      {ready && !url && (
        <div className="mx-auto mt-16 w-full max-w-md px-4 text-center">
          <p className="text-sm font-medium">No code server configured</p>
          <p className="mt-2 text-xs text-muted">
            This view embeds a self-hosted T3 Code server. An admin sets its URL
            here once the server is running.
          </p>
          {isAdmin && (
            <div className="mt-4 flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="http://code.example.internal"
                className="min-w-0 flex-1 rounded-md border border-border bg-bg px-3 py-1.5 text-sm"
              />
              <button
                onClick={() => void save()}
                disabled={saving || !draft.trim()}
                className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>
      )}

      {url && !loaded && (
        <p className="border-b border-border bg-bg px-4 py-2 text-xs text-muted">
          Connecting to {url} — if this never loads, the code server is not
          running or not reachable from your network.
        </p>
      )}
      {url && (
        <iframe
          src={url}
          title="Code"
          onLoad={() => setLoaded(true)}
          className="w-full flex-1 border-0"
        />
      )}
    </div>
  )
}
