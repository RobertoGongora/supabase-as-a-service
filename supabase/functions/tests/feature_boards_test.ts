// deno test — multi-repo Features board resolution. The resolved repo is
// interpolated straight into GitHub REST paths (issue creation, PR merge), so
// both the format gate and the "which repo does this card target" rule are
// security-relevant: a wrong answer opens an issue on — or merges a PR in — the
// wrong repository.
import { assertEquals } from 'jsr:@std/assert@1'
import { isValidRepo, normalizeRepo, resolveRepo } from '../_shared/feature_boards.ts'

const boards = [
  { id: 'b1', repo: 'acme/web' },
  { id: 'b2', repo: 'acme/api' },
]

Deno.test('isValidRepo: accepts owner/name slugs', () => {
  assertEquals(isValidRepo('acme/web'), true)
  assertEquals(isValidRepo('alnutile/supabase-as-a-service'), true)
  assertEquals(isValidRepo('Some_Org.1/repo.name-2'), true)
  assertEquals(isValidRepo('  acme/web  '), true)
})

Deno.test('isValidRepo: rejects anything that could redirect the API path', () => {
  assertEquals(isValidRepo('acme'), false)
  assertEquals(isValidRepo('acme/web/extra'), false)
  assertEquals(isValidRepo('acme/'), false)
  assertEquals(isValidRepo('/web'), false)
  assertEquals(isValidRepo('acme/web?x=1'), false)
  assertEquals(isValidRepo('acme web'), false)
  assertEquals(isValidRepo('../../owner/repo'), false)
  assertEquals(isValidRepo(''), false)
  assertEquals(isValidRepo(null), false)
  assertEquals(isValidRepo(42), false)
})

Deno.test('normalizeRepo: trims valid input, nulls invalid input', () => {
  assertEquals(normalizeRepo(' acme/web '), 'acme/web')
  assertEquals(normalizeRepo('acme'), null)
  assertEquals(normalizeRepo(undefined), null)
})

Deno.test('resolveRepo: no board_id falls back to the env repo (back-compat)', () => {
  assertEquals(resolveRepo({ board_id: null }, boards, 'owner/default'), 'owner/default')
  assertEquals(resolveRepo({}, boards, 'owner/default'), 'owner/default')
  assertEquals(resolveRepo(null, boards, 'owner/default'), 'owner/default')
  // A workspace with zero boards behaves exactly like the single-board page.
  assertEquals(resolveRepo({ board_id: null }, [], 'owner/default'), 'owner/default')
})

Deno.test('resolveRepo: board_id picks that board’s repo', () => {
  assertEquals(resolveRepo({ board_id: 'b1' }, boards, 'owner/default'), 'acme/web')
  assertEquals(resolveRepo({ board_id: 'b2' }, boards, 'owner/default'), 'acme/api')
})

Deno.test('resolveRepo: an unresolvable board is null, never the default repo', () => {
  // Silently falling back would open the issue on the WRONG repository.
  assertEquals(resolveRepo({ board_id: 'gone' }, boards, 'owner/default'), null)
})

Deno.test('resolveRepo: a malformed repo on either side resolves to null', () => {
  assertEquals(resolveRepo({ board_id: 'b3' }, [{ id: 'b3', repo: 'nope' }], 'owner/default'), null)
  assertEquals(resolveRepo({ board_id: null }, boards, ''), null)
  assertEquals(resolveRepo({ board_id: null }, boards, undefined), null)
})
