// Pure keyboard logic for the chat composer. Kept out of ChatPage so the
// Enter/Shift+Enter/IME branching is unit-testable — the component only has to
// translate the decision into preventDefault + a call.

export type ComposerKey = {
  key: string
  shiftKey: boolean
  // True while an input-method editor (Japanese/Chinese/Korean, …) is
  // composing a character: the Enter that commits the candidate must reach the
  // textarea, never send the message.
  isComposing: boolean
}

export type ComposerState = {
  // The "/" skill menu is showing, so Enter picks the highlighted skill.
  skillMenuOpen: boolean
  // …but only when the menu actually has something to pick.
  hasSkillMatch: boolean
  // Mirrors the send button's enabled state (text or attachments or an armed
  // skill, nothing uploading/in flight, not a bare "/" command).
  canSend: boolean
}

// What a keydown in the composer should do:
// - 'newline'    let the browser insert the line break (or handle any other key)
// - 'send'       submit the message
// - 'pickSkill'  arm the highlighted skill from the "/" menu
// - 'noop'       swallow the key: Enter with nothing to send inserts no newline
export type ComposerAction = 'newline' | 'send' | 'pickSkill' | 'noop'

export function composerKeyAction(e: ComposerKey, state: ComposerState): ComposerAction {
  if (e.key !== 'Enter') return 'newline'
  // Shift+Enter is the explicit newline, and an IME composition owns Enter.
  if (e.shiftKey || e.isComposing) return 'newline'
  if (state.skillMenuOpen && state.hasSkillMatch) return 'pickSkill'
  return state.canSend ? 'send' : 'noop'
}
