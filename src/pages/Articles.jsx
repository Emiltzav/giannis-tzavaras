import { FileText } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import RichText from '../components/RichText.jsx'

export default function Articles() {
  const { t } = useLang()
  const articles = t.articles

  return (
    <article className="page">
      <PageHeader kicker={t.nav.articles} title={articles.title} lead={articles.lead} />

      <section className="section">
        <div className="container">
          <ul className="article-list">
            {articles.items.map((item, i) => (
              <Reveal as="li" key={i} delay={i * 60} className="article-item">
                <span className="article-item__year">{item.year}</span>
                <span className="article-item__icon" aria-hidden="true">
                  <FileText size={18} strokeWidth={1.6} />
                </span>
                <div className="article-item__body">
                  <h2 className="article-item__title">{item.title}</h2>
                  <p className="article-item__journal"><RichText text={item.source} /></p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </article>
  )
}
