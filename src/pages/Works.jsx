import { useLang } from '../i18n/LanguageContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'

export default function Works() {
  const { t } = useLang()
  const works = t.works

  return (
    <article className="page">
      <PageHeader kicker={t.nav.works} title={works.title} lead={works.lead} />

      <section className="section">
        <div className="container works__grid">
          {works.areas.map((area, i) => (
            <Reveal key={i} delay={i * 80} className="work-area">
              <span className="work-area__index">{String(i + 1).padStart(2, '0')}</span>
              <div className="work-area__body">
                <h2 className="work-area__title">{area.title}</h2>
                <p className="work-area__text">{area.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </article>
  )
}
