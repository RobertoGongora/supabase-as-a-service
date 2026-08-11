import { describe, expect, it } from 'vitest'

// Guard the documentation index against the two ways it goes stale: a new page
// nobody links to (so it is never found and never updated), and a link left
// pointing at a file that has since been renamed or removed.
//
// `import.meta.glob` yields file paths at build time — the same mechanism
// migrations.test.ts and functionSources.ts use — so no filesystem access is
// needed and this runs fine under vitest/jsdom.
const INDEX = '../../docs/README.md'

const indexSource = (
  import.meta.glob('../../docs/README.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>
)[INDEX]

// Every markdown file the index is allowed to link to: the docs set itself plus
// the docs that live at the repo root or beside a workspace.
const known = new Set(
  [
    ...Object.keys(import.meta.glob('../../docs/**/*.md')),
    ...Object.keys(import.meta.glob('../../*.md')),
    ...Object.keys(import.meta.glob('../../workers/*.md')),
    ...Object.keys(import.meta.glob('../../control-plane/*.md')),
    ...Object.keys(import.meta.glob('../../skills/*.md')),
  ].map(normalize),
)

const docsPages = Object.keys(import.meta.glob('../../docs/**/*.md'))
  .map(normalize)
  .filter((p) => p !== 'docs/README.md')

/** `../../docs/foo.md` → `docs/foo.md`, so paths read like repo paths. */
function normalize(path: string): string {
  return path.replace(/^\.\.\/\.\.\//, '')
}

/** Resolve a link written relative to `docs/` into a repo-relative path. */
function resolveFromDocs(link: string): string {
  const parts = 'docs'.split('/')
  for (const segment of link.split('/')) {
    if (segment === '.' || segment === '') continue
    if (segment === '..') parts.pop()
    else parts.push(segment)
  }
  return parts.join('/')
}

/** Relative markdown links in the index, ignoring folder links and URLs. */
function linkedPaths(markdown: string): string[] {
  const links = [...markdown.matchAll(/\]\((\.[^)\s]+)\)/g)].map((m) => m[1])
  return links.filter((l) => l.endsWith('.md')).map(resolveFromDocs)
}

describe('documentation index', () => {
  it('reads the index and finds the docs it should cover', () => {
    expect(indexSource, 'docs/README.md is missing').toBeTruthy()
    expect(docsPages.length).toBeGreaterThan(0)
  })

  it('lists every page under docs/', () => {
    const linked = new Set(linkedPaths(indexSource))
    const missing = docsPages.filter((p) => !linked.has(p))
    expect(
      missing,
      `Add a row to docs/README.md for:\n${missing.join('\n')}`,
    ).toEqual([])
  })

  it('only links to files that exist', () => {
    const broken = [...new Set(linkedPaths(indexSource))].filter((p) => !known.has(p))
    expect(
      broken,
      `docs/README.md links to files that are not there:\n${broken.join('\n')}`,
    ).toEqual([])
  })
})
