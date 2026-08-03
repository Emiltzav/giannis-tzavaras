import { describe, it, expect } from 'vitest'
import {
  normalize,
  tokenize,
  entryNorm,
  entryMatches,
  topCodeOf,
  sectionScore,
  highlightRanges,
} from './bibliographySearch.js'

describe('normalize', () => {
  it('lowercases and strips Greek tonos', () => {
    expect(normalize('Ινδική')).toBe('ινδικη')
    expect(normalize('ΦΙΛΟΣΟΦΙΑ')).toBe('φιλοσοφια')
    expect(normalize('Χάιντεγκερ')).toBe('χαιντεγκερ')
  })

  it('strips Latin diacritics and trims', () => {
    expect(normalize('  Éµ ')).toBe('éµ'.normalize('NFD').replace(/[̀-ͯ]/g, ''))
    expect(normalize('  Café ')).toBe('cafe')
  })

  it('is null/undefined safe', () => {
    expect(normalize(null)).toBe('')
    expect(normalize(undefined)).toBe('')
  })
})

describe('tokenize', () => {
  it('splits on whitespace and drops empties', () => {
    expect(tokenize('  Πλάτων   Κρίτων ')).toEqual(['πλατων', 'κριτων'])
  })
  it('returns [] for a blank query', () => {
    expect(tokenize('')).toEqual([])
    expect(tokenize('   ')).toEqual([])
  })
})

describe('entryNorm', () => {
  it('combines text + author into one normalised blob', () => {
    expect(entryNorm('Ιστορία της Ινδικής φιλοσοφίας', 'Βελισσαρόπουλος')).toBe(
      'ιστορια της ινδικης φιλοσοφιας βελισσαροπουλος',
    )
  })
  it('handles a missing author', () => {
    expect(entryNorm('Βέδες.', null)).toBe('βεδες.')
  })
})

describe('entryMatches', () => {
  const norm = entryNorm('Εισαγωγή στις φιλοσοφίες του υπαρξισμού (Κίρκεγκωρ, Χάιντεγκερ)', 'Wahl, Jean')

  it('matches when every token is present (accent-insensitive)', () => {
    expect(entryMatches(norm, tokenize('χαιντεγκερ'))).toBe(true)
    expect(entryMatches(norm, tokenize('Χάιντεγκερ'))).toBe(true)
  })
  it('requires ALL tokens (AND semantics)', () => {
    expect(entryMatches(norm, tokenize('υπαρξισμου wahl'))).toBe(true)
    expect(entryMatches(norm, tokenize('υπαρξισμου πλατων'))).toBe(false)
  })
  it('matches substrings anywhere (contains)', () => {
    expect(entryMatches(norm, tokenize('εισαγ'))).toBe(true)
  })
})

describe('topCodeOf', () => {
  it('extracts the top-level category code', () => {
    expect(topCodeOf('0.1')).toBe('0')
    expect(topCodeOf('I.3')).toBe('I')
    expect(topCodeOf('V.24')).toBe('V')
    expect(topCodeOf('IV.5.1')).toBe('IV')
    expect(topCodeOf('V')).toBe('V')
  })
})

describe('sectionScore (word-prefix matching)', () => {
  const title = 'Ινδική Φιλοσοφία'
  const code = '0.1'

  it('scores a whole-title prefix highest', () => {
    expect(sectionScore(title, code, 'ινδικη φιλοσοφια')).toBe(3)
    expect(sectionScore(title, code, 'ινδ')).toBe(3) // 'ινδ' is also a prefix of the whole title
  })

  it('scores a first-word (non-whole-title) prefix as 2', () => {
    expect(sectionScore(title, code, 'ινδ φιλ')).toBe(2)
  })

  it('matches a prefix of a later word only (score 1)', () => {
    expect(sectionScore(title, code, 'φιλ')).toBe(1)
  })

  it('is accent-insensitive', () => {
    expect(sectionScore(title, code, 'Ινδική')).toBeGreaterThan(0)
  })

  it('does NOT match mid-word letters', () => {
    expect(sectionScore(title, code, 'οσοφ')).toBe(0)
    expect(sectionScore(title, code, 'νδικη')).toBe(0)
  })

  it('matches a multi-word query against separate words', () => {
    expect(sectionScore('Political Philosophy and Political Economy', 'V.21', 'polit econ')).toBeGreaterThan(0)
  })

  it('falls back to a code prefix', () => {
    expect(sectionScore(title, code, 'V.10')).toBe(0)
    expect(sectionScore('Φαινομενολογία', 'V.10', 'v.10')).toBe(1)
  })

  it('returns 0 for an empty query', () => {
    expect(sectionScore(title, code, '')).toBe(0)
  })
})

// Article (arthrografia) entries are journal citations - Greek quotes «…», a
// journal name + volume + year, and often mixed Greek/Latin author names.
describe('article-shaped entries', () => {
  const art = entryNorm(
    'Δραγώνα-Μονάχου, Μυρτώ: «Οι ηθικοί αφορισμοί του Wittgenstein». Φιλοσοφία 10-11 (1980-81), 433-481.',
    'Δραγώνα-Μονάχου, Μυρτώ',
  )

  it('finds a Greek author across accents', () => {
    expect(entryMatches(art, tokenize('δραγωνα'))).toBe(true)
    expect(entryMatches(art, tokenize('Δραγώνα-Μονάχου'))).toBe(true)
  })
  it('finds a Latin name and a journal title inside the citation', () => {
    expect(entryMatches(art, tokenize('wittgenstein'))).toBe(true)
    expect(entryMatches(art, tokenize('φιλοσοφια'))).toBe(true)
  })
  it('supports author + topic together (AND)', () => {
    expect(entryMatches(art, tokenize('μοναχου αφορισμοι'))).toBe(true)
    expect(entryMatches(art, tokenize('μοναχου πλατων'))).toBe(false)
  })
  it('highlights a term inside the «…» quotes', () => {
    const text = '«Οι ηθικοί αφορισμοί του Wittgenstein»'
    const [[s, e]] = highlightRanges(text, tokenize('αφορισμοι'))
    expect(text.slice(s, e)).toBe('αφορισμοί')
  })
})

describe('highlightRanges', () => {
  it('returns [start, end) ranges over the ORIGINAL (accented) text', () => {
    const text = 'Ιστορία της ινδικής φιλοσοφίας'
    const ranges = highlightRanges(text, tokenize('ινδικης'))
    expect(ranges).toHaveLength(1)
    const [s, e] = ranges[0]
    expect(text.slice(s, e)).toBe('ινδικής') // matched the accented original
  })

  it('finds an accented occurrence from an unaccented token', () => {
    const text = 'Μαρτίνος Χάιντεγκερ'
    const [[s, e]] = highlightRanges(text, tokenize('χαιντεγκερ'))
    expect(text.slice(s, e)).toBe('Χάιντεγκερ')
  })

  it('merges overlapping / adjacent matches', () => {
    const text = 'φιλοσοφία φιλοσοφία'
    // two tokens whose matches touch/overlap should not produce nested ranges
    const ranges = highlightRanges(text, ['φιλο', 'φιλοσοφια'])
    for (let i = 1; i < ranges.length; i++) {
      expect(ranges[i][0]).toBeGreaterThan(ranges[i - 1][1])
    }
  })

  it('returns all occurrences of a token', () => {
    const ranges = highlightRanges('Πλάτων και Πλάτων', tokenize('πλατων'))
    expect(ranges).toHaveLength(2)
  })

  it('returns [] when there is no match or no tokens', () => {
    expect(highlightRanges('Πλάτων', tokenize('αριστοτελης'))).toEqual([])
    expect(highlightRanges('Πλάτων', [])).toEqual([])
    expect(highlightRanges('', tokenize('πλατων'))).toEqual([])
  })
})
