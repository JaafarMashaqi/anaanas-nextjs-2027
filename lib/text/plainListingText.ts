const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '\u2013',
  mdash: '\u2014',
  hellip: '\u2026',
  laquo: '\u00ab',
  raquo: '\u00bb',
}

function safeChar(code: number) {
  if (!Number.isFinite(code) || code < 32 || code === 127) return ''
  return String.fromCodePoint(code)
}

/** Decode listing text for display. Does not interpret HTML tags. */
export function plainListingText(value: string) {
  const decoded = value
    .replace(/&#(\d+);/g, (_, digits: string) => safeChar(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => safeChar(parseInt(hex, 16)))
    .replace(/&([a-z]+);/gi, (full, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? full)
    .replace(/(^|[\s([«"])ndash;/g, '$1\u2013')
    .replace(/(^|[\s([«"])mdash;/g, '$1\u2014')

  return decoded.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

/** Shorter card headline. The stored title is not changed. */
export function displayListingTitle(value: string, max = 72) {
  const clean = plainListingText(value)
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max + 1)
  const breakAt = Math.max(cut.lastIndexOf(' '), cut.lastIndexOf('،'), cut.lastIndexOf('.'))
  const head = breakAt > 28 ? cut.slice(0, breakAt) : clean.slice(0, max)
  return `${head.trim()}…`
}
