import { describe, expect, it } from 'vitest'
import { brokenLinks, linkedDocs, markdownLinks, missingFromIndex, resolveLink } from './docs'

// Every markdown file we maintain, keyed by repo-relative path. import.meta.glob
// reads them at build time (the mechanism migrations.test.ts uses), so no
// filesystem access is needed under vitest.
const raw = import.meta.glob(
  [
    '../../*.md',
    '../../docs/**/*.md',
    '../../skills/*.md',
    '../../specs/**/*.md',
    '../../workers/**/*.md',
    '../../control-plane/**/*.md',
    '!**/node_modules/**',
  ],
  { eager: true, query: '?raw', import: 'default' },
) as Record<string, string>

const docs: Record<string, string> = {}
for (const [path, source] of Object.entries(raw)) {
  docs[path.replace(/^(\.\.\/)+/, '')] = source
}
const paths = Object.keys(docs)

const INDEX = 'docs/README.md'
const TASKS_INDEX = 'docs/tasks/README.md'

describe('markdownLinks', () => {
  it('picks up relative links to other documents', () => {
    expect(markdownLinks('see [why](../WHY.md) and [api](./docs/api.md)')).toEqual([
      '../WHY.md',
      './docs/api.md',
    ])
  })

  it('ignores the web, anchors, and non-markdown targets', () => {
    const source = '[a](https://x.dev) [b](#section) [c](mailto:a@b.c) [d](../images/x.png)'
    expect(markdownLinks(source)).toEqual([])
  })

  it('drops the anchor from a deep link', () => {
    expect(markdownLinks('[a](./guide.md#setup)')).toEqual(['./guide.md'])
  })
})

describe('resolveLink', () => {
  it('resolves relative to the linking document', () => {
    expect(resolveLink('docs/README.md', '../WHY.md')).toBe('WHY.md')
    expect(resolveLink('docs/README.md', './slack.md')).toBe('docs/slack.md')
    expect(resolveLink('docs/tasks/README.md', '../../CLAUDE.md')).toBe('CLAUDE.md')
  })
})

describe('missingFromIndex', () => {
  it('lists documents the index never mentions', () => {
    const index = 'see [one](./one.md)'
    expect(missingFromIndex('docs/README.md', index, ['docs/one.md', 'docs/two.md'])).toEqual([
      'docs/two.md',
    ])
  })

  it('does not ask an index to link itself', () => {
    expect(missingFromIndex('docs/README.md', '', ['docs/README.md'])).toEqual([])
  })
})

describe('brokenLinks', () => {
  it('reports a link whose target is gone', () => {
    const sources = { 'docs/README.md': '[gone](./gone.md) [here](./here.md)' }
    expect(brokenLinks(sources, ['docs/here.md'])).toEqual(['docs/README.md → ./gone.md'])
  })
})

describe('the repository documentation', () => {
  it('collects the markdown files', () => {
    expect(paths).toContain(INDEX)
    expect(paths).toContain('CLAUDE.md')
  })

  it('indexes every top-level document in docs/', () => {
    const expected = paths.filter((p) => p.startsWith('docs/') && !p.startsWith('docs/tasks/'))
    const missing = missingFromIndex(INDEX, docs[INDEX], expected)
    expect(missing, `Add these to ${INDEX}:\n${missing.join('\n')}`).toEqual([])
  })

  it('indexes every archived spec in docs/tasks/', () => {
    const expected = paths.filter((p) => p.startsWith('docs/tasks/'))
    const missing = missingFromIndex(TASKS_INDEX, docs[TASKS_INDEX], expected)
    expect(missing, `Add these to ${TASKS_INDEX}:\n${missing.join('\n')}`).toEqual([])
  })

  it('points newcomers at the docs index from the entry points', () => {
    for (const entry of ['README.md', 'CLAUDE.md', 'AGENTS.md']) {
      expect(linkedDocs(entry, docs[entry]), `${entry} should link the docs index`).toContain(INDEX)
    }
  })

  it('has no links to documents that do not exist', () => {
    const broken = brokenLinks(docs, paths)
    expect(broken, `Broken document links:\n${broken.join('\n')}`).toEqual([])
  })
})
