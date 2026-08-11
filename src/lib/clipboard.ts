// Clipboard write with a legacy fallback (execCommand) for browsers/contexts
// where navigator.clipboard is unavailable — most importantly a NON-secure
// origin: a self-hosted install served over plain HTTP (a tailnet/LAN
// deployment) gets no `navigator.clipboard` at all, so every "Copy" button that
// calls it directly throws. Returns whether the copy succeeded.
//
// Always copy through this helper rather than touching navigator.clipboard.
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
