import { describe, expect, it } from 'vitest'
import { composerKeyAction, type ComposerKey, type ComposerState } from './composerKeys'

const key = (over: Partial<ComposerKey> = {}): ComposerKey => ({
  key: 'Enter',
  shiftKey: false,
  isComposing: false,
  ...over,
})

const state = (over: Partial<ComposerState> = {}): ComposerState => ({
  skillMenuOpen: false,
  hasSkillMatch: false,
  canSend: true,
  ...over,
})

describe('composerKeyAction', () => {
  it('sends on plain Enter when there is something to send', () => {
    expect(composerKeyAction(key(), state())).toBe('send')
  })

  it('inserts a newline on Shift+Enter', () => {
    expect(composerKeyAction(key({ shiftKey: true }), state())).toBe('newline')
  })

  it('does nothing on Enter with nothing to send', () => {
    expect(composerKeyAction(key(), state({ canSend: false }))).toBe('noop')
  })

  it('never sends mid IME composition, even with text', () => {
    expect(composerKeyAction(key({ isComposing: true }), state())).toBe('newline')
  })

  it('picks the highlighted skill when the "/" menu has a match', () => {
    expect(
      composerKeyAction(key(), state({ skillMenuOpen: true, hasSkillMatch: true })),
    ).toBe('pickSkill')
  })

  it('falls back to the send decision when the skill menu has no match', () => {
    expect(composerKeyAction(key(), state({ skillMenuOpen: true }))).toBe('send')
    expect(
      composerKeyAction(key(), state({ skillMenuOpen: true, canSend: false })),
    ).toBe('noop')
  })

  it('leaves the skill menu alone while composing', () => {
    expect(
      composerKeyAction(
        key({ isComposing: true }),
        state({ skillMenuOpen: true, hasSkillMatch: true }),
      ),
    ).toBe('newline')
  })

  it('ignores every other key', () => {
    expect(composerKeyAction(key({ key: 'a' }), state())).toBe('newline')
    expect(composerKeyAction(key({ key: 'Escape' }), state({ canSend: false }))).toBe(
      'newline',
    )
  })
})
