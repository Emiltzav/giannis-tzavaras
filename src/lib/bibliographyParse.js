// Pure parsing helpers shared by scripts/gen_bibliography.mjs (which turns the
// antiword text dumps into JSON). Kept framework-free and side-effect-free so the
// parsing rules can be unit-tested without invoking antiword - see
// src/lib/bibliographyParse.test.js.

// De-wrap antiword's hard line-wrapping into paragraphs. A new paragraph starts on
// a blank line, a bullet (• / ·), or a column-0 line; indented non-bullet lines are
// continuations of the current paragraph. Runs of 2+ spaces (antiword's
// justification padding) collapse to one.
export function dewrap(lines, startIdx = 0) {
  const paras = []
  let cur = ''
  const flush = () => {
    const p = cur
      .replace(/\s{2,}/g, ' ')
      .replace(/[\u2012-\u2015]/g, '-') // en/em/figure dashes -> plain hyphen
      .trim()
    if (p) paras.push(p)
    cur = ''
  }
  for (let i = startIdx; i < lines.length; i++) {
    const ln = lines[i]
    if (ln.trim() === '') {
      flush()
    } else if (/^\s*[•·]/.test(ln)) {
      flush()
      cur = ln.replace(/^\s*[•·]\s*/, '')
    } else if (/^\s/.test(ln)) {
      cur += ' ' + ln.trim()
    } else {
      flush()
      cur = ln.trim()
    }
  }
  flush()
  return paras
}

// A year heading in the articles archives is a paragraph that is exactly a year.
export function isYearHeading(para) {
  return /^(19|20)\d{2}$/.test(para)
}

// Navigation / table-of-contents / legend lines that are NOT bibliographic entries.
// IMPORTANT: these patterns are deliberately specific. Earlier a bare `κλικ` here
// wrongly dropped real entries (it is a substring of e.g. «Κυκλικά»), and a
// "two or more ' = '" rule wrongly dropped real philosopher-list / transliteration
// entries - both are covered by regression tests. Do not re-add loose matches.
export function isJunk(para) {
  if (para.length < 3) return true // single-letter alphabetical dividers
  if (/\[pic\]/i.test(para)) return true // embedded image placeholder
  if (/^Δες επίσης/i.test(para)) return true // "see also" cross-references
  if (/μεταβείτε|CTRL/i.test(para)) return true // "Ctrl+click to jump" instructions
  if (/ΤΑΞΙΝΟΜΗΣΗ ΚΑΤΑ ΣΥΣΤΗΜΑ|ΠΙΝΑΚΑΣ ΠΕΡΙΕΧΟΜΕΝΩΝ|^ΠΕΡΙΕΧΟΜΕΝΑ/.test(para)) return true // TOC (caps only)
  if (/^Συντομογραφίες/i.test(para)) return true // abbreviations legend
  if (/^Περιλαμβάνονται/i.test(para)) return true // article-file preamble
  if (/^Τελευταία ενημέρωση/i.test(para)) return true // "last updated" line
  // Alphabetical index row: several single letters separated by spaces.
  if (/^(?:[A-Za-zΑ-Ωα-ωΆ-Ώά-ώ�]\s+){3,}[A-Za-zΑ-Ωα-ωΆ-Ώά-ώ�]?$/.test(para)) return true
  return false
}

const YEAR_RE = /\b(1[5-9]\d{2}|20[0-2]\d)\b/g

// Best-effort author + year for an entry. `forcedYear` (the heading year, for
// articles) overrides the in-text guess. Author = the name before the first colon
// when it appears early; only used to widen the search blob, never displayed.
export function extractAuthorYear(text, forcedYear = null) {
  const years = [...new Set((text.match(YEAR_RE) || []).map(Number))]
  let author = null
  const c = text.indexOf(':')
  if (c > 0 && c <= 70) author = text.slice(0, c).trim()
  return { author, year: forcedYear ?? (years.length ? Math.min(...years) : null) }
}
