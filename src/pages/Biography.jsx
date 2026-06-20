import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import Portrait from '../components/Portrait.jsx'

export default function Biography() {
  const { t, lang } = useLang()
  const bio = t.biography
  const youngCaption = lang === 'el' ? 'Τα πρώτα χρόνια' : 'The early years'

  return (
    <article className="page">
      <PageHeader kicker={t.meta.role} title={bio.title} lead={bio.lead} />

      <section className="section">
        <div className="container bio__grid">
          <div className="bio__prose">
            {bio.paragraphs.map((p, i) => (
              <Reveal as="p" key={i} delay={i * 60} className="prose-p">
                {p}
              </Reveal>
            ))}

            <Reveal className="bio__influences">
              <h3 className="bio__influences-title">{bio.influencesTitle}</h3>
              <ul className="chips">
                {bio.influences.map((name) => (
                  <li key={name} className="chip">{name}</li>
                ))}
              </ul>
            </Reveal>
          </div>

          <aside className="bio__aside">
            <Portrait caption={t.meta.name} />
            <div className="bio__photo-young">
              <Portrait src="/images/Giannis-Tzavaras.jpg" caption={youngCaption} />
            </div>
          </aside>
        </div>
      </section>

      <section className="section section--tinted">
        <div className="container">
          <Reveal className="section__head">
            <h2 className="section__title">{bio.timelineTitle}</h2>
          </Reveal>

          <ol className="timeline">
            {bio.timeline.map((item, i) => (
              <Reveal as="li" key={i} delay={i * 70} className="timeline__item">
                <div className="timeline__dot" aria-hidden="true" />
                <div className="timeline__content">
                  <span className="timeline__year">{item.year}</span>
                  <h3 className="timeline__title">{item.title}</h3>
                  <p className="timeline__text">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal className="bio__chrono-cta">
            <Link to="/chronology" className="btn btn--primary">
              {t.nav.chronology}
              <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </article>
  )
}
