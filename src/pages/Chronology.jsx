import { Info, Award } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import chronology from '../data/chronology.json'

export default function Chronology() {
  const { t, lang } = useLang()
  const c = t.chronology

  return (
    <article className="page">
      <PageHeader kicker={t.meta.role} title={c.title} lead={c.lead} />

      <section className="section">
        <div className="container narrow">
          <Reveal className="chrono-note">
            <Info size={16} aria-hidden="true" />
            <p>{c.note}</p>
          </Reveal>

          <ol className="chrono">
            {chronology.entries.map((entry) => (
              <li key={entry.year} className="chrono__entry">
                <Reveal className="chrono__year-wrap">
                  <span className="chrono__year">{entry.year}</span>
                  <span className="chrono__rail" aria-hidden="true" />
                </Reveal>

                <ul className="chrono__items">
                  {entry.items.map((item, i) => {
                    const isMilestone = typeof item === 'object' && item.milestone
                    const text = typeof item === 'string' ? item : item[lang] || item.el
                    return (
                      <Reveal
                        as="li"
                        key={i}
                        delay={i * 30}
                        className={`chrono__item ${isMilestone ? 'chrono__item--milestone' : ''}`}
                      >
                        {isMilestone ? (
                          <span className="chrono__badge">
                            <Award size={14} aria-hidden="true" />
                            {c.milestoneLabel}
                          </span>
                        ) : (
                          <span className="chrono__bullet" aria-hidden="true" />
                        )}
                        <span className="chrono__text">{text}</span>
                      </Reveal>
                    )
                  })}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </article>
  )
}
