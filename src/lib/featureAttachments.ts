// Pure helpers for attaching screenshots to a Features-board card.
//
// A card's `features.screenshots` is a list of storage paths in the private
// `files` bucket (the `features` edge function signs them into the GitHub
// issue on approval). Two ways to get a path there:
//   upload  — a pasted / dropped / picked image, uploaded on save
//   library — a file that already exists in Files, reused by path (no copy)
// The component owns the side effects (storage upload, signed URLs, queries);
// the selection/dedupe/filter rules live here so they're unit-testable —
// same split as artifactImages.ts, whose image helpers this builds on.

import { isImageFile, sanitizeImageName } from './artifactImages'

/** The bucket a card's screenshots must live in — what the edge function signs. */
export const SCREENSHOT_BUCKET = 'files'

/** The subset of a `files` row the picker needs. */
export interface LibraryFile {
  id: string
  name: string
  title: string | null
  path: string
  mime_type: string | null
  bucket?: string | null
}

/** A staged attachment: either bytes to upload on save, or an existing path. */
export type Attachment =
  | { kind: 'upload'; key: string; name: string; file: File }
  | { kind: 'library'; key: string; name: string; path: string }

/**
 * Can this Files row be attached to a card? It has to be an image (the issue
 * body embeds it as markdown) and it has to live in the private `files`
 * bucket, since that's the only bucket the `features` function signs from.
 */
export function isAttachableFile(row: LibraryFile): boolean {
  if (row.bucket != null && row.bucket !== SCREENSHOT_BUCKET) return false
  return isImageFile({ type: row.mime_type ?? undefined, name: row.name })
}

/**
 * The rows the picker should show: attachable files, optionally narrowed to a
 * collection (`fileIds` = the ids in that collection; null = every file) and to
 * a case-insensitive name/title search.
 */
export function filterLibraryFiles(
  rows: LibraryFile[],
  opts: { fileIds?: Set<string> | null; search?: string } = {},
): LibraryFile[] {
  const q = (opts.search ?? '').trim().toLowerCase()
  return rows.filter((row) => {
    if (!isAttachableFile(row)) return false
    if (opts.fileIds && !opts.fileIds.has(row.id)) return false
    if (!q) return true
    return `${row.title ?? ''} ${row.name}`.toLowerCase().includes(q)
  })
}

/** A stable key for a library pick — the path, so the same file can't stack up. */
export function libraryKey(path: string): string {
  return `library:${path}`
}

/** Stage an existing Files row. The display name prefers its title. */
export function libraryAttachment(row: LibraryFile): Attachment {
  return {
    kind: 'library',
    key: libraryKey(row.path),
    name: (row.title ?? '').trim() || row.name,
    path: row.path,
  }
}

/**
 * Stage pasted / dropped / picked Files. Non-images are dropped (a paste of
 * text or a PDF shouldn't become a screenshot) and names are sanitized here so
 * the chip shows what the object key will be. `keyPrefix` is caller-supplied
 * (a uuid) so keys stay unique across repeated pastes without a clock read.
 */
export function uploadAttachments(files: File[], keyPrefix: string): Attachment[] {
  return files.filter(isImageFile).map((file, i) => ({
    kind: 'upload' as const,
    key: `upload:${keyPrefix}:${i}`,
    name: sanitizeImageName(file.name, file.type),
    file,
  }))
}

/** Append `incoming`, skipping anything already staged (same key). */
export function addAttachments(existing: Attachment[], incoming: Attachment[]): Attachment[] {
  const seen = new Set(existing.map((a) => a.key))
  const next = [...existing]
  for (const a of incoming) {
    if (seen.has(a.key)) continue
    seen.add(a.key)
    next.push(a)
  }
  return next
}

/** Drop one staged attachment. */
export function removeAttachment(existing: Attachment[], key: string): Attachment[] {
  return existing.filter((a) => a.key !== key)
}

/**
 * Where a freshly uploaded screenshot goes. Kept under the uploader's own
 * folder — storage policies scope writes to `‹user-id›/…` — with a
 * caller-supplied unique segment so two pastes of `image.png` can't collide.
 */
export function screenshotPath(userId: string, name: string, unique: string, mime?: string): string {
  return `${userId}/features/${unique}-${sanitizeImageName(name, mime)}`
}
