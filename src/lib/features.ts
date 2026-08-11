// Pure list-merge helpers for the Features board's Realtime subscription.
// Kept out of the component so the upsert/remove/sort logic is unit-testable.
// The board renders `features` ordered by `updated_at` descending (newest edit
// first), the same order the initial `load()` query uses.

export interface FeatureLike {
  id: string
  updated_at: string
}

/**
 * Insert or replace `row` in `list` by id, then sort by `updated_at` descending.
 * Used for Realtime INSERT and UPDATE events — an UPDATE replaces the stale copy
 * (e.g. a freshly-synced PR link), an INSERT for an unseen id just adds it.
 */
export function upsertFeature<T extends FeatureLike>(list: T[], row: T): T[] {
  const without = list.filter((f) => f.id !== row.id)
  return [row, ...without].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
}

/** Drop the row with `id` from `list` (Realtime DELETE event). */
export function removeFeature<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter((f) => f.id !== id)
}

// --- Multi-repo boards ------------------------------------------------------
// A `feature_boards` row binds a board to one GitHub repo. A card with
// `board_id = null` is on the implicit DEFAULT board, whose repo is the
// function's `GITHUB_REPO` env var — so a workspace with no boards behaves
// exactly like the original single-board page. The browser mirror of
// `supabase/functions/_shared/feature_boards.ts` (same convention as cron.ts).

/** `owner/name` — the shape GitHub REST paths accept. Mirrors REPO_PATTERN. */
const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/

/** Is `repo` a well-formed `owner/name` slug? Gates the "New board" form. */
export function isValidRepo(repo: unknown): repo is string {
  return typeof repo === 'string' && REPO_PATTERN.test(repo.trim())
}

/** The id used for the default board in the switcher (not a real row id). */
export const DEFAULT_BOARD_ID = null

/**
 * The cards belonging to `boardId` — `null` selects the default board, i.e.
 * every card that has no `board_id` (including cards orphaned by a deleted
 * board, since the FK is `on delete set null`).
 */
export function featuresForBoard<T extends { board_id?: string | null }>(
  list: T[],
  boardId: string | null,
): T[] {
  return list.filter((f) => (f.board_id ?? null) === boardId)
}
