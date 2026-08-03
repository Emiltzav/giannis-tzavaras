// Pure search helpers for the Bibliography page. Kept framework-free (no React)
// so they can be unit-tested in isolation. The Bibliography page imports these;
// see src/lib/bibliographySearch.test.js for the specs.

// Accent/case-insensitive normaliser (strips Greek tonos and Latin diacritics,
// lowercases, trims). Everything downstream compares normalised strings.
export function normalize(s) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\u2012-\u2015]/g, '-') // en/em/figure dashes -> plain hyphen
    .toLowerCase()
    .trim()
}

// Split a raw query into normalised search tokens (drops empties).
export function tokenize(q) {
  return normalize(q).split(/\s+/).filter(Boolean)
}

// The searchable blob for an entry (title/citation text + author).
export function entryNorm(text, author) {
  return normalize(`${text ?? ''} ${author ?? ''}`)
}

// An entry matches when EVERY query token appears somewhere in its normalised
// text (multi-token AND, substring/contains semantics).
export function entryMatches(norm, tokens) {
  return tokens.every((tok) => norm.includes(tok))
}

// Top-level category code for a section code, e.g. "0.1" → "0", "V.24" → "V".
export function topCodeOf(code) {
  return String(code).split('.')[0]
}

// Word-prefix score for the "jump to section" autocomplete. Every query token
// must be the START of some word in the title (or the code). Higher = better:
//   3 = whole title starts with the query
//   2 = the first word starts with the first token
//   1 = a later word matches (or the code prefix matches)
//   0 = no match  (mid-word matches do NOT count)
export function sectionScore(title, code, rawQuery) {
  const nq = normalize(rawQuery)
  if (!nq) return 0
  const nt = normalize(title)
  const words = nt.split(/[\s·/,-]+/).filter(Boolean)
  const tokens = nq.split(/\s+/).filter(Boolean)
  if (tokens.every((tok) => words.some((w) => w.startsWith(tok)))) {
    if (nt.startsWith(nq)) return 3
    if (words[0]?.startsWith(tokens[0])) return 2
    return 1
  }
  if (normalize(code).startsWith(nq.replace(/\s+/g, ''))) return 1
  return 0
}

// Accent-insensitive highlight ranges. Tokens are already normalised; we build a
// normalised copy of `text` with an index map back to the original characters,
// find the token occurrences there, and return merged, sorted [start, end) ranges
// over the ORIGINAL string. (The React layer turns these into <mark> elements.)
export function highlightRanges(text, tokens) {
  if (!tokens || !tokens.length || !text) return []
  let norm = ''
  const map = [] // map[i] = original index of normalised char i
  for (let i = 0; i < text.length; i++) {
    const ch = text[i].normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    for (let k = 0; k < ch.length; k++) {
      norm += ch[k]
      map.push(i)
    }
  }
  const ranges = []
  for (const tok of tokens) {
    if (!tok) continue
    let from = 0
    let idx
    while ((idx = norm.indexOf(tok, from)) !== -1) {
      ranges.push([map[idx], map[idx + tok.length - 1] + 1])
      from = idx + tok.length
    }
  }
  if (!ranges.length) return []
  ranges.sort((a, b) => a[0] - b[0])
  const merged = []
  for (const r of ranges) {
    const last = merged[merged.length - 1]
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1])
    else merged.push([...r])
  }
  return merged
}
