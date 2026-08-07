import { describe, it, expect } from 'vitest'
import { italicSpans } from './bibliographyItalic.js'

// Helper: return the italicised substrings for a citation.
const italics = (text) => italicSpans(text).map(([s, e]) => text.slice(s, e))

describe('italicSpans - books', () => {
  it('italicises the book title after an "Author:" prefix', () => {
    expect(italics('Σου Τσι: Γιόγκα Ταό. Μετάφρ. Γιάννης Χαραλαμπίδης. "Θυμάρι", Αθ. 1984.'))
      .toEqual(['Γιόγκα Ταό'])
  })

  it('italicises the leading title when there is no author', () => {
    expect(italics('Βέδες. Μετάφρ.-Επιμ. Γεώργιος Ζωγραφάκης. «Δωδώνη», Αθ. 1978.'))
      .toEqual(['Βέδες'])
  })

  it('stops the title at the first period (subtitle stays roman)', () => {
    expect(italics('Βελισσαρόπουλος, Δημήτρης Κ.: Ιστορία της ινδικής φιλοσοφίας. Από την βεδική ως την σύγχρονη εποχή. "Δωδώνη", Αθ. 1981.'))
      .toEqual(['Ιστορία της ινδικής φιλοσοφίας'])
  })

  it('does not split an author name on initials ("Gandhi, M. K.:")', () => {
    expect(italics('Gandhi, M. K.: Οι αξίες του Μαχάτμα Γκάντι μέσα από τα κείμενά του. Ανθολόγηση-Μετάφρ. Δημήτριος Βασιλειάδης. «Εταιρεία», Αθ. 2011.'))
      .toEqual(['Οι αξίες του Μαχάτμα Γκάντι μέσα από τα κείμενά του'])
  })

  it('italicises each work title in a multi-work α)/β) entry', () => {
    const t = 'Παντουβάς, Θεόδωρος: α) Ερμηνευτικό λεξικό της Ινδικής φιλοσοφίας και του Γιόγκα. "Καρδαμίτσα", Αθ. 1989. β) Μπάγκαβατ Γκίτα. Το τραγούδι του Κρίσνα. Μετάφρ. Θ. Παντουβάς. «Καρδαμίτσα», Αθ. 1991 (1979¹).'
    expect(italics(t)).toEqual(['Ερμηνευτικό λεξικό της Ινδικής φιλοσοφίας και του Γιόγκα', 'Μπάγκαβατ Γκίτα'])
  })
})

describe('italicSpans - articles', () => {
  it('keeps the «quoted» article title roman and italicises the journal', () => {
    expect(italics('Αλατζόγλου-Θέμελη, Γραμματική: «Γνωσιολογικές απόψεις των Σοφιστών». Φιλοσοφία 10-11 (1980-81), 241-262.'))
      .toEqual(['Φιλοσοφία'])
  })

  it('italicises each journal in a multi-article α)/β)/γ) entry', () => {
    const t = 'Αλτουσέρ, Λουί [= Althusser, Louis]: α) «Πάνω στην υλιστική διαλεκτική». Εισαγωγικό σημείωμα και μετάφρ. Η. Π. Νικολούδης. Signum 12-13 (1980), 1-2 + 27-32. β) «Η τεράστια θεωρητική επανάσταση του Μαρξ». Μετάφρ. Άγγελος Ελεφάντης. Ο πολίτης 35 (1980), 39-47. γ) «Για τον Ζακ Μονό». Μετάφρ. Βασίλης Καψαμπέλης - Λενιώ Λαζαράτου - Αντώνης Μοσχοβάκης. Σύγχρονα θέματα 7 (1980), 112-122.'
    expect(italics(t)).toEqual(['Signum', 'Ο πολίτης', 'Σύγχρονα θέματα'])
  })

  it('italicises a multi-word journal name', () => {
    expect(italics('Αξελός, Κώστας: «Το μέλλον της τεχνικής». Μετάφρ. Δημήτρης Δούκαρης. Τομές 66 (1980), 5.'))
      .toEqual(['Τομές'])
  })
})

describe('italicSpans - robustness', () => {
  it('returns [] for empty input', () => {
    expect(italicSpans('')).toEqual([])
    expect(italicSpans(null)).toEqual([])
  })

  it('produces non-overlapping, in-order ranges', () => {
    const t = 'Παντουβάς, Θεόδωρος: α) Α. "Χ", Αθ. 1989. β) Β. «Ψ», Αθ. 1991.'
    const spans = italicSpans(t)
    for (let i = 1; i < spans.length; i++) expect(spans[i][0]).toBeGreaterThanOrEqual(spans[i - 1][1])
  })
})
