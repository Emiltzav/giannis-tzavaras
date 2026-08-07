import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Search, X, CornerDownLeft, Loader2, ChevronLeft, BookOpen, Newspaper } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import taxonomy from '../data/bibliography.json'
import {
  normalize,
  tokenize,
  entryNorm,
  entryMatches,
  topCodeOf,
  sectionScore,
  highlightRanges,
} from '../lib/bibliographySearch.js'
import { italicSpans } from '../lib/bibliographyItalic.js'

// Real entries are generated from the owner's .doc archives by
// scripts/gen_bibliography.mjs and lazy-loaded (dynamic import) per division, so
// the ~9 MB of data stays out of the main bundle and only downloads on demand.
const LOADERS = {
  books: [
    () => import('../data/bibliography/books/1980-1989.json'),
    () => import('../data/bibliography/books/1990-1999.json'),
    () => import('../data/bibliography/books/2000-2009.json'),
    () => import('../data/bibliography/books/2010-2019a.json'),
    () => import('../data/bibliography/books/2010-2019b.json'),
  ],
  articles: [
    () => import('../data/bibliography/articles/1980-1989.json'),
    () => import('../data/bibliography/articles/1990-1999.json'),
    () => import('../data/bibliography/articles/2000-2009.json'),
    () => import('../data/bibliography/articles/2010-2019.json'),
  ],
}

const PERIODS = {
  books: [
    { id: '1980-1989', label: '1980-1989' },
    { id: '1990-1999', label: '1990-1999' },
    { id: '2000-2009', label: '2000-2009' },
    { id: '2010-2019a', label: '2010-2019 (I)' },
    { id: '2010-2019b', label: '2010-2019 (II)' },
  ],
  articles: [
    { id: '1980-1989', label: '1980-1989' },
    { id: '1990-1999', label: '1990-1999' },
    { id: '2000-2009', label: '2000-2009' },
    { id: '2010-2019', label: '2010-2019' },
  ],
}

const RESULT_CAP = 300

// Render a citation with book/journal titles in <em> italics (via italicSpans)
// and search matches wrapped in <mark> - both range sets applied together by
// slicing the string at every range boundary and wrapping each slice as needed.
function renderCitation(text, tokens) {
  const italic = italicSpans(text)
  const hi = highlightRanges(text, tokens)
  if (!italic.length && !hi.length) return text

  const bounds = new Set([0, text.length])
  for (const [s, e] of italic) { bounds.add(s); bounds.add(e) }
  for (const [s, e] of hi) { bounds.add(s); bounds.add(e) }
  const pts = [...bounds].sort((a, b) => a - b)
  const covered = (ranges, s, e) => ranges.some(([a, b]) => a <= s && e <= b)

  const out = []
  for (let i = 0; i < pts.length - 1; i++) {
    const s = pts[i]
    const e = pts[i + 1]
    if (s === e) continue
    let node = text.slice(s, e)
    if (covered(hi, s, e)) node = <mark className="biblio-hl">{node}</mark>
    if (covered(italic, s, e)) node = <em>{node}</em>
    out.push(<Fragment key={s}>{node}</Fragment>)
  }
  return out
}

// Flatten the philosophical taxonomy → ordered leaf sections + code lookups (books).
function useSections(lang) {
  return useMemo(() => {
    const list = []
    const topOf = {}
    const titleOf = {}
    const walk = (nodes, topCode) => {
      for (const n of nodes) {
        const title = n.title[lang] || n.title.el
        titleOf[n.code] = title
        topOf[n.code] = topCode
        if (n.children) walk(n.children, topCode)
        else list.push({ code: n.code, title, topCode })
      }
    }
    for (const top of taxonomy.categories) walk([top], top.code)
    return { list, topOf, titleOf }
  }, [lang])
}

export default function Bibliography() {
  const { t, lang } = useLang()
  const ui = t.bibliography
  const inputRef = useRef(null)

  const [division, setDivision] = useState('books')
  const [dataByDiv, setDataByDiv] = useState({ books: null, articles: null })
  const loadingRef = useRef({})
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [section, setSection] = useState('all') // 'all' | top/leaf code (books) | year (articles)
  const [period, setPeriod] = useState('all')
  const [open, setOpen] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)

  const isBooks = division === 'books'
  const sections = useSections(lang)
  const tops = isBooks ? taxonomy.categories.map((c) => ({ code: c.code, title: c.title[lang] || c.title.el })) : []
  const topCodes = new Set(tops.map((c) => c.code))

  const entries = dataByDiv[division]

  // Lazy-load + normalise the active division's entries once.
  useEffect(() => {
    if (dataByDiv[division] || loadingRef.current[division]) return
    loadingRef.current[division] = true
    Promise.all(LOADERS[division].map((load) => load())).then((mods) => {
      const all = []
      for (const m of mods) {
        const d = m.default
        for (const e of d.entries) {
          all.push({ ...e, period: d.id, periodLabel: d.label, norm: entryNorm(e.text, e.author) })
        }
      }
      setDataByDiv((prev) => ({ ...prev, [division]: all }))
    })
  }, [division, dataByDiv])

  // Debounce the query so filtering tens of thousands of entries stays smooth.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 140)
    return () => clearTimeout(id)
  }, [query])

  const counts = useMemo(() => {
    const c = {}
    if (entries) for (const e of entries) c[e.sectionCode] = (c[e.sectionCode] || 0) + 1
    return c
  }, [entries])

  const nq = normalize(debounced)
  const tokens = tokenize(debounced)

  const inSection = (e) => {
    if (section === 'all') return true
    if (isBooks && topCodes.has(section)) return topCodeOf(e.sectionCode) === section
    return e.sectionCode === section
  }

  const filtered = useMemo(() => {
    if (!entries) return []
    return entries.filter((e) => {
      if (period !== 'all' && e.period !== period) return false
      if (!inSection(e)) return false
      if (tokens.length) return entryMatches(e.norm, tokens)
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, period, section, nq, division])

  // "Jump to section" suggestions - books only (philosophical sections).
  const suggestions = useMemo(() => {
    if (!isBooks || !nq) return []
    return sections.list
      .map((s) => ({ ...s, score: sectionScore(s.title, s.code, debounced), n: counts[s.code] || 0 }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBooks, sections, counts, nq])

  // Article browse: year cards grouped by decade (period).
  const yearGroups = useMemo(() => {
    if (isBooks || !entries) return []
    const byPeriod = {}
    for (const e of entries) {
      ;(byPeriod[e.period] ||= {})[e.sectionCode] = (byPeriod[e.period]?.[e.sectionCode] || 0) + 1
    }
    return PERIODS.articles
      .map((p) => ({
        key: p.id,
        title: p.label,
        cards: Object.keys(byPeriod[p.id] || {})
          .sort()
          .map((y) => ({ code: y, title: y, n: byPeriod[p.id][y] })),
      }))
      .filter((g) => g.cards.length)
  }, [isBooks, entries])

  const showDropdown = open && suggestions.length > 0
  const browseMode = !nq && section === 'all'
  const shown = filtered.slice(0, RESULT_CAP)
  const periods = PERIODS[division]

  const pickSection = (code) => {
    setSection(code)
    setQuery('')
    setOpen(false)
    setHighlightIdx(-1)
    inputRef.current?.blur()
  }

  const resetAll = () => {
    setSection('all')
    setPeriod('all')
    setQuery('')
  }

  const switchDivision = (d) => {
    if (d === division) return
    setDivision(d)
    resetAll()
    setOpen(false)
  }

  const onKeyDown = (e) => {
    if (!showDropdown) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx((h) => (h + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx((h) => (h - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault()
      pickSection(suggestions[highlightIdx].code)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setHighlightIdx(-1)
    }
  }

  const sectionTitle = (code) => (isBooks ? sections.titleOf[code] || code : code)

  return (
    <article className="page bibliography">
      <PageHeader kicker={t.nav.bibliography} title={ui.title} lead={ui.lead} />

      <section className="section">
        <div className="container narrow">
          {/* ── Division toggle: Books ⇄ Articles ─────────────── */}
          <div className="biblio-tabs" role="tablist" aria-label={ui.collectionLabel}>
            <button type="button" role="tab" aria-selected={isBooks} className={`biblio-tab ${isBooks ? 'is-active' : ''}`} onClick={() => switchDivision('books')}>
              <BookOpen size={17} aria-hidden="true" /> {ui.booksTab}
            </button>
            <button type="button" role="tab" aria-selected={!isBooks} className={`biblio-tab ${!isBooks ? 'is-active' : ''}`} onClick={() => switchDivision('articles')}>
              <Newspaper size={17} aria-hidden="true" /> {ui.articlesTab}
            </button>
          </div>

          {/* ── Search bar (with book section-jump autocomplete) ─ */}
          <Reveal className="biblio-search">
            <div className={`biblio-search__field ${showDropdown ? 'is-open' : ''}`}>
              <Search size={20} className="biblio-search__icon" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                className="biblio-search__input"
                placeholder={ui.searchPlaceholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setOpen(true)
                  setHighlightIdx(-1)
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 120)}
                onKeyDown={onKeyDown}
                aria-label={ui.searchPlaceholder}
                autoComplete="off"
              />
              {query && (
                <button type="button" className="biblio-search__clear" onClick={() => { setQuery(''); inputRef.current?.focus() }} aria-label={ui.clear}>
                  <X size={18} />
                </button>
              )}

              {showDropdown && (
                <ul className="biblio-suggest" role="listbox">
                  <li className="biblio-suggest__hint">{ui.jumpHint}</li>
                  {suggestions.map((s, i) => (
                    <li
                      key={s.code}
                      role="option"
                      aria-selected={i === highlightIdx}
                      className={`biblio-suggest__item ${i === highlightIdx ? 'is-active' : ''}`}
                      onMouseDown={(e) => { e.preventDefault(); pickSection(s.code) }}
                      onMouseEnter={() => setHighlightIdx(i)}
                    >
                      <span className="biblio-suggest__code">{s.code}</span>
                      <span className="biblio-suggest__text">{s.title}</span>
                      <span className="biblio-suggest__n">{s.n}</span>
                      {i === highlightIdx && <CornerDownLeft size={15} className="biblio-suggest__enter" aria-hidden="true" />}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>

          {/* ── Category filter chips (books only) ────────────── */}
          {isBooks && (
            <div className="biblio-filters" role="group" aria-label={ui.categoryLabel}>
              <button type="button" className={`biblio-chip ${section === 'all' ? 'is-active' : ''}`} onClick={() => setSection('all')}>
                {ui.allCategories}
              </button>
              {tops.map((top) => (
                <button
                  key={top.code}
                  type="button"
                  className={`biblio-chip ${section === top.code || sections.topOf[section] === top.code ? 'is-active' : ''}`}
                  onClick={() => setSection(top.code)}
                >
                  <span className="biblio-chip__code">{top.code}</span>
                  {top.title}
                </button>
              ))}
            </div>
          )}

          {/* ── Period filter chips ───────────────────────────── */}
          <div className="biblio-filters biblio-filters--period" role="group" aria-label={ui.periodLabel}>
            <span className="biblio-filters__label">{ui.periodLabel}:</span>
            <button type="button" className={`biblio-chip biblio-chip--sm ${period === 'all' ? 'is-active' : ''}`} onClick={() => setPeriod('all')}>
              {ui.allPeriods}
            </button>
            {periods.map((p) => (
              <button key={p.id} type="button" className={`biblio-chip biblio-chip--sm ${period === p.id ? 'is-active' : ''}`} onClick={() => setPeriod(p.id)}>
                {p.label}
              </button>
            ))}
          </div>

          {/* ── Loading ───────────────────────────────────────── */}
          {!entries ? (
            <div className="biblio-loading">
              <Loader2 size={22} className="biblio-spin" aria-hidden="true" />
              <span>{ui.loading}</span>
            </div>
          ) : browseMode ? (
            /* ── Browse view ─────────────────────────────────── */
            <div className="biblio-browse">
              <h2 className="biblio-browse__heading">{isBooks ? ui.browseHeading : ui.browseByYear}</h2>
              <p className="biblio-browse__hint">{ui.browseHint}</p>

              {isBooks
                ? tops.map((top) => (
                    <div key={top.code} className="biblio-browse__group">
                      <h3 className="biblio-browse__top"><span className="biblio-chip__code">{top.code}</span> {top.title}</h3>
                      <div className="biblio-browse__cards">
                        {sections.list.filter((s) => s.topCode === top.code && (counts[s.code] || 0) > 0).map((s) => (
                          <button key={s.code} type="button" className="biblio-browse__card" onClick={() => pickSection(s.code)}>
                            <span className="biblio-browse__card-code">{s.code}</span>
                            <span className="biblio-browse__card-title">{s.title}</span>
                            <span className="biblio-browse__card-n">{counts[s.code]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                : yearGroups.map((g) => (
                    <div key={g.key} className="biblio-browse__group">
                      <h3 className="biblio-browse__top">{g.title}</h3>
                      <div className="biblio-browse__cards biblio-browse__cards--years">
                        {g.cards.map((c) => (
                          <button key={c.code} type="button" className="biblio-browse__card biblio-browse__card--year" onClick={() => pickSection(c.code)}>
                            <span className="biblio-browse__card-title">{c.title}</span>
                            <span className="biblio-browse__card-n">{c.n}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
            </div>
          ) : (
            /* ── Results ─────────────────────────────────────── */
            <div className="biblio-results">
              <div className="biblio-results__bar">
                <button type="button" className="biblio-back" onClick={resetAll}>
                  <ChevronLeft size={16} /> {isBooks ? ui.backToBrowse : ui.backToYears}
                </button>
                <p className="biblio-results__count">
                  {filtered.length.toLocaleString(lang)} {filtered.length === 1 ? ui.entryOne : ui.entryMany}
                  {section !== 'all' && !topCodes.has(section) && (
                    <span className="biblio-results__section"> · {isBooks ? `${section} ${sectionTitle(section)}` : section}</span>
                  )}
                </p>
              </div>

              {filtered.length === 0 ? (
                <p className="biblio-empty">{ui.noResults}</p>
              ) : (
                <>
                  <ul className="biblio-list">
                    {shown.map((e) => (
                      <li key={e.id} className="biblio-entry">
                        <div className="biblio-entry__head">
                          <span className="biblio-entry__code" title={sectionTitle(e.sectionCode)}>{e.sectionCode}</span>
                          {isBooks && e.year && <span className="biblio-entry__year">{e.year}</span>}
                        </div>
                        <p className="biblio-entry__text">{renderCitation(e.text, tokens)}</p>
                      </li>
                    ))}
                  </ul>
                  {filtered.length > RESULT_CAP && (
                    <p className="biblio-more">
                      {ui.showingOf.replace('{shown}', RESULT_CAP.toLocaleString(lang)).replace('{total}', filtered.length.toLocaleString(lang))}
                      {' · '}{ui.refine}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </article>
  )
}
