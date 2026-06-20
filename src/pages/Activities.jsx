import { Globe, ExternalLink, Landmark, Mic } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'

const sectionIcons = {
  websites: Globe,
  other: Landmark,
  lectures: Mic,
}

function prettyUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]
}

export default function Activities() {
  const { t } = useLang()
  const a = t.activities

  return (
    <article className="page">
      <PageHeader kicker={t.nav.activities} title={a.title} lead={a.lead} />

      <section className="section">
        <div className="container narrow">
          {a.sections.map((section) => {
            const SectionIcon = sectionIcons[section.id] || Landmark
            return (
              <div key={section.id} className="activity-section">
                <Reveal className="activity-section__head">
                  <span className="activity-section__letter">{section.letter}</span>
                  <span className="activity-section__icon" aria-hidden="true">
                    <SectionIcon size={20} strokeWidth={1.6} />
                  </span>
                  <h2 className="activity-section__title">{section.heading}</h2>
                </Reveal>

                <ol className="activity-list">
                  {section.items.map((item, i) => (
                    <Reveal as="li" key={i} delay={i * 40} className="activity-item">
                      <span className="activity-item__num">{i + 1}</span>
                      <div className="activity-item__body">
                        <p className="activity-item__text">{item.text}</p>
                        {item.url && (
                          <a
                            href={item.url}
                            className="activity-item__link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink size={14} />
                            {prettyUrl(item.url)}
                          </a>
                        )}
                      </div>
                    </Reveal>
                  ))}
                </ol>
              </div>
            )
          })}

          <Reveal className="activity-source">
            <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-arrow">
              {a.sourceLabel} <ExternalLink size={16} />
            </a>
          </Reveal>
        </div>
      </section>
    </article>
  )
}
