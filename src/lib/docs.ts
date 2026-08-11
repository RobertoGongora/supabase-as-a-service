// Documentation bookkeeping.
//
// The docs index (docs/README.md) is only useful if it stays complete, and
// cross-document links are only useful if they resolve. Both are mechanical
// checks, so the deciding logic lives here as pure functions and
// `docs.test.ts` runs them over the real files (the same shape as
// migrations.test.ts guarding migration prefixes).

/** A markdown link: `[label](target)` — the target only, anchors stripped. */
const LINK = /!?\[[^\]]*\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g

/**
 * Repo-relative markdown files linked from a document. Web links, mail links,
 * bare anchors, and links to non-markdown files are ignored: this is about
 * documents referring to each other, not about validating every URL.
 */
export function markdownLinks(source: string): string[] {
  const out: string[] = []
  for (const match of source.matchAll(LINK)) {
    const target = match[1].split('#')[0]
    if (!target || /^([a-z]+:|\/|#)/i.test(target)) continue
    if (!target.toLowerCase().endsWith('.md')) continue
    out.push(target)
  }
  return out
}

/**
 * Resolve a link found in `fromPath` to a repo-relative path, so
 * `docs/README.md` + `../WHY.md` becomes `WHY.md`.
 */
export function resolveLink(fromPath: string, link: string): string {
  const segments = fromPath.split('/').slice(0, -1)
  for (const part of link.split('/')) {
    if (part === '.' || part === '') continue
    if (part === '..') segments.pop()
    else segments.push(part)
  }
  return segments.join('/')
}

/** Every repo-relative document an index links to. */
export function linkedDocs(indexPath: string, indexSource: string): string[] {
  return [...new Set(markdownLinks(indexSource).map((link) => resolveLink(indexPath, link)))]
}

/**
 * Documents an index is supposed to cover but doesn't mention. `expected` is
 * repo-relative, and the index itself never needs to list itself.
 */
export function missingFromIndex(
  indexPath: string,
  indexSource: string,
  expected: string[],
): string[] {
  const linked = new Set(linkedDocs(indexPath, indexSource))
  return expected.filter((doc) => doc !== indexPath && !linked.has(doc)).sort()
}

/** Links that point at a document which isn't there, as `from → target`. */
export function brokenLinks(sources: Record<string, string>, existing: Iterable<string>): string[] {
  const known = new Set(existing)
  const broken: string[] = []
  for (const [path, source] of Object.entries(sources)) {
    for (const link of markdownLinks(source)) {
      const target = resolveLink(path, link)
      if (!known.has(target)) broken.push(`${path} → ${link}`)
    }
  }
  return broken.sort()
}
