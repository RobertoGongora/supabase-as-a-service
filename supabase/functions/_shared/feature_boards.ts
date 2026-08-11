// Pure helpers for multi-repo Features boards.
//
// The Features kanban used to be bound to ONE GitHub repository via the
// `GITHUB_REPO` env var. A `feature_boards` row now binds a board to its own
// repo, and `features.board_id` says which board a card lives on. A card with
// `board_id is null` belongs to the implicit "default board", whose repo stays
// the env var — so a workspace with zero `feature_boards` rows behaves exactly
// as it did before.
//
// The resolution + repo-format rules are the only branching logic here, so they
// live in this module and are unit-tested (tests/feature_boards_test.ts) — the
// same "extract the logic, test the module" pattern as forms.ts / artifacts.ts.

/** `owner/name`, the only shape GitHub's REST paths accept from us. */
export const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/

export interface FeatureBoardLike {
  id: string
  repo: string
}

export interface FeatureLike {
  board_id?: string | null
}

/**
 * Is `repo` a well-formed `owner/name` slug? This is a hard gate, not cosmetics:
 * the value is interpolated into `/repos/{repo}/…` API paths, so a slash- or
 * space-bearing value could reach a different endpoint than intended.
 */
export function isValidRepo(repo: unknown): repo is string {
  return typeof repo === 'string' && REPO_PATTERN.test(repo.trim())
}

/** Trim + validate a user-supplied repo, returning null when it isn't usable. */
export function normalizeRepo(repo: unknown): string | null {
  if (typeof repo !== 'string') return null
  const trimmed = repo.trim()
  return REPO_PATTERN.test(trimmed) ? trimmed : null
}

/**
 * Which repository does this feature's GitHub work target?
 *
 * `board_id` → that board's repo; no board (or a board that has since been
 * deleted, which nulls the column via `on delete set null`) → the env default.
 * Returns null when the resolved repo is missing or malformed, so callers fail
 * loudly instead of calling GitHub with a junk path.
 */
export function resolveRepo(
  feature: FeatureLike | null | undefined,
  boards: FeatureBoardLike[],
  envRepo: string | undefined | null,
): string | null {
  const boardId = feature?.board_id
  if (boardId) {
    const board = boards.find((b) => b.id === boardId)
    // A board_id we can't resolve is NOT silently downgraded to the default
    // repo — that would open an issue on the wrong repository.
    if (!board) return null
    return normalizeRepo(board.repo)
  }
  return normalizeRepo(envRepo)
}
