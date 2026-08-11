import { useState } from 'react'
import { CopyIcon, CheckIcon } from './icons'
import { copyText } from '../lib/clipboard'

// Small "copy to clipboard" affordance reused wherever we want to hand a chunk
// of text (a chat answer, an artifact body) to the user in one click. It owns
// its own transient "Copied!" state so callers just pass the text.
export function CopyButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied!',
  title = 'Copy to clipboard',
  className = '',
  iconClassName = 'h-3.5 w-3.5',
}: {
  text: string
  label?: string | null
  copiedLabel?: string
  title?: string
  className?: string
  iconClassName?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    const ok = await copyText(text)
    if (!ok) return
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={title}
      aria-label={title}
      className={className}
    >
      {copied ? <CheckIcon className={iconClassName} /> : <CopyIcon className={iconClassName} />}
      {label !== null && <span>{copied ? copiedLabel : label}</span>}
    </button>
  )
}
