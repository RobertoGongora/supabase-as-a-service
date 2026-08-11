import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  extractMarkdownLinks,
  isRelativeLink,
  linkTarget,
  relativeLinks,
  stripCode,
} from './docs'

describe('markdown link parsing', () => {
  it('finds link targets', () => {
    expect(extractMarkdownLinks('see [the docs](./docs/README.md) now')).toEqual([
      './docs/README.md',
    ])
  })

  it('ignores links inside code samples', () => {
    const md = ['before [real](./a.md)', '```', '[fake](./nope.md)', '```', '`[also](./no.md)`'].join(
      '\n',
    )
    expect(extractMarkdownLinks(md)).toEqual(['./a.md'])
  })

  it('accepts a title after the target', () => {
    expect(extractMarkdownLinks('[x](./a.md "A title")')).toEqual(['./a.md'])
  })

  it('separates repo links from external ones', () => {
    expect(isRelativeLink('./docs/features.md')).toBe(true)
    expect(isRelativeLink('../WHY.md')).toBe(true)
    expect(isRelativeLink('https://example.com')).toBe(false)
    expect(isRelativeLink('mailto:hi@example.com')).toBe(false)
    expect(isRelativeLink('#section')).toBe(false)
    expect(isRelativeLink('//cdn.example.com/x.png')).toBe(false)
  })

  it('drops anchors and query strings', () => {
    expect(linkTarget('./ops.md#migrations')).toBe('./ops.md')
    expect(linkTarget('./ops.md?raw=1')).toBe('./ops.md')
    expect(linkTarget('#top')).toBe('')
  })

  it('strips code before extracting', () => {
    expect(stripCode('a `b` c')).toBe('a  c')
  })

  it('returns only resolvable repo paths', () => {
    const md = 'a [x](./a.md) [y](https://e.com) [z](#top) [w](../b.md#frag)'
    expect(relativeLinks(md)).toEqual(['./a.md', '../b.md'])
  })
})

// The docs are only useful if their cross-references resolve. Sources are
// listed explicitly (rather than globbed) so vendored markdown under
// node_modules is never walked.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const docFiles = [
  'README.md',
  'CLAUDE.md',
  'AGENTS.md',
  'DEPLOY.md',
  'ROADMAP.md',
  'TODO.md',
  'WHY.md',
  'docs/README.md',
  'docs/architecture.md',
  'docs/features.md',
  'docs/operations.md',
  'docs/mcp.md',
  'docs/artifacts-api.md',
  'docs/todos-api.md',
  'docs/capability-workers.md',
  'docs/events-and-inbox.md',
  'docs/mcp-oauth.md',
  'docs/playwright-mcp.md',
  'docs/slack.md',
  'docs/tasks/README.md',
]

describe('documentation links resolve', () => {
  it.each(docFiles)('%s', (relPath) => {
    const contents = readFileSync(join(repoRoot, relPath), 'utf8')
    const broken = relativeLinks(contents).filter(
      (target) => !existsSync(join(repoRoot, dirname(relPath), target)),
    )
    expect(broken, `${relPath} links to missing paths:\n${broken.join('\n')}`).toEqual([])
  })
})
