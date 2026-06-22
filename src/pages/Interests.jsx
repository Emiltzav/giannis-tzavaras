import { useLang } from '../i18n/LanguageContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'

export default function Interests() {
  const { t } = useLang()
  const data = t.interests

  return (
    <article className="page">
      <PageHeader kicker={t.nav.interests} title={data.title} lead={data.lead} />

      <section className="section">
        <div className="container narrow">
          <Reveal className="interests-photos">
            {data.photos.map((photo, i) => (
              <figure key={i} className="interests-photo">
                <img src={photo.src} alt={photo.caption} loading="lazy" />
                <figcaption>{photo.caption}</figcaption>
              </figure>
            ))}
          </Reveal>

          {data.sections.map((section) => (
            <div key={section.letter} className="activity-section">
              <Reveal className="activity-section__head">
                <span className="activity-section__letter">{section.letter}</span>
                <h2 className="activity-section__title">{section.heading}</h2>
              </Reveal>

              {section.groups.map((group, gi) => (
                <div key={gi} className="interests-group">
                  <p className="interests-group__label">{group.label}</p>
                  <ol className="activity-list">
                    {group.items.map((item, i) => (
                      <Reveal as="li" key={i} delay={i * 40} className="activity-item">
                        <span className="activity-item__num">{i + 1}</span>
                        <div className="activity-item__body">
                          <p className="activity-item__text">{item}</p>
                        </div>
                      </Reveal>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}
