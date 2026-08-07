// Pure helper for the Bibliography page: given a raw citation string (parsed from
// the owner's .doc archives, so there is NO markup), work out which character
// ranges should be rendered in *italics* - the same convention used elsewhere on
// the site (book titles and periodical/journal names are italic; article titles,
// which sit in «guillemets», stay roman).
//
// The archives follow a consistent citation shape:
//   Books  -> "Author: Book Title. Publisher, place year."   (title = italic)
//   Article-> "Author: «Article title». Journal vol (year)."  (journal = italic)
// A single entry may bundle several works with «α) … β) … γ) …» markers; each is
// handled on its own.
//
// This is heuristic by nature (the source is free text) so it is kept framework-
// free and unit-tested - see bibliographyItalic.test.js.

const OPEN_Q = new Set(['«', '"', '“', '‟', '„', '‘'])
const CLOSE_Q = new Set(['»', '"', '”', '’'])

// A number-then-parenthesised-year run, e.g. "10-11 (1980" or "66 (2003" - marks
// the "Journal vol (year)" tail of an article citation.
const VOL_RE = /\d[\d\-/]*\s*\(\d{3,4}/

// Index of the closing quote that pairs with an opening quote at position 0.
function findClose(sub) {
  for (let i = 1; i < sub.length; i++) if (CLOSE_Q.has(sub[i])) return i
  return -1
}

// Is the period at index i just an author initial ("M.", "K.", "Ι.") rather than
// a real sentence end? True when it follows a lone capital letter at a word start.
function isInitialDot(text, i) {
  const prev = text[i - 1]
  if (!prev || !/\p{Lu}/u.test(prev)) return false
  const before = text[i - 2]
  return before === undefined || /[\s(«"=.-]/.test(before)
}

// Index of the first real sentence-ending period from `from` (skips initials like
// "M." "K." so "Gandhi, M. K.: Title" isn't split mid-author). -1 if none.
function firstSentenceEnd(text, from = 0) {
  for (let i = from; i < text.length; i++) {
    if (text[i] === '.' && !isInitialDot(text, i)) return i
  }
  return -1
}

// Trim leading/trailing whitespace off a [start,end) range over `text`.
function trimRange(text, start, end) {
  while (start < end && /\s/.test(text[start])) start++
  while (end > start && /\s/.test(text[end - 1])) end--
  return [start, end]
}

// Return merged, sorted [start, end) ranges of `text` that should be italicised.
export function italicSpans(text) {
  if (!text) return []
  const spans = []

  // 1. Skip an "Author: " prefix (the first ": " - unless a sentence ends first,
  //    which means there is no author and the title leads the string).
  const colon = text.indexOf(': ')
  const period = firstSentenceEnd(text)
  const bodyStart = colon !== -1 && (period === -1 || colon < period) ? colon + 2 : 0

  // 2. Split the body into work-chunks on «α) β) γ) …» markers (skipping the
  //    label itself). No markers -> one chunk spanning the whole body.
  const markerRe = /[αβγδεζηθικ]\)\s/g
  markerRe.lastIndex = bodyStart
  const chunks = []
  let lastEnd = bodyStart
  let m
  while ((m = markerRe.exec(text))) {
    if (m.index > lastEnd) chunks.push([lastEnd, m.index])
    lastEnd = m.index + m[0].length
  }
  chunks.push([lastEnd, text.length])

  // 3. For each work-chunk decide the italic span.
  for (let [cs, ce] of chunks) {
    while (cs < ce && /\s/.test(text[cs])) cs++
    if (cs >= ce) continue
    const sub = text.slice(cs, ce)

    if (OPEN_Q.has(text[cs])) {
      // Article: the «quoted title» stays roman; italicise the journal name that
      // precedes the "vol (year)" run.
      const closeIdx = findClose(sub)
      const afterClose = closeIdx === -1 ? 0 : closeIdx + 1
      const vm = VOL_RE.exec(sub.slice(afterClose))
      if (!vm) continue
      const volAbs = cs + afterClose + vm.index
      const pre = text.slice(cs, volAbs)
      const cut = Math.max(pre.lastIndexOf('. '), pre.lastIndexOf('» '), pre.lastIndexOf('" '))
      const js = cut !== -1 ? cs + cut + 2 : cs + afterClose
      const [s, e] = trimRange(text, js, volAbs)
      if (e > s) spans.push([s, e])
    } else {
      // Book / authored work: italicise the title, up to the first sentence end.
      const dot = firstSentenceEnd(sub)
      const [s, e] = trimRange(text, cs, cs + (dot === -1 ? sub.length : dot))
      if (e > s) spans.push([s, e])
    }
  }

  // 4. Merge overlaps.
  spans.sort((a, b) => a[0] - b[0])
  const merged = []
  for (const r of spans) {
    const last = merged[merged.length - 1]
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1])
    else merged.push([...r])
  }
  return merged
}
