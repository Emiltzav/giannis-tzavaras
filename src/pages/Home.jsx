import { Link } from 'react-router-dom'
import { ArrowRight, Quote, ArrowUpRight, Library, Search } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'
import Icon from '../components/Icon.jsx'
import Portrait from '../components/Portrait.jsx'
import { formatDate } from '../utils/format.js'

export default function Home() {
  const { t, lang } = useLang()
  const posts = t.blog.posts.slice(0, 3)

  return (
    <div className="home">
      {/* ── Hero ───────────────────────────── */}
      <section className="hero">
        <div className="hero__bg" aria-hidden="true" />
        <div className="container hero__inner">
          <div className="hero__text">
            <p className="hero__kicker">
              <span className="hero__kicker-line" />
              {t.home.heroKicker}
            </p>
            <h1 className="hero__title">{t.home.heroTitle}</h1>
            <p className="hero__subtitle">{t.home.heroSubtitle}</p>

            <div className="hero__cta">
              <Link to="/works" className="btn btn--primary">
                {t.home.ctaExplore}
                <ArrowRight size={18} />
              </Link>
              <Link to="/blog" className="btn btn--ghost">
                {t.home.ctaBlog}
              </Link>
            </div>

            <blockquote className="hero__quote">
              <Quote size={22} className="hero__quote-icon" aria-hidden="true" />
              <p>{t.home.heroQuote}</p>
              <cite>- {t.home.heroQuoteAuthor}</cite>
            </blockquote>
          </div>

          <div className="hero__portrait">
            <Portrait />
            <div className="hero__portrait-caption">
              <span>{t.meta.role}</span>
              <span>{t.meta.place}</span>
            </div>
          </div>
        </div>
        <div className="hero__meander" aria-hidden="true" />
      </section>

      {/* ── Intro ──────────────────────────── */}
      <section className="section intro">
        <div className="container intro__grid">
          <Reveal className="intro__heading">
            <span className="eyebrow">{t.ui.introduction}</span>
            <h2 className="section__title">{t.home.introTitle}</h2>
          </Reveal>
          <div className="intro__body">
            {t.home.introParagraphs.map((p, i) => (
              <Reveal as="p" key={i} delay={i * 90} className="intro__paragraph">
                {p}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bibliography spotlight ─────────── */}
      <section className="biblio-spotlight">
        <div className="biblio-spotlight__meander" aria-hidden="true" />
        <div className="container biblio-spotlight__inner">
          <Reveal className="biblio-spotlight__content">
            <span className="biblio-spotlight__badge">
              <Library size={16} aria-hidden="true" />
              {t.home.biblio.eyebrow}
            </span>
            <h2 className="biblio-spotlight__title">{t.home.biblio.title}</h2>
            <p className="biblio-spotlight__text">{t.home.biblio.text}</p>

            <ul className="biblio-spotlight__stats">
              {t.home.biblio.stats.map((s, i) => (
                <li key={i} className="biblio-spotlight__stat">
                  <span className="biblio-spotlight__stat-value">{s.value}</span>
                  <span className="biblio-spotlight__stat-label">{s.label}</span>
                </li>
              ))}
            </ul>

            <Link to="/bibliography" className="btn btn--gold biblio-spotlight__cta">
              <Search size={18} />
              {t.home.biblio.cta}
              <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Highlights ─────────────────────── */}
      <section className="section section--tinted highlights">
        <div className="container">
          <Reveal className="section__head">
            <h2 className="section__title">{t.home.highlightsTitle}</h2>
          </Reveal>
          <div className="highlights__grid">
            {t.home.highlights.map((h, i) => (
              <Reveal key={i} delay={i * 80} className="card highlight">
                <span className="highlight__icon">
                  <Icon name={h.icon} size={26} strokeWidth={1.5} />
                </span>
                <h3 className="highlight__title">{h.title}</h3>
                <p className="highlight__text">{h.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured quote ─────────────────── */}
      <section className="featured-quote">
        <div className="container featured-quote__inner">
          <Quote size={40} className="featured-quote__mark" aria-hidden="true" />
          <Reveal as="blockquote">
            <p className="featured-quote__text">{t.home.featuredQuote}</p>
            <cite className="featured-quote__source">{t.home.featuredQuoteSource}</cite>
          </Reveal>
        </div>
      </section>

      {/* ── Blog teaser ────────────────────── */}
      <section className="section blog-teaser">
        <div className="container">
          <div className="section__head section__head--row">
            <div>
              <span className="eyebrow">{t.nav.blog}</span>
              <h2 className="section__title">{t.blog.title}</h2>
            </div>
            <Link to="/blog" className="link-arrow">
              {t.ui.viewAll} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="blog-teaser__grid">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={i * 80}>
                <Link to={`/blog/${post.id}`} className="card post-card">
                  <time className="post-card__date">{formatDate(post.date, lang)}</time>
                  <h3 className="post-card__title">{post.title}</h3>
                  <p className="post-card__excerpt">{post.excerpt}</p>
                  <span className="post-card__more">
                    {t.ui.readMore} <ArrowUpRight size={16} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
