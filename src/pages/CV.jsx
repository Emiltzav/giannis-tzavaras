import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'

export default function CV() {
  const { t } = useLang()
  const cv = t.cv
  const pub = cv.publications

  return (
    <article className="page">
      <PageHeader kicker={t.nav.biography} title={cv.title} lead={cv.lead} />

      <section className="section">
        <div className="container narrow">
          <Reveal className="cv-intro">
            <figure className="cv-photo">
              <img src={cv.photo.src} alt={cv.photo.caption} loading="lazy" />
              <figcaption>{cv.photo.caption}</figcaption>
            </figure>

            <div className="cv-details">
              <h2 className="cv-details__heading">{cv.detailsHeading}</h2>
              <dl className="cv-details__list">
                {cv.details.map((row) => (
                  <div key={row.label} className="cv-details__row">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          {cv.sections.map((section) => (
            <div key={section.heading} className="cv-block">
              <Reveal as="h2" className="cv-block__heading">
                {section.heading}
              </Reveal>
              <dl className="cv-entries">
                {section.entries.map((entry, i) => (
                  <Reveal as="div" key={i} delay={i * 40} className="cv-entry">
                    <dt className="cv-entry__label">{entry.label}</dt>
                    <dd className="cv-entry__text">{entry.text}</dd>
                  </Reveal>
                ))}
              </dl>
            </div>
          ))}

          <div className="cv-block">
            <Reveal as="h2" className="cv-block__heading">
              {pub.heading}
            </Reveal>

            <Reveal as="h3" className="cv-pub__subheading">
              {pub.booksHeading}
            </Reveal>
            <ol className="cv-pub__list">
              {pub.books.map((book, i) => (
                <Reveal as="li" key={i} delay={i * 25} className="cv-pub__item">
                  {book}
                </Reveal>
              ))}
            </ol>

            {pub.groups.map((group) => (
              <Reveal key={group.label} className="cv-pub__group">
                <h3 className="cv-pub__subheading">{group.label}</h3>
                <p className="cv-pub__text">{group.text}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="cv-footer">
            <Link to="/biography" className="link-arrow link-arrow--back">
              <ArrowLeft size={16} /> {cv.backLink}
            </Link>
            <a href={cv.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-arrow">
              {cv.sourceLabel} <ExternalLink size={16} />
            </a>
          </Reveal>
        </div>
      </section>
    </article>
  )
}
