// Pure helpers for checking the repository's own documentation.
//
// Docs cross-reference each other heavily (README → docs/, the docs index →
// every guide, CLAUDE.md → both). A renamed or moved file silently breaks those
// links, and nothing else in the build notices. `docs.test.ts` walks the
// markdown and resolves every relative link with these helpers.

/** Strip fenced and inline code so example snippets aren't treated as links. */
export function stripCode(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
}

/** Every `[text](target)` target in a markdown document, code excluded. */
export function extractMarkdownLinks(markdown: string): string[] {
  const links: string[] = []
  const pattern = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(stripCode(markdown))) !== null) links.push(match[1])
  return links
}

/**
 * Is this a link to another file in the repo? External URLs, mailto:, and
 * same-page anchors are somebody else's problem.
 */
export function isRelativeLink(href: string): boolean {
  if (!href) return false
  if (href.startsWith('#')) return false
  if (href.startsWith('//')) return false
  return !/^[a-z][a-z0-9+.-]*:/i.test(href)
}

/** The path part of a link — anchors and query strings removed. */
export function linkTarget(href: string): string {
  return href.split('#')[0].split('?')[0]
}

/** The relative file/folder paths a document points at. */
export function relativeLinks(markdown: string): string[] {
  return extractMarkdownLinks(markdown)
    .filter(isRelativeLink)
    .map(linkTarget)
    .filter((target) => target.length > 0)
}
