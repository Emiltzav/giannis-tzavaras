import { describe, it, expect } from 'vitest'
import { dewrap, isYearHeading, isJunk, extractAuthorYear } from './bibliographyParse.js'

describe('dewrap', () => {
  it('joins indented continuation lines and collapses justification spaces', () => {
    const lines = [
      'Αλατζόγλου-Θέμελη,  Γραμματική: «Γνωσιολογικές   απόψεις».',
      '    Φιλοσοφία 10-11 (1980-81), 241-262.',
    ]
    expect(dewrap(lines)).toEqual([
      'Αλατζόγλου-Θέμελη, Γραμματική: «Γνωσιολογικές απόψεις». Φιλοσοφία 10-11 (1980-81), 241-262.',
    ])
  })

  it('breaks paragraphs on blank lines and column-0 starts', () => {
    const lines = ['Πρώτη εγγραφή.', '', 'Δεύτερη εγγραφή.']
    expect(dewrap(lines)).toEqual(['Πρώτη εγγραφή.', 'Δεύτερη εγγραφή.'])
  })

  it('treats a bullet as a new paragraph and strips the bullet', () => {
    const lines = ['1980', '    • Αφιέρωμα στον Τσάτσο. «Σάκκουλα»,', '      Αθ. 1980.']
    expect(dewrap(lines)).toEqual(['1980', 'Αφιέρωμα στον Τσάτσο. «Σάκκουλα», Αθ. 1980.'])
  })

  it('honours a start index', () => {
    expect(dewrap(['skip me', 'keep me'], 1)).toEqual(['keep me'])
  })
})

describe('isYearHeading', () => {
  it('accepts a lone 4-digit year', () => {
    expect(isYearHeading('1980')).toBe(true)
    expect(isYearHeading('2019')).toBe(true)
  })
  it('rejects non-year paragraphs', () => {
    expect(isYearHeading('1980, 1981, 1982')).toBe(false)
    expect(isYearHeading('Πλάτων')).toBe(false)
    expect(isYearHeading('185')).toBe(false)
    expect(isYearHeading('1980.')).toBe(false)
  })
})

describe('isJunk', () => {
  it('drops navigation, TOC, legend and index lines', () => {
    expect(isJunk('Α')).toBe(true)
    expect(isJunk('[pic]')).toBe(true)
    expect(isJunk('Δες επίσης V.21. Πολιτική φιλοσοφία.')).toBe(true)
    expect(isJunk('(Για να μεταβείτε, πλησιάστε τον κέρσορα και πατήστε CTRL+ κλικ)')).toBe(true)
    expect(isJunk('ΠΙΝΑΚΑΣ ΠΕΡΙΕΧΟΜΕΝΩΝ')).toBe(true)
    expect(isJunk('Συντομογραφίες: Αθ. = Αθήνα. Μετάφρ. = Μετάφραση.')).toBe(true)
    expect(isJunk('Περιλαμβάνονται τα εξής έτη:')).toBe(true)
    expect(isJunk('Τελευταία ενημέρωση: Ιανουάριος του 2020')).toBe(true)
    expect(isJunk('A B C D E F G H I J K L M N')).toBe(true)
  })

  it('keeps a normal bibliographic entry', () => {
    expect(isJunk('Κονδύλης, Παναγιώτης: Ο Μαρξ και η αρχαία Ελλάδα. «Στιγμή», Αθ. 1984.')).toBe(false)
  })

  // Regression: a bare "κλικ" used to match the substring inside «Κυκλικά».
  it('does NOT drop a real entry whose title contains «Κυκλικά» (κλικ substring)', () => {
    expect(isJunk('Σοφιανός, Κώστας: «Κυκλικά νοήματα». Κριτική και κείμενα 3 (1985), 254-262.')).toBe(false)
  })

  // Regression: a "two or more ' = '" rule used to drop transliteration lists.
  it('does NOT drop a philosopher/transliteration list with several "=" signs', () => {
    expect(
      isJunk('Αρχαίοι Κινέζοι φιλόσοφοι: Confucius (= Κομφούκιος, 551-479 π.Χ.), Lao Tzu (= Λάο Τσε, 6ος αι. π.Χ.)'),
    ).toBe(false)
    expect(isJunk('Eagleton, Terry (= Ήγκλετον, Τέρι): Ο Μαρξισμός. «Ύψιλον», Αθ. 1981.')).toBe(false)
  })
})

describe('extractAuthorYear', () => {
  it('extracts the author before the first colon and the earliest year', () => {
    expect(
      extractAuthorYear('Κονδύλης, Παναγιώτης: Ο Μαρξ και η αρχαία Ελλάδα. «Στιγμή», Αθ. 1984.'),
    ).toEqual({ author: 'Κονδύλης, Παναγιώτης', year: 1984 })
  })

  it('lets a forced (article heading) year override the in-text year', () => {
    const r = extractAuthorYear('Δούκαρης, Δημήτρης: «Στον τάφο του Σαρτρ». Τομές 61 (1981), 4-6.', 1980)
    expect(r.year).toBe(1980)
    expect(r.author).toBe('Δούκαρης, Δημήτρης')
  })

  it('returns a null author when there is no early colon', () => {
    expect(extractAuthorYear('Βέδες. Μετάφρ.-Επιμ. Γεώργιος Ζωγραφάκης. «Δωδώνη», Αθ. 1978.').author).toBe(null)
  })

  it('has no year when the text contains none', () => {
    expect(extractAuthorYear('Πλάτων: Λάχης, Ευθύφρων, Λύσις.').year).toBe(null)
  })
})
