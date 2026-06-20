import { useState } from 'react'
import { Info } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import booksData from '../data/books.json'
import translationsData from '../data/translations.json'

export default function Books({ initialTab = 'books' }) {
  const { t } = useLang()
  const b = t.books
  const [tab, setTab] = useState(initialTab === 'translations' ? 'translations' : 'books')

  const isBooks = tab === 'books'
  const items = isBooks ? booksData.books : translationsData.translations
  const lead = isBooks ? b.lead : b.translationsLead
  const note = isBooks ? b.note : b.translationsNote
  const countLabel = isBooks ? b.countLabel : b.translationsCountLabel

  return (
    <article className="page">
      <PageHeader kicker={t.nav.books} title={b.title} lead={lead} />

      <section className="section">
        <div className="container">
          <div className="filter-bar" role="tablist" aria-label={b.title}>
            <button
              type="button"
              role="tab"
              aria-selected={isBooks}
              className={`filter-chip ${isBooks ? 'is-active' : ''}`}
              onClick={() => setTab('books')}
            >
              {b.tabBooks} <span className="filter-chip__n">{booksData.books.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isBooks}
              className={`filter-chip ${!isBooks ? 'is-active' : ''}`}
              onClick={() => setTab('translations')}
            >
              {b.tabTranslations} <span className="filter-chip__n">{translationsData.translations.length}</span>
            </button>
          </div>

          <div className="books__bar">
            <span className="books__count">
              <strong>{items.length}</strong> {countLabel}
            </span>
            <span className="books__note">
              <Info size={15} aria-hidden="true" />
              {note}
            </span>
          </div>

          <div className="books__grid">
            {items.map((item, i) => (
              <Reveal key={`${tab}-${item.title}-${i}`} delay={i * 35}>
                <article className="card book-card">
                  <div className="book-card__spine" aria-hidden="true">
                    <span>{item.year}</span>
                  </div>
                  <div className="book-card__body">
                    {item.author && <p className="book-card__author">{item.author}</p>}
                    <h2 className="book-card__title">{item.title}</h2>
                    {item.subtitle && <p className="book-card__subtitle">{item.subtitle}</p>}
                    {item.note && <p className="book-card__note">{item.note}</p>}
                    <p className="book-card__meta">
                      <span className="book-card__publisher">{item.publisher}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.year}</span>
                      {item.pages && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{item.pages} {b.pagesLabel}</span>
                        </>
                      )}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </article>
  )
}
