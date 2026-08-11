import { describe, expect, it } from 'vitest'
import { featuresForBoard, isValidRepo, removeFeature, upsertFeature } from './features'

const mk = (id: string, updated_at: string, extra: Record<string, unknown> = {}) => ({
  id,
  updated_at,
  ...extra,
})

describe('upsertFeature', () => {
  it('replaces an existing row in place and keeps updated_at-desc order', () => {
    const list = [mk('a', '2026-01-03T00:00:00Z'), mk('b', '2026-01-02T00:00:00Z')]
    // b gets a PR link synced -> its updated_at bumps and it should jump to front.
    const updated = mk('b', '2026-01-04T00:00:00Z', { pr_url: 'https://x/pr/1' })
    const next = upsertFeature(list, updated)
    expect(next.map((f) => f.id)).toEqual(['b', 'a'])
    expect(next[0]).toMatchObject({ pr_url: 'https://x/pr/1' })
    // no duplicate of b
    expect(next.filter((f) => f.id === 'b')).toHaveLength(1)
  })

  it('adds an unseen row (INSERT) sorted by updated_at', () => {
    const list = [mk('a', '2026-01-03T00:00:00Z')]
    const next = upsertFeature(list, mk('c', '2026-01-05T00:00:00Z'))
    expect(next.map((f) => f.id)).toEqual(['c', 'a'])
  })

  it('does not mutate the input list', () => {
    const list = [mk('a', '2026-01-03T00:00:00Z')]
    upsertFeature(list, mk('a', '2026-01-09T00:00:00Z'))
    expect(list).toHaveLength(1)
    expect(list[0].updated_at).toBe('2026-01-03T00:00:00Z')
  })
})

describe('removeFeature', () => {
  it('drops the row with the given id', () => {
    const list = [mk('a', '2026-01-03T00:00:00Z'), mk('b', '2026-01-02T00:00:00Z')]
    expect(removeFeature(list, 'a').map((f) => f.id)).toEqual(['b'])
  })

  it('is a no-op for an unknown id', () => {
    const list = [mk('a', '2026-01-03T00:00:00Z')]
    expect(removeFeature(list, 'zzz')).toHaveLength(1)
  })
})

describe('isValidRepo', () => {
  it('accepts owner/name slugs', () => {
    expect(isValidRepo('acme/web')).toBe(true)
    expect(isValidRepo('alnutile/supabase-as-a-service')).toBe(true)
    expect(isValidRepo(' acme/web ')).toBe(true)
  })

  it('rejects anything that is not exactly owner/name', () => {
    expect(isValidRepo('acme')).toBe(false)
    expect(isValidRepo('acme/web/extra')).toBe(false)
    expect(isValidRepo('https://github.com/acme/web')).toBe(false)
    expect(isValidRepo('acme /web')).toBe(false)
    expect(isValidRepo('')).toBe(false)
    expect(isValidRepo(undefined)).toBe(false)
  })
})

describe('featuresForBoard', () => {
  const cards = [
    { id: 'a', board_id: null },
    { id: 'b', board_id: 'b1' },
    { id: 'c' },
    { id: 'd', board_id: 'b2' },
  ]

  it('null selects the default board — cards with no board_id', () => {
    // Back-compat: every pre-existing row has board_id null and must still show.
    expect(featuresForBoard(cards, null).map((f) => f.id)).toEqual(['a', 'c'])
  })

  it('a board id selects only that board’s cards', () => {
    expect(featuresForBoard(cards, 'b1').map((f) => f.id)).toEqual(['b'])
    expect(featuresForBoard(cards, 'b2').map((f) => f.id)).toEqual(['d'])
  })

  it('returns nothing for a board with no cards', () => {
    expect(featuresForBoard(cards, 'empty')).toEqual([])
  })
})
